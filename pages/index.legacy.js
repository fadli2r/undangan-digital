import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { defaultTemplateList as templateList } from "../data/templates";
import Header from '../components/Header';
import Footer from '../components/Footer';
import "../styles/globals.css";

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

      <Header />

      <div className="min-h-screen bg-gray-50">

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-red-600 via-pink-600 to-blue-800 text-white min-h-screen flex items-center">
          <div className="absolute inset-0 opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10" style={{ maxWidth: '1200px' }}>
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl  text-white-100 font-bold mb-6 animate__animated animate__fadeInUp">
                Buat Undangan Pernikahan Impianmu dalam 5 Menit
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-12 animate__animated animate__fadeInUp" style={{ animationDelay: '0.5s' }}>
                Pilih dari ratusan desain premium, cetak sendiri atau kirim digital.
                <br className="hidden lg:block" />
                Mudah, cepat, dan elegan.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate__animated animate__fadeInUp" style={{ animationDelay: '1s' }}>
                <Link
                  href="/katalog"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition duration-300"
                >
                  👁️ Lihat Koleksi Template
                </Link>
                <Link
                  href="/buat-undangan"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition duration-300"
                >
                  ✨ Mulai Desain Sekarang
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate__animated animate__fadeInUp" style={{ animationDelay: '1.5s' }}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
                  <div className="text-blue-100 text-sm md:text-base">Template Premium</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
                  <div className="text-blue-100 text-sm md:text-base">Undangan Dibuat</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">4.9/5</div>
                  <div className="text-blue-100 text-sm md:text-base">Rating Pengguna</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4" style={{ maxWidth: '1200px' }}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Keunggulan Kami</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Mengapa ribuan pasangan memilih platform kami
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
                  <div className="mb-4">
                    <div className="text-5xl mb-4" style={{ 
                      background: feature.color,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {feature.emoji}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Templates Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4" style={{ maxWidth: '1200px' }}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Koleksi Template Unggulan</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Pilih dari berbagai desain premium yang telah dipercaya ribuan pasangan
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {templateList && templateList.length > 0 ? (
                templateList.slice(0, 6).map((template, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="relative">
                      <img
                        src={template.thumbnail || '/placeholder-template.jpg'}
                        alt={template.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5UZW1wbGF0ZTwvdGV4dD48L3N2Zz4='
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">Premium</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <h5 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h5>
                        <p className="text-gray-600 text-sm">{template.description}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">Mulai Rp 50.000</span>
                        <Link
                          href={`/buat-undangan?template=${template.slug}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition duration-300"
                        >
                          Pilih Template
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Placeholder templates jika data tidak ada
                Array.from({ length: 6 }, (_, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-500">🎨 Template {idx + 1}</span>
                    </div>
                    <div className="p-6">
                      <h5 className="text-xl font-bold text-gray-900 mb-2">Template Premium {idx + 1}</h5>
                      <p className="text-gray-600 text-sm mb-4">Desain elegan untuk undangan pernikahan Anda</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-600">Mulai Rp 50.000</span>
                        <Link href="/buat-undangan" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition duration-300">
                          Pilih Template
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="text-center mt-12">
              <Link href="/katalog" className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-4 rounded-full font-semibold text-lg transition duration-300">
                Lihat Semua Template →
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4" style={{ maxWidth: '1200px' }}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kategori Desain</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Temukan template sesuai gaya favorit Anda
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, idx) => (
                <Link key={idx} href={`/katalog?category=${category.name.toLowerCase()}`} className="block">
                  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center h-full">
                    <div className="mb-4">
                      <div className="text-4xl mb-4" style={{ 
                        background: category.color,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        {category.emoji}
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      {category.name}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ 
                        backgroundColor: `${category.color}20`,
                        color: category.color
                      }}
                    >
                      {category.count} Template
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4" style={{ maxWidth: '1200px' }}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Paket Spesial</h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Dapatkan penawaran terbaik untuk undangan digital Anda
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-xl p-8 text-gray-900">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Basic</h3>
                  <p className="text-gray-600">Paket dasar untuk pemula</p>
                </div>
                <div className="text-center mb-8">
                  <span className="text-4xl font-bold text-blue-600">Rp 50.000</span>
                  <span className="text-sm text-gray-500 line-through ml-2">Rp 75.000</span>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">✅</span>
                    <span>1 Template Premium</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">✅</span>
                    <span>Customisasi Teks & Warna</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">✅</span>
                    <span>Link Sharing</span>
                  </div>
                </div>
                <Link href="/paket?package=basic" className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                  Pilih Paket
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-xl p-8 text-gray-900 border-4 border-blue-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold">PALING POPULER</span>
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <p className="text-gray-600">Paket lengkap untuk profesional</p>
                </div>
                <div className="text-center mb-8">
                  <span className="text-4xl font-bold text-blue-600">Rp 99.000</span>
                  <span className="text-sm text-gray-500 line-through ml-2">Rp 150.000</span>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">✅</span>
                    <span>5 Template Premium</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">✅</span>
                    <span>Galeri Foto & Video</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 text-xl mr-3">✅</span>
                    <span>RSVP & Guest List</span>
                  </div>
                </div>
                <Link href="/paket?package=premium" className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                  Pilih Paket
                </Link>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-blue-100 mb-4">⏰ Penawaran terbatas! Berakhir dalam 7 hari</p>
              <Link href="/paket" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transition duration-300">
                Lihat Semua Paket
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4" style={{ maxWidth: '1200px' }}>
            <div className="bg-gray-50 rounded-2xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Dapatkan Update & Promo Terbaru
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-4xl mx-auto">
                Berlangganan newsletter kami dan dapatkan diskon 10% untuk pemesanan pertama Anda
              </p>

              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan alamat email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
                  Berlangganan
                </button>
              </form>

              <p className="text-gray-500 text-sm mt-4">
                Kami menghargai privasi Anda. Unsubscribe kapan saja.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
