'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import TwoColumnLayout from './TwoColumnLayout';
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

export default function ClassicTemplate({ data }) {
  const [showHero, setShowHero] = useState(false);

  // URL background untuk splash/full-screen sebelum masuk undangan
  const bgImageUrl = '/images/bg_couple.jpg';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!showHero) {
    return (
      <section
        className="relative w-full h-screen bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${bgImageUrl})`,
          background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(' + bgImageUrl + ')'
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 font-bold">
            The Wedding of
          </h1>
          <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 font-bold">
            {data.mempelai.pria} & {data.mempelai.wanita}
          </h2>
          <button
            onClick={() => setShowHero(true)}
            className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Buka Undangan
          </button>
        </div>
      </section>
    );
  }

  // Jika sudah diklik ("Buka Undangan"), masuk ke layout dua kolom
  const leftBg = bgImageUrl; // gambar background kolom kiri
  const leftTitle = `${data.mempelai.pria} & ${data.mempelai.wanita}`;

  return (
    <TwoColumnLayout leftBackgroundUrl={leftBg} leftTitle={leftTitle}>
      {/* Hero Section */}
      <motion.section
        id="hero"
        className="relative w-full h-screen bg-cover bg-center font-serif"
        style={{ 
          backgroundImage: `url(${bgImageUrl})`,
          background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(' + bgImageUrl + ')'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/25"></div>
        <div className="relative z-10 px-6 py-16 text-center">
          <h1 className="text-5xl font-serif text-white font-bold">
            The Wedding of
          </h1>
          <h2 className="mt-4 text-5xl font-serif text-white font-bold">
            {data.mempelai.pria} & {data.mempelai.wanita}
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
      </motion.section>

      {/* We Found Love Section */}
      <motion.section
        className="py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold text-gray-800 mb-8 relative">
            We Found Love
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4"></div>
          </h2>
          <p className="text-gray-600 italic text-lg leading-relaxed">
            "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan‐pasangan untukmu …"
            <br />
            <span className="block mt-2">(QS. Ar‐Rum Ayat 21)</span>
          </p>
        </div>
      </motion.section>

      {/* Bride & Groom Section */}
      <motion.section
        className="py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              className="bg-white rounded-2xl p-8 text-center shadow-xl border-2 border-gray-200 hover:shadow-2xl transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={data.mempelai.foto_wanita}
                alt={data.mempelai.wanita}
                width={256}
                height={256}
                className="w-64 h-64 object-cover rounded-full mx-auto mb-6 border-4 border-blue-500"
              />
              <h3 className="text-3xl font-serif font-bold text-gray-800 mb-4">{data.mempelai.wanita}</h3>
              <p className="text-gray-600 mb-2 italic">Putri dari</p>
              <p className="mb-4 text-gray-700">{data.mempelai.orangtua_wanita}</p>
              {data.tambahan?.instagram_wanita && (
                <a
                  href={data.tambahan.instagram_wanita}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 transition-colors font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-instagram"></i> Instagram
                </a>
              )}
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 text-center shadow-xl border-2 border-gray-200 hover:shadow-2xl transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Image
                src={data.mempelai.foto_pria}
                alt={data.mempelai.pria}
                width={256}
                height={256}
                className="w-64 h-64 object-cover rounded-full mx-auto mb-6 border-4 border-blue-500"
              />
              <h3 className="text-3xl font-serif font-bold text-gray-800 mb-4">{data.mempelai.pria}</h3>
              <p className="text-gray-600 mb-2 italic">Putra dari</p>
              <p className="mb-4 text-gray-700">{data.mempelai.orangtua_pria}</p>
              {data.tambahan?.instagram_pria && (
                <a
                  href={data.tambahan.instagram_pria}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 transition-colors font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-instagram"></i> Instagram
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Save The Date Section */}
      <motion.section
        className="py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold text-gray-800 mb-8 relative">
            Save The Date
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4"></div>
          </h2>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
            <CountdownTimer targetDate={data.acara_utama.tanggal} />
          </div>
          {data.acara?.[0] && (
            <div className="mt-8">
              <AddToCalendar
                event={{
                  nama: data.acara[0].nama,
                  tanggal: data.acara[0].tanggal,
                  waktu: data.acara[0].waktu,
                  lokasi: data.acara[0].lokasi,
                  alamat: data.acara[0].alamat,
                }}
              />
            </div>
          )}
        </div>
      </motion.section>

      {/* Events Section */}
      <motion.section
        className="py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {data.acara?.[0] && (
              <motion.div
                className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-8 text-center shadow-xl"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-serif font-bold mb-4">{data.acara[0].nama}</h3>
                <p className="text-xl mb-4">
                  {new Date(data.acara[0].tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-lg mb-4">{data.acara[0].waktu}</p>
                <p className="mb-4">{data.acara[0].lokasi}</p>
                <p className="mb-6">{data.acara[0].alamat}</p>
                <a
                  href={data.acara[0].maps_link}
                  className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Maps
                </a>
              </motion.div>
            )}

            {data.acara?.[1] && (
              <motion.div
                className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-8 text-center shadow-xl"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-2xl font-serif font-bold mb-4">{data.acara[1].nama}</h3>
                <p className="text-xl mb-4">
                  {new Date(data.acara[1].tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-lg mb-4">{data.acara[1].waktu}</p>
                <p className="mb-4">{data.acara[1].lokasi}</p>
                <p className="mb-6">{data.acara[1].alamat}</p>
                <a
                  href={data.acara[1].maps_link}
                  className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Maps
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Love Story Section */}
      {data.our_story && (
        <motion.section
          className="py-16 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center relative">
              Our Love Story
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4"></div>
            </h2>
            <OurStory data={data.our_story} />
          </div>
        </motion.section>
      )}

      {/* Gallery Section */}
      {data.galeri && data.galeri.length > 0 && (
        <motion.section
          className="py-16 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center relative">
              Wedding Gallery
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4"></div>
            </h2>
            <Gallery images={data.galeri} />
          </div>
        </motion.section>
      )}

      {/* Live Streaming Section */}
      {data.tambahan?.live_streaming && (
        <motion.section
          className="py-16 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <LiveStreaming data={data.tambahan.live_streaming} />
        </motion.section>
      )}

      {/* Wedding Gift Section */}
      {data.gift?.enabled && (
        <>
          <motion.section
            className="py-16 px-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center relative">
                Wedding Gift
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4"></div>
              </h2>
              <p className="text-gray-600 text-center mb-12 text-lg italic">{data.gift.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.gift.bank_accounts?.map((account, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-200">
                    <Image
                      src={account.logo}
                      alt={account.bank}
                      width={64}
                      height={64}
                      className="mx-auto mb-4"
                    />
                    <h3 className="text-2xl font-serif font-bold mb-4 text-center">{account.bank}</h3>
                    <p className="text-xl mb-4 text-center font-mono">{account.nomor}</p>
                    <p className="mb-4 text-center text-gray-600">a.n. {account.atas_nama}</p>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-full font-semibold hover:shadow-lg transition-all">
                      Salin
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            className="py-16 px-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center relative">
                Konfirmasi Hadiah
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4"></div>
              </h2>
              <p className="text-gray-600 text-center mb-8 italic">
                Jika Anda telah mengirimkan hadiah, silakan konfirmasi:
              </p>
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-200">
                <GiftConfirmation slug={data.slug} />
              </div>
            </div>
          </motion.section>
        </>
      )}

      {/* Wedding Wishes Section */}
      <motion.section
        className="py-16 px-4 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center relative">
            Ucapan & Harapan
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4"></div>
          </h2>
          <p className="text-gray-600 text-center mb-12 text-lg italic">
            Berikan ucapan dan harapan terbaik Anda untuk kedua mempelai
          </p>
          <WeddingWishes slug={data.slug} />
        </div>
      </motion.section>

      {/* RSVP Section */}
      <motion.section
        className="py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-gray-800 mb-8 text-center relative">
            Konfirmasi Kehadiran
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4"></div>
          </h2>
          <p className="text-gray-600 text-center mb-8 italic">
            Mohon konfirmasi kehadiran Anda
          </p>
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-200">
            <RSVPForm slug={data.slug} />
          </div>
        </div>
      </motion.section>

      {/* Footer Section */}
      <motion.footer
        className="py-16 px-4 bg-gradient-to-br from-gray-800 to-gray-900 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="mb-8 text-lg">
            Merupakan suatu kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu
          </p>
          <h3 className="text-2xl font-serif mb-4">Kami Yang Berbahagia,</h3>
          <h4 className="text-3xl font-serif font-bold mb-8">
            {data.mempelai.pria} & {data.mempelai.wanita}
          </h4>
          <div className="flex justify-center gap-6 mb-8">
            {data.tambahan?.instagram && (
              <a
                href={data.tambahan.instagram}
                className="text-2xl hover:text-blue-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i>
              </a>
            )}
            {data.tambahan?.whatsapp && (
              <a
                href={data.tambahan.whatsapp}
                className="text-2xl hover:text-green-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            )}
          </div>
          <p className="text-sm opacity-75">
            © {new Date().getFullYear()} {data.tambahan?.credit}. All Rights Reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
