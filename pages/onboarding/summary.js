import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import UserLayout from "../../components/layouts/UserLayout";
import OnboardingStepper from "../../components/onboarding/OnboardingStepper";
import Swal from "sweetalert2";

// helper: sanitasi slug (backup jika localStorage lama belum punya slug)
function toSlug(raw) {
  return String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function OnboardingSummary() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [data, setData] = useState(null);
  const [paket, setPaket] = useState(null);
  const [promo, setPromo] = useState("");
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const user = session?.user;

  useEffect(() => {
    const onboardingData = localStorage.getItem("onboardingData");
    if (!onboardingData) { router.replace("/onboarding"); return; }
    const parsed = JSON.parse(onboardingData);
    // pastikan ada slug bersih
    const safeSlug = toSlug(parsed.slug || parsed.domain);
    const fixed = { ...parsed, slug: safeSlug };
    setData(fixed);
    // sinkronkan balik (sekalian ngerapihin storage)
    localStorage.setItem("onboardingData", JSON.stringify(fixed));
  }, [router]);

  useEffect(() => {
    if (!data?.packageId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/paket/detail?id=${data.packageId}`);
        const json = await res.json();
        if (!json.paket) throw new Error("Paket tidak ditemukan");
        setPaket(json.paket);
      } catch (e) {
        setError("Gagal memuat paket");
      } finally {
        setLoading(false);
      }
    })();
  }, [data?.packageId]);

  const toIDR = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
async function handleValidateCode(type) {
  if (!paket || !user) {
    Swal.fire({
      icon: "warning",
      title: "Login diperlukan",
      text: "Silakan login terlebih dahulu untuk memvalidasi kode.",
      confirmButtonColor: "#50cd89"
    });
    return;
  }

  const promoCode = type === "promo" ? promo : "";
  const referralCode = type === "referral" ? referral : "";

  try {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.set("id", data.packageId);
    if (promoCode) params.set("promoCode", promoCode);
    if (referralCode) params.set("referralCode", referralCode);
    if (user?.email) params.set("userEmail", user.email);

    const res = await fetch(`/api/paket/detail?${params.toString()}`);
    const result = await res.json();

    if (result.paket) {
      setPaket(result.paket);
      const appliedDiscounts = result.paket.discounts?.filter(d => d.amount > 0) || [];

      if (appliedDiscounts.length > 0) {
        const msg = appliedDiscounts
          .map(
            (d) =>
              `Kode <b>${d.code}</b> berhasil diterapkan! Hemat Rp ${d.amount.toLocaleString("id-ID")}`
          )
          .join("<br>");
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          html: msg,
          confirmButtonColor: "#50cd89"
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Kode tidak valid",
          text: result.message || "Kode promo atau referral tidak dapat digunakan.",
          confirmButtonColor: "#f1416c"
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Kode tidak valid",
        text: result.message || "Kode promo atau referral tidak dapat digunakan.",
        confirmButtonColor: "#f1416c"
      });
    }
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Terjadi kesalahan",
      text: "Gagal memvalidasi kode promo/referral",
      confirmButtonColor: "#f1416c"
    });
  } finally {
    setLoading(false);
  }
}


  const pricing = useMemo(() => {
    const base = Number(paket?.finalPrice ?? paket?.price ?? 0);
    const customDomain = data?.useCustomDomain ? 300000 : 0;
    const donation = data?.oneTree ? 10000 : 0;
    const total = base + customDomain + donation;
    return { base, customDomain, donation, total };
  }, [paket?.finalPrice, paket?.price, data?.useCustomDomain, data?.oneTree]);

 async function handleBayar() {
  if (!paket || !user || !data) return;
  setSubmitting(true);
  setError("");

  const safeSlug = toSlug(data.slug || data.domain);

  // hitung total akhir (sesuai tampilan ringkasan)
  const totalAkhir =
    (paket?.finalPrice ?? paket?.price ?? 0) +
    (data?.useCustomDomain ? 300000 : 0) +
    (data?.oneTree ? 10000 : 0);

  const payload = {
    packageId: paket?._id ?? paket?.id ?? null,
    paket: paket?.slug ?? paket?._id ?? paket?.name ?? null,
    email: user.email,
    name: user.name,

    // kirim total harga agar Xendit invoice sesuai
    amount: totalAkhir,

    onboardingData: {
      pria: data.pria,
      wanita: data.wanita,
      phone: data.phone,
      tanggal: data.tanggal,
      lokasi: data.lokasi,
      domain: data.domain,
      slug: data.domain,
      useCustomDomain: data.useCustomDomain,
      oneTree: data.oneTree,
      referral: referral || data.referral || "",
      promoCode: promo || "",
      fromOnboarding: true,
    },
  };

  try {
    const res = await fetch("/api/payment/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (res.ok && json.invoice_url) {
      // arahkan ke Xendit invoice
      window.location.href = json.invoice_url;
    } else {
      throw new Error(json.message || "Gagal membuat invoice");
    }
  } catch (e) {
    setError(e.message);
    Swal.fire({
      icon: "error",
      title: "Gagal Membuat Invoice",
      text: e.message || "Terjadi kesalahan saat membuat invoice.",
      confirmButtonColor: "#f1416c",
    });
  } finally {
    setSubmitting(false);
  }
}


  if (loading || status === "loading") {
    return (
      <UserLayout>
        <div className="container py-10 text-center">
          <div className="spinner-border text-primary" />
        </div>
      </UserLayout>
    );
  }

  if (!paket || !data) {
    return (
      <UserLayout>
        <div className="container py-10">
          <div className="alert alert-danger">
            Paket tidak ditemukan atau data onboarding hilang.
          </div>
        </div>
      </UserLayout>
    );
  }

  // preview URL pakai slug bersih
  const showSlug = toSlug(data.slug || data.domain || "namakamu");
  const domainPreview = data.useCustomDomain
    ? `${showSlug}.dreamslink.id`
    : `dreamslink.id/${showSlug}`;

  return (
    <UserLayout>
        <OnboardingStepper current="summary" />

        <div className="d-flex flex-wrap align-items-center justify-content-between mb-6">
          <div>
            <h2 className="fw-bold mb-2">Ringkasan Pendaftaran & Pembayaran</h2>
            <div className="text-muted">Silakan cek ulang data dan lanjutkan ke pembayaran.</div>
          </div>
          <div className="d-flex gap-3">
            <button type="button" className="btn btn-light" onClick={() => router.push("/onboarding/data")}>
              Kembali
            </button>
            <button type="button" className="btn btn-success" onClick={handleBayar} disabled={submitting}>
              {submitting ? (<><span className="spinner-border spinner-border-sm me-2" />Memproses...</>) : "Bayar Sekarang"}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center p-5 mb-6">
            <i className="ki-duotone ki-information-5 fs-2hx text-danger me-4">
              <span className="path1"></span><span className="path2"></span>
            </i>
            <div>{error}</div>
          </div>
        )}

        <div className="row g-5">
          <div className="col-xl-8">
            <div className="card mb-5">
              <div className="card-header border-0">
                <h3 className="card-title fw-bold text-gray-800">Data Mempelai & Acara</h3>
              </div>
              <div className="card-body pt-0">
                <div className="row g-6">
                  <div className="col-md-6">
                    <label className="form-label">Mempelai Pria</label>
                    <input className="form-control form-control-solid" value={data.pria || ""} disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mempelai Wanita</label>
                    <input className="form-control form-control-solid" value={data.wanita || ""} disabled />
                  </div>
                </div>
                <div className="row g-6 mt-0">
                  <div className="col-md-6">
                    <label className="form-label">Telepon</label>
                    <input className="form-control form-control-solid" value={data.phone || ""} disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tanggal & Waktu</label>
                    <input className="form-control form-control-solid" value={data.tanggal || "-"} disabled />
                  </div>
                </div>
                <div className="row g-6 mt-0">
                  <div className="col-md-8">
                    <label className="form-label">Lokasi</label>
                    <input className="form-control form-control-solid" value={data.lokasi || "-"} disabled />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Slug/Domain</label>
                    <div className="input-group">
                      <input className="form-control form-control-solid" value={showSlug} disabled />
                      <span className="input-group-text">
                        {data.useCustomDomain ? ".dreamslink.id" : "/"}
                      </span>
                    </div>
                    <div className="form-text mt-1">
                      URL: <b>{domainPreview}</b>
                    </div>
                    {data.useCustomDomain && <div className="form-text text-success">+ Custom Domain</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Kode Promo & Referral */}
            {/* Kode Promo & Referral */}
<div className="card">
  <div className="card-header border-0">
    <h3 className="card-title fw-bold text-gray-800">Kode Promo & Referral</h3>
  </div>

  <div className="card-body pt-0">
    <div className="row g-6">
      {/* ====== PROMO ====== */}
      <div className="col-md-6">
        <label className="form-label">Kode Promo</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-solid"
            value={promo}
            onChange={(e) => setPromo(e.target.value.toUpperCase())}
            placeholder="MASUKKAN KODE (opsional)"
          />
          <button
            type="button"
            className="btn btn-light-primary"
            disabled={!promo || loading}
            onClick={() => handleValidateCode("promo")}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "Validasi"
            )}
          </button>
        </div>

        {paket?.discounts?.find((d) => d.type === "promo" && d.error) && (
          <div className="text-danger fs-7 mt-1">
            {paket.discounts.find((d) => d.type === "promo" && d.error).error}
          </div>
        )}
        {paket?.discounts?.find((d) => d.type === "promo" && d.amount > 0) && (
          <div className="text-success fs-7 mt-1">
            ✅ Hemat Rp{" "}
            {paket.discounts
              .find((d) => d.type === "promo" && d.amount > 0)
              .amount.toLocaleString()}
          </div>
        )}
      </div>

      {/* ====== REFERRAL ====== */}
      <div className="col-md-6">
        <label className="form-label">Kode Referral</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-solid"
            value={referral}
            onChange={(e) => setReferral(e.target.value.toUpperCase())}
            placeholder="MASUKKAN KODE (opsional)"
          />
          <button
            type="button"
            className="btn btn-light-primary"
            disabled={!referral || loading}
            onClick={() => handleValidateCode("referral")}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "Validasi"
            )}
          </button>
        </div>

        {paket?.discounts?.find((d) => d.type === "referral" && d.error) && (
          <div className="text-danger fs-7 mt-1">
            {paket.discounts.find((d) => d.type === "referral" && d.error).error}
          </div>
        )}
        {paket?.discounts?.find((d) => d.type === "referral" && d.amount > 0) && (
          <div className="text-success fs-7 mt-1">
            ✅ Hemat Rp{" "}
            {paket.discounts
              .find((d) => d.type === "referral" && d.amount > 0)
              .amount.toLocaleString()}
          </div>
        )}
      </div>
    </div>

    <div className="form-text mt-3 text-muted">
      * Gunakan tombol Validasi untuk memeriksa kode promo/referral Anda.
    </div>
  </div>
</div>

          </div>

          {/* Ringkasan pembayaran */}
<div className="col-xl-4">
  <div className="card card-flush sticky-top">
    <div className="card-header border-0">
      <div className="card-title">
        <h3 className="fw-bold">Ringkasan Pembayaran</h3>
      </div>
    </div>

    <div className="card-body pt-0">
      <div className="d-flex justify-content-between mb-3">
        <span>Harga Paket</span>
        <div>
          {paket?.originalPrice &&
            paket.originalPrice > (paket.finalPrice ?? paket.price) && (
              <span className="text-muted text-decoration-line-through me-2">
                {toIDR(paket.originalPrice)}
              </span>
            )}
          <strong className="text-primary">
            {toIDR(paket?.price)}
          </strong>
        </div>
      </div>

      <div className="d-flex justify-content-between mb-3">
        <span>Custom Domain</span>
        <span>{toIDR(pricing.customDomain)}</span>
      </div>

      <div className="d-flex justify-content-between mb-3">
        <span>Donasi One Tree</span>
        <span>{toIDR(pricing.donation)}</span>
      </div>

      {/* ✅ Tampilkan potongan (tanpa menghitung ulang total) */}
      {!!paket?.discounts?.length &&
        paket.discounts
          .filter((d) => d.amount > 0)
          .map((d, i) => (
            <div
              key={i}
              className="d-flex justify-content-between mb-2 text-success"
            >
              <span>
                <i className="ki-duotone ki-discount fs-4 me-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Diskon {d.name || (d.type === "promo" ? "Promo" : "Referral")}{" "}
                ({d.code})
              </span>
              <span>- {toIDR(d.amount)}</span>
            </div>
          ))}

      <div className="separator my-4"></div>

      {/* ✅ Total yang benar */}
      <div className="d-flex justify-content-between fs-5 fw-bold">
        <span>Total</span>
        <span>
          {toIDR(
            (paket?.finalPrice ?? paket?.price ?? 0) +
              pricing.customDomain +
              pricing.donation
          )}
        </span>
      </div>
    </div>

    <div className="card-footer d-flex justify-content-end gap-3">
      <button
        type="button"
        className="btn btn-light"
        onClick={() => router.push("/onboarding/data")}
      >
        Kembali
      </button>
      <button
        type="button"
        className="btn btn-success"
        onClick={handleBayar}
        disabled={submitting}
      >
        {submitting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Memproses...
          </>
        ) : (
          "Bayar Sekarang"
        )}
      </button>
    </div>
  </div>
</div>


        </div>

    </UserLayout>
  );
}
