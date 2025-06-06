// components/ModernTemplate.js
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import TwoColumnLayout from './TwoColumnLayout';
import PasswordProtection from '../PasswordProtection';

import GiftConfirmation from './GiftConfirmation';
import MusicPlayer from './MusicPlayer';
import CountdownTimer from './CountdownTimer';
import Maps from './Maps';
import RSVPForm from './RSVPForm';
import WeddingWishes from './WeddingWishes';
import OurStory from './OurStory';
import AddToCalendar from './AddToCalendar';
import QRCodeGuest from './QRCodeGuest';
import LiveStreaming from './LiveStreaming';
import Gallery from './Gallery';

export default function ModernTemplate({ data }) {
  const [showHero, setShowHero] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!data.privacy?.isPasswordProtected);

  // URL background untuk splash/full-screen sebelum masuk undangan
  const bgImageUrl = '/images/bg_couple.jpg';

  // If password protection is enabled and not authenticated, show password screen
  if (!isAuthenticated) {
    return (
      <PasswordProtection 
        onPasswordCorrect={() => setIsAuthenticated(true)}
        backgroundImage={data.mempelai.foto_pria || bgImageUrl}
      />
    );
  }
 useEffect(() => {
    // simpan nilai overflow semula (untuk cleanup)
    const previousOverflow = document.body.style.overflow;
    // set overflow hidden
    document.body.style.overflow = 'hidden';

    // saat komponen diunmount (atau saat berpindah halaman), kembalikan overflow semula
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  // Jika belum diklik, tampilkan layar pembuka full-screen
  if (!showHero) {
    return (
      <section
        className="relative w-full h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImageUrl})` }}
      >
        {/* Overlay gelap */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Konten di tengah layar */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-playfair text-white mb-6">
            The Wedding of
          </h1>
          <h2 className="text-5xl md:text-7xl font-playfair text-white mb-8">
            {data.mempelai.pria} &amp; {data.mempelai.wanita}
          </h2>
          <button
            onClick={() => setShowHero(true)}
            className="btn px-8 py-3"
          >
            Buka Undangan
          </button>
        </div>
      </section>
    );
  }

  // Jika sudah diklik (“Buka Undangan”), masuk ke layout dua kolom
  const leftBg = bgImageUrl; // gambar background kolom kiri
  const leftTitle = `${data.mempelai.pria} & ${data.mempelai.wanita}`;

  return (
    <TwoColumnLayout leftBackgroundUrl={leftBg} leftTitle={leftTitle}>
      {/* ───────────────────────────────────────────────
          Hero Section (dengan QR Code pada kolom kanan)
      ─────────────────────────────────────────────── */}
      <motion.section
        id="hero"
        className="relative w-full h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImageUrl})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.8 } }}
      >
        <div className="absolute inset-0 bg-black/25"></div>
        <div className="relative z-10 px-6 py-16 text-center">
          <h1 className="text-6xl font-playfair text-white">
            The Wedding of
          </h1>
          <h2 className="mt-4 text-6xl font-playfair text-white">
            {data.mempelai.pria} &amp; {data.mempelai.wanita}
          </h2>
          <p className="mt-6 text-xl text-white">
            {new Date(data.acara_utama.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <div className="mt-8">
            <h3 className="text-2xl text-white">Kepada Yth,</h3>
            {data.components?.QRCode}
            <h4 className="mt-2 text-xl text-white">
              {data.tambahan?.guestName || 'Nama Tamu'}
            </h4>
          </div>

          {(data.slug && data.tambahan?.guestName) && (
            <div className="mt-6 flex justify-center">
              <QRCodeGuest
                slug={data.slug}
                guestName={data.tambahan.guestName}
              />
            </div>
          )}

          {data.tambahan?.qr_code_url && (
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
        {/* ↓ Scroll Icon ↓ */}
  <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8 text-white animate-bounce"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
  {/* ↑ Scroll Icon ↑ */}
      </motion.section>

      {/* ───────────────────────────────────────────────
          Couple Section (“We Found Love”)
      ─────────────────────────────────────────────── */}
      <motion.section
        className="py-16 flex flex-col items-center text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-playfair mb-8">We Found Love</h2>
          <p className="text-gray-600 italic mb-16">
            "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan‐pasangan untukmu …"
            <br />
            <span className="block mt-2">(QS. Ar‐Rum Ayat 21)</span>
          </p>
        </div>
      </motion.section>

      {/* ───────────────────────────────────────────────
          Bride & Groom
      ─────────────────────────────────────────────── */}
      <motion.section
        className="py-16 flex flex-col items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 justify-center">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={data.mempelai.foto_wanita}
              alt={data.mempelai.wanita}
              width={256}
              height={256}
              className="w-64 h-64 object-cover rounded-full mx-auto mb-6"
            />
            <h3 className="text-3xl font-playfair mb-4">{data.mempelai.wanita}</h3>
            <p className="text-gray-600 mb-2">Putri Pertama Dari</p>
            <p className="mb-4">{data.mempelai.orangtua_wanita}</p>
            {data.tambahan?.instagram_wanita && (
              <a
                href={data.tambahan.instagram_wanita}
                className="text-gray-600 hover:text-gray-800 transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i> Instagram
              </a>
            )}
          </motion.div>

          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Image
              src={data.mempelai.foto_pria}
              alt={data.mempelai.pria}
              width={256}
              height={256}
              className="w-64 h-64 object-cover rounded-full mx-auto mb-6"
            />
            <h3 className="text-3xl font-playfair mb-4">{data.mempelai.pria}</h3>
            <p className="text-gray-600 mb-2">Putra Pertama Dari</p>
            <p className="mb-4">{data.mempelai.orangtua_pria}</p>
            {data.tambahan?.instagram_pria && (
              <a
                href={data.tambahan.instagram_pria}
                className="text-gray-600 hover:text-gray-800 transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i> Instagram
              </a>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ───────────────────────────────────────────────
          Save The Date (Countdown + AddToCalendar)
      ─────────────────────────────────────────────── */}
      <motion.section
        className="py-16 flex flex-col items-center text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-playfair mb-12">Save The Date</h2>
          <div className="countdown-container">
            <CountdownTimer targetDate={data.acara_utama.tanggal} />
          </div>
          {data.acara?.[0] && (
            <AddToCalendar
              event={{
                nama: data.acara[0].nama,
                tanggal: data.acara[0].tanggal,
                waktu: data.acara[0].waktu,
                lokasi: data.acara[0].lokasi,
                alamat: data.acara[0].alamat,
              }}
            />
          )}
        </div>
      </motion.section>

      {/* ───────────────────────────────────────────────
          Events (Akad & Resepsi)
      ─────────────────────────────────────────────── */}
      <motion.section
        className="py-16 flex flex-col items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 justify-center">
          {data.acara?.[0] && (
            <motion.div
              className="text-center"
              initial="hidden"
              whileInView="visible"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-3xl font-playfair mb-6">{data.acara[0].nama}</h3>
              <p className="text-xl mb-4">
                {new Date(data.acara[0].tanggal).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="mb-6">{data.acara[0].waktu}</p>
              <p className="text-gray-600 mb-4">{data.acara[0].lokasi}</p>
              <p className="mb-6">{data.acara[0].alamat}</p>
              <a
                href={data.acara[0].maps_link}
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Maps
              </a>
            </motion.div>
          )}
          {data.acara?.[1] && (
            <motion.div
              className="text-center"
              initial="hidden"
              whileInView="visible"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-3xl font-playfair mb-6">{data.acara[1].nama}</h3>
              <p className="text-xl mb-4">
                {new Date(data.acara[1].tanggal).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="mb-6">{data.acara[1].waktu}</p>
              <p className="text-gray-600 mb-4">{data.acara[1].lokasi}</p>
              <p className="mb-6">{data.acara[1].alamat}</p>
              <a
                href={data.acara[1].maps_link}
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Maps
              </a>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* ───────────────────────────────────────────────
          Love Story (OurStory)
      ─────────────────────────────────────────────── */}
      {data.our_story && (
        <motion.section
          className="py-16 flex flex-col items-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <OurStory data={data.our_story} />
        </motion.section>
      )}

      {/* ───────────────────────────────────────────────
          Gallery
      ─────────────────────────────────────────────── */}
      {data.galeri && data.galeri.length > 0 && (
        <motion.section
          className="py-16 flex flex-col items-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <div className="w-full max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-playfair mb-8">Wedding Gallery</h2>
            <Gallery images={data.galeri} />
          </div>
        </motion.section>
      )}

      {/* ───────────────────────────────────────────────
          Live Streaming
      ─────────────────────────────────────────────── */}
      {data.tambahan?.live_streaming && (
        <motion.section
          className="py-16 bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <LiveStreaming data={data.tambahan.live_streaming} />
        </motion.section>
      )}

      {/* ───────────────────────────────────────────────
          Wedding Gift & Konfirmasi
      ─────────────────────────────────────────────── */}
      {data.gift?.enabled && (
        <>
          <motion.section
            className="py-16 flex flex-col items-center text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="w-full max-w-4xl mx-auto px-4">
              <h2 className="text-4xl font-playfair mb-8">Wedding Gift</h2>
              <p className="text-gray-600 mb-16">{data.gift.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
                {data.gift.bank_accounts?.map((account, idx) => (
                  <div key={idx} className="gift-card">
                    <Image
                      src={account.logo}
                      alt={account.bank}
                      width={64}
                      height={64}
                      className="w-16 h-16 mx-auto mb-4"
                    />
                    <h3 className="text-2xl font-playfair mb-4">{account.bank}</h3>
                    <p className="text-xl mb-4">{account.nomor}</p>
                    <p className="mb-4">a.n. {account.atas_nama}</p>
                    <button className="btn">Salin</button>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            className="py-16 flex flex-col items-center text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="w-full max-w-2xl mx-auto px-4">
              <h2 className="text-4xl font-playfair mb-8">Konfirmasi Hadiah</h2>
              <p className="text-gray-600 mb-8">
                Jika Anda telah mengirimkan hadiah, silakan konfirmasi:
              </p>
              <GiftConfirmation slug={data.slug} />
            </div>
          </motion.section>
        </>
      )}

      {/* ───────────────────────────────────────────────
          Wedding Wishes (Ucapan & Harapan)
      ─────────────────────────────────────────────── */}
      {!data.privacy?.hideGuestbook && (
        <motion.section
          className="py-16 flex flex-col items-center text-center bg-gray-50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <div className="w-full max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-playfair mb-8">Ucapan & Harapan</h2>
            <p className="text-gray-600 mb-12">
              Berikan ucapan dan harapan terbaik Anda untuk kedua mempelai
            </p>
            <WeddingWishes slug={data.slug} />
          </div>
        </motion.section>
      )}

      {/* ───────────────────────────────────────────────
          RSVP (Konfirmasi Kehadiran)
      ─────────────────────────────────────────────── */}
      {!data.privacy?.hideRSVP && (
        <motion.section
          className="py-16 flex flex-col items-center text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <div className="w-full max-w-2xl mx-auto px-4">
            <h2 className="text-4xl font-playfair mb-8">Konfirmasi Kehadiran</h2>
            <p className="text-gray-600 mb-12">
              Mohon konfirmasi kehadiran Anda
            </p>
            <RSVPForm slug={data.slug} />
          </div>
        </motion.section>
      )}

      {/* ───────────────────────────────────────────────
          Footer
      ─────────────────────────────────────────────── */}
      <motion.footer
        className="py-16 bg-gray-50 flex flex-col items-center text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          <p className="text-gray-600 mb-8">
            Merupakan suatu kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu
          </p>
          <h3 className="text-2xl font-playfair mb-8">Kami Yang Berbahagia,</h3>
          <h4 className="text-3xl font-playfair mb-8">
            {data.mempelai.pria} &amp; {data.mempelai.wanita}
          </h4>
          <div className="social-links mb-8">
            {data.tambahan?.instagram && (
              <a
                href={data.tambahan.instagram}
                className="hover:text-gray-800 transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram text-xl"></i>
              </a>
            )}
            {data.tambahan?.whatsapp && (
              <a
                href={data.tambahan.whatsapp}
                className="hover:text-gray-800 transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
            )}
          </div>
          <p className="text-gray-600">
            © {new Date().getFullYear()} {data.tambahan?.credit}. All Rights Reserved.
          </p>
        </div>
      </motion.footer>
    </TwoColumnLayout>
  );
}
