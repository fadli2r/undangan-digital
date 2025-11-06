// pages/paket.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import UserLayout from "../components/layouts/UserLayout";
import SeoHead from '@/components/SeoHead';

// ---------- helpers ----------
const toArray = (v) => (Array.isArray(v) ? v : []);
const toPrice = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);
const uniq = (arr) => Array.from(new Set(arr));
const COLORS = ["primary", "success", "warning", "info", "danger", "dark"];

const FEATURE_LABELS = {
  "all-custom": "All Custom",
  gift: "Amplop Digital",
  rsvp: "RSVP Digital",
  galeri: "Galeri Foto",
};

function normalizePackage(p) {
  // id
  const _id = p?._id || p?.id || null;

  // harga
  const final = toPrice(p?.finalPrice ?? p?.price);
  let original = p?.originalPrice;
  if (!Number.isFinite(Number(original))) {
    // kalau tidak disediakan, dan ada price lebih tinggi, tampilkan strike
    if (p?.finalPrice != null && p?.price != null && Number(p.finalPrice) < Number(p.price)) {
      original = Number(p.price);
    } else {
      original = null;
    }
  } else {
    original = Number(original);
  }

  // fitur: pakai p.features jika ada; kalau tidak ada, turunkan dari featureKeys + limits
  let features = [];
  if (Array.isArray(p?.features) && p.features.length) {
    features = p.features.map((f) => (typeof f === "string" ? f : f?.name || "")).filter(Boolean);
  } else {
    const keys = toArray(p?.featureKeys).map((k) => FEATURE_LABELS[String(k).toLowerCase()] || k);
    const lim = p?.limits || {};
    const limitsAsFeatures = [];
    if (typeof lim.invitations === "number") limitsAsFeatures.push(`${lim.invitations} Undangan`);
    if (typeof lim.guests === "number") limitsAsFeatures.push(`${lim.guests} Tamu`);
    if (typeof lim.photos === "number") limitsAsFeatures.push(`${lim.photos} Foto`);
    if (Array.isArray(lim.templates) && lim.templates.length) {
      limitsAsFeatures.push(`Template: ${lim.templates.length}+`);
    }
    if (lim.customDomain) limitsAsFeatures.push("Custom Domain");
    if (lim.removeWatermark) limitsAsFeatures.push("Tanpa Watermark");
    if (lim.analytics) limitsAsFeatures.push("Analytics");
    if (lim.priority_support) limitsAsFeatures.push("Priority Support");
    features = uniq([...keys, ...limitsAsFeatures]).filter(Boolean);
  }

  return {
    _id,
    name: p?.name || p?.nama || "-",
    description: p?.description || "",
    price: final,
    originalPrice: original,
    isPopular: !!(p?.isPopular || p?.popular),
    isActive: p?.isActive !== false,
    features: features.slice(0, 8), // tampilkan 8 dulu biar rapi
    slug: p?.slug || "",
    type: p?.type || "fixed",
  };
}

async function fetchPackages() {
  // fallback berurutan supaya tahan banting
  const endpoints = ["/api/packages/list", "/api/paket/list", "/api/packages", "/api/paket"];
  let lastErr = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const ct = res.headers.get("content-type") || "";
      const json = ct.includes("application/json") ? await res.json() : {};
      if (!res.ok) throw new Error(json?.message || `Gagal memuat paket (${res.status})`);

      const raw =
        (Array.isArray(json) && json) ||
        json.packages ||
        json.paket ||
        json.data ||
        Object.values(json).find((v) => Array.isArray(v));
      if (!Array.isArray(raw)) throw new Error("Payload paket tidak valid");

      const list = raw.map(normalizePackage).filter((x) => x._id && x.isActive);
      // urutkan: yang populer dulu, lalu harga termurah
      return list.sort((a, b) => (Number(b.isPopular) - Number(a.isPopular)) || a.price - b.price);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Tidak ada endpoint paket yang tersedia");
}

