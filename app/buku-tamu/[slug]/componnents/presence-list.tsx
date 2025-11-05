"use client";

import { useEffect, useState } from "react";

type Attendance = {
  name: string;
  jumlah?: number;
  timestamp: string;
  photo?: string; // ✅ tambahkan properti foto
};

export default function PresenceList({ slug }: { slug: string }) {
  const [guests, setGuests] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null); // ✅ modal photo

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/invitation/scanned-guests?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.guests)) {
          setGuests(data.guests);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch attendance list:", err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Memuat daftar hadir...
      </p>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow mt-4 text-gray-500 dark:text-gray-400 text-center">
        Belum ada tamu yang hadir.
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow ring-1 ring-gray-200 dark:ring-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Nama Tamu
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Jumlah
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Waktu Hadir
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                Dokumentasi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {guests.map((g, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {g.name}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {g.jumlah ?? 1}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(g.timestamp).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-2 text-sm text-center">
                  {g.photo ? (
                    <button
                      onClick={() => setSelectedPhoto(g.photo!)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      📷 Lihat Foto
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === Modal Foto === */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Foto Tamu</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-500 hover:text-red-500 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img src={selectedPhoto} alt="Foto Tamu" className="w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
