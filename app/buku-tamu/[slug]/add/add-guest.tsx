"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import styles from "./add-guest.module.css";
import PageWrapper from "../componnents/layouts/PageWrapper";
import BottomNav from "../componnents/BottomNav";
import {
  IoHomeOutline,
  IoPersonOutline,
  IoChatbubbleOutline,
  IoCameraOutline,
  IoSettingsOutline,
} from "react-icons/io5";

export default function AddGuestForm({ slug }: { slug: string }) {
  const [nama, setNama] = useState("");
  const [kontak, setKontak] = useState(""); // ✅ nomor telepon
  const [jumlah, setJumlah] = useState(1);
  const [manualNote, setManualNote] = useState(""); // ✅ catatan opsional
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState("/default-cover.jpg");

  const webcamRef = useRef<Webcam>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  // ✅ Ambil cover image undangan
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await fetch(`/api/invitation/detail?slug=${slug}`);
        const json = await res.json();
        if (json?.undangan?.main_photo) {
          setCoverImage(json.undangan.main_photo);
        }
      } catch (err) {
        console.error("Gagal fetch undangan:", err);
      }
    };
    fetchInvitation();
  }, [slug]);

  // ✅ Capture foto dari webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setPhoto(imageSrc);
  }, []);

  // ✅ Convert base64 ke File
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

// ✅ Submit data
const handleSubmit = async () => {
  if (!nama.trim() || !kontak.trim() || jumlah < 1 || !photo) {
    alert("Isi nama, nomor telepon, jumlah & foto dengan benar!");
    return;
  }

  setLoading(true);
  try {
    const file = base64ToFile(photo, `photo-${nama}-${Date.now()}.jpg`);

    const formData = new FormData();
    formData.append("slug", slug);
    formData.append("guest", nama.trim());
    formData.append("kontak", kontak.trim());
    formData.append("jumlah", jumlah.toString());
    formData.append("photo", file);

    if (manualNote.trim()) {
      formData.append("manual_note", manualNote.trim());
    }

    // ✅ Tambahkan penanda bahwa ini manual
    formData.append("invited", "false");

    const res = await fetch("/api/invitation/add-manual", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Gagal simpan data");

    alert(`✅ Kehadiran ${nama} berhasil dicatat`);
    // reset form
    setNama("");
    setKontak("");
    setJumlah(1);
    setManualNote("");
    setPhoto(null);
  } catch (err: any) {
    console.error(err);
    alert(`❌ Error input manual: ${err.message}`);
  } finally {
    setLoading(false);
  }
};


  return (
    
    <div
      className={styles.heroSection}
      style={{ backgroundImage: `url(${coverImage})` }}
    >
      <div className={styles.overlay} />

      <div className={styles.formWrapper}>
        <h1 className="text-xl font-semibold text-white mb-4">
          Input Manual RSVP
        </h1>

        <input
          className={styles.input}
          placeholder="Nama Tamu"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />

        <input
          type="tel"
          className={styles.input}
          placeholder="Nomor Telepon"
          value={kontak}
          onChange={(e) => setKontak(e.target.value)}
        />

        <input
          type="number"
          className={styles.input}
          value={jumlah}
          min={1}
          onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value || "1")))}
        />

        <textarea
          className={styles.input}
          placeholder="Catatan (opsional)"
          value={manualNote}
          onChange={(e) => setManualNote(e.target.value)}
        />

        {/* Webcam */}
        <div className="space-y-2">
          {photo ? (
            <div className="space-y-2">
              <img
                src={photo}
                alt="Captured"
                className="w-full rounded-lg border"
              />
              <button
                type="button"
                className="text-sm text-indigo-300 hover:underline"
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
                type="button"
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg w-full"
                onClick={capture}
              >
                📸 Ambil Foto
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !photo}
          className={`${styles.button} ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {loading ? "Menyimpan..." : "Simpan Kehadiran"}
        </button>
      </div>

      <BottomNav slug={slug} />
    </div>
  );
}
