// app/katalog/KatalogClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  catalogTemplates,
  templateCategories,
  getTemplatesByCategory,
} from "../../data/catalog-templates";

type SortKey = "popular" | "price-low" | "price-high" | "name";

export default function KatalogClient({ initialCategory }: { initialCategory: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("popular");
  const [showPremiumOnly, setShowPremiumOnly] = useState<boolean>(false);

  // Set kategori awal dari URL (?category=...) yang diterima dari server
  useEffect(() => {
    if (!initialCategory) return;
    const found = templateCategories.find(
      (cat: any) => cat.slug.toLowerCase() === initialCategory.toLowerCase()
    );
    if (found) setSelectedCategory(found.slug);
  }, [initialCategory]);

  // Filter + Sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = getTemplatesByCategory(selectedCategory);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t: any) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (showPremiumOnly) {
      filtered = filtered.filter((t: any) => t.isPremium);
    }

    switch (sortBy) {
      case "popular":
        filtered = [...filtered].sort(
          (a: any, b: any) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)
        );
        break;
      case "price-low":
        filtered = [...filtered].sort((a: any, b: any) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a: any, b: any) => b.price - a.price);
        break;
      case "name":
        filtered = [...filtered].sort((a: any, b: any) =>
          a.name.localeCompare(b.name)
        );
        break;
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy, showPremiumOnly]);

  const handleTemplatePreview = (template: any) => {
    window.open(`/preview/${template.slug}`, "_blank");
  };

  const handleSelectTemplate = (template: any) => {
    window.location.href = `/buat-undangan?template=${template.slug}`;
  };

  const formatIDR = (n: number) =>
    new Intl.NumberFormat("id-ID").format(Number(n || 0));

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
          <div className="absolute inset-0 bg-black opacity-10" />
          <div className="max-w-7xl mx-auto px-4" style={{ maxWidth: "1200px" }}>
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Katalog Template Undangan Digital
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-12">
                Pilih dari {catalogTemplates.length}+ template premium yang telah
                dipercaya ribuan pasangan
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
                    placeholder="Cari template berdasarkan nama, kategori, atau deskripsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {catalogTemplates.length}+
                  </div>
                  <div className="text-blue-100 text-sm md:text-base">
                    Template Premium
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {templateCategories.length - 1}
                  </div>
                  <div className="text-blue-100 text-sm md:text-base">
                    Kategori Desain
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    24/7
                  </div>
                  <div className="text-blue-100 text-sm md:text-base">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    ∞
                  </div>
                  <div className="text-blue-100 text-sm md:text-base">Revisi</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4" style={{ maxWidth: "1200px" }}>
            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                Kategori Template
              </h3>
              <div className="flex flex-wrap gap-3">
                {templateCategories.map((category: any) => (
                  <button
                    key={category.slug}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-300 ${
                      selectedCategory === category.slug
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                >
                  <option value="popular">Paling Populer</option>
                  <option value="price-low">Harga Terendah</option>
                  <option value="price-high">Harga Tertinggi</option>
                  <option value="name">Nama A-Z</option>
                </select>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={showPremiumOnly}
                    onChange={(e) => setShowPremiumOnly(e.target.checked)}
                  />
                  Premium Only
                </label>
              </div>

              <div className="text-gray-500 text-sm">
                Menampilkan {filteredTemplates.length} dari{" "}
                {catalogTemplates.length} template
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4" style={{ maxWidth: "1200px" }}>
            {filteredTemplates.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template: any) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                  >
                    {/* Template Image */}
                    <div className="relative">
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5UZW1wbGF0ZSBQcmV2aWV3PC90ZXh0Pjwvc3ZnPg==";
                        }}
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {template.isPopular && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            🔥 Populer
                          </span>
                        )}
                        {template.isPremium && (
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            👑 Premium
                          </span>
                        )}
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          {template.category}
                        </span>
                      </div>

                      {/* Overlay Buttons */}
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-3">
                          <button
                            className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                            onClick={() => handleTemplatePreview(template)}
                          >
                            👁️ Lihat
                          </button>
                          <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                            onClick={() => handleSelectTemplate(template)}
                          >
                            ✓ Pilih
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h5 className="text-lg font-bold text-gray-900 mb-2">
                          {template.name}
                        </h5>
                        <p className="text-gray-600 text-sm">
                          {template.description}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 3).map((feature: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold"
                            >
                              {feature}
                            </span>
                          ))}
                          {template.features.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">
                              +{template.features.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xl font-bold text-blue-600">
                              Rp {formatIDR(template.price)}
                            </span>
                            {template.originalPrice > template.price && (
                              <div className="text-sm text-gray-500 line-through">
                                Rp {formatIDR(template.originalPrice)}
                              </div>
                            )}
                          </div>
                          {template.originalPrice > template.price && (
                            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                              Hemat{" "}
                              {Math.round(
                                ((template.originalPrice - template.price) /
                                  template.originalPrice) *
                                  100
                              )}
                              %
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-semibold hover:bg-gray-200 transition duration-300"
                            onClick={() => handleTemplatePreview(template)}
                          >
                            👁️ Lihat
                          </button>
                          <button
                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition duration-300"
                            onClick={() => handleSelectTemplate(template)}
                          >
                            ✓ Pilih Template
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // No Results
              <div className="text-center py-20">
                <div className="text-6xl text-gray-300 mb-6">📄</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Tidak Ada Template Ditemukan
                </h3>
                <p className="text-gray-600 mb-6">
                  Coba ubah filter pencarian atau kategori yang dipilih
                </p>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
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

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Siap Membuat Undangan Impian Anda?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Pilih template favorit dan mulai customize sesuai keinginan Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/buat-undangan"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition duration-300"
              >
                ✨ Mulai Buat Undangan
              </Link>
              <Link
                href="/paket"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition duration-300"
              >
                💎 Lihat Paket Harga
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
