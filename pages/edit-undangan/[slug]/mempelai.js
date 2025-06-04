import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Mempelai() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [undangan, setUndangan] = useState(null);
  const [form, setForm] = useState({
    pria: "",
    wanita: "",
    foto_pria: "",
    foto_wanita: "",
    orangtua_pria: "",
    orangtua_wanita: "",
    instagram_pria: "",
    instagram_wanita: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState({
    foto_pria: false,
    foto_wanita: false,
  });

  // Fetch data undangan
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        setUndangan(res.undangan);
        setForm({
          pria: res.undangan?.mempelai?.pria || "",
          wanita: res.undangan?.mempelai?.wanita || "",
          foto_pria: res.undangan?.mempelai?.foto_pria || "",
          foto_wanita: res.undangan?.mempelai?.foto_wanita || "",
          orangtua_pria: res.undangan?.mempelai?.orangtua_pria || "",
          orangtua_wanita: res.undangan?.mempelai?.orangtua_wanita || "",
          instagram_pria: res.undangan?.tambahan?.instagram_pria || "",
          instagram_wanita: res.undangan?.tambahan?.instagram_wanita || "",
        });
        setLoading(false);
      });
  }, [slug]);

  // Handle input change
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle file upload
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format file harus JPG, PNG, atau GIF');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setUploading({ ...uploading, [fieldName]: true });
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/invitation/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setForm({ ...form, [fieldName]: result.path });
        setSuccess(`Foto ${fieldName === 'foto_pria' ? 'pria' : 'wanita'} berhasil diupload!`);
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(result.message || 'Gagal upload foto');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Gagal upload foto: ' + error.message);
    } finally {
      setUploading({ ...uploading, [fieldName]: false });
    }
  };

  // Handle submit
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setSuccess(""); setError("");
    
    const updateData = { 
      slug, 
      field: { 
        mempelai: {
          pria: form.pria,
          wanita: form.wanita,
          foto_pria: form.foto_pria,
          foto_wanita: form.foto_wanita,
          orangtua_pria: form.orangtua_pria,
          orangtua_wanita: form.orangtua_wanita,
        },
        tambahan: {
          instagram_pria: form.instagram_pria,
          instagram_wanita: form.instagram_wanita,
        }
      } 
    };
    console.log('Sending update:', updateData);  // Debug log
    
    try {
      const res = await fetch("/api/invitation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      const result = await res.json();
      console.log('Update response:', result);  // Debug log
      
      setLoading(false);
      if (res.ok) {
        setSuccess("Data mempelai berhasil disimpan!");
        // Refresh data to verify update
        const refreshRes = await fetch(`/api/invitation/detail?slug=${slug}`);
        const refreshData = await refreshRes.json();
        console.log('Refreshed data:', refreshData);  // Debug log
        setUndangan(refreshData.undangan);
        setTimeout(() => setSuccess(""), 2000);
      } else {
        setError(`Gagal menyimpan data: ${result.message || 'Coba lagi'}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      setLoading(false);
      setError("Gagal menyimpan data: " + error.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!undangan) return <div className="p-8 text-center">Undangan tidak ditemukan.</div>;

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Informasi Mempelai</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Nama Mempelai Pria</label>
          <input
            name="pria"
            className="w-full border p-2 rounded"
            value={form.pria}
            onChange={handleChange}
            required
            placeholder="Contoh: Adi Pratama"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Nama Orangtua Pria</label>
          <input
            name="orangtua_pria"
            className="w-full border p-2 rounded"
            value={form.orangtua_pria}
            onChange={handleChange}
            placeholder="Contoh: Bpk. Surya & Ibu Ani"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Foto Pria</label>
          <input
            type="file"
            accept="image/*"
            className="w-full border p-2 rounded mb-2"
            onChange={(e) => handleFileUpload(e, 'foto_pria')}
            disabled={uploading.foto_pria}
          />
          {uploading.foto_pria && (
            <div className="text-blue-600 text-sm mb-2">Mengupload foto...</div>
          )}
          {form.foto_pria && (
            <div className="mb-2">
              <img 
                src={form.foto_pria} 
                alt="Preview Foto Pria" 
                className="w-32 h-32 object-cover rounded border"
              />
              <p className="text-sm text-gray-600 mt-1">Preview foto pria</p>
            </div>
          )}
        </div>
        <div>
          <label className="block font-semibold mb-1">Nama Mempelai Wanita</label>
          <input
            name="wanita"
            className="w-full border p-2 rounded"
            value={form.wanita}
            onChange={handleChange}
            required
            placeholder="Contoh: Sogol Ayu"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Nama Orangtua Wanita</label>
          <input
            name="orangtua_wanita"
            className="w-full border p-2 rounded"
            value={form.orangtua_wanita}
            onChange={handleChange}
            placeholder="Contoh: Bpk. Hadi & Ibu Rita"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Foto Wanita</label>
          <input
            type="file"
            accept="image/*"
            className="w-full border p-2 rounded mb-2"
            onChange={(e) => handleFileUpload(e, 'foto_wanita')}
            disabled={uploading.foto_wanita}
          />
          {uploading.foto_wanita && (
            <div className="text-blue-600 text-sm mb-2">Mengupload foto...</div>
          )}
          {form.foto_wanita && (
            <div className="mb-2">
              <img 
                src={form.foto_wanita} 
                alt="Preview Foto Wanita" 
                className="w-32 h-32 object-cover rounded border"
              />
              <p className="text-sm text-gray-600 mt-1">Preview foto wanita</p>
            </div>
          )}
        </div>
        <div>
          <label className="block font-semibold mb-1">Instagram Pria</label>
          <input
            name="instagram_pria"
            className="w-full border p-2 rounded"
            value={form.instagram_pria}
            onChange={handleChange}
            placeholder="Contoh: https://instagram.com/username"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Instagram Wanita</label>
          <input
            name="instagram_wanita"
            className="w-full border p-2 rounded"
            value={form.instagram_wanita}
            onChange={handleChange}
            placeholder="Contoh: https://instagram.com/username"
          />
        </div>
        {success && <div className="text-green-600">{success}</div>}
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
          disabled={loading || uploading.foto_pria || uploading.foto_wanita}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
