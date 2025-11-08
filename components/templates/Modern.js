// components/templates/Modern.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Layout & sections
import TwoColumnLayout from '../sections/TwoColumnLayout';
import PasswordProtection from '../PasswordProtection';
import CountdownTimer from '../sections/CountdownTimer';
import RSVPForm from '../sections/RSVPForm';
import WeddingWishes from '../sections/WeddingWishes';
import OurStory from '../sections/OurStory';
import AddToCalendar from '../sections/AddToCalendar';
import QRCodeGuest from '../sections/QRCodeGuest';
import GiftConfirmation from '../sections/GiftConfirmation';

// Animations (variants + css module utils)
import {
  section as vSection,
  item as vItem,
  fadeRight,
  fadeLeft,
  zoomIn,
  viewportOnce,
} from '../animations/variants';
import anim from '../animations/anim.module.css';
import WavingFlower from '../animations/WavingFlower';

// Local styles for this template only
import styles from './ModernTemplate.module.css';

// Heavy / browser-only → dynamic import (code-splitting)
const Gallery = dynamic(() => import('../sections/Gallery'), {
  ssr: false,
  loading: () => <div className={styles.skeleton} />,
});
const LiveStreaming = dynamic(() => import('../sections/LiveStreaming'), { ssr: false });
const Maps = dynamic(() => import('../sections/Maps'), { ssr: false });
const MusicPlayer = dynamic(() => import('../sections/MusicPlayer'), { ssr: false });

