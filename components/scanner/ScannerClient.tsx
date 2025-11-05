'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

type Props = { slug: string };

type DetectedInfo = {
  raw: string;
  guestName?: string;
  slug?: string;
};

function parseQR(raw: string, fallbackSlug: string): DetectedInfo {
  try {
    const url = new URL(raw);
    const path = url.pathname.replace(/^\/+/, '');
    const seg = path.split('/').filter(Boolean);
    const slugFromUrl = seg.length >= 2 && seg[0] === 'undangan' ? seg[1] : seg[0] || fallbackSlug;
    const guest = url.searchParams.get('tamu') || undefined;

    return {
      raw,
      guestName: guest ? decodeURIComponent(guest) : undefined,
      slug: slugFromUrl || fallbackSlug,
    };
  } catch {
    return { raw, slug: fallbackSlug };
  }
}

export default function ScannerClient({ slug }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [detected, setDetected] = useState<DetectedInfo | null>(null);
  const [checkinMsg, setCheckinMsg] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [jumlah, setJumlah] = useState(1);

  // Start kamera otomatis
  useEffect(() => {
    startStream();
    return () => stopStream();
  }, []);

  const startStream = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      scanLoop();
    } catch (e) {
      console.error('Tidak bisa mengakses kamera', e);
    }
  }, []);

  const stopStream = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const scanLoop = useCallback(async () => {
    if (!('BarcodeDetector' in window)) {
      setCheckinMsg('Browser tidak mendukung BarcodeDetector.');
      return;
    }
    // @ts-ignore
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

    const tick = async () => {
      if (!videoRef.current) return;
      try {
        const v = videoRef.current;
        const c = canvasRef.current;
        if (v.readyState >= 2 && c) {
          const w = v.videoWidth;
          const h = v.videoHeight;
          c.width = w;
          c.height = h;
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(v, 0, 0, w, h);
            const codes = await detector.detect(c);
            if (codes.length) {
              const info = parseQR(codes[0].rawValue, slug);
              setDetected(info);
              setShowPopup(true);
              stopStream();
              return;
            }
          }
        }
      } catch {}
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [slug, stopStream]);

  const handleConfirmCheckin = async () => {
    if (!detected?.guestName) {
      setCheckinMsg('QR tidak berisi nama tamu.');
      return;
    }
    try {
      const res = await fetch('/api/invitation/mark-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: detected.slug || slug,
          guest: detected.guestName,
          jumlah,
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCheckinMsg(`✅ Selamat datang ${detected.guestName}, total ${jumlah} tamu dicatat.`);
      } else {
        setCheckinMsg(data.message || 'Gagal mencatat kehadiran');
      }
    } catch {
      setCheckinMsg('Network error saat check-in');
    } finally {
      setShowPopup(false);
      setTimeout(() => {
        setDetected(null);
        setJumlah(1);
        startStream();
      }, 1500);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Scanner Undangan: {slug}</h1>

      <div className="ratio ratio-16x9 bg-black rounded">
        <video ref={videoRef} className="w-full h-full" playsInline muted />
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {checkinMsg && <div className="mt-4 alert alert-info">{checkinMsg}</div>}

      {/* Popup input jumlah tamu */}
      {showPopup && detected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2">Konfirmasi Kehadiran</h2>
            <p className="mb-4">Nama: <b>{detected.guestName}</b></p>
            <label className="block mb-2">Jumlah Tamu Hadir</label>
            <input
              type="number"
              min={1}
              max={10}
              value={jumlah}
              onChange={(e) => setJumlah(parseInt(e.target.value) || 1)}
              className="border rounded px-3 py-2 w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button className="btn btn-light" onClick={() => setShowPopup(false)}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={handleConfirmCheckin}>
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
