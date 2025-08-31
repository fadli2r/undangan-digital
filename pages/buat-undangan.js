// pages/buat-undangan/index.js
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import UserLayout from "@/components/layouts/UserLayout";
import { templateList } from "@/data/templates";

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

  const { template } = router.query;
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
  const [me, setMe] = useState(null);
  const [quotaZero, setQuotaZero] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Cek login + quota
  useEffect(() => {
    if (!router.isReady || status === "loading") return;

    let aborted = false;
    (async () => {
      try {
        const res = await fetch("/api/user/me", { cache: "no-store" });
        const data = await res.json();

        if (!data?.loggedIn) {
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            router.replace("/login");
          }
          return;
        }

        if (!aborted) {
          setMe(data);
          setQuotaZero(!data?.canCreateInvitation);
        }
      } catch (err) {
        console.error("check /api/user/me failed:", err);
        if (!aborted) setQuotaZero(true);
      } finally {
        if (!aborted) setChecking(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [router.isReady, status, router]);

  const templateMissing = !template || !templateObj;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "custom_slug") {
      setForm((p) => ({ ...p, custom_slug: sanitizeSlug(value) }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

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

  const prevStep = () => {
    setError("");
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  // ⛔️ Cegah Enter submit di Step 1/2. Enter akan jadi "Next".
  const handleFormKeyDown = (e) => {
    if (e.key === "Enter") {
      if (currentStep !== 3) {
        e.preventDefault();
        e.stopPropagation();
        nextStep();
      }
    }
  };

  // CREATE hanya di Step 3
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    if (currentStep !== 3) {
      // safety guard
      return;
    }

    if (!me?.canCreateInvitation) {
      setError("Kuota kamu habis. Silakan order paket terlebih dahulu.");
      router.push("/paket");
      return;
    }

    if (!template) {
      setError("Template belum dipilih.");
      return;
    }
    if (!form.nama_pria || !form.nama_wanita || !form.tanggal || !form.waktu || !form.lokasi || !form.alamat) {
      setError("Semua field harus diisi.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        template,
        slug: form.custom_slug || undefined,
        pria: form.nama_pria,
        wanita: form.nama_wanita,
        tanggal: form.tanggal,
        waktu: form.waktu,
        lokasi: form.lokasi,
      };

      const res = await fetch("/api/invitation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const ct = res.headers.get("content-type") || "";
      let data;
      if (ct.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 200)}`);
      }

      if (res.ok && data?.slug) {
        // Sinkronkan badge kuota di UI
        setMe((prev) => (prev ? { ...prev, quota: Math.max(0, (prev.quota || 1) - 1) } : prev));
        // Masuk ke editor (bukan view)
        router.push(EDIT_PATH(data.slug));
      } else {
        if (res.status === 403) {
          setError("Kuota kamu habis. Silakan order paket terlebih dahulu.");
          router.push("/paket");
        } else {
          setError(data?.message || "Gagal membuat undangan.");
        }
      }
    } catch (err) {
      console.error("Error creating invitation:", err);
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

  // Kuota habis
  if (quotaZero) {
    return (
      <UserLayout>
        <div className="container py-10">
          <div className="alert alert-warning d-flex align-items-center p-8">
            <i className="ki-duotone ki-information-5 fs-2hx text-warning me-4">
              <span className="path1"></span><span className="path2"></span>
            </i>
            <div className="d-flex flex-column">
              <h3 className="mb-2">Kuota Undangan Habis</h3>
              <div className="fs-6 text-gray-700">
                Kamu tidak memiliki kuota untuk membuat undangan baru. Silakan pilih paket untuk menambah kuota.
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
                </div>
              </div>

              <div className="text-end">
                <div className="mb-2">
                  <span className="badge badge-light-success fs-base">
                    Sisa Kuota: <span className="fw-bold">{me?.quota ?? 0}</span>
                  </span>
                </div>
                <button className="btn btn-light-primary btn-sm" onClick={() => router.push("/pilih-template")}>
                  <i className="ki-duotone ki-arrow-left fs-3"><span className="path1"></span><span className="path2"></span></i>
                  Ganti Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper + Form */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid gap-10">
                {/* Step 1 */}
                <div className={`flex-row-fluid py-lg-5 ${currentStep >= 1 ? "current" : ""}`}>
                  <div className="stepper-wrapper">
                    <div className="stepper-icon w-40px h-40px">
                      <span className={`stepper-number ${currentStep === 1 ? "text-primary" : currentStep > 1 ? "text-white" : "text-muted"}`}>1</span>
                    </div>
                    <div className="stepper-label">
                      <h3 className="stepper-title">Data Mempelai</h3>
                      <div className="stepper-desc fw-semibold">Nama pengantin pria & wanita</div>
                    </div>
                  </div>
                </div>
                {/* Step 2 */}
                <div className={`flex-row-fluid py-lg-5 ${currentStep >= 2 ? "current" : ""}`}>
                  <div className="stepper-wrapper">
                    <div className="stepper-icon w-40px h-40px">
                      <span className={`stepper-number ${currentStep === 2 ? "text-primary" : currentStep > 2 ? "text-white" : "text-muted"}`}>2</span>
                    </div>
                    <div className="stepper-label">
                      <h3 className="stepper-title">Detail Acara</h3>
                      <div className="stepper-desc fw-semibold">Tanggal, waktu & lokasi</div>
                    </div>
                  </div>
                </div>
                {/* Step 3 */}
                <div className={`flex-row-fluid py-lg-5 ${currentStep >= 3 ? "current" : ""}`}>
                  <div className="stepper-wrapper">
                    <div className="stepper-icon w-40px h-40px">
                      <span className={`stepper-number ${currentStep === 3 ? "text-primary" : "text-muted"}`}>3</span>
                    </div>
                    <div className="stepper-label">
                      <h3 className="stepper-title">Finalisasi</h3>
                      <div className="stepper-desc fw-semibold">Review & publikasi</div>
                    </div>
                  </div>
                </div>
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
                        <span className="input-group-text">undangan/</span>
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
                      <button type="submit" className="btn btn-lg btn-primary" disabled={loading}>
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
