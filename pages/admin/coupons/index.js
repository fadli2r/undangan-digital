// pages/admin/coupons/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import AdminLayout from '@/components/layouts/AdminLayout';

export default function CouponsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [type, setType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Redirect non-admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
    } else if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.replace('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, type, sortBy, sortOrder, pagination.current, status]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
        search,
        status: statusFilter,
        type,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/coupons?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch coupons');

      const data = await response.json();
      setCoupons(data.coupons);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kupon ini?')) return;

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete coupon');
      }

      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert(error.message);
    }
  };

  const getCouponStatusBadge = (coupon) => {
    const badgeClasses = {
      active: 'badge badge-light-success',
      inactive: 'badge badge-light-danger',
      expired: 'badge badge-light-warning',
      scheduled: 'badge badge-light-info',
      exhausted: 'badge badge-light-dark',
    };

    return (
      <span className={badgeClasses[coupon.status] || 'badge badge-light'}>
        {coupon.status?.charAt(0).toUpperCase() + coupon.status?.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout>
      <Head>
        <title>Manajemen Kupon - Digital Invitation</title>
      </Head>

      {/* Begin::Content */}
        {/* Begin::Container */}

          {/* Begin::Row */}
          <div className="row g-5 g-xl-8">
            {/* Begin::Stats */}
            <div className="col-xl-3">
              <div className="card card-xl-stretch mb-xl-8">
                <div className="card-body p-5">
                  <div className="d-flex align-items-center">
                    <div className="symbol symbol-40px me-3">
                      <i className="ki-duotone ki-ticket fs-1 text-primary">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </div>
                    <div>
                      <div className="fs-6 text-gray-800 fw-bold">{stats?.totalCoupons || 0}</div>
                      <div className="fs-7 text-gray-600">Total Kupon</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3">
              <div className="card card-xl-stretch mb-xl-8">
                <div className="card-body p-5">
                  <div className="d-flex align-items-center">
                    <div className="symbol symbol-40px me-3">
                      <i className="ki-duotone ki-check-square fs-1 text-success">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </div>
                    <div>
                      <div className="fs-6 text-gray-800 fw-bold">{stats?.activeCoupons || 0}</div>
                      <div className="fs-7 text-gray-600">Kupon Aktif</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3">
              <div className="card card-xl-stretch mb-xl-8">
                <div className="card-body p-5">
                  <div className="d-flex align-items-center">
                    <div className="symbol symbol-40px me-3">
                      <i className="ki-duotone ki-chart-simple fs-1 text-info">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </div>
                    <div>
                      <div className="fs-6 text-gray-800 fw-bold">{stats?.totalUsage || 0}</div>
                      <div className="fs-7 text-gray-600">Total Penggunaan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3">
              <div className="card card-xl-stretch mb-xl-8">
                <div className="card-body p-5">
                  <div className="d-flex align-items-center">
                    <div className="symbol symbol-40px me-3">
                      <i className="ki-duotone ki-dollar fs-1 text-warning">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </div>
                    <div>
                      <div className="fs-6 text-gray-800 fw-bold">
                        Rp {(stats?.totalDiscountGiven || 0).toLocaleString()}
                      </div>
                      <div className="fs-7 text-gray-600">Total Diskon</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* End::Stats */}
          </div>
          {/* End::Row */}

          {/* Begin::Card */}
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
                    className="form-control form-control-solid w-250px ps-13"
                    placeholder="Cari kupon..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                  <button
                    type="button"
                    className="btn btn-light-primary me-3"
                    data-kt-menu-trigger="click"
                    data-kt-menu-placement="bottom-end"
                  >
                    <i className="ki-duotone ki-filter fs-2">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Filter
                  </button>

                  {/* Begin::Menu 1 */}
                  <div className="menu menu-sub menu-sub-dropdown w-300px w-md-325px" data-kt-menu="true">
                    {/* Begin::Header */}
                    <div className="px-7 py-5">
                      <div className="fs-5 text-gray-900 fw-bold">Filter Options</div>
                    </div>
                    {/* End::Header */}

                    {/* Begin::Separator */}
                    <div className="separator border-gray-200"></div>
                    {/* End::Separator */}

                    {/* Begin::Content */}
                    <div className="px-7 py-5">
                      {/* Begin::Input group */}
                      <div className="mb-10">
                        <label className="form-label fw-semibold">Status:</label>
                        <select
                          className="form-select"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="all">Semua</option>
                          <option value="active">Aktif</option>
                          <option value="inactive">Tidak Aktif</option>
                          <option value="expired">Kadaluarsa</option>
                          <option value="scheduled">Terjadwal</option>
                          <option value="exhausted">Habis</option>
                        </select>
                      </div>
                      {/* End::Input group */}

                      {/* Begin::Input group */}
                      <div className="mb-10">
                        <label className="form-label fw-semibold">Tipe:</label>
                        <select
                          className="form-select"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                        >
                          <option value="all">Semua</option>
                          <option value="percentage">Persentase</option>
                          <option value="fixed">Nominal Tetap</option>
                        </select>
                      </div>
                      {/* End::Input group */}

                      {/* Begin::Actions */}
                      <div className="d-flex justify-content-end">
                        <button
                          type="reset"
                          className="btn btn-sm btn-light btn-active-light-primary me-2"
                          onClick={() => {
                            setStatus('all');
                            setType('all');
                          }}
                        >
                          Reset
                        </button>
                        <button type="submit" className="btn btn-sm btn-primary">
                          Apply
                        </button>
                      </div>
                      {/* End::Actions */}
                    </div>
                    {/* End::Content */}
                  </div>
                  {/* End::Menu 1 */}
                  {/* End::Filter */}

                  {/* Begin::Add user */}
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => router.push('/admin/coupons/create')}
                  >
                    <i className="ki-duotone ki-plus fs-2"></i>
                    Tambah Kupon
                  </button>
                  {/* End::Add user */}
                </div>
                {/* End::Toolbar */}
              </div>
              {/* End::Card toolbar */}
            </div>
            {/* End::Card header */}

            {/* Begin::Card body */}
            <div className="card-body py-4">
              {/* Begin::Table */}
              <div className="table-responsive">
                <table className="table align-middle table-row-dashed fs-6 gy-5" id="kt_table_users">
                  <thead>
                    <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                      <th>Kode</th>
                      <th>Nama</th>
                      <th>Tipe</th>
                      <th>Nilai</th>
                      <th>Penggunaan</th>
                      <th>Status</th>
                      <th>Periode</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 fw-semibold">
                    {coupons.map((coupon) => (
                      <tr key={coupon._id}>
                        <td>{coupon.code}</td>
                        <td>{coupon.name}</td>
                        <td>
                          {coupon.type === 'percentage' ? 'Persentase' : 'Nominal Tetap'}
                        </td>
                        <td>
                          {coupon.type === 'percentage' 
                            ? `${coupon.value}%` 
                            : `Rp ${coupon.value.toLocaleString()}`
                          }
                        </td>
                        <td>
                          {coupon.usageLimit 
                            ? `${coupon.usageCount}/${coupon.usageLimit}`
                            : coupon.usageCount
                          }
                        </td>
                        <td>{getCouponStatusBadge(coupon)}</td>
                        <td>
                          {new Date(coupon.startDate).toLocaleDateString()} - 
                          {new Date(coupon.endDate).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="btn btn-icon btn-active-light-primary w-30px h-30px me-3"
                            onClick={() => router.push(`/admin/coupons/${coupon._id}/edit`)}
                          >
                            <i className="ki-duotone ki-pencil fs-3">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                          </button>
                          <button
                            className="btn btn-icon btn-active-light-danger w-30px h-30px"
                            onClick={() => handleDelete(coupon._id)}
                          >
                            <i className="ki-duotone ki-trash fs-3">
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
              </div>
              {/* End::Table */}

              {/* Begin::Pagination */}
              {pagination.pages > 1 && (
                <div className="d-flex flex-stack flex-wrap pt-10">
                  <div className="fs-6 fw-semibold text-gray-700">
                    Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.current * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} entries
                  </div>
                  <ul className="pagination">
                    <li className={`page-item ${pagination.current === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                        disabled={pagination.current === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <li
                        key={i + 1}
                        className={`page-item ${pagination.current === i + 1 ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPagination(prev => ({ ...prev, current: i + 1 }))}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${pagination.current === pagination.pages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                        disabled={pagination.current === pagination.pages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
              )}
              {/* End::Pagination */}
            </div>
            {/* End::Card body */}
          </div>
          {/* End::Card */}
        {/* End::Container */}
      {/* End::Content */}
    </AdminLayout>
  );
}
