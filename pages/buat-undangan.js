// pages/buat-undangan/index.js
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import UserLayout from "@/components/layouts/UserLayout";
import { defaultTemplateList as templateList } from "../data/templates";

const EDIT_PATH = (slug) => `/edit-undangan/${slug}`;

function sanitizeSlug(raw) {
  return String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BuatUndangan() {
  const router = useRouter();
  const { status } = useSession();
  const redirectedRef = useRef(false);

  const { template, orderId: orderIdFromQS } = router.query;
  const templateObj = useMemo(
    () => templateList.find((tpl) => tpl.slug === template),
    [template]
  );

  const [form, setForm] = useState({
    nama_pria: "",
    nama_wanita: "",
    tanggal: "",
    waktu: "",
    lokasi: "",
    alamat: "",
    custom_slug: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  // user info (legacy quota badge – opsional)
  const [me, setMe] = useState(null);

  // order/entitlement
  const [order, setOrder] = useState(null);        // detail order (kalau orderId ada)
  const [orderError, setOrderError] = useState("");
  const [effectiveOrderId, setEffectiveOrderId] = useState(null); // orderId yang dipakai

  // Cek login + muat entitlement (order)
  useEffect(() => {
    if (!router.isReady || status === "loading") return;

    let aborted = false;
    (async () => {
      try {
        // muat user (untuk badge quota & nama saja)
        const meRes = await fetch("/api/user/me", { cache: "no-store" });
        const meData = await meRes.json();

        if (!meData?.loggedIn) {
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            router.replace("/login");
          }
          return;
        }
        if (!aborted) setMe(meData);

        // tentukan order yang dipakai
        const id = Array.isArray(orderIdFromQS) ? orderIdFromQS[0] : orderIdFromQS;

        if (id) {
          // fetch detail order by id
          const r = await fetch(`/api/orders/${id}`);
          const j = await r.json();
          if (r.ok) {
            if (!aborted) {
              setOrder(j.order);
              setEffectiveOrderId(j.order?._id || id);
              if (j.order?.status !== "paid") {
                setOrderError("Pembayaran belum terkonfirmasi. Tunggu sebentar lalu refresh.");
              } else if (j.order?.used) {
                setOrderError("Order ini sudah digunakan untuk undangan lain.");
              }
            }
          } else {
            if (!aborted) {
              setOrderError(j.message || "Gagal memuat order.");
            }
          }
        } else {
          // tidak ada orderId di URL → ambil slot siap-pakai (paid & unused) tertua
          const r = await fetch("/api/orders/available");
          const j = await r.json();
          if (r.ok && Array.isArray(j.available) && j.available.length) {
            if (!aborted) {
              setEffectiveOrderId(j.available[0]._id);
              setOrder({
                _id: j.available[0]._id,
                status: "paid",
                used: false,
                package: j.available[0].packageId || null, // ✅ ambil dari populate("packageId")
              });
            }
          } else {
            if (!aborted) {
              setOrderError("Kamu belum punya slot undangan aktif. Silakan beli paket terlebih dahulu.");
            }
          }
        }
      } catch (err) {
        if (!aborted) setOrderError("Gagal memuat data. Coba ulang beberapa saat lagi.");
      } finally {
        if (!aborted) setChecking(false);
      }
    })();

    return () => { aborted = true; };
  }, [router.isReady, status, router, orderIdFromQS]);

  const templateMissing = !template || !templateObj;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "custom_slug") {
      setForm((p) => ({ ...p, custom_slug: sanitizeSlug(value) }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const [currentStep, setCurrentStep] = useState(1);
  const nextStep = () => {
    if (currentStep === 1 && (!form.nama_pria || !form.nama_wanita)) {
      setError("Nama mempelai harus diisi");
      return;
    }
    if (currentStep === 2) {
      if (!form.tanggal || !form.waktu || !form.lokasi || !form.alamat) {
        setError("Lengkapi detail acara (tanggal, waktu, lokasi, alamat).");
        return;
      }
    }
    setError("");
    setCurrentStep((s) => Math.min(3, s + 1));
  };
  const prevStep = () => { setError(""); setCurrentStep((s) => Math.max(1, s - 1)); };
  const handleFormKeyDown = (e) => {
    if (e.key === "Enter" && currentStep !== 3) {
      e.preventDefault();
      e.stopPropagation();
      nextStep();
    }
  };

  // CREATE hanya di Step 3 dan jika entitlement valid
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    if (currentStep !== 3) return;

    if (!effectiveOrderId) {
      setError("Slot undangan tidak tersedia. Silakan beli paket terlebih dahulu.");
      return;
    }
    if (order && (order.status !== "paid" || order.used)) {
      setError(order.used ? "Order ini sudah digunakan." : "Pembayaran belum terkonfirmasi.");
      return;
    }
    if (!template) { setError("Template belum dipilih."); return; }
    if (!form.nama_pria || !form.nama_wanita || !form.tanggal || !form.waktu || !form.lokasi || !form.alamat) {
      setError("Semua field harus diisi.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderId: effectiveOrderId,    // ⬅️ penting: konsumsi order
        template,
        slug: form.custom_slug || undefined,
        pria: form.nama_pria,
        wanita: form.nama_wanita,
        tanggal: form.tanggal,
        waktu: form.waktu,
        // kirim lokasi digabung alamat agar informatif
        lokasi: form.alamat ? `${form.lokasi} — ${form.alamat}` : form.lokasi,
      };

      const res = await fetch("/api/invitation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : { message: await res.text() };

      if (res.ok && data?.slug) {
        router.push(EDIT_PATH(data.slug));
      } else {
        setError(data?.message || "Gagal membuat undangan.");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat membuat undangan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (!router.isReady || status === "loading" || checking) {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center min-h-300px">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </UserLayout>
    );
  }

  // Belum pilih template
  if (templateMissing) {
    return (
      <UserLayout>
        <div className="container py-10">
          <div className="card">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-2">Pilih Template Dulu</h3>
                <div className="text-muted">Silakan pilih template untuk mulai membuat undangan.</div>
              </div>
              <button className="btn btn-primary" onClick={() => router.push("/pilih-template")}>
                Pilih Template
              </button>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Tidak ada slot order
  if (!effectiveOrderId) {
    return (
      <UserLayout>
          <div className="alert alert-warning d-flex align-items-center p-8">
            <i className="ki-duotone ki-information-5 fs-2hx text-warning me-4">
              <span className="path1"></span><span className="path2"></span>
            </i>
            <div className="d-flex flex-column">
              <h3 className="mb-2">Belum punya slot undangan aktif</h3>
              <div className="fs-6 text-gray-700">
                {orderError || "Silakan pilih paket untuk mendapatkan slot undangan."}
              </div>
              <div className="mt-5">
                <button className="btn btn-primary me-3" onClick={() => router.push("/paket")}>
                  Lihat Paket
                </button>
                <button className="btn btn-light" onClick={() => router.push("/dashboard")}>
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      {/* Header */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="symbol symbol-60px me-5">
                  <img src={templateObj.thumbnail} alt={templateObj.name} className="w-20 h-100 rounded" />
                </div>
                <div className="flex-grow-1">
                  <h1 className="fs-2hx fw-bold text-gray-900 mb-2">Buat Undangan Baru</h1>
                  <div className="fs-6 text-gray-700">
                    Template: <span className="fw-bold text-primary">{templateObj.name}</span>
                  </div>
                  <div className="fs-7 text-gray-600">{templateObj.description}</div>
                  {order?.package?.name && (
  <>
    <div className="fs-7 text-gray-600 mt-2">
      Paket: <b>{order.package.name}</b>
    </div>

    {Array.isArray(order?.package?.featureKeys) && order.package.featureKeys.length > 0 && (
      <div className="fs-7 text-gray-600 mt-1">
        Fitur Termasuk: <span className="fw-semibold text-dark">
          {order.package.featureKeys.join(", ")}
        </span>
      </div>
    )}

    {Array.isArray(order?.package?.selectableFeatures) && order.package.selectableFeatures.length > 0 && (
      <div className="fs-7 text-gray-600 mt-1">
        Bisa Diupgrade: <span className="fw-normal text-muted">
          {order.package.selectableFeatures.join(", ")}
        </span>
      </div>
    )}
  </>
)}

                </div>
              </div>

              <div className="text-end">
                {typeof me?.quota === "number" && (
                  <div className="mb-2">
                    <span className="badge badge-light-success fs-base">
                      Sisa Kuota: <span className="fw-bold">{me?.quota ?? 0}</span>
                    </span>
                  </div>
                )}
                <button className="btn btn-light-primary btn-sm" onClick={() => router.push("/pilih-template")}>
                  <i className="ki-duotone ki-arrow-left fs-3"><span className="path1"></span><span className="path2"></span></i>
                  Ganti Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper + alert order status */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {orderError && (
                <div className="alert alert-warning mb-6">{orderError}</div>
              )}

              <div className="stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid gap-10">
                {/* Step indicators */}
                {[1,2,3].map(n => (
                  <div key={n} className={`flex-row-fluid py-lg-5 ${currentStep >= n ? "current" : ""}`}>
                    <div className="stepper-wrapper">
                      <div className="stepper-icon w-40px h-40px">
                        <span className={`stepper-number ${currentStep === n ? "text-primary" : currentStep > n ? "text-white" : "text-muted"}`}>{n}</span>
                      </div>
                      <div className="stepper-label">
                        <h3 className="stepper-title">
                          {n===1?"Data Mempelai":n===2?"Detail Acara":"Finalisasi"}
                        </h3>
                        <div className="stepper-desc fw-semibold">
                          {n===1?"Nama pengantin pria & wanita":n===2?"Tanggal, waktu & lokasi":"Review & publikasi"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center p-5 mt-6 mb-0">
                  <i className="ki-duotone ki-shield-cross fs-2hx text-danger me-4">
                    <span className="path1"></span><span className="path2"></span>
                  </i>
                  <div className="d-flex flex-column"><span>{error}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="row g-5 g-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} noValidate>
                {/* Step 1 */}
                {currentStep === 1 && (
                  <div className="w-100">
                    <div className="pb-10 pb-lg-15">
                      <h2 className="fw-bold d-flex align-items-center text-gray-900">
                        Data Mempelai
                        <i className="ki-duotone ki-information-5 fs-7 text-muted ms-2"><span className="path1"></span><span className="path2"></span><span className="path3"></span></i>
                      </h2>
                      <div className="text-muted fw-semibold fs-6">Masukkan nama lengkap kedua mempelai</div>
                    </div>

                    <div className="fv-row mb-8">
                      <label className="d-flex align-items-center fs-6 fw-semibold mb-2"><span className="required">Nama Mempelai Pria</span></label>
                      <input type="text" className="form-control form-control-solid" placeholder="Masukkan nama lengkap mempelai pria" name="nama_pria" value={form.nama_pria} onChange={handleChange} required />
                    </div>

                    <div className="fv-row mb-8">
                      <label className="d-flex align-items-center fs-6 fw-semibold mb-2"><span className="required">Nama Mempelai Wanita</span></label>
                      <input type="text" className="form-control form-control-solid" placeholder="Masukkan nama lengkap mempelai wanita" name="nama_wanita" value={form.nama_wanita} onChange={handleChange} required />
                    </div>

                    <div className="fv-row mb-8">
                      <label className="d-flex align-items-center fs-6 fw-semibold mb-2"><span>Link Custom (Opsional)</span></label>
                      <div className="input-group input-group-solid">
                        <span className="input-group-text">dreamslink.id/</span>
                        <input type="text" className="form-control form-control-solid" placeholder="nikahanku" name="custom_slug" value={form.custom_slug} onChange={handleChange} pattern="[a-z0-9-]+" />
                      </div>
                      <div className="form-text">Kosongkan untuk menggunakan link otomatis</div>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {currentStep === 2 && (
                  <div className="w-100">
                    <div className="pb-10 pb-lg-15">
                      <h2 className="fw-bold d-flex align-items-center text-gray-900">
                        Detail Acara
                        <i className="ki-duotone ki-information-5 fs-7 text-muted ms-2"><span className="path1"></span><span className="path2"></span><span className="path3"></span></i>
                      </h2>
                      <div className="text-muted fw-semibold fs-6">Informasi waktu dan tempat acara pernikahan</div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="fv-row mb-8">
                          <label className="d-flex align-items-center fs-6 fw-semibold mb-2"><span className="required">Tanggal Acara</span></label>
                          <input type="date" className="form-control form-control-solid" name="tanggal" value={form.tanggal} onChange={handleChange} required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="fv-row mb-8">
                          <label className="d-flex align-items-center fs-6 fw-semibold mb-2"><span className="required">Waktu Acara</span></label>
                          <input type="text" className="form-control form-control-solid" placeholder="10:00 - 13:00 WIB" name="waktu" value={form.waktu} onChange={handleChange} required />
                        </div>
                      </div>
                    </div>

                    <div className="fv-row mb-8">
                      <label className="d-flex align-items-center fs-6 fw-semibold mb-2"><span className="required">Lokasi Acara</span></label>
                      <input type="text" className="form-control form-control-solid" placeholder="Gedung Serbaguna, Hotel, dll" name="lokasi" value={form.lokasi} onChange={handleChange} required />
                    </div>

                    <div className="fv-row mb-8">
                      <label className="d-flex align-items-center fs-6 fw-semibold mb-2"><span className="required">Alamat Lengkap</span></label>
                      <textarea className="form-control form-control-solid" rows={4} placeholder="Alamat lengkap lokasi acara" name="alamat" value={form.alamat} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {currentStep === 3 && (
                  <div className="w-100">
                    <div className="pb-10 pb-lg-12">
                      <h2 className="fw-bold text-gray-900">Finalisasi</h2>
                      <div className="text-muted fw-semibold fs-6">Review data terakhir lalu buat undangan untuk masuk ke editor.</div>
                    </div>

                    <div className="notice d-flex bg-light-primary rounded border-primary border border-dashed p-6 mb-8">
                      <i className="ki-duotone ki-design-1 fs-2tx text-primary me-4"><span className="path1"></span><span className="path2"></span></i>
                      <div className="d-flex flex-stack flex-grow-1">
                        <div className="fw-semibold">
                          <div className="fs-6 text-gray-700"><strong>Template:</strong> {templateObj.name}</div>
                          <div className="fs-7 text-gray-600">{templateObj.description}</div>
                          <div className="fs-7 text-gray-600 mt-2">
                            URL: <b>dreamslink.id/{form.custom_slug || "<acak>"}</b>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row mb-8">
                      <div className="col-md-6">
                        <div className="card card-flush h-100">
                          <div className="card-header"><div className="card-title"><h3 className="fw-bold text-gray-900">Data Mempelai</h3></div></div>
                          <div className="card-body pt-0">
                            <div className="table-responsive">
                              <table className="table table-row-dashed table-row-gray-300 gy-7">
                                <tbody>
                                  <tr><td className="fw-bold text-muted">Mempelai Pria</td><td className="text-end text-gray-700 fw-bold">{form.nama_pria}</td></tr>
                                  <tr><td className="fw-bold text-muted">Mempelai Wanita</td><td className="text-end text-gray-700 fw-bold">{form.nama_wanita}</td></tr>
                                  <tr><td className="fw-bold text-muted">Link Custom</td><td className="text-end text-gray-700 fw-bold">{form.custom_slug || "Auto-generate"}</td></tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card card-flush h-100">
                          <div className="card-header"><div className="card-title"><h3 className="fw-bold text-gray-900">Detail Acara</h3></div></div>
                          <div className="card-body pt-0">
                            <div className="table-responsive">
                              <table className="table table-row-dashed table-row-gray-300 gy-7">
                                <tbody>
                                  <tr><td className="fw-bold text-muted">Tanggal</td><td className="text-end text-gray-700 fw-bold">{form.tanggal}</td></tr>
                                  <tr><td className="fw-bold text-muted">Waktu</td><td className="text-end text-gray-700 fw-bold">{form.waktu}</td></tr>
                                  <tr><td className="fw-bold text-muted">Lokasi</td><td className="text-end text-gray-700 fw-bold">{form.lokasi}</td></tr>
                                  <tr><td className="fw-bold text-muted">Alamat</td><td className="text-end text-gray-700 fw-bold">{form.alamat}</td></tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Navigasi */}
                <div className="d-flex flex-stack pt-10">
                  <div className="me-2">
                    {currentStep > 1 && (
                      <button type="button" className="btn btn-lg btn-light-primary me-3" onClick={prevStep}>
                        <i className="ki-duotone ki-arrow-left fs-3 me-1"><span className="path1"></span><span className="path2"></span></i>
                        Sebelumnya
                      </button>
                    )}
                  </div>
                  <div>
                    {currentStep < 3 ? (
                      <button type="button" className="btn btn-lg btn-primary" onClick={nextStep}>
                        Selanjutnya
                        <i className="ki-duotone ki-arrow-right fs-3 ms-2 me-0"><span className="path1"></span><span className="path2"></span></i>
                      </button>
                    ) : (
                      <button type="submit" className="btn btn-lg btn-primary" disabled={loading || (order && (order.status !== "paid" || order.used))}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm align-middle me-2"></span>
                            Membuat & Masuk ke Editor...
                          </>
                        ) : (
                          <>
                            <i className="ki-duotone ki-check fs-3 me-1"><span className="path1"></span><span className="path2"></span></i>
                            Buat Undangan & Mulai Edit
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
