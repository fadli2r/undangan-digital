import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import UserLayout from "@/components/layouts/UserLayout";

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
  const [success, setSuccess] = useState("");

  const user = session?.user;

  const queryParams = useMemo(() => {
    const q = new URLSearchParams();
    if (data?.packageId) q.set("id", data.packageId);
    if (promo) q.set("promoCode", promo);
    if (referral) q.set("referralCode", referral);
    if (user?.email) q.set("userEmail", user.email);
    return q.toString();
  }, [data?.packageId, promo, referral, user?.email]);

  useEffect(() => {
    const onboardingData = localStorage.getItem("onboardingData");
    if (!onboardingData) return router.replace("/onboarding");

    const parsed = JSON.parse(onboardingData);
    setData(parsed);
  }, [router]);

  useEffect(() => {
    if (!data?.packageId) return;

    const fetchPaket = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/paket/detail?${queryParams}`);
        const json = await res.json();
        if (!json.paket) throw new Error("Paket tidak ditemukan");
        setPaket(json.paket);
        setError(json.message || "");
      } catch (err) {
        setError("Gagal memuat paket");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaket();
  }, [queryParams, data?.packageId]);

  const handleBayar = async () => {
    if (!paket || !user) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paket: paket._id,
          email: user.email,
          name: user.name,
          promoCode: promo || undefined,
          referralCode: referral || undefined,
          amount: paket.finalPrice,
          onboardingData: {
            pria: data.pria,
            wanita: data.wanita
          }
        })
      });

      const json = await res.json();
      if (res.ok && json.invoice_url) {
        localStorage.removeItem("onboardingData");
        window.location.href = json.invoice_url;
      } else {
        throw new Error(json.message || "Gagal membuat invoice");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <UserLayout>
      <div className="container py-10">
        <h2 className="mb-5 fw-bold">Ringkasan Pendaftaran & Pembayaran</h2>

        {/* Data Mempelai */}
        <div className="card mb-5">
          <div className="card-header">
            <h4 className="mb-0">Data Mempelai</h4>
          </div>
          <div className="card-body">
            <p><strong>Pria:</strong> {data.pria}</p>
            <p><strong>Wanita:</strong> {data.wanita}</p>
          </div>
        </div>

        {/* Detail Paket */}
        <div className="card mb-5">
          <div className="card-header">
            <h4 className="mb-0">Detail Paket</h4>
          </div>
          <div className="card-body">
            <p><strong>{paket.name}</strong></p>
            <p className="text-muted">{paket.description}</p>
            <p>
              Harga:{" "}
              {paket.originalPrice && (
                <span className="text-decoration-line-through text-muted me-2">
                  Rp {paket.originalPrice.toLocaleString("id-ID")}
                </span>
              )}
              <strong className="text-primary">Rp {paket.finalPrice.toLocaleString("id-ID")}</strong>
            </p>
          </div>
        </div>

        {/* Kode Promo & Referral */}
        <div className="card mb-5">
          <div className="card-header">
            <h4 className="mb-0">Kode Promo & Referral</h4>
          </div>
          <div className="card-body row g-3">
            <div className="col-md-6">
              <label className="form-label">Kode Promo</label>
              <input
                type="text"
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Kode Referral</label>
              <input
                type="text"
                value={referral}
                onChange={(e) => setReferral(e.target.value.toUpperCase())}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger mb-5">{error}</div>
        )}

        {/* Tombol Bayar */}
        <div className="text-end">
          <button
            onClick={handleBayar}
            className="btn btn-success btn-lg"
            disabled={submitting}
          >
            {submitting ? "Memproses..." : "Bayar Sekarang"}
          </button>
        </div>
      </div>
    </UserLayout>
  );
}
