import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center gap-2">
        <Link href={`/edit-undangan/${slug}`} className="text-blue-500">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold">Edit Informasi Tambahan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Live Streaming Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Live Streaming</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="live_streaming.enabled"
                  checked={form.tambahan.live_streaming.enabled}
                  onChange={handleChange}
                />
                <span>Aktifkan Live Streaming</span>
              </label>
            </div>
            {form.tambahan.live_streaming.enabled && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Link YouTube Live
                </label>
                <input
                  type="url"
                  name="live_streaming.youtube_url"
                  value={form.tambahan.live_streaming.youtube_url}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-2 border rounded"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Masukkan link YouTube Live atau Video
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Musik Background */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Musik Background</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="musik.enabled"
                  checked={form.tambahan.musik.enabled}
                  onChange={handleChange}
                />
                <span>Aktifkan Musik</span>
              </label>
            </div>
            {form.tambahan.musik.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    URL Musik
                  </label>
                  <input
                    type="url"
                    name="musik.url"
                    value={form.tambahan.musik.url}
                    onChange={handleChange}
                    placeholder="URL file musik atau YouTube"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tipe
                  </label>
                  <select
                    name="musik.type"
                    value={form.tambahan.musik.type}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="file">File Audio</option>
                    <option value="youtube">YouTube</option>
                    <option value="spotify">Spotify</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="musik.autoplay"
                      checked={form.tambahan.musik.autoplay}
                      onChange={handleChange}
                    />
                    <span>Autoplay</span>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Catatan */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Catatan Tambahan</h3>
          <textarea
            name="catatan"
            value={form.tambahan.catatan}
            onChange={handleChange}
            placeholder="Catatan tambahan untuk tamu..."
            className="w-full p-2 border rounded h-32"
          />
        </div>

        {/* Dress Code */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Dress Code</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Warna Baju
              </label>
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
                className="w-full p-2 border rounded h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Warna Celana/Rok
              </label>
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
                className="w-full p-2 border rounded h-12"
              />
            </div>
          </div>
        </div>

        {/* Maps URL */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Google Maps Embed</h3>
          <textarea
            name="maps_url"
            value={form.tambahan.maps_url}
            onChange={handleChange}
            placeholder="Paste iframe embed code dari Google Maps di sini..."
            className="w-full p-2 border rounded h-32"
          />
          <p className="text-sm text-gray-500 mt-2">
            Untuk mendapatkan embed code: Buka Google Maps → Pilih lokasi → Share → Embed a map → Copy HTML
          </p>
        </div>

        {/* Protokol */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Protokol Kesehatan</h3>
          <textarea
            name="protokol"
            value={form.tambahan.protokol}
            onChange={handleChange}
            placeholder="Protokol kesehatan yang harus dipatuhi..."
            className="w-full p-2 border rounded h-32"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>

        {success && <div className="text-green-600">{success}</div>}
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}
