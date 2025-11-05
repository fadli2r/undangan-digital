"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

export type ConfirmModalProps = {
  pendingGuest: string;
  jumlahHadir: number;
  setJumlahHadir: (value: number) => void;
  onCancel: () => void;
  onSubmit: (photoFile: File) => void; // ✅ Foto dikirim sebagai File
};

export default function ConfirmModal({
  pendingGuest,
  jumlahHadir,
  setJumlahHadir,
  onCancel,
  onSubmit,
}: ConfirmModalProps) {
  const webcamRef = useRef<Webcam>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  // Ambil gambar dari webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
    }
  }, []);

  // Konversi base64 ke File dan kirim
  const handleSubmit = () => {
    if (!photo) return;

    const file = base64ToFile(photo, `photo-${pendingGuest}-${Date.now()}.jpg`);
    onSubmit(file);
  };

  // Fungsi bantu: base64 ➜ File
  const base64ToFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);

    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="md:max-w-md md:w-full bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Konfirmasi Kehadiran</h4>
          </div>

          <div className="px-5 py-4 space-y-5">
            {/* Info Tamu */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Tamu: <span className="font-semibold">{pendingGuest}</span>
              </p>
            </div>

            {/* Input jumlah hadir */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Jumlah hadir</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 grid place-items-center"
                  onClick={() => setJumlahHadir(Math.max(1, jumlahHadir - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={jumlahHadir}
                  onChange={(e) => {
                    const val = parseInt(e.target.value || "1", 10);
                    setJumlahHadir(Math.max(1, Math.min(10, val)));
                  }}
                  className="w-20 text-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2"
                />
                <button
                  type="button"
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 grid place-items-center"
                  onClick={() => setJumlahHadir(Math.min(10, jumlahHadir + 1))}
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Sesuaikan sesuai jumlah di pintu masuk.</p>
            </div>

            {/* Ambil Foto Tamu */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Ambil Foto Tamu</label>
              {photo ? (
                <div className="space-y-2">
                  <img src={photo} alt="Captured" className="w-full rounded-lg border" />
                  <button
                    className="text-sm text-indigo-600 hover:underline"
                    onClick={() => setPhoto(null)}
                  >
                    Ulangi Foto
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-lg border"
                  />
                  <button
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg w-full"
                    onClick={capture}
                  >
                    📸 Ambil Foto
                  </button>
                </div>
              )}
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!photo}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                Simpan Kehadiran
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
