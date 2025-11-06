import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import UserLayout from '@/components/layouts/UserLayout';
import { showAlert, showToast } from '@/utils/sweetAlert';
import SeoHead from '@/components/SeoHead';

export default function EditUndangan() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [undanganList, setUndanganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const statusOptions = ['Semua', 'Aktif', 'Draft', 'Selesai'];

  const getBackgroundPhoto = (undangan) => {
    if (undangan?.background_photo) return undangan.background_photo;
    if (undangan?.galeri?.length > 0) return undangan.galeri[0];
    return null;
  };

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await fetch(`/api/invitation/list?status=${filterStatus}`);
        if (!response.ok) throw new Error('Failed to fetch invitations');

        const data = await response.json();
        setUndanganList(data.invitations);
      } catch (err) {
        console.error('Error fetching invitations:', err);
        showToast.error('Gagal memuat data undangan');
        setError('Gagal memuat data undangan. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchInvitations();
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

  if (!session) return null;

  if (error) {
    return (
      <UserLayout>
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              showAlert.loading('Memuat ulang...', 'Mohon tunggu sebentar');
              window.location.reload();
            }}
          >
            Coba Lagi
          </button>
        </div>
      </UserLayout>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Aktif': return 'badge-light-success';
      case 'Draft': return 'badge-light-warning';
      case 'Selesai': return 'badge-light-primary';
      default: return 'badge-light-secondary';
    }
  };

  const handleEdit = (undangan) => router.push(`/edit-undangan/${undangan.slug}`);
  const handleView = (undangan) => window.open(`/${undangan.slug}`, '_blank');

  const handleDuplicate = async (undangan) => {
    showAlert.confirm(
      'Duplikasi Undangan',
      'Apakah Anda yakin ingin menduplikasi undangan ini?',
      'Ya, Duplikasi',
      'Batal',
      async (result) => {
        if (!result.isConfirmed) return;

        showAlert.loading('Menduplikasi...', 'Mohon tunggu sebentar');
        try {
          const response = await fetch('/api/invitation/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              template: undangan.template,
              user_email: session.user.email,
              duplicate_from: undangan.id,
            }),
          });

          if (!response.ok) throw new Error('Failed to duplicate invitation');

          showAlert.success('Berhasil!', 'Undangan berhasil diduplikasi', () => window.location.reload());
        } catch (err) {
          console.error('Error duplicating invitation:', err);
          showAlert.error('Gagal!', 'Gagal menduplikasi undangan. Silakan coba lagi.');
        }
      }
    );
  };

  const handleDelete = async (undangan) => {
    showAlert.confirm(
      'Hapus Undangan',
      'Apakah Anda yakin ingin menghapus undangan ini? Tindakan ini tidak dapat dibatalkan.',
      'Ya, Hapus',
      'Batal',
      async (result) => {
        if (!result.isConfirmed) return;

        showAlert.loading('Menghapus...', 'Mohon tunggu sebentar');
        try {
          const response = await fetch(`/api/invitation/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: undangan.id }),
          });

          if (!response.ok) throw new Error('Failed to delete invitation');

          showAlert.success('Berhasil!', 'Undangan berhasil dihapus', () => window.location.reload());
        } catch (err) {
          console.error('Error deleting invitation:', err);
          showAlert.error('Gagal!', 'Gagal menghapus undangan. Silakan coba lagi.');
        }
      }
    );
  };

  return (
    <UserLayout>
      <SeoHead
        title="Edit Undangan - Dreamslink"
        description="Kelola semua undangan digital Anda. Edit konten, lihat statistik, dan bagikan kepada tamu."
        canonical="/edit-undangan"
      />
      <div className="row g-5 g-xl-8">
        <div className="col-xl-12">
          {/* Header */}
          <div className="card card-flush mb-9">
            <div className="card-header pt-8">
              <div className="card-title">
                <h2 className="fw-bold text-gray-900">Edit Undangan</h2>
              </div>
              <div className="card-toolbar">
                <a href="/buat-undangan" className="btn btn-primary">
                  <i className="ki-duotone ki-plus fs-2" /> Buat Undangan Baru
                </a>
              </div>
            </div>
            <div className="card-body pt-0">
              <p className="text-gray-600 fw-semibold fs-6 mb-5">
                Kelola semua undangan digital Anda. Edit konten, lihat statistik, dan bagikan kepada tamu.
              </p>

              {/* Filter */}
             
            </div>
          </div>

          {/* Grid Undangan */}
          <div className="row g-6 g-xl-9">
            {undanganList.map((undangan) => {
              const imageUrl = getBackgroundPhoto(undangan);
              return (
                <div key={undangan.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm">
                    {/* Badge */}
                    <div className="card-header border-0 pt-6">
                      <span className={`badge ${getStatusBadge(undangan.status)} position-absolute top-0 end-0 m-3`}>
                        {undangan.status}
                      </span>
                    </div>

                    {/* Gambar */}
                    <div className="card-body pt-0">
                      <div className="mb-7">
                        <div
                          className="bgi-no-repeat bgi-size-cover rounded min-h-200px position-relative overflow-hidden"
                          style={{
                            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                            backgroundColor: '#f1f1f2',
                          }}
                        >
                          {!imageUrl && (
                            <div className="d-flex align-items-center justify-content-center h-200px">
                              <div className="text-center">
                                <i className="ki-duotone ki-picture fs-3x text-gray-500 mb-3">
                                  <span className="path1" />
                                  <span className="path2" />
                                </i>
                                <div className="text-gray-600 fw-semibold">{undangan.template}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="mb-5">
                        <h3 className="fs-4 text-gray-900 text-hover-primary fw-bold mb-3">{undangan.nama}</h3>
                        <div className="text-gray-600 fw-semibold fs-6 mb-2">
                          Template: {undangan.template}
                        </div>
                        <div className="text-gray-600 fw-semibold fs-7 mb-4">
                          Acara: {undangan.tanggalAcara
                            ? new Date(undangan.tanggalAcara).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Belum ditentukan'}
                        </div>

                        {/* Stats */}
                        <div className="row g-0 mb-4 text-center">
                          <div className="col-4">
                            <div className="fs-6 fw-bold text-gray-800">{undangan.pengunjung}</div>
                            <div className="fs-7 text-gray-600">Pengunjung</div>
                          </div>
                          <div className="col-4 border-start border-end">
                            <div className="fs-6 fw-bold text-gray-800">{undangan.rsvp}</div>
                            <div className="fs-7 text-gray-600">RSVP</div>
                          </div>
                          <div className="col-4">
                            <div className="fs-6 fw-bold text-gray-800">{undangan.ucapan}</div>
                            <div className="fs-7 text-gray-600">Ucapan</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
<div className="d-flex flex-wrap gap-2">
  <button onClick={() => handleEdit(undangan)} className="btn btn-primary btn-sm flex-fill">
    <i className="ki-duotone ki-pencil fs-3 me-1">
      <span className="path1" />
      <span className="path2" />
    </i>
    Edit
  </button>

  <button onClick={() => handleView(undangan)} className="btn btn-light-primary btn-sm">
    <i className="ki-duotone ki-send fs-3">
      <span className="path1" />
      <span className="path2" />
    </i>
  </button>
<button
  onClick={() => handleDelete(undangan)}
  className="btn btn-light-danger btn-sm"
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {undanganList.length === 0 && (
            <div className="card mt-10">
              <div className="card-body text-center py-20">
                <i className="ki-duotone ki-file-deleted fs-3x text-gray-400 mb-5" />
                <h3 className="text-gray-800 fw-bold mb-3">Tidak ada undangan ditemukan</h3>
                <div className="text-gray-600 fw-semibold fs-6 mb-5">
                  {filterStatus === 'Semua'
                    ? 'Anda belum membuat undangan apapun'
                    : `Tidak ada undangan dengan status "${filterStatus}"`}
                </div>
                <div className="d-flex flex-center gap-3">
                  <a href="/buat-undangan-metronic" className="btn btn-primary">
                    Buat Undangan Pertama
                  </a>
                  {filterStatus !== 'Semua' && (
                    <button onClick={() => setFilterStatus('Semua')} className="btn btn-light-primary">
                      Lihat Semua
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
