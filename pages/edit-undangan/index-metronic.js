import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import MetronicUserLayout from '@/components/layouts/MetronicUserLayout';
import Link from 'next/link';

export default function EditUndangan() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [undanganList, setUndanganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const statusOptions = ['Semua', 'Aktif', 'Draft', 'Selesai'];

  // Fetch invitations data
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await fetch(`/api/invitation/list?status=${filterStatus}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invitations');
        }
        const data = await response.json();
        setUndanganList(data.invitations || []);
      } catch (err) {
        console.error('Error fetching invitations:', err);
        setError('Gagal memuat data undangan');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchInvitations();
    }
  }, [session, filterStatus]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login-metronic');
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center min-h-300px">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <UserLayout>
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Coba Lagi
          </button>
        </div>
      </UserLayout>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Aktif':
        return 'badge-light-success';
      case 'Draft':
        return 'badge-light-warning';
      case 'Selesai':
        return 'badge-light-primary';
      default:
        return 'badge-light-secondary';
    }
  };

  const handleEdit = (undangan) => {
    router.push(`/edit-undangan/${undangan.slug}`);
  };

  const handleView = (undangan) => {
    window.open(`/undangan/${undangan.slug}`, '_blank');
  };

  const handleDuplicate = async (undangan) => {
    try {
      setLoading(true);
      const response = await fetch('/api/invitation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: undangan.template,
          user_email: session.user.email,
          duplicate_from: undangan.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate invitation');
      }

      const data = await response.json();
      alert('Undangan berhasil diduplikasi!');
      window.location.reload();
      
    } catch (err) {
      console.error('Error duplicating invitation:', err);
      alert('Gagal menduplikasi undangan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (undangan) => {
    if (!confirm('Apakah Anda yakin ingin menghapus undangan ini?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/invitation/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: undangan.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete invitation');
      }

      alert('Undangan berhasil dihapus!');
      window.location.reload();
      
    } catch (err) {
      console.error('Error deleting invitation:', err);
      alert('Gagal menghapus undangan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      {/* Begin::Row */}
      <div className="row g-5 g-xl-8">
        {/* Begin::Col */}
        <div className="col-xl-12">
          {/* Begin::Header */}
          <div className="card card-flush mb-9">
            <div className="card-header pt-8">
              <div className="card-title">
                <h2 className="fw-bold text-gray-900">Edit Undangan</h2>
              </div>
              <div className="card-toolbar">
                <Link href="/buat-undangan-metronic" className="btn btn-primary">
                  <i className="ki-duotone ki-plus fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Buat Undangan Baru
                </Link>
              </div>
            </div>
            <div className="card-body pt-0">
              <div className="text-gray-600 fw-semibold fs-6 mb-5">
                Kelola semua undangan digital Anda. Edit konten, lihat statistik, dan bagikan kepada tamu.
              </div>
              
              {/* Begin::Filter */}
              <div className="d-flex flex-wrap gap-2 mb-8">
                <span className="text-gray-800 fw-bold fs-7 me-3 align-self-center">Filter Status:</span>
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`btn btn-sm ${
                      filterStatus === status 
                        ? 'btn-primary' 
                        : 'btn-light-primary'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              {/* End::Filter */}
            </div>
          </div>
          {/* End::Header */}

          {/* Begin::Undangan Grid */}
          <div className="row g-6 g-xl-9">
            {undanganList.map((undangan) => (
              <div key={undangan.id} className="col-md-6 col-lg-4">
                {/* Begin::Card */}
                <div className="card h-100 shadow-sm">
                  {/* Begin::Card header */}
                  <div className="card-header border-0 pt-6">
                    <div className="card-title">
                      <div className="d-flex align-items-center position-relative w-100">
                        <span className={`badge ${getStatusBadge(undangan.status)} position-absolute top-0 end-0 m-3`}>
                          {undangan.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* End::Card header */}

                  {/* Begin::Card body */}
                  <div className="card-body pt-0">
                    {/* Begin::Image */}
                    <div className="mb-7">
                      <div 
                        className="bgi-no-repeat bgi-size-cover rounded min-h-200px position-relative overflow-hidden"
                        style={{ 
                          backgroundImage: `url(${undangan.thumbnail})`,
                          backgroundColor: '#f1f1f2'
                        }}
                      >
                        {/* Placeholder if image doesn't exist */}
                        <div className="d-flex align-items-center justify-content-center h-200px">
                          <div className="text-center">
                            <i className="ki-duotone ki-picture fs-3x text-gray-500 mb-3">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            <div className="text-gray-600 fw-semibold">{undangan.template}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* End::Image */}

                    {/* Begin::Info */}
                    <div className="mb-5">
                      <h3 className="fs-4 text-gray-900 text-hover-primary fw-bold mb-3">
                        {undangan.nama || 'Untitled'}
                      </h3>
                      <div className="text-gray-600 fw-semibold fs-6 mb-3">
                        Template: {undangan.template}
                      </div>
                      <div className="text-gray-600 fw-semibold fs-7 mb-4">
                        Acara: {undangan.tanggalAcara ? new Date(undangan.tanggalAcara).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Belum ditentukan'}
                      </div>
                      
                      {/* Begin::Stats */}
                      <div className="row g-0 mb-4">
                        <div className="col-4 text-center">
                          <div className="fs-6 fw-bold text-gray-800">{undangan.stats?.views || 0}</div>
                          <div className="fs-7 text-gray-600">Pengunjung</div>
                        </div>
                        <div className="col-4 text-center border-start border-end">
                          <div className="fs-6 fw-bold text-gray-800">{undangan.stats?.rsvp || 0}</div>
                          <div className="fs-7 text-gray-600">RSVP</div>
                        </div>
                        <div className="col-4 text-center">
                          <div className="fs-6 fw-bold text-gray-800">{undangan.stats?.wishes || 0}</div>
                          <div className="fs-7 text-gray-600">Ucapan</div>
                        </div>
                      </div>
                      {/* End::Stats */}
                    </div>
                    {/* End::Info */}

                    {/* Begin::Actions */}
                    <div className="d-flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleEdit(undangan)}
                        className="btn btn-primary btn-sm flex-fill"
                        disabled={loading}
                      >
                        <i className="ki-duotone ki-pencil fs-3 me-1">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleView(undangan)}
                        className="btn btn-light-primary btn-sm"
                        disabled={loading}
                      >
                        <i className="ki-duotone ki-eye fs-3">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button>
                      <div className="btn-group">
                        <button 
                          className="btn btn-light-secondary btn-sm"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          disabled={loading}
                        >
                          <i className="ki-duotone ki-dots-horizontal fs-3">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                          </i>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleDuplicate(undangan)}
                              disabled={loading}
                            >
                              <i className="ki-duotone ki-copy fs-3 me-2">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                              Duplikasi
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => handleDelete(undangan)}
                              disabled={loading}
                            >
                              <i className="ki-duotone ki-trash fs-3 me-2">
                                <span className="path1"></span>
                                <span className="path2"></span>
                                <span className="path3"></span>
                                <span className="path4"></span>
                                <span className="path5"></span>
                              </i>
                              Hapus
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    {/* End::Actions */}
                  </div>
                  {/* End::Card body */}
                </div>
                {/* End::Card */}
              </div>
            ))}
          </div>
          {/* End::Undangan Grid */}

          {/* Begin::Empty State */}
          {undanganList.length === 0 && (
            <div className="card">
              <div className="card-body text-center py-20">
                <i className="ki-duotone ki-file-deleted fs-3x text-gray-400 mb-5">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <h3 className="text-gray-800 fw-bold mb-3">Tidak ada undangan ditemukan</h3>
                <div className="text-gray-600 fw-semibold fs-6 mb-5">
                  {filterStatus === 'Semua' 
                    ? 'Anda belum membuat undangan apapun'
                    : `Tidak ada undangan dengan status "${filterStatus}"`
                  }
                </div>
                <div className="d-flex flex-center gap-3">
                  <Link href="/buat-undangan-metronic" className="btn btn-primary">
                    Buat Undangan Pertama
                  </Link>
                  {filterStatus !== 'Semua' && (
                    <button 
                      onClick={() => setFilterStatus('Semua')}
                      className="btn btn-light-primary"
                    >
                      Lihat Semua
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* End::Empty State */}
        </div>
        {/* End::Col */}
      </div>
      {/* End::Row */}
    </UserLayout>
  );
}
