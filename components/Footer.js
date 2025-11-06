import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8" style={{ maxWidth: '1200px' }}>
        <div>
          <img alt="Dreams Logo" src="/images/dreamslink-w.png" className="h-10 mb-4" />
          <p className="text-gray-400 text-sm">
            Solusi undangan pernikahan digital yang mudah, cepat, dan elegan.
          </p>
          <p className="text-gray-400 text-sm mt-4">Surabaya, Indonesia</p>
          <p className="text-gray-400 text-sm">Email: info@dreamslink.id</p>
          <p className="text-gray-400 text-sm">Telp: +62 8177 9900 078</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Layanan</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/katalog" className="hover:text-white transition">Pilih Template</Link></li>
            <li><Link href="/buat-undangan" className="hover:text-white transition">Buat Undangan</Link></li>
            <li><Link href="/produk" className="hover:text-white transition">Paket & Harga</Link></li>
            <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Tentang Kami</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/tentang" className="hover:text-white transition">Profil Perusahaan</Link></li>
            <li><Link href="/kontak" className="hover:text-white transition">Kontak</Link></li>
            <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
            <li><Link href="/karir" className="hover:text-white transition">Karir</Link></li>
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
                <path d="M23 3a10.9 10.9 0 01-3.14.86 4.48 4.48 0 001.98-2.48 9.14 9.14 0 01-2.88 1.1 4.52 4.52 0 00-7.7 4.13A12.84 12.84 0 013 4.16a4.52 4.52 0 001.4 6.04 4.48 4.48 0 01-2.05-.57v.06a4.52 4.52 0 003.63 4.43 4.52 4.52 0 01-2.04.08 4.52 4.52 0 004.22 3.14A9.06 9.06 0 012 19.54a12.8 12.8 0 006.92 2.03c8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.42-.02-.63A9.22 9.22 0 0023 3z" />
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
        &copy; {new Date().getFullYear()} GDK Indonesia. All rights reserved.
      </div>
    </footer>
  );
}
