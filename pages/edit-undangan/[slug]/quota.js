import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UserLayout from "../../../components/layouts/UserLayout";
import SeoHead from '@/components/SeoHead';

export default function QuotaPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [undangan, setUndangan] = useState(null);
  const [quota, setQuota] = useState({ limit: 0, used: 0 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then((res) => res.json())
      .then((res) => {
        setUndangan(res.undangan);
        setQuota(res.undangan?.whatsappQuota || { limit: 0, used: 0 });
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data undangan.");
        setLoading(false);
      });
  }, [slug]);

  const handleBeliQuota = async (jumlah) => {
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "addon",
          invitationSlug: slug,
          selectedFeatures: [`wa-quota-${jumlah}`],
        }),
      });

      const data = await res.json();

      if (res.ok && data?.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        setError(data?.message || "Gagal membuat invoice");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memproses permintaan.");
    }
  };

  return (
    <UserLayout>
      <SeoHead
        title="Kuota WhatsApp "
        description="Kelola kuota WhatsApp blast undangan."
        canonical="/edit-undangan/[slug]/quota"
      />
      <div className="container mt-10">
        <h2 className="mb-6 fw-bold">Kuota WhatsApp Blast</h2>

        {loading ? (
          <div>Memuat...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <>
            <div className="card mb-8">
              <div className="card-body">
                <h4 className="mb-4">Sisa Kuota Anda</h4>
                <p className="fs-5">
                  <strong>
                    {quota.used} / {quota.limit} digunakan
                  </strong>{" "}
                  ({quota.limit - quota.used} tersisa)
                </p>
              </div>
            </div>

            <div className="card mb-8">
              <div className="card-body">
                <h4 className="mb-4">Beli Kuota WhatsApp</h4>
                <div className="d-flex gap-3 flex-wrap">
                  {[50, 100, 200].map((jumlah) => (
                    <button
                      key={jumlah}
                      className="btn btn-light-primary"
                      onClick={() => handleBeliQuota(jumlah)}
                    >
                      Beli {jumlah} Kuota (Rp {(jumlah * 500).toLocaleString("id-ID")})
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-muted">
                  Harga Rp 500 per quota WA. Kuota tidak kedaluwarsa.
                </p>
              </div>
            </div>

            {success && (
              <div className="alert alert-success mt-4">
                <i className="ki-duotone ki-check-circle fs-2 me-2"></i>
                {success}
              </div>
            )}

            {error && (
              <div className="alert alert-danger mt-4">
                <i className="ki-duotone ki-cross-circle fs-2 me-2"></i>
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
}
