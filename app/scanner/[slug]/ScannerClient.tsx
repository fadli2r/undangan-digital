// components/scanner/ScannerClient.tsx
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

type Props = { slug: string };

type DetectedInfo = {
  raw: string;
  guestName?: string;
  slug?: string;
};

function parseQR(raw: string, fallbackSlug: string): DetectedInfo {
  // Coba parse sebagai URL
  try {
    const url = new URL(raw);
    // Contoh: https://dreamslink.id/jejenikah?tamu=Budi%20Santoso
    const path = url.pathname.replace(/^\/+/, '');
    const seg = path.split('/').filter(Boolean);
    // Banyak pola: /undangan/<slug> atau /<slug>
    const slugFromUrl = seg.length >= 2 && seg[0] === 'undangan' ? seg[1] : seg[0] || fallbackSlug;
    const guest = url.searchParams.get('tamu') || undefined;

    return {
      raw,
      guestName: guest ? guest.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : undefined,
      slug: slugFromUrl || fallbackSlug,
    };
  } catch {
    // Bukan URL → coba pola sederhana: slug=<...>&tamu=<...>
    const mSlug = raw.match(/(?:^|[?&#])slug=([a-z0-9-]+)/i);
    const mGuest = raw.match(/(?:^|[?&#])(tamu|guest|name)=([^&#]+)/i);
    const slug = mSlug?.[1]?.toLowerCase() || fallbackSlug;
    const guest = mGuest?.[2]
      ? decodeURIComponent(mGuest[2]).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : undefined;

    return { raw, guestName: guest, slug };
  }
}

export default function ScannerClient({ slug }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [detected, setDetected] = useState<DetectedInfo | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState<string>('');

  // List camera devices
  const enumerateCameras = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all.filter((d) => d.kind === 'videoinput');
      setDevices(cams);
      if (!deviceId && cams.length) setDeviceId(cams[cams.length - 1].deviceId); // pilih belakang jika ada
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca perangkat kamera');
    }
  }, [deviceId]);

  // Start camera stream
  const startStream = useCallback(async () => {
    setError('');
    setDetected(null);
    setCheckinMsg('');
    try {
      // Stop stream sebelumnya
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setActive(true);
      scanLoop();
    } catch (e: any) {
      setError(e?.message || 'Tidak bisa mengakses kamera');
      setActive(false);
    }
  }, [deviceId]);

  const stopStream = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setActive(false);
  }, []);

  // Deteksi QR dengan BarcodeDetector (fallback: manual input)
  const scanLoop = useCallback(async () => {
    if (!videoRef.current) return;
    if (!('BarcodeDetector' in window)) {
      setError('Browser tidak mendukung BarcodeDetector. Silakan masukkan kode secara manual.');
      stopStream();
      return;
    }

    // @ts-ignore
    const detector = new (window as any).BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39'] });

    const tick = async () => {
      if (!videoRef.current || !active) return;
      try {
        const v = videoRef.current;
        const c = canvasRef.current;
        if (v.readyState >= 2 && c) {
          // Gambar frame ke canvas agar ukuran konsisten
          const w = v.videoWidth;
          const h = v.videoHeight;
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(v, 0, 0, w, h);
            const barcodeList = await detector.detect(c);
            if (barcodeList && barcodeList.length) {
              const raw = barcodeList[0].rawValue || '';
              const info = parseQR(raw, slug);
              setDetected(info);
              stopStream();
              return; // berhenti loop setelah detect
            }
          }
        }
      } catch (e) {
        // continue silently
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [active, slug, stopStream]);

  useEffect(() => {
    enumerateCameras();
    return () => {
      stopStream();
    };
  }, [enumerateCameras, stopStream]);

  const onSelectDevice = async (id: string) => {
    setDeviceId(id);
    if (active) {
      await startStream();
    }
  };

  const onRescan = async () => {
    setDetected(null);
    setCheckinMsg('');
    await startStream();
  };

  const onCheckIn = async () => {
    if (!detected) return;
    const useSlug = detected.slug || slug;
    const guest = detected.guestName || '';

    if (!useSlug) {
      setCheckinMsg('Slug tidak ditemukan dari QR.');
      return;
    }
    if (!guest) {
      setCheckinMsg('Nama tamu tidak ditemukan di QR. Isi manual di bawah.');
      return;
    }

    setCheckingIn(true);
    setCheckinMsg('');
    try {
      const res = await fetch('/api/invitation/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: useSlug, guestName: guest, raw: detected.raw }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCheckinMsg(data.message || 'Check-in berhasil.');
      } else {
        setCheckinMsg(data.message || 'Check-in gagal.');
      }
    } catch {
      setCheckinMsg('Check-in gagal (network).');
    } finally {
      setCheckingIn(false);
    }
  };

  // Manual submit jika QR tidak berisi nama tamu
  const [manualGuest, setManualGuest] = useState('');
  const onManualCheckIn = async () => {
    const useSlug = detected?.slug || slug;
    if (!useSlug) {
      setCheckinMsg('Slug tidak valid.');
      return;
    }
    if (!manualGuest.trim()) {
      setCheckinMsg('Isi nama tamu terlebih dahulu.');
      return;
    }
    setCheckingIn(true);
    setCheckinMsg('');
    try {
      const res = await fetch('/api/invitation/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: useSlug, guestName: manualGuest.trim(), raw: detected?.raw || '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCheckinMsg(data.message || 'Check-in berhasil.');
      } else {
        setCheckinMsg(data.message || 'Check-in gagal.');
      }
    } catch {
      setCheckinMsg('Check-in gagal (network).');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="container-xxl py-10">
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h3 className="fw-bold">QR Scanner — Undangan: <span className="text-primary">{slug}</span></h3>
          </div>
          <div className="card-toolbar">
            {!active ? (
              <button className="btn btn-primary" onClick={startStream}>
                <i className="ki-duotone ki-play fs-3 me-2"><span className="path1" /><span className="path2" /></i>
                Mulai Kamera
              </button>
            ) : (
              <button className="btn btn-light-danger" onClick={stopStream}>
                <i className="ki-duotone ki-square fs-3 me-2"><span className="path1" /><span className="path2" /></i>
                Stop
              </button>
            )}
          </div>
        </div>

        <div className="card-body">
          {/* Camera select */}
          <div className="row g-5 mb-5">
            <div className="col-md-6">
              <label className="form-label">Pilih Kamera</label>
              <select
                className="form-select"
                value={deviceId || ''}
                onChange={(e) => onSelectDevice(e.target.value)}
              >
                {devices.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Kamera ${idx + 1}`}
                  </option>
                ))}
              </select>
              <div className="form-text">Pilih kamera belakang jika tersedia.</div>
            </div>
          </div>

          {/* Video preview */}
          <div className="row">
            <div className="col-lg-8">
              <div className="ratio ratio-16x9 rounded bg-dark">
                <video ref={videoRef} className="w-100 h-100 rounded" playsInline muted />
              </div>
              <canvas ref={canvasRef} className="d-none" />
              {error && <div className="alert alert-danger mt-4">{error}</div>}
            </div>

            <div className="col-lg-4">
              <div className="border rounded p-4 bg-light">
                <h5 className="fw-bold mb-3">Hasil Deteksi</h5>
                {!detected && <div className="text-muted">Arahkan kamera ke QR code undangan...</div>}
                {!!detected && (
                  <>
                    <div className="mb-2"><span className="fw-semibold">Raw:</span> <span className="text-gray-700">{detected.raw}</span></div>
                    <div className="mb-2"><span className="fw-semibold">Slug:</span> <span className="text-gray-700">{detected.slug || slug}</span></div>
                    <div className="mb-4"><span className="fw-semibold">Nama Tamu:</span> <span className="text-gray-700">{detected.guestName || '(tidak ada di QR)'}</span></div>

                    <div className="d-flex gap-2">
                      <button className="btn btn-primary" onClick={onCheckIn} disabled={checkingIn || !detected.guestName}>
                        {checkingIn ? (
                          <span className="spinner-border spinner-border-sm me-2" />
                        ) : (
                          <i className="ki-duotone ki-check fs-3 me-2"><span className="path1" /><span className="path2" /></i>
                        )}
                        Check-in
                      </button>
                      <button className="btn btn-light" onClick={onRescan}>
                        <i className="ki-duotone ki-restart fs-3 me-2"><span className="path1" /><span className="path2" /></i>
                        Scan Ulang
                      </button>
                    </div>

                    {/* Manual name if QR tidak bawa nama */}
                    {!detected.guestName && (
                      <div className="mt-4">
                        <label className="form-label">Nama Tamu (manual)</label>
                        <input
                          className="form-control"
                          value={manualGuest}
                          onChange={(e) => setManualGuest(e.target.value)}
                          placeholder="Tulis nama tamu..."
                        />
                        <button className="btn btn-success mt-3" onClick={onManualCheckIn} disabled={checkingIn || !manualGuest.trim()}>
                          {checkingIn ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="ki-duotone ki-check fs-3 me-2"><span className="path1" /><span className="path2" /></i>}
                          Check-in Manual
                        </button>
                      </div>
                    )}
                  </>
                )}

                {checkinMsg && <div className="alert alert-info mt-4">{checkinMsg}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tip support */}
      {!('BarcodeDetector' in window) && (
        <div className="alert alert-warning mt-6">
          Browser ini tidak mendukung pemindaian QR bawaan. Silakan gunakan Chrome/Edge terbaru, atau input manual.
        </div>
      )}
    </div>
  );
}