export default function Paket() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState("");
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchErr("");
      try {
        const list = await fetchPackages();
        if (!cancelled) setPackages(list);
      } catch (e) {
        if (!cancelled) setFetchErr(e.message || "Gagal memuat paket");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session, router]);

  const handlePilihPaket = (p) => {
    // kirim _id sebagai paketId (dipakai di summary)
    router.push(`/paket/summary?paketId=${encodeURIComponent(p._id)}`);
  };

  // Loading & guard
  if (status === "loading" || !session) {
    return (
      <UserLayout>
      <SeoHead
        title="Pilih Paket - Dreamslink"
        description="Pilih paket undangan digital yang sesuai kebutuhan Anda."
        canonical="/paket"
      />
        <div className="d-flex justify-content-center align-items-center min-h-300px">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      {/* Header */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center py-10">
              <h1 className="fs-2hx fw-bold text-gray-900 mb-4">Pilih Paket Undangan</h1>
              <div className="fs-6 text-gray-700">Pilih paket yang sesuai dengan kebutuhan undangan digital Anda</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {fetchErr && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="alert alert-danger d-flex align-items-center p-6">
              <i className="ki-duotone ki-shield-cross fs-2hx text-danger me-3">
                <span className="path1" /><span className="path2" />
              </i>
              <div className="d-flex flex-column">
                <h4 className="mb-1">Gagal memuat paket</h4>
                <span className="text-gray-700">{fetchErr}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <div className="d-flex justify-content-center align-items-center min-h-200px mb-10">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {/* Pricing Cards */}
      {!loading && !fetchErr && (
        <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
          {packages.map((p, idx) => {
            const color = COLORS[idx % COLORS.length];
            const hasStrike = p.originalPrice && p.originalPrice > p.price;
            const discountPct = hasStrike
              ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
              : 0;

            return (
              <div key={p._id} className="col-md-6 col-xl-6">
                <div className={`card h-100 ${p.isPopular ? "border-" + color : ""}`}>
                  {p.isPopular && (
                    <div className="card-header border-0 pt-5 justify-content-center">
                      <span className={`badge badge-${color} fs-7 fw-bold`}>PALING POPULER</span>
                    </div>
                  )}

                  <div className="card-body text-center pt-7 pb-5">
                    {/* Nama Paket */}
                    <span className={`badge badge-light-${color} px-3 py-2 fs-7 fw-bold text-uppercase mb-3`}>
                      {p.name}
                    </span>

                    {/* Harga */}
                    <div className="mb-5">
                      <span className="mb-2 text-primary">Rp</span>
                      <span className="fs-3x fw-bold text-primary">
                        {p.price.toLocaleString("id-ID")}
                      </span>
                      {hasStrike && (
                        <span className="fs-7 text-muted text-decoration-line-through ms-2">
                          Rp {p.originalPrice.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>

                    {/* Diskon */}
                    {discountPct > 0 && (
                      <div className="mb-5">
                        <span className="badge badge-light-danger">Hemat {discountPct}%</span>
                      </div>
                    )}

                    {/* Fitur */}
                    <div className="pt-1">
                      {p.features.map((fitur, i) => (
                        <div key={i} className="d-flex align-items-center mb-5">
                          <span className="fw-semibold fs-6 text-gray-800 flex-grow-1 pe-3">
                            {typeof fitur === "string" ? fitur : fitur?.name || ""}
                          </span>
                          <i className={`ki-duotone ki-check-circle fs-1 text-${color}`}>
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Aksi */}
                  <div className="card-footer d-flex flex-center flex-column">
                    <button
                      onClick={() => handlePilihPaket(p)}
                      className={`btn btn-${color} btn-lg w-100 mb-5`}
                    >
                      Pilih Paket {p.name}
                    </button>
                    <div className="text-sm text-gray-500">Pembayaran aman & terpercaya</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ (tetap) */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-header"><div className="card-title"><h3>Pertanyaan Umum</h3></div></div>
            <div className="card-body">
              <div className="accordion" id="kt_accordion_1">
                <div className="accordion-item">
                  <h2 className="accordion-header" id="kt_accordion_1_header_1">
                    <button className="accordion-button fs-4 fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#kt_accordion_1_body_1" aria-expanded="true" aria-controls="kt_accordion_1_body_1">
                      Bagaimana cara pembayaran?
                    </button>
                  </h2>
                  <div id="kt_accordion_1_body_1" className="accordion-collapse collapse show" aria-labelledby="kt_accordion_1_header_1" data-bs-parent="#kt_accordion_1">
                    <div className="accordion-body">
                      Kami menerima pembayaran melalui transfer bank, e-wallet (OVO, GoPay, DANA), dan kartu kredit. Pembayaran aman dan terpercaya.
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="kt_accordion_1_header_2">
                    <button className="accordion-button fs-4 fw-semibold collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#kt_accordion_1_body_2" aria-expanded="false" aria-controls="kt_accordion_1_body_2">
                      Berapa lama proses pembuatan undangan?
                    </button>
                  </h2>
                  <div id="kt_accordion_1_body_2" className="accordion-collapse collapse" aria-labelledby="kt_accordion_1_header_2" data-bs-parent="#kt_accordion_1">
                    <div className="accordion-body">
                      Setelah pembayaran dikonfirmasi, undangan digital Anda siap dipakai seketika. (Jika sistem auto-create aktif, langsung masuk editor.)
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header" id="kt_accordion_1_header_3">
                    <button className="accordion-button fs-4 fw-semibold collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#kt_accordion_1_body_3" aria-expanded="false" aria-controls="kt_accordion_1_body_3">
                      Apakah bisa revisi setelah jadi?
                    </button>
                  </h2>
                  <div id="kt_accordion_1_body_3" className="accordion-collapse collapse" aria-labelledby="kt_accordion_1_header_3" data-bs-parent="#kt_accordion_1">
                    <div className="accordion-body">
                      Ya, Anda bisa mengubah konten kapan saja dari halaman editor (gratis). Perubahan desain khusus bisa kena biaya tambahan.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="row g-5 g-xl-10">
        <div className="col-12">
          <div className="card bg-light-primary">
            <div className="card-body text-center py-10">
              <i className="ki-duotone ki-message-text-2 fs-3x text-primary mb-5">
                <span className="path1"></span><span className="path2"></span><span className="path3"></span>
              </i>
              <h3 className="text-gray-900 fw-bold mb-3">Butuh Bantuan?</h3>
              <div className="text-gray-700 fw-semibold fs-6 mb-5">
                Tim customer service kami siap membantu Anda 24/7
              </div>
              <a href="https://wa.me/+358113651127" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <i className="ki-duotone ki-message-text fs-2">
                  <span className="path1"></span><span className="path2"></span><span className="path3"></span>
                </i>
                Hubungi WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
