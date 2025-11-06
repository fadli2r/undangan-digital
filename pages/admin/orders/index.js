// pages/admin/orders/index.js  (atau file yang relevan)
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/layouts/AdminLayout";
import OrderDetailsModal from "@/components/admin/OrderDetailsModal";
import SeoHead from '@/components/SeoHead';

export default function Orders() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    sortBy: "date",
    sortOrder: "desc",
  });

  // --- Helpers aman ---
  const pickDate = (o) => o?.createdAt || o?.created_at || o?.date || null;
  const toNumber = (v) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const pickAmount = (o) => {
    // prioritaskan amount (baru), lalu harga (legacy)
    if (typeof o?.amount === "number") return o.amount;
    if (typeof o?.harga === "number") return o.harga;
    // fallback kalau string
    const a = toNumber(o?.amount);
    if (a > 0) return a;
    const h = toNumber(o?.harga);
    if (h > 0) return h;
    return 0;
  };

  const safeFormatDate = (dateLike) => {
    if (!dateLike) return "-";
    const d = new Date(dateLike);
    if (isNaN(d)) return "-";
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const safeFormatCurrency = (amount) => {
    const n = toNumber(amount);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);
  };

  // Redirect kalau belum login / bukan admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
    if (status === "authenticated" && !session?.user?.isAdmin) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  // Fetch orders hanya kalau admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, currentPage, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        search: filters.search || "",
        status: filters.status || "all",
        sortBy: filters.sortBy || "date",
        sortOrder: filters.sortOrder || "desc",
      });

      // ⚠️ Pastikan endpoint sesuai file API kamu:
      // - kalau API-mu di /api/admin/order → ganti URL di bawah
      const res = await fetch(`/api/admin/orders?${queryParams.toString()}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch orders");

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setTotalPages(Number(data.totalPages || 1));
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Gagal memuat orders");
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const viewInvoice = (order) => {
    // pakai URL dari Xendit kalau ada, fallback pakai invoice_id (view publik Xendit)
    const url = order?.invoice_url || (order?.invoice_id ? `https://invoice.xendit.co/${order.invoice_id}` : null);
    if (url) window.open(url, "_blank");
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "paid":
        return "badge-light-success";
      case "pending":
        return "badge-light-warning";
      case "expired":
        return "badge-light-danger";
      case "failed":
      case "canceled":
      case "cancelled":
        return "badge-light-dark";
      default:
        return "badge-light-primary";
    }
  };

  return (
    <AdminLayout>
      <SeoHead
        title="Manajemen Pesanan - Dreamslink"
        description="Halaman untuk mengelola pesanan di panel admin."
        noindex
        canonical="/admin/orders"
      />
      <div className="card">
        {/* Begin::Card header */}
        <div className="card-header border-0 pt-6">
          {/* Begin::Card title */}
          <div className="card-title">
            {/* Begin::Search */}
            <div className="d-flex align-items-center position-relative my-1">
              <i className="ki-duotone ki-magnifier fs-3 position-absolute ms-5">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <input
                type="text"
                className="form-control form-control-solid w-250px ps-12"
                placeholder="Search orders"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            {/* End::Search */}
          </div>
          {/* End::Card title */}

          {/* Begin::Card toolbar */}
          <div className="card-toolbar">
            {/* Begin::Toolbar */}
            <div className="d-flex justify-content-end" data-kt-user-table-toolbar="base">
              {/* Begin::Filter */}
              <div className="me-3">
                <select
                  className="form-select form-select-solid"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="expired">Expired</option>
                  <option value="failed">Failed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
              {/* End::Filter */}

              {/* Begin::Sort */}
              <div className="me-3">
                <select
                  className="form-select form-select-solid"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="amount">Sort by Price</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
              {/* End::Sort */}

              {/* Begin::Sort Order */}
              <div className="me-3">
                <select
                  className="form-select form-select-solid"
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
              {/* End::Sort Order */}
            </div>
            {/* End::Toolbar */}
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
            <table className="table align-middle table-row-dashed fs-6 gy-5" id="kt_table_orders">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th className="min-w-125px">Date</th>
                  <th className="min-w-125px">Invoice ID</th>
                  <th className="min-w-125px">Email</th>
                  <th className="min-w-125px">Package</th>
                  <th className="min-w-125px">Price</th>
                  <th className="min-w-125px">Status</th>
                  <th className="text-end min-w-100px">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">No orders found</td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const dateStr = safeFormatDate(pickDate(order));
                    const priceStr = safeFormatCurrency(pickAmount(order));
                    const pkgName = order?.package?.name || order?.packageName || (order?.packageId ? `#${String(order.packageId).slice(-6)}` : "-");
                    return (
                      <tr key={order._id}>
                        <td>{dateStr}</td>
                        <td>{order.invoice_id || "-"}</td>
                        <td>{order.email || "-"}</td>
                        <td>{pkgName}</td>
                        <td>{priceStr}</td>
                        <td>
                          <div className={`badge ${getStatusBadgeClass(order.status)} fw-bold`}>
                            {order.status}
                          </div>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <i className="ki-duotone ki-eye fs-2">
                              <span className="path1"></span>
                              <span className="path2"></span>
                              <span className="path3"></span>
                            </i>
                          </button>
                          {order.status === "paid" && (
                            <button
                              className="btn btn-icon btn-bg-light btn-active-color-success btn-sm"
                              onClick={() => viewInvoice(order)}
                              title="Open Invoice"
                            >
                              <i className="ki-duotone ki-document fs-2">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* Begin::Pagination */}
          {!loading && orders.length > 0 && (
            <div className="d-flex flex-stack flex-wrap pt-10">
              <div className="fs-6 fw-semibold text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(1)}>
                    <i className="ki-duotone ki-double-left fs-5"></i>
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    <i className="ki-duotone ki-left fs-5"></i>
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    <i className="ki-duotone ki-right fs-5"></i>
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(totalPages)}>
                    <i className="ki-duotone ki-double-right fs-5"></i>
                  </button>
                </li>
              </ul>
            </div>
          )}
          {/* End::Pagination */}
        </div>
        {/* End::Card body */}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
    </AdminLayout>
  );
}
