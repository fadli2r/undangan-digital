// components/profile/ProfileHeader.js

import Link from 'next/link';

// Komponen ini menerima data 'user' dan tab mana yang 'active'
export default function ProfileHeader({ user, activeTab }) {
  // Jika data user belum ada, tampilkan placeholder sederhana
  if (!user) {
    return <div className="card mb-5 mb-xl-10" style={{ minHeight: '300px' }}></div>;
  }

  return (
    <div className="card mb-5 mb-xl-10">
      <div className="card-body pt-9 pb-0">
        {/* Bagian Detail Pengguna */}
        <div className="d-flex flex-wrap flex-sm-nowrap">
          <div className="me-7 mb-4">
            <div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
              <img src={user.avatarUrl || '/assets/media/avatars/blank.png'} alt="User Avatar" />
              <div className="position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border-4 border-body h-20px w-20px"></div>
            </div>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
              <div className="d-flex flex-column">
                <div className="d-flex align-items-center mb-2">
                  <span className="text-gray-900 fs-2 fw-bold me-1">{user.name}</span>
                  <i className="ki-duotone ki-verify fs-1 text-primary ms-1"><span className="path1"></span><span className="path2"></span></i>
                </div>
                <div className="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2">
                  <span className="d-flex align-items-center text-gray-500 me-5 mb-2">
                    <i className="ki-duotone ki-profile-circle fs-4 me-1"><span className="path1"></span><span className="path2"></span><span className="path3"></span></i>
                    {user.role || 'Pengguna'}
                  </span>
                  <span className="d-flex align-items-center text-gray-500 mb-2">
                    <i className="ki-duotone ki-sms fs-4 me-1"><span className="path1"></span><span className="path2"></span></i>
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
            <div className="d-flex flex-wrap flex-stack">
              <div className="d-flex flex-column flex-grow-1 pe-8">
                <div className="d-flex flex-wrap">
                  <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                    <div className="d-flex align-items-center"><div className="fs-2 fw-bold">{user.stats?.invitations || 0}</div></div>
                    <div className="fw-semibold fs-6 text-gray-500">Undangan</div>
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
          </div>
        </div>
        
        {/* Bagian Tab Navigasi */}
        <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold">
          <li className="nav-item mt-2">
            <Link href="/profile" legacyBehavior>
              <a className={`nav-link text-active-primary ms-0 me-10 py-5 ${activeTab === 'overview' ? 'active' : ''}`}>Overview</a>
            </Link>
          </li>
          <li className="nav-item mt-2">
            <Link href="/profile/settings" legacyBehavior>
              <a className={`nav-link text-active-primary ms-0 me-10 py-5 ${activeTab === 'settings' ? 'active' : ''}`}>Settings</a>
            </Link>
          </li>
          <li className="nav-item mt-2">
            <Link href="/profile/billing" legacyBehavior>
              <a className={`nav-link text-active-primary ms-0 me-10 py-5 ${activeTab === 'billing' ? 'active' : ''}`}>Billing</a>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}