import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import UserLayout from '@/components/layouts/UserLayout';
import { useSession } from 'next-auth/react';

export default function EditUndanganIndex() {
  const router = useRouter();
  const { slug } = router.query;
  const { data: session, status } = useSession();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSlug, setEditingSlug] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [slugLoading, setSlugLoading] = useState(false);
  const [slugError, setSlugError] = useState("");

  // Fetch invitation data
  useEffect(() => {
    const fetchData = async () => {
      if (!slug || !session) return;
      
      try {
        const response = await fetch(`/api/invitation/detail?slug=${slug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch invitation');
        }
        const invitationData = await response.json();
        if (invitationData.undangan) {
          setData(invitationData.undangan);
          setNewSlug(invitationData.undangan.custom_slug || invitationData.undangan.slug);
        } else {
          throw new Error('Data undangan tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('Gagal memuat data undangan');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, session]);

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

  if (!data) {
    return (
      <UserLayout>
        <div className="alert alert-info">
          <h4 className="alert-heading">Undangan Tidak Ditemukan</h4>
          <p>Data undangan yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.</p>
          <Link href="/edit-undangan" className="btn btn-primary">
            Kembali ke Daftar Undangan
          </Link>
        </div>
      </UserLayout>
    );
  }

  // Menu navigasi
  const menu = [
    { 
      label: "Ubah Desain", 
      path: "desain", 
      icon: "ki-design-1",
      color: "primary",
      description: "Ganti template dan warna"
    },
    { 
      label: "Informasi Mempelai", 
      path: "mempelai", 
      icon: "ki-heart",
      color: "danger",
      description: "Data pengantin pria & wanita"
    },
    { 
      label: "Informasi Acara", 
      path: "acara", 
      icon: "ki-calendar-2",
      color: "success",
      description: "Tanggal, waktu & lokasi"
    },
    { 
      label: "Informasi Tambahan", 
      path: "tambahan", 
      icon: "ki-information-5",
      color: "info",
      description: "Detail acara lainnya"
    },
    { 
      label: "Galeri", 
      path: "galeri", 
      icon: "ki-picture",
      color: "warning",
      description: "Upload foto pre-wedding"
    },
    { 
      label: "Amplop Digital", 
      path: "gift", 
      icon: "ki-gift",
      color: "success",
      description: "Rekening & hadiah"
    },
    { 
      label: "Our Story", 
      path: "ourstory", 
      icon: "ki-book-open",
      color: "primary",
      description: "Cerita perjalanan cinta"
    },
    { 
      label: "Kelola Tamu", 
      path: "tamu", 
      icon: "ki-people",
      color: "info",
      description: "Daftar undangan tamu"
    },
    { 
      label: "RSVP", 
      path: "rsvp", 
      icon: "ki-check-square",
      color: "success",
      description: "Konfirmasi kehadiran"
    },
    { 
      label: "Ucapan", 
      path: "ucapan", 
      icon: "ki-message-text-2",
      color: "warning",
      description: "Ucapan dari tamu"
    },
    { 
      label: "Pengaturan Privasi", 
      path: "privasi", 
      icon: "ki-security-user",
      color: "dark",
      description: "Password & akses"
    },
    { 
      label: "Download & Export", 
      path: "download", 
      icon: "ki-file-down",
      color: "primary",
      description: "Unduh PDF & backup"
    }
  ];

  // Scanner button handler
  const openScanner = () => {
    window.open(`/scanner/${slug}`, '_blank');
  };

  // Handle slug update
  const handleSlugUpdate = async () => {
    if (!newSlug.trim()) {
      setSlugError("Link tidak boleh kosong");
      return;
    }

    setSlugLoading(true);
    setSlugError("");

    try {
      const response = await fetch('/api/invitation/update-slug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentSlug: slug,
          newSlug: newSlug.trim(),
          user_email: session.user.email
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to new URL if slug changed
        if (result.slug !== slug) {
          router.replace(`/edit-undangan/${result.slug}`);
        } else {
          setEditingSlug(false);
        }
        alert('Link berhasil diupdate!');
      } else {
        setSlugError(result.message || "Gagal mengupdate link");
      }
    } catch (error) {
      setSlugError("Terjadi kesalahan saat mengupdate link");
    } finally {
      setSlugLoading(false);
    }
  };

  const cancelSlugEdit = () => {
    setEditingSlug(false);
    setNewSlug(data.custom_slug || data.slug);
    setSlugError("");
  };

  const copyLink = () => {
    const link = `${window.location.origin}/undangan/${slug}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link berhasil disalin!');
    });
  };

  return (
    <UserLayout>
      {/* Begin::Header */}
      <div className="card card-flush mb-9">
        <div className="card-header pt-8">
          <div className="card-title">
            <h2 className="fw-bold text-gray-900">Edit Undangan Digital</h2>
          </div>
          <div className="card-toolbar">
            <div className="d-flex gap-3">
              <button
                onClick={() => router.push('/edit-undangan')}
                className="btn btn-light-secondary"
              >
                <i className="ki-duotone ki-arrow-left fs-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Kembali
              </button>
              
              <a
                href={`/undangan/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <i className="ki-duotone ki-eye fs-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
                Lihat Undangan
              </a>
            </div>
          </div>
        </div>
        <div className="card-body pt-0">
          <div className="text-gray-600 fw-semibold fs-6 mb-5">
            Kelola konten undangan digital Anda. Edit informasi, lihat statistik, dan bagikan kepada tamu.
          </div>

          {/* Custom Slug Editor */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="text-muted fs-6">undangan/</span>
            {editingSlug ? (
              <div className="d-flex align-items-center gap-2">
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="form-control form-control-sm w-200px"
                  placeholder="link-custom"
                  pattern="[a-zA-Z0-9-]+"
                />
                <button
                  onClick={handleSlugUpdate}
                  disabled={slugLoading}
                  className="btn btn-sm btn-success"
                >
                  {slugLoading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <i className="ki-duotone ki-check fs-4"></i>
                  )}
                </button>
                <button
                  onClick={cancelSlugEdit}
                  className="btn btn-sm btn-light-danger"
                >
                  <i className="ki-duotone ki-cross fs-4"></i>
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <span className="text-primary fw-bold fs-6">{data.slug}</span>
                <button
                  onClick={() => setEditingSlug(true)}
                  className="btn btn-sm btn-light-primary"
                  title="Edit link"
                >
                  <i className="ki-duotone ki-pencil fs-6"></i>
                </button>
                <button
                  onClick={copyLink}
                  className="btn btn-sm btn-light-success"
                  title="Copy link"
                >
                  <i className="ki-duotone ki-copy fs-6"></i>
                </button>
              </div>
            )}
          </div>
          
          {slugError && (
            <div className="alert alert-danger py-2 px-3 fs-7 mb-3">{slugError}</div>
          )}

          <div className="text-muted fs-6">
            Template: <span className="fw-bold text-gray-800">{data.template}</span>
          </div>
        </div>
      </div>
      {/* End::Header */}

      {/* Summary & Statistics */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold">Ringkasan Data</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-row-dashed table-row-gray-300 gy-7">
                  <tbody>
                    <tr>
                      <td className="fw-bold text-muted">Mempelai</td>
                      <td className="text-end fw-bold text-gray-800">
                        {data?.mempelai?.pria || "-"} & {data?.mempelai?.wanita || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Tanggal Pernikahan</td>
                      <td className="text-end fw-bold text-gray-800">
                        {data?.acara_utama?.tanggal ? new Date(data.acara_utama.tanggal).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Galeri</td>
                      <td className="text-end">
                        <span className="badge badge-light-primary">{data?.galeri?.length || 0} foto</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Daftar Tamu</td>
                      <td className="text-end">
                        <span className="badge badge-light-info">{data?.tamu?.length || 0} tamu</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Amplop Digital</td>
                      <td className="text-end">
                        <span className={`badge ${data?.gift?.enabled ? 'badge-light-success' : 'badge-light-danger'}`}>
                          {data?.gift?.enabled ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold">Statistik Undangan</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-0">
                <div className="col-6 text-center border-end pb-5">
                  <div className="fs-2hx fw-bold text-primary">{data?.views || 0}</div>
                  <div className="fs-6 fw-semibold text-gray-600">Total Views</div>
                </div>
                <div className="col-6 text-center pb-5">
                  <div className="fs-2hx fw-bold text-success">{data?.rsvp?.length || 0}</div>
                  <div className="fs-6 fw-semibold text-gray-600">RSVP</div>
                </div>
                <div className="col-6 text-center border-end pt-5">
                  <div className="fs-2hx fw-bold text-warning">{data?.ucapan?.length || 0}</div>
                  <div className="fs-6 fw-semibold text-gray-600">Ucapan</div>
                </div>
                <div className="col-6 text-center pt-5">
                  <div className="fs-2hx fw-bold text-info">{data?.attendance?.length || 0}</div>
                  <div className="fs-6 fw-semibold text-gray-600">Kehadiran</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card bg-light-success">
            <div className="card-body text-center py-10">
              <i className="ki-duotone ki-scan-barcode fs-3x text-success mb-5">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
                <span className="path5"></span>
                <span className="path6"></span>
              </i>
              <h3 className="text-gray-900 fw-bold mb-3">QR Code Scanner</h3>
              <div className="text-gray-700 fw-semibold fs-6 mb-5">
                Scan QR code untuk melihat siapa saja yang sudah membuka undangan
              </div>
              <button
                onClick={openScanner}
                className="btn btn-success"
              >
                <i className="ki-duotone ki-scan-barcode fs-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                  <span className="path5"></span>
                  <span className="path6"></span>
                </i>
                Buka Scanner QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Navigation */}
      <div className="row g-5 g-xl-10">
        {menu.map(item => (
          <div key={item.path} className="col-lg-4 col-md-6">
            <Link href={`/edit-undangan/${slug}/${item.path}`}>
              <div className="card card-flush h-100 hover-elevate-up shadow-sm cursor-pointer">
                <div className="card-body d-flex flex-column text-center p-9">
                  <div className="mb-5">
                    <i className={`ki-duotone ${item.icon} fs-3x text-${item.color}`}>
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                  </div>
                  <div className="fs-4 fw-bold text-gray-900 mb-2">
                    {item.label}
                  </div>
                  <div className="fs-6 fw-semibold text-gray-600 mb-4">
                    {item.description}
                  </div>
                  <div className="mt-auto">
                    <div className={`btn btn-sm btn-light-${item.color}`}>
                      Kelola
                      <i className="ki-duotone ki-arrow-right fs-5 ms-1">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </UserLayout>
  );
}
