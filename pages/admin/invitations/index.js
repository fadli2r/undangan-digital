import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayoutJWT from '../../../components/layouts/AdminLayoutJWT';
import Link from 'next/link';

export default function InvitationManagement() {
  const router = useRouter();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    template: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalInvitations: 0
  });

  useEffect(() => {
    fetchInvitations();
  }, [filters]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        ...filters,
        page: filters.page,
        limit: filters.limit
      });

      const response = await fetch(`/api/admin/invitations/index-jwt?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
          window.location.href = '/admin/login';
          return;
        }
        throw new Error('Failed to fetch invitations');
      }

      const data = await response.json();
      setInvitations(data.invitations);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalInvitations: data.totalInvitations
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
      page: 1
    });
  };

  const handleStatusFilter = (e) => {
    setFilters({
      ...filters,
      status: e.target.value,
      page: 1
    });
  };

  const handleTemplateFilter = (e) => {
    setFilters({
      ...filters,
      template: e.target.value,
      page: 1
    });
  };

  const handleSort = (field) => {
    setFilters({
      ...filters,
      sortBy: field,
      sortOrder: filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
  };

  const handleAction = async (invitationId, action) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/invitations/${invitationId}/${action}-jwt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
          window.location.href = '/admin/login';
          return;
        }
        throw new Error(`Failed to ${action} invitation`);
      }

      fetchInvitations();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'badge-light-success';
      case 'draft':
        return 'badge-light-warning';
      case 'expired':
        return 'badge-light-danger';
      case 'inactive':
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
                placeholder="Search invitations"
                value={filters.search}
                onChange={handleSearch}
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
                  onChange={handleStatusFilter}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {/* End::Filter */}

              {/* Begin::Template Filter */}
              <div className="me-3">
                <select
                  className="form-select form-select-solid"
                  value={filters.template}
                  onChange={handleTemplateFilter}
                >
                  <option value="all">All Templates</option>
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="elegant">Elegant</option>
                </select>
              </div>
              {/* End::Template Filter */}

              {/* Begin::Export */}
              <button 
                type="button" 
                className="btn btn-light-primary me-3"
                onClick={() => router.push('/admin/invitations/export')}
              >
                <i className="ki-duotone ki-exit-up fs-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Export
              </button>
              {/* End::Export */}
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
            <table className="table align-middle table-row-dashed fs-6 gy-5" id="kt_table_invitations">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th className="min-w-125px cursor-pointer" onClick={() => handleSort('mempelai.pria')}>
                    Couple
                    {filters.sortBy === 'mempelai.pria' && (
                      <span className="ms-1">
                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="min-w-125px cursor-pointer" onClick={() => handleSort('slug')}>
                    Slug
                    {filters.sortBy === 'slug' && (
                      <span className="ms-1">
                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="min-w-125px">Owner</th>
                  <th className="min-w-125px">Template</th>
                  <th className="min-w-125px">Status</th>
                  <th className="min-w-125px cursor-pointer" onClick={() => handleSort('createdAt')}>
                    Created At
                    {filters.sortBy === 'createdAt' && (
                      <span className="ms-1">
                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="text-end min-w-100px">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {invitations.map((invitation) => (
                  <tr key={invitation._id}>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="text-gray-800 mb-1">
                          {invitation.mempelai?.pria} & {invitation.mempelai?.wanita}
                        </span>
                      </div>
                    </td>
                    <td>
  <a
    href={`/undangan/${invitation.slug}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary text-hover-primary text-decoration-underline"
  >
    {invitation.slug}
  </a>
</td>

                    <td>
                      <div className="d-flex flex-column">
                        <span className="text-gray-800 mb-1">{invitation.user?.name}</span>
                        <span className="text-gray-600">{invitation.user?.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-gray-800 text-capitalize">{invitation.template}</span>
                    </td>
                    <td>
                      <div className={`badge ${getStatusBadgeClass(invitation.status)} fw-bold`}>
                        {invitation.status}
                      </div>
                    </td>
                    <td>{new Date(invitation.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                        onClick={() => router.push(`/admin/invitations/${invitation._id}`)}
                      >
                        <i className="ki-duotone ki-eye fs-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </button>
                      {invitation.status === 'active' ? (
                        <button
                          className="btn btn-icon btn-bg-light btn-active-color-warning btn-sm me-1"
                          onClick={() => handleAction(invitation._id, 'deactivate')}
                        >
                          <i className="ki-duotone ki-shield-cross fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </button>
                      ) : (
                        <button
                          className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1"
                          onClick={() => handleAction(invitation._id, 'activate')}
                        >
                          <i className="ki-duotone ki-shield-tick fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </button>
                      )}
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                        onClick={() => handleAction(invitation._id, 'delete')}
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

          {/* Begin::Pagination */}
          <div className="d-flex flex-stack flex-wrap pt-10">
            <div className="fs-6 fw-semibold text-gray-700">
              Showing {(pagination.currentPage - 1) * filters.limit + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalInvitations)} of {pagination.totalInvitations} entries
            </div>
            <ul className="pagination">
              <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(1)}>
                  <i className="ki-duotone ki-double-left fs-5"></i>
                </button>
              </li>
              <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(pagination.currentPage - 1)}>
                  <i className="ki-duotone ki-left fs-5"></i>
                </button>
              </li>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${pagination.currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(pagination.currentPage + 1)}>
                  <i className="ki-duotone ki-right fs-5"></i>
                </button>
              </li>
              <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(pagination.totalPages)}>
                  <i className="ki-duotone ki-double-right fs-5"></i>
                </button>
              </li>
            </ul>
          </div>
          {/* End::Pagination */}
        </div>
        {/* End::Card body */}
      </div>
    </AdminLayoutJWT>
  );
}
