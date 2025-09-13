// pages/upgrade/index.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserLayout from "@/components/layouts/UserLayout";

const toKey = (s) => String(s || "").toLowerCase().trim();
const uniqKeys = (arr) => Array.from(new Set((arr || []).map(toKey).filter(Boolean)));

export default function UpgradePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [invite, setInvite] = useState(null); // detail invitation (owner-checked by API)
  const [featureDefs, setFeatureDefs] = useState([]); // resolved feature docs (name, key, price)
  const [selected, setSelected] = useState({}); // key -> boolean
  const [submitting, setSubmitting] = useState(false);

  // ---- guards ----
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace("/login");
  }, [status, session, router]);

  // ---- load invitation ----
  useEffect(() => {
    if (!slug || !session) return;
    let aborted = false;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) detail undangan (sudah owner-checked di server)
        const res = await fetch(`/api/invitation/detail?slug=${encodeURIComponent(String(slug))}`);
        const j = await res.json();
        if (!res.ok || !j?.undangan) {
          throw new Error(j?.message || "Undangan tidak ditemukan");
        }
        if (aborted) return;

        const und = j.undangan;
        setInvite(und);

        // 2) hitung candidate add-ons
        const pkg = und?.packageId || null;
        const isCustom = (pkg?.type || "").toLowerCase() === "custom";
        const allowed = uniqKeys([...(und?.allowedFeatures || []), ...(pkg?.featureKeys || [])]);
        const selectable = uniqKeys(pkg?.selectableFeatures || []);

        // kalau bukan custom paket → tidak bisa add-on
        if (!isCustom) {
          setFeatureDefs([]);
          return;
        }

        const candidates = selectable.filter((k) => !allowed.includes(k));
        if (candidates.length === 0) {
          setFeatureDefs([]);
          return;
        }

        // 3) resolve detail fitur dari DB (nama & harga)
        //    endpoint diharapkan mengerti query ?keys=a,b,c dan hanya mengembalikan yang aktif
        //    fallback: kalau endpoint tidak ada, tampilkan minimal key (harga 0)
        try {
          const fr = await fetch(`/api/features/list?keys=${encodeURIComponent(candidates.join(","))}`);
          if (fr.ok) {
            const fj = await fr.json();
            const list =
              Array.isArray(fj?.features) && fj.features.length
                ? fj.features
                : candidates.map((k) => ({ key: k, name: k, price: 0 }));
            if (!aborted) setFeatureDefs(list);
          } else {
            if (!aborted) setFeatureDefs(candidates.map((k) => ({ key: k, name: k, price: 0 })));
          }
        } catch {
          if (!aborted) setFeatureDefs(candidates.map((k) => ({ key: k, name: k, price: 0 })));
        }
      } catch (e) {
        if (!aborted) setErr(e.message || "Gagal memuat data");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [slug, session]);

  const pkg = invite?.packageId || null;
  const isCustom = (pkg?.type || "").toLowerCase() === "custom";

  const toggle = (key) =>
    setSelected((prev) => {
      const nxt = { ...prev };
      nxt[key] = !nxt[key];
      return nxt;
    });

  const selectedKeys = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const total = useMemo(() => {
    const priceByKey = new Map(featureDefs.map((f) => [toKey(f.key), Number(f.price || 0)]));
    return selectedKeys.reduce((sum, k) => sum + (priceByKey.get(toKey(k)) || 0), 0);
  }, [featureDefs, selectedKeys]);

  const formatIDR = (n) =>
    typeof n === "number"
      ? n.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
      : "-";

  const canSubmit = isCustom && selectedKeys.length > 0 && !submitting;

  const createInvoice = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErr("");

    try {
      // Titipkan meta upgrade lewat onboardingData (aman karena handler menyimpan ke order.meta)
      const body = {
        packageId: pkg?._id || pkg?.id || null,
        selectedFeatures: selectedKeys,
        onboardingData: {
          fromOnboarding: false,
          fromUpgrade: true,
          upgradeForInvitation: invite?._id || null,
          upgradeSlug: invite?.slug || null,
        },
        // successUrl: (optional) biarkan default agar diarahkan ke /orders/:id/success
      };

      const r = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const j = await r.json();
      if (!r.ok) {
        throw new Error(j?.message || j?.error || "Gagal membuat invoice");
      }

      if (j?.invoice_url) {
        // arahkan user ke Xendit checkout
        window.location.href = j.invoice_url;
        return;
      }

      // fallback: kalau tidak ada invoice_url, arahkan ke success page order
      if (j?.orderId) {
        router.push(`/orders/${j.orderId}/success`);
        return;
      }

      throw new Error("Invoice tidak tersedia");
    } catch (e) {
      setErr(e.message || "Gagal membuat invoice");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- RENDER ----
  if (status === "loading" || !session || loading) {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center min-h-300px">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (err) {
    return (
      <UserLayout>
        <div className="container py-10">
          <div className="alert alert-danger">
            <div className="fw-bold mb-1">Gagal</div>
            <div>{err}</div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard" className="btn btn-light">Kembali</Link>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!invite) {
    return (
      <UserLayout>
        <div className="container py-10 text-center text-muted">
          Undangan tidak ditemukan.
        </div>
      </UserLayout>
    );
  }

  const alreadyAllowed = uniqKeys([
    ...(invite.allowedFeatures || []),
    ...((pkg && pkg.featureKeys) || []),
  ]);

  return (
    <UserLayout>
      {/* Header */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h1 className="fs-2hx fw-bold text-gray-900 mb-2">Upgrade Fitur</h1>
                <div className="text-gray-700">
                  Undangan: <b>{invite.slug}</b>{" "}
                  <span className="mx-2">•</span>
                  Paket: <b>{pkg?.name || "-"}</b>{" "}
                  <span className="mx-2">•</span>
                  Tipe: <b>{(pkg?.type || "-").toUpperCase()}</b>
                </div>
                <div className="text-gray-600 fs-7 mt-1">
                  Fitur aktif: {alreadyAllowed.length ? alreadyAllowed.join(", ") : "-"}
                </div>
              </div>
              <div>
                <Link href={`/edit-undangan/${invite.slug}`} className="btn btn-light-primary">
                  Kembali ke Editor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notice untuk paket non-custom */}
      {!isCustom && (
        <div className="row g-5 g-xl-10 mb-5">
          <div className="col-12">
            <div className="alert alert-warning d-flex align-items-start">
              <i className="ki-duotone ki-information-5 fs-2hx me-4 text-warning">
                <span className="path1"></span><span className="path2"></span>
              </i>
              <div>
                <div className="fw-bold mb-2">Paket saat ini bukan tipe <em>custom</em>.</div>
                <div className="text-gray-700">
                  Add-on per fitur hanya tersedia untuk paket <b>custom</b>. Anda tetap bisa
                  meningkatkan paket melalui halaman paket.
                </div>
                <div className="mt-4">
                  <Link href="/paket" className="btn btn-primary">Lihat Paket</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daftar Add-on */}
      {isCustom && (
        <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <h3 className="fw-bold">Pilih Add-on</h3>
                </div>
              </div>
              <div className="card-body">
                {featureDefs.length === 0 ? (
                  <div className="text-muted">
                    Semua fitur pada paket Anda sudah aktif. Tidak ada add-on tersedia.
                  </div>
                ) : (
                  <div className="row g-6">
                    {featureDefs.map((f) => {
                      const k = toKey(f.key);
                      const checked = !!selected[k];
                      const price = Number(f.price || 0);

                      return (
                        <div key={k} className="col-md-6 col-lg-4">
                          <div className={`border rounded p-5 h-100 ${checked ? "border-primary" : "border-gray-300"}`}>
                            <div className="d-flex align-items-start justify-content-between mb-3">
                              <div>
                                <div className="fw-bold fs-5 text-gray-900">{f.name || f.key}</div>
                                {f.description && (
                                  <div className="text-gray-600 fs-7">{f.description}</div>
                                )}
                              </div>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`chk-${k}`}
                                  checked={checked}
                                  onChange={() => toggle(k)}
                                />
                              </div>
                            </div>
                            <div className="mt-auto">
                              <span className="badge badge-light-primary">
                                {price > 0 ? `+ ${formatIDR(price)}` : "Gratis / N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="card-footer d-flex flex-wrap align-items-center justify-content-between">
                <div className="text-gray-700">
                  {selectedKeys.length
                    ? <>Dipilih: <b>{selectedKeys.length}</b> fitur</>
                    : "Belum ada add-on dipilih"}
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="fw-bold">
                    Total: <span className="text-primary">{formatIDR(total)}</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    disabled={!canSubmit}
                    onClick={createInvoice}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Membuat Invoice…
                      </>
                    ) : (
                      "Lanjutkan Pembayaran"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
}
