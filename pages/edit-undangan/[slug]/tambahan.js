import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";

export default function EditTambahan() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [form, setForm] = useState({
    tambahan: {
      catatan: "",
      dresscode: {
        baju: "#000000",
        celana: "#000000"
      },
      maps_url: "",
      protokol: "",
      musik: {
        enabled: false,
        url: "",
        type: "file",
        autoplay: true
      },
      live_streaming: {
        enabled: false,
        youtube_url: ""
      }
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Load existing data
  useEffect(() => {
    if (!slug) return;

    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.undangan) {
          setForm({
            tambahan: {
              ...form.tambahan,
              ...data.undangan.tambahan
            }
          });
        }
      });
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/invitation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          field: {
            tambahan: form.tambahan
          }
        }),
      });

      if (res.ok) {
        setSuccess("Berhasil menyimpan perubahan!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Gagal menyimpan perubahan");
      }
    } catch (err) {
      setError("Terjadi kesalahan");
      console.error(err);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('live_streaming.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        tambahan: {
          ...prev.tambahan,
          live_streaming: {
            ...prev.tambahan.live_streaming,
            [field]: type === 'checkbox' ? checked : value
          }
        }
      }));
    } else if (name.startsWith('musik.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        tambahan: {
          ...prev.tambahan,
          musik: {
            ...prev.tambahan.musik,
            [field]: type === 'checkbox' ? checked : value
          }
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        tambahan: {
          ...prev.tambahan,
          [name]: value
        }
      }));
    }
  };

  if (!slug) return null;

  return (
    <UserLayout>
      <BackButton />
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Informasi Tambahan</h2>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-5">
              {/* Live Streaming Section */}
              <div className="col-12">
                <div className="card card-flush shadow-sm">
                  <div className="card-header">
                    <h3 className="card-title fw-bold">Live Streaming</h3>
                  </div>
                  <div className="card-body">
                    <div className="mb-5">
                      <label className="form-check form-check-custom form-check-solid">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="live_streaming.enabled"
                          checked={form.tambahan.live_streaming.enabled}
                          onChange={handleChange}
                        />
                        <span className="form-check-label fw-semibold">
                          Aktifkan Live Streaming
                        </span>
                      </label>
                    </div>
                    {form.tambahan.live_streaming.enabled && (
                      <div>
                        <label className="form-label required">Link YouTube Live</label>
                        <input
                          type="url"
                          name="live_streaming.youtube_url"
                          value={form.tambahan.live_streaming.youtube_url}
                          onChange={handleChange}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="form-control"
                        />
                        <div className="form-text">
                          Masukkan link YouTube Live atau Video
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Musik Background */}
              <div className="col-12">
                <div className="card card-flush shadow-sm">
                  <div className="card-header">
                    <h3 className="card-title fw-bold">Musik Background</h3>
                  </div>
                  <div className="card-body">
                    <div className="mb-5">
                      <label className="form-check form-check-custom form-check-solid">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="musik.enabled"
                          checked={form.tambahan.musik.enabled}
                          onChange={handleChange}
                        />
                        <span className="form-check-label fw-semibold">
                          Aktifkan Musik
                        </span>
                      </label>
                    </div>
                    {form.tambahan.musik.enabled && (
                      <>
                        <div className="mb-5">
                          <label className="form-label required">URL Musik</label>
                          <input
                            type="url"
                            name="musik.url"
                            value={form.tambahan.musik.url}
                            onChange={handleChange}
                            placeholder="URL file musik atau YouTube"
                            className="form-control"
                          />
                        </div>
                        <div className="mb-5">
                          <label className="form-label">Tipe</label>
                          <select
                            name="musik.type"
                            value={form.tambahan.musik.type}
                            onChange={handleChange}
                            className="form-select"
                          >
                            <option value="file">File Audio</option>
                            <option value="youtube">YouTube</option>
                            <option value="spotify">Spotify</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-check form-check-custom form-check-solid">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="musik.autoplay"
                              checked={form.tambahan.musik.autoplay}
                              onChange={handleChange}
                            />
                            <span className="form-check-label fw-semibold">
                              Autoplay
                            </span>
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Catatan */}
              <div className="col-md-6">
                <div className="card card-flush shadow-sm h-100">
                  <div className="card-header">
                    <h3 className="card-title fw-bold">Catatan Tambahan</h3>
                  </div>
                  <div className="card-body">
                    <textarea
                      name="catatan"
                      value={form.tambahan.catatan}
                      onChange={handleChange}
                      placeholder="Catatan tambahan untuk tamu..."
                      className="form-control"
                      rows={5}
                    />
                  </div>
                </div>
              </div>

              {/* Dress Code */}
              <div className="col-md-6">
                <div className="card card-flush shadow-sm h-100">
                  <div className="card-header">
                    <h3 className="card-title fw-bold">Dress Code</h3>
                  </div>
                  <div className="card-body">
                    <div className="row g-5">
                      <div className="col-6">
                        <label className="form-label">Warna Baju</label>
                        <input
                          type="color"
                          name="dresscode.baju"
                          value={form.tambahan.dresscode.baju}
                          onChange={(e) => {
                            setForm(prev => ({
                              ...prev,
                              tambahan: {
                                ...prev.tambahan,
                                dresscode: {
                                  ...prev.tambahan.dresscode,
                                  baju: e.target.value
                                }
                              }
                            }));
                          }}
                          className="form-control form-control-color w-100 h-50px"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label">Warna Celana/Rok</label>
                        <input
                          type="color"
                          name="dresscode.celana"
                          value={form.tambahan.dresscode.celana}
                          onChange={(e) => {
                            setForm(prev => ({
                              ...prev,
                              tambahan: {
                                ...prev.tambahan,
                                dresscode: {
                                  ...prev.tambahan.dresscode,
                                  celana: e.target.value
                                }
                              }
                            }));
                          }}
                          className="form-control form-control-color w-100 h-50px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maps URL */}
              <div className="col-12">
                <div className="card card-flush shadow-sm">
                  <div className="card-header">
                    <h3 className="card-title fw-bold">Google Maps Embed</h3>
                  </div>
                  <div className="card-body">
                    <textarea
                      name="maps_url"
                      value={form.tambahan.maps_url}
                      onChange={handleChange}
                      placeholder="Paste iframe embed code dari Google Maps di sini..."
                      className="form-control"
                      rows={4}
                    />
                    <div className="form-text">
                      Untuk mendapatkan embed code: Buka Google Maps → Pilih lokasi → Share → Embed a map → Copy HTML
                    </div>
                  </div>
                </div>
              </div>

              {/* Protokol */}
              <div className="col-12">
                <div className="card card-flush shadow-sm">
                  <div className="card-header">
                    <h3 className="card-title fw-bold">Protokol Kesehatan</h3>
                  </div>
                  <div className="card-body">
                    <textarea
                      name="protokol"
                      value={form.tambahan.protokol}
                      onChange={handleChange}
                      placeholder="Protokol kesehatan yang harus dipatuhi..."
                      className="form-control"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            {success && (
              <div className="alert alert-success mt-8">
                <i className="ki-duotone ki-check-circle fs-2 me-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                {success}
              </div>
            )}

            {error && (
              <div className="alert alert-danger mt-8">
                <i className="ki-duotone ki-cross-circle fs-2 me-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                {error}
              </div>
            )}

            <div className="text-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
