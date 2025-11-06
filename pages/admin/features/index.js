// pages/admin/features/index.js
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../../components/layouts/AdminLayout';
import SeoHead from '@/components/SeoHead';

const INITIAL = { key: '', name: '', description: '', price: 0, sort: 0, active: true };

const rupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n || 0));

export default function AdminFeaturesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [items, setItems]     = useState([]);

  // filter/sort/paging — diset supaya mirip halaman packages
  const [filters, setFilters] = useState({
    search: '',
    active: 'all', // 'all'|'true'|'false'
    page: 1,
    limit: 10,     // dropdown "Show X entries"
    sortBy: 'sort',
    sortOrder: 'asc',
  });

  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [editing, setEditing]     = useState(null); // object feature yang sedang diedit
  const [form, setForm]           = useState(INITIAL);

  // guard admin (samakan pola dengan halaman packages)
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.isAdmin) router.replace('/admin/login');
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isAdmin) fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, status, session]);

  async function fetchList() {
    try {
      setLoading(true);
      const qs = new URLSearchParams({
        ...filters,
        page: String(filters.page),
        limit: String(filters.limit),
      });
      const res = await fetch(`/api/admin/features?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch features');
      setItems(data.features || []);
      setPageInfo({ currentPage: data.currentPage, totalPages: data.totalPages, total: data.total });
      setError('');
    } catch (e) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  // UI handlers
  function openCreate() {
    setEditing(null);
    setForm(INITIAL);
    setShowModal(true);
  }
  function openEdit(f) {
    setEditing(f);
    setForm({
      key: f.key,
      name: f.name,
      description: f.description || '',
      price: f.price || 0,
      sort: f.sort || 0,
      active: !!f.active,
    });
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setForm(INITIAL);
  }

  async function save(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const endpoint = editing ? `/api/admin/features/${editing._id}` : '/api/admin/features';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      closeModal();
      fetchList();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(f) {
    try {
      const res = await fetch(`/api/admin/features/${f._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !f.active }),
      });
      if (!res.ok) throw new Error('Failed to toggle');
      fetchList();
    } catch (e) {
      alert(e.message);
    }
  }

  async function remove(f) {
    if (!confirm(`Hapus feature "${f.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/features/${f._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchList();
    } catch (e) {
      alert(e.message);
    }
  }

  const pageButtons = useMemo(() => {
    const arr = [];
    for (let p = 1; p <= pageInfo.totalPages; p++) {
      if (p === 1 || p === pageInfo.totalPages || Math.abs(p - pageInfo.currentPage) <= 1) arr.push(p);
    }
    return arr;
  }, [pageInfo]);

  return (
    <AdminLayout>
      <SeoHead
        title="Manajemen Fitur - Dreamslink"
        description="Halaman untuk mengelola fitur undangan di panel admin."
        noindex
        canonical="/admin/features"
      />

      {/* Page Title (meniru packages) */}
      <div className="d-flex flex-wrap flex-stack mb-6">
        <h1 className="fw-bold my-2">Features
          <span className="fs-6 text-muted ms-2">katalog fitur untuk paket & undangan</span>
        </h1>
      </div>

      <div className="card">
        {/* Header: Search + Toolbar */}
        <div className="card-header border-0 pt-6">
          {/* Search */}
          <div className="card-title">
            <div className="d-flex align-items-center position-relative my-1">
              <i className="ki-duotone ki-magnifier fs-3 position-absolute ms-5" aria-hidden="true">
                <span className="path1"></span><span className="path2"></span>
              </i>
              <input
                type="text"
                className="form-control form-control-solid w-250px ps-12"
                placeholder="Search features…"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
              />
            </div>
          </div>

          {/* Toolbar (filter aktif + show entries + add) */}
          <div className="card-toolbar">
            <div className="d-flex justify-content-end" data-kt-user-table-toolbar="base">
              <select
                className="form-select form-select-solid me-3 w-125px"
                value={filters.active}
                onChange={(e) => setFilters((p) => ({ ...p, active: e.target.value, page: 1 }))}
              >
                <option value="all">All status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <select
                className="form-select form-select-solid me-3 w-125px"
                value={filters.limit}
                onChange={(e) => setFilters((p) => ({ ...p, limit: Number(e.target.value || 10), page: 1 }))}
              >
                <option value={10}>Show 10</option>
                <option value={25}>Show 25</option>
                <option value={50}>Show 50</option>
                <option value={100}>Show 100</option>
              </select>

              <button type="button" className="btn btn-primary" onClick={openCreate}>
                <i className="ki-duotone ki-plus fs-2"></i> Add Feature
              </button>
            </div>
          </div>
        </div>

        {/* Body: Table */}
        <div className="card-body pt-0">
          {loading ? (
            <div className="d-flex justify-content-center py-10">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-row-dashed fs-6 gy-5">
                <thead>
                  <tr className="text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0">
                    <th className="min-w-140px">Key</th>
                    <th className="min-w-190px">Name</th>
                    <th className="min-w-300px">Description</th>
                    <th className="min-w-120px">Price</th>
                    <th className="min-w-90px">Sort</th>
                    <th className="min-w-100px">Status</th>
                    <th className="text-end min-w-160px">Actions</th>
                  </tr>
                </thead>
                <tbody className="fw-semibold text-gray-600">
                  {items.map((f) => (
                    <tr key={f._id}>
                      <td><code>{f.key}</code></td>
                      <td>{f.name}</td>
                      <td className="text-muted">{f.description || '-'}</td>
                      <td>{rupiah(f.price)}</td>
                      <td>{f.sort ?? 0}</td>
                      <td>
                        <div className={`badge badge-light-${f.active ? 'success' : 'secondary'}`}>
                          {f.active ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                          onClick={() => openEdit(f)}
                          aria-label="Edit"
                          title="Edit"
                        >
                          <i className="ki-duotone ki-pencil fs-2">
                            <span className="path1"></span><span className="path2"></span>
                          </i>
                        </button>

                        <button
                          className={`btn btn-icon btn-bg-light btn-active-color-${f.active ? 'warning' : 'success'} btn-sm me-1`}
                          onClick={() => toggleActive(f)}
                          aria-label={f.active ? 'Deactivate' : 'Activate'}
                          title={f.active ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`ki-duotone ki-${f.active ? 'shield-cross' : 'shield-tick'} fs-2`}>
                            <span className="path1"></span><span className="path2"></span>
                          </i>
                        </button>

                        <button
                          className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                          onClick={() => remove(f)}
                          aria-label="Delete"
                          title="Delete"
                        >
                          <i className="ki-duotone ki-trash fs-2">
                            <span className="path1"></span><span className="path2"></span><span className="path3"></span>
                          </i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-muted">No features found</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination (gaya serupa packages) */}
              {pageInfo.totalPages > 1 && (
                <div className="d-flex flex-stack flex-wrap pt-10">
                  <div className="fs-6 fw-semibold text-gray-700">
                    Showing {(pageInfo.currentPage - 1) * filters.limit + 1} to{' '}
                    {Math.min(pageInfo.currentPage * filters.limit, pageInfo.total)} of {pageInfo.total} entries
                  </div>
                  <ul className="pagination">
                    <li className={`page-item ${pageInfo.currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setFilters((p)=>({ ...p, page: 1 }))}>
                        <i className="ki-duotone ki-double-left fs-5"></i>
                      </button>
                    </li>
                    <li className={`page-item ${pageInfo.currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setFilters((p)=>({ ...p, page: Math.max(1, p.page - 1) }))}>
                        <i className="ki-duotone ki-left fs-5"></i>
                      </button>
                    </li>
                    {pageButtons.map((p) => (
                      <li key={p} className={`page-item ${pageInfo.currentPage === p ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setFilters((prev)=>({ ...prev, page: p }))}>{p}</button>
                      </li>
                    ))}
                    <li className={`page-item ${pageInfo.currentPage === pageInfo.totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setFilters((p)=>({ ...p, page: Math.min(pageInfo.totalPages, p.page + 1) }))}>
                        <i className="ki-duotone ki-right fs-5"></i>
                      </button>
                    </li>
                    <li className={`page-item ${pageInfo.currentPage === pageInfo.totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setFilters((p)=>({ ...p, page: pageInfo.totalPages }))}>
                        <i className="ki-duotone ki-double-right fs-5"></i>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit (Metronic style) */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered mw-650px">
          <div className="modal-content">
            <form onSubmit={save}>
              <div className="modal-header">
                <h2 className="fw-bold">{editing ? 'Edit Feature' : 'Add Feature'}</h2>
                <button type="button" className="btn btn-icon btn-sm" onClick={closeModal} aria-label="Close">
                  <i className="ki-duotone ki-cross fs-1"><span className="path1"></span><span className="path2"></span></i>
                </button>
              </div>

              <div className="modal-body py-10 px-lg-17">
                <div className="row g-5">
                  <div className="col-md-6">
                    <label className="form-label required">Key</label>
                    <input
                      className="form-control"
                      placeholder="ex: rsvp, galeri, gift"
                      value={form.key}
                      onChange={(e) => setForm((f)=>({ ...f, key: e.target.value }))}
                      required
                      disabled={!!editing} // key tidak diubah saat edit
                    />
                    <div className="form-text">Hanya huruf/angka/dash, huruf kecil.</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label required">Name</label>
                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm((f)=>({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <input
                      className="form-control"
                      value={form.description}
                      onChange={(e)=> setForm((f)=>({ ...f, description: e.target.value }))}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Price (Add-on)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.price}
                      onChange={(e)=> setForm((f)=>({ ...f, price: parseInt(e.target.value || '0', 10) }))}
                      min="0"
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Sort</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.sort}
                      onChange={(e)=> setForm((f)=>({ ...f, sort: parseInt(e.target.value || '0', 10) }))}
                    />
                  </div>

                  <div className="col-md-4 d-flex align-items-end">
                    <label className="form-check form-check-custom form-check-solid">
                      <input
                        id="active"
                        type="checkbox"
                        className="form-check-input"
                        checked={form.active}
                        onChange={(e)=> setForm((f)=>({ ...f, active: e.target.checked }))}
                      />
                      <span className="form-check-label ms-2">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (<><span className="spinner-border spinner-border-sm me-2"></span>Saving…</>) : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show"></div>}
    </AdminLayout>
  );
}
