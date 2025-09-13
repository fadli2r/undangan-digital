// pages/admin/users/index.js
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import AdminLayout from "../../../components/layouts/AdminLayout";

export default function UserManagement() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // toolbar search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | inactive
  const [filterSource, setFilterSource] = useState("all"); // all | website | whatsapp | admin

  // Add User modal state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newSource, setNewSource] = useState("website");

  // ✅ Redirect if not admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.isAdmin) {
      router.replace("/admin/login");
    }
  }, [session, status, router]);

  // ✅ Fetch users
  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleViewDetails(userId) {
    router.push(`/admin/users/${userId}`);
  }

  async function handleToggleStatus(userId, currentStatus) {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }
        throw new Error("Failed to toggle user status");
      }
      fetchUsers();
    } catch (err) {
      console.error("Error toggling status:", err);
      setError(err.message);
    }
  }

  async function handleCreateUserSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          source: newSource,
        }),
      });
      if (!res.ok) throw new Error("Failed to create user");

      // tutup modal
      const el = document.getElementById("kt_modal_add_user");
      if (el && window.bootstrap && window.bootstrap.Modal) {
        const inst = window.bootstrap.Modal.getInstance(el) || new window.bootstrap.Modal(el);
        inst.hide();
      }
      // reset form & refresh
      setNewName(""); setNewEmail(""); setNewPhone("");
      setNewSource("website");
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to create user");
    }
  }

  // Data yang ditampilkan setelah filter+search
  const filteredUsers = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return users
      .filter((u) => {
        if (filterStatus === "active") return !!u.isActive;
        if (filterStatus === "inactive") return !u.isActive;
        return true;
      })
      .filter((u) => {
        if (filterSource === "all") return true;
        return (u.source || "").toLowerCase() === filterSource;
      })
      .filter((u) => {
        return (
          (u.name || "").toLowerCase().includes(searchLower) ||
          (u.email || "").toLowerCase().includes(searchLower) ||
          (u.phone || "").toLowerCase().includes(searchLower)
        );
      });
  }, [users, searchTerm, filterStatus, filterSource]);

  return (
    <AdminLayout>
      {/* begin::Container */}
        {/* begin::Card */}
        <div className="card">
          {/* begin::Card header */}
          <div className="card-header border-0 pt-6">
            {/* begin::Card title */}
            <div className="card-title">
              {/* begin::Search */}
              <div className="d-flex align-items-center position-relative my-1">
                <i className="ki-duotone ki-magnifier fs-3 position-absolute ms-5">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <input
                  type="text"
                  className="form-control form-control-solid w-250px ps-12"
                  placeholder="Search Users"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-kt-customer-table-filter="search"
                />
              </div>
              {/* end::Search */}
            </div>
            {/* end::Card title */}

            {/* begin::Card toolbar */}
            <div className="card-toolbar">
              {/* begin::Toolbar */}
              <div className="d-flex justify-content-end" data-kt-user-table-toolbar="base">
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

                {/* begin::Menu */}
                <div className="menu menu-sub menu-sub-dropdown w-300px w-md-325px" data-kt-menu="true" id="kt-toolbar-filter">
                  {/* Header */}
                  <div className="px-7 py-5">
                    <div className="fs-4 text-gray-900 fw-bold">Filter Options</div>
                  </div>
                  <div className="separator border-gray-200"></div>

                  {/* Content */}
                  <div className="px-7 py-5">
                    {/* Status */}
                    <div className="mb-10">
                      <label className="form-label fs-5 fw-semibold mb-3">Status:</label>
                      <div className="d-flex flex-column flex-wrap fw-semibold" data-kt-user-table-filter="status">
                        {[
                          { v: "all", t: "All" },
                          { v: "active", t: "Active" },
                          { v: "inactive", t: "Inactive" },
                        ].map((o) => (
                          <label key={o.v} className="form-check form-check-sm form-check-custom form-check-solid mb-3 me-5">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="user_status_type"
                              value={o.v}
                              checked={filterStatus === o.v}
                              onChange={() => setFilterStatus(o.v)}
                            />
                            <span className="form-check-label text-gray-600">{o.t}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Source */}
                    <div className="mb-10">
                      <label className="form-label fs-5 fw-semibold mb-3">Source:</label>
                      <select
                        className="form-select form-select-solid fw-bold"
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="website">Website</option>
                        <option value="whatsapp">Whatsapp</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="d-flex justify-content-end">
                      <button
                        type="reset"
                        className="btn btn-light btn-active-light-primary me-2"
                        data-kt-menu-dismiss="true"
                        onClick={() => {
                          setFilterStatus("all");
                          setFilterSource("all");
                        }}
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        data-kt-menu-dismiss="true"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
                {/* end::Menu */}

                {/* Export */}
                <button
                  type="button"
                  className="btn btn-light-primary me-3"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_users_export_modal"
                >
                  <i className="ki-duotone ki-exit-up fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Export
                </button>

                {/* Add user button (modal) */}
                <button
                  type="button"
                  className="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#kt_modal_add_user"
                >
                  <i className="ki-duotone ki-plus fs-2"></i>
                  Add User
                </button>
              </div>
            </div>
            {/* end::Card toolbar */}
          </div>
          {/* end::Card header */}

          {/* begin::Card body */}
          <div className="card-body pt-0">
            {loading ? (
              <div className="d-flex justify-content-center py-10">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-row-dashed fs-6 gy-5" id="kt_table_users">
                  <thead>
                    <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                      <th className="min-w-200px">User</th>
                      <th className="min-w-160px">Package</th>
                      <th className="min-w-140px">Invitations</th>
                      <th className="min-w-120px">Status</th>
                      <th className="min-w-120px">Source</th>
                      <th className="min-w-160px">Joined Date</th>
                      <th className="text-end min-w-120px">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 fw-semibold">
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="d-flex flex-column">
                            <span className="text-gray-800 mb-1 text-truncate" style={{ maxWidth: 260 }} title={user.name}>
                              {user.name}
                            </span>
                            <span className="text-gray-600 text-truncate" style={{ maxWidth: 260 }} title={user.email}>
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="text-gray-600 text-truncate" style={{ maxWidth: 260 }} title={user.phone}>
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          {user.currentPackage ? (
                            <div className="d-flex flex-column">
                              <span className="text-gray-800 mb-1">
                                {user.currentPackage.name}
                              </span>
                              <span className="text-gray-600">
                                Until {new Date(user.currentPackage.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-600">No active package</span>
                          )}
                        </td>

                        <td>
                          <span className="text-gray-800">
                            {user.activeInvitationsCount || 0} active
                          </span>
                        </td>

                        <td>
                          <div className={`badge badge-light-${user.isActive ? "success" : "danger"}`}>
                            {user.isActive ? "Active" : "Inactive"}
                          </div>
                        </td>

                        <td>
                          <div
                            className={`badge badge-light-${
                              user.source === "website"
                                ? "primary"
                                : user.source === "whatsapp"
                                ? "success"
                                : user.source === "admin"
                                ? "warning"
                                : "info"
                            }`}
                          >
                            {user.source || "unknown"}
                          </div>
                        </td>

                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>

                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            <button
                              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                              onClick={() => handleViewDetails(user._id)}
                              title="View"
                            >
                              <i className="ki-duotone ki-eye fs-2">
                                <span className="path1"></span>
                                <span className="path2"></span>
                                <span className="path3"></span>
                              </i>
                            </button>

                            <button
                              className={`btn btn-icon btn-bg-light btn-active-color-${
                                user.isActive ? "warning" : "success"
                              } btn-sm`}
                              onClick={() => handleToggleStatus(user._id, user.isActive)}
                              title={user.isActive ? "Deactivate" : "Activate"}
                            >
                              <i className={`ki-duotone ki-${user.isActive ? "shield-cross" : "shield-tick"} fs-2`}>
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-10">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* end::Card body */}
        </div>
        {/* end::Card */}

        {/* begin::Modals */}
        {/* Add User Modal */}
        <div className="modal fade" id="kt_modal_add_user" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered mw-650px">
            <div className="modal-content">
              <form className="form" onSubmit={handleCreateUserSubmit}>
                <div className="modal-header" id="kt_modal_add_user_header">
                  <h2 className="fw-bold">Add User</h2>
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
                    id="kt_modal_add_user_scroll"
                    data-kt-scroll="true"
                    data-kt-scroll-activate="{default: false, lg: true}"
                    data-kt-scroll-max-height="auto"
                    data-kt-scroll-dependencies="#kt_modal_add_user_header"
                    data-kt-scroll-wrappers="#kt_modal_add_user_scroll"
                    data-kt-scroll-offset="300px"
                  >
                    <div className="fv-row mb-7">
                      <label className="required fs-6 fw-semibold mb-2">Name</label>
                      <input
                        type="text"
                        className="form-control form-control-solid"
                        placeholder="Full name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="fv-row mb-7">
                      <label className="required fs-6 fw-semibold mb-2">Email</label>
                      <input
                        type="email"
                        className="form-control form-control-solid"
                        placeholder="email@domain.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="fv-row mb-7">
                      <label className="fs-6 fw-semibold mb-2">Phone</label>
                      <input
                        type="text"
                        className="form-control form-control-solid"
                        placeholder="08xxxxxxxxxx"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      />
                    </div>

                    <div className="fv-row mb-7">
                      <label className="fs-6 fw-semibold mb-2">Source</label>
                      <select
                        className="form-select form-select-solid"
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                      >
                        <option value="website">Website</option>
                        <option value="whatsapp">Whatsapp</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer flex-center">
                  <button type="button" className="btn btn-light me-3" data-bs-dismiss="modal">
                    Discard
                  </button>
                  <button type="submit" className="btn btn-primary">
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
        <div className="modal fade" id="kt_users_export_modal" tabIndex={-1} aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered mw-650px">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="fw-bold">Export Users</h2>
                <div className="btn btn-icon btn-sm btn-active-icon-primary" data-bs-dismiss="modal" aria-label="Close">
                  <i className="ki-duotone ki-cross fs-1">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
              </div>

              <div className="modal-body scroll-y mx-5 mx-xl-15 my-7">
                <form className="form" onSubmit={(e) => e.preventDefault()}>
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
                        const el = document.getElementById("kt_users_export_modal");
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
