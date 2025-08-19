import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import MetronicUserLayout from "../components/layouts/MetronicUserLayout";
import { templateList } from "../data/templates";

export default function BuatUndangan() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { template } = router.query;
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
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Proteksi akses: hanya user paid (support Google/manual)
  useEffect(() => {
    const cekStatusUser = async () => {
      if (status === "loading") return;

      let email = session?.user?.email;
      let userData = null;

      try {
        if (email) {
          const res = await fetch(`/api/user-info?email=${email}`);
          if (res.ok) {
            const data = await res.json();
            userData = data.user;
          }
        } else if (typeof window !== "undefined") {
          const userLS = window.localStorage.getItem("user");
          if (userLS) {
            const userObj = JSON.parse(userLS);
            email = userObj.email;
            userData = userObj;
          }
        }

        if (!email) {
          router.replace("/login");
          return;
        }
        
        // Check user data
        if (!userData) {
          console.log("No user data found, redirecting to login");
          router.replace("/login");
          return;
        }
        
        // Check user status and quota
        if (userData.quota < 1) {
          console.log("User has no quota left");
          router.replace("/dashboard");
          return;
        }
        setUser(userData);
        setChecking(false);
      } catch (error) {
        console.error("Error checking user status:", error);
        setChecking(false);
      }
    };
    cekStatusUser();
  }, [session, status, router]);

  // Validasi template
  const templateObj = templateList.find(tpl => tpl.slug === template);
  useEffect(() => {
    if (!template) return;
    if (!templateObj) {
      router.replace("/pilih-template");
    }
  }, [template, templateObj, router]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validasi form
    if (!form.nama_pria || !form.nama_wanita || !form.tanggal || !form.waktu || !form.lokasi || !form.alamat) {
      setError("Semua field harus diisi.");
      setLoading(false);
      return;
    }

    // Validasi custom slug jika diisi
    if (form.custom_slug) {
      const slugPattern = /^[a-zA-Z0-9-]+$/;
      if (!slugPattern.test(form.custom_slug)) {
        setError("Link custom hanya boleh berisi huruf, angka, dan tanda hubung (-)");
        setLoading(false);
        return;
      }
      if (form.custom_slug.length < 3) {
        setError("Link custom minimal 3 karakter");
        setLoading(false);
        return;
      }
      if (form.custom_slug.length > 50) {
        setError("Link custom maksimal 50 karakter");
        setLoading(false);
        return;
      }
    }

    let email = session?.user?.email;
    if (!email && typeof window !== "undefined") {
      const userLS = window.localStorage.getItem("user");
      if (userLS) email = JSON.parse(userLS).email;
    }
    
    if (!email) {
      setError("User belum login.");
      setLoading(false);
      return;
    }
    
    if (!template) {
      setError("Template belum dipilih.");
      setLoading(false);
      return;
    }

    try {
      // Restructure the data to match the schema
      const invitationData = {
        template,
        user_email: email,
        custom_slug: form.custom_slug || undefined,
        mempelai: {
          pria: form.nama_pria,
          wanita: form.nama_wanita
        },
        acara_utama: {
          nama: "Resepsi",
          tanggal: form.tanggal,
          waktu: form.waktu,
          lokasi: form.lokasi,
          alamat: form.alamat
        }
      };

      const res = await fetch("/api/invitation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invitationData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Berhasil membuat undangan
        router.push(`/undangan/${data.slug}`);
      } else {
        setError(data.message || "Gagal membuat undangan.");
      }
    } catch (error) {
      console.error("Error creating invitation:", error);
      setError("Terjadi kesalahan saat membuat undangan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!form.nama_pria || !form.nama_wanita) {
        setError("Nama mempelai harus diisi");
        return;
      }
    }
    setError("");
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setError("");
    setCurrentStep(currentStep - 1);
  };

  if (status === "loading" || checking || !templateObj) {
    return (
      <MetronicUserLayout>
        <div className="d-flex justify-content-center align-items-center min-h-300px">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MetronicUserLayout>
    );
  }

  return (
    <MetronicUserLayout>
      {/* Page Header */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="symbol symbol-60px me-5">
                  <img src={templateObj.thumbnail} alt={templateObj.name} className="w-100 h-100 rounded" />
                </div>
                <div className="flex-grow-1">
                  <h1 className="fs-2hx fw-bold text-gray-900 mb-2">Buat Undangan Baru</h1>
                  <div className="fs-6 text-gray-700">
                    Template: <span className="fw-bold text-primary">{templateObj.name}</span>
                  </div>
                  <div className="fs-7 text-gray-600">{templateObj.description}</div>
                </div>
                <button
                  className="btn btn-light-primary btn-sm"
                  onClick={() => router.push("/pilih-template")}
                >
                  <i className="ki-duotone ki-arrow-left fs-3">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Ganti Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid gap-10" id="kt_create_account_stepper">
                {/* Step 1 */}
                <div className={`flex-row-fluid py-lg-5 ${currentStep >= 1 ? 'current' : ''}`}>
                  <div className="stepper-wrapper">
                    <div className="stepper-icon w-40px h-40px">
                      <i className={`stepper-check fas fa-check ${currentStep > 1 ? 'text-white' : ''}`}></i>
                      <span className={`stepper-number ${currentStep === 1 ? 'text-primary' : currentStep > 1 ? 'text-white' : 'text-muted'}`}>1</span>
                    </div>
                    <div className="stepper-label">
                      <h3 className="stepper-title">Data Mempelai</h3>
                      <div className="stepper-desc fw-semibold">Nama pengantin pria & wanita</div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`flex-row-fluid py-lg-5 ${currentStep >= 2 ? 'current' : ''}`}>
                  <div className="stepper-wrapper">
                    <div className="stepper-icon w-40px h-40px">
                      <i className={`stepper-check fas fa-check ${currentStep > 2 ? 'text-white' : ''}`}></i>
                      <span className={`stepper-number ${currentStep === 2 ? 'text-primary' : currentStep > 2 ? 'text-white' : 'text-muted'}`}>2</span>
                    </div>
                    <div className="stepper-label">
                      <h3 className="stepper-title">Detail Acara</h3>
                      <div className="stepper-desc fw-semibold">Tanggal, waktu & lokasi</div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`flex-row-fluid py-lg-5 ${currentStep >= 3 ? 'current' : ''}`}>
                  <div className="stepper-wrapper">
                    <div className="stepper-icon w-40px h-40px">
                      <i className={`stepper-check fas fa-check ${currentStep > 3 ? 'text-white' : ''}`}></i>
                      <span className={`stepper-number ${currentStep === 3 ? 'text-primary' : currentStep > 3 ? 'text-white' : 'text-muted'}`}>3</span>
                    </div>
                    <div className="stepper-label">
                      <h3 className="stepper-title">Finalisasi</h3>
                      <div className="stepper-desc fw-semibold">Review & publikasi</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="row g-5 g-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Data Mempelai */}
                {currentStep === 1 && (
                  <div className="w-100">
                    <div className="pb-10 pb-lg-15">
                      <h2 className="fw-bold d-flex align-items-center text-gray-900">
                        Data Mempelai
                        <i className="ki-duotone ki-information-5 fs-7 text-muted ms-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </h2>
                      <div className="text-muted fw-semibold fs-6">
                        Masukkan nama lengkap kedua mempelai
                      </div>
                    </div>

                    <div className="fv-row mb-8">
                      <label className="d-flex align-items-center fs-6 fw-semibold mb-2">
                        <span className="required">Nama Mempelai Pria</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-solid"
                        placeholder="Masukkan nama lengkap mempelai pria"
                        name="nama_pria"
                        value={form.nama_pria}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="fv-row mb-8">
                      <label className="d-flex align-items-center fs-6 fw-semibold mb-2">
                        <span className="required">Nama Mempelai Wanita</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-solid"
                        placeholder="Masukkan nama lengkap mempelai wanita"
                        name="nama_wanita"
                        value={form.nama_wanita}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="fv-row mb-8">
                      <label className="d-flex align-items-center fs-6 fw-semibold mb-2">
                        <span>Link Custom (Opsional)</span>
                        <i className="ki-duotone ki-information-5 fs-7 text-muted ms-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </label>
                      <div className="input-group input-group-solid">
                        <span className="input-group-text">undangan/</span>
                        <input
                          type="text"
                          className="form-control form-control-solid"
                          placeholder="nikahanku"
                          name="custom_slug"
                          value={form.custom_slug}
                          onChange={handleChange}
                          pattern="[a-zA-Z0-9-]+"
                        />
                      </div>
                      <div className="form-text">
                        Kosongkan untuk menggunakan link otomatis berdasarkan nama mempelai
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Detail Acara */}
                {currentStep === 2 && (
                  <div className="w-100">
                    <div className="pb-10 pb-lg-15">
                      <h2 className="fw-bold d-flex align-items-center text-gray-900">
                        Detail Acara
                        <i className="ki-duotone ki-information-5 fs-7 text-muted ms-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </h2>
                      <div className="text-muted fw-semibold fs-6">
                        Informasi waktu dan tempat acara pernikahan
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="fv-row mb-8">
                          <label className="d-flex align-items-center fs-6 fw-semibold mb-2">
                            <span className="required">Tanggal Acara</span>
                          </label>
                          <input
                            type="date"
                            className="form-control form-control-solid"
                            name="tanggal"
                            value={form.tanggal}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="fv-row mb-8">
                          <label className="d-flex align-items-center fs-6 fw-semibold mb-2">
                            <span className="required">Waktu Acara</span>
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-solid"
                            placeholder="10:00 - 13:00 WIB"
                            name="waktu"
                            value={form.waktu}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="fv-row mb-8">
                      <label className="d-flex align-items-center fs-6 fw-semibold mb-2">
                        <span className="required">Lokasi Acara</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-solid"
                        placeholder="Gedung Serbaguna, Hotel, dll"
                        name="lokasi"
                        value={form.lokasi}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="fv-row mb-8">
                      <label className="d-flex align-items-center fs-6 fw-semibold mb-2">
                        <span className="required">Alamat Lengkap</span>
                      </label>
                      <textarea
                        className="form-control form-control-solid"
                        rows="4"
                        placeholder="Alamat lengkap lokasi acara"
                        name="alamat"
                        value={form.alamat}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                  <div className="w-100">
                    <div className="pb-10 pb-lg-12">
                      <h2 className="fw-bold text-gray-900">Review Data Undangan</h2>
                      <div className="text-muted fw-semibold fs-6">
                        Periksa kembali data undangan sebelum dipublikasi
                      </div>
                    </div>

                    <div className="mb-0">
                      {/* Template Info */}
                      <div className="notice d-flex bg-light-primary rounded border-primary border border-dashed p-6 mb-8">
                        <i className="ki-duotone ki-design-1 fs-2tx text-primary me-4">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        <div className="d-flex flex-stack flex-grow-1">
                          <div className="fw-semibold">
                            <div className="fs-6 text-gray-700">
                              <strong>Template:</strong> {templateObj.name}
                            </div>
                            <div className="fs-7 text-gray-600">{templateObj.description}</div>
                          </div>
                        </div>
                      </div>

                      {/* Data Review */}
                      <div className="row mb-8">
                        <div className="col-md-6">
                          <div className="card card-flush h-100">
                            <div className="card-header">
                              <div className="card-title">
                                <h3 className="fw-bold text-gray-900">Data Mempelai</h3>
                              </div>
                            </div>
                            <div className="card-body pt-0">
                              <div className="table-responsive">
                                <table className="table table-row-dashed table-row-gray-300 gy-7">
                                  <tbody>
                                    <tr>
                                      <td className="fw-bold text-muted">Mempelai Pria</td>
                                      <td className="text-end text-gray-700 fw-bold">{form.nama_pria}</td>
                                    </tr>
                                    <tr>
                                      <td className="fw-bold text-muted">Mempelai Wanita</td>
                                      <td className="text-end text-gray-700 fw-bold">{form.nama_wanita}</td>
                                    </tr>
                                    <tr>
                                      <td className="fw-bold text-muted">Link Custom</td>
                                      <td className="text-end text-gray-700 fw-bold">
                                        {form.custom_slug || "Auto-generate"}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card card-flush h-100">
                            <div className="card-header">
                              <div className="card-title">
                                <h3 className="fw-bold text-gray-900">Detail Acara</h3>
                              </div>
                            </div>
                            <div className="card-body pt-0">
                              <div className="table-responsive">
                                <table className="table table-row-dashed table-row-gray-300 gy-7">
                                  <tbody>
                                    <tr>
                                      <td className="fw-bold text-muted">Tanggal</td>
                                      <td className="text-end text-gray-700 fw-bold">{form.tanggal}</td>
                                    </tr>
                                    <tr>
                                      <td className="fw-bold text-muted">Waktu</td>
                                      <td className="text-end text-gray-700 fw-bold">{form.waktu}</td>
                                    </tr>
                                    <tr>
                                      <td className="fw-bold text-muted">Lokasi</td>
                                      <td className="text-end text-gray-700 fw-bold">{form.lokasi}</td>
                                    </tr>
                                    <tr>
                                      <td className="fw-bold text-muted">Alamat</td>
                                      <td className="text-end text-gray-700 fw-bold">{form.alamat}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center p-5 mb-10">
                    <i className="ki-duotone ki-shield-cross fs-2hx text-danger me-4">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    <div className="d-flex flex-column">
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="d-flex flex-stack pt-10">
                  <div className="me-2">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        className="btn btn-lg btn-light-primary me-3"
                        onClick={prevStep}
                      >
                        <i className="ki-duotone ki-arrow-left fs-3 me-1">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        Sebelumnya
                      </button>
                    )}
                  </div>
                  <div>
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        className="btn btn-lg btn-primary"
                        onClick={nextStep}
                      >
                        Selanjutnya
                        <i className="ki-duotone ki-arrow-right fs-3 ms-2 me-0">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn btn-lg btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm align-middle me-2"></span>
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <i className="ki-duotone ki-check fs-3 me-1">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            Simpan & Lihat Undangan
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
    </MetronicUserLayout>
  );
}
