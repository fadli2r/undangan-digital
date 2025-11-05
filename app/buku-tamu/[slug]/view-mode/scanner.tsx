"use client";

import { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeCameraScanConfig,
  Html5QrcodeResult,
} from "html5-qrcode";
import styles from "./scanner.module.css";

export type ScannerProps = {
  slug: string;
  onSuccess: (guestName: string) => void;
  onInvalid: (message: string) => void;
};

// ✅ Parsing QR
function parseQr(
  decodedText: string,
  expectedSlug: string
): { ok: true; guest: string } | { ok: false; error: string } {
  try {
    let guest = "";
    let qrSlug = "";
    try {
      const obj = JSON.parse(decodedText);
      qrSlug = String(obj.slug || "");
      guest = String(obj.guest || obj.tamu || "");
    } catch {
      const url = new URL(decodedText);
      qrSlug = url.pathname.replace(/^\/+/, "").split("/").pop() || "";
      guest =
        url.searchParams.get("guest") || url.searchParams.get("tamu") || "";
    }
    if (!qrSlug || qrSlug.toLowerCase() !== expectedSlug.toLowerCase())
      return { ok: false, error: "QR Code tidak cocok untuk undangan ini." };
    if (!guest) return { ok: false, error: "QR Code tidak memuat nama tamu." };
    return { ok: true, guest };
  } catch {
    return { ok: false, error: "Format QR Code tidak dikenali." };
  }
}

export default function Scanner({ slug, onSuccess, onInvalid }: ScannerProps) {
  const readerIdRef = useRef(
    `qr-reader-${Math.random().toString(36).substr(2, 9)}`
  );
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);

  // ✅ Kamera state
  const [cameras, setCameras] = useState<any[]>([]);
  const [cameraId, setCameraId] = useState<string | null>(null);

  // ✅ Ambil daftar kamera
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        setCameras(devices);
        if (devices.length > 0) {
          // default pakai kamera belakang kalau ada
          const backCam =
            devices.find((d) =>
              d.label.toLowerCase().includes("back")
            ) || devices[0];
          setCameraId(backCam.id);
        }
      })
      .catch((err) => {
        console.error("Tidak bisa ambil daftar kamera:", err);
      });
  }, []);

  // ✅ Mulai scanner
  useEffect(() => {
    const scannerId = readerIdRef.current;

    const initScanner = async () => {
      if (
        isStartingRef.current ||
        document.getElementById(scannerId) === null ||
        !cameraId
      ) {
        return;
      }
      isStartingRef.current = true;

      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(scannerId, { verbose: false });
        }
        const scanner = scannerRef.current;

        if (scanner.isScanning) {
          await scanner.stop();
        }

        const config: Html5QrcodeCameraScanConfig = { fps: 10 };

        const onScanSuccess = (decodedText: string, result: Html5QrcodeResult) => {
          if (scanner.isScanning) {
            scanner
              .stop()
              .then(() => {
                const parsed = parseQr(decodedText, slug);
                if (parsed.ok) onSuccess(parsed.guest);
                else onInvalid(parsed.error);
              })
              .catch((err) =>
                console.error("Gagal stop scanner setelah sukses:", err)
              );
          }
        };

// ✅ tambahkan qrCodeErrorCallback di sini
await scanner.start(
  { deviceId: { exact: cameraId } },
  config,
  onScanSuccess,
  () => {} // biarkan kosong atau log kecil
);      } catch (e: any) {
        let errorMessage = "Tidak bisa mengakses kamera. Mohon izinkan akses di browser.";
        if (e.name === "NotAllowedError") {
          errorMessage = "Akses kamera ditolak. Mohon izinkan di pengaturan browser.";
        }
        console.error("Gagal membuka kamera:", e);
        onInvalid(errorMessage);
      } finally {
        isStartingRef.current = false;
      }
    };

    const startTimeout = setTimeout(initScanner, 300);

    return () => {
      clearTimeout(startTimeout);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err) => {
          console.error("Gagal saat cleanup scanner:", err);
        });
      }
    };
  }, [slug, onSuccess, onInvalid, cameraId]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.scannerWrapper}>
        <div id={readerIdRef.current} />

        {/* --- Overlay QR --- */}
        <div className={styles.overlay}>
          <div className={styles.viewfinder}>
            <div className={`${styles.corner} ${styles.topLeft}`}></div>
            <div className={`${styles.corner} ${styles.topRight}`}></div>
            <div className={`${styles.corner} ${styles.bottomLeft}`}></div>
            <div className={`${styles.corner} ${styles.bottomRight}`}></div>
            <div className={styles.scanLine}></div>
          </div>
        </div>
      </div>

      {/* Tombol switch kamera */}
      {cameras.length > 1 && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700"
            onClick={() => {
              const idx = cameras.findIndex((c) => c.id === cameraId);
              const next = cameras[(idx + 1) % cameras.length];
              setCameraId(next.id);
            }}
          >
            🔄 Ganti Kamera
          </button>
        </div>
      )}
    </div>
  );
}
