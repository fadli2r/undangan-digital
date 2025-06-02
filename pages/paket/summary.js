import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Header from "../../components/Header";

export default function PaketSummary() {
  const router = useRouter();
  const { data: session } = useSession();
  const { paketId } = router.query;

  const [paket, setPaket] = useState(null);
  const [promo, setPromo] = useState("");
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch paket details and apply codes
  const fetchPaketDetails = async () => {
    if (!paketId) return;

    try {
      const queryParams = new URLSearchParams({
        id: paketId,
        ...(promo && { promoCode: promo }),
        ...(referral && { referralCode: referral })
      });

      const res = await fetch(`/api/paket/detail?${queryParams}`);
      const data = await res.json();

      if (data.paket) {
        setPaket(data.paket);
        setError("");
      } else {
        setError(data.message || "Paket tidak ditemukan");
      }
    } catch (err) {
      setError("Gagal mengambil data paket");
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial paket details
  useEffect(() => {
    fetchPaketDetails();
  }, [paketId]);

  // Re-fetch when codes change
  useEffect(() => {
    if (paketId) {
      const timer = setTimeout(() => {
        fetchPaketDetails();
      }, 500); // Debounce API calls
      return () => clearTimeout(timer);
    }
  }, [promo, referral]);

  const handlePayNow = async () => {
    setLoading(true);
    setError("");
    
    let email = "";
    let name = "";

    // Get user info
    if (session?.user?.email) {
      email = session.user.email;
      name = session.user.name || "";
    } else if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      email = user.email || "";
      name = user.name || "";
    }

    if (!email) {
      setError("Silakan login terlebih dahulu");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paket: paketId,
          email,
          name,
          promoCode: promo || undefined,
          referralCode: referral || undefined,
          amount: paket.finalPrice
        }),
      });
      
      const data = await res.json();
      if (data && data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        setError(data.message || "Gagal membuat invoice");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    }
    
    setLoading(false);
  };

  if (loading) return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    </>
  );

  if (!paket) return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">{error || "Paket tidak ditemukan"}</div>
      </div>
    </>
  );

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto p-6 mt-10">
        <div className="mb-6">
          <Link href="/paket" className="text-blue-600 hover:underline">
            ← Kembali ke Daftar Paket
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <h1 className="text-2xl font-bold">Ringkasan Pembelian</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* Package Details */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Detail Paket</h2>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-lg font-bold">{paket.name}</div>
                <div className="text-gray-600">
                  {paket.features?.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Promo & Referral Codes */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kode Promo</label>
                <input
                  type="text"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                  className="w-full p-2 border rounded"
                  placeholder="Masukkan kode promo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kode Referral</label>
                <input
                  type="text"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value.toUpperCase())}
                  className="w-full p-2 border rounded"
                  placeholder="Masukkan kode referral"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Harga Paket</span>
                  <span>Rp {paket.originalPrice?.toLocaleString()}</span>
                </div>

                {paket.discounts?.map((discount, i) => (
                  <div key={i} className="flex justify-between text-green-600">
                    <span>Diskon {discount.type === 'promo' ? 'Promo' : 'Referral'}</span>
                    <span>- Rp {discount.amount?.toLocaleString()}</span>
                  </div>
                ))}

                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total Pembayaran</span>
                  <span>Rp {paket.finalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded">
                {success}
              </div>
            )}

            <button
              onClick={handlePayNow}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
