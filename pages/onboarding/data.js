import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UserLayout from "../../components/layouts/UserLayout";
import OnboardingStepper from "../../components/onboarding/OnboardingStepper";

// helper: sanitasi slug
function toSlug(raw) {
  return String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function OnboardingData() {
  const router = useRouter();

  const [form, setForm] = useState({
    pria: "",
    wanita: "",
    phone: "",
    tanggal: "",
    lokasi: "",
    domain: "",           // input mentah user
    slug: "",             // slug hasil sanitasi dari domain
    useCustomDomain: false,
    referral: "",
    oneTree: false,
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("onboardingData") || "{}");
    if (!saved?.packageId) {
      router.replace("/onboarding");
      return;
    }

    const domainRaw = saved.domain || "";
    const slugClean = saved.slug ? toSlug(saved.slug) : toSlug(domainRaw);

    setForm((prev) => ({
      ...prev,
      pria: saved.pria || "",
      wanita: saved.wanita || "",
      phone: saved.phone || "",
      tanggal: saved.tanggal || "",
      lokasi: saved.lokasi || "",
      domain: domainRaw,
      slug: slugClean,
      useCustomDomain: !!saved.useCustomDomain,
      referral: saved.referral || "",
      oneTree: !!saved.oneTree,
    }));
  }, [router]);

  const handleChange = (k, v) => {
    // jika user mengubah "domain", auto-sinkron ke "slug"
    if (k === "domain") {
      const nextDomain = v;
      const nextSlug = toSlug(nextDomain);
      setForm((s) => ({ ...s, domain: nextDomain, slug: nextSlug }));
      return;
    }
    // jika suatu saat kamu tampilkan input slug terpisah, ini tetap aman
    if (k === "slug") {
      setForm((s) => ({ ...s, slug: toSlug(v) }));
      return;
    }
    setForm((s) => ({ ...s, [k]: v }));
  };

  const handleNext = async () => {
    const saved = JSON.parse(localStorage.getItem("onboardingData") || "{}");
    const next = { ...saved, ...form, slug: toSlug(form.slug || form.domain) };
    localStorage.setItem("onboardingData", JSON.stringify(next));

    try {
      await fetch("/api/onboarding/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 3,
          data: {
            pria: form.pria,
            wanita: form.wanita,
            phone: form.phone,
            tanggal: form.tanggal,
            lokasi: form.lokasi,
            domain: form.domain,
            slug: toSlug(form.slug || form.domain),
            useCustomDomain: form.useCustomDomain,
            referral: form.referral,
            oneTree: form.oneTree,
          },
        }),
      });
    } catch (_) {}

    router.push("/onboarding/summary");
  };

  // Preview URL pakai slug bersih
  const showSlug = toSlug(form.slug || form.domain || "namakamu");
  const domainPreview = form.useCustomDomain
    ? `${showSlug}.dreamslink.id`
    : `dreamslink.id/${showSlug}`;

  return (
    <UserLayout>
      <OnboardingStepper current="data" />

      <div className="row g-5">
        <div className="col-xl-8">
          {/* Card: Data Mempelai */}
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
                />
              </div>
              <div className="mb-5">
                <label className="form-label">Nama Mempelai Wanita</label>
                <input
                  className="form-control"
                  value={form.wanita}
                  onChange={(e) => handleChange("wanita", e.target.value)}
                />
              </div>
              <div className="mb-5">
                <label className="form-label">Nomor Telepon</label>
                <input
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div className="mb-5">
                <label className="form-label">Tanggal & Waktu</label>
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
                />
              </div>
            </div>
          </div>

          {/* Card: Domain */}
          <div className="card card-flush mb-5">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold">Domain (Slug Undangan)</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="mb-5">
                <label className="form-label">Nama (jadi slug)</label>
                <div className="input-group">
                  <input
                    className="form-control"
                    value={form.domain}
                    onChange={(e) => handleChange("domain", e.target.value)}
                    placeholder="misal: fauzan-wulan"
                  />
                  <span className="input-group-text">
                    {form.useCustomDomain ? ".dreamslink.id" : "/"}
                  </span>
                </div>
                <div className="form-text text-muted mt-2">
                  URL undangan akan menjadi: <strong>{domainPreview}</strong>
                </div>
              </div>

              <div className="form-check form-switch">
                <input
                  id="useCustomDomain"
                  className="form-check-input"
                  type="checkbox"
                  checked={form.useCustomDomain}
                  onChange={(e) => handleChange("useCustomDomain", e.target.checked)}
                />
                <label className="form-check-label" htmlFor="useCustomDomain">
                  Gunakan custom domain – Tambah Rp300.000
                </label>
              </div>
            </div>
          </div>

          {/* Card: Referral & Donasi */}
          <div className="card card-flush mb-5">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold">Referral & Donasi</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="mb-5">
                <label className="form-label">Kode Referral</label>
                <input
                  className="form-control"
                  value={form.referral}
                  onChange={(e) => handleChange("referral", e.target.value)}
                />
              </div>
              <div className="form-check">
                <input
                  id="oneTree"
                  className="form-check-input"
                  type="checkbox"
                  checked={form.oneTree}
                  onChange={(e) => handleChange("oneTree", e.target.checked)}
                />
                <label className="form-check-label" htmlFor="oneTree">
                  Donasi Rp10.000 untuk “One Wedding One Tree”
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-between">
            <button className="btn btn-light" onClick={() => router.push("/onboarding")}>
              ← Kembali
            </button>
            <button className="btn btn-primary" onClick={handleNext}>
              Lanjutkan →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-xl-4">
          <div className="alert alert-info">
            Isi data lengkap dan klik <b>Lanjutkan</b> untuk melihat ringkasan & pembayaran.
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
