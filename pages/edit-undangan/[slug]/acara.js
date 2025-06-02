import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
    waktu: "",
    lokasi: "",
    alamat: "",
  });
  const [editIndex, setEditIndex] = useState(-1); // -1 = mode tambah baru
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch data undangan
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        setUndangan(res.undangan);
        setAcaraList(res.undangan?.acara || []);
        setAcaraUtama(res.undangan?.acara_utama || null);
        setLoading(false);
      });
  }, [slug]);

  // Handle input
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Format tanggal untuk display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Simpan acara baru / edit acara
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate and convert date
      const acaraData = {
        ...form,
        tanggal: new Date(form.tanggal).toISOString()
      };

      let newList = [...acaraList];
      if (editIndex >= 0) {
        // Edit existing
        newList[editIndex] = acaraData;
      } else {
        // Tambah baru
        newList.push(acaraData);
      }

      const updates = {
        acara: newList,
        acara_utama: acaraUtama
      };

      const res = await fetch("/api/invitation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, field: updates }),
      });

      if (res.ok) {
        const refreshRes = await fetch(`/api/invitation/detail?slug=${slug}`);
        const refreshData = await refreshRes.json();
        
        setUndangan(refreshData.undangan);
        setAcaraList(refreshData.undangan?.acara || []);
        setAcaraUtama(refreshData.undangan?.acara_utama || null);
        setForm({ nama: "", tanggal: "", waktu: "", lokasi: "", alamat: "" });
        setEditIndex(-1);
        setSuccess("Acara berhasil disimpan!");
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(`Gagal menyimpan acara: ${res.statusText || 'Coba lagi'}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      setError("Gagal menyimpan acara: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit salah satu acara
  const handleEdit = (idx) => {
    setForm(acaraList[idx]);
    setEditIndex(idx);
  };

  // Hapus acara
  const handleDelete = async (idx) => {
    if (!window.confirm("Yakin ingin menghapus acara ini?")) return;
    const newList = acaraList.filter((_, i) => i !== idx);
    setLoading(true);
    const res = await fetch("/api/invitation/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, field: { acara: newList } }),
    });
    setLoading(false);
    if (res.ok) {
      setAcaraList(newList);
      setForm({ nama: "", tanggal: "", waktu: "", lokasi: "", alamat: "" });
      setEditIndex(-1);
    }
  };

  // Set acara utama
  const handleSetUtama = async (acara) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/invitation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          field: { acara_utama: acara }
        }),
      });

      if (res.ok) {
        setAcaraUtama(acara);
        setSuccess("Acara utama berhasil diperbarui!");
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError("Gagal mengatur acara utama");
      }
    } catch (err) {
      setError("Gagal mengatur acara utama: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!undangan) return <div className="p-8 text-center">Undangan tidak ditemukan.</div>;

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Informasi Acara</h2>

      {/* Form tambah/edit acara */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <div>
          <label className="block font-semibold mb-1">Nama Acara</label>
          <input
            name="nama"
            className="w-full border p-2 rounded"
            value={form.nama}
            onChange={handleChange}
            required
            placeholder="Contoh: Akad, Resepsi"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tanggal</label>
          <input
            name="tanggal"
            type="date"
            className="w-full border p-2 rounded"
            value={form.tanggal}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Waktu</label>
          <input
            name="waktu"
            className="w-full border p-2 rounded"
            value={form.waktu}
            onChange={handleChange}
            required
            placeholder="Contoh: 10:00"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Lokasi</label>
          <input
            name="lokasi"
            className="w-full border p-2 rounded"
            value={form.lokasi}
            onChange={handleChange}
            required
            placeholder="Contoh: Masjid Al-Falah"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Alamat Lengkap</label>
          <textarea
            name="alamat"
            className="w-full border p-2 rounded"
            value={form.alamat}
            onChange={handleChange}
            required
            placeholder="Contoh: Jl. Masjid No.1, Jakarta"
          />
        </div>
        {success && <div className="text-green-600">{success}</div>}
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
          disabled={loading}
        >
          {editIndex >= 0 ? "Update Acara" : "Tambah Acara"}
        </button>
        {editIndex >= 0 && (
          <button
            type="button"
            className="ml-4 px-4 py-2 bg-gray-300 rounded"
            onClick={() => {
              setForm({ nama: "", tanggal: "", waktu: "", lokasi: "", alamat: "" });
              setEditIndex(-1);
            }}
          >
            Batal Edit
          </button>
        )}
      </form>

      {/* List acara */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Daftar Acara</h3>
        {acaraList.length === 0 && <div className="text-gray-500">Belum ada acara.</div>}
        <ul className="space-y-2">
          {acaraList.map((ac, i) => (
            <li key={i} className="border rounded px-4 py-2 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{ac.nama}</div>
                  {acaraUtama && acaraUtama.tanggal === ac.tanggal && (
                    <span className="text-xs bg-blue-100 text-blue-600 rounded px-2 py-0.5">
                      Acara Utama
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{formatDate(ac.tanggal)} {ac.waktu}</div>
                <div className="text-xs text-gray-600">{ac.lokasi}, {ac.alamat}</div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  className="text-blue-600"
                  onClick={() => handleEdit(i)}
                >
                  Edit
                </button>
                <button 
                  type="button"
                  className="text-red-600"
                  onClick={() => handleDelete(i)}
                >
                  Hapus
                </button>
                <button
                  type="button"
                  className={`ml-4 px-2 py-1 rounded text-sm ${
                    acaraUtama && acaraUtama.tanggal === ac.tanggal 
                      ? 'bg-gray-300' 
                      : 'bg-green-200 hover:bg-green-300'
                  }`}
                  onClick={() => handleSetUtama(ac)}
                  disabled={loading || (acaraUtama && acaraUtama.tanggal === ac.tanggal)}
                >
                  {acaraUtama && acaraUtama.tanggal === ac.tanggal ? 'Utama' : 'Jadikan Utama'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
