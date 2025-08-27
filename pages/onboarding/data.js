import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UserLayout from "@/components/layouts/UserLayout";

export default function OnboardingData() {
  const router = useRouter();
  const [form, setForm] = useState({
    pria: "",
    wanita: "",
    phone: "",
    tanggal: "",
    lokasi: "",
    domain: "",
    useCustomDomain: false,
    referral: "",
    oneTree: false,
  });

  const [paket, setPaket] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("onboardingData");
    if (!saved) return router.push("/onboarding");

    const parsed = JSON.parse(saved);
    if (!parsed.packageId) return router.push("/onboarding");

    setForm((prev) => ({ ...prev, ...parsed }));

    fetch(`/api/paket/detail?id=${parsed.packageId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.paket) setPaket(data.paket);
        else router.push("/onboarding");
      });
  }, [router]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    localStorage.setItem("onboardingData", JSON.stringify(form));
    router.push("/onboarding/summary");
  };

  const formatCurrency = (val) => `Rp ${val?.toLocaleString("id-ID") || "0"}`;

  const hargaPaket = paket?.finalPrice || 0;
  const hargaDomain = form.useCustomDomain ? 300000 : 0;
  const hargaDonasi = form.oneTree ? 10000 : 0;
  const total = hargaPaket + hargaDomain + hargaDonasi;

  return (
    <UserLayout>
      <div className="container py-10">
        <div className="row g-5 g-xl-10">
          {/* Form Data Kiri */}
          <div className="col-xl-8">
            <div className="card card-flush mb-5">
              <div className="card-header">
                <div className="card-title">
                  <h3 className="fw-bold">Data Mempelai</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="mb-5">
                  <label className="form-label">Nama Mempelai Pria</label>
                  <input
                    className="form-control"
                    value={form.pria}
                    onChange={(e) => handleChange("pria", e.target.value)}
                    placeholder="Contoh: Yoga Nur Hafid"
                  />
                </div>
                <div className="mb-5">
                  <label className="form-label">Nama Mempelai Wanita</label>
                  <input
                    className="form-control"
                    value={form.wanita}
                    onChange={(e) => handleChange("wanita", e.target.value)}
                    placeholder="Contoh: Putri Aulia"
                  />
                </div>
                <div className="mb-5">
                  <label className="form-label">Nomor Telepon</label>
                  <input
                    className="form-control"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+62..."
                  />
                </div>
                <div className="mb-5">
                  <label className="form-label">Tanggal dan Waktu Pernikahan</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form.tanggal}
                    onChange={(e) => handleChange("tanggal", e.target.value)}
                  />
                </div>
                <div className="mb-5">
                  <label className="form-label">Lokasi Acara</label>
                  <input
                    className="form-control"
                    value={form.lokasi}
                    onChange={(e) => handleChange("lokasi", e.target.value)}
                    placeholder="Contoh: Jakarta Convention Center"
                  />
                </div>
              </div>
            </div>

            {/* Domain */}
            <div className="card card-flush mb-5">
              <div className="card-header">
                <div className="card-title">
                  <h3 className="fw-bold">Domain</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="mb-5">
                  <label className="form-label">Nama Domain</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      value={form.domain}
                      onChange={(e) => handleChange("domain", e.target.value)}
                      placeholder="nama-kamu"
                    />
                    <span className="input-group-text">.viding.co</span>
                  </div>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="useCustomDomain"
                    checked={form.useCustomDomain}
                    onChange={(e) => handleChange("useCustomDomain", e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="useCustomDomain">
                    Gunakan custom domain (contoh: .com) – Tambah Rp300.000
                  </label>
                </div>
              </div>
            </div>

            {/* Referral */}
            <div className="card card-flush mb-5">
              <div className="card-header">
                <div className="card-title">
                  <h3 className="fw-bold">Kode Referral</h3>
                </div>
              </div>
              <div className="card-body">
                <input
                  className="form-control"
                  value={form.referral}
                  onChange={(e) => handleChange("referral", e.target.value)}
                  placeholder="Masukkan kode referral jika ada"
                />
              </div>
            </div>

            {/* One Tree Campaign */}
            <div className="card card-flush mb-5">
              <div className="card-body">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="oneTree"
                    checked={form.oneTree}
                    onChange={(e) => handleChange("oneTree", e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="oneTree">
                    Saya ingin berdonasi Rp10.000 untuk kampanye pohon "One Wedding One Tree" 🌱
                  </label>
                </div>
              </div>
            </div>

            {/* Tombol Navigasi */}
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-light"
                onClick={() => router.push("/onboarding")}
              >
                ← Kembali
              </button>
              <button className="btn btn-primary" onClick={handleNext}>
                Lanjutkan Pembayaran →
              </button>
            </div>
          </div>

          {/* Ringkasan Pesanan */}
          <div className="col-xl-4">
            <div className="card card-flush sticky-top">
              <div className="card-header">
                <div className="card-title">
                  <h3 className="fw-bold">Rincian Pembayaran</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <span>Paket</span>
                  <span>{formatCurrency(hargaPaket)}</span>
                </div>
                {form.useCustomDomain && (
                  <div className="d-flex justify-content-between mb-3">
                    <span>Custom Domain</span>
                    <span>{formatCurrency(hargaDomain)}</span>
                  </div>
                )}
                {form.oneTree && (
                  <div className="d-flex justify-content-between mb-3">
                    <span>Donasi Pohon</span>
                    <span>{formatCurrency(hargaDonasi)}</span>
                  </div>
                )}
                <div className="separator my-4" />
                <div className="d-flex justify-content-between fs-4 fw-bold text-primary">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
