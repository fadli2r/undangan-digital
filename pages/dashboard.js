import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Head from 'next/head';
import Link from 'next/link';

export default function DashboardMetronic() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    undanganAktif: 0,
    totalPengunjung: 0,
    totalRSVP: 0,
    totalUcapan: 0
  });
  const [undanganTerbaru, setUndanganTerbaru] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.replace("/login");
      return;
    }

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`/api/dashboard/stats?email=${session.user.email}`);
        const data = await response.json();
        
        setStats(data.stats);
        setUndanganTerbaru(data.recentInvitations);
        setNotifikasi(data.notifications);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, status, router]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'aktif':
        return 'badge-light-success';
      case 'draft':
        return 'badge-light-warning';
      case 'expired':
        return 'badge-light-danger';
      default:
        return 'badge-light-primary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column flex-root">
        <div className="page-loading d-flex flex-column flex-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Undangan Digital</title>
        <link href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" rel="stylesheet" />
        <link href="/metronic/assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
      </Head>

      <div className="d-flex flex-column flex-root" id="kt_body">
        {/* Begin::Header */}
        <div id="kt_header" className="header align-items-stretch">
          <div className="container-fluid d-flex align-items-stretch justify-content-between">
            {/* Begin::Aside mobile toggle */}
            <div className="d-flex align-items-center d-lg-none ms-n3 me-1">
              <div className="btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px" id="kt_aside_mobile_toggle">
                <i className="ki-duotone ki-abstract-14 fs-2 fs-md-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
            </div>
            {/* End::Aside mobile toggle */}

            {/* Begin::Mobile logo */}
            <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
              <Link href="/" className="d-lg-none">
                <img alt="Logo" src="/logo.png" className="h-30px" />
              </Link>
            </div>
            {/* End::Mobile logo */}

            {/* Begin::Wrapper */}
            <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
              {/* Begin::Navbar */}
              <div className="d-flex align-items-stretch" id="kt_header_nav">
                <div className="header-menu align-items-stretch" data-kt-drawer="true" data-kt-drawer-name="header-menu" data-kt-drawer-activate="{default: true, lg: false}" data-kt-drawer-overlay="true" data-kt-drawer-width="{default:'200px', '300px': '250px'}" data-kt-drawer-direction="end" data-kt-drawer-toggle="#kt_header_menu_mobile_toggle" data-kt-swapper="true" data-kt-swapper-mode="prepend" data-kt-swapper-parent="{default: '#kt_body', lg: '#kt_header_nav'}">
                  <div className="menu menu-lg-rounded menu-column menu-lg-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-400 fw-semibold my-5 my-lg-0 align-items-stretch" id="#kt_header_menu" data-kt-menu="true">
                    <div className="menu-item me-lg-1">
                      <Link className="menu-link active py-3" href="/dashboard">
                        <span className="menu-title">Dashboard</span>
                      </Link>
                    </div>
                    <div className="menu-item me-lg-1">
                      <Link className="menu-link py-3" href="/buat-undangan">
                        <span className="menu-title">Buat Undangan</span>
                      </Link>
                    </div>
                    <div className="menu-item me-lg-1">
                      <Link className="menu-link py-3" href="/edit-undangan">
                        <span className="menu-title">Edit Undangan</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              {/* End::Navbar */}

              {/* Begin::Toolbar wrapper */}
              <div className="d-flex align-items-stretch flex-shrink-0">
                {/* Begin::User menu */}
                <div className="d-flex align-items-center ms-1 ms-lg-3" id="kt_header_user_menu_toggle">
                  <div className="cursor-pointer symbol symbol-30px symbol-md-40px" data-kt-menu-trigger="click" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
                    <img src="/metronic/assets/media/avatars/300-1.jpg" alt="user" />
                  </div>
                  <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px" data-kt-menu="true">
                    <div className="menu-item px-3">
                      <div className="menu-content d-flex align-items-center px-3">
                        <div className="symbol symbol-50px me-5">
                          <img alt="Logo" src="/metronic/assets/media/avatars/300-1.jpg" />
                        </div>
                        <div className="d-flex flex-column">
                          <div className="fw-bold d-flex align-items-center fs-5">
                            {session?.user?.name || session?.user?.email}
                          </div>
                          <span className="fw-semibold text-muted text-hover-primary fs-7">
                            {session?.user?.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="separator my-2"></div>
                    <div className="menu-item px-5">
                      <Link href="/profile" className="menu-link px-5">
                        My Profile
                      </Link>
                    </div>
                    <div className="separator my-2"></div>
                    <div className="menu-item px-5">
                      <button 
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="menu-link px-5 btn btn-link text-start p-0 w-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
                {/* End::User menu */}
              </div>
              {/* End::Toolbar wrapper */}
            </div>
            {/* End::Wrapper */}
          </div>
        </div>
        {/* End::Header */}

        {/* Begin::Content */}
        <div className="content d-flex flex-column flex-column-fluid" id="kt_content">
          {/* Begin::Container */}
          <div className="container-xxl" id="kt_content_container">
            {/* Begin::Row */}
            <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
              {/* Begin::Col */}
              <div className="col-md-6 col-lg-6 col-xl-6 col-xxl-3 mb-md-5 mb-xl-10">
                <div className="card card-flush bgi-no-repeat bgi-size-contain bgi-position-x-end h-md-50 mb-5 mb-xl-10" style={{backgroundColor: '#F1416C'}}>
                  <div className="card-header pt-5">
                    <div className="card-title d-flex flex-column">
                      <span className="fs-2hx fw-bold text-white me-2 lh-1 ls-n2">{stats.undanganAktif}</span>
                      <span className="text-white opacity-75 pt-1 fw-semibold fs-6">Undangan Aktif</span>
                    </div>
                  </div>
                  <div className="card-body d-flex align-items-end pt-0">
                    <div className="d-flex align-items-center flex-column mt-3 w-100">
                      <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                        <span className="fw-bolder fs-6 text-white opacity-75">Progress</span>
                        <span className="fw-bold fs-6 text-white">100%</span>
                      </div>
                      <div className="h-8px mx-3 w-100 bg-white bg-opacity-50 rounded">
                        <div className="bg-white rounded h-8px" role="progressbar" style={{width: '100%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* End::Col */}

              {/* Begin::Col */}
              <div className="col-md-6 col-lg-6 col-xl-6 col-xxl-3 mb-md-5 mb-xl-10">
                <div className="card card-flush h-md-50 mb-5 mb-xl-10">
                  <div className="card-header pt-5">
                    <div className="card-title d-flex flex-column">
                      <div className="d-flex align-items-center">
                        <span className="fs-4 fw-semibold text-gray-400 me-1 align-self-start">Rp</span>
                        <span className="fs-2hx fw-bold text-dark me-2 lh-1 ls-n2">{stats.totalPengunjung.toLocaleString()}</span>
                      </div>
                      <span className="text-gray-400 pt-1 fw-semibold fs-6">Total Pengunjung</span>
                    </div>
                  </div>
                  <div className="card-body pt-2 pb-4 d-flex flex-wrap align-items-center">
                    <div className="d-flex flex-center me-5 pt-2">
                      <div id="kt_card_widget_17_chart" style={{minWidth: '70px', minHeight: '70px'}} data-kt-size="70" data-kt-line="11"></div>
                    </div>
                    <div className="d-flex flex-column content-justify-center flex-row-fluid">
                      <div className="d-flex fw-semibold align-items-center">
                        <div className="bullet w-8px h-3px rounded-2 bg-success me-3"></div>
                        <div className="text-gray-500 flex-1 fs-6">Hari ini</div>
                        <div className="fw-bolder text-gray-700 text-xxl-end">{Math.floor(stats.totalPengunjung * 0.3)}</div>
                      </div>
                      <div className="d-flex fw-semibold align-items-center my-3">
                        <div className="bullet w-8px h-3px rounded-2 bg-primary me-3"></div>
                        <div className="text-gray-500 flex-1 fs-6">Minggu ini</div>
                        <div className="fw-bolder text-gray-700 text-xxl-end">{Math.floor(stats.totalPengunjung * 0.7)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* End::Col */}

              {/* Begin::Col */}
              <div className="col-md-6 col-lg-6 col-xl-6 col-xxl-3 mb-md-5 mb-xl-10">
                <div className="card card-flush h-md-50 mb-xl-10">
                  <div className="card-header pt-5">
                    <div className="card-title d-flex flex-column">
                      <span className="fs-2hx fw-bold text-dark me-2 lh-1 ls-n2">{stats.totalRSVP}</span>
                      <span className="text-gray-400 pt-1 fw-semibold fs-6">Total RSVP</span>
                    </div>
                  </div>
                  <div className="card-body d-flex flex-column justify-content-end pe-0">
                    <span className="fs-6 fw-bolder text-gray-800 d-block mb-2">Hari ini</span>
                    <div className="fs-7 fw-semibold text-gray-400 d-block">
                      <span className="text-success">{Math.floor(stats.totalRSVP * 0.8)} Hadir</span>
                      <span className="text-danger ms-2">{Math.floor(stats.totalRSVP * 0.2)} Tidak Hadir</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* End::Col */}

              {/* Begin::Col */}
              <div className="col-md-6 col-lg-6 col-xl-6 col-xxl-3 mb-md-5 mb-xl-10">
                <div className="card card-flush h-md-50 mb-xl-10">
                  <div className="card-header pt-5">
                    <div className="card-title d-flex flex-column">
                      <span className="fs-2hx fw-bold text-dark me-2 lh-1 ls-n2">{stats.totalUcapan}</span>
                      <span className="text-gray-400 pt-1 fw-semibold fs-6">Ucapan & Doa</span>
                    </div>
                  </div>
                  <div className="card-body d-flex flex-column justify-content-end pe-0">
                    <span className="fs-6 fw-bolder text-gray-800 d-block mb-2">Terbaru</span>
                    <div className="fs-7 fw-semibold text-gray-400">
                      Ucapan terbaru diterima hari ini
                    </div>
                  </div>
                </div>
              </div>
              {/* End::Col */}
            </div>
            {/* End::Row */}

            {/* Begin::Row */}
            <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
              {/* Begin::Col */}
              <div className="col-xl-8">
                <div className="card card-flush h-xl-100">
                  <div className="card-header pt-7">
                    <h3 className="card-title align-items-start flex-column">
                      <span className="card-label fw-bold fs-3 mb-1">Undangan Terbaru</span>
                      <span className="text-muted mt-1 fw-semibold fs-7">Daftar undangan yang telah Anda buat</span>
                    </h3>
                    <div className="card-toolbar">
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
                            <th className="min-w-150px">Nama Undangan</th>
                            <th className="min-w-140px">Tanggal Dibuat</th>
                            <th className="min-w-120px">Status</th>
                            <th className="min-w-120px">Pengunjung</th>
                            <th className="min-w-100px text-end">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {undanganTerbaru.length > 0 ? (
                            undanganTerbaru.map((undangan) => (
                              <tr key={undangan._id}>
                                <td>
                                  <div className="d-flex justify-content-start flex-column">
                                    <a href={`/edit-undangan/${undangan.slug}`} className="text-gray-900 fw-bold text-hover-primary fs-6">
                                      {undangan.nama}
                                    </a>
                                    <div className="text-muted fw-semibold d-block fs-7">
                                      <span className="me-2">{undangan.rsvp} RSVP</span>
                                      <span className="me-2">•</span>
                                      <span>{undangan.ucapan} Ucapan</span>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="text-gray-900 fw-bold d-block fs-6">
                                    {new Date(undangan.tanggalDibuat).toLocaleDateString('id-ID', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                  {undangan.tanggalAcara && (
                                    <div className="text-muted fs-7">
                                      Acara: {new Date(undangan.tanggalAcara).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <span className={`badge ${getStatusBadge(undangan.status)} fw-bold`}>
                                    {undangan.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="text-gray-900 fw-bold d-block fs-6">
                                    {undangan.pengunjung.toLocaleString()}
                                  </div>
                                  <div className="text-muted fs-7">
                                    {undangan.tamu} Tamu
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex justify-content-end flex-shrink-0">
                                    <a
                                      href={`/edit-undangan/${undangan.slug}`}
                                      className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                                      title="Edit Undangan"
                                    >
                                      <i className="ki-duotone ki-pencil fs-3">
                                        <span className="path1"></span>
                                        <span className="path2"></span>
                                      </i>
                                    </a>
                                    <a
                                      href={`/undangan/${undangan.custom_slug || undangan.slug}`}
                                      target="_blank"
                                      className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                                      title="Lihat Undangan"
                                    >
                                      <i className="ki-duotone ki-eye fs-3">
                                        <span className="path1"></span>
                                        <span className="path2"></span>
                                        <span className="path3"></span>
                                      </i>
                                    </a>
                                    <button
                                      className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                                      title="Hapus Undangan"
                                      onClick={() => {
                                        if (window.confirm('Apakah Anda yakin ingin menghapus undangan ini?')) {
                                          // TODO: Implement delete functionality
                                          alert('Fitur hapus undangan akan segera tersedia');
                                        }
                                      }}
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
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-10">
                                <div className="text-muted fs-6 fw-semibold">
                                  Belum ada undangan yang dibuat
                                </div>
                                <div className="mt-4">
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
              </div>
              {/* End::Col */}

              {/* Begin::Col */}
              <div className="col-xl-4">
                <div className="card card-flush h-xl-100">
                  <div className="card-header pt-7">
                    <h3 className="card-title align-items-start flex-column">
                      <span className="card-label fw-bold fs-3 mb-1">Notifikasi</span>
                      <span className="text-muted mt-1 fw-semibold fs-7">Aktivitas terbaru</span>
                    </h3>
                  </div>
                  <div className="card-body pt-6">
                    {notifikasi.length > 0 ? (
                      <div className="timeline-label">
                        {notifikasi.map((notif, index) => (
                          <div key={index} className="timeline-item">
                            <div className="timeline-label fw-bold text-gray-800 fs-6">{notif.waktu}</div>
                            <div className="timeline-badge">
                              <i className="fa fa-genderless text-warning fs-1"></i>
                            </div>
                            <div className="fw-mormal timeline-content text-muted ps-3">
                              {notif.pesan}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <i className="ki-duotone ki-notification-bing fs-3x text-gray-300 mb-3">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                        <div className="text-muted fs-6 fw-semibold">
                          Belum ada notifikasi
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* End::Col */}
            </div>
            {/* End::Row */}
          </div>
          {/* End::Container */}
        </div>
        {/* End::Content */}
      </div>

      <script src="/metronic/assets/plugins/global/plugins.bundle.js"></script>
      <script src="/metronic/assets/js/scripts.bundle.js"></script>
    </>
  );
}
