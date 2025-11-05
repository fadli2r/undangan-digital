'use client';
import { useRouter } from "next/router";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import TwoColumnLayout from '../sections/TwoColumnLayout';
import GiftConfirmation from '../sections/GiftConfirmation';
import MusicPlayer from '../sections/MusicPlayer';
import CountdownTimer from '../sections/CountdownTimer';
import Maps from '../sections/Maps';
import RSVPForm from '../sections/RSVPForm';
import WeddingWishes from '../sections/WeddingWishes';
import OurStory from '../sections/OurStory';
import AddToCalendar from '../sections/AddToCalendar';
import QRCodeGuest from '../sections/QRCodeGuest';
import LiveStreaming from '../sections/LiveStreaming';
import Gallery from '../sections/Gallery';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ClassicTemplate({ data }) {
  const [showHero, setShowHero] = useState(false);
  const { language, changeLanguage, t } = useLanguage();
const [guestName, setGuestName] = useState('');

  // URL background untuk splash/full-screen sebelum masuk undangan
  const bgImageUrl = '/images/bg_couple.jpg';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
useEffect(() => {
  try {
    const qs = new URLSearchParams(window.location.search);
    const tamu = qs.get('tamu') || '';
    setGuestName(tamu.trim());
  } catch {
    setGuestName('');
  }
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
        {/* Language Toggle */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => changeLanguage(language === 'id' ? 'en' : 'id')}
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
          >
            {language === 'id' ? 'English' : 'Bahasa'}
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 font-bold">
            {language === 'id' ? 'Undangan Pernikahan' : 'The Wedding of'}
          </h1>
          <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 font-bold">
            {data.mempelai.pria} & {data.mempelai.wanita}
          </h2>
          <button
            onClick={() => setShowHero(true)}
            className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            {language === 'id' ? 'Buka Undangan' : 'Open Invitation'}
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
      <div className="font-serif">
        {/* Music Player */}
        <MusicPlayer musik={data.tambahan?.musik} />

        {/* Language Toggle - Fixed Position */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => changeLanguage(language === 'id' ? 'en' : 'id')}
            className="bg-white/20 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full hover:bg-white/30 transition-colors shadow-lg"
          >
            {language === 'id' ? 'English' : 'Bahasa'}
          </button>
        </div>

        {/* Hero Section */}
       <motion.section
  id="hero"
  className="relative w-full h-screen bg-cover bg-center"
  style={{ backgroundImage: `url(${bgImageUrl})` }}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1, transition: { duration: 0.8 } }}
>
  <div className="absolute inset-0 bg-black/25"></div>
  <div className="relative z-10 px-6 py-16 text-center">
    <h1 className="text-6xl font-serif text-white">
      {language === "id" ? "Undangan Pernikahan" : "The Wedding of"}
    </h1>
    <h2 className="mt-4 text-6xl font-serif text-white">
      {data.mempelai.pria} &amp; {data.mempelai.wanita}
    </h2>
    <p className="mt-6 text-xl text-white">
      {new Date(data.acara_utama.tanggal).toLocaleDateString(
        language === "id" ? "id-ID" : "en-US",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )}
    </p>

    <div className="mt-8">
      <h3 className="text-2xl text-white">
        {language === "id" ? "Kepada Yth," : "Dear,"}
      </h3>
      <h4 className="mt-2 text-xl text-white font-semibold">
        {guestName || data.tambahan?.guestName || 
          (language === "id" ? "Nama Tamu" : "Guest Name")}
      </h4>
    </div>

    {data.slug && (guestName || data.tambahan?.guestName) && (
      <div className="mt-6 flex justify-center">
        <QRCodeGuest
          slug={data.slug}
          guestName={guestName || data.tambahan?.guestName}
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
            <h2 className="text-4xl font-serif mb-8">
              {language === 'id' ? 'Kami Menemukan Cinta' : 'We Found Love'}
            </h2>
            <p className="text-gray-600 italic mb-16">
              {language === 'id' ? (
                <>
                  "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan‐pasangan untukmu …"
                  <br />
                  <span className="block mt-2">(QS. Ar‐Rum Ayat 21)</span>
                </>
              ) : (
                <>
                  "And among His Signs is that He created for you mates from among yourselves..."
                  <br />
                  <span className="block mt-2">(Quran 30:21)</span>
                </>
              )}
            </p>
          </div>
        </motion.section>

        {/* Bride & Groom */}
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
          <div className="w-full max-w-4xl mx-auto px-4 grid grid-cols-1 gap-12 justify-center">
            <motion.div
              className="text-center bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-200"
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
                className="w-64 h-64 object-cover rounded-full mx-auto mb-6 border-4 border-blue-500"
              />
              <h3 className="text-3xl font-serif mb-4">{data.mempelai.wanita}</h3>
              <p className="text-gray-600 mb-2">
                {language === 'id' ? 'Putri Pertama Dari' : 'First Daughter of'}
              </p>
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
              className="text-center bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-200"
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
                className="w-64 h-64 object-cover rounded-full mx-auto mb-6 border-4 border-blue-500"
              />
              <h3 className="text-3xl font-serif mb-4">{data.mempelai.pria}</h3>
              <p className="text-gray-600 mb-2">
                {language === 'id' ? 'Putra Pertama Dari' : 'First Son of'}
              </p>
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

        {/* Save The Date */}
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
            <h2 className="text-4xl font-serif mb-12">
              {language === 'id' ? 'Simpan Tanggal' : 'Save The Date'}
            </h2>
            <div className="countdown-container bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-8">
              <CountdownTimer targetDate={data.acara_utama.tanggal} language={language} />
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
                language={language}
              />
            )}
          </div>
        </motion.section>

        {/* Events */}
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
          <div className="w-full max-w-4xl mx-auto px-4 grid grid-cols-1 gap-12 justify-center">
            {data.acara?.[0] && (
              <motion.div
                className="text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-8"
                initial="hidden"
                whileInView="visible"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-3xl font-serif mb-6">
                  {language === 'id' ? data.acara[0].nama : (data.acara[0].nama === 'Akad Nikah' ? 'Wedding Ceremony' : data.acara[0].nama)}
                </h3>
                <p className="text-xl mb-4">
                  {new Date(data.acara[0].tanggal).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="mb-6">{data.acara[0].waktu}</p>
                <p className="text-gray-200 mb-4">{data.acara[0].lokasi}</p>
                <p className="mb-6">{data.acara[0].alamat}</p>
                <a
                  href={data.acara[0].maps_link}
                  className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {language === 'id' ? 'Buka Maps' : 'Open Maps'}
                </a>
              </motion.div>
            )}
            {data.acara?.[1] && (
              <motion.div
                className="text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-8"
                initial="hidden"
                whileInView="visible"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-3xl font-serif mb-6">
                  {language === 'id' ? data.acara[1].nama : (data.acara[1].nama === 'Resepsi' ? 'Wedding Reception' : data.acara[1].nama)}
                </h3>
                <p className="text-xl mb-4">
                  {new Date(data.acara[1].tanggal).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="mb-6">{data.acara[1].waktu}</p>
                <p className="text-gray-200 mb-4">{data.acara[1].lokasi}</p>
                <p className="mb-6">{data.acara[1].alamat}</p>
                <a
                  href={data.acara[1].maps_link}
                  className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {language === 'id' ? 'Buka Maps' : 'Open Maps'}
                </a>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Love Story */}
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

        {/* Gallery */}
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
              <h2 className="text-4xl font-serif mb-8">
                {language === 'id' ? 'Galeri Pernikahan' : 'Wedding Gallery'}
              </h2>
              <Gallery images={data.galeri} />
            </div>
          </motion.section>
        )}

        {/* Live Streaming */}
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
            <LiveStreaming data={data.tambahan.live_streaming} language={language} />
          </motion.section>
        )}

        {/* Wedding Gift */}
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
                <h2 className="text-4xl font-serif mb-8">
                  {language === 'id' ? 'Hadiah Pernikahan' : 'Wedding Gift'}
                </h2>
                <p className="text-gray-600 mb-16">{data.gift.description}</p>
                <div className="grid grid-cols-1 gap-8 justify-center">
                  {data.gift.bank_accounts?.map((account, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-200">
                      <Image
                        src={account.logo}
                        alt={account.bank}
                        width={64}
                        height={64}
                        className="w-16 h-16 mx-auto mb-4"
                      />
                      <h3 className="text-2xl font-serif mb-4">{account.bank}</h3>
                      <p className="text-xl mb-4">{account.nomor}</p>
                      <p className="mb-4">a.n. {account.atas_nama}</p>
                      <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-full">
                        {language === 'id' ? 'Salin' : 'Copy'}
                      </button>
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
                <h2 className="text-4xl font-serif mb-8">
                  {language === 'id' ? 'Konfirmasi Hadiah' : 'Gift Confirmation'}
                </h2>
                <p className="text-gray-600 mb-8">
                  {language === 'id' 
                    ? 'Jika Anda telah mengirimkan hadiah, silakan konfirmasi:'
                    : 'If you have sent a gift, please confirm:'
                  }
                </p>
                <GiftConfirmation slug={data.slug} language={language} />
              </div>
            </motion.section>
          </>
        )}

        {/* Wedding Wishes */}
        {!data.hideGuestbook && (
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
              <h2 className="text-4xl font-serif mb-8">
                {language === 'id' ? 'Doa & Ucapan' : 'Prayers & Wishes'}
              </h2>
              <p className="text-gray-600 mb-12">
                {language === 'id' 
                  ? 'Berikan ucapan dan doa Anda untuk kedua mempelai'
                  : 'Share your wishes and prayers for the couple'
                }
              </p>
              <WeddingWishes slug={data.slug} language={language} />
            </div>
          </motion.section>
        )}

        {/* RSVP */}
        {/* RSVP */}
{!data.hideRSVP && (
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
      <h2 className="text-4xl font-serif mb-8">
        {language === 'id' ? 'Konfirmasi Kehadiran' : 'RSVP'}
      </h2>
      <p className="text-gray-600 mb-12">
        {language === 'id' 
          ? 'Mohon konfirmasi kehadiran Anda di acara pernikahan kami'
          : 'Please confirm your attendance at our wedding'
        }
      </p>

      {/* ✅ pass slug & tamu */}
                  <RSVPForm slug={data.slug} namaTamu={guestName || undefined} />

    </div>
  </motion.section>
)}


        {/* Footer */}
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
              {language === 'id' 
                ? 'Merupakan suatu kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu'
                : 'It would be our honor if you could attend and give us your blessings'
              }
            </p>
            <h3 className="text-2xl font-serif mb-8">
              {language === 'id' ? 'Kami Yang Berbahagia,' : 'With Love,'}
            </h3>
            <h4 className="text-3xl font-serif mb-8">
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
              © {new Date().getFullYear()} {data.tambahan?.credit}. 
              {language === 'id' ? ' Semua Hak Dilindungi.' : ' All Rights Reserved.'}
            </p>
          </div>
        </motion.footer>
      </div>
    </TwoColumnLayout>
  );
}
