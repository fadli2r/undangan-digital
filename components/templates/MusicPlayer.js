import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function MusicPlayer({ musik }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio when component mounts
    if (musik?.enabled && musik?.url) {
      audioRef.current = new Audio(musik.url);
      audioRef.current.loop = true;

      // Set initial play state based on autoplay setting
      if (musik.autoplay) {
        // Try to autoplay
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              // Autoplay was prevented, keep it paused
              setIsPlaying(false);
            });
        }
      }
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [musik]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!musik?.enabled || !musik?.url) return null;

  return (
    <button
      onClick={togglePlay}
      className={`fixed bottom-4 right-4 z-50 p-3 rounded-full bg-white/80 shadow-lg hover:bg-white transition-all duration-300 ${
        isPlaying ? 'animate-spin-slow' : ''
      }`}
      title={isPlaying ? 'Pause Music' : 'Play Music'}
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
        className={`${isPlaying ? 'text-blue-600' : 'text-gray-600'}`}
      >
        {isPlaying ? (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="M10 15V9l5 3-5 3z" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="10" />
            <line x1="10" y1="15" x2="10" y2="9" />
            <line x1="14" y1="15" x2="14" y2="9" />
          </>
        )}
      </svg>
    </button>
  );
}
