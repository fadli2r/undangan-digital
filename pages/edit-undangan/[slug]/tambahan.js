// pages/edit-undangan/[slug]/tambahan.js  (atau path kamu saat ini)
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserLayout from "@/components/layouts/UserLayout";
import BackButton from "@/components/BackButton";
import { showAlert } from "@/utils/sweetAlert";

export default function EditTambahan() {
  const router = useRouter();
  const { slug } = router.query;

  const [form, setForm] = useState({
    tambahan: {
      catatan: "",
      dresscode: { baju: "#000000", celana: "#000000" },
      maps_url: "",
      protokol: "",
      musik: { enabled: false, url: "", type: "file", autoplay: true },
      live_streaming: { enabled: false, youtube_url: "" },
    },
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing data
  useEffect(() => {
    if (!slug) return;
    let aborted = false;

    (async () => {
      try {
        const res = await fetch(`/api/invitation/detail?slug=${slug}`, { cache: "no-store" });
        const data = await res.json();
        if (!aborted && data?.undangan) {
          setForm((prev) => ({
            tambahan: {
              ...prev.tambahan,
              ...(data.undangan.tambahan || {}),
              dresscode: {
                baju: data.undangan?.tambahan?.dresscode?.baju || prev.tambahan.dresscode.baju,
                celana: data.undangan?.tambahan?.dresscode?.celana || prev.tambahan.dresscode.celana,
              },
              musik: {
                enabled: !!data?.undangan?.tambahan?.musik?.enabled,
                url: data?.undangan?.tambahan?.musik?.url || "",
                type: data?.undangan?.tambahan?.musik?.type || "file",
                autoplay: data?.undangan?.tambahan?.musik?.autoplay ?? true,
              },
              live_streaming: {
                enabled: !!data?.undangan?.tambahan?.live_streaming?.enabled,
                youtube_url: data?.undangan?.tambahan?.live_streaming?.youtube_url || "",
              },
            },
          }));
        }
      } catch (e) {
        console.error(e);
        showAlert.error("Gagal memuat data", "Silakan muat ulang halaman.");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [slug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // live_streaming.*
    if (name.startsWith("live_streaming.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        tambahan: {
          ...prev.tambahan,
          live_streaming: {
            ...prev.tambahan.live_streaming,
            [field]: type === "checkbox" ? checked : value,
          },
        },
      }));
      return;
    }

    // musik.*
    if (name.startsWith("musik.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        tambahan: {
          ...prev.tambahan,
          musik: {
            ...prev.tambahan.musik,
            [field]: type === "checkbox" ? checked : value,
          },
        },
      }));
      return;
    }

    // dresscode.baju / dresscode.celana
    if (name.startsWith("dresscode.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        tambahan: {
          ...prev.tambahan,
          dresscode: {
            ...prev.tambahan.dresscode,
            [field]: value,
          },
        },
      }));
      return;
    }

    // lainnya: catatan, maps_url, protokol
    setForm((prev) => ({
      ...prev,
      tambahan: { ...prev.tambahan, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showAlert.loading("Menyimpan...", "Mohon tunggu sebentar");
    setSaving(true);

    try {
      const res = await fetch("/api/invitation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          field: { tambahan: form.tambahan },
        }),
      });

      if (res.ok) {
        showAlert.success("Berhasil", "Informasi tambahan berhasil disimpan");
      } else {
        const data = await res.json().catch(() => ({}));
        showAlert.error("Gagal", data?.message || "Gagal menyimpan perubahan");
      }
    } catch (err) {
      console.error(err);
      showAlert.error("Error", "Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (!slug || loading) {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center py-20">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <BackButton />

      <div className="card">
        {/* begin::Card header */}
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Informasi Tambahan</h2>
          </div>
        </div>
        {/* end::Card header */}

        {/* begin::Card body */}
        <div className="card-body pt-0">
          <form onSubmit={handleSubmit} className="mt-5">
            {/* =============== Live Streaming =============== */}
            <div className="d-flex flex-column mb-10 fv-row rounded-3 p-7 border border-dashed border-gray-300">
              <div className="fs-5 fw-bold form-label mb-3">
                Live Streaming{" "}
                <span
                  className="ms-2 cursor-pointer"
                  data-bs-toggle="popover"
                  data-bs-trigger="hover"
                  data-bs-html="true"
                  data-bs-content="Aktifkan siaran langsung via YouTube."
                >
                  <i className="ki-duotone ki-information fs-7">
                    <span className="path1" />
                    <span className="path2" />
                    <span className="path3" />
                  </i>
                </span>
              </div>

              <label className="form-check form-check-custom form-check-solid mb-5">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="live_streaming.enabled"
                  checked={form.tambahan.live_streaming.enabled}
                  onChange={handleChange}
                />
                <span className="form-check-label text-gray-600">
                  Aktifkan Live Streaming
                </span>
              </label>

              {form.tambahan.live_streaming.enabled && (
                <div className="fv-row">
                  <label className="form-label required">Link YouTube Live</label>
                  <input
                    type="url"
                    name="live_streaming.youtube_url"
                    value={form.tambahan.live_streaming.youtube_url}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="form-control form-control-solid"
                  />
                  <div className="form-text">
                    Masukkan link YouTube Live atau Video
                  </div>
                </div>
              )}
            </div>

            {/* =============== Musik Background =============== */}
            <div className="d-flex flex-column mb-10 fv-row rounded-3 p-7 border border-dashed border-gray-300">
              <div className="fs-5 fw-bold form-label mb-3">
                Musik Background{" "}
                <span
                  className="ms-2 cursor-pointer"
                  data-bs-toggle="popover"
                  data-bs-trigger="hover"
                  data-bs-html="true"
                  data-bs-content="Tambahkan musik latar untuk undangan."
                >
                  <i className="ki-duotone ki-information fs-7">
                    <span className="path1" />
                    <span className="path2" />
                    <span className="path3" />
                  </i>
                </span>
              </div>

              <label className="form-check form-check-custom form-check-solid mb-5">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="musik.enabled"
                  checked={form.tambahan.musik.enabled}
                  onChange={handleChange}
                />
                <span className="form-check-label text-gray-600">
                  Aktifkan Musik
                </span>
              </label>

              {form.tambahan.musik.enabled && (
                <>
                  <div className="fv-row mb-5">
                    <label className="form-label required">URL Musik</label>
                    <input
                      type="url"
                      name="musik.url"
                      value={form.tambahan.musik.url}
                      onChange={handleChange}
                      placeholder="URL file musik, YouTube, atau Spotify"
                      className="form-control form-control-solid"
                    />
                  </div>

                  <div className="fv-row mb-5">
                    <label className="form-label">Tipe</label>
                    <select
                      name="musik.type"
                      value={form.tambahan.musik.type}
                      onChange={handleChange}
                      className="form-select form-select-solid"
                    >
                      <option value="file">File Audio</option>
                      <option value="youtube">YouTube</option>
                      <option value="spotify">Spotify</option>
                    </select>
                  </div>

                  <label className="form-check form-check-custom form-check-solid">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="musik.autoplay"
                      checked={form.tambahan.musik.autoplay}
                      onChange={handleChange}
                    />
                    <span className="form-check-label text-gray-600">Autoplay</span>
                  </label>
                </>
              )}
            </div>

            {/* =============== Catatan Tambahan =============== */}
            <div className="d-flex flex-column mb-10 fv-row">
              <div className="fs-5 fw-bold form-label mb-3">
                Catatan Tambahan{" "}
                <span
                  className="ms-2 cursor-pointer"
                  data-bs-toggle="popover"
                  data-bs-trigger="hover"
                  data-bs-html="true"
                  data-bs-content="Pesan singkat yang akan ditampilkan kepada tamu."
                >
                  <i className="ki-duotone ki-information fs-7">
                    <span className="path1" />
                    <span className="path2" />
                    <span className="path3" />
                  </i>
                </span>
              </div>
              <textarea
                name="catatan"
                value={form.tambahan.catatan}
                onChange={handleChange}
                placeholder="Catatan tambahan untuk tamu..."
                className="form-control form-control-solid rounded-3"
                rows={4}
              />
            </div>

            {/* =============== Dress Code =============== */}
            <div className="d-flex flex-column mb-10 fv-row">
              <div className="fs-5 fw-bold form-label mb-5">Dress Code</div>
              <div className="row g-5">
                <div className="col-md-6">
                  <div className="card card-flush shadow-sm h-100">
                    <div className="card-header">
                      <h3 className="card-title fw-bold">Warna Baju</h3>
                    </div>
                    <div className="card-body">
                      <input
                        type="color"
                        name="dresscode.baju"
                        value={form.tambahan.dresscode.baju}
                        onChange={handleChange}
                        className="form-control form-control-color w-100 h-50px"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card card-flush shadow-sm h-100">
                    <div className="card-header">
                      <h3 className="card-title fw-bold">Warna Celana/Rok</h3>
                    </div>
                    <div className="card-body">
                      <input
                        type="color"
                        name="dresscode.celana"
                        value={form.tambahan.dresscode.celana}
                        onChange={handleChange}
                        className="form-control form-control-color w-100 h-50px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =============== Google Maps Embed =============== */}
            <div className="d-flex flex-column mb-10 fv-row">
              <div className="fs-5 fw-bold form-label mb-3">
                Google Maps Embed{" "}
                <span
                  className="ms-2 cursor-pointer"
                  data-bs-toggle="popover"
                  data-bs-trigger="hover"
                  data-bs-html="true"
                  data-bs-content="Paste iframe embed code Google Maps. Buka Google Maps → Share → Embed a map → Copy HTML."
                >
                  <i className="ki-duotone ki-information fs-7">
                    <span className="path1" />
                    <span className="path2" />
                    <span className="path3" />
                  </i>
                </span>
              </div>
              <textarea
                name="maps_url"
                value={form.tambahan.maps_url}
                onChange={handleChange}
                placeholder="Paste iframe embed code dari Google Maps di sini..."
                className="form-control form-control-solid rounded-3"
                rows={4}
              />
            </div>

            {/* =============== Protokol Kesehatan =============== */}
            <div className="d-flex flex-column mb-10 fv-row">
              <div className="fs-5 fw-bold form-label mb-3">Protokol Kesehatan</div>
              <textarea
                name="protokol"
                value={form.tambahan.protokol}
                onChange={handleChange}
                placeholder="Protokol kesehatan yang harus dipatuhi..."
                className="form-control form-control-solid rounded-3"
                rows={4}
              />
            </div>

            {/* =============== Actions =============== */}
            <div className="d-flex justify-content-end">
              <button type="button" className="btn btn-light me-3" onClick={() => router.back()}>
                Batal
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving && <span className="spinner-border spinner-border-sm me-2" />}
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
        {/* end::Card body */}
      </div>
    </UserLayout>
  );
}
