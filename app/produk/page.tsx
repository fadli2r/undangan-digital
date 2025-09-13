// app/produk/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

type Billing = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number; // base price per bulan
  popular?: boolean;
  ctaHref: string;
  features: string[];
  limits: {
    templates: number | "unlimited";
    storageGB?: number | "unlimited";
  };
};

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Untuk kebutuhan sederhana & sekali pakai",
    monthlyPrice: 50_000,
    ctaHref: "/paket?package=basic",
    features: [
      "1 Template Premium",
      "Custom Teks & Warna",
      "Link Sharing",
      "Undangan Responsif (Mobile-Friendly)",
    ],
    limits: { templates: 1, storageGB: 1 },
  },
  {
    id: "premium",
    name: "Premium",
    description: "Paling populer untuk pasangan yang ingin lengkap",
    monthlyPrice: 99_000,
    popular: true,
    ctaHref: "/paket?package=premium",
    features: [
      "5 Template Premium",
      "Galeri Foto & Video",
      "RSVP & Guest List",
      "Custom Domain *.undanganku.id",
      "Support Prioritas 24/7",
    ],
    limits: { templates: 5, storageGB: 10 },
  },
  {
    id: "pro",
    name: "Pro",
    description: "Untuk vendor EO / percetakan & power users",
    monthlyPrice: 199_000,
    ctaHref: "/paket?package=pro",
    features: [
      "Semua fitur Premium",
      "Template Library Tak Terbatas",
      "Team Collaboration (3 user)",
      "A/B Preview & Versioning",
      "Reminders via WhatsApp",
    ],
    limits: { templates: "unlimited", storageGB: 50 },
  },
];

const COMPARISON_FEATURES = [
  { key: "templates", label: "Jumlah Template" },
  { key: "gallery", label: "Galeri Foto & Video" },
  { key: "rsvp", label: "RSVP & Guest List" },
  { key: "domain", label: "Custom Domain" },
  { key: "support", label: "Support" },
  { key: "team", label: "Kolaborasi Tim" },
  { key: "reminders", label: "Pengingat WhatsApp" },
] as const;

const PLAN_FEATURE_MATRIX: Record<
  typeof COMPARISON_FEATURES[number]["key"],
  Record<Plan["id"], string | boolean | number>
> = {
  templates: { basic: 1, premium: 5, pro: Infinity },
  gallery:   { basic: false, premium: true, pro: true },
  rsvp:      { basic: false, premium: true, pro: true },
  domain:    { basic: "—", premium: "*.undanganku.id", pro: "Custom Domain" },
  support:   { basic: "Standar", premium: "Prioritas", pro: "Prioritas+" },
  team:      { basic: "—", premium: "—", pro: "3 user" },
  reminders: { basic: "—", premium: "—", pro: "Tersedia" },
};

const faqs = [
  {
    q: "Apakah bisa upgrade/downgrade paket?",
    a: "Bisa kapan saja. Perbedaan biaya akan dihitung prorata pada siklus berikutnya.",
  },
  {
    q: "Apa bedanya bulanan dan tahunan?",
    a: "Paket tahunan hemat 20% dibanding bayar per bulan, dan Anda tetap bisa upgrade kapan pun.",
  },
  {
    q: "Apakah ada garansi uang kembali?",
    a: "Ada garansi 7 hari untuk pelanggan baru jika tidak sesuai kebutuhan.",
  },
];

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID").format(Math.round(n));

