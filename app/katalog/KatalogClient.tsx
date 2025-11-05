"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type SortKey = "popular" | "price-low" | "price-high" | "name";

export default function KatalogClient({ initialCategory }: { initialCategory: string }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("popular");
  const [showPremiumOnly, setShowPremiumOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 🧠 Fetch data dari database
  useEffect(() => {
    async function loadTemplates() {
      try {
        setLoading(true);
        const res = await fetch("/api/templates?public=1");
        const data = await res.json();
        if (data.ok) setTemplates(data.templates);
        else console.error("Gagal ambil template:", data.message);
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  // 🔍 Filter & Sort
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (t) =>
          t.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          t.slug?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      );
    }

    if (showPremiumOnly) filtered = filtered.filter((t) => t.isPremium);

    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [templates, selectedCategory, searchQuery, sortBy, showPremiumOnly]);

  const formatIDR = (n: number) => new Intl.NumberFormat("id-ID").format(Number(n || 0));

  const handleTemplatePreview = (slug: string) => window.open(`/preview/${slug}`, "_blank");
  const handleSelectTemplate = (slug: string) =>
    (window.location.href = `/buat-undangan?template=${slug}`);

  return (
    <>
      <Header />

      {/* 🌄 HERO */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/bg_wave.svg')] bg-cover opacity-10" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Jelajahi Template Undangan Digital
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10">
            Pilih gaya undangan impianmu, lihat preview langsung, dan buat undanganmu dalam hitungan menit.
          </p>

          {/* 🔍 Search */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-full shadow focus:ring-4 focus:ring-blue-300 focus:outline-none"
              placeholder="Cari template berdasarkan nama, kategori, atau gaya..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* 🧭 FILTERS */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-wrap gap-3">
            <button
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedCategory("all")}
            >
              Semua
            </button>

            {[...new Set(templates.map((t) => t.category || "Lainnya"))].map((cat) => (
              <button
                key={cat}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
            >
              <option value="popular">Paling Populer</option>
              <option value="price-low">Harga Termurah</option>
              <option value="price-high">Harga Termahal</option>
              <option value="name">Nama A-Z</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                className="accent-blue-600"
              />
              Premium
            </label>
          </div>
        </div>
      </section>

      {/* 🎨 GRID TEMPLATE */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="text-center text-gray-400 py-20">⏳ Memuat template...</div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTemplates.map((template) => (
                <div
                  key={template._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* 🖼️ Thumbnail */}
                  <div className="relative">
                    <img
                      src={template.thumbnail || "/images/bg_couple.jpg"}
                      alt={template.name}
                      className="w-full h-[420px] object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      style={{ aspectRatio: "9/16" }}
                      onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/images/bg_couple.jpg")}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {template.isPremium && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded font-semibold">
                          Premium
                        </span>
                      )}
                    </div>

                    {/* Overlay Buttons */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleTemplatePreview(template.slug)}
                          className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
                        >
                          👁 Lihat
                        </button>
                        <button
                          onClick={() => handleSelectTemplate(template.slug)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                        >
                          ✓ Pilih
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {template.price > 0 ? `Rp ${formatIDR(template.price)}` : "Gratis"}
                      </span>
                      <button
                        onClick={() => handleTemplatePreview(template.slug)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                      >
                        Preview →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <div className="text-6xl mb-4">🕊</div>
              <h3 className="text-2xl font-bold mb-2">Tidak Ada Template Ditemukan</h3>
              <p className="text-gray-600 mb-6">Coba ubah filter pencarian atau kategori lainnya.</p>
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setShowPremiumOnly(false);
                }}
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ✨ CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
            Siap Buat Undangan Digital Impianmu?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Pilih template favoritmu dan mulai kustomisasi sesuai gaya unikmu.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/buat-undangan"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition"
            >
              ✨ Mulai Sekarang
            </Link>
            <Link
              href="/paket"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition"
            >
              💎 Lihat Paket
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
