// components/TwoColumnLayout.js
import React from 'react'

export default function TwoColumnLayout({ 
  leftBackgroundUrl, 
  leftTitle, 
  children /* isi konten untuk kolom kanan */ 
}) {
  return (
    <div className="flex h-screen">
      {/* ───────────────────────────────────────────────
          KOLOM KIRI (Desktop: 61%, Mobile:hidden)
          • background full-cover + judul (nama mempelai)
      ─────────────────────────────────────────────── */}
      <div
        className="
          hidden                /* sembunyi di < md */
          md:block              /* tampil di ≥ md */
          md:w-[61%]            /* 61% lebar */
          bg-cover bg-center    /* gambar cover + center */
          relative
        "
        style={{ backgroundImage: `url('${leftBackgroundUrl}')` }}
      >
        {/* optional: overlay gelap biar teks kontras */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Judul di tengah */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-6xl font-playfair text-white">
            {leftTitle}
          </h1>
        </div>
      </div>

      {/* ───────────────────────────────────────────────
          KOLOM KANAN (Desktop: 39%, Mobile: 100%)
          • scrollable jika konten tinggi
      ─────────────────────────────────────────────── */}
      <div className="w-full md:w-[39%] h-screen overflow-y-auto bg-white">
        {children}
      </div>
    </div>
  )
}
