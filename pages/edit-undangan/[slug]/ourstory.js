import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";

export default function EditOurStory() {
  const router = useRouter();
  const { slug } = router.query;

  const [mainPhotoFile, setMainPhotoFile] = useState(null);
  const [mainPhotoUrl, setMainPhotoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [stories, setStories] = useState([{ heading: "", content: "" }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch existing our_story data
  useEffect(() => {
    if (!slug) return;

    fetch(`/api/invitation/detail?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        const ourStory = data.undangan?.our_story || {};
        setMainPhotoUrl(ourStory.main_photo || "");
        setTitle(ourStory.title || "");
        setStories(
          ourStory.stories && ourStory.stories.length > 0
            ? ourStory.stories
            : [{ heading: "", content: "" }]
        );
      })
      .catch(() => setMessage("Gagal memuat data Our Story"));
  }, [slug]);

  // ✅ Ubah data cerita
  const handleStoryChange = (index, field, value) => {
    const updated = [...stories];
    updated[index][field] = value;
    setStories(updated);
  };

  // ✅ Tambah cerita baru
  const addStory = () => setStories([...stories, { heading: "", content: "" }]);

  // ✅ Hapus cerita
  const removeStory = (index) => {
    if (stories.length === 1) return;
    setStories(stories.filter((_, i) => i !== index));
  };

  // ✅ Ganti file foto utama (preview dulu)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMainPhotoUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Upload foto utama ke API
const uploadFile = async () => {
  if (!mainPhotoFile) return mainPhotoUrl; // Tidak ada file baru

  const formData = new FormData();
  formData.append("file", mainPhotoFile);

  try {
    const res = await fetch("/api/invitation/upload-our-story-photo", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("🔍 Upload response:", data);

    if (!res.ok || !data.ok) {
      throw new Error(data.message || "Upload gagal");
    }

    return data.path;
  } catch (err) {
    console.error("❌ Upload file error:", err);
    throw new Error("Gagal mengupload foto utama. Pastikan file valid (max 5MB).");
  }
};


  // ✅ Submit data Our Story
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Menyimpan data...");

    try {
      const uploadedUrl = await uploadFile();

      const res = await fetch("/api/invitation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          field: {
            our_story: {
              main_photo: uploadedUrl,
              title,
              stories,
            },
          },
        }),
      });

      if (res.ok) {
        setMessage("✅ Our Story berhasil disimpan.");
      } else {
        setMessage("❌ Gagal menyimpan Our Story.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Gagal mengupload foto utama.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <UserLayout>
      <BackButton />
      <div className="card shadow-sm">
        <div className="card-header border-0">
          <div className="card-title">
            <h2 className="fw-bold mb-0">Edit Our Story</h2>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Judul */}
            <div className="mb-8">
              <label className="form-label required">Judul</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-control"
                placeholder="Contoh: Kisah Cinta Kami"
                required
              />
            </div>

            {/* Foto utama */}
            <div className="mb-8">
              <label className="form-label">Foto Utama</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-control mb-3"
              />

              {mainPhotoUrl && (
                <div className="text-center">
                  <img
                    src={mainPhotoUrl}
                    alt="Preview Foto Utama"
                    className="rounded border shadow-sm object-cover"
                    style={{
                      width: "300px",
                      height: "400px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Cerita */}
            <div className="mb-8">
              <div className="d-flex justify-content-between align-items-center mb-5">
                <label className="form-label fw-bold fs-5">Daftar Cerita</label>
                <button
                  type="button"
                  onClick={addStory}
                  className="btn btn-light-primary btn-sm"
                >
                  <i className="ki-duotone ki-plus fs-2 me-1"></i> Tambah Cerita
                </button>
              </div>

              {stories.map((story, index) => (
                <div key={index} className="card card-flush shadow-sm mb-5">
                  <div className="card-header">
                    <div className="card-title">
                      <h4 className="fw-bold">Cerita {index + 1}</h4>
                    </div>
                    <div className="card-toolbar">
                      {stories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStory(index)}
                          className="btn btn-icon btn-light-danger btn-sm"
                          title="Hapus cerita"
                        >
                          <i className="ki-duotone ki-trash fs-2"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="mb-5">
                      <label className="form-label required">Judul Cerita</label>
                      <input
                        type="text"
                        placeholder="Contoh: Pertemuan Pertama"
                        value={story.heading}
                        onChange={(e) =>
                          handleStoryChange(index, "heading", e.target.value)
                        }
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-5">
                      <label className="form-label required">Isi Cerita</label>
                      <textarea
                        placeholder="Ceritakan momen spesial Anda..."
                        value={story.content}
                        onChange={(e) =>
                          handleStoryChange(index, "content", e.target.value)
                        }
                        className="form-control"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pesan */}
            {message && (
              <div
                className={`alert ${
                  message.includes("✅")
                    ? "alert-success"
                    : message.includes("❌")
                    ? "alert-danger"
                    : "alert-info"
                } mb-8`}
              >
                {message}
              </div>
            )}

            {/* Tombol simpan */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary px-8 py-3 fw-bold"
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                {loading ? "Menyimpan..." : "Simpan Our Story"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
