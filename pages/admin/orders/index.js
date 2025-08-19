import { useState, useEffect } from 'react';
import AdminLayoutJWT from '../../../components/layouts/AdminLayoutJWT';
import OrderDetailsModal from '../../../components/admin/OrderDetailsModal';

export default function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        ...filters
      });

      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/orders/index-jwt?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');

      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const viewInvoice = (invoiceId) => {
    window.open(`/invoice/${invoiceId}`, '_blank');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'badge-light-success';
      case 'pending':
        return 'badge-light-warning';
      case 'expired':
        return 'badge-light-danger';
      case 'failed':
        return 'badge-light-dark';
      default:
        return 'badge-light-primary';
    }
  };

  return (
    <AdminLayoutJWT>
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
                onChange={(e) => handleFilterChange('search', e.target.value)}
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
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="expired">Expired</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              {/* End::Filter */}

              {/* Begin::Sort */}
              <div className="me-3">
                <select
                  className="form-select form-select-solid"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="harga">Sort by Price</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
              {/* End::Sort */}

              {/* Begin::Sort Order */}
              <div className="me-3">
                <select
                  className="form-select form-select-solid"
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
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
            <div className="alert alert-danger">
              {error}
            </div>
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
                  orders.map((order) => (
                    <tr key={order._id}>
                      <td>{formatDate(order.date)}</td>
                      <td>{order.invoice_id}</td>
                      <td>{order.email}</td>
                      <td>{order.paket}</td>
                      <td>{formatCurrency(order.harga)}</td>
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
                        {order.status === 'paid' && (
                          <button
                            className="btn btn-icon btn-bg-light btn-active-color-success btn-sm"
                            onClick={() => viewInvoice(order.invoice_id)}
                          >
                            <i className="ki-duotone ki-document fs-2">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
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
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(1)}>
                    <i className="ki-duotone ki-double-left fs-5"></i>
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                    <i className="ki-duotone ki-left fs-5"></i>
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                    <i className="ki-duotone ki-right fs-5"></i>
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
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
    </AdminLayoutJWT>
  );
}
