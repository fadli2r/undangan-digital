"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  return (
    <header className=" top-0 left-0 right-0 z-50 bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 py-4" style={{ maxWidth: '1200px' }}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img alt="Dreams Logo" src="/images/dreamslink-b.png" className="h-10" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Beranda
            </Link>
            <Link href="/katalog" className="text-gray-700 hover:text-blue-600 transition-colors">
              Katalog Template
            </Link>
            <Link href="/produk" className="text-gray-700 hover:text-blue-600 transition-colors">
              Paket & Harga
            </Link>
            <Link href="/portofolio" className="text-gray-700 hover:text-blue-600 transition-colors">
              Portofolio
            </Link>
            <Link href="/kontak" className="text-gray-700 hover:text-blue-600 transition-colors">
              Kontak
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="text-gray-500">Loading...</div>
            ) : session ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className="mr-2">
                    Halo, {session.user?.name || session.user?.email}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
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
            <Link href="/katalog" className="text-gray-700 hover:text-blue-600 transition-colors">
              Katalog Template
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
              {status === 'loading' ? (
                <div className="text-gray-500">Loading...</div>
              ) : session ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span className="text-sm">
                      Halo, {session.user?.name || session.user?.email}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-red-600 hover:text-red-700 transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors text-center"
                  >
                    Masuk
                  </Link>
                  <Link 
                    href="/buat-undangan" 
                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors text-center"
                  >
                    Buat Undangan
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
