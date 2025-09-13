import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import AdminLayout from "../../../components/layouts/AdminLayout";

export default function PackageManagement() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // ✅ Redirect jika bukan admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.isAdmin) {
      router.replace("/admin/login");
    }
  }, [session, status, router]);

  // ✅ Fetch packages kalau sudah login admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      fetchPackages();
    }
  }, [status, session]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/packages");
      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }
        throw new Error("Failed to fetch packages");
      }
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    const sorted = [...packages].sort((a, b) => {
      const comparison = (a.sortOrder || 0) - (b.sortOrder || 0);
      return sortOrder === "asc" ? comparison : -comparison;
    });
    setPackages(sorted);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // 🔁 toggle status via PUT /api/admin/packages/:id
  const handleStatusToggle = async (packageId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to toggle package status");
      }

      fetchPackages();
    } catch (err) {
      console.error("Error toggling package status:", err);
      setError(err.message);
    }
  };

  const handleDelete = async (packageId) => {
    if (!window.confirm("Are you sure you want to delete this package?")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete package");
      }
      fetchPackages();
    } catch (err) {
      console.error("Error deleting package:", err);
      setError(err.message);
    }
  };

  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(n || 0));

  return (
    <AdminLayout>
      <div className="card">
        {/* Begin::Card header */}
        <div className="card-header border-0 pt-6">
          {/* Begin::Card title */}
          <div className="card-title">
            <h2>Packages</h2>
          </div>
          {/* End::Card title */}

          {/* Begin::Card toolbar */}
          <div className="card-toolbar">
            <div className="d-flex justify-content-end" data-kt-user-table-toolbar="base">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => router.push("/admin/packages/new")}
              >
                <i className="ki-duotone ki-plus fs-2"></i>
                Add Package
              </button>
            </div>
          </div>
          {/* End::Card toolbar */}
        </div>
        {/* End::Card header */}

        {/* Begin::Card body */}
        <div className="card-body py-4">
          {loading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <table className="table align-middle table-row-dashed fs-6 gy-5" id="kt_table_packages">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th className="min-w-125px cursor-pointer" onClick={handleSort}>
                    Name <span className="ms-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  </th>
                  <th className="min-w-100px">Type</th>
                  <th className="min-w-125px">Price</th>
                  <th className="min-w-125px">Duration</th>
                  <th className="min-w-100px">Keys</th>
                  <th className="min-w-125px">Status</th>
                  <th className="text-end min-w-100px">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {packages.map((pkg) => (
                  <tr key={pkg._id}>
                    <td className="d-flex align-items-center">
                      <div className="symbol symbol-circle symbol-50px overflow-hidden me-3">
                        <div
                          className="symbol-label fs-3"
                          style={{
                            backgroundColor:
                              (pkg?.metadata?.color || "#3B82F6") + "20",
                            color: pkg?.metadata?.color || "#3B82F6",
                          }}
                        >
                          {pkg?.metadata?.icon || "📦"}
                        </div>
                      </div>
                      <div className="d-flex flex-column">
                        <span className="text-gray-800 mb-1">{pkg.name}</span>
                        <span className="text-muted fs-7">/{pkg.slug}</span>
                        {pkg.metadata?.badge && (
                          <span className="badge badge-light-primary mt-1">
                            {pkg.metadata.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div
                        className={`badge ${
                          pkg.type === "custom"
                            ? "badge-light-info"
                            : "badge-light-primary"
                        }`}
                      >
                        {pkg.type || "fixed"}
                      </div>
                    </td>

                    <td>
                      <div className="text-gray-800">{formatRupiah(pkg.price)}</div>
                      {pkg.discountPercentage > 0 && (
                        <div className="text-success fs-7">
                          {pkg.discountPercentage}% off
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="text-gray-800">
                        {pkg?.duration?.value} {pkg?.duration?.unit}
                      </div>
                    </td>

                    <td>
                      <div className="text-gray-800">
                        {(pkg.featureKeys || []).length} keys
                      </div>
                    </td>

                    <td>
                      <div
                        className={`badge badge-light-${
                          pkg.isActive ? "success" : "danger"
                        }`}
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
                      </div>
                    </td>

                    <td className="text-end">
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                        onClick={() => router.push(`/admin/packages/${pkg._id}/edit`)}
                      >
                        <i className="ki-duotone ki-pencil fs-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button>

                      <button
                        className={`btn btn-icon btn-bg-light btn-active-color-${
                          pkg.isActive ? "warning" : "success"
                        } btn-sm me-1`}
                        onClick={() => handleStatusToggle(pkg._id, pkg.isActive)}
                      >
                        <i
                          className={`ki-duotone ki-${
                            pkg.isActive ? "shield-cross" : "shield-tick"
                          } fs-2`}
                        >
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button>

                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                        onClick={() => handleDelete(pkg._id)}
                      >
                        <i className="ki-duotone ki-trash fs-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                          <span className="path5"></span>
                        </i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* End::Card body */}
      </div>
    </AdminLayout>
  );
}
