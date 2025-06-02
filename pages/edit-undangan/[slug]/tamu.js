import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
      setTimeout(() => setSuccess(""), 2000);
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!undangan) return <div className="p-8 text-center">Undangan tidak ditemukan.</div>;

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Kelola Tamu</h2>

      {/* Form tambah/edit tamu */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div>
          <label className="block font-semibold mb-1">Nama Tamu</label>
          <input
            name="nama"
            className="w-full border p-2 rounded"
            value={form.nama}
            onChange={handleChange}
            required
            placeholder="Nama tamu (wajib)"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Kontak (opsional)</label>
          <input
            name="kontak"
            className="w-full border p-2 rounded"
            value={form.kontak}
            onChange={handleChange}
            placeholder="No WA, email, dsb"
          />
        </div>
        {success && <div className="text-green-600">{success}</div>}
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
          disabled={loading}
        >
          {editIdx >= 0 ? "Update Tamu" : "Tambah Tamu"}
        </button>
        {editIdx >= 0 && (
          <button
            type="button"
            className="ml-4 px-4 py-2 bg-gray-300 rounded"
            onClick={() => {
              setForm({ nama: "", kontak: "" });
              setEditIdx(-1);
            }}
          >
            Batal Edit
          </button>
        )}
      </form>

      {/* List tamu */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Daftar Tamu</h3>
        {tamuList.length === 0 && <div className="text-gray-500">Belum ada tamu.</div>}
        
        <ul className="space-y-2">
          {tamuList.map((tamu, idx) => {
            // Format nama tamu ke slug/query (biar URL valid)
            const encoded = encodeURIComponent(tamu.nama.trim().toLowerCase().replace(/\s+/g, "-"));
            const urlBase = typeof window !== "undefined" ? window.location.origin : "";
            const linkTamu = `${urlBase}/undangan/${slug}?tamu=${encoded}`;
            // Format pesan WhatsApp dengan detail undangan
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

Wassalamu'alaikum Wr. Wb.`.replace(/^ +/gm, '')  // Remove leading spaces from each line
             );
            return (
              <li key={idx} className="border rounded px-4 py-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {tamu.nama}
                    {tamu.hadir && (
                      <span className="text-green-600 text-xs font-semibold bg-green-100 rounded px-2 py-0.5">
                        Sudah Check-in
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {tamu.kontak}
                    {tamu.hadir && tamu.waktu_hadir && (
                      <div className="text-green-600 text-xs">
                        Hadir pada: {new Date(tamu.waktu_hadir).toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Tombol Copy Link */}
                  <button
                    className="text-blue-600 text-xs border rounded px-2 py-1"
                    onClick={() => {
                      navigator.clipboard.writeText(linkTamu);
                      alert("Link undangan disalin!");
                    }}
                  >
                    Copy Link
                  </button>
                  {/* Tombol Kirim WhatsApp */}
                  {tamu.kontak && tamu.kontak.match(/^08\d{7,}$/) && (
                    <a
                      href={`https://wa.me/${"62" + tamu.kontak.slice(1)}?text=${pesanWA}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 text-xs border rounded px-2 py-1"
                    >
                      Kirim WA
                    </a>
                  )}
                  <button className="text-blue-600" type="button" onClick={() => handleEdit(idx)}>Edit</button>
                  <button className="text-red-600" type="button" onClick={() => handleDelete(idx)}>Hapus</button>
                </div>
              </li>
            );
          })}
        </ul>

      </div>
    </div>
  );
}
