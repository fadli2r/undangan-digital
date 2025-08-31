// pages/undangan/[slug]/tamu.js
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
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

  // --- Import/Export states ---
  const [importing, setImporting] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false); // true = replace; false = append
  const [importSummary, setImportSummary] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch data tamu and attendance
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then((res) => res.json())
      .then((res) => {
        setUndangan(res.undangan);

        // Map tamu with attendance status
        const attendanceMap = new Map();
        (res.undangan?.attendance || []).forEach((a) => {
          attendanceMap.set(String(a.name || "").toLowerCase(), a.timestamp);
        });

        const tamuWithStatus = (res.undangan?.tamu || []).map((tamu) => ({
          ...tamu,
          hadir: attendanceMap.has(String(tamu.nama || "").toLowerCase()),
          waktu_hadir: attendanceMap.get(String(tamu.nama || "").toLowerCase()) || null,
        }));
        setTamuList(tamuWithStatus);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // Handle input form
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
// loader aman untuk xlsx (CJS/ESM)
async function loadXLSX() {
  try {
    const mod = await import("xlsx");          // ⇐ utama
    // pilih objek yang berisi API (read/write/dll)
    return mod?.read ? mod : (mod?.default?.read ? mod.default : mod);
  } catch (e) {
    // fallback untuk beberapa bundler
    const mod = await import("xlsx/xlsx.mjs"); // ⇐ alternatif ESM
    return mod;
  }
}

  // Simpan tamu baru/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama) {
      setError("Nama tamu wajib diisi.");
      return;
    }
    setLoading(true);
    setSuccess("");
    setError("");
    let newList = [...tamuList];
    if (editIdx >= 0) {
      newList[editIdx] = { ...form };
    } else {
      newList.push({ ...form });
    }

    // strip field non-schema sebelum simpan
    const payload = newList.map(({ nama, kontak }) => ({ nama, kontak }));

    const res = await fetch("/api/invitation/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, field: { tamu: payload } }),
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
  const handleEdit = (idx) => {
    setForm({ nama: tamuList[idx].nama || "", kontak: tamuList[idx].kontak || "" });
    setEditIdx(idx);
  };

  // Hapus tamu
  const handleDelete = async (idx) => {
    if (!window.confirm("Hapus tamu ini?")) return;
    const newList = tamuList.filter((_, i) => i !== idx);
    // strip field non-schema sebelum simpan
    const payload = newList.map(({ nama, kontak }) => ({ nama, kontak }));

    setLoading(true);
    await fetch("/api/invitation/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, field: { tamu: payload } }),
    });
    setTamuList(newList);
    setForm({ nama: "", kontak: "" });
    setEditIdx(-1);
    setLoading(false);
  };

  // ---------- DOWNLOAD TEMPLATE ----------
  async function downloadTemplateXLSX() {
    try {
const XLSX = await loadXLSX();
      const rows = [
        ["Nama", "Kontak"],
        ["Budi Santoso", "081234567890"],
        ["Sari Ayu", "sari@example.com"],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template Tamu");
      XLSX.writeFile(wb, "template_tamu.xlsx");
    } catch (e) {
      // fallback CSV
      const csv = "Nama,Kontak\nBudi Santoso,081234567890\nSari Ayu,sari@example.com\n";
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template_tamu.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // (opsional) export daftar tamu saat ini
  async function exportCurrentXLSX() {
    try {
const XLSX = await loadXLSX();
      const rows = [["Nama", "Kontak", "Status", "Waktu Check-in"]];
      tamuList.forEach((t) => {
        rows.push([
          t.nama || "",
          t.kontak || "",
          t.hadir ? "Sudah Check-in" : "Belum",
          t.waktu_hadir ? new Date(t.waktu_hadir).toLocaleString("id-ID") : "",
        ]);
      });
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Daftar Tamu");
      XLSX.writeFile(wb, `tamu_${slug || "undangan"}.xlsx`);
    } catch (e) {
      const header = "Nama,Kontak,Status,Waktu Check-in\n";
      const body = tamuList
        .map(
          (t) =>
            `"${(t.nama || "").replace(/"/g, '""')}","${(t.kontak || "").replace(/"/g, '""')}",${
              t.hadir ? "Sudah Check-in" : "Belum"
            },"${t.waktu_hadir ? new Date(t.waktu_hadir).toLocaleString("id-ID") : ""}"`
        )
        .join("\n");
      const csv = header + body + "\n";
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tamu_${slug || "undangan"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // ---------- IMPORT EXCEL/CSV ----------
  async function handleFileImport(file) {
    setImporting(true);
    setError("");
    setSuccess("");
    setImportSummary(null);

    try {
const XLSX = await loadXLSX();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      // pakai header satu baris
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

      if (!rows.length) throw new Error("File kosong");
      const header = rows[0].map((h) => String(h || "").trim().toLowerCase());
      // cari kolom nama/kontak
      const idxNama =
        header.findIndex((h) => ["nama", "name", "guest", "tamu"].includes(h)) !== -1
          ? header.findIndex((h) => ["nama", "name", "guest", "tamu"].includes(h))
          : 0;
      const idxKontak =
        header.findIndex((h) => ["kontak", "contact", "phone", "wa", "email"].includes(h)) !== -1
          ? header.findIndex((h) => ["kontak", "contact", "phone", "wa", "email"].includes(h))
          : 1;

      const imported = [];
      const seen = new Set(); // dedup dalam file
      let skippedEmpty = 0;
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        const nama = String((r[idxNama] ?? "")).trim();
        const kontak = String((r[idxKontak] ?? "")).trim();
        if (!nama) {
          skippedEmpty++;
          continue;
        }
        const key = nama.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        imported.push({ nama, kontak });
      }

      // gabung / replace dengan list lama (dedup silang)
      const base = replaceMode ? [] : tamuList.map(({ nama, kontak }) => ({ nama, kontak }));
      const existKeys = new Set(base.map((t) => String(t.nama || "").toLowerCase()));
      const final = [...base];
      let added = 0;
      let skippedDup = 0;
      imported.forEach((t) => {
        const k = String(t.nama || "").toLowerCase();
        if (existKeys.has(k)) {
          skippedDup++;
        } else {
          final.push(t);
          existKeys.add(k);
          added++;
        }
      });

      // simpan ke DB
      const res = await fetch("/api/invitation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, field: { tamu: final } }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan ke server");

      // update UI, rebuild status hadir (hapus flags lama)
      const attendanceMap = new Map();
      (undangan?.attendance || []).forEach((a) => {
        attendanceMap.set(String(a.name || "").toLowerCase(), a.timestamp);
      });
      const finalWithStatus = final.map((t) => ({
        ...t,
        hadir: attendanceMap.has(String(t.nama || "").toLowerCase()),
        waktu_hadir: attendanceMap.get(String(t.nama || "").toLowerCase()) || null,
      }));

      setTamuList(finalWithStatus);
      setImportSummary({
        totalFile: rows.length - 1,
        added,
        skippedDup,
        skippedEmpty,
        mode: replaceMode ? "replace" : "append",
      });
      setSuccess("Import selesai!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      console.error(e);
      setError(e.message || "Gagal mengimpor file");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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

      {/* Import/Export Card */}
      <div className="card mb-8">
        <div className="card-header align-items-center">
          <div className="card-title">
            <h2 className="fw-bold">Impor / Ekspor Tamu</h2>
          </div>
          <div className="card-toolbar">
            <button className="btn btn-light me-3" onClick={exportCurrentXLSX}>
              <i className="ki-duotone ki-exit-down fs-5 me-2"><span className="path1"></span><span className="path2"></span></i>
              Ekspor Daftar
            </button>
            <button className="btn btn-light-primary" onClick={downloadTemplateXLSX}>
              <i className="ki-duotone ki-file-added fs-5 me-2"><span className="path1"></span><span className="path2"></span></i>
              Download Template
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-5 align-items-end">
            <div className="col-md-6">
              <label className="form-label">Pilih File (Excel/CSV)</label>
              <div className="d-flex">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="form-control"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => e.target.files?.[0] && handleFileImport(e.target.files[0])}
                  disabled={importing}
                />
              </div>
              <div className="form-text">
                Gunakan kolom <code>Nama</code> dan <code>Kontak</code>. Baris pertama dianggap header.
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">Mode Import</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="replaceSwitch"
                  checked={replaceMode}
                  onChange={() => setReplaceMode((v) => !v)}
                />
                <label className="form-check-label" htmlFor="replaceSwitch">
                  {replaceMode ? "Ganti semua (replace)" : "Tambahkan ke daftar (append)"}
                </label>
              </div>
            </div>
            <div className="col-md-3 text-end">
              {importing && <div className="spinner-border text-primary" role="status"></div>}
            </div>
          </div>

          {importSummary && (
            <div className="alert alert-info d-flex align-items-center p-5 mt-6">
              <i className="ki-duotone ki-information-5 fs-2hx text-info me-4"><span className="path1"></span><span className="path2"></span></i>
              <div className="d-flex flex-column">
                <div className="fw-bold mb-1">Ringkasan Import ({importSummary.mode})</div>
                <div className="text-gray-700">
                  Total baris (file): <strong>{importSummary.totalFile}</strong> •
                  Ditambahkan: <strong className="text-success ms-1">{importSummary.added}</strong> •
                  Duplikat di-skip: <strong className="text-warning ms-1">{importSummary.skippedDup}</strong> •
                  Baris kosong di-skip: <strong className="text-muted ms-1">{importSummary.skippedEmpty}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Card */}
      <div className="card mb-8">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">{editIdx >= 0 ? "Edit Tamu" : "Tambah Tamu"}</h2>
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
                <i className="ki-duotone ki-check-circle fs-2 me-2"><span className="path1"></span><span className="path2"></span></i>
                {success}
              </div>
            )}

            {error && (
              <div className="alert alert-danger mt-8">
                <i className="ki-duotone ki-cross-circle fs-2 me-2"><span className="path1"></span><span className="path2"></span></i>
                {error}
              </div>
            )}

            <div className="text-center mt-8">
              <button type="submit" className="btn btn-primary me-3" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
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
              <i className="ki-duotone ki-people fs-3x text-muted mb-3"><span className="path1"></span><span className="path2"></span><span className="path3"></span><span className="path4"></span><span className="path5"></span></i>
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
                    const encoded = encodeURIComponent(
                      String(tamu.nama || "").trim().toLowerCase().replace(/\s+/g, "-")
                    );
                    const urlBase = typeof window !== "undefined" ? window.location.origin : "";
                    const linkTamu = `${urlBase}/undangan/${slug}?tamu=${encoded}`;

                    const mainAcara = undangan.acara?.[0] || {};
                    const tanggalAcara = mainAcara.tanggal
                      ? new Date(mainAcara.tanggal).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "";

                    const pesanWA = encodeURIComponent(
                      `Assalamu'alaikum Wr. Wb.

Kepada Yth.
Bapak/Ibu/Saudara/i ${tamu.nama}

Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

${undangan.mempelai?.pria || ""}
&
${undangan.mempelai?.wanita || ""}

${mainAcara.nama || "Acara Pernikahan"}
🗓️ ${tanggalAcara}
⏰ ${mainAcara.waktu || ""}
📍 ${mainAcara.lokasi || ""}
${mainAcara.alamat ? `\n${mainAcara.alamat}` : ""}

Untuk detail lengkap dan konfirmasi kehadiran, silakan kunjungi:
${linkTamu}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.

Wassalamu'alaikum Wr. Wb.`.replace(/^ +/gm, "")
                    );

                    return (
                      <tr key={idx}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="symbol symbol-35px symbol-circle me-3">
                              <div className="symbol-label bg-light-primary text-primary fs-6 fw-bold">
                                {String(tamu.nama || "?").charAt(0).toUpperCase()}
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
                                {new Date(tamu.waktu_hadir).toLocaleString("id-ID")}
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
                              <i className="ki-duotone ki-copy fs-6"><span className="path1"></span><span className="path2"></span></i>
                              Copy Link
                            </button>
                            {tamu.kontak && /^08\d{7,}$/.test(tamu.kontak) && (
                              <a
                                href={`https://wa.me/${"62" + tamu.kontak.slice(1)}?text=${pesanWA}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-light-success"
                              >
                                <i className="ki-duotone ki-whatsapp fs-6"><span className="path1"></span><span className="path2"></span></i>
                                Kirim WA
                              </a>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-light-warning" onClick={() => handleEdit(idx)}>
                              <i className="ki-duotone ki-pencil fs-6"><span className="path1"></span><span className="path2"></span></i>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-light-danger" onClick={() => handleDelete(idx)}>
                              <i className="ki-duotone ki-trash fs-6"><span className="path1"></span><span className="path2"></span><span className="path3"></span><span className="path4"></span><span className="path5"></span></i>
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
