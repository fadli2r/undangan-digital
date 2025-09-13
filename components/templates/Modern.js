// components/templates/Modern.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Ringan, boleh static import
import TwoColumnLayout from './TwoColumnLayout';
import PasswordProtection from '../PasswordProtection';
import CountdownTimer from './CountdownTimer';
import RSVPForm from './RSVPForm';
import WeddingWishes from './WeddingWishes';
import OurStory from './OurStory';
import AddToCalendar from './AddToCalendar';
import QRCodeGuest from './QRCodeGuest';

// Berat / browser-only → dynamic import (code-splitting)
const Gallery = dynamic(() => import('./Gallery'), {
  ssr: false,
  loading: () => <div className="w-full min-h-[200px]" />,
});
const LiveStreaming = dynamic(() => import('./LiveStreaming'), { ssr: false });
const Maps = dynamic(() => import('./Maps'), { ssr: false });
const MusicPlayer = dynamic(() => import('./MusicPlayer'), { ssr: false });

// util aman
const toDateSafe = (v) => {
  try { return v ? new Date(v) : null; } catch { return null; }
};
const fmtTanggalID = (date) => date?.toLocaleDateString?.('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function ModernTemplate({ data }) {
  // ===== Guard minimal =====
  const mempelai = data?.mempelai || {};
  const acaraUtama = data?.acara_utama || {};
  const acara = Array.isArray(data?.acara) ? data.acara : [];

  const [showHero, setShowHero] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!data?.privacy?.isPasswordProtected);

  // Background hero fallback
  const bgImageUrl = useMemo(() =>
    data?.hero?.background
    || data?.background_photo
    || (Array.isArray(data?.galeri) && data.galeri[0])
    || '/images/bg_couple.jpg'
  , [data]);

  // Password protection
  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onPasswordCorrect={() => setIsAuthenticated(true)}
        backgroundImage={mempelai?.foto_pria || bgImageUrl}
      />
    );
  }

  // Lock scroll hanya saat splash belum dibuka
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (!showHero) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showHero]);

  // ===== Splash / Opening Screen =====
  if (!showHero) {
    return (
      <section
        className="relative w-full h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-playfair text-white mb-6">The Wedding of</h1>
          <h2 className="text-5xl md:text-7xl font-playfair text-white mb-8">
            {mempelai?.pria} &amp; {mempelai?.wanita}
          </h2>
          <button onClick={() => setShowHero(true)} className="btn px-8 py-3">
            Buka Undangan
          </button>
        </div>
      </section>
    );
  }

  // ===== Setelah dibuka → Layout utama =====
  const leftTitle = `${mempelai?.pria || ''} & ${mempelai?.wanita || ''}`;
  const tanggalUtama = toDateSafe(acaraUtama?.tanggal);

  // Satu sumber QR code (pakai yang dikirim lewat data.components kalau ada; fallback ke QRCodeGuest lokal)
  const QRView = data?.components?.QRCode
    || (data?.slug && data?.tambahan?.guestName
        ? <QRCodeGuest slug={data.slug} guestName={data.tambahan.guestName} />
        : null);

  return (
    <TwoColumnLayout leftBackgroundUrl={bgImageUrl} leftTitle={leftTitle}>
      {/* Musik (optional) */}
      {data?.tambahan?.music?.url && <MusicPlayer src={data.tambahan.music.url} autoPlay />}

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <motion.section
        id="hero"
        className="relative w-full h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImageUrl})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.8 } }}
      >
        <div className="absolute inset-0 bg-black/25"></div>
        <div className="relative z-10 px-6 py-16 text-center">
          <h1 className="text-6xl font-playfair text-white">The Wedding of</h1>
          <h2 className="mt-4 text-6xl font-playfair text-white">
            {mempelai?.pria} &amp; {mempelai?.wanita}
          </h2>
          {tanggalUtama && (
            <p className="mt-6 text-xl text-white">{fmtTanggalID(tanggalUtama)}</p>
          )}

          <div className="mt-8">
            <h3 className="text-2xl text-white">Kepada Yth,</h3>
            {QRView}
          </div>

          {data?.tambahan?.qr_code_url && (
            <div className="mt-6 flex justify-center">
              <Image
                src={data.tambahan.qr_code_url}
                alt="QR Code Undangan"
                width={150}
                height={150}
                className="rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </motion.section>

      {/* ── Ayat / We Found Love ───────────────────────────────────────────── */}
      <motion.section
        className="py-16 flex flex-col items-center text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-playfair mb-8">We Found Love</h2>
          <p className="text-gray-600 italic mb-16">
            "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan‐pasangan untukmu …"
            <span className="block mt-2">(QS. Ar-Rum: 21)</span>
          </p>
        </div>
      </motion.section>

      {/* ── Mempelai ───────────────────────────────────────────────────────── */}
      <motion.section
        className="py-16 flex flex-col items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Wanita */}
          <motion.div className="text-center" initial="hidden" whileInView="visible"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            {mempelai?.foto_wanita && (
              <Image
                src={mempelai.foto_wanita}
                alt={mempelai?.wanita || 'Pengantin wanita'}
                width={256}
                height={256}
                className="w-64 h-64 object-cover rounded-full mx-auto mb-6"
              />
            )}
            <h3 className="text-3xl font-playfair mb-4">{mempelai?.wanita}</h3>
            {mempelai?.orangtua_wanita && (
              <>
                <p className="text-gray-600 mb-2">Putri Pertama Dari</p>
                <p className="mb-4">{mempelai.orangtua_wanita}</p>
              </>
            )}
            {data?.tambahan?.instagram_wanita && (
              <a href={data.tambahan.instagram_wanita} className="text-gray-600 hover:text-gray-800" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i> Instagram
              </a>
            )}
          </motion.div>

          {/* Pria */}
          <motion.div className="text-center" initial="hidden" whileInView="visible"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
            {mempelai?.foto_pria && (
              <Image
                src={mempelai.foto_pria}
                alt={mempelai?.pria || 'Pengantin pria'}
                width={256}
                height={256}
                className="w-64 h-64 object-cover rounded-full mx-auto mb-6"
              />
            )}
            <h3 className="text-3xl font-playfair mb-4">{mempelai?.pria}</h3>
            {mempelai?.orangtua_pria && (
              <>
                <p className="text-gray-600 mb-2">Putra Pertama Dari</p>
                <p className="mb-4">{mempelai.orangtua_pria}</p>
              </>
            )}
            {data?.tambahan?.instagram_pria && (
              <a href={data.tambahan.instagram_pria} className="text-gray-600 hover:text-gray-800" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i> Instagram
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Save The Date (Countdown + AddToCalendar) ─────────────────────── */}
      <motion.section
        className="py-16 flex flex-col items-center text-center"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-playfair mb-12">Save The Date</h2>
          {acaraUtama?.tanggal && (
            <div className="countdown-container">
              <CountdownTimer targetDate={acaraUtama.tanggal} />
            </div>
          )}
          {acara?.[0] && (
            <AddToCalendar
              event={{
                nama: acara[0].nama,
                tanggal: acara[0].tanggal,
                waktu: acara[0].waktu,
                lokasi: acara[0].lokasi,
                alamat: acara[0].alamat,
              }}
            />
          )}
        </div>
      </motion.section>

      {/* ── Events (Akad & Resepsi) ───────────────────────────────────────── */}
      <motion.section
        className="py-16 flex flex-col items-center"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          {acara?.[0] && (
            <motion.div className="text-center" initial="hidden" whileInView="visible"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} viewport={{ once: true }}
              transition={{ duration: 0.5 }}>
              <h3 className="text-3xl font-playfair mb-6">{acara[0].nama}</h3>
              <p className="text-xl mb-4">{fmtTanggalID(toDateSafe(acara[0].tanggal))}</p>
              <p className="mb-6">{acara[0].waktu}</p>
              <p className="text-gray-600 mb-4">{acara[0].lokasi}</p>
              <p className="mb-6">{acara[0].alamat}</p>
              {acara[0].maps_link && (
                <a href={acara[0].maps_link} className="btn" target="_blank" rel="noopener noreferrer">Google Maps</a>
              )}
            </motion.div>
          )}
          {acara?.[1] && (
            <motion.div className="text-center" initial="hidden" whileInView="visible"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}>
              <h3 className="text-3xl font-playfair mb-6">{acara[1].nama}</h3>
              <p className="text-xl mb-4">{fmtTanggalID(toDateSafe(acara[1].tanggal))}</p>
              <p className="mb-6">{acara[1].waktu}</p>
              <p className="text-gray-600 mb-4">{acara[1].lokasi}</p>
              <p className="mb-6">{acara[1].alamat}</p>
              {acara[1].maps_link && (
                <a href={acara[1].maps_link} className="btn" target="_blank" rel="noopener noreferrer">Google Maps</a>
              )}
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* ── Love Story ─────────────────────────────────────────────────────── */}
      {!!data?.our_story && (
        <motion.section className="py-16 flex flex-col items-center text-center"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <OurStory data={data.our_story} />
        </motion.section>
      )}

      {/* ── Gallery ────────────────────────────────────────────────────────── */}
      {Array.isArray(data?.galeri) && data.galeri.length > 0 && (
        <motion.section className="py-16 flex flex-col items-center text-center"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <div className="w-full max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-playfair mb-8">Wedding Gallery</h2>
            <Gallery images={data.galeri} />
          </div>
        </motion.section>
      )}

      {/* ── Live Streaming ─────────────────────────────────────────────────── */}
      {!!data?.tambahan?.live_streaming && (
        <motion.section className="py-16 bg-gray-50"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <LiveStreaming data={data.tambahan.live_streaming} />
        </motion.section>
      )}

      {/* ── Wedding Wishes ─────────────────────────────────────────────────── */}
      {!data?.privacy?.hideGuestbook && (
        <motion.section className="py-16 flex flex-col items-center text-center bg-gray-50"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <div className="w-full max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-playfair mb-8">Ucapan & Harapan</h2>
            <p className="text-gray-600 mb-12">Berikan ucapan dan harapan terbaik Anda untuk kedua mempelai</p>
            <WeddingWishes slug={data.slug} />
          </div>
        </motion.section>
      )}

      {/* ── RSVP ───────────────────────────────────────────────────────────── */}
      {!data?.privacy?.hideRSVP && (
        <motion.section className="py-16 flex flex-col items-center text-center"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <div className="w-full max-w-2xl mx-auto px-4">
            <h2 className="text-4xl font-playfair mb-8">Konfirmasi Kehadiran</h2>
            <p className="text-gray-600 mb-12">Mohon konfirmasi kehadiran Anda</p>
            <RSVPForm slug={data.slug} />
          </div>
        </motion.section>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <motion.footer className="py-16 bg-gray-50 flex flex-col items-center text-center"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div className="w-full max-w-2xl mx-auto px-4">
          <p className="text-gray-600 mb-8">
            Merupakan suatu kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu
          </p>
          <h3 className="text-2xl font-playfair mb-8">Kami Yang Berbahagia,</h3>
          <h4 className="text-3xl font-playfair mb-8">
            {mempelai?.pria} &amp; {mempelai?.wanita}
          </h4>
          <div className="social-links mb-8 flex gap-4 justify-center">
            {data?.tambahan?.instagram && (
              <a href={data.tambahan.instagram} className="hover:text-gray-800" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram text-xl"></i>
              </a>
            )}
            {data?.tambahan?.whatsapp && (
              <a href={data.tambahan.whatsapp} className="hover:text-gray-800" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
            )}
          </div>
          <p className="text-gray-600">
            © {new Date().getFullYear()} {data?.tambahan?.credit || 'Dreamslink'}. All Rights Reserved.
          </p>
        </div>
      </motion.footer>
    </TwoColumnLayout>
  );
}