// utils
const toDateSafe = (v) => {
  try { return v ? new Date(v) : null; } catch { return null; }
};
const fmtTanggalLocale = (date, locale = 'id-ID') =>
  date?.toLocaleDateString?.(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const buildGuestUrl = (slug, guestName) => {
  try {
    const base = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `/${slug}`;
    if (!guestName) return base;
    const params = new URLSearchParams({ tamu: guestName });
    return `${base}?${params.toString()}`;
  } catch {
    return `/${slug}`;
  }
};

export default function ModernTemplate({ data }) {
  const mempelai = data?.mempelai || {};
  const acaraUtama = data?.acara_utama || {};
  const acara = Array.isArray(data?.acara) ? data.acara : [];

  const [showHero, setShowHero] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!data?.privacy?.isPasswordProtected);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      const tamu = qs.get('tamu') || '';
      setGuestName(tamu.trim());
    } catch {
      setGuestName('');
    }
  }, []);

  const bgImageUrl = useMemo(
    () =>
      data?.hero?.background ||
      data?.background_photo ||
      (Array.isArray(data?.galeri) && data.galeri[0]) ||
      '/images/bg_couple.jpg',
    [data]
  );

  if (!isAuthenticated) {
    return (
      <PasswordProtection
        onPasswordCorrect={() => setIsAuthenticated(true)}
        backgroundImage={mempelai?.foto_pria || bgImageUrl}
      />
    );
  }

  // lock scroll saat splash
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (!showHero) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showHero]);
{/* 🎵 Mount sekali saja, global */}
      {data?.tambahan?.musik?.enabled && data?.tambahan?.musik?.url && (
        <MusicPlayer musik={data.tambahan.musik} />
      )}
  // ===== Splash =====
  if (!showHero) {
    return (
      
      <section
        className={`${styles.vars} ${styles.splash}`}
        style={{ backgroundImage: `url(${bgImageUrl})` }}
      >
        <div className={styles.splashShade} />
        <div className={styles.splashInner}>
          <h1 className={`${styles.display} ${anim.anim} ${anim.inDown} ${anim['delay-1']}`}>
            The Wedding of
          </h1>
          <h2 className={`${styles.names} ${anim.anim} ${anim.zoomIn} ${anim['delay-2']}`}>
            {mempelai?.pria} &amp; {mempelai?.wanita}
          </h2>
          <button
  onClick={() => {
    setShowHero(true);
    // beri jeda kecil biar MusicPlayer sudah mount
    setTimeout(() => {
      try { window.dispatchEvent(new CustomEvent('invite-opened')); } catch {}
      // juga set flag untuk jaga-jaga kalau event tetap miss
      try { localStorage.setItem('invite_opened', '1'); } catch {}
    }, 300);
  }}
  className={`${styles.btn} ${styles.btnPrimary} ${anim.anim} ${anim.inUp} ${anim['delay-3']}`}
>
  Buka Undangan
</button>

        </div>
      </section>
    );
  }

  // ===== Layout utama =====
  const leftTitle = `${mempelai?.pria || ''} & ${mempelai?.wanita || ''}`;
  const tanggalUtama = toDateSafe(acaraUtama?.tanggal);
  const guestUrl = buildGuestUrl(
    data?.slug,
    guestName || data?.tambahan?.guestName || ''
  );

  const QRView = data?.slug ? (
    <div className={styles.heroQR}>
      {guestName && (
        <p className={styles.heroGuest}>
          Yth. <span className={styles.bold}>{guestName}</span>
        </p>
      )}
      <QRCodeGuest slug={data.slug} guestName={guestName} urlOverride={guestUrl} />
    </div>
  ) : null;

  return (
    <TwoColumnLayout leftBackgroundUrl={bgImageUrl} leftTitle={leftTitle}>
      {/* aktifkan scope var sekali di root */}
      <div className={styles.vars}>
        {/* Musik (optional) */}
        {data?.tambahan?.musik?.url && (
  <MusicPlayer musik={data.tambahan.musik} />

)}

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <motion.section
          id="hero"
          className={styles.hero}
          style={{ backgroundImage: `url(${bgImageUrl})` }}
          variants={vSection}
          initial="hidden"
          animate="visible"
        >
          <div className={styles.heroShade} />
          <div className={styles.heroInner}>
            <motion.h1 className={styles.display} variants={vItem}>
              The Wedding of
            </motion.h1>
            <motion.h2 className={styles.names} variants={zoomIn}>
              {mempelai?.pria} &amp; {mempelai?.wanita}
            </motion.h2>
            {tanggalUtama && (
              <motion.p className={styles.date} variants={vItem}>
                {fmtTanggalLocale(tanggalUtama, data?.i18n?.locale || 'id-ID')}
              </motion.p>
            )}

           {(guestName || data?.tambahan?.guestName) && (
  <>
    <motion.div className={styles.heroTo} variants={vItem}>
      <h3 className={styles.h3}>Kepada Yth,</h3>
      <p className={styles.heroGuest}>
        {guestName || data?.tambahan?.guestName}
      </p>
      {QRView}
    </motion.div>

    {data?.tambahan?.qr_code_url && (
      <motion.div className={styles.heroQR} variants={vItem}>
        <Image
          src={data.tambahan.qr_code_url}
          alt="QR Code Undangan"
          width={150}
          height={150}
          className={styles.qrImage}
        />
      </motion.div>
    )}
  </>
)}

          </div>

          <WavingFlower className={styles.flower} />

          <div className={styles.scrollHint}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.scrollIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </motion.section>

        {/* ── QUOTE ───────────────────────────────────────────────────────── */}
        <motion.section
          id="quote"
          className={styles.section}
          variants={vSection}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.h2 className={styles.h2} variants={vItem}>
            We Found Love
          </motion.h2>
          <motion.p className={`${styles.muted} ${styles.center}`} variants={fadeRight}>
            “Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan‐pasangan
            untukmu …”
            <span className={styles.block}>(QS. Ar-Rum: 21)</span>
          </motion.p>
        </motion.section>

        {/* ── BRIDE & GROOM ──────────────────────────────────────────────── */}
        <motion.section
          id="bride-groom"
          className={styles.section}
          variants={vSection}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className={styles.grid2}>
            {/* Wanita */}
            <motion.div className={`${styles.card} ${styles.cardSolid}`} variants={fadeLeft}>
              {mempelai?.foto_wanita && (
                <Image
                  src={mempelai.foto_wanita}
                  alt={mempelai?.wanita || 'Pengantin wanita'}
                  width={256}
                  height={256}
                  className={styles.avatar}
                />
              )}
              <h3 className={styles.h3}>{mempelai?.wanita}</h3>
              {mempelai?.orangtua_wanita && (
                <>
                  <p className={styles.muted}>Putri Pertama Dari</p>
                  <p className={styles.mb8}>{mempelai.orangtua_wanita}</p>
                </>
              )}
              {data?.tambahan?.instagram_wanita && (
                <a
                  href={data.tambahan.instagram_wanita}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.muted}
                >
                  Instagram
                </a>
              )}
            </motion.div>

            {/* Pria */}
            <motion.div className={`${styles.card} ${styles.cardSolid}`} variants={fadeRight}>
              {mempelai?.foto_pria && (
                <Image
                  src={mempelai.foto_pria}
                  alt={mempelai?.pria || 'Pengantin pria'}
                  width={256}
                  height={256}
                  className={styles.avatar}
                />
              )}
              <h3 className={styles.h3}>{mempelai?.pria}</h3>
              {mempelai?.orangtua_pria && (
                <>
                  <p className={styles.muted}>Putra Pertama Dari</p>
                  <p className={styles.mb8}>{mempelai.orangtua_pria}</p>
                </>
              )}
              {data?.tambahan?.instagram_pria && (
                <a
                  href={data.tambahan.instagram_pria}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.muted}
                >
                  Instagram
                </a>
              )}
            </motion.div>
          </div>
        </motion.section>

        {/* ── SAVE THE DATE ──────────────────────────────────────────────── */}
        <motion.section
          id="save-the-date"
          className={styles.section}
          variants={vSection}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.h2 className={styles.h2} variants={vItem}>
            Save The Date
          </motion.h2>

          {acaraUtama?.tanggal && (
            <motion.div className={styles.countdown} variants={zoomIn}>
              <CountdownTimer targetDate={acaraUtama.tanggal} />
            </motion.div>
          )}

          {acara?.[0] && (
            <motion.div variants={vItem} className={styles.mt12}>
              <AddToCalendar
                event={{
                  nama: acara[0].nama,
                  tanggal: acara[0].tanggal,
                  waktu: acara[0].waktu,
                  lokasi: acara[0].lokasi,
                  alamat: acara[0].alamat,
                }}
              />
            </motion.div>
          )}
        </motion.section>

        {/* ── EVENTS ─────────────────────────────────────────────────────── */}
        <motion.section
          id="events"
          className={styles.section}
          variants={vSection}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className={styles.grid2}>
            {acara?.[0] && (
              <motion.div className={`${styles.card} ${styles.cardGradient}`} variants={fadeLeft}>
                <h3 className={`${styles.h3} ${styles.cardTitle}`}>{acara[0].nama}</h3>
                <p className={styles.lead}>
                  {fmtTanggalLocale(toDateSafe(acara[0].tanggal), data?.i18n?.locale || 'id-ID')}
                </p>
                <p className={styles.mb8}>{acara[0].waktu}</p>
                <p className={`${styles.muted} ${styles.mb4}`}>{acara[0].lokasi}</p>
                <p className={styles.mb8}>{acara[0].alamat}</p>
                {acara[0].maps_link && (
                  <a
                    href={acara[0].maps_link}
                    className={`${styles.btn} ${styles.btnLight}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Maps
                  </a>
                )}
              </motion.div>
            )}

            {acara?.[1] && (
              <motion.div className={`${styles.card} ${styles.cardGradient}`} variants={fadeRight}>
                <h3 className={`${styles.h3} ${styles.cardTitle}`}>{acara[1].nama}</h3>
                <p className={styles.lead}>
                  {fmtTanggalLocale(toDateSafe(acara[1].tanggal), data?.i18n?.locale || 'id-ID')}
                </p>
                <p className={styles.mb8}>{acara[1].waktu}</p>
                <p className={`${styles.muted} ${styles.mb4}`}>{acara[1].lokasi}</p>
                <p className={styles.mb8}>{acara[1].alamat}</p>
                {acara[1].maps_link && (
                  <a
                    href={acara[1].maps_link}
                    className={`${styles.btn} ${styles.btnLight}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Maps
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* ── MAPS ───────────────────────────────────────────────────────── */}
        {!!data?.maps && (
          <motion.section
            id="maps"
            className={styles.section}
            variants={vSection}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.h2 className={styles.h2} variants={vItem}>
              Lokasi
            </motion.h2>
            <motion.div variants={zoomIn} className={styles.mapWrap}>
              <Maps data={data.maps} />
            </motion.div>
          </motion.section>
        )}

        {/* ── STORY ──────────────────────────────────────────────────────── */}
        {!!data?.our_story && (
          <motion.section
            id="our-story"
            className={styles.section}
            variants={vSection}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.h2 className={styles.h2} variants={vItem}>
              Our Love Story
            </motion.h2>
            <motion.div variants={vItem}>
              <OurStory data={data.our_story} />
            </motion.div>
          </motion.section>
        )}

        {/* ── GALLERY ────────────────────────────────────────────────────── */}
        {Array.isArray(data?.galeri) && data.galeri.length > 0 && (
          <motion.section
            id="gallery"
            className={styles.section}
            variants={vSection}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.h2 className={styles.h2} variants={vItem}>
              Wedding Gallery
            </motion.h2>
            <motion.div variants={zoomIn}>
              <Gallery images={data.galeri} />
            </motion.div>
          </motion.section>
        )}

        {/* ── LIVE ───────────────────────────────────────────────────────── */}
        {!!data?.tambahan?.live_streaming && (
          <motion.section
            id="live"
            className={`${styles.section} ${styles.sectionLight}`}
            variants={vSection}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.h2 className={styles.h2} variants={vItem}>
              Live Streaming
            </motion.h2>
            <motion.div variants={zoomIn}>
              <LiveStreaming data={data.tambahan.live_streaming} />
            </motion.div>
          </motion.section>
        )}

        {/* ── GIFT ───────────────────────────────────────────────────────── */}
        {!!data?.gift?.enabled && (
          <motion.section
            id="gift"
            className={styles.section}
            variants={vSection}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.h2 className={styles.h2} variants={vItem}>
              Wedding Gift
            </motion.h2>
            {data.gift?.description && (
              <motion.p
                className={`${styles.muted} ${styles.center} ${styles.mb12}`}
                variants={vItem}
              >
                {data.gift.description}
              </motion.p>
            )}

            <div className={styles.grid2}>
              {data.gift.bank_accounts?.map((account, idx) => (
                <motion.div
                  key={idx}
                  className={`${styles.card} ${styles.cardSolid}`}
                  variants={zoomIn}
                >
                  {account.logo && (
                    <Image
                      src={account.logo}
                      alt={account.bank || 'Bank'}
                      width={64}
                      height={64}
                      className={styles.bankLogo}
                    />
                  )}
                  <h3 className={styles.h3}>{account.bank}</h3>
                  <p className={styles.lead}>{account.nomor}</p>
                  <p className={styles.mb8}>a.n. {account.atas_nama}</p>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => navigator.clipboard?.writeText(account.nomor)}
                  >
                    Salin
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── GIFT CONFIRM ──────────────────────────────────────────────── */}
        {!!data?.gift?.enabled && (
          <motion.section
            id="gift-confirm"
            className={styles.section}
            variants={vSection}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.h2 className={styles.h2} variants={vItem}>
              Konfirmasi Hadiah
            </motion.h2>
            <motion.p
              className={`${styles.muted} ${styles.center} ${styles.mb8}`}
              variants={vItem}
            >
              Jika Anda telah mengirimkan hadiah, mohon konfirmasi di bawah ini.
            </motion.p>
            <motion.div className={`${styles.card} ${styles.cardSolid}`} variants={zoomIn}>
              <GiftConfirmation slug={data.slug} />
            </motion.div>
          </motion.section>
        )}

        {/* ── WISHES ─────────────────────────────────────────────────────── */}
        {!data?.privacy?.hideGuestbook && (
          <motion.section
            id="wishes"
            className={`${styles.section} ${styles.sectionLight}`}
            variants={vSection}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.h2 className={styles.h2} variants={vItem}>
              Ucapan & Harapan
            </motion.h2>
            <motion.p
              className={`${styles.muted} ${styles.center} ${styles.mb12}`}
              variants={vItem}
            >
              Berikan ucapan dan harapan terbaik Anda untuk kedua mempelai
            </motion.p>
            <motion.div variants={zoomIn}>
              <WeddingWishes slug={data.slug} />
            </motion.div>
          </motion.section>
        )}

        {/* ── RSVP ───────────────────────────────────────────────────────── */}
        {!data?.privacy?.hideRSVP && (
          <motion.section
            id="rsvp"
            className={styles.section}
            variants={vSection}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.h2 className={styles.h2} variants={vItem}>
              Konfirmasi Kehadiran
            </motion.h2>
            <motion.p
              className={`${styles.muted} ${styles.center} ${styles.mb12}`}
              variants={vItem}
            >
              Mohon konfirmasi kehadiran Anda
            </motion.p>
            <motion.div variants={zoomIn}>
              <RSVPForm slug={data.slug} namaTamu={guestName || undefined} />
            </motion.div>
          </motion.section>
        )}

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <motion.footer
          id="footer"
          className={`${styles.section} ${styles.sectionLight}`}
          variants={vSection}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.p
            className={`${styles.muted} ${styles.center} ${styles.mb12}`}
            variants={vItem}
          >
            Merupakan suatu kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir dan
            memberikan doa restu
          </motion.p>
          <motion.h3 className={styles.h3} variants={vItem}>
            Kami Yang Berbahagia,
          </motion.h3>
          <motion.h4 className={styles.h2} variants={vItem}>
            {mempelai?.pria} &amp; {mempelai?.wanita}
          </motion.h4>
          <motion.div className={styles.social} variants={vItem}>
            {data?.tambahan?.instagram && (
              <a
                href={data.tambahan.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram" />
              </a>
            )}
            {data?.tambahan?.whatsapp && (
              <a
                href={data.tambahan.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <i className="fab fa-whatsapp" />
              </a>
            )}
          </motion.div>
          <motion.p className={`${styles.muted} ${styles.center}`} variants={vItem}>
            © {new Date().getFullYear()} {data?.tambahan?.credit || 'Dreamslink'}. All Rights
            Reserved.
          </motion.p>
        </motion.footer>
      </div>
    </TwoColumnLayout>
  );
}
