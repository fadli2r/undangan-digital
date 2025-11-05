"use client";

import { useEffect } from "react";

type Props = {
  guestName: string;
  onFinish: () => void;
};

export default function WelcomeScreen({ guestName, onFinish }: Props) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onFinish();
    }, 5000); // Auto-close after 5s

    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-950 text-center px-6 cursor-pointer"
    >
      <div className="space-y-4 animate-fade-in-up">
        <p className="text-sm text-gray-500 dark:text-gray-400">Selamat Datang</p>
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
          {guestName}
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300">Senang melihatmu di sini 🎉</p>
        <p className="text-xs text-gray-400">(Ketuk layar untuk melanjutkan)</p>
      </div>

      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
