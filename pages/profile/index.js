// pages/profile/index.js

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from 'next/link';
import Head from 'next/head';
import UserLayout from "../../components/layouts/UserLayout"; // Path disesuaikan
import SeoHead from '@/components/SeoHead';

export default function ProfileOverviewPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State untuk menyimpan data user dan status loading
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect untuk memeriksa sesi dan mengambil data profil
  useEffect(() => {
    // Jangan lakukan apa-apa jika status session masih loading
    if (status === "loading") return;

    // Jika tidak ada sesi (user belum login), arahkan ke halaman login
    if (!session) {
      router.replace("/login");
      return;
    }

    // Fungsi untuk mengambil data profil dari API
    const fetchProfileData = async () => {
      try {
        // Panggil API endpoint untuk mendapatkan detail user.
        const response = await fetch(`/api/user/profile`);
        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        } else {
          console.error(data.message || "Gagal mengambil data profil");
          setUser(null);
        }
      } catch (error) {
        console.error("Terjadi kesalahan saat fetch data profil:", error);
        setUser(null);
      } finally {
        // Setelah selesai (baik sukses atau gagal), hentikan loading
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [session, status, router]);

  // Tampilan saat data masih dimuat
  if (isLoading || status === 'loading') {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Tampilan jika data user tidak berhasil dimuat
  if (!user) {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <p className="text-muted">Gagal memuat data profil. Silakan coba lagi nanti.</p>
        </div>
      </UserLayout>
    );
  }

  // Tampilan utama setelah data profil berhasil didapatkan
  return (
    <UserLayout>
      <SeoHead
        title={`Profil Saya - ${user.name} - Dreamslink`}
        description="Lihat dan kelola profil Anda di Dreamslink."
        canonical="/profile"
      />

      <div className="content d-flex flex-column flex-column-fluid" id="kt_content">
          {/*begin::Navbar*/}
          <div className="card mb-5 mb-xl-10">
            <div className="card-body pt-9 pb-0">
              {/*begin::Details*/}
              <div className="d-flex flex-wrap flex-sm-nowrap">
                {/*begin::Pic*/}
                <div className="me-7 mb-4">
                  <div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
                    <img src={user.avatarUrl || '/assets/media/avatars/blank.png'} alt="User Avatar" />
                    <div className="position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border-4 border-body h-20px w-20px"></div>
                  </div>
                </div>
                {/*end::Pic*/}
                {/*begin::Info*/}
                <div className="flex-grow-1">
                  {/*begin::Title*/}
                  <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                    <div className="d-flex flex-column">
                      <div className="d-flex align-items-center mb-2">
                        <span className="text-gray-900 text-hover-primary fs-2 fw-bold me-1">{user.name}</span>
                        <i className="ki-duotone ki-verify fs-1 text-primary ms-1">
                          <span className="path1"></span><span className="path2"></span>
                        </i>
                      </div>
                      <div className="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2">
                        <span className="d-flex align-items-center text-gray-500 me-5 mb-2">
                          <i className="ki-duotone ki-profile-circle fs-4 me-1"><span className="path1"></span><span className="path2"></span><span className="path3"></span></i>
                          {user.role || 'Pengguna'}
                        </span>
                        <span className="d-flex align-items-center text-gray-500 me-5 mb-2">
                          <i className="ki-duotone ki-geolocation fs-4 me-1"><span className="path1"></span><span className="path2"></span></i>
                          {user.location || 'Indonesia'}
                        </span>
                        <span className="d-flex align-items-center text-gray-500 mb-2">
                          <i className="ki-duotone ki-sms fs-4 me-1"><span className="path1"></span><span className="path2"></span></i>
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/*end::Title*/}
                  {/*begin::Stats*/}
                  <div className="d-flex flex-wrap flex-stack">
                    <div className="d-flex flex-column flex-grow-1 pe-8">
                      <div className="d-flex flex-wrap">
                        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                          <div className="d-flex align-items-center"><div className="fs-2 fw-bold">{user.stats?.invitations || 0}</div></div>
                          <div className="fw-semibold fs-6 text-gray-500">Undangan</div>
                        </div>
                        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                          <div className="d-flex align-items-center"><div className="fs-2 fw-bold">{user.stats?.totalGuests || 0}</div></div>
                          <div className="fw-semibold fs-6 text-gray-500">Total Tamu</div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center w-200px w-sm-300px flex-column mt-3">
                      <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                        <span className="fw-semibold fs-6 text-gray-500">Kelengkapan Profil</span>
                        <span className="fw-bold fs-6">{user.profileCompleteness || 50}%</span>
                      </div>
                      <div className="h-5px mx-3 w-100 bg-light mb-3">
                        <div className="bg-success rounded h-5px" role="progressbar" style={{ width: `${user.profileCompleteness || 50}%` }}></div>
                      </div>
                    </div>
                  </div>
                  {/*end::Stats*/}
                </div>
                {/*end::Info*/}
              </div>
              {/*end::Details*/}
              {/*begin::Navs*/}
              <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold">
                <li className="nav-item mt-2">
                  <Link href="/profile" legacyBehavior>
                    <a className="nav-link text-active-primary ms-0 me-10 py-5 active">Overview</a>
                  </Link>
                </li>
                <li className="nav-item mt-2">
                  <Link href="/profile/settings" legacyBehavior>
                    <a className="nav-link text-active-primary ms-0 me-10 py-5">Settings</a>
                  </Link>
                </li>
                 <li className="nav-item mt-2">
                  <Link href="/profile/billing" legacyBehavior>
                    <a className="nav-link text-active-primary ms-0 me-10 py-5">Billing</a>
                  </Link>
                </li>
              </ul>
              {/*end::Navs*/}
            </div>
          </div>
          {/*end::Navbar*/}
          {/*begin::details View*/}
          <div className="card mb-5 mb-xl-10" id="kt_profile_details_view">
            <div className="card-header cursor-pointer">
              <div className="card-title m-0">
                <h3 className="fw-bold m-0">Detail Profil</h3>
              </div>
              <Link href="/profile/settings" legacyBehavior>
                 <a className="btn btn-sm btn-primary align-self-center">Edit Profil</a>
              </Link>
            </div>
            <div className="card-body p-9">
              <div className="row mb-7">
                <label className="col-lg-4 fw-semibold text-muted">Nama Lengkap</label>
                <div className="col-lg-8"><span className="fw-bold fs-6 text-gray-800">{user.name}</span></div>
              </div>
              <div className="row mb-7">
                <label className="col-lg-4 fw-semibold text-muted">Telepon</label>
                <div className="col-lg-8 d-flex align-items-center">
                  <span className="fw-bold fs-6 text-gray-800 me-2">{user.phone || '-'}</span>
                  {user.phone && <span className="badge badge-success">Verified</span>}
                </div>
              </div>
              <div className="row mb-7">
                <label className="col-lg-4 fw-semibold text-muted">Negara</label>
                <div className="col-lg-8"><span className="fw-bold fs-6 text-gray-800">{user.country || 'Indonesia'}</span></div>
              </div>
               <div className="row mb-7">
                <label className="col-lg-4 fw-semibold text-muted">Tanggal Bergabung</label>
                <div className="col-lg-8"><span className="fw-bold fs-6 text-gray-800">{new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
              </div>
            </div>
          </div>
          {/*end::details View*/}
        </div>
    </UserLayout>
  );
}