export default function ProdukPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  const priceWithBilling = (monthly: number) => {
    if (billing === "monthly") return monthly;
    // diskon 20% untuk tahunan (12 bulan)
    const yearly = monthly * 12 * 0.8;
    return yearly;
  };

  const billingNote = useMemo(
    () =>
      billing === "monthly"
        ? "Tagihan per bulan • Bisa berhenti kapan saja"
        : "Tagihan per tahun (hemat 20%)",
    [billing]
  );

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Paket & Harga</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Pilih paket terbaik untuk undangan digital Anda. Fleksibel, terjangkau, dan kaya fitur.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-full p-2">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  billing === "monthly" ? "bg-white text-blue-700" : "text-white hover:bg-white/20"
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition relative ${
                  billing === "yearly" ? "bg-white text-blue-700" : "text-white hover:bg-white/20"
                }`}
              >
                Tahunan
                <span className="ml-2 hidden sm:inline-block text-xs font-bold text-emerald-600">
                  Hemat 20%
                </span>
              </button>
            </div>

            <div className="mt-3 text-blue-100 text-sm">{billingNote}</div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const price = priceWithBilling(plan.monthlyPrice);
              const isYearly = billing === "yearly";
              const priceLabel = isYearly
                ? `Rp ${formatIDR(price)} / thn`
                : `Rp ${formatIDR(price)} / bln`;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border ${
                    plan.popular ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        PALING POPULER
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-gray-600 mt-2">{plan.description}</p>

                    <div className="mt-6">
                      <div className="text-3xl font-extrabold text-blue-600">{priceLabel}</div>
                      {isYearly && (
                        <div className="text-xs text-gray-500 mt-1">
                          Setara Rp {formatIDR(plan.monthlyPrice)} / bln
                        </div>
                      )}
                    </div>

                    <ul className="mt-6 space-y-3">
                      {plan.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✅</span>
                          <span className="text-gray-700">{f}</span>
                        </li>
                      ))}
                      {"storageGB" in plan.limits && (
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✅</span>
                          <span className="text-gray-700">
                            Penyimpanan{" "}
                            {plan.limits.storageGB === "unlimited"
                              ? "Tak Terbatas"
                              : `${plan.limits.storageGB} GB`}
                          </span>
                        </li>
                      )}
                    </ul>

                    <Link
                      href={plan.ctaHref}
                      className={`mt-8 block w-full text-center px-5 py-3 rounded-lg font-semibold transition ${
                        plan.popular
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      Pilih {plan.name}
                    </Link>

                    <div className="mt-3 text-xs text-gray-500">
                      {plan.limits.templates === "unlimited"
                        ? "Template tak terbatas"
                        : `${plan.limits.templates} template premium`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Note kecil */}
          <div className="text-center text-gray-500 text-sm mt-8">
            Harga sudah termasuk akses editor, hosting undangan, dan update fitur berkala.
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            Bandingkan Paket
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-700 font-semibold">Fitur</th>
                  {PLANS.map((p) => (
                    <th key={p.id} className="px-4 py-3 text-gray-700 font-semibold">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row) => (
                  <tr key={row.key} className="border-t">
                    <td className="px-4 py-3 text-gray-700">{row.label}</td>
                    {PLANS.map((p) => {
                      const val = PLAN_FEATURE_MATRIX[row.key][p.id as keyof typeof PLAN_FEATURE_MATRIX[typeof row.key]];
                      const content =
                        typeof val === "boolean"
                          ? val
                            ? "✅"
                            : "—"
                          : val === Infinity
                          ? "Tak Terbatas"
                          : String(val);
                      return (
                        <td key={p.id} className="px-4 py-3 text-center text-gray-800">
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-6">
            <Link
              href="/katalog"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Lihat Koleksi Template →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Pertanyaan Umum</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-4 open:shadow-md transition"
              >
                <summary className="cursor-pointer font-semibold text-gray-900">
                  {f.q}
                </summary>
                <p className="text-gray-600 mt-2">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/kontak"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Butuh bantuan memilih paket? Hubungi kami
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Memulai?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Pilih paket favorit dan mulai buat undangan pernikahan digital impian Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/paket?package=premium"
              className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold transition"
            >
              Pilih Paket Premium
            </Link>
            <Link
              href="/katalog"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-full font-semibold transition"
            >
              Jelajahi Template
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
