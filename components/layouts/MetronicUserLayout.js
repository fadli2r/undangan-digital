import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';

const MetronicUserLayout = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Protect user routes and fetch user data
  useEffect(() => {
    const fetchUser = async (email) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/user-info?email=${email}`);
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (e) {
        console.error('Error fetching user:', e);
      }
      setIsLoading(false);
    };

    if (status === "loading") return;

    let email = session?.user?.email;
    if (email) {
      fetchUser(email);
    } else if (typeof window !== "undefined") {
      const userLS = localStorage.getItem("user");
      if (userLS) {
        email = JSON.parse(userLS).email;
        fetchUser(email);
      } else {
        router.replace("/login");
      }
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'ki-element-11',
      active: router.pathname === '/dashboard'
    },
    {
      name: 'Buat Undangan',
      href: '/pilih-template',
      icon: 'ki-plus-square',
      active: router.pathname.startsWith('/pilih-template')
    },
    {
      name: 'Edit Undangan',
      href: '/dashboard',
      icon: 'ki-message-text-2',
      active: router.pathname.startsWith('/edit-undangan')
    },
    {
      name: 'Paket',
      href: '/paket',
      icon: 'ki-package',
      active: router.pathname.startsWith('/paket')
    }
  ];

  if (isLoading) {
    return (
      <>
        <Head>
          <link href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" rel="stylesheet" />
          <link href="/metronic/assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
          <link href="/metronic/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
        </Head>
        <div className="d-flex flex-column flex-root">
          <div className="page-loading d-flex flex-column flex-column-fluid">
            <div className="d-flex align-items-center justify-content-center flex-column-fluid">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" rel="stylesheet" />
        <link href="/metronic/assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
      </Head>

      <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
        <div className="app-page flex-column flex-column-fluid" id="kt_app_page">
          
          {/* Header */}
          <div id="kt_app_header" className="app-header">
            <div className="app-container container-fluid d-flex align-items-stretch justify-content-between" id="kt_app_header_container">
              
              {/* Sidebar mobile toggle */}
              <div className="d-flex align-items-center d-lg-none ms-n3 me-1 me-md-2" title="Show sidebar menu">
                <div className="btn btn-icon btn-active-color-primary w-35px h-35px" id="kt_app_sidebar_mobile_toggle">
                  <i className="ki-duotone ki-abstract-14 fs-2 fs-md-1">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
              </div>

              {/* Logo */}
              <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
                <Link href="/dashboard" className="d-lg-none">
                  <img alt="Logo" src="/logo.png" className="h-30px" />
                </Link>
              </div>

              {/* Navbar */}
              <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1" id="kt_app_header_navbar">
                <div className="d-flex align-items-stretch" id="kt_app_header_menu">
                  {/* Menu wrapper */}
                </div>

                {/* Navbar */}
                <div className="d-flex align-items-stretch flex-shrink-0">
                  {/* User Status Badge */}
                  {user && (
                    <div className="d-flex align-items-center me-3">
                      <span className={`badge ${user.status_pembayaran === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {user.status_pembayaran === 'paid' ? 'Premium' : 'Pending Payment'}
                      </span>
                    </div>
                  )}

                  {/* User menu */}
                  <div className="d-flex align-items-center ms-1 ms-lg-3" id="kt_header_user_menu_toggle">
                    <div className="cursor-pointer symbol symbol-30px symbol-md-40px" data-kt-menu-trigger="click" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
                      <img src="/metronic/assets/media/avatars/300-1.jpg" alt="user" />
                    </div>

                    {/* User account menu */}
                    <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px" data-kt-menu="true">
                      <div className="menu-item px-3">
                        <div className="menu-content d-flex align-items-center px-3">
                          <div className="symbol symbol-50px me-5">
                            <img alt="Logo" src="/metronic/assets/media/avatars/300-1.jpg" />
                          </div>
                          <div className="d-flex flex-column">
                            <div className="fw-bold d-flex align-items-center fs-5">
                              {user?.name || user?.email}
                            </div>
                            <span className="fw-semibold text-muted text-hover-primary fs-7">
                              {user?.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="separator my-2"></div>
                      <div className="menu-item px-5">
                        <button onClick={handleLogout} className="menu-link px-5">
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wrapper */}
          <div className="app-wrapper flex-column flex-row-fluid" id="kt_app_wrapper">
            
            {/* Sidebar */}
            <div id="kt_app_sidebar" className="app-sidebar flex-column" data-kt-drawer="true" data-kt-drawer-name="app-sidebar" data-kt-drawer-activate="{default: true, lg: false}" data-kt-drawer-overlay="true" data-kt-drawer-width="225px" data-kt-drawer-direction="start" data-kt-drawer-toggle="#kt_app_sidebar_mobile_toggle">
              
              {/* Logo */}
              <div className="app-sidebar-logo px-6" id="kt_app_sidebar_logo">
                <Link href="/dashboard">
                  <img alt="Logo" src="/logo.png" className="h-25px app-sidebar-logo-default" />
                  <img alt="Logo" src="/logo.png" className="h-20px app-sidebar-logo-minimize" />
                </Link>

                <div id="kt_app_sidebar_toggle" className="app-sidebar-toggle btn btn-icon btn-shadow btn-sm btn-color-muted btn-active-color-primary body-bg h-30px w-30px position-absolute top-50 start-100 translate-middle rotate" data-kt-toggle="true" data-kt-toggle-state="active" data-kt-toggle-target="body" data-kt-toggle-name="app-sidebar-minimize">
                  <i className="ki-duotone ki-double-left fs-2 rotate-180">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
              </div>

              {/* Menu wrapper */}
              <div className="app-sidebar-menu overflow-hidden flex-column-fluid">
                <div id="kt_app_sidebar_menu_wrapper" className="app-sidebar-wrapper hover-scroll-overlay-y my-5" data-kt-scroll="true" data-kt-scroll-activate="true" data-kt-scroll-height="auto" data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer" data-kt-scroll-wrappers="#kt_app_sidebar_menu" data-kt-scroll-offset="5px" data-kt-scroll-save-state="true">
                  
                  <div className="menu menu-column menu-rounded menu-sub-indention px-3" id="#kt_app_sidebar_menu" data-kt-menu="true" data-kt-menu-expand="false">
                    
                    {navigation.map((item) => (
                      <div key={item.name} className="menu-item">
                        <Link href={item.href} className={`menu-link ${item.active ? 'active' : ''}`}>
                          <span className="menu-icon">
                            <i className={`ki-duotone ${item.icon} fs-2`}>
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                          </span>
                          <span className="menu-title">{item.name}</span>
                        </Link>
                      </div>
                    ))}

                    {/* User Stats */}
                    {user && (
                      <>
                        <div className="separator my-4"></div>
                        <div className="menu-item">
                          <div className="menu-content">
                            <div className="menu-heading fw-bold text-uppercase fs-7">
                              Status Akun
                            </div>
                          </div>
                        </div>
                        <div className="menu-item">
                          <div className="menu-content px-3 py-2">
                            <div className="d-flex align-items-center">
                              <div className="bullet bullet-dot bg-success me-2"></div>
                              <div className="fs-7 text-muted">
                                Quota: {user.quota || 0}
                              </div>
                            </div>
                            <div className="d-flex align-items-center mt-1">
                              <div className={`bullet bullet-dot ${user.status_pembayaran === 'paid' ? 'bg-success' : 'bg-warning'} me-2`}></div>
                              <div className="fs-7 text-muted">
                                {user.status_pembayaran === 'paid' ? 'Premium Active' : 'Payment Pending'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                  </div>
                </div>
              </div>
            </div>

            {/* Main */}
            <div className="app-main flex-column flex-row-fluid" id="kt_app_main">
              <div className="d-flex flex-column flex-column-fluid">
                
                {/* Toolbar */}
                <div id="kt_app_toolbar" className="app-toolbar py-3 py-lg-6">
                  <div id="kt_app_toolbar_container" className="app-container container-xxl d-flex flex-stack">
                    <div className="page-title d-flex flex-column justify-content-center flex-wrap me-3">
                      <h1 className="page-heading d-flex text-dark fw-bold fs-3 flex-column justify-content-center my-0">
                        Dashboard
                      </h1>
                      <ul className="breadcrumb breadcrumb-separatorless fw-semibold fs-7 my-0 pt-1">
                        <li className="breadcrumb-item text-muted">
                          <Link href="/dashboard" className="text-muted text-hover-primary">
                            Home
                          </Link>
                        </li>
                        <li className="breadcrumb-item">
                          <span className="bullet bg-gray-400 w-5px h-2px"></span>
                        </li>
                        <li className="breadcrumb-item text-muted">Dashboard</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Content wrapper */}
                <div id="kt_app_content" className="app-content flex-column-fluid">
                  <div id="kt_app_content_container" className="app-container container-xxl">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scripts */}
      <script src="/metronic/assets/plugins/global/plugins.bundle.js"></script>
      <script src="/metronic/assets/js/scripts.bundle.js"></script>
    </>
  );
};

export default MetronicUserLayout;
