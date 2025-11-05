import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Swal from "sweetalert2";
import AdminLayout from "@/components/layouts/AdminLayout";

export default function EditTemplatePage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    thumbnail: "",
    category: "",
    price: 0,
    isPremium: false,
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔒 Proteksi admin
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/admin/login");
    else if (status === "authenticated" && !session?.user?.isAdmin)
      router.replace("/");
  }, [status, session, router]);

  // Ambil data template
  useEffect(() => {
    if (id && status === "authenticated" && session?.user?.isAdmin) {
      fetchTemplate();
    }
  }, [id, status]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/templates?id=${id}`);
      const data = await res.json();

      if (!data.ok) throw new Error(data.message || "Template tidak ditemukan");
      setForm(data.template);
    } catch (err) {
      Swal.fire("Error", err.message || "Gagal memuat data template", "error");
      router.push("/admin/templates");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    Swal.fire({
      title: "Mengunggah gambar...",
      text: "Mohon tunggu sebentar",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.ok) {
        setForm((prev) => ({ ...prev, thumbnail: data.url }));
        Swal.fire({
          icon: "success",
          title: "Upload berhasil!",
          timer: 1000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Gagal", data.error || "Upload gagal.", "error");
      }
    } catch (err) {
      Swal.fire("Error", err.message || "Gagal upload thumbnail.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.message || "Gagal memperbarui template");

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Template berhasil diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => router.push("/admin/templates"), 1200);
    } catch (err) {
      Swal.fire("Error", err.message || "Terjadi kesalahan.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center min-h-400px">
          <div className="spinner-border text-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Edit Template - Digital Invitation</title>
      </Head>

      <div className="card">
        <div className="card-header border-0 pt-6 d-flex justify-content-between align-items-center">
          <h3 className="fw-bold text-gray-900">Edit Template</h3>
          <button
            className="btn btn-light"
            onClick={() => router.push("/admin/templates")}
          >
            ← Kembali
          </button>
        </div>

        <div className="card-body pt-0">
          <form onSubmit={handleSubmit} className="row g-5">
            {/* Nama Template */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Nama Template</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control form-control-solid"
                required
              />
            </div>

            {/* Slug */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Slug</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="form-control form-control-solid"
                required
              />
            </div>

            {/* Deskripsi */}
            <div className="col-md-12">
              <label className="form-label fw-semibold">Deskripsi</label>
              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                className="form-control form-control-solid"
                rows={3}
              />
            </div>

            {/* Thumbnail */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleUpload}
              />
              {form.thumbnail && (
                <div className="mt-3">
                  <img
                    src={form.thumbnail}
                    alt="Thumbnail Preview"
                    className="img-fluid rounded border"
                    style={{
                      maxHeight: "300px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Kategori */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Kategori</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-control form-control-solid"
              />
            </div>

            {/* Harga */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Harga (Rp)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="form-control form-control-solid"
                placeholder="0 = Gratis"
              />
            </div>

            {/* Status & Premium */}
            <div className="col-md-6 d-flex align-items-center gap-5">
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={form.isPremium}
                  onChange={handleChange}
                  className="form-check-input"
                  id="isPremium"
                />
                <label className="form-check-label" htmlFor="isPremium">
                  Template Premium
                </label>
              </div>

              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="form-check-input"
                  id="isActive"
                />
                <label className="form-check-label" htmlFor="isActive">
                  Aktif
                </label>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="col-12 text-end mt-5">
              <button
                type="button"
                className="btn btn-light me-3"
                onClick={() => router.push("/admin/templates")}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
