import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Swal from "sweetalert2";
import AdminLayout from "@/components/layouts/AdminLayout";
import SeoHead from '@/components/SeoHead';

export default function TemplatesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  // ✅ Proteksi admin
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/admin/login");
      return;
    }

    const user = session?.user;
    const isAuthorized =
      user?.isAdmin === true ||
      user?.role === "admin" ||
      user?.role === "superadmin";

    if (!isAuthorized) {
      Swal.fire("Akses Ditolak", "Anda tidak memiliki izin untuk halaman ini.", "error");
      router.replace("/");
      return;
    }

    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, search, sortBy, sortOrder, pagination.current]);

  // ✅ Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        sortBy,
        sortOrder,
        page: pagination.current,
        limit: pagination.limit,
      });

      const res = await fetch(`/api/admin/templates?${query}`);
      const data = await res.json();

      if (res.ok && data.ok) {
        setTemplates(data.templates || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages,
        }));
      } else {
        Swal.fire("Gagal", data.message || "Gagal memuat data.", "error");
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      Swal.fire("Error", "Gagal memuat template.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Hapus
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Hapus Template?",
      text: "Tindakan ini tidak bisa dibatalkan.",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/templates?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.ok) {
        Swal.fire("Berhasil", "Template berhasil dihapus.", "success");
        fetchTemplates();
      } else {
        Swal.fire("Gagal", data.message || "Gagal menghapus template.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan saat menghapus.", "error");
    }
  };

  // 🔁 Aktif / Nonaktif
  const toggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/templates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        Swal.fire({
          icon: "success",
          title: `Template ${!currentStatus ? "diaktifkan" : "dinonaktifkan"}`,
          timer: 1200,
          showConfirmButton: false,
        });
        fetchTemplates();
      } else {
        Swal.fire("Gagal", data.message || "Update status gagal.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan saat memperbarui status.", "error");
    }
  };

  // 🔍 Preview Template
  const handlePreview = (slug) => {
    window.open(`/preview/${slug}`, "_blank");
  };

  if (status === "loading") {
    return (
      <AdminLayout>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "70vh" }}
        >
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
          ></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SeoHead
        title="Manajemen Template - Dreamslink"
        description="Halaman untuk mengelola template undangan di panel admin."
        noindex
        canonical="/admin/templates"
      />

      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="text-dark fw-bold fs-2">Manajemen Template</h1>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => router.push("/admin/templates/create")}
        >
          <i className="fas fa-plus"></i> Tambah Template
        </button>
      </div>

      {/* Tabel Template */}
      <div className="card">
        <div className="card-header border-0 pt-6">
          <div className="card-title">
            <div className="d-flex align-items-center position-relative my-1">
              <i className="fas fa-search position-absolute ms-4 text-muted"></i>
              <input
                type="text"
                className="form-control form-control-solid w-250px ps-10"
                placeholder="Cari template..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, current: 1 }));
                }}
              />
            </div>
          </div>

          <div className="card-toolbar">
            <select
              className="form-select form-select-solid w-150px"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Tanggal</option>
              <option value="name">Nama</option>
              <option value="price">Harga</option>
            </select>

            <select
              className="form-select form-select-solid w-100px ms-3"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">↓ Desc</option>
              <option value="asc">↑ Asc</option>
            </select>
          </div>
        </div>

        <div className="card-body py-4">
          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-5">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th>Thumbnail</th>
                  <th>Nama Template</th>
                  <th>Slug</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Status</th>
                  <th>Dibuat</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="text-gray-600 fw-semibold">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10">
                      <div className="spinner-border text-primary"></div>
                    </td>
                  </tr>
                ) : templates.length > 0 ? (
                  templates.map((tpl) => (
                    <tr key={tpl._id}>
                      <td>
                        <img
                          src={tpl.thumbnail || "/images/bg_couple.jpg"}
                          alt={tpl.name}
                          className="rounded"
                          style={{
                            width: "80px",
                            height: "120px",
                            objectFit: "cover",
                            border: "1px solid #ddd",
                          }}
                        />
                      </td>
                      <td>
                        {tpl.name}{" "}
                        {tpl.isPremium && (
                          <span className="badge bg-warning text-dark ms-1">Premium</span>
                        )}
                      </td>
                      <td>{tpl.slug}</td>
                      <td>{tpl.category || "-"}</td>
                      <td>
                        {tpl.price > 0
                          ? `Rp ${tpl.price.toLocaleString("id-ID")}`
                          : "Gratis"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            tpl.isActive ? "bg-success" : "bg-danger"
                          }`}
                        >
                          {tpl.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td>{new Date(tpl.createdAt).toLocaleDateString("id-ID")}</td>
                      <td className="text-center">
                        <div className="btn-group gap-2">
                          <button
                            className="btn btn-sm btn-icon btn-light-primary"
                            title="Edit Template"
                            onClick={() =>
                              router.push(`/admin/templates/${tpl._id}/edit`)
                            }
                          >
                            <i className="fas fa-edit"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-icon btn-light-info"
                            title="Preview Template"
                            onClick={() => handlePreview(tpl.slug)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-icon btn-light-success"
                            title="Aktif / Nonaktif"
                            onClick={() => toggleActive(tpl._id, tpl.isActive)}
                          >
                            <i className="fas fa-toggle-on"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-icon btn-light-danger"
                            title="Hapus Template"
                            onClick={() => handleDelete(tpl._id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-10">
                      Tidak ada template ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="d-flex flex-stack flex-wrap pt-10">
              <div className="fs-6 fw-semibold text-gray-700">
                Menampilkan{" "}
                {Math.min(
                  (pagination.current - 1) * pagination.limit + 1,
                  pagination.total
                )}{" "}
                -{" "}
                {Math.min(
                  pagination.current * pagination.limit,
                  pagination.total
                )}{" "}
                dari {pagination.total} template
              </div>

              <ul className="pagination">
                <li
                  className={`page-item ${
                    pagination.current === 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setPagination((p) => ({ ...p, current: p.current - 1 }))
                    }
                  >
                    Previous
                  </button>
                </li>

                {Array.from({ length: pagination.pages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${
                      pagination.current === i + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setPagination((p) => ({ ...p, current: i + 1 }))
                      }
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    pagination.current === pagination.pages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setPagination((p) => ({ ...p, current: p.current + 1 }))
                    }
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
