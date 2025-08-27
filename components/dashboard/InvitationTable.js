import React, { useState, useMemo } from "react";

export default function InvitationTable({ 
  invitations = [], 
  loading = false,
  onEdit,
  onView,
  onDelete 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("tanggalDibuat");
  const [sortOrder, setSortOrder] = useState("desc");

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "aktif": return "badge-light-success";
      case "draft": return "badge-light-warning";
      case "expired": return "badge-light-danger";
      default: return "badge-light-primary";
    }
  };

  const filteredAndSortedInvitations = useMemo(() => {
    let filtered = invitations.filter((invitation) => {
      const matchesSearch = !searchQuery || 
        invitation.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invitation.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invitation.custom_slug || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        invitation.status?.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "tanggalDibuat" || sortBy === "tanggalAcara") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [invitations, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return "ki-duotone ki-up-down";
    return sortOrder === "asc" ? "ki-duotone ki-up" : "ki-duotone ki-down";
  };

  if (loading) {
    return (
      <div className="card card-flush h-xl-100">
        <div className="card-header pt-7">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold fs-3 mb-1">Undangan Terbaru</span>
            <span className="text-muted mt-1 fw-semibold fs-7">Memuat data...</span>
          </h3>
        </div>
        <div className="card-body pt-6 d-flex justify-content-center align-items-center min-h-300px">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-flush h-xl-100">
      <div className="card-header pt-7">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">Undangan Terbaru</span>
          <span className="text-muted mt-1 fw-semibold fs-7">
            {filteredAndSortedInvitations.length} dari {invitations.length} undangan
          </span>
        </h3>
        <div className="card-toolbar d-flex gap-3 flex-wrap">
          <select 
            className="form-select form-select-sm w-auto" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
          </select>
          <div className="position-relative">
            <i className="ki-duotone ki-magnifier fs-3 position-absolute ms-3 mt-1">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <input 
              type="text" 
              className="form-control form-control-sm w-200px ps-10" 
              placeholder="Cari nama/slug..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <a href="/buat-undangan" className="btn btn-sm btn-light-primary">
            <i className="ki-duotone ki-plus fs-2"></i> 
            Buat Undangan Baru
          </a>
        </div>
      </div>
      <div className="card-body pt-6">
        <div className="table-responsive">
          <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
            <thead>
              <tr className="fw-bold text-muted">
                <th className="min-w-150px">
                  <button 
                    className="btn btn-sm btn-light-primary p-0 border-0 bg-transparent text-muted fw-bold"
                    onClick={() => handleSort("nama")}
                  >
                    Nama Undangan
                    <i className={`${getSortIcon("nama")} fs-5 ms-1`}></i>
                  </button>
                </th>
                <th className="min-w-140px">
                  <button 
                    className="btn btn-sm btn-light-primary p-0 border-0 bg-transparent text-muted fw-bold"
                    onClick={() => handleSort("tanggalDibuat")}
                  >
                    Tanggal Dibuat
                    <i className={`${getSortIcon("tanggalDibuat")} fs-5 ms-1`}></i>
                  </button>
                </th>
                <th className="min-w-120px">
                  <button 
                    className="btn btn-sm btn-light-primary p-0 border-0 bg-transparent text-muted fw-bold"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <i className={`${getSortIcon("status")} fs-5 ms-1`}></i>
                  </button>
                </th>
                <th className="min-w-120px">
                  <button 
                    className="btn btn-sm btn-light-primary p-0 border-0 bg-transparent text-muted fw-bold"
                    onClick={() => handleSort("pengunjung")}
                  >
                    Pengunjung
                    <i className={`${getSortIcon("pengunjung")} fs-5 ms-1`}></i>
                  </button>
                </th>
                <th className="min-w-100px text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedInvitations.length ? filteredAndSortedInvitations.map((invitation) => (
                <tr key={invitation._id}>
                  <td>
                    <div className="d-flex justify-content-start flex-column">
                      <a 
                        href={`/edit-undangan/${invitation.slug}`} 
                        className="text-gray-900 fw-bold text-hover-primary fs-6"
                      >
                        {invitation.nama}
                      </a>
                      <div className="text-muted fw-semibold d-block fs-7">
                        <span className="me-2">{invitation.rsvp || 0} RSVP</span>
                        <span className="me-2">•</span>
                        <span>{invitation.ucapan || 0} Ucapan</span>
                        {invitation.tamu && (
                          <>
                            <span className="me-2">•</span>
                            <span>{invitation.tamu} Tamu</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-gray-900 fw-bold d-block fs-6">
                      {new Date(invitation.tanggalDibuat).toLocaleDateString("id-ID", { 
                        year: "numeric", 
                        month: "short", 
                        day: "numeric" 
                      })}
                    </div>
                    {invitation.tanggalAcara && (
                      <div className="text-muted fs-7">
                        Acara: {new Date(invitation.tanggalAcara).toLocaleDateString("id-ID", { 
                          year: "numeric", 
                          month: "short", 
                          day: "numeric" 
                        })}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(invitation.status)} fw-bold`}>
                      {invitation.status || 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="text-gray-900 fw-bold d-block fs-6">
                      {(invitation.pengunjung || 0).toLocaleString("id-ID")}
                    </div>
                    <div className="text-muted fs-7">
                      Views hari ini: {invitation.viewsToday || 0}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex justify-content-end flex-shrink-0">
                      <button 
                        className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1" 
                        title="Edit"
                        onClick={() => onEdit && onEdit(invitation)}
                      >
                        <i className="ki-duotone ki-pencil fs-3">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button>
                      <button 
                        className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1" 
                        title="Lihat"
                        onClick={() => onView && onView(invitation)}
                      >
                        <i className="ki-duotone ki-eye fs-3">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </button>
                      <button 
                        className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm" 
                        title="Hapus"
                        onClick={() => onDelete && onDelete(invitation)}
                      >
                        <i className="ki-duotone ki-trash fs-3">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                          <span className="path5"></span>
                        </i>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-10">
                    <div className="text-center">
                      <i className="ki-duotone ki-file-deleted fs-3x text-gray-300 mb-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <div className="text-muted fs-6 fw-semibold mb-2">
                        {searchQuery || statusFilter !== "all" 
                          ? "Tidak ada data yang cocok dengan filter" 
                          : "Belum ada undangan"
                        }
                      </div>
                      <div className="text-muted fs-7 mb-4">
                        {searchQuery || statusFilter !== "all"
                          ? "Coba ubah filter pencarian Anda"
                          : "Mulai buat undangan digital pertama Anda"
                        }
                      </div>
                      <a href="/buat-undangan" className="btn btn-sm btn-light-primary">
                        <i className="ki-duotone ki-plus fs-2"></i> 
                        Buat Undangan Sekarang
                      </a>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
