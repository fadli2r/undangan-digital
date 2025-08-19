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

  // Fetch existing our_story data
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        const ourStory = data.undangan?.our_story || {};
        setMainPhotoUrl(ourStory.main_photo || "");
        setTitle(ourStory.title || "");
        setStories(ourStory.stories && ourStory.stories.length > 0 ? ourStory.stories : [{ heading: "", content: "" }]);
      });
  }, [slug]);

  const handleStoryChange = (index, field, value) => {
    const newStories = [...stories];
    newStories[index][field] = value;
    setStories(newStories);
  };

  const addStory = () => {
    setStories([...stories, { heading: "", content: "" }]);
  };

  const removeStory = (index) => {
    if (stories.length === 1) return; // At least one story
    const newStories = stories.filter((_, i) => i !== index);
    setStories(newStories);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMainPhotoFile(file);
    // Preview image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async () => {
    if (!mainPhotoFile) return mainPhotoUrl; // No new file, keep existing URL

    const formData = new FormData();
    formData.append("file", mainPhotoFile);

    const res = await fetch("/api/invitation/upload.galeri", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return data.url; // Assuming API returns { url: "uploaded_file_url" }
    } else {
      throw new Error("Upload gagal");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
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
              stories
            }
          }
        }),
      });
      if (res.ok) {
        setMessage("Our Story berhasil disimpan.");
      } else {
        setMessage("Gagal menyimpan Our Story.");
      }
    } catch (error) {
      setMessage("Gagal mengupload foto utama.");
    }
    setLoading(false);
  };

  return (
    <UserLayout>
      <BackButton />
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Edit Our Story</h2>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="form-label required">Judul</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="form-control"
                placeholder="Contoh: Kisah Cinta Kami"
                required
              />
            </div>

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
                    className="rounded w-300px h-200px object-fit-cover border"
                  />
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="d-flex justify-content-between align-items-center mb-5">
                <label className="form-label fw-bold">Cerita</label>
                <button
                  type="button"
                  onClick={addStory}
                  className="btn btn-light-primary btn-sm"
                >
                  <i className="ki-duotone ki-plus fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Tambah Cerita
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
                          <i className="ki-duotone ki-trash fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                            <span className="path5"></span>
                          </i>
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
                        onChange={e => handleStoryChange(index, "heading", e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="mb-5">
                      <label className="form-label required">Isi Cerita</label>
                      <textarea
                        placeholder="Ceritakan momen spesial Anda..."
                        value={story.content}
                        onChange={e => handleStoryChange(index, "content", e.target.value)}
                        className="form-control"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {message && (
              <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-danger'} mb-8`}>
                <i className={`ki-duotone ${message.includes('berhasil') ? 'ki-check-circle' : 'ki-cross-circle'} fs-2 me-2`}>
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                {message}
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
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
