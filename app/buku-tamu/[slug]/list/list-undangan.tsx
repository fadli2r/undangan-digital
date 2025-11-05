"use client";

import { useEffect, useState } from "react";
import BottomNav from "../componnents/BottomNav";

type Guest = {
  name: string;
  kontak?: string;
  invited: boolean;
  status: "present" | "absent";
  jumlah: number;
  timestamp: string | null;
  photo?: string | null;
};

type Summary = {
  totalInvited: number;
  uniquePresent: number;
  totalPresentPeople: number;
  totalAbsent: number;
  manualPresentCount: number;
  manualPresentPeople: number;
};

export default function ListUndangan({ slug }: { slug: string }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const [status, setStatus] = useState<"all" | "present" | "absent">("all");
  const [source, setSource] = useState<"all" | "invited" | "manual">("all");
  const [search, setSearch] = useState("");

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/invitation/attendance?slug=${slug}&status=${status}&source=${source}&search=${encodeURIComponent(
          search
        )}&sort=time_desc&page=1&limit=50`
      );
      const json = await res.json();
      if (json?.items) {
        setGuests(json.items);
        setSummary(json.summary);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [slug, status, source, search]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-1 container mx-auto p-4 mb-28">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          📋 Daftar Tamu
        </h1>

        {/* Ringkasan */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow text-center">
              <p className="text-sm text-gray-500">Total Undangan</p>
              <p className="text-lg font-bold">{summary.totalInvited}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/40 shadow text-center">
              <p className="text-sm text-gray-500">Sudah Hadir</p>
              <p className="text-lg font-bold">{summary.uniquePresent}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/40 shadow text-center">
              <p className="text-sm text-gray-500">Belum Hadir</p>
              <p className="text-lg font-bold">{summary.totalAbsent}</p>
            </div>
          </div>
        )}

        {/* Filter & Search */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">Semua</option>
            <option value="present">Sudah Hadir</option>
            <option value="absent">Belum Hadir</option>
          </select>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value as any)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">Semua Sumber</option>
            <option value="invited">Undangan</option>
            <option value="manual">Manual</option>
          </select>

          <input
            type="text"
            placeholder="Cari nama/kontak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Tabel */}
{loading ? (
  <p className="text-gray-500">Memuat...</p>
) : guests.length === 0 ? (
  <p className="text-gray-500">Tidak ada tamu ditemukan</p>
) : (
  <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
            Nama
          </th>
          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
            Kontak
          </th>
          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
            Status
          </th>
          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
            Jumlah
          </th>
          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
            Waktu
          </th>
          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
            Dokumentasi
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {guests.map((g, idx) => (
          <tr key={idx}>
            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {g.name}
            </td>
            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
              {g.kontak || "-"}
            </td>
            <td className="px-4 py-2 text-sm">
              {g.status === "present" ? (
                <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                  Hadir
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                  Belum Hadir
                </span>
              )}
            </td>
            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              {g.jumlah}
            </td>
            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              {g.timestamp
                ? new Date(g.timestamp).toLocaleString("id-ID")
                : "—"}
            </td>
            <td className="px-4 py-2 text-sm text-center">
              {g.photo ? (
                <button
                  onClick={() => setSelectedPhoto(g.photo!)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  📷 Lihat
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
)}

{/* Modal Foto */}
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

      </div>

      {/* BottomNav */}
      <BottomNav slug={slug} />
    </div>
  );
}
