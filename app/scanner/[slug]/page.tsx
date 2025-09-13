'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

type Guest = { name: string; timestamp: string };

export default function QRScannerPage() {
  const { slug } = useParams() as { slug: string };

  // UI states
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [scannedGuests, setScannedGuests] = useState<Guest[]>([]);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isStartingCam, setIsStartingCam] = useState(false);

  // Scanner refs
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = useMemo(() => 'qr-reader-' + Math.random().toString(36).slice(2), []);

  // Fetch awal daftar hadir
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/invitation/scanned-guests?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => setScannedGuests(Array.isArray(d?.guests) ? d.guests : []))
      .catch(() => {});
  }, [slug]);

  // Helpers: toast
  const showToast = (type: 'success' | 'error', message: string, duration = 2500) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  // Start/Stop scanner saat modal dibuka/ditutup
  useEffect(() => {
    if (!isScanOpen) {
      stopScanner();
      return;
    }
    // Modal dibuka => start camera
    startScanner();
    // cleanup saat unmount/close
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanOpen]);

  async function startScanner() {
    if (!slug) return;
    try {
      setIsStartingCam(true);
      // Pastikan element ada
      const container = document.getElementById(readerId);
      if (!container) return;

      // Hindari multiple instance
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerId);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 260 },
        (decodedText) => onScanSuccess(decodedText),
        // onFailure (abaikan error kecil)
        () => {}
      );
    } catch (e: any) {
      setError('Tidak bisa mengakses kamera. Cek izin kamera di browser.');
      showToast('error', 'Gagal membuka kamera');
      console.error(e);
    } finally {
      setIsStartingCam(false);
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
      }
    } catch {
      // ignore
    }
  }

  async function onScanSuccess(decodedText: string) {
    try {
      const qrData = JSON.parse(decodedText);
      if (qrData.slug !== slug) {
        showToast('error', 'QR Code bukan untuk undangan ini');
        return;
      }

      const already = scannedGuests.some(
        (g) => g.name.toLowerCase() === String(qrData.guest).toLowerCase()
      );
      if (already) {
        showToast('error', 'Tamu sudah melakukan presensi');
        return;
      }

      // Pause scanning sementara
      await stopScanner();

      const res = await fetch('/api/invitation/mark-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: qrData.slug,
          guest: qrData.guest,
          timestamp: new Date().toISOString(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        showToast('error', json?.message || 'Gagal mencatat kehadiran');
        // Resume kamera agar bisa scan ulang
        startScanner();
        return;
      }

      // Update UI
      setScannedGuests((prev) => [
        { name: qrData.guest, timestamp: new Date().toISOString() },
        ...prev,
      ]);

      // Notifikasi selamat datang
      showToast('success', `Selamat datang, ${qrData.guest}! 🎉`, 3000);

      // Tutup modal setelah scan sukses (opsional: auto-close)
      setIsScanOpen(false);

      // Jika mau lanjut scan tanpa menutup modal, komentari baris di atas
      // dan panggil startScanner() lagi setelah jeda singkat:
      // setTimeout(() => startScanner(), 1000);
    } catch (e) {
      console.error('QR parse error', e);
      showToast('error', 'Format QR tidak valid');
      // Resume kamera biar bisa coba lagi
      startScanner();
    }
  }

  // UI
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="max-w-4xl mx-auto px-6 pt-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Scanner QR Code Tamu
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Undangan: <span className="font-semibold">{slug}</span>
          </p>
        </header>

        {/* Inline alert (opsional) */}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Card info + tombol mulai scan */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm ring-1 ring-gray-200/60 dark:ring-gray-800 p-5 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Mulai Pindai QR
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Tekan tombol <b>Scan</b> di bawah untuk membuka kamera.
              </p>
            </div>
            <button
              onClick={() => setIsScanOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 transition"
            >
              <CameraIcon />
              <span>Scan</span>
            </button>
          </div>
        </div>

        {/* Stats + list */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Daftar Kehadiran</h3>
          <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
            Total hadir: {scannedGuests.length}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm ring-1 ring-gray-200/60 dark:ring-gray-800 overflow-hidden">
          {scannedGuests.length === 0 ? (
            <p className="p-6 text-gray-500 dark:text-gray-400">Belum ada tamu yang hadir</p>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-100 dark:bg-gray-800/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Nama Tamu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    Waktu Hadir
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/80 dark:divide-gray-800">
                {scannedGuests.map((guest, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {guest.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(guest.timestamp).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/70">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-4 h-16">
            <NavItem label="Undangan" href={`/undangan/${slug}`} icon={<HomeIcon />} />
            <button
              onClick={() => setIsScanOpen(true)}
              className="flex flex-col items-center justify-center text-indigo-600"
            >
              <div className="w-12 h-12 -mt-6 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg ring-4 ring-indigo-200 dark:ring-indigo-800">
                <CameraIcon />
              </div>
              <span className="text-xs mt-1 font-medium">Scan</span>
            </button>
            <NavItem label="Kehadiran" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} icon={<UsersIcon />} />
            <NavItem label="Pengaturan" href="#" icon={<SettingsIcon />} />
          </div>
        </div>
      </nav>

      {/* Scan Modal */}
      {isScanOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsScanOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
            <div className="md:max-w-xl md:w-full bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isStartingCam ? 'Membuka kamera...' : 'Kamera aktif'}
                  </p>
                </div>
                <button
                  onClick={() => setIsScanOpen(false)}
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <CloseIcon />
                  <span>Tutup</span>
                </button>
              </div>

              <div className="p-4">
                {/* Reader container */}
                <div
                  id={readerId}
                  className="relative w-full h-[360px] rounded-xl bg-black overflow-hidden grid place-items-center"
                >
                  {/* Overlay frame */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-72 h-72 border-2 border-white/80 rounded-xl shadow-[0_0_0_200vmax_rgba(0,0,0,0.4)] outline outline-1 outline-white/10" />
                  </div>
                  {/* Helper text */}
                  <p className="text-white/80 text-sm">Arahkan kamera ke QR Code…</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={startScanner}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Mulai
                  </button>
                  <button
                    onClick={stopScanner}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                  >
                    Hentikan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-0 right-0 z-50">
          <div className="max-w-md mx-auto px-4">
            <div
              className={`rounded-xl px-4 py-3 shadow-lg text-sm font-medium ${
                toast.type === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI Subcomponents ---------------- */

function NavItem({
  label,
  href,
  icon,
  onClick,
}: {
  label: string;
  href?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const Comp = onClick ? 'button' : 'a';
  return (
    <Comp
      {...(href ? { href } : {})}
      onClick={onClick}
      className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-[11px] mt-1">{label}</span>
    </Comp>
  );
}

/* ---------------- Icons (inline SVG) ---------------- */
function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path
        d="M9 3h6l1 2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3l1-2Z"
        className="stroke-current"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="4" className="stroke-current" strokeWidth="1.5" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" className="stroke-current" strokeWidth="1.5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" className="stroke-current" strokeWidth="1.5" />
      <circle cx="9" cy="7" r="4" className="stroke-current" strokeWidth="1.5" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" className="stroke-current" strokeWidth="1.5" />
      <path d="M16 3.13A4 4 0 0 1 18 7" className="stroke-current" strokeWidth="1.5" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" className="stroke-current" strokeWidth="1.5" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82l.02.06a2 2 0 1 1-3.38 0l.02-.06A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15c0-.39-.14-.77-.4-1.07a1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 1 9a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 4.6 5c.39 0 .77-.14 1.07-.4.3-.26.5-.61.6-1a1.65 1.65 0 0 0-.33-1.82l-.02-.06a2 2 0 1 1 3.38 0l-.02.06c.19.36.49.66.84.84.29.17.61.26.94.26.39-.01.74-.21 1-.47.3-.26.5-.61.6-1a1.65 1.65 0 0 0-.33-1.82l.02-.06a2 2 0 1 1 3.38 0l.02.06c.19.36.49.66.84.84.29.17.61.26.94.26.39-.01.74-.21 1-.47.3-.26.5-.61.6-1" className="stroke-current" strokeWidth="1.5" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M6 6l12 12M6 18L18 6" className="stroke-current" strokeWidth="1.5" />
    </svg>
  );
}
