// pages/admin/invitations/index.js
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import SeoHead from '@/components/SeoHead';

export default function InvitationManagement() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    template: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalInvitations: 0,
  });

  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTemplate, setFilterTemplate] = useState("all");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSlug, setNewSlug] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user || !session.user.isAdmin) {
      router.replace("/admin/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === "authenticated" && session && session.user && session.user.isAdmin) {
      fetchInvitations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, status, session]);

  async function fetchInvitations() {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        page: String(filters.page),
        limit: String(filters.limit),
      });
      const res = await fetch(`/api/admin/invitations?${queryParams}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        throw new Error("Failed to fetch invitations");
      }
      const data = await res.json();
      setInvitations(data.invitations || []);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalInvitations: data.totalInvitations,
      });
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleSort(field) {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
      page: 1,
    }));
  }

  function handlePageChange(page) {
    setFilters((prev) => ({ ...prev, page }));
  }

  async function handleAction(id, action) {
    try {
      const res = await fetch(`/api/admin/invitations/${id}/${action}`, { method: "POST" });
      if (!res.ok) throw new Error(`Failed to ${action}`);
      fetchInvitations();
    } catch (e) {
      setError(e.message || "Failed to update");
    }
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case "active":
        return "badge-light-success";
      case "draft":
        return "badge-light-warning";
      case "expired":
        return "badge-light-danger";
      case "inactive":
        return "badge-light-dark";
      default:
        return "badge-light-primary";
    }
  }

  function applyToolbarFilters() {
    setFilters((prev) => ({
      ...prev,
      status: filterStatus,
      template: filterTemplate,
      page: 1,
    }));
  }

  function resetToolbarFilters() {
    setFilterMonth("");
    setFilterStatus("all");
    setFilterTemplate("all");
    setFilters((prev) => ({
      ...prev,
      status: "all",
      template: "all",
      page: 1,
    }));
  }

  const pages = useMemo(() => {
    const arr = [];
    const current = pagination.currentPage;
    const total = pagination.totalPages;
    for (let p = 1; p <= total; p++) {
      if (p === 1 || p === total || Math.abs(p - current) <= 1) {
        arr.push(p);
      }
    }
    return arr;
  }, [pagination]);

  return (
    <AdminLayout>
      <SeoHead
        title="Manajemen Undangan - Dreamslink"
        description="Halaman untuk mengelola undangan digital di panel admin."
        noindex
        canonical="/admin/invitations"
      />
      {/* begin::Container */}
        {/* begin::Card */}
        <div className="card">
          {/* begin::Card header */}
          <div className="card-header border-0 pt-6">
            {/* begin::Card title */}
            <div className="card-title">
              {/* begin::Search */}
              <div className="d-flex align-items-center position-relative my-1">
                <i className="ki-duotone ki-magnifier fs-3 position-absolute ms-5" aria-hidden="true">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <input
                  type="text"
                  className="form-control form-control-solid w-250px ps-12"
                  placeholder="Search Invitations"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                  data-kt-customer-table-filter="search"
                />
              </div>
              {/* end::Search */}
            </div>
            {/* end::Card title */}

            {/* begin::Card toolbar */}
            <div className="card-toolbar">
              {/* begin::Toolbar */}
              <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
                {/* begin::Filter */}
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

                {/* begin::Menu 1 */}
                <div className="menu menu-sub menu-sub-dropdown w-300px w-md-325px" data-kt-menu="true" id="kt-toolbar-filter">
                  <div className="px-7 py-5">
                    <div className="fs-4 text-gray-900 fw-bold">Filter Options</div>
                  </div>
                  <div className="separator border-gray-200"></div>

                  <div className="px-7 py-5">
                    {/* Month */}
                    <div className="mb-10">
                      <label className="form-label fs-5 fw-semibold mb-3">Month:</label>
                      <select
                        className="form-select form-select-solid fw-bold"
                        data-kt-select2="true"
                        data-placeholder="Select option"
                        data-allow-clear="true"
                        data-kt-customer-table-filter="month"
                        data-dropdown-parent="#kt-toolbar-filter"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="aug">August</option>
                        <option value="sep">September</option>
                        <option value="oct">October</option>
                        <option value="nov">November</option>
                        <option value="dec">December</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="mb-10">
                      <label className="form-label fs-5 fw-semibold mb-3">Status:</label>
                      <div className="d-flex flex-column flex-wrap fw-semibold" data-kt-customer-table-filter="status">
                        {[
                          { v: "all", t: "All" },
                          { v: "active", t: "Active" },
                          { v: "draft", t: "Draft" },
                          { v: "expired", t: "Expired" },
                          { v: "inactive", t: "Inactive" },
                        ].map((o) => (
                          <label key={o.v} className="form-check form-check-sm form-check-custom form-check-solid mb-3 me-5">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="status_type"
                              value={o.v}
                              checked={filterStatus === o.v}
                              onChange={() => setFilterStatus(o.v)}
                            />
                            <span className="form-check-label text-gray-600">{o.t}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Template */}
                    <div className="mb-10">
                      <label className="form-label fs-5 fw-semibold mb-3">Template:</label>
                      <select
                        className="form-select form-select-solid fw-bold"
                        data-kt-select2="true"
                        data-placeholder="Select option"
                        data-allow-clear="true"
                        value={filterTemplate}
                        onChange={(e) => setFilterTemplate(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="classic">Classic</option>
                        <option value="modern">Modern</option>
                        <option value="elegant">Elegant</option>
                      </select>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="reset"
                        className="btn btn-light btn-active-light-primary me-2"
                        data-kt-menu-dismiss="true"
                        data-kt-customer-table-filter="reset"
                        onClick={resetToolbarFilters}
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        data-kt-menu-dismiss="true"
                        data-kt-customer-table-filter="filter"
                        onClick={applyToolbarFilters}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
                {/* end::Menu 1 */}

                {/* Export */}
                <button
                  type="button"
                  className="btn btn-light-primary me-3"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_customers_export_modal"
                >
                  <i className="ki-duotone ki-exit-up fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Export
                </button>

                {/* Add invitation */}
                <button
                  type="button"
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_add_invitation"
                >
                  Add Invitation
                </button>
              </div>

              {/* Group actions (optional) */}
              <div
                className="d-flex justify-content-end align-items-center d-none"
                data-kt-customer-table-toolbar="selected"
              >
                <div className="fw-bold me-5">
                  <span className="me-2" data-kt-customer-table-select="selected_count"></span>
                  Selected
                </div>
                <button type="button" className="btn btn-danger" data-kt-customer-table-select="delete_selected">
                  Delete Selected
                </button>
              </div>
            </div>
            {/* end::Card toolbar */}
          </div>
          {/* end::Card header */}

          {/* begin::Card body */}
          <div className="card-body pt-0">
            {/* begin::Table */}
            {loading ? (
              <div className="d-flex justify-content-center py-10">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-row-dashed fs-6 gy-5" id="kt_invitations_table">
                  <thead>
                    <tr className="text-start text-gray-500 fw-bold fs-7 text-uppercase gs-0">
                      <th className="w-10px pe-2">
                        <div className="form-check form-check-sm form-check-custom form-check-solid me-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            data-kt-check="true"
                            data-kt-check-target="#kt_invitations_table .form-check-input.row-check"
                          />
                        </div>
                      </th>
                      <th className="min-w-200px cursor-pointer" onClick={() => handleSort("mempelai.pria")}>
                        Couple {filters.sortBy === "mempelai.pria" && <span className="ms-1">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </th>
                      <th className="min-w-180px cursor-pointer" onClick={() => handleSort("slug")}>
                        Slug {filters.sortBy === "slug" && <span className="ms-1">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </th>
                      <th className="min-w-220px">Owner</th>
                      <th className="min-w-140px">Template</th>
                      <th className="min-w-140px">Status</th>
                      <th className="min-w-160px cursor-pointer" onClick={() => handleSort("createdAt")}>
                        Created Date {filters.sortBy === "createdAt" && <span className="ms-1">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </th>
                      <th className="text-end min-w-120px">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="fw-semibold text-gray-600">
                    {invitations.map((inv) => (
                      <tr key={inv._id}>
                        <td>
                          <div className="form-check form-check-sm form-check-custom form-check-solid">
                            <input className="form-check-input row-check" type="checkbox" value={inv._id} />
                          </div>
                        </td>

                        <td>
                          <div className="d-flex flex-column">
                            <span
                              className="text-gray-800 mb-1 text-truncate"
                              title={`${inv.mempelai?.pria || ""} & ${inv.mempelai?.wanita || ""}`}
                              style={{ maxWidth: 260 }}
                            >
                              {inv.mempelai?.pria} & {inv.mempelai?.wanita}
                            </span>
                          </div>
                        </td>

                        <td className="text-truncate" style={{ maxWidth: 220 }} title={inv.slug}>
                          <a
                            href={`/undangan/${inv.slug}`}
                            className="text-primary text-hover-primary mb-1 text-decoration-underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {inv.slug}
                          </a>
                        </td>

                        <td>
                          <div className="d-flex flex-column">
                            <span className="text-gray-800 mb-1 text-truncate" style={{ maxWidth: 260 }} title={inv.user?.name}>
                              {inv.user?.name}
                            </span>
                            <span className="text-gray-600 text-truncate" style={{ maxWidth: 260 }} title={inv.user?.email}>
                              {inv.user?.email}
                            </span>
                          </div>
                        </td>

                        <td className="text-capitalize">{inv.template}</td>

                        <td>
                          <div className={`badge ${getStatusBadgeClass(inv.status)} fw-bold text-uppercase`}>{inv.status}</div>
                        </td>

                        <td>{new Date(inv.createdAt).toLocaleString()}</td>

                        <td className="text-end">
                          <a
                            href="#"
                            className="btn btn-sm btn-light btn-flex btn-center btn-active-light-primary"
                            data-kt-menu-trigger="click"
                            data-kt-menu-placement="bottom-end"
                          >
                            Actions <i className="ki-duotone ki-down fs-5 ms-1"></i>
                          </a>
                          <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-150px py-4" data-kt-menu="true">
                            <div className="menu-item px-3">
                              <a className="menu-link px-3" onClick={() => router.push(`/admin/invitations/${inv._id}`)}>
                                View
                              </a>
                            </div>
                            <div className="menu-item px-3">
                              {inv.status === "active" ? (
                                <a className="menu-link px-3" onClick={() => handleAction(inv._id, "deactivate")}>
                                  Deactivate
                                </a>
                              ) : (
                                <a className="menu-link px-3" onClick={() => handleAction(inv._id, "activate")}>
                                  Activate
                                </a>
                              )}
                            </div>
                            <div className="menu-item px-3">
                              <a className="menu-link px-3 text-danger" onClick={() => handleAction(inv._id, "delete")}>
                                Delete
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {invitations.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-10">
                          No invitations found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {/* end::Table */}
          </div>
          {/* end::Card body */}
        </div>
        {/* end::Card */}

        {/* begin::Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="d-flex flex-stack flex-wrap pt-10">
            <div className="fs-6 fw-semibold text-gray-700">
              Showing {(pagination.currentPage - 1) * filters.limit + 1} to{" "}
              {Math.min(pagination.currentPage * filters.limit, pagination.totalInvitations)} of {pagination.totalInvitations} entries
            </div>
            <ul className="pagination">
              <li className={`page-item ${pagination.currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(1)} aria-label="First">
                  <i className="ki-duotone ki-double-left fs-5"></i>
                </button>
              </li>
              <li className={`page-item ${pagination.currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                  aria-label="Prev"
                >
                  <i className="ki-duotone ki-left fs-5"></i>
                </button>
              </li>

              {pages.map((p) => (
                <li key={p} className={`page-item ${pagination.currentPage === p ? "active" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(p)}>
                    {p}
                  </button>
                </li>
              ))}

              <li className={`page-item ${pagination.currentPage === pagination.totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                  aria-label="Next"
                >
                  <i className="ki-duotone ki-right fs-5"></i>
                </button>
              </li>
              <li className={`page-item ${pagination.currentPage === pagination.totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(pagination.totalPages)} aria-label="Last">
                  <i className="ki-duotone ki-double-right fs-5"></i>
                </button>
              </li>
            </ul>
          </div>
        )}
        {/* end::Pagination */}

        {/* begin::Modals */}
        {/* Add Invitation Modal */}
        <div className="modal fade" id="kt_modal_add_invitation" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered mw-650px">
            <div className="modal-content">
              <form className="form" onSubmit={(e) => e.preventDefault()}>
                <div className="modal-header" id="kt_modal_add_invitation_header">
                  <h2 className="fw-bold">Add Invitation</h2>
                  <div className="btn btn-icon btn-sm btn-active-icon-primary" data-bs-dismiss="modal" aria-label="Close">
                    <i className="ki-duotone ki-cross fs-1">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                </div>

                <div className="modal-body py-10 px-lg-17">
                  <div
                    className="scroll-y me-n7 pe-7"
                    id="kt_modal_add_invitation_scroll"
                    data-kt-scroll="true"
                    data-kt-scroll-activate="{default: false, lg: true}"
                    data-kt-scroll-max-height="auto"
                    data-kt-scroll-dependencies="#kt_modal_add_invitation_header"
                    data-kt-scroll-wrappers="#kt_modal_add_invitation_scroll"
                    data-kt-scroll-offset="300px"
                  >
                    <div className="fv-row mb-7">
                      <label className="required fs-6 fw-semibold mb-2">Owner Name</label>
                      <input
                        type="text"
                        className="form-control form-control-solid"
                        placeholder="Nama pemilik"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>

                    <div className="fv-row mb-7">
                      <label className="required fs-6 fw-semibold mb-2">Owner Email</label>
                      <input
                        type="email"
                        className="form-control form-control-solid"
                        placeholder="email@domain.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>

                    <div className="fv-row mb-7">
                      <label className="required fs-6 fw-semibold mb-2">Slug</label>
                      <input
                        type="text"
                        className="form-control form-control-solid"
                        placeholder="contoh: yamalnikahnih"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer flex-center">
                  <button type="button" className="btn btn-light me-3" data-bs-dismiss="modal">
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={async () => {
                      // TODO: panggil API create invitation di sini jika diperlukan
                      const el = document.getElementById("kt_modal_add_invitation");
                      if (el && window.bootstrap && window.bootstrap.Modal) {
                        const inst = window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el);
                        inst.hide();
                      }
                      setNewName(""); setNewEmail(""); setNewSlug("");
                      fetchInvitations();
                    }}
                  >
                    <span className="indicator-label">Submit</span>
                    <span className="indicator-progress">
                      Please wait...
                      <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Export Modal */}
        <div className="modal fade" id="kt_customers_export_modal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered mw-650px">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="fw-bold">Export Invitations</h2>
                <div className="btn btn-icon btn-sm btn-active-icon-primary" data-bs-dismiss="modal" aria-label="Close">
                  <i className="ki-duotone ki-cross fs-1">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
              </div>

              <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
                <form id="kt_invitations_export_form" className="form" onSubmit={(e) => e.preventDefault()}>
                  <div className="fv-row mb-10">
                    <label className="fs-5 fw-semibold form-label mb-5">Select Export Format:</label>
                    <select className="form-select form-select-solid" defaultValue="excel" data-hide-search="true" name="format">
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
                      <option value="csv">CSV</option>
                      <option value="zip">ZIP</option>
                    </select>
                  </div>

                  <div className="fv-row mb-10">
                    <label className="fs-5 fw-semibold form-label mb-5">Select Date Range:</label>
                    <input className="form-control form-control-solid" placeholder="Pick a date" name="date" />
                  </div>

                  <div className="text-center">
                    <button type="button" className="btn btn-light me-3" data-bs-dismiss="modal">
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      onClick={() => {
                        const el = document.getElementById("kt_customers_export_modal");
                        if (el && window.bootstrap && window.bootstrap.Modal) {
                          const inst = window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el);
                          inst.hide();
                        }
                      }}
                    >
                      <span className="indicator-label">Submit</span>
                      <span className="indicator-progress">
                        Please wait...
                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                      </span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
        {/* end::Modals */}
      {/* end::Container */}
    </AdminLayout>
  );
}
