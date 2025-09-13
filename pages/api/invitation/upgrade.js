// pages/edit-undangan/[slug]/upgrade.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserLayout from "@/components/layouts/UserLayout";

const toKeys = (arr) =>
  Array.from(
    new Set(
      (Array.isArray(arr) ? arr : [])
        .map((k) => String(k || "").toLowerCase().trim())
        .filter(Boolean)
    )
  );

export default function UpgradeFiturPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { status } = useSession();

  const [loading, setLoading] = useState(true);
  const [inv, setInv] = useState(null);
  const [err, setErr] = useState("");

  const [active, setActive] = useState([]);     // fitur sudah aktif di undangan
  const [available, setAvailable] = useState([]); // fitur yang bisa dibeli
  const [picked, setPicked] = useState([]);     // pilihan user

  const formatPkgType = (t) => String(t || "").toUpperCase();

  useEffect(() => {
    if (!slug || status === "loading") return;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) detail undangan (sudah populate package di detail.js)
        const r1 = await fetch(`/api/invitation/detail?slug=${encodeURIComponent(slug)}`);
        const j1 = await r1.json();
        if (!r1.ok || !j1?.undangan) throw new Error(j1?.message || "Undangan tidak ditemukan");
        setInv(j1.undangan);

        // 2) fitur aktif & available
        const r2 = await fetch(`/api/features/available?slug=${encodeURIComponent(slug)}`);
        const j2 = await r2.json();
        if (!r2.ok) throw new Error(j2?.message || "Gagal memuat fitur");

        setActive(toKeys(j2.active));
        setAvailable((Array.isArray(j2.available) ? j2.available : []).map((f) => ({
          key: f.key,
          name: f.name,
          price: Number(f.price || 0),
        })));
        setPicked([]);
      } catch (e) {
        setErr(e.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, status]);

  const togglePick = (key) => {
    const k = String(key).toLowerCase();
    setPicked((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  };

  const total = useMemo(() => {
    const map = new Map(available.map((f) => [String(f.key).toLowerCase(), f.price]));
    return picked.reduce((s, k) => s + (map.get(k) || 0), 0);
  }, [picked, available]);

  const submitUpgrade = async () => {
    if (!inv || picked.length === 0) return;
    try {
      const res = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "addon",
          packageId: inv.packageId?._id || inv.packageId, // base paket pemilik undangan
          selectedFeatures: picked,
          invitationId: inv._id,
          invitation_slug: inv.slug,
          successUrl: `/orders/<id>/success`, // backend pakai default; ini opsional
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || "Gagal membuat invoice");
      // arahkan ke invoice Xendit
      if (j.invoice_url) {
        window.location.href = j.invoice_url;
      } else {
        // fallback ke success (akan autopoll)
        router.push(`/orders/${j.orderId}/success`);
      }
    } catch (e) {
      alert(e.message || "Gagal mulai upgrade");
    }
  };

  if (status === "loading" || loading) {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center min-h-300px">
          <div className="spinner-border text-primary" />
        </div>
      </UserLayout>
    );
  }

  if (err) {
    return (
      <UserLayout>
        <div className="alert alert-danger m-5">
          {err}
          <div className="mt-3">
            <Link className="btn btn-light" href={`/edit-undangan/${slug}`}>
              Kembali ke Editor
            </Link>
          </div>
        </div>
      </UserLayout>
    );
  }

  const pkgName = inv?.packageId?.name || "-";
  const pkgType = formatPkgType(inv?.packageId?.type);

  return (
    <UserLayout>
      <div className="d-flex align-items-center justify-content-between mb-7">
        <div>
          <h1 className="fs-2hx fw-bold mb-2">Upgrade Fitur</h1>
          <div className="text-gray-700">
            Undangan: <b className="text-primary">{inv?.slug}</b> • Paket: <b>{pkgName}</b> • Tipe: <b>{pkgType}</b>
          </div>
          <div className="text-gray-600 fs-7 mt-1">
            Fitur aktif: {active.length ? active.join(", ") : "-"}
          </div>
        </div>
        <Link href={`/edit-undangan/${inv?.slug}`} className="btn btn-light-primary">
          Kembali ke Editor
        </Link>
      </div>

      {/* Daftar fitur yang tersedia untuk ditambahkan */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><h3>Pilih Fitur Tambahan</h3></div>
        </div>
        <div className="card-body">
          {available.length === 0 ? (
            <div className="text-muted">Tidak ada fitur tambahan yang tersedia. Semua fitur sudah aktif.</div>
          ) : (
            <div className="row">
              {available.map((f) => {
                const checked = picked.includes(f.key);
                return (
                  <div key={f.key} className="col-md-6 mb-5">
                    <label className="d-flex align-items-center form-check form-check-custom form-check-solid">
                      <input
                        type="checkbox"
                        className="form-check-input me-3"
                        checked={checked}
                        onChange={() => togglePick(f.key)}
                      />
                      <span className="form-check-label d-flex flex-column">
                        <span className="fw-bold text-gray-900">{f.name}</span>
                        <span className="text-gray-600">Rp {Number(f.price || 0).toLocaleString("id-ID")}</span>
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center">
          <div className="fs-5">
            Total: <b>Rp {total.toLocaleString("id-ID")}</b>
          </div>
          <button
            className="btn btn-primary"
            disabled={picked.length === 0}
            onClick={submitUpgrade}
          >
            Lanjutkan Pembayaran
          </button>
        </div>
      </div>
    </UserLayout>
  );
}
