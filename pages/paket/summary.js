import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserLayout from "../../components/layouts/UserLayout";

export default function PaketSummary() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { paketId } = router.query;

  const [paket, setPaket] = useState(null);
  const [promo, setPromo] = useState("");
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get user info for coupon validation
  const [user, setUser] = useState(null);

  // Get user data from session or localStorage
  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }
  }, [session]);

  // Debounce kecil agar tidak spam API
  const queryParams = useMemo(() => {
    const q = new URLSearchParams();
    if (paketId) q.set("id", paketId);
    if (promo) q.set("promoCode", promo);
    if (referral) q.set("referralCode", referral);
    if (user?.email) q.set("userEmail", user.email);
    return q.toString();
  }, [paketId, promo, referral, user?.email]);

  const fetchPaketDetails = async () => {
    if (!paketId) return;
    try {
      setLoading(true);
      setError("");
      
      const res = await fetch(`/api/paket/detail?${queryParams}`);
      const data = await res.json();
      
      if (data.paket) {
        setPaket(data.paket);
        
        // Show success message if discount applied
        if (data.message) {
          setSuccess(data.message);
        } else {
          setSuccess("");
        }
        
        // Check for coupon errors and show them
        const couponErrors = data.paket.discounts?.filter(d => d.error);
        if (couponErrors?.length > 0) {
          const errorMessages = couponErrors.map(e => `${e.code}: ${e.error}`).join(", ");
          setError(errorMessages);
        }
      } else {
        setPaket(null);
        setError(data.message || "Paket tidak ditemukan");
      }
    } catch (err) {
      setPaket(null);
      setError("Gagal mengambil data paket");
      console.error("Error fetching paket details:", err);
    } finally {
      setLoading(false);
    }
  };

  // initial + when paketId changes
  useEffect(() => {
    fetchPaketDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paketId]);

  // re-fetch when codes change (debounced)
  useEffect(() => {
    if (!paketId) return;
    const t = setTimeout(() => { fetchPaketDetails(); }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

 const handlePayNow = async () => {
  setSubmitting(true);
  setError("");
  setSuccess("");

  let email = session?.user?.email || "";
  let name = session?.user?.name || "";
  if (typeof window !== "undefined" && !email) {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    email = u.email || "";
    name = u.name || "";
  }
  if (!email) {
    setError("Silakan login terlebih dahulu");
    setSubmitting(false);
    return;
  }

  try {
    const res = await fetch("/api/payment/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paket: paketId,    // biar server resolve Package
        email,
        name,
        // minta server redirect ke /buat-undangan?orderId=...
        successPath: "/buat-undangan"
      }),
    });

    const data = await res.json();
    if (res.ok && data.invoice_url) {
      window.location.href = data.invoice_url;
    } else {
      setError(data.message || "Gagal membuat invoice");
    }
  } catch (err) {
    setError("Terjadi kesalahan sistem");
  }
  setSubmitting(false);
};

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, show simple layout
  if (status !== "authenticated" && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-body text-center py-5">
                  <h2 className="mb-4">Ringkasan Pembelian</h2>
                  <p className="text-muted mb-4">Silakan login terlebih dahulu untuk melanjutkan pembelian</p>
                  <div className="d-flex gap-3 justify-content-center">
                    <a href="/login" className="btn btn-primary">Login</a>
                    <a href="/register" className="btn btn-outline-primary">Register</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jika tidak ada paket / error
  if (!paket) {
    const LayoutComponent = status === "authenticated" ? UserLayout : 'div';
    const layoutProps = status === "authenticated" ? {} : { className: "min-h-screen bg-gray-50" };
    
    return (
      <LayoutComponent {...layoutProps}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-body py-5 text-center">
                  <h1 className="h2 fw-bold text-gray-900 mb-4">Ringkasan Pembelian</h1>
                  <div className="text-danger fw-semibold mb-4">{error || "Paket tidak ditemukan"}</div>
                  <Link href="/paket" className="btn btn-primary">
                    ← Kembali ke Daftar Paket
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutComponent>
    );
  }

  // Main render with conditional layout
  const LayoutComponent = status === "authenticated" ? UserLayout : 'div';
  const layoutProps = status === "authenticated" ? {} : { className: "min-h-screen bg-gray-50" };

  return (
    <LayoutComponent {...layoutProps}>
      {/* Add container for non-authenticated users */}
      {status !== "authenticated" && (
        <div className="container py-5">
          <div className="text-center mb-4">
            <h1 className="h2">Ringkasan Pembelian</h1>
            <p className="text-muted">Preview paket yang akan dibeli</p>
          </div>
        </div>
      )}
      
      <div className={status === "authenticated" ? "" : "container"}>
        {/* Header */}
        <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
          <div className="col-12">
            <div className="card">
              <div className="card-body d-flex flex-wrap justify-content-between align-items-center py-6">
                <div className="d-flex flex-column">
                  <h1 className="fs-2hx fw-bold text-gray-900 mb-2">Ringkasan Pembelian</h1>
                  <div className="fs-6 text-gray-700">
                    Review detail paket & selesaikan pembayaran Anda
                  </div>
                </div>
                <div>
                  <Link href="/paket" className="btn btn-light-primary">
                    ← Kembali ke Daftar Paket
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content: 2 kolom */}
        <div className="row g-5 g-xl-10">
          {/* Kiri: Detail paket + fitur + kode */}
          <div className="col-xl-7">
            {/* Detail Paket */}
            <div className="card card-flush mb-5">
              <div className="card-header">
                <div className="card-title">
                  <h3 className="fw-bold">Detail Paket</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap">
                  <div>
                    <div className="fs-3 fw-bold text-gray-900">{paket.name}</div>
                    <div className="text-muted">ID: {paketId}</div>
                  </div>
                  <div className="text-end">
                    {paket.originalPrice ? (
                      <>
                        <div className="fs-2 fw-bold text-primary">
                          Rp {paket.finalPrice?.toLocaleString("id-ID")}
                        </div>
                        <div className="text-muted text-decoration-line-through">
                          Rp {paket.originalPrice?.toLocaleString("id-ID")}
                        </div>
                      </>
                    ) : (
                      <div className="fs-2 fw-bold text-primary">
                        Rp {paket.finalPrice?.toLocaleString("id-ID")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fitur */}
                {!!paket.features?.length && (
                  <div className="mt-6">
                    <div className="fw-bold mb-3">Fitur yang didapat</div>
                    <div className="row">
                      {paket.features.map((feature, i) => (
                        <div key={i} className="col-md-6 mb-3">
                          <div className="d-flex align-items-center">
                            <i className="ki-duotone ki-check-circle fs-2 text-success me-3">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            <span className="text-gray-800">{feature}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Kode Promo & Referral */}
            <div className="card card-flush">
              <div className="card-header">
                <div className="card-title">
                  <h3 className="fw-bold">Kode Promo & Referral</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="row g-5">
                  <div className="col-md-6">
                    <label className="form-label">Kode Promo</label>
                    <div className="position-relative">
                      <input
                        type="text"
                        value={promo}
                        onChange={(e) => {
                          setPromo(e.target.value.toUpperCase());
                          setError(""); // Clear error when typing
                          setSuccess(""); // Clear success when typing
                        }}
                        className={`form-control ${
                          paket?.discounts?.find(d => d.type === 'promo' && d.error) ? 'is-invalid' : 
                          paket?.discounts?.find(d => d.type === 'promo' && d.amount > 0) ? 'is-valid' : ''
                        }`}
                        placeholder="Masukkan kode promo"
                        autoComplete="off"
                        disabled={!user}
                      />
                      {paket?.discounts?.find(d => d.type === 'promo' && d.amount > 0) && (
                        <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                          <i className="ki-duotone ki-check-circle fs-2 text-success">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </div>
                      )}
                    </div>
                    {paket?.discounts?.find(d => d.type === 'promo' && d.error) && (
                      <div className="text-danger fs-7 mt-1">
                        {paket.discounts.find(d => d.type === 'promo' && d.error).error}
                      </div>
                    )}
                    {paket?.discounts?.find(d => d.type === 'promo' && d.amount > 0) && (
                      <div className="text-success fs-7 mt-1">
                        ✅ Hemat Rp {paket.discounts.find(d => d.type === 'promo' && d.amount > 0).amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Kode Referral</label>
                    <div className="position-relative">
                      <input
                        type="text"
                        value={referral}
                        onChange={(e) => {
                          setReferral(e.target.value.toUpperCase());
                          setError(""); // Clear error when typing
                          setSuccess(""); // Clear success when typing
                        }}
                        className={`form-control ${
                          paket?.discounts?.find(d => d.type === 'referral' && d.error) ? 'is-invalid' : 
                          paket?.discounts?.find(d => d.type === 'referral' && d.amount > 0) ? 'is-valid' : ''
                        }`}
                        placeholder="Masukkan kode referral"
                        autoComplete="off"
                        disabled={!user}
                      />
                      {paket?.discounts?.find(d => d.type === 'referral' && d.amount > 0) && (
                        <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                          <i className="ki-duotone ki-check-circle fs-2 text-success">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </div>
                      )}
                    </div>
                    {paket?.discounts?.find(d => d.type === 'referral' && d.error) && (
                      <div className="text-danger fs-7 mt-1">
                        {paket.discounts.find(d => d.type === 'referral' && d.error).error}
                      </div>
                    )}
                    {paket?.discounts?.find(d => d.type === 'referral' && d.amount > 0) && (
                      <div className="text-success fs-7 mt-1">
                        ✅ Hemat Rp {paket.discounts.find(d => d.type === 'referral' && d.amount > 0).amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {!user && (
                  <div className="alert alert-warning d-flex align-items-center mt-3" role="alert">
                    <i className="ki-duotone ki-information fs-2 me-3">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                    <div>
                      Silakan login terlebih dahulu untuk menggunakan kode promo atau referral
                    </div>
                  </div>
                )}
                
                <div className="text-muted fs-7 mt-3">
                  {user ? 
                    "Kode akan diterapkan otomatis beberapa detik setelah Anda mengetik." :
                    "Login diperlukan untuk validasi kode kupon."
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Kanan: Ringkasan pembayaran */}
          <div className="col-xl-5">
            <div className="card card-flush">
              <div className="card-header">
                <div className="card-title">
                  <h3 className="fw-bold">Ringkasan Pembayaran</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <span>Harga Paket</span>
                  <span>
                    {paket.originalPrice
                      ? `Rp ${paket.originalPrice?.toLocaleString("id-ID")}`
                      : `Rp ${paket.finalPrice?.toLocaleString("id-ID")}`}
                  </span>
                </div>

                {!!paket.discounts?.length &&
                  paket.discounts
                    .filter(discount => discount.amount > 0) // Only show successful discounts
                    .map((discount, i) => (
                      <div key={i} className="d-flex justify-content-between text-success mb-2">
                        <span>
                          <i className="ki-duotone ki-discount fs-4 me-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                          {discount.name || `Diskon ${discount.type === "promo" ? "Promo" : "Referral"}`} ({discount.code})
                        </span>
                        <span className="fw-bold">- Rp {discount.amount?.toLocaleString("id-ID")}</span>
                      </div>
                    ))}

                <div className="separator my-4"></div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold fs-5">Total Pembayaran</span>
                  <span className="fw-bolder fs-3 text-primary">
                    Rp {paket.finalPrice?.toLocaleString("id-ID")}
                  </span>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center mt-5" role="alert">
                    <span className="svg-icon svg-icon-2hx me-3">
                      <i className="ki-duotone ki-info fs-2 text-danger">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </span>
                    <div>{error}</div>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success d-flex align-items-center mt-5" role="alert">
                    <span className="svg-icon svg-icon-2hx me-3">
                      <i className="ki-duotone ki-check-circle fs-2 text-success">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </span>
                    <div>{success}</div>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button
                  onClick={handlePayNow}
                  disabled={submitting}
                  className="btn btn-success w-100 btn-lg"
                >
                  {submitting ? "Memproses..." : "Bayar Sekarang"}
                </button>
                <div className="text-muted fs-7 mt-3 text-center">
                  Pembayaran aman & terpercaya
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
}
