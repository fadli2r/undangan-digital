import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";
import { showAlert } from "@/utils/sweetAlert";

export default function Acara() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [undangan, setUndangan] = useState(null);
  const [acaraList, setAcaraList] = useState([]);
  const [acaraUtama, setAcaraUtama] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    tanggal: "",
    waktuMulai: "",
    waktuSelesai: "",
    lokasi: "",
    alamat: "",
  });
  const [editIndex, setEditIndex] = useState(-1);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // --- Utils waktu (kompat dengan field lama `waktu`) ---
  const normalizeTimes = (item) => {
    // Jika sudah pakai field baru, pakai itu
    if (item?.waktuMulai || item?.waktuSelesai) {
      return {
        waktuMulai: item.waktuMulai || "",
        waktuSelesai: item.waktuSelesai || "",
      };
    }
    // Kompat lama: parse "10:00" atau "10:00 - 12:00" / "10:00–12:00"
    const raw = String(item?.waktu || "").replace(/\s/g, "");
    if (!raw) return { waktuMulai: "", waktuSelesai: "" };
    const sepIdx = raw.indexOf("-") >= 0 ? raw.indexOf("-") : raw.indexOf("–");
    if (sepIdx > 0) {
      const start = raw.slice(0, sepIdx);
      const end = raw.slice(sepIdx + 1);
      return { waktuMulai: start || "", waktuSelesai: end || "" };
    }
    return { waktuMulai: raw, waktuSelesai: "" };
  };

  const makeWaktuLabel = (mulai, selesai) => {
    if (mulai && selesai) return `${mulai} – ${selesai}`;
    if (mulai && !selesai) return `${mulai} – selesai`;
    return "";
  };

  const waktuDisplay = (item) => {
    const { waktuMulai, waktuSelesai } = normalizeTimes(item);
    const label = makeWaktuLabel(waktuMulai, waktuSelesai);
    return label || (item?.waktu || "—");
  };

  // Fetch data undangan
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.undangan) {
          setUndangan(res.undangan);
          setAcaraList(res.undangan?.acara || []);
          setAcaraUtama(res.undangan?.acara_utama || null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, [slug]);

  // Handle input
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Format tanggal untuk display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Simpan acara baru / edit acara
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    showAlert.loading("Menyimpan...", "Mohon tunggu sebentar");

    try {
      const waktu = makeWaktuLabel(form.waktuMulai, form.waktuSelesai);
      const acaraData = {
        nama: form.nama,
        tanggal: new Date(form.tanggal).toISOString(),
        waktu, // label gabungan utk kompat tampilan lama
        waktuMulai: form.waktuMulai || "",
        waktuSelesai: form.waktuSelesai || "",
        lokasi: form.lokasi,
        alamat: form.alamat,
      };

      const newList = [...acaraList];
      if (editIndex >= 0) newList[editIndex] = acaraData;
      else newList.push(acaraData);

      const res = await fetch("/api/invitation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, field: { acara: newList } }),
      });

      if (res.ok) {
        setAcaraList(newList);
        setForm({
          nama: "",
          tanggal: "",
          waktuMulai: "",
          waktuSelesai: "",
          lokasi: "",
          alamat: "",
        });
        setEditIndex(-1);
        setSuccess("Acara berhasil disimpan");
        showAlert.success("Berhasil!", "Acara berhasil disimpan");
      } else {
        setError("Gagal menyimpan acara");
        showAlert.error("Gagal!", "Gagal menyimpan acara");
      }
    } catch (error) {
      console.error("Update error:", error);
      setError(error.message);
      showAlert.error("Error!", "Gagal menyimpan acara: " + error.message);
    }
  };

  // Edit acara
  const handleEdit = (idx) => {
    const ac = acaraList[idx];
    const { waktuMulai, waktuSelesai } = normalizeTimes(ac);
    setForm({
      nama: ac.nama || "",
      tanggal: ac.tanggal ? new Date(ac.tanggal).toISOString().split("T")[0] : "",
      waktuMulai,
      waktuSelesai,
      lokasi: ac.lokasi || "",
      alamat: ac.alamat || "",
    });
    setEditIndex(idx);
  };

  // Hapus acara
  const handleDelete = async (idx) => {
    showAlert.confirm(
      "Hapus Acara",
      "Apakah Anda yakin ingin menghapus acara ini?",
      "Ya, Hapus",
      "Batal",
      async (result) => {
        if (result.isConfirmed) {
          showAlert.loading("Menghapus...", "Mohon tunggu sebentar");
          const newList = acaraList.filter((_, i) => i !== idx);
          try {
            const res = await fetch("/api/invitation/update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug, field: { acara: newList } }),
            });
            if (res.ok) {
              setAcaraList(newList);
              setForm({
                nama: "",
                tanggal: "",
                waktuMulai: "",
                waktuSelesai: "",
                lokasi: "",
                alamat: "",
              });
              setEditIndex(-1);
              showAlert.success("Berhasil!", "Acara berhasil dihapus");
            } else {
              showAlert.error("Gagal!", "Gagal menghapus acara");
            }
          } catch (error) {
            console.error("Delete error:", error);
            showAlert.error("Error!", "Gagal menghapus acara: " + error.message);
          }
        }
      }
    );
  };

  // Set acara utama
  const handleSetUtama = async (acara) => {
    showAlert.loading("Menyimpan...", "Mohon tunggu sebentar");
    try {
      const res = await fetch("/api/invitation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, field: { acara_utama: acara } }),
      });
      if (res.ok) {
        setAcaraUtama(acara);
        showAlert.success("Berhasil!", "Acara utama berhasil diperbarui");
      } else {
        showAlert.error("Gagal!", "Gagal mengatur acara utama");
      }
    } catch (err) {
      console.error("Update error:", err);
      showAlert.error("Error!", "Gagal mengatur acara utama: " + err.message);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center min-h-300px">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!undangan) {
    return (
      <UserLayout>
        <div className="alert alert-info">
          <h4 className="alert-heading">Undangan Tidak Ditemukan</h4>
          <p>Data undangan yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.</p>
          <Link href="/edit-undangan" className="btn btn-primary">
            Kembali ke Daftar Undangan
          </Link>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <BackButton />
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Informasi Acara</h2>
          </div>
        </div>

        <div className="card-body">
          {/* Form tambah/edit acara */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="row g-5">
              <div className="col-md-6">
                <label className="form-label required">Nama Acara</label>
                <input
                  name="nama"
                  className="form-control"
                  value={form.nama}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Akad, Resepsi"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label required">Tanggal</label>
                <input
                  name="tanggal"
                  type="date"
                  className="form-control"
                  value={form.tanggal}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label required">Waktu Mulai</label>
                <input
                  name="waktuMulai"
                  type="time"
                  className="form-control"
                  value={form.waktuMulai}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Waktu Selesai</label>
                <input
                  name="waktuSelesai"
                  type="time"
                  className="form-control"
                  value={form.waktuSelesai}
                  onChange={handleChange}
                  placeholder="(opsional)"
                />
                <div className="form-text">Kosongkan jika acaranya sampai selesai</div>
              </div>

              <div className="col-md-6">
                <label className="form-label required">Lokasi</label>
                <input
                  name="lokasi"
                  className="form-control"
                  value={form.lokasi}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Masjid Al-Falah"
                />
              </div>

              <div className="col-12">
                <label className="form-label required">Alamat Lengkap</label>
                <textarea
                  name="alamat"
                  className="form-control"
                  value={form.alamat}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Jl. Masjid No.1, Jakarta"
                  rows="3"
                />
              </div>
            </div>

            {success && (
              <div className="alert alert-success mt-4">
                <i className="ki-duotone ki-check-circle fs-2 me-2" />
                {success}
              </div>
            )}

            {error && (
              <div className="alert alert-danger mt-4">
                <i className="ki-duotone ki-cross-circle fs-2 me-2" />
                {error}
              </div>
            )}

            <div className="mt-5">
              <button type="submit" className="btn btn-primary me-3" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                {editIndex >= 0 ? "Update Acara" : "Tambah Acara"}
              </button>

              {editIndex >= 0 && (
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => {
                    setForm({
                      nama: "",
                      tanggal: "",
                      waktuMulai: "",
                      waktuSelesai: "",
                      lokasi: "",
                      alamat: "",
                    });
                    setEditIndex(-1);
                  }}
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>

          {/* List acara */}
          <div className="separator separator-dashed my-8"></div>

          <div className="mb-4">
            <h3 className="card-title align-items-start flex-column mb-4">
              <span className="fw-bold mb-2">Daftar Acara</span>
              <span className="text-muted fw-semibold fs-7">
                Total {acaraList.length} acara
              </span>
            </h3>

            {acaraList.length === 0 && (
              <div className="alert alert-primary d-flex align-items-center p-5">
                <i className="ki-duotone ki-information-5 fs-2hx text-primary me-4" />
                <div className="d-flex flex-column">
                  <h4 className="mb-1 text-primary">Belum Ada Acara</h4>
                  <span>Silakan tambahkan acara menggunakan form di atas</span>
                </div>
              </div>
            )}

            {acaraList.map((ac, i) => (
              <div key={i} className="card card-flush shadow-sm mb-5">
                <div className="card-body py-5">
                  <div className="d-flex flex-column flex-md-row align-items-md-center">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <span className="fs-3 fw-bold text-gray-900 me-3">
                          {ac.nama}
                        </span>
                        {acaraUtama && acaraUtama.tanggal === ac.tanggal && (
                          <span className="badge badge-light-primary">Acara Utama</span>
                        )}
                      </div>
                      <div className="d-flex flex-wrap">
                        <div className="border border-dashed border-gray-300 rounded min-w-125px py-3 px-4 me-3 mb-3">
                          <div className="fs-6 text-gray-800 fw-bold">
                            {formatDate(ac.tanggal)}
                          </div>
                          <div className="fw-semibold text-gray-500">
                            {waktuDisplay(ac)}
                          </div>
                        </div>
                        <div className="border border-dashed border-gray-300 rounded py-3 px-4 mb-3 flex-grow-1">
                          <div className="fs-6 text-gray-800 fw-bold">{ac.lokasi}</div>
                          <div className="fw-semibold text-gray-500">{ac.alamat}</div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                      <button
                        type="button"
                        className="btn btn-icon btn-light-primary btn-sm"
                        onClick={() => handleEdit(i)}
                        title="Edit"
                      >
                        <i className="ki-duotone ki-pencil fs-2" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon btn-light-danger btn-sm"
                        onClick={() => handleDelete(i)}
                        title="Hapus"
                      >
                        <i className="ki-duotone ki-trash fs-2" />
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          acaraUtama && acaraUtama.tanggal === ac.tanggal
                            ? "btn-secondary"
                            : "btn-light-success"
                        }`}
                        onClick={() => handleSetUtama(ac)}
                        disabled={
                          loading || (acaraUtama && acaraUtama.tanggal === ac.tanggal)
                        }
                      >
                        {acaraUtama && acaraUtama.tanggal === ac.tanggal ? (
                          <>
                            <i className="ki-duotone ki-check fs-2 me-2" />
                            Acara Utama
                          </>
                        ) : (
                          <>
                            <i className="ki-duotone ki-star fs-2 me-2" />
                            Jadikan Utama
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
