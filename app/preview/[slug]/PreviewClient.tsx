"use client";

import { notFound } from "next/navigation";
import { getTemplateComponent } from "@/data/templates";

// 🧩 Data dummy untuk preview template
const dummyData = {
  slug: "preview",
  mempelai: {
    pria: "Ahmad Fauzan",
    wanita: "Nadia Putri",
    foto_pria: "/images/dummy/foto_pria.jpg",
    foto_wanita: "/images/dummy/foto_wanita.jpg",
    orangtua_pria: "Putra dari Bapak Rahman & Ibu Siti",
    orangtua_wanita: "Putri dari Bapak Hasan & Ibu Nuraini",
  },
  acara_utama: {
    nama: "Akad Nikah & Resepsi",
    tanggal: new Date().toISOString(),
    waktu: "10.00 - 12.00 WIB",
    lokasi: "Gedung Graha Cinta Abadi",
    alamat: "Jl. Mawar No. 10, Jakarta Selatan",
  },
  acara: [
    {
      nama: "Akad Nikah",
      tanggal: new Date().toISOString(),
      waktu: "09.00 WIB",
      lokasi: "Masjid Al-Falah, Jakarta",
      alamat: "Jl. Melati Raya No. 5, Jakarta Selatan",
    },
    {
      nama: "Resepsi",
      tanggal: new Date().toISOString(),
      waktu: "11.00 WIB",
      lokasi: "Gedung Graha Cinta Abadi",
      alamat: "Jl. Mawar No. 10, Jakarta Selatan",
    },
  ],
  cerita: [
    {
      judul: "Pertemuan Pertama",
      deskripsi:
        "Kami pertama kali bertemu di kampus dan mulai mengenal satu sama lain sejak saat itu.",
      foto: "/images/dummy/story1.jpg",
    },
    {
      judul: "Lamaran",
      deskripsi:
        "Setelah beberapa tahun bersama, kami memutuskan untuk melangkah ke jenjang yang lebih serius.",
      foto: "/images/dummy/story2.jpg",
    },
  ],
  gallery: [
    "/images/dummy/gallery1.jpg",
    "/images/dummy/gallery2.jpg",
    "/images/dummy/gallery3.jpg",
  ],
  musik: {
    judul: "Perfect",
    penyanyi: "Ed Sheeran",
    url: "/music/sample.mp3",
  },
  tamu: [],
  ucapan: [],
  theme: "light",
};

// =============================
// 🚀 Komponen Client untuk Preview Template
// =============================
export default function PreviewClient({ slug }: { slug: string }) {
  const TemplateComponent = getTemplateComponent(slug);

  if (!TemplateComponent) notFound();

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* ✅ Watermark preview */}
      <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded text-xs font-semibold z-50">
        Preview Template: {slug}
      </div>

      {/* ✅ Template render */}
      <TemplateComponent data={dummyData} previewMode />
    </div>
  );
}
