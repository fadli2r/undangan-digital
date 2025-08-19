import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function IndexMetronic() {
  const { data: session } = useSession();
  const [statusBayar, setStatusBayar] = useState("pending");

  const features = [
    {
      title: "Template Premium",
      description: "Pilihan template undangan yang elegan dan modern.",
      color: "primary"
    },
    {
      title: "RSVP Digital",
      description: "Sistem konfirmasi kehadiran yang mudah dan praktis.",
      color: "success"
    },
    {
      title: "Galeri Foto",
      description: "Upload dan tampilkan foto-foto indah Anda.",
      color: "info"
    },
    {
      title: "Gratis Mockup & Preview Real-Time",
      description: "Lihat Hasil Akhir Undangan sebelum diunduh.",
      color: "success"
    },
    {
      title: "Dukungan Pelanggan 24/7",
      description: "Tim kami siap membantu hingga undangan sampai di tangan Anda.",
      color: "danger"
    }
  ];

  const templates = [
    {
      id: 1,
      name: "Classic Elegant",
      slug: "classic-elegant",
      image: "/images/templates/classic-elegant.jpg",
      category: "Classic"
    },
    {
      id: 2,
      name: "Modern Minimalist",
      slug: "modern-minimalist", 
      image: "/images/templates/modern-minimalist.jpg",
      category: "Modern"
    },
    {
      id: 3,
      name: "Floral Romance",
      slug: "floral-romance",
      image: "/images/templates/floral-romance.jpg",
      category: "Romantic"
    }
  ];

  return (
    <>
      <Head>
        <title>Undangan Digital - Platform Undangan Pernikahan Terbaik</title>
        <meta name="description" content="Buat undangan pernikahan digital yang elegan dan mudah dibagikan. Template premium, RSVP digital, dan fitur lengkap lainnya." />
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
                <div className="header-menu align-items-stretch">
                  <div className="menu menu-lg-rounded menu-column menu-lg-row menu-state-bg menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-400 fw-semibold my-5 my-lg-0 align-items-stretch">
                    <div className="menu-item me-lg-1">
                      <Link className="menu-link active py-3" href="/">
                        <span className="menu-title">Beranda</span>
                      </Link>
                    </div>
                    <div className="menu-item me-lg-1">
                      <Link className="menu-link py-3" href="/pilih-template-metronic">
                        <span className="menu-title">Template</span>
                      </Link>
                    </div>
                    <div className="menu-item me-lg-1">
                      <Link className="menu-link py-3" href="/paket-metronic">
                        <span className="menu-title">Paket</span>
                      </Link>
                    </div>
                    <div className="menu-item me-lg-1">
                      <Link className="menu-link py-3" href="/support-center-metronic">
                        <span className="menu-title">Support</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              {/* End::Navbar */}

              {/* Begin::Toolbar wrapper */}
              <div className="d-flex align-items-stretch flex-shrink-0">
                {session ? (
                  <div className="d-flex align-items-center ms-1 ms-lg-3">
                    <Link href="/dashboard" className="btn btn-sm btn-light-primary me-3">Dashboard</Link>
                    <Link href="/buat-undangan-metronic" className="btn btn-sm btn-primary">
                      Buat Undangan
                    </Link>
                  </div>
                ) : (
                  <div className="d-flex align-items-center ms-1 ms-lg-3">
                    <Link href="/login-metronic" className="btn btn-sm btn-light me-3">Masuk</Link>
                    <Link href="/buat-undangan-metronic" className="btn btn-sm btn-primary">
                      Buat Undangan
                    </Link>
                  </div>
                )}
              </div>
              {/* End::Toolbar wrapper */}
            </div>
            {/* End::Wrapper */}
          </div>
        </div>
        {/* End::Header */}

        {/* Begin::Hero Section */}
        <div className="d-flex flex-column flex-center min-vh-100 bgi-no-repeat bgi-size-cover bgi-position-center" style={{backgroundColor: '#1e1e2d'}}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h1 className="display-1 fw-bold mb-8 animate__animated animate__fadeInUp">
                  Buat Undangan Pernikahan Impianmu dalam 5 Menit
                </h1>
                <p className="fs-4 text-gray-600 mb-10 animate__animated animate__fadeInUp animate__delay-1s">
                  Platform undangan digital terbaik dengan template premium, fitur lengkap, dan mudah dibagikan
                </p>
                <div className="d-flex flex-center flex-wrap">
                  <Link href="/pilih-template-metronic" className="btn btn-lg btn-primary me-4 mb-2">
                    <i className="ki-duotone ki-rocket fs-2 me-2">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Mulai Sekarang
                  </Link>
                  <Link href="/buat-undangan-metronic" className="btn btn-lg btn-outline btn-outline-white fw-bold">
                    <i className="ki-duotone ki-design-1 fs-2 me-2">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Lihat Template
                  </Link>
                </div>
              </div>
            </div>

            {/* Begin::Stats */}
            <div className="row g-5 g-xl-10 mt-20">
              <div className="col-sm-6 col-lg-3">
                <div className="text-center">
                  <div className="fs-2x fw-bold text-white mb-2">10K+</div>
                  <div className="fs-7 text-white-75">Undangan Dibuat</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="text-center">
                  <div className="fs-2x fw-bold text-white mb-2">50+</div>
                  <div className="fs-7 text-white-75">Template Premium</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="text-center">
                  <div className="fs-2x fw-bold text-white mb-2">99%</div>
                  <div className="fs-7 text-white-75">Kepuasan Pelanggan</div>
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="text-center">
                  <div className="fs-2x fw-bold text-white mb-2">24/7</div>
                  <div className="fs-7 text-white-75">Customer Support</div>
                </div>
              </div>
            </div>
            {/* End::Stats */}
          </div>
        </div>
        {/* End::Hero Section */}

        {/* Begin::Features Section */}
        <div className="py-20">
          <div className="container">
            <div className="text-center mb-17">
              <h2 className="fs-2hx fw-bold mb-6">Fitur Unggulan</h2>
              <div className="fs-5 text-muted fw-bold">
                Semua yang Anda butuhkan untuk undangan pernikahan yang sempurna
              </div>
            </div>

            <div className="row g-5 g-xl-10">
              {features.map((feature, index) => (
                <div key={index} className="col-md-6 col-lg-4">
                  <div className="card card-flush h-100">
                    <div className="card-body text-center pt-13">
                      <div className={`symbol symbol-75px symbol-circle mb-5 mx-auto bg-light-${feature.color}`}>
                        <i className={`ki-duotone ki-rocket fs-2x text-${feature.color}`}>
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </div>
                      <h4 className="fw-bold text-gray-800 mb-4">{feature.title}</h4>
                      <p className="fw-semibold fs-6 text-gray-600 px-5">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* End::Features Section */}

        {/* Begin::Templates Section */}
        <div className="py-20 bg-light">
          <div className="container">
            <div className="text-center mb-17">
              <h2 className="fs-2hx fw-bold mb-6">Template Populer</h2>
              <div className="fs-5 text-muted fw-bold">
                Pilih dari koleksi template premium kami
              </div>
            </div>

            <div className="row g-5 g-xl-10">
              {templates.map((template) => (
                <div key={template.id} className="col-md-6 col-lg-4">
                  <div className="card card-flush">
                    <div className="card-header ribbon ribbon-end ribbon-clip">
                      <div className="ribbon-label bg-primary">
                        {template.category}
                      </div>
                      <div className="card-title">
                        <h3 className="fw-bold text-gray-800">{template.name}</h3>
                      </div>
                    </div>
                    <div className="card-body text-center pt-5">
                      <div className="overlay">
                        <div className="overlay-wrapper bgi-no-repeat bgi-position-center bgi-size-cover card-rounded min-h-250px"
                             style={{backgroundImage: `url(${template.image})`}}>
                        </div>
                        <div className="overlay-layer card-rounded bg-dark bg-opacity-25">
                          <Link
                            href={`/buat-undangan-metronic?template=${template.slug}`}
                            className="btn btn-primary btn-sm"
                          >
                            Pilih Template
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-15">
              <Link href="/pilih-template-metronic" className="btn btn-lg btn-primary">
                Lihat Semua Template
              </Link>
            </div>
          </div>
        </div>
        {/* End::Templates Section */}

        {/* Begin::CTA Section */}
        <div className="py-20" style={{backgroundColor: '#1e1e2d'}}>
          <div className="container">
            <div className="text-center">
              <h2 className="fs-2hx fw-bold text-white mb-6">
                Siap Membuat Undangan Impian Anda?
              </h2>
              <div className="fs-5 text-white-75 fw-bold">
                Dapatkan penawaran terbaik untuk undangan digital Anda
              </div>
              <div className="d-flex flex-center flex-wrap mt-15">
                <Link href="/paket-metronic" className="btn btn-lg btn-primary me-4">
                  Lihat Paket & Harga
                </Link>
                <Link href="/buat-undangan-metronic" className="btn btn-lg btn-outline btn-outline-white">
                  Mulai Gratis
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* End::CTA Section */}

        {/* Begin::Footer */}
        <div className="footer py-4 d-flex flex-lg-column" id="kt_footer">
          <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
            <div className="text-dark order-2 order-md-1">
              <span className="text-muted fw-semibold me-1">
                &copy; {new Date().getFullYear()} Undangan Digital. All rights reserved.
              </span>
            </div>
            <ul className="menu menu-gray-600 menu-hover-primary fw-semibold order-1">
              <li className="menu-item">
                <Link href="/tentang" className="menu-link px-2">Tentang</Link>
              </li>
              <li className="menu-item">
                <Link href="/support-center-metronic" className="menu-link px-2">Support</Link>
              </li>
              <li className="menu-item">
                <Link href="/kontak" className="menu-link px-2">Kontak</Link>
              </li>
            </ul>
          </div>
        </div>
        {/* End::Footer */}
      </div>

      <script src="/metronic/assets/plugins/global/plugins.bundle.js"></script>
      <script src="/metronic/assets/js/scripts.bundle.js"></script>
    </>
  );
}
