import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { templateList } from '../data/templates';

const categories = [
  {
    name: "Minimalis",
    icon: (
      <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
      </svg>
    ),
    count: 25,
    description: "Desain simpel dan elegan"
  },
  {
    name: "Floral",
    icon: (
      <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    count: 30,
    description: "Tema bunga dan alam"
  },
  {
    name: "Modern",
    icon: (
      <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    ),
    count: 28,
    description: "Desain kontemporer"
  },
  {
    name: "Vintage",
    icon: (
      <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    count: 15,
    description: "Gaya klasik & retro"
  }
];

const features = [
  {
    icon: (
      <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20l9-5-9-5-9 5 9 5z" />
        <path d="M12 12l9-5-9-5-9 5 9 5z" />
      </svg>
    ),
    title: "Desain Premium yang Mudah Disesuaikan",
    description: "Ratusan layout unik, edit teks & warna secara instan."
  },
  {
    icon: (
      <svg className="w-10 h-10 text-green-500 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Gratis Mockup & Preview Real-Time",
    description: "Lihat Hasil Akhir Undangan sebelum diunduh."
  },
  {
    icon: (
      <svg className="w-10 h-10 text-red-500 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 1-12 0" />
        <path d="M12 14v7" />
      </svg>
    ),
    title: "Dukungan Pelanggan 24/7",
    description: "Tim kami siap membantu hingga undangan sampai di tangan Anda."
  },
  {
    icon: (
      <svg className="w-10 h-10 text-yellow-500 mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10h18" />
        <path d="M3 14h18" />
      </svg>
    ),
    title: "Pengiriman Digital & Cetak On-Demand",
    description: "Unduhan file siap print + opsi cetak profesional."
  }
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Digital Wedding Invitation - Create Your Dream Wedding Invitation</title>
        <meta name="description" content="Create beautiful digital wedding invitations in minutes. Choose from premium templates and customize to your style." />
      </Head>

      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <nav className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Undangan Digital
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Beranda
              </Link>
              <Link href="/pilih-template" className="text-gray-700 hover:text-blue-600 transition-colors">
                Template
              </Link>
              <Link href="/paket" className="text-gray-700 hover:text-blue-600 transition-colors">
                Paket & Harga
              </Link>
              <Link href="/tentang" className="text-gray-700 hover:text-blue-600 transition-colors">
                Tentang Kami
              </Link>
              <Link href="/kontak" className="text-gray-700 hover:text-blue-600 transition-colors">
                Kontak
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Masuk
              </Link>
              <Link 
                href="/buat-undangan" 
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                Buat Undangan
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
                onClick={() => {
                  const mobileMenu = document.getElementById('mobile-menu');
                  mobileMenu.classList.toggle('hidden');
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div id="mobile-menu" className="hidden md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 pt-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Beranda
              </Link>
              <Link href="/pilih-template" className="text-gray-700 hover:text-blue-600 transition-colors">
                Template
              </Link>
              <Link href="/paket" className="text-gray-700 hover:text-blue-600 transition-colors">
                Paket & Harga
              </Link>
              <Link href="/tentang" className="text-gray-700 hover:text-blue-600 transition-colors">
                Tentang Kami
              </Link>
              <Link href="/kontak" className="text-gray-700 hover:text-blue-600 transition-colors">
                Kontak
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Masuk
                </Link>
                <Link 
                  href="/buat-undangan" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors text-center"
                >
                  Buat Undangan
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Banner / Jumbotron */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg_couple.jpg"
            alt="Wedding Couple"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Buat Undangan Pernikahan Impianmu dalam 5 Menit
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-200">
            Pilih dari ratusan desain premium, cetak sendiri atau kirim digital.
            Mudah, cepat, dan elegan.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/pilih-template"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition duration-300 transform hover:scale-105"
            >
              Lihat Koleksi Template
            </Link>
            <Link 
              href="/buat-undangan"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition duration-300"
            >
              Mulai Desain Sekarang
            </Link>
          </div>

          {/* Optional: Trust Badges or Quick Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl font-bold">500+</div>
              <div className="text-sm text-gray-300">Template Premium</div>
            </div>
            <div>
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-sm text-gray-300">Undangan Dibuat</div>
            </div>
            <div>
              <div className="text-4xl font-bold">4.9/5</div>
              <div className="text-sm text-gray-300">Rating Pengguna</div>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg 
            className="w-6 h-6 text-white"
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Keunggulan Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Templates Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Koleksi Template Unggulan</h2>
            <p className="text-gray-600 text-lg">Pilih dari berbagai desain premium yang telah dipercaya ribuan pasangan</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templateList.map((template, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={template.thumbnail}
                    alt={template.name}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <Link
                      href={`/pilih-template?template=${template.slug}`}
                      className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">Mulai Rp 50.000</span>
                    <Link
                      href={`/buat-undangan?template=${template.slug}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      Pilih Template
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/pilih-template"
              className="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors duration-300"
            >
              Lihat Semua Template
            </Link>
          </div>
        </div>
      </section>

      {/* Design Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Kategori Desain</h2>
            <p className="text-gray-600 text-lg">Temukan template sesuai gaya favorit Anda</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, idx) => (
              <Link
                key={idx}
                href={`/pilih-template?category=${category.name.toLowerCase()}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 text-center group hover:bg-blue-50"
              >
                <div className="text-blue-600 group-hover:text-blue-700 flex justify-center">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-700">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                <span className="text-blue-600 font-medium text-sm">
                  {category.count} Template
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Testimoni Pelanggan</h2>
          <div className="space-y-12">
            <div className="bg-gray-50 p-8 rounded-lg shadow">
              <p className="text-gray-700 italic mb-4">
                "Layanan yang sangat memuaskan! Template yang mudah disesuaikan dan hasilnya sangat elegan."
              </p>
              <div className="flex items-center justify-center space-x-4">
                <img src="/images/testimonial1.jpg" alt="Pelanggan 1" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">Sari Wulandari</p>
                  <p className="text-sm text-gray-500">Jakarta</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow">
              <p className="text-gray-700 italic mb-4">
                "Proses pembuatan undangan sangat cepat dan mudah. Customer service-nya juga sangat responsif."
              </p>
              <div className="flex items-center justify-center space-x-4">
                <img src="/images/testimonial2.jpg" alt="Pelanggan 2" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">Budi Santoso</p>
                  <p className="text-sm text-gray-500">Bandung</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow">
              <p className="text-gray-700 italic mb-4">
                "Template yang disediakan sangat variatif dan modern. Sangat membantu kami dalam mempersiapkan undangan digital."
              </p>
              <div className="flex items-center justify-center space-x-4">
                <img src="/images/testimonial3.jpg" alt="Pelanggan 3" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">Dewi Lestari</p>
                  <p className="text-sm text-gray-500">Surabaya</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-gray-600 text-lg">Buat undangan digital Anda dalam 4 langkah mudah</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Pilih Template</h3>
              <p className="text-gray-600">Pilih dari koleksi template premium kami yang elegan</p>
              {/* Connector Line (Hidden on Mobile) */}
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gray-300"></div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Edit & Sesuaikan</h3>
              <p className="text-gray-600">Ubah teks, warna, dan foto sesuai keinginan Anda</p>
              {/* Connector Line (Hidden on Mobile) */}
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gray-300"></div>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Preview & Bayar</h3>
              <p className="text-gray-600">Lihat hasil akhir dan lakukan pembayaran</p>
              {/* Connector Line (Hidden on Mobile) */}
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gray-300"></div>
            </div>

            {/* Step 4 */}
            <div className="relative text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share & Selesai</h3>
              <p className="text-gray-600">Bagikan undangan digital Anda ke tamu</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/pilih-template"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300"
            >
              Mulai Buat Undangan
            </Link>
          </div>
        </div>
      </section>

      {/* Special Packages/Promotions Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Paket Spesial</h2>
            <p className="text-blue-100 text-lg">Dapatkan penawaran terbaik untuk undangan digital Anda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Package */}
            <div className="bg-white text-gray-900 rounded-lg p-8 shadow-xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  Rp 50.000
                  <span className="text-lg text-gray-500 line-through ml-2">Rp 75.000</span>
                </div>
                <div className="bg-red-500 text-white text-sm px-3 py-1 rounded-full inline-block mb-6">
                  Hemat 33%
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  1 Template Premium
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Customisasi Teks & Warna
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Link Sharing
                </li>
              </ul>
              <Link
                href="/paket?package=basic"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
              >
                Pilih Paket
              </Link>
            </div>

            {/* Premium Package - Most Popular */}
            <div className="bg-white text-gray-900 rounded-lg p-8 shadow-xl relative border-4 border-yellow-400">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                  PALING POPULER
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  Rp 99.000
                  <span className="text-lg text-gray-500 line-through ml-2">Rp 150.000</span>
                </div>
                <div className="bg-red-500 text-white text-sm px-3 py-1 rounded-full inline-block mb-6">
                  Hemat 34%
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  5 Template Premium
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Galeri Foto & Video
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  RSVP & Guest List
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Music Player
                </li>
              </ul>
              <Link
                href="/paket?package=premium"
                className="block w-full bg-yellow-400 text-gray-900 text-center py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-300"
              >
                Pilih Paket
              </Link>
            </div>

            {/* Ultimate Package */}
            <div className="bg-white text-gray-900 rounded-lg p-8 shadow-xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Ultimate</h3>
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  Rp 149.000
                  <span className="text-lg text-gray-500 line-through ml-2">Rp 250.000</span>
                </div>
                <div className="bg-red-500 text-white text-sm px-3 py-1 rounded-full inline-block mb-6">
                  Hemat 40%
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Unlimited Templates
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Live Streaming Integration
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Gift Registry
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority Support
                </li>
              </ul>
              <Link
                href="/paket?package=ultimate"
                className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300"
              >
                Pilih Paket
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-blue-100 mb-4">⏰ Penawaran terbatas! Berakhir dalam 7 hari</p>
            <Link
              href="/paket"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              Lihat Semua Paket
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Dapatkan Update & Promo Terbaru</h2>
              <p className="text-gray-600 text-lg">
                Berlangganan newsletter kami dan dapatkan diskon 10% untuk pemesanan pertama Anda
              </p>
            </div>

            <form className="max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Masukkan alamat email Anda"
                    className="w-full px-6 py-4 rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300 whitespace-nowrap"
                >
                  Berlangganan
                </button>
              </div>
              <div className="text-center mt-4 text-sm text-gray-500">
                Kami menghargai privasi Anda. Unsubscribe kapan saja.
              </div>
            </form>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">10K+</div>
                <div className="text-gray-600 text-sm">Subscriber</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
                <div className="text-gray-600 text-sm">Customer Support</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">4.9/5</div>
                <div className="text-gray-600 text-sm">Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">100%</div>
                <div className="text-gray-600 text-sm">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Undangan Digital</h3>
            <p className="text-gray-400 text-sm">
              Solusi undangan pernikahan digital yang mudah, cepat, dan elegan.
            </p>
            <p className="text-gray-400 text-sm mt-4">Jl. Contoh No.123, Jakarta</p>
            <p className="text-gray-400 text-sm">Email: info@undangandigital.com</p>
            <p className="text-gray-400 text-sm">Telp: +62 812 3456 7890</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Layanan</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/pilih-template" className="hover:text-white transition">Pilih Template</a></li>
              <li><a href="/buat-undangan" className="hover:text-white transition">Buat Undangan</a></li>
              <li><a href="/paket" className="hover:text-white transition">Paket & Harga</a></li>
              <li><a href="/faq" className="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Tentang Kami</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/tentang" className="hover:text-white transition">Profil Perusahaan</a></li>
              <li><a href="/kontak" className="hover:text-white transition">Kontak</a></li>
              <li><a href="/blog" className="hover:text-white transition">Blog</a></li>
              <li><a href="/karir" className="hover:text-white transition">Karir</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white transition">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12a10 10 0 10-11.5 9.87v-6.99h-2.1v-2.88h2.1v-2.2c0-2.07 1.23-3.22 3.12-3.22.9 0 1.84.16 1.84.16v2.02h-1.04c-1.03 0-1.35.64-1.35 1.3v1.94h2.3l-.37 2.88h-1.93v6.99A10 10 0 0022 12z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-white transition">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14.86 4.48 4.48 0 001.98-2.48 9.14 9.14 0 01-2.88 1.1 4.52 4.52 0 00-7.7 4.13A12.84 12.84 0 013 4.16a4.52 4.52 0 001.4 6.04 4.48 4.48 0 01-2.05-.57v.06a4.52 4.52 0 003.63 4.43 4.52 4.52 0 01-2.04.08a4.52 4.52 0 004.22 3.14A9.06 9.06 0 012 19.54a12.8 12.8 0 006.92 2.03c8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.42-.02-.63A9.22 9.22 0 0023 3z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 2A3.75 3.75 0 004 7.75v8.5A3.75 3.75 0 007.75 20h8.5a3.75 3.75 0 003.75-3.75v-8.5A3.75 3.75 0 0016.25 4h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm4.5-3a1 1 0 110 2 1 1 0 010-2z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 3a2 2 0 110 4 2 2 0 010-4z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Undangan Digital. All rights reserved.
        </div>
      </footer>
    </>
  );
}
