"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

type InvitationItem = {
  id: string;
  slug: string;
  name: string;
  tema: string;
  tanggal: string;
  thumbnail: string;
};

export default function PortofolioClient({
  initialCategory,
}: {
  initialCategory: string;
}) {
  const [undangan, setUndangan] = useState<InvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/portofolio/list");
        const json = await res.json();
        if (json.ok) setUndangan(json.data);
      } catch (e) {
        console.error("Error loading portofolio:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Ambil daftar tema unik untuk filter kategori
  const categories = useMemo(() => {
    const unique = Array.from(new Set(undangan.map((u) => u.tema || "Lainnya")));
    return ["all", ...unique];
  }, [undangan]);

  const filtered = useMemo(() => {
    let list = [...undangan];

    if (selectedCategory && selectedCategory !== "all") {
      list = list.filter((u) => u.tema === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.tema.toLowerCase().includes(q)
      );
    }

    return list;
  }, [undangan, selectedCategory, searchQuery]);

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
          <div className="absolute inset-0 bg-black opacity-10" />
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Portofolio Undangan
            </h1>
            <p className="text-xl text-blue-100 mb-12">
              Lihat undangan digital dari pasangan yang telah menggunakan
              Dreamslink 💕
            </p>

            {/* Search Bar */}
            <div className="flex justify-center mb-12">
              <div className="relative w-full max-w-lg">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Cari berdasarkan nama mempelai atau tema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {undangan.length}
                </div>
                <div className="text-blue-100 text-sm md:text-base">
                  Undangan Publik
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {categories.length - 1}
                </div>
                <div className="text-blue-100 text-sm md:text-base">
                  Tema Berbeda
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-100 text-sm md:text-base">
                  Online Access
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">∞</div>
                <div className="text-blue-100 text-sm md:text-base">
                  Inspirasi
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              Pilih Tema
            </h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-300 ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === "all" ? "Semua" : cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid Undangan */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            {filtered.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                  >
                    {/* Thumbnail */}
                    <div className="relative">
                     <img
  src={item.thumbnail}
  alt={item.name}
  className="w-full h-64 object-cover"
  onError={(e) => {
    e.currentTarget.src = "/images/bg_couple.jpg";
  }}
/>

                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          href={`/${item.slug}`}
                          target="_blank"
                          className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                        >
                          👁️ Lihat Undangan
                        </Link>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6 text-center">
                      <h5 className="text-lg font-bold text-gray-900 mb-2">
                        {item.name}
                      </h5>
                      <p className="text-gray-600 text-sm">{item.tema}</p>
                      {item.tanggal && (
                        <div className="text-sm text-gray-500 mt-2">
                          📅 {item.tanggal}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl text-gray-300 mb-6">💍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Tidak Ada Undangan
                </h3>
                <p className="text-gray-600">
                  Coba ubah filter tema atau pencarian
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
