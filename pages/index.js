import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { templateList } from '../data/templates';

const categories = [
  {
    name: "Minimalis",
    emoji: "✨",
    count: 25,
    description: "Desain simpel dan elegan",
    color: "#6366f1"
  },
  {
    name: "Floral",
    emoji: "🌸",
    count: 30,
    description: "Tema bunga dan alam",
    color: "#10b981"
  },
  {
    name: "Modern",
    emoji: "🎯",
    count: 28,
    description: "Desain kontemporer",
    color: "#3b82f6"
  },
  {
    name: "Vintage",
    emoji: "🏛️",
    count: 15,
    description: "Gaya klasik & retro",
    color: "#f59e0b"
  }
];

const features = [
  {
    emoji: "🎨",
    title: "Desain Premium yang Mudah Disesuaikan",
    description: "Ratusan layout unik, edit teks & warna secara instan.",
    color: "#4361ee"
  },
  {
    emoji: "👁️",
    title: "Preview Real-Time",
    description: "Lihat hasil akhir undangan sebelum diunduh.",
    color: "#3a0ca3"
  },
  {
    emoji: "🤝",
    title: "Dukungan Pelanggan 24/7",
    description: "Tim kami siap membantu hingga undangan sampai di tangan Anda.",
    color: "#7209b7"
  },
  {
    emoji: "📱",
    title: "Digital & Mobile-Friendly",
    description: "Undangan responsif dan mudah dibagikan.",
    color: "#560bad"
  }
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
    // Show success message
  };

  return (
    <>
      <Head>
        <title>Digital Wedding Invitation - Create Your Dream Wedding Invitation</title>
        <meta name="description" content="Create beautiful digital wedding invitations in minutes. Choose from premium templates and customize to your style." />
        <link href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet" />
      </Head>

      <div className="d-flex flex-column flex-root" id="kt_app_root">
        {/* Header Navigation */}
        <div id="kt_app_header" className="app-header">
          <div className="app-container container-fluid d-flex align-items-stretch justify-content-between">
            {/* Logo */}
            <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
              <Link href="/" className="d-lg-none">
                <img alt="Logo" src="/logo.png" className="h-30px" />
              </Link>
              <Link href="/" className="d-none d-lg-flex">
                <img alt="Logo" src="/logo.png" className="h-40px" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
              <div className="d-none d-lg-flex align-items-stretch" id="kt_app_header_menu">
                <div className="app-header-menu app-header-mobile-drawer align-items-stretch">
                  <div className="menu menu-rounded menu-column menu-lg-row my-5 my-lg-0 align-items-stretch fw-semibold px-2 px-lg-0">
                    <div className="menu-item me-0 me-lg-2">
                      <Link href="/" className="menu-link py-3">
                        <span className="menu-title">Beranda</span>
                      </Link>
                    </div>
                    <div className="menu-item me-0 me-lg-2">
                      <Link href="/pilih-template" className="menu-link py-3">
                        <span className="menu-title">Template</span>
                      </Link>
                    </div>
                    <div className="menu-item me-0 me-lg-2">
                      <Link href="/paket" className="menu-link py-3">
                        <span className="menu-title">Paket & Harga</span>
                      </Link>
                    </div>
                    <div className="menu-item me-0 me-lg-2">
                      <Link href="/tentang" className="menu-link py-3">
                        <span className="menu-title">Tentang Kami</span>
                      </Link>
                    </div>
                    <div className="menu-item me-0 me-lg-2">
                      <Link href="/kontak" className="menu-link py-3">
                        <span className="menu-title">Kontak</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="d-flex align-items-stretch flex-shrink-0">
                <div className="d-flex align-items-stretch flex-shrink-0">
                  <div className="d-flex align-items-center ms-1 ms-lg-3">
                    <Link href="/login" className="btn btn-sm btn-light me-3 d-none d-lg-flex">
                      Masuk
                    </Link>
                    <Link href="/buat-undangan" className="btn btn-sm btn-primary">
                      Buat Undangan
                    </Link>
                  </div>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="d-flex d-lg-none align-items-center ms-2">
                  <button
                    className="btn btn-icon btn-active-color-primary w-35px h-35px"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <i className="ki-duotone ki-abstract-14 fs-2">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="d-lg-none bg-body border-bottom">
            <div className="container-fluid">
              <div className="d-flex flex-column py-5">
                <Link href="/" className="py-2 text-gray-800 text-hover-primary">Beranda</Link>
                <Link href="/pilih-template" className="py-2 text-gray-800 text-hover-primary">Template</Link>
                <Link href="/paket" className="py-2 text-gray-800 text-hover-primary">Paket & Harga</Link>
                <Link href="/tentang" className="py-2 text-gray-800 text-hover-primary">Tentang Kami</Link>
                <Link href="/kontak" className="py-2 text-gray-800 text-hover-primary">Kontak</Link>
                <div className="border-top pt-4 mt-4">
                  <Link href="/login" className="btn btn-light w-100 mb-3">Masuk</Link>
                  <Link href="/buat-undangan" className="btn btn-primary w-100">Buat Undangan</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="d-flex flex-column flex-center min-vh-100 position-relative overflow-hidden bg-primary">
          {/* Background Gradient */}
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}></div>

          {/* Content */}
          <div className="position-relative text-center text-white px-5" style={{ zIndex: 2 }}>
            <div className="mb-10 mb-lg-20">
              <h1 className="display-1 fw-bold mb-8 animate__animated animate__fadeInUp">
                Buat Undangan Pernikahan Impianmu dalam 5 Menit
              </h1>
              <div className="fs-2 fw-semibold mb-10 animate__animated animate__fadeInUp" style={{ 
                animationDelay: '0.5s',
                color: 'rgba(255,255,255,0.9)'
              }}>
                Pilih dari ratusan desain premium, cetak sendiri atau kirim digital.
                <br className="d-none d-lg-block" />
                Mudah, cepat, dan elegan.
              </div>

              {/* CTA Buttons */}
              <div className="d-flex justify-content-center flex-wrap gap-3 animate__animated animate__fadeInUp" style={{ animationDelay: '1s' }}>
                <Link href="/pilih-template" className="btn btn-lg btn-light fw-bold">
                  👁️ Lihat Koleksi Template
                </Link>
                <Link href="/buat-undangan" className="btn btn-lg btn-outline-light fw-bold">
                  ✨ Mulai Desain Sekarang
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="row g-5 justify-content-center animate__animated animate__fadeInUp" style={{ animationDelay: '1.5s' }}>
              <div className="col-4 col-lg-2">
                <div className="text-center">
                  <div className="fs-2x fw-bold text-white mb-2">500+</div>
                  <div className="fs-7" style={{ color: 'rgba(255,255,255,0.8)' }}>Template Premium</div>
                </div>
              </div>
              <div className="col-4 col-lg-2">
                <div className="text-center">
                  <div className="fs-2x fw-bold text-white mb-2">10K+</div>
                  <div className="fs-7" style={{ color: 'rgba(255,255,255,0.8)' }}>Undangan Dibuat</div>
                </div>
              </div>
              <div className="col-4 col-lg-2">
                <div className="text-center">
                  <div className="fs-2x fw-bold text-white mb-2">4.9/5</div>
                  <div className="fs-7" style={{ color: 'rgba(255,255,255,0.8)' }}>Rating Pengguna</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-light">
          <div className="container">
            <div className="text-center mb-17">
              <h2 className="fs-2hx fw-bold text-gray-900 mb-5">Keunggulan Kami</h2>
              <div className="fs-5 text-muted fw-bold">
                Mengapa ribuan pasangan memilih platform kami
              </div>
            </div>

            <div className="row g-5 g-xl-10">
              {features.map((feature, idx) => (
                <div key={idx} className="col-md-6 col-lg-3">
                  <div className="card h-100 shadow-sm" style={{ 
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }} 
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                    <div className="card-body text-center p-4">
                      <div className="mb-4">
                        <div style={{ 
                          fontSize: '3rem',
                          background: feature.color,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          {feature.emoji}
                        </div>
                      </div>
                      <h4 className="fw-bold text-gray-900 mb-3">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 mb-0">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Templates Section */}
        <div className="py-20">
          <div className="container">
            <div className="text-center mb-17">
              <h2 className="fs-2hx fw-bold text-gray-900 mb-5">Koleksi Template Unggulan</h2>
              <div className="fs-5 text-muted fw-bold">
                Pilih dari berbagai desain premium yang telah dipercaya ribuan pasangan
              </div>
            </div>

            <div className="row g-5 g-xl-10">
              {templateList && templateList.length > 0 ? (
                templateList.slice(0, 6).map((template, idx) => (
                  <div key={idx} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm" style={{ 
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer'
                    }} 
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                      <div className="card-header border-0 pt-3">
                        <div className="position-relative w-100">
                          <img
                            src={template.thumbnail || '/placeholder-template.jpg'}
                            alt={template.name}
                            className="w-100 rounded"
                            style={{ height: '200px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5UZW1wbGF0ZTwvdGV4dD48L3N2Zz4='
                            }}
                          />
                          <div className="position-absolute top-0 start-0 m-2">
                            <span className="badge bg-primary">Premium</span>
                          </div>
                        </div>
                      </div>
                      <div className="card-body d-flex flex-column">
                        <div className="mb-3">
                          <h5 className="fw-bold text-gray-900 mb-2">{template.name}</h5>
                          <p className="text-gray-600 small">{template.description}</p>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <span className="fw-bold text-primary">Mulai Rp 50.000</span>
                          <Link
                            href={`/buat-undangan?template=${template.slug}`}
                            className="btn btn-primary btn-sm"
                          >
                            Pilih Template
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Placeholder templates jika data tidak ada
                Array.from({ length: 6 }, (_, idx) => (
                  <div key={idx} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm">
                      <div className="card-header border-0 pt-3">
                        <div className="w-100 bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                          <span className="text-muted">🎨 Template {idx + 1}</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <h5 className="fw-bold text-gray-900 mb-2">Template Premium {idx + 1}</h5>
                        <p className="text-gray-600 small">Desain elegan untuk undangan pernikahan Anda</p>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <span className="fw-bold text-primary">Mulai Rp 50.000</span>
                          <Link href="/buat-undangan" className="btn btn-primary btn-sm">
                            Pilih Template
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="text-center mt-10">
              <Link href="/pilih-template" className="btn btn-lg btn-dark">
                Lihat Semua Template →
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="py-20 bg-light">
          <div className="container">
            <div className="text-center mb-17">
              <h2 className="fs-2hx fw-bold text-gray-900 mb-5">Kategori Desain</h2>
              <div className="fs-5 text-muted fw-bold">
                Temukan template sesuai gaya favorit Anda
              </div>
            </div>

            <div className="row g-5 g-xl-10">
              {categories.map((category, idx) => (
                <div key={idx} className="col-md-6 col-lg-3">
                  <Link href={`/pilih-template?category=${category.name.toLowerCase()}`} className="text-decoration-none">
                    <div className="card h-100 shadow-sm" style={{ 
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer'
                    }} 
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                      <div className="card-body text-center p-4">
                        <div className="mb-4">
                          <div style={{ 
                            fontSize: '3rem',
                            background: category.color,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}>
                            {category.emoji}
                          </div>
                        </div>
                        <h4 className="fw-bold text-gray-900 mb-3">
                          {category.name}
                        </h4>
                        <p className="text-gray-600 mb-3">
                          {category.description}
                        </p>
                        <span className="badge" style={{ 
                          backgroundColor: `${category.color}20`,
                          color: category.color
                        }}>
                          {category.count} Template
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-20 bg-primary">
          <div className="container">
            <div className="text-center mb-17">
              <h2 className="fs-2hx fw-bold text-white mb-5">Paket Spesial</h2>
              <div className="fs-5 text-white-75 fw-bold">
                Dapatkan penawaran terbaik untuk undangan digital Anda
              </div>
            </div>

            <div className="row g-5 g-xl-10 justify-content-center">
              <div className="col-lg-4">
                <div className="card h-100">
                  <div className="card-body text-center p-9">
                    <div className="mb-7">
                      <h3 className="fs-2hx fw-bold text-gray-900">Basic</h3>
                      <div className="text-gray-500 fw-semibold">Paket dasar untuk pemula</div>
                    </div>
                    <div className="mb-8">
                      <span className="fs-3x fw-bold text-primary">Rp 50.000</span>
                      <span className="fs-7 text-muted text-decoration-line-through ms-2">Rp 75.000</span>
                    </div>
                    <div className="mb-8">
                      <div className="d-flex align-items-center mb-3">
                        <span className="text-success me-3" style={{ fontSize: '1.5rem' }}>✅</span>
                        <span className="fw-semibold text-gray-700">1 Template Premium</span>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <span className="text-success me-3" style={{ fontSize: '1.5rem' }}>✅</span>
                        <span className="fw-semibold text-gray-700">Customisasi Teks & Warna</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="text-success me-3" style={{ fontSize: '1.5rem' }}>✅</span>
                        <span className="fw-semibold text-gray-700">Link Sharing</span>
                      </div>
                    </div>
                    <Link href="/paket?package=basic" className="btn btn-primary w-100">
                      Pilih Paket
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card h-100 border-primary">
                  <div className="card-header border-0 pt-5">
                    <div className="text-center">
                      <span className="badge badge-primary fs-7 fw-bold">PALING POPULER</span>
                    </div>
                  </div>
                  <div className="card-body text-center p-9 pt-0">
                    <div className="mb-7">
                      <h3 className="fs-2hx fw-bold text-gray-900">Premium</h3>
                      <div className="text-gray-500 fw-semibold">Paket lengkap untuk profesional</div>
                    </div>
                    <div className="mb-8">
                      <span className="fs-3x fw-bold text-primary">Rp 99.000</span>
                      <span className="fs-7 text-muted text-decoration-line-through ms-2">Rp 150.000</span>
                    </div>
                    <div className="mb-8">
                      <div className="d-flex align-items-center mb-3">
                        <span className="text-success me-3" style={{ fontSize: '1.5rem' }}>✅</span>
                        <span className="fw-semibold text-gray-700">5 Template Premium</span>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <span className="text-success me-3" style={{ fontSize: '1.5rem' }}>✅</span>
                        <span className="fw-semibold text-gray-700">Galeri Foto & Video</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="text-success me-3" style={{ fontSize: '1.5rem' }}>✅</span>
                        <span className="fw-semibold text-gray-700">RSVP & Guest List</span>
                      </div>
                    </div>
                    <Link href="/paket?package=premium" className="btn btn-primary w-100">
                      Pilih Paket
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <div className="text-white-75 mb-5">⏰ Penawaran terbatas! Berakhir dalam 7 hari</div>
              <Link href="/paket" className="btn btn-light">
                Lihat Semua Paket
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-20">
          <div className="container">
            <div className="card">
              <div className="card-body text-center p-15">
                <h2 className="fs-2hx fw-bold text-gray-900 mb-5">
                  Dapatkan Update & Promo Terbaru
                </h2>
                <div className="fs-5 text-muted fw-bold mb-8">
                  Berlangganan newsletter kami dan dapatkan diskon 10% untuk pemesanan pertama Anda
                </div>

                <form onSubmit={handleNewsletterSubmit} className="d-flex flex-center flex-wrap">
                  <div className="position-relative me-3 mb-3">
                    <input
                      type="email"
                      className="form-control form-control-solid w-300px"
                      placeholder="Masukkan alamat email Anda"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary mb-3">
                    Berlangganan
                  </button>
                </form>

                <div className="text-muted fs-7 mt-3">
                  Kami menghargai privasi Anda. Unsubscribe kapan saja.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-dark py-10">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-3">
                <div className="mb-5">
                  <img alt="Logo" src="/logo.png" className="h-40px" />
                </div>
                <div className="text-gray-600 fs-6 mb-5">
                  Solusi undangan pernikahan digital yang mudah, cepat, dan elegan.
                </div>
                <div className="text-gray-600 fs-7">
                  <div>Jl. Contoh No.123, Jakarta</div>
                  <div>Email: info@undangandigital.com</div>
                  <div>Telp: +62 812 3456 7890</div>
                </div>
              </div>

              <div className="col-lg-3">
                <h4 className="text-white fw-bold mb-5">Layanan</h4>
                <div className="d-flex flex-column">
                  <Link href="/pilih-template" className="text-gray-600 text-hover-primary py-2">Pilih Template</Link>
                  <Link href="/buat-undangan" className="text-gray-600 text-hover-primary py-2">Buat Undangan</Link>
                  <Link href="/paket" className="text-gray-600 text-hover-primary py-2">Paket & Harga</Link>
                </div>
              </div>

              <div className="col-lg-3">
                <h4 className="text-white fw-bold mb-5">Tentang Kami</h4>
                <div className="d-flex flex-column">
                  <Link href="/tentang" className="text-gray-600 text-hover-primary py-2">Profil Perusahaan</Link>
                  <Link href="/kontak" className="text-gray-600 text-hover-primary py-2">Kontak</Link>
                  <Link href="/blog" className="text-gray-600 text-hover-primary py-2">Blog</Link>
                </div>
              </div>

              <div className="col-lg-3">
                <h4 className="text-white fw-bold mb-5">Ikuti Kami</h4>
                <div className="d-flex gap-3">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                     className="btn btn-sm" style={{ backgroundColor: '#1877f2', color: 'white' }}>
                    📘 Facebook
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                     className="btn btn-sm" style={{ backgroundColor: '#1da1f2', color: 'white' }}>
                    🐦 Twitter
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                     className="btn btn-sm" style={{ backgroundColor: '#e4405f', color: 'white' }}>
                    📷 Instagram
                  </a>
                </div>
              </div>
            </div>

            <div className="border-top border-gray-700 mt-10 pt-5 text-center">
              <div className="text-gray-600 fs-7">
                &copy; {new Date().getFullYear()} Undangan Digital. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
