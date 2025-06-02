import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

export default function Galeri() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [undangan, setUndangan] = useState(null);
  const [galeri, setGaleri] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const MAX_FOTO = 10;
  const fileInput = useRef();

  // Ambil data galeri
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        setUndangan(res.undangan);
        setGaleri(res.undangan?.galeri || []);
        setLoading(false);
      });
  }, [slug]);

  // Validate file type
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.';
    }
    if (file.size > 2 * 1024 * 1024) {
      return 'Ukuran file terlalu besar. Maksimal 2MB.';
    }
    return null;
  };

  // Handle upload file
  const handleUpload = async (e) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      // Check total photos limit
      if (galeri.length + files.length > MAX_FOTO) {
        setError(`Maksimal hanya ${MAX_FOTO} foto!`);
        fileInput.current.value = "";
        return;
      }

      // Validate each file
      for (let file of files) {
        const error = validateFile(file);
        if (error) {
          setError(error);
          fileInput.current.value = "";
          return;
        }
      }

      setUploading(true);
      setError("");
      
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append("foto", file);
      });

      const res = await fetch("/api/invitation/upload.galeri", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`Upload gagal: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.urls && data.urls.length > 0) {
        const newGaleri = [...galeri, ...data.urls].slice(0, MAX_FOTO);
        
        // Save to invitation
        const updateRes = await fetch("/api/invitation/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, field: { galeri: newGaleri } }),
        });

        if (!updateRes.ok) {
          throw new Error('Gagal menyimpan ke database');
        }

        setGaleri(newGaleri);
        setSuccess(`${data.urls.length} foto berhasil di-upload!`);
        setTimeout(() => setSuccess(""), 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || "Upload gagal. Silakan coba lagi.");
    } finally {
      setUploading(false);
      fileInput.current.value = "";
    }
  };

  // Hapus foto
  const handleHapus = async (idx) => {
    if (!window.confirm("Hapus foto ini?")) return;
    const newGaleri = galeri.filter((_, i) => i !== idx);
    await fetch("/api/invitation/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, field: { galeri: newGaleri } }),
    });
    setGaleri(newGaleri);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!undangan) return <div className="p-8 text-center">Undangan tidak ditemukan.</div>;

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Galeri Foto</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Upload Foto (maksimal {MAX_FOTO})</label>
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInput}
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            disabled={uploading || galeri.length >= MAX_FOTO}
            onChange={handleUpload}
            className="mb-2 w-full border p-2 rounded"
          />
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-500">
              {galeri.length}/{MAX_FOTO} foto terupload
            </div>
            {uploading && (
              <div className="flex items-center text-blue-600">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mengupload...
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Format yang didukung: JPG, PNG, GIF, WEBP (maks. 2MB per file)
          </div>
        </div>
        {success && <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">{success}</div>}
        {error && <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
      </div>

      {/* Preview foto */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {galeri.map((url, idx) => (
          <div key={idx} className="relative group border rounded overflow-hidden bg-gray-100">
            <img 
              src={url} 
              className="w-full h-32 object-cover" 
              alt={`Galeri ${idx+1}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
              <button
                className="absolute top-1 right-1 px-2 py-1 bg-red-600 text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => handleHapus(idx)}
                type="button"
                disabled={uploading}
              >
                {uploading ? '...' : 'Hapus'}
              </button>
            </div>
          </div>
        ))}
        {galeri.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500 border-2 border-dashed rounded">
            Belum ada foto dalam galeri
          </div>
        )}
      </div>
    </div>
  );
}
