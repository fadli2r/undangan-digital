// pages/orders/[id]/success.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import UserLayout from "../../../../components/layouts/UserLayout";
import { useSession } from "next-auth/react";

export default function OrderSuccessPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status: authStatus } = useSession();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);

  // polling control
  const pollCountRef = useRef(0);
  const stopPollingRef = useRef(false);

  const fetchOrder = async (showLoader = true) => {
    if (!id) return;
    try {
      if (showLoader) setLoading(true);
      setErr("");
      const res = await fetch(`/api/orders/${id}`, { headers: { "Content-Type": "application/json" } });
      const ct = res.headers.get("content-type") || "";
      const json = ct.includes("application/json") ? await res.json() : {};
      if (!res.ok) throw new Error(json?.message || `Failed (${res.status})`);
      setOrder(json.order);
    } catch (e) {
      setErr(e.message || "Gagal mengambil data order");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // first load
  useEffect(() => {
    if (!id) return;
    if (authStatus === "unauthenticated") return; // akan ditangani render
    if (authStatus === "authenticated") fetchOrder(true);
  }, [id, authStatus]);

  // auto-poll sampai: status != pending ATAU (paid && (used || invitation_slug)) ATAU maksimal 40x ~ 80 detik
  useEffect(() => {
    if (!order) return;
    const done =
      order.status === "expired" ||
      order.status === "canceled" ||
      order.status === "cancelled" ||
      (order.status === "paid" && (order.used || !!order.invitation_slug));

    if (done) {
      stopPollingRef.current = true;
      return;
    }

    // pending atau paid tapi belum final ⇒ poll
    if (!stopPollingRef.current) {
      const t = setTimeout(async () => {
        pollCountRef.current += 1;
        if (pollCountRef.current > 40) {
          stopPollingRef.current = true;
          return;
        }
        await fetchOrder(false);
      }, 2000); // 2 detik
      return () => clearTimeout(t);
    }
  }, [order]);

  // refetch saat tab kembali aktif
  useEffect(() => {
    const onFocus = () => {
      if (!stopPollingRef.current) fetchOrder(false);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const statusInfo = useMemo(() => {
    const s = (order?.status || "").toLowerCase();
    if (s === "paid")       return { label: "paid",    badge: "badge-light-success",   color: "text-success" };
    if (s === "expired")    return { label: "expired", badge: "badge-light-danger",    color: "text-danger" };
    if (s === "canceled" || s === "cancelled")
                            return { label: "canceled",badge: "badge-light-danger",    color: "text-danger" };
    return { label: order?.status || "pending", badge: "badge-light-warning", color: "text-warning" };
  }, [order]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-";

  const isPaid      = order?.status === "paid";
  const isUnused    = !order?.used;
  const isExpired   = order?.status === "expired";
  const isCanceled  = order?.status === "canceled" || order?.status === "cancelled";

  // ---- Upgrade awareness ----
  const intent       = String(order?.meta?.intent || "").toLowerCase();
  const fromUpgrade  = !!order?.meta?.fromUpgrade;
  const isUpgrade    = intent === "addon" || fromUpgrade === true;

  const targetSlug =
    order?.invitation_slug ||
    order?.meta?.invitation_slug ||
    order?.meta?.upgradeSlug ||
    "";

  // Waiting states:
  // - Base purchase: paid && belum kebentuk slug (nunggu webhook buat auto-create)
  // - Upgrade: paid && order.used belum true (nunggu webhook merge fitur)
  const waitingBase    = isPaid && !isUpgrade && !order?.invitation_slug;
  const waitingUpgrade = isPaid && isUpgrade && !order?.used;
  const waitingWebhook = waitingBase || waitingUpgrade;

  // redirect login bila belum login
  if (authStatus === "unauthenticated") {
    return (
      <UserLayout>
        <div className="text-center py-10">
          <div className="alert alert-warning d-inline-block text-start">
            <div className="fw-bold mb-2">Butuh Login</div>
            <div className="text-gray-700">Silakan login untuk melihat detail pesanan ini.</div>
          </div>
          <div className="mt-6">
            <Link href="/login" className="btn btn-primary">Login</Link>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="card" id="kt_order_success">
        <div className="card-body p-lg-17">
          <div className="mb-13 text-center">
            <h1 className="fs-2hx fw-bold mb-5">Status Pembayaran</h1>
            <div className="text-gray-600 fw-semibold fs-5">
              Ringkasan status pesanan dan langkah berikutnya.
            </div>
          </div>

          {loading && (
            <div className="text-center py-10">
              <div className="spinner-border text-primary" role="status" />
              <div className="text-gray-600 fw-semibold mt-4">
                Mengecek status pesanan…
              </div>
            </div>
          )}

          {!loading && err && (
            <div className="text-center py-10">
              <div className="alert alert-danger d-inline-block text-start">
                <div className="fw-bold mb-2">Kesalahan</div>
                <div className="text-gray-700">{err}</div>
              </div>
              <div className="mt-6">
                <Link href="/dashboard" className="btn btn-primary">Ke Dashboard</Link>
              </div>
            </div>
          )}

          {!loading && !err && !order && (
            <div className="text-center text-muted py-10">
              Order tidak ditemukan.
              <div className="mt-6">
                <Link href="/dashboard" className="btn btn-primary">Ke Dashboard</Link>
              </div>
            </div>
          )}

          {!loading && !err && order && (
            <>
              <div className="row g-10">
                <div className="col-xl-6">
                  <div className="d-flex flex-column flex-center rounded-3 py-10 px-8 bg-light bg-opacity-75 h-100">
                    <div className="mb-5">
                      <span className={`badge ${statusInfo.badge} fw-bold text-uppercase`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="text-center mb-7">
                      <h3 className="text-gray-900 mb-2 fw-bolder">Order #{order._id}</h3>
                      <div className="text-gray-600 fw-semibold">
                        Dibuat: <span className="text-gray-800">{formatDate(order.createdAt)}</span>
                        <br />
                        Dibayar: <span className="text-gray-800">{formatDate(order.paidAt)}</span>
                      </div>
                    </div>

                    <div className="w-100">
                      <div className="d-flex align-items-center mb-3">
                        <span className="fw-semibold fs-6 text-gray-800 flex-grow-1 pe-3">Paket</span>
                        <span className="fw-bold">{order.package?.name || "-"}</span>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <span className="fw-semibold fs-6 text-gray-800 flex-grow-1 pe-3">Tipe</span>
                        <span className="fw-bold text-gray-700">{order.package?.type || "-"}</span>
                      </div>

                      {/* Label jenis transaksi + undangan tujuan untuk upgrade */}
                      {isUpgrade && (
                        <>
                          <div className="d-flex align-items-center mb-3">
                            <span className="fw-semibold fs-6 text-gray-800 flex-grow-1 pe-3">Jenis Transaksi</span>
                            <span className="badge badge-light-primary">Upgrade Fitur</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="fw-semibold fs-6 text-gray-800 flex-grow-1 pe-3">Undangan Tujuan</span>
                            <span className="fw-bold text-gray-700">{targetSlug || "-"}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-xl-6">
                  <div className="d-flex flex-column justify-content-between rounded-3 py-10 px-8 bg-light bg-opacity-50 h-100">
                    <div className="mb-8">
                      <div className="d-flex align-items-center mb-3">
                        <span className="fw-semibold fs-6 text-gray-800 flex-grow-1 pe-3">Status</span>
                        <span className={`fw-bold ${statusInfo.color}`}>{statusInfo.label}</span>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <span className="fw-semibold fs-6 text-gray-800 flex-grow-1 pe-3">Digunakan</span>
                        <span className="fw-bold">{order.used ? "Sudah" : "Belum"}</span>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <span className="fw-semibold fs-6 text-gray-800 flex-grow-1 pe-3">Invoice</span>
                        {order.invoice_url ? (
                          <a href={order.invoice_url} target="_blank" rel="noreferrer" className="fw-bold text-primary text-decoration-underline">
                            Lihat Invoice
                          </a>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </div>

                      {/* fitur upgrade yang dibeli */}
                      {isUpgrade && Array.isArray(order.selectedFeatures) && order.selectedFeatures.length > 0 && (
                        <div className="mt-5">
                          <div className="fw-bold mb-2">Fitur Diaktifkan</div>
                          <div className="d-flex flex-wrap gap-2">
                            {order.selectedFeatures.map((k) => (
                              <span key={k} className="badge badge-light-primary">{k}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* add-on terpilih saat paket custom (tetap tampilkan) */}
                      {!isUpgrade && Array.isArray(order.selectedFeatures) && order.selectedFeatures.length > 0 && (
                        <div className="mt-5">
                          <div className="fw-bold mb-2">Add-on Terpilih</div>
                          <div className="d-flex flex-wrap gap-2">
                            {order.selectedFeatures.map((k) => (
                              <span key={k} className="badge badge-light-primary">{k}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {waitingWebhook && (
                        <div className="alert alert-info d-flex align-items-center mt-6">
                          <i className="ki-duotone ki-time fs-2 me-3"><span className="path1"></span><span className="path2"></span></i>
                          <div>
                            {isUpgrade
                              ? "Pembayaran sudah diterima. Kami sedang menerapkan upgrade ke undangan Anda…"
                              : "Pembayaran sudah diterima. Kami sedang menyiapkan undangan Anda…"}
                            <div className="fs-7 text-muted">Halaman ini akan memperbarui otomatis begitu proses selesai.</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="d-flex flex-wrap gap-3">
                      {/* ==== Upgrade flow ==== */}
                      {isPaid && isUpgrade && !waitingWebhook && (
                        <>
                          {targetSlug ? (
                            <>
                              <Link href={`/edit-undangan/${targetSlug}`} className="btn btn-primary px-7">
                                Buka Editor
                              </Link>
                              <Link href={`/edit-undangan/${targetSlug}/upgrade`} className="btn btn-light-primary px-7">
                                Upgrade Fitur Lainnya
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link href="/edit-undangan" className="btn btn-primary px-7">
                                Buka Editor
                              </Link>
                            </>
                          )}
                          <Link href="/dashboard" className="btn btn-light px-7">Ke Dashboard</Link>
                        </>
                      )}

                      {/* ==== Base purchase flow ==== */}
                      {isPaid && !isUpgrade && !waitingWebhook && !isUnused && order.invitation_slug && (
                        <>
                          <Link href={`/edit-undangan/${order.invitation_slug}`} className="btn btn-primary px-7">
                            Buka Editor
                          </Link>
                          <Link href="/dashboard" className="btn btn-light px-7">Ke Dashboard</Link>
                        </>
                      )}

                      {isPaid && !isUpgrade && (isUnused || !order.invitation_slug) && (
                        <>
                          <Link href="/buat-undangan" className="btn btn-primary px-7">
                            Buat Undangan Sekarang
                          </Link>
                          <Link href="/dashboard" className="btn btn-light px-7">Ke Dashboard</Link>
                        </>
                      )}

                      {/* Belum bayar */}
                      {!isPaid && !isExpired && !isCanceled && (
                        <>
                          {order.invoice_url && (
                            <a href={order.invoice_url} target="_blank" rel="noreferrer" className="btn btn-warning px-7">
                              Lanjutkan Pembayaran
                            </a>
                          )}
                          <Link href="/dashboard" className="btn btn-light px-7">Ke Dashboard</Link>
                        </>
                      )}

                      {/* Expired / Canceled */}
                      {(isExpired || isCanceled) && (
                        <>
                          <Link href="/paket" className="btn btn-primary px-7">Beli Paket Baru</Link>
                          <Link href="/dashboard" className="btn btn-light px-7">Ke Dashboard</Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
