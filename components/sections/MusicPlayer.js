// components/sections/MusicPlayer.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * musik prop (object) yang diharapkan:
 * {
 *   enabled: true,
 *   type: 'youtube' | 'db',      // default 'db'
 *   url: 'https://...mp3' | 'https://youtu.be/... | https://youtube.com/watch?v=... | <videoId>',
 *   autoplay: true               // default true
 * }
 */

// --- util: ekstrak videoId dari berbagai bentuk URL/ID YouTube
function extractYouTubeId(input = '') {
  if (!input) return '';
  if (/^[a-zA-Z0-9_-]{10,}$/.test(input) && !input.includes('http')) return input;
  try {
    const u = new URL(input);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.replace('/', '').split('?')[0];
    }
    const v = u.searchParams.get('v');
    if (v) return v;
    const seg = u.pathname.split('/').filter(Boolean);
    const i = seg.findIndex((s) => s === 'embed');
    if (i >= 0 && seg[i + 1]) return seg[i + 1];
  } catch {
    // bukan URL, abaikan
  }
  return '';
}

export default function MusicPlayer({ musik }) {
  const enabled = !!musik?.enabled;
  const mode = (musik?.type || 'db').toLowerCase(); // 'db' | 'youtube'
  const src = musik?.url || '';
  const autoPlay = musik?.autoplay !== false; // default true

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false); // sudah sukses start (muted) saat mount

  // DB (MP3) refs
  const audioRef = useRef(null);

  // YT refs
  const iframeRef = useRef(null);
  const videoId = useMemo(() => (mode === 'youtube' ? extractYouTubeId(src) : ''), [mode, src]);

  // ---- restore preferensi user
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('music_on') : null;
    if (saved === '1') {
      setMuted(false);
      setPlaying(true);
    }
  }, []);

  // ---- autoplay muted saat mount (patuh kebijakan browser)
  useEffect(() => {
    if (!enabled || !autoPlay) return;

    if (mode === 'db') {
      const audio = audioRef.current;
      if (!audio) return;

      // Set proper attributes for autoplay muted
      audio.muted = true;
      audio.loop = true;
      audio.preload = 'auto';
      audio.playsInline = true;
      audio.volume = 0.7;

      audio.play()
        .then(() => {
          setReady(true);
          setPlaying(true); // playing namun muted
        })
        .catch(() => {
          setReady(false);  // nunggu gesture user
          setPlaying(false);
        });
    } else if (mode === 'youtube' && videoId) {
      // Untuk YouTube, autoplay muted lewat query param di src.
      // Tandai ready setelah sedikit delay (iframe load).
      const t = setTimeout(() => setReady(true), 600);
      return () => clearTimeout(t);
    }
  }, [enabled, autoPlay, mode, videoId]);

  // ---- dengar event 'invite-opened' (klik Buka Undangan) → unmute + play
  useEffect(() => {
    const handler = () => {
      unmuteAndPlay();
    };
    window.addEventListener('invite-opened', handler);
    return () => window.removeEventListener('invite-opened', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, videoId]);

  // ---- helpers kontrol
  const postYT = (func, args = []) =>
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*'
    );

  const unmuteAndPlay = async () => {
    if (!enabled) return;

    if (mode === 'db') {
      const audio = audioRef.current;
      if (!audio) return;
      try {
        audio.muted = false;
        setMuted(false);
        await audio.play();
        setPlaying(true);
        localStorage.setItem('music_on', '1');
      } catch {
        // user must click button fallback
      }
    } else if (mode === 'youtube' && videoId) {
      try {
        postYT('unMute');
        postYT('playVideo');
        setMuted(false);
        setPlaying(true);
        localStorage.setItem('music_on', '1');
      } catch {
        // fallback ke tombol
      }
    }
  };

  const togglePlay = async () => {
    if (!enabled) return;

    if (mode === 'db') {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        await audio.play();
        setPlaying(true);
        localStorage.setItem('music_on', '1');
      } else {
        audio.pause();
        setPlaying(false);
        localStorage.setItem('music_on', '0');
      }
    } else if (mode === 'youtube' && videoId) {
      if (playing) {
        postYT('pauseVideo');
        setPlaying(false);
        localStorage.setItem('music_on', '0');
      } else {
        // saat play dari berhenti, sekalian unmute agar terdengar
        postYT('unMute');
        postYT('playVideo');
        setMuted(false);
        setPlaying(true);
        localStorage.setItem('music_on', '1');
      }
    }
  };

  // klik tombol utama: jika belum play atau masih muted → unmute+play, kalau sudah → toggle
  const handlePrimary = async () => {
    if (muted || !playing) return unmuteAndPlay();
    return togglePlay();
  };

  if (!enabled || !src) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* --- DB (MP3) player tersembunyi --- */}
      {mode === 'db' && (
        <audio ref={audioRef} src={src} loop preload="auto" playsInline />
      )}

      {/* --- YouTube iframe hidden (autoplay muted) --- */}
      {mode === 'youtube' && videoId && (
        <iframe
          ref={iframeRef}
          width="0"
          height="0"
          style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&mute=1&loop=1&playlist=${videoId}&controls=0&playsinline=1&enablejsapi=1`}
          title="bgm"
          frameBorder="0"
          allow="autoplay"
        />
      )}

      {/* Tombol kontrol (Play/Pause) */}
      <button
        onClick={handlePrimary}
        className={`p-3 rounded-full bg-white/80 shadow-lg hover:bg-white transition-all duration-300 ${
          playing && !muted ? 'animate-spin-slow' : ''
        }`}
        title={playing && !muted ? 'Pause Music' : 'Play Music'}
        aria-label="music-toggle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${playing && !muted ? 'text-blue-600' : 'text-gray-600'}`}
        >
          {playing && !muted ? (
            // ikon "pause" di dalam lingkaran
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="10" y1="15" x2="10" y2="9" />
              <line x1="14" y1="15" x2="14" y2="9" />
            </>
          ) : (
            // ikon "play" di dalam lingkaran
            <>
              <circle cx="12" cy="12" r="10" />
              <path d="M10 9l5 3-5 3z" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
