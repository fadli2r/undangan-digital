import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";

export default function KelolaTamu() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [undangan, setUndangan] = useState(null);
  const [tamuList, setTamuList] = useState([]);
  const [form, setForm] = useState({ nama: "", kontak: "" });
  const [editIdx, setEditIdx] = useState(-1); // -1: tambah, >=0: edit
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch data tamu and attendance
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        setUndangan(res.undangan);
        // Map tamu with attendance status
        const attendanceMap = new Map();
        (res.undangan?.attendance || []).forEach(a => {
          attendanceMap.set(a.name.toLowerCase(), a.timestamp);
        });
        const tamuWithStatus = (res.undangan?.tamu || []).map(tamu => ({
          ...tamu,
          hadir: attendanceMap.has(tamu.nama.toLowerCase()),
          waktu_hadir: attendanceMap.get(tamu.nama.toLowerCase()) || null
        }));
        setTamuList(tamuWithStatus);
        setLoading(false);
      });
  }, [slug]);

  // Handle input form
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Simpan tamu baru/edit
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nama) {
      setError("Nama tamu wajib diisi.");
      return;
    }
    setLoading(true); setSuccess(""); setError("");
    let newList = [...tamuList];
    if (editIdx >= 0) {
      newList[editIdx] = { ...form };
    } else {
      newList.push({ ...form });
    }
    const res = await fetch("/api/invitation/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, field: { tamu: newList } }),
    });
    setLoading(false);
    if (res.ok) {
      setTamuList(newList);
      setForm({ nama: "", kontak: "" });
      setEditIdx(-1);
      setSuccess("Tamu berhasil disimpan!");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError("Gagal menyimpan data tamu.");
    }
  };

  // Edit tamu
  const handleEdit = idx => {
    setForm(tamuList[idx]);
    setEditIdx(idx);
  };

  // Hapus tamu
  const handleDelete = async idx => {
    if (!window.confirm("Hapus tamu ini?")) return;
    const newList = tamuList.filter((_, i) => i !== idx);
    setLoading(true);
    await fetch("/api/invitation/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, field: { tamu: newList } }),
    });
    setTamuList(newList);
    setForm({ nama: "", kontak: "" });
    setEditIdx(-1);
    setLoading(false);
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
        <div className="alert alert-warning">
          <h4 className="alert-heading">Data Tidak Ditemukan</h4>
          <p>Undangan tidak ditemukan.</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <BackButton />
      {/* Form Card */}
      <div className="card mb-8">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">{editIdx >= 0 ? 'Edit Tamu' : 'Tambah Tamu'}</h2>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-5">
              <div className="col-md-6">
                <label className="form-label required">Nama Tamu</label>
                <input
                  name="nama"
                  className="form-control"
                  value={form.nama}
                  onChange={handleChange}
                  required
                  placeholder="Nama tamu (wajib)"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Kontak (opsional)</label>
                <input
                  name="kontak"
                  className="form-control"
                  value={form.kontak}
                  onChange={handleChange}
                  placeholder="No WA, email, dsb"
                />
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
                className="btn btn-primary me-3"
                disabled={loading}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                {editIdx >= 0 ? "Update Tamu" : "Tambah Tamu"}
              </button>

              {editIdx >= 0 && (
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => {
                    setForm({ nama: "", kontak: "" });
                    setEditIdx(-1);
                  }}
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Daftar Tamu</h2>
          </div>
        </div>
        <div className="card-body">
          {tamuList.length === 0 ? (
            <div className="text-center py-10">
              <i className="ki-duotone ki-people fs-3x text-muted mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
                <span className="path5"></span>
              </i>
              <div className="text-muted fs-6">Belum ada tamu</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-row-dashed table-row-gray-300 gy-7">
                <thead>
                  <tr className="fw-bold fs-6 text-gray-800">
                    <th>Nama</th>
                    <th>Kontak</th>
                    <th>Status</th>
                    <th>Link</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tamuList.map((tamu, idx) => {
                    // Format nama tamu ke slug/query
                    const encoded = encodeURIComponent(tamu.nama.trim().toLowerCase().replace(/\s+/g, "-"));
                    const urlBase = typeof window !== "undefined" ? window.location.origin : "";
                    const linkTamu = `${urlBase}/undangan/${slug}?tamu=${encoded}`;
                    
                    // Format pesan WhatsApp
                    const mainAcara = undangan.acara?.[0] || {};
                    const tanggalAcara = mainAcara.tanggal ? new Date(mainAcara.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '';

                    const pesanWA = encodeURIComponent(
`Assalamu'alaikum Wr. Wb.

Kepada Yth.
Bapak/Ibu/Saudara/i ${tamu.nama}

Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

${undangan.mempelai?.pria || ''}
&
${undangan.mempelai?.wanita || ''}

${mainAcara.nama || 'Acara Pernikahan'}
🗓️ ${tanggalAcara}
⏰ ${mainAcara.waktu || ''}
📍 ${mainAcara.lokasi || ''}
${mainAcara.alamat ? `\n${mainAcara.alamat}` : ''}

Untuk detail lengkap dan konfirmasi kehadiran, silakan kunjungi:
${linkTamu}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Wassalamu'alaikum Wr. Wb.`.replace(/^ +/gm, '')
                    );

                    return (
                      <tr key={idx}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="symbol symbol-35px symbol-circle me-3">
                              <div className="symbol-label bg-light-primary text-primary fs-6 fw-bold">
                                {tamu.nama.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="fw-bold">{tamu.nama}</div>
                          </div>
                        </td>
                        <td>{tamu.kontak || "-"}</td>
                        <td>
                          {tamu.hadir ? (
                            <div>
                              <span className="badge badge-light-success">Sudah Check-in</span>
                              <div className="text-muted fs-7 mt-1">
                                {new Date(tamu.waktu_hadir).toLocaleString('id-ID')}
                              </div>
                            </div>
                          ) : (
                            <span className="badge badge-light-warning">Belum Check-in</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-light-primary"
                              onClick={() => {
                                navigator.clipboard.writeText(linkTamu);
                                alert("Link undangan disalin!");
                              }}
                            >
                              <i className="ki-duotone ki-copy fs-6">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                              Copy Link
                            </button>
                            {tamu.kontak && tamu.kontak.match(/^08\d{7,}$/) && (
                              <a
                                href={`https://wa.me/${"62" + tamu.kontak.slice(1)}?text=${pesanWA}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-light-success"
                              >
                                <i className="ki-duotone ki-whatsapp fs-6">
                                  <span className="path1"></span>
                                  <span className="path2"></span>
                                </i>
                                Kirim WA
                              </a>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-light-warning"
                              onClick={() => handleEdit(idx)}
                            >
                              <i className="ki-duotone ki-pencil fs-6">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-light-danger"
                              onClick={() => handleDelete(idx)}
                            >
                              <i className="ki-duotone ki-trash fs-6">
                                <span className="path1"></span>
                                <span className="path2"></span>
                                <span className="path3"></span>
                                <span className="path4"></span>
                                <span className="path5"></span>
                              </i>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
