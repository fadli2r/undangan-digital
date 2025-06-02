import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6">Edit Our Story</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Judul</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Foto Utama</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
          {mainPhotoUrl && (
            <img src={mainPhotoUrl} alt="Preview Foto Utama" className="mt-4 max-h-48 object-cover rounded" />
          )}
        </div>
        <div>
          <label className="block font-semibold mb-2">Cerita</label>
          {stories.map((story, index) => (
            <div key={index} className="mb-4 border p-4 rounded relative">
              <button
                type="button"
                onClick={() => removeStory(index)}
                className="absolute top-2 right-2 text-red-600 font-bold"
                title="Hapus cerita"
              >
                &times;
              </button>
              <input
                type="text"
                placeholder="Judul cerita"
                value={story.heading}
                onChange={e => handleStoryChange(index, "heading", e.target.value)}
                className="w-full border p-2 rounded mb-2"
                required
              />
              <textarea
                placeholder="Isi cerita"
                value={story.content}
                onChange={e => handleStoryChange(index, "content", e.target.value)}
                className="w-full border p-2 rounded"
                rows={4}
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addStory}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Tambah Cerita
          </button>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            {loading ? "Menyimpan..." : "Simpan Our Story"}
          </button>
        </div>
        {message && <div className="mt-4 text-center text-blue-600">{message}</div>}
      </form>
    </div>
  );
}
