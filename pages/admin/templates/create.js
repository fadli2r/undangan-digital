import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Swal from "sweetalert2";
import AdminLayout from "@/components/layouts/AdminLayout";
import SeoHead from '@/components/SeoHead';

export default function CreateTemplatePage() {
  const router = useRouter();
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

  const [loading, setLoading] = useState(false);

  if (status === "unauthenticated") {
    router.replace("/admin/login");
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Auto-generate slug jika field name diubah dan slug masih kosong
    if (name === "name" && !form.slug) {
      const autoSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setForm((prev) => ({ ...prev, name: value, slug: autoSlug }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menambah template");

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Template berhasil ditambahkan.",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => router.push("/admin/templates"), 1200);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: err.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
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
      const res = await fetch("/api/admin/templates/upload", {
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
        Swal.fire({
          icon: "error",
          title: "Upload gagal",
          text: data.error || "Terjadi kesalahan saat upload.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.message || "Upload error",
      });
    }
  };

  return (
    <AdminLayout>
      <SeoHead
        title="Buat Template Baru - Dreamslink"
        description="Halaman untuk membuat template undangan baru di panel admin."
        noindex
        canonical="/admin/templates/create"
      />

      <div className="card">
        <div className="card-header border-0 pt-6">
          <h3 className="fw-bold text-gray-900">Tambah Template Baru</h3>
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
                placeholder="Classic Elegant"
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
                placeholder="classic-elegant"
                required
              />
            </div>

            {/* Deskripsi */}
            <div className="col-md-12">
              <label className="form-label fw-semibold">Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="form-control form-control-solid"
                placeholder="Deskripsikan tampilan template..."
                rows={3}
              />
            </div>

            {/* Upload Thumbnail */}
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
                placeholder="Modern, Minimalist, Rustic..."
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

            {/* Switch */}
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
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Template"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
