// pages/edit-undangan/[slug]/upgrade.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserLayout from "@/components/layouts/UserLayout";
import SeoHead from '@/components/SeoHead';

export default function UpgradeFiturPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { status } = useSession();

  const [loading, setLoading] = useState(true);
  const [inv, setInv] = useState(null);
  const [err, setErr] = useState("");

  const [active, setActive] = useState([]);
  const [available, setAvailable] = useState([]);
  const [picked, setPicked] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!slug || status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=" + encodeURIComponent(router.asPath));
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setErr("");

        // Gabungkan pengambilan data undangan dan fitur
        const [invResponse, featuresResponse] = await Promise.all([
          fetch(`/api/invitation/detail?slug=${encodeURIComponent(slug)}`),
          fetch(`/api/features/available?slug=${encodeURIComponent(slug)}`),
        ]);

        // Cek data undangan
        if (!invResponse.ok) {
          const errorData = await invResponse.json().catch(() => ({ message: "Gagal memuat detail undangan." }));
          throw new Error(errorData.message);
        }
        const invData = await invResponse.json();
        setInv(invData.undangan);

        // Cek data fitur
        if (!featuresResponse.ok) {
           const errorData = await featuresResponse.json().catch(() => ({ message: "Gagal memuat data fitur." }));
          throw new Error(errorData.message);
        }
        const featuresData = await featuresResponse.json();
        setActive(featuresData.active || []);
        setAvailable(featuresData.available || []);

      } catch (e) {
        setErr(e.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, status, router]);

  const togglePick = (key) => {
    const lowerKey = String(key).toLowerCase();
    setPicked((prev) =>
      prev.includes(lowerKey) ? prev.filter((x) => x !== lowerKey) : [...prev, lowerKey]
    );
  };

  const total = useMemo(() => {
    const priceMap = new Map(available.map((f) => [f.key, f.price]));
    return picked.reduce((sum, key) => sum + (priceMap.get(key) || 0), 0);
  }, [picked, available]);

  const submitUpgrade = async () => {
    if (!inv || picked.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "addon",
          invitationId: inv._id,
          selectedFeatures: picked,
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        const errorText = await res.text();
        throw new Error(
          errorText.toLowerCase().includes("<!doctype html")
            ? "Sesi Anda berakhir. Silakan login kembali."
            : errorText || "Gagal membuat invoice."
        );
      }

      const data = await res.json();
      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        router.push(`/orders/${data.orderId}/success`);
      }
    } catch (e) {
      alert(e.message);
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <UserLayout>
      <SeoHead
        title="Upgrade Fitur - Dreamslink"
        description="Upgrade fitur undangan Anda."
        canonical="/edit-undangan/[slug]/upgrade"
      />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="spinner-border text-primary" />
        </div>
      </UserLayout>
    );
  }

  if (err) {
    return (
      <UserLayout>
        <div className="alert alert-danger m-5">
          <h4 className="alert-heading">Gagal Memuat Data!</h4>
          <p>{err}</p>
          <hr />
          <Link className="btn btn-light" href={`/edit-undangan/${slug}`}>
            Kembali ke Editor
          </Link>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="d-flex align-items-center justify-content-between mb-7">
        <div>
          <h1 className="fs-2hx fw-bold mb-2">Upgrade Fitur</h1>
          <div className="text-gray-700">
            Undangan: <b className="text-primary">{inv?.slug}</b> • Paket: <b>{inv?.packageId?.name || "-"}</b>
          </div>
        </div>
        <Link href={`/edit-undangan/${inv?.slug}`} className="btn btn-light-primary">
          Kembali ke Editor
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pilih Fitur Tambahan</h3>
        </div>
        <div className="card-body">
          {available.length === 0 ? (
            <div className="text-muted text-center p-5">
              Tidak ada fitur tambahan yang tersedia. Semua fitur untuk paket ini sudah aktif di undangan Anda.
            </div>
          ) : (
            <div className="row">
              {available.map((f) => (
                <div key={f.key} className="col-md-6 mb-5">
                  <label className="d-flex align-items-center form-check form-check-custom form-check-solid cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-check-input me-3"
                      checked={picked.includes(f.key)}
                      onChange={() => togglePick(f.key)}
                    />
                    <span className="form-check-label d-flex flex-column">
                      <span className="fw-bold text-gray-900">{f.name}</span>
                      <span className="text-gray-600">Rp {f.price.toLocaleString("id-ID")}</span>
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        {available.length > 0 && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <div className="fs-5">
              Total: <b className="text-primary">Rp {total.toLocaleString("id-ID")}</b>
            </div>
            <button
              className="btn btn-primary"
              disabled={picked.length === 0 || isSubmitting}
              onClick={submitUpgrade}
            >
              {isSubmitting ? <span className="spinner-border spinner-border-sm"></span> : "Lanjutkan Pembayaran"}
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
}