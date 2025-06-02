// components/ModernTemplate.js
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

import GiftConfirmation from './GiftConfirmation';
import MusicPlayer from './MusicPlayer';
import CountdownTimer from './CountdownTimer';
import Maps from './Maps';
import RSVPForm from './RSVPForm';
import OurStory from './OurStory';
import AddToCalendar from './AddToCalendar';
import QRCodeGuest from './QRCodeGuest';
import LiveStreaming from './LiveStreaming';
import Gallery from './Gallery';

export default function ModernTemplate({ data }) {
  const [showHero, setShowHero] = useState(false);

  // Variants animasi untuk setiap section
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // URL background untuk landing/hero
const bgImageUrl = '/images/bg_couple.jpg';

  const handleOpenInvitation = () => {
    setShowHero(true);
  };

  // Jika belum diklik, hanya tampilkan landing cover full-screen
  if (!showHero) {
    return (
      <section
    className="relative w-full h-screen bg-cover bg-center"
    style={{ backgroundImage: "url('/images/bg_couple.jpg')" }}
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
      <button onClick={handleOpenInvitation} className="btn px-8 py-3">
        Buka Undangan
      </button>
    </div>
  </section>
    );
  }

  return (
    <div className="font-sans relative bg-white text-gray-800">
      {/* =========================================
          1. Hero Section (dengan QR Code)
      ========================================= */}
      <motion.section
        id="hero"
        className="landing-cover"
        style={{
          backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'none',
        }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.8 } },
        }}
      >
        <div className="bg-overlay"></div>
        <div className="content px-4 w-full max-w-2xl mx-auto">
          <motion.h1
            className="text-4xl md:text-6xl font-playfair text-white mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          >
            The Wedding of
          </motion.h1>
          <motion.h2
            className="text-5xl md:text-7xl font-playfair text-white mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
          >
            {data.mempelai.pria} &amp; {data.mempelai.wanita}
          </motion.h2>
          <motion.p
            className="text-xl text-white mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
          >
            {new Date(data.acara_utama.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </motion.p>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.9 } }}
          >
            <h3 className="text-2xl text-white mb-2">Kepada Yth,</h3>
            {data.components?.QRCode}
            <h4 className="text-xl text-white mb-6">{data.tambahan?.guestName || 'Nama Tamu'}</h4>
          </motion.div>

          

          {data.slug && data.tambahan?.guestName && (
            <motion.div
              className="mt-8 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 1.3 } }}
            >
              <QRCodeGuest slug={data.slug} guestName={data.tambahan.guestName} />
            </motion.div>
          )}
          {data.tambahan?.qr_code_url && (
            <motion.div
              className="mt-8 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 1.1 } }}
            >
              <Image
                src={data.tambahan.qr_code_url}
                alt="QR Code Undangan"
                width={150}
                height={150}
                className="rounded-lg shadow-lg"
              />
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* =========================================
          2. Couple Section (“We Found Love”)
      ========================================= */}
      <motion.section
        className="py-16 flex flex-col items-center text-center"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-playfair mb-8">We Found Love</h2>
          <p className="text-gray-600 italic mb-16">
            "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir."
            <br />
            <span className="block mt-2">(QS. Ar-Rum Ayat 21)</span>
          </p>
        </div>
      </motion.section>

      {/* =========================================
          3. Bride & Groom
      ========================================= */}
      <motion.section
        className="py-16 bg-gray-50 flex flex-col items-center"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 justify-center">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            variants={fadeInUp}
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
            variants={fadeInUp}
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

      {/* =========================================
          4. Save The Date (Countdown + AddToCalendar)
      ========================================= */}
      <motion.section
        className="py-16 flex flex-col items-center text-center"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
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

      {/* =========================================
          5. Events (Akad & Resepsi)
      ========================================= */}
      <motion.section
        className="py-16 bg-gray-50 flex flex-col items-center"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 justify-center">
          {data.acara?.[0] && (
            <motion.div
              className="text-center"
              initial="hidden"
              whileInView="visible"
              variants={fadeInUp}
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
              variants={fadeInUp}
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

      {/* =========================================
          6. Love Story (menggunakan OurStory component)
      ========================================= */}
      {data.our_story && (
        <motion.section
          className="py-16 flex flex-col items-center text-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <OurStory data={data.our_story} />
        </motion.section>
      )}


      {/* =========================================
          8. Gallery
      ========================================= */}
      {data.galeri && data.galeri.length > 0 && (
        <motion.section
          className="py-16 flex flex-col items-center text-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="w-full max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-playfair mb-8">Wedding Gallery</h2>
            <Gallery images={data.galeri} />
          </div>
        </motion.section>
      )}

      {/* =========================================
          9. Live Streaming
      ========================================= */}
      {data.tambahan?.live_streaming && (
        <motion.section
          className="py-16 bg-gray-50"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <LiveStreaming data={data.tambahan.live_streaming} />
        </motion.section>
      )}

      {/* =========================================
          10. Wedding Gift
      ========================================= */}
      {data.gift?.enabled && (
        <>
          <motion.section
            className="py-16 bg-gray-50 flex flex-col items-center text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
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
                    <button className="btn">
                      Salin
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            className="py-16 flex flex-col items-center text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="w-full max-w-2xl mx-auto px-4">
              <h2 className="text-4xl font-playfair mb-8">Konfirmasi Hadiah</h2>
              <p className="text-gray-600 mb-8">
                Jika Anda telah mengirimkan hadiah, silakan konfirmasi melalui form di bawah ini
              </p>
              <GiftConfirmation slug={data.slug} />
            </div>
          </motion.section>
        </>
      )}

      {/* =========================================
          10.1. Gift Confirmation
      ========================================= */}
      {data.gift?.enabled && (
        <motion.section
          className="py-16 flex flex-col items-center text-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="w-full max-w-2xl mx-auto px-4">
            <h2 className="text-4xl font-playfair mb-8">Konfirmasi Hadiah</h2>
            <p className="text-gray-600 mb-8">
              Jika Anda telah mengirimkan hadiah, silakan konfirmasi melalui form di bawah ini
            </p>
            <GiftConfirmation slug={data.slug} />
          </div>
        </motion.section>
      )}

      {/* =========================================
          11. RSVP (Doa & Ucapan)
      ========================================= */}
      <motion.section
        className="py-16 flex flex-col items-center text-center"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-playfair mb-8">Doa & Ucapan</h2>
          <p className="text-gray-600 mb-12">Berikan ucapan harapan dan doa kepada kedua mempelai</p>
          <RSVPForm slug={data.slug} />
        </div>
      </motion.section>

      {/* =========================================
          12. Footer
      ========================================= */}
      <motion.footer
        className="py-16 bg-gray-50 flex flex-col items-center text-center"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="w-full max-w-2xl mx-auto px-4">
          <p className="text-gray-600 mb-8">
            Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila Bapak/Ibu/Saudara/i, berkenan hadir dan memberikan doa restu kepada kami
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
    </div>
  );
}
