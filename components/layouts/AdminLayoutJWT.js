// components/layouts/AdminLayoutJWT.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import Script from "next/script";

export default function AdminLayoutJWT({ children }) {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== Auth Guard =====
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminInfo");
    if (!token || !adminData) {
      router.push("/admin/login");
      return;
    }
    try {
      setAdminInfo(JSON.parse(adminData));
      setLoading(false);
    } catch {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      router.push("/admin/login");
    }
  }, [router]);

  // ===== Metronic Components Re-initializer =====
  const reinitializeMetronic = () => {
    if (typeof window === "undefined") return;
    
    // Periksa apakah objek global Metronic sudah ada
    if (window.KTMenu && typeof window.KTMenu.createInstances === 'function') {
        try {
            window.KTMenu.createInstances('[data-kt-menu="true"]');
            window.KTDrawer.createInstances();
            window.KTScroll.createInstances();
            window.KTSticky.createInstances();
            window.KTSwapper.createInstances();
            window.KTImageInput.createInstances();
            
            // Re-inisialisasi Theme Mode di sini agar event click tetap terikat
            window.KTThemeMode.init(); 
        } catch (e) {
            console.error("Error re-initializing Metronic components:", e);
        }
    }
  };

  // ===== Init scripts once & reinit on route change =====
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBundlesReady = () => {
      // Polyfill: alias .init() -> .createInstances()
      (function () {
        function alias(obj) {
          if (!obj) return;
          if (!obj.init && typeof obj.createInstances === "function") {
            obj.init = function () {
              try {
                obj.createInstances();
              } catch {}
            };
          }
        }
        alias(window.KTDrawer);
        alias(window.KTMenu);
        alias(window.KTScroll);
        alias(window.KTSticky);
        alias(window.KTSwapper);
      })();

      // Init pertama kali setelah bundle siap
      setTimeout(reinitializeMetronic, 120);
    };

    // Jika bundle sudah pernah dimuat, langsung jalankan
    if (window.__METRONIC_BUNDLES_READY__) {
      onBundlesReady();
    } else {
      // Jika belum, tambahkan event listener
      window.addEventListener("metronic:bundles-ready", onBundlesReady, { once: true });
    }

    // Jalankan re-init setiap kali route berubah
    const handleRoute = () => setTimeout(reinitializeMetronic, 120);
    router.events.on("routeChangeComplete", handleRoute);

    // Cleanup listener saat komponen di-unmount
    return () => {
      router.events.off("routeChangeComplete", handleRoute);
      window.removeEventListener("metronic:bundles-ready", onBundlesReady);
    };
  }, [router.events]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Admin Dashboard - Digital Invitation</title>
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
  if (!adminInfo) return null;

  return (
    <>
      <Head>
        <title>Admin Dashboard - Digital Invitation</title>
        <meta name="description" content="Admin dashboard for managing digital invitations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* ===== Fonts ===== */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* (opsional) override font */}
      
      </Head>

      {/* ===== Theme bootstrap (FIXED VERSION) ===== */}
      <Script id="kt-theme-early" strategy="beforeInteractive">
        {`
          (function(){
            var defaultThemeMode = "light"; 
            var themeMode; 
            
            if (document.documentElement) { 
              if (document.documentElement.hasAttribute("data-bs-theme-mode")) { 
                themeMode = document.documentElement.getAttribute("data-bs-theme-mode"); 
              } else { 
                if (localStorage.getItem("data-bs-theme") !== null) { 
                  themeMode = localStorage.getItem("data-bs-theme"); 
                } else { 
                  themeMode = defaultThemeMode; 
                } 
              } 
              
              if (themeMode === "system") { 
                themeMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; 
              } 
              
              document.documentElement.setAttribute("data-bs-theme", themeMode); 
            }
          })();
        `}
      </Script>

      {/* ===== Stubs agar tidak error sebelum bundle siap ===== */}
      <Script id="kt-stubs" strategy="beforeInteractive">
        {`
          window.KTApp = window.KTApp || { init: function(){} };
          window.KTMenu = window.KTMenu || { createInstances: function(){}, init: function(){} };
          window.KTDrawer = window.KTDrawer || { createInstances: function(){}, init: function(){} };
          window.KTScroll = window.KTScroll || { createInstances: function(){}, init: function(){} };
          window.KTSticky = window.KTSticky || { createInstances: function(){}, init: function(){} };
          window.KTSwapper = window.KTSwapper || { createInstances: function(){}, init: function(){} };
          window.KTThemeMode = window.KTThemeMode || { init: function(){}, getMode: function(){return 'light';} };
          window.KTImageInput = window.KTImageInput || { createInstances: function(){} };
        `}
      </Script>

      {/* ===== Metronic JS Bundles ===== */}
      <Script
        id="kt-plugins-bundle"
        src="/metronic/assets/plugins/global/plugins.bundle.js"
        strategy="beforeInteractive"
      />
      <Script
        id="kt-scripts-bundle"
        src="/metronic/assets/js/scripts.bundle.js"
        strategy="beforeInteractive"
        onLoad={() => {
          if (!window.__METRONIC_BUNDLES_READY__) {
            window.__METRONIC_BUNDLES_READY__ = true;
            window.dispatchEvent(new Event("metronic:bundles-ready"));
            try { window.KTApp?.init?.(); } catch {}
          }
        }}
      />

      {/* ===== Layout Markup ===== */}
      <div className="d-flex flex-column flex-root" id="kt_body">
        <div className="d-flex flex-column flex-root">
          <div className="page d-flex flex-row flex-column-fluid">
            {/* Aside */}
            <div
              id="kt_aside"
              className="aside py-9"
              data-kt-drawer="true"
              data-kt-drawer-name="aside"
              data-kt-drawer-activate="{default: true, lg: false}"
              data-kt-drawer-overlay="true"
              data-kt-drawer-width="{default:'200px', '300px': '250px'}"
              data-kt-drawer-direction="start"
              data-kt-drawer-toggle="#kt_aside_toggle"
            >
              <div className="aside-logo flex-column-auto px-9 mb-9" id="kt_aside_logo">
                <Link href="/admin" className="d-inline-flex">
                  <img
                    alt="Logo"
                    src="/metronic/assets/media/logos/demo3.svg"
                    className="h-20px logo theme-light-show"
                  />
                  <img
                    alt="Logo"
                    src="/metronic/assets/media/logos/demo3-dark.svg"
                    className="h-20px logo theme-dark-show"
                  />
                </Link>
              </div>

              {/* Menu */}
              <div className="aside-menu flex-column-fluid ps-5 pe-3 mb-9" id="kt_aside_menu">
                <div
                  className="hover-scroll-overlay-y my-5 my-lg-5"
                  id="kt_aside_menu_wrapper"
                  data-kt-scroll="true"
                  data-kt-scroll-activate="{default: false, lg: true}"
                  data-kt-scroll-height="auto"
                  data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
                  data-kt-scroll-wrappers="#kt_aside_menu"
                  data-kt-scroll-offset="0"
                >
                  <div
                    className="menu menu-column menu-title-gray-800 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500"
                    id="kt_aside_menu_list"
                    data-kt-menu="true"
                    data-kt-menu-expand="false"
                  >
                    <div className="menu-item">
                      <Link
                        href="/admin"
                        className={`menu-link ${router.pathname === "/admin" ? "active" : ""}`}
                      >
                        <span className="menu-icon">
                          <i className="ki-duotone ki-element-11 fs-2">
                            <span className="path1" />
                            <span className="path2" />
                            <span className="path3" />
                            <span className="path4" />
                          </i>
                        </span>
                        <span className="menu-title">Dashboard</span>
                      </Link>
                    </div>

                    <div className="menu-item">
                      <Link
                        href="/admin/users"
                        className={`menu-link ${
                          router.pathname.startsWith("/admin/users") ? "active" : ""
                        }`}
                      >
                        <span className="menu-icon">
                          <i className="ki-duotone ki-profile-user fs-2">
                            <span className="path1" />
                            <span className="path2" />
                            <span className="path3" />
                          </i>
                        </span>
                        <span className="menu-title">Users</span>
                      </Link>
                    </div>

                    <div className="menu-item">
                      <Link
                        href="/admin/invitations"
                        className={`menu-link ${
                          router.pathname.startsWith("/admin/invitations") ? "active" : ""
                        }`}
                      >
                        <span className="menu-icon">
                          <i className="ki-duotone ki-message-text-2 fs-2">
                            <span className="path1" />
                            <span className="path2" />
                            <span className="path3" />
                          </i>
                        </span>
                        <span className="menu-title">Invitations</span>
                      </Link>
                    </div>

                    <div className="menu-item">
                      <Link
                        href="/admin/packages"
                        className={`menu-link ${
                          router.pathname.startsWith("/admin/packages") ? "active" : ""
                        }`}
                      >
                        <span className="menu-icon">
                          <i className="ki-duotone ki-package fs-2">
                            <span className="path1" />
                            <span className="path2" />
                            <span className="path3" />
                          </i>
                        </span>
                        <span className="menu-title">Packages</span>
                      </Link>
                    </div>

                    <div className="menu-item">
                      <Link
                        href="/admin/orders"
                        className={`menu-link ${
                          router.pathname.startsWith("/admin/orders") ? "active" : ""
                        }`}
                      >
                        <span className="menu-icon">
                          <i className="ki-duotone ki-basket fs-2">
                            <span className="path1" />
                            <span className="path2" />
                            <span className="path3" />
                            <span className="path4" />
                          </i>
                        </span>
                        <span className="menu-title">Orders</span>
                      </Link>
                    </div>

                    <div className="menu-item">
                      <Link
                        href="/admin/coupons"
                        className={`menu-link ${
                          router.pathname.startsWith("/admin/coupons") ? "active" : ""
                        }`}
                      >
                        <span className="menu-icon">
                          <i className="ki-duotone ki-discount fs-2">
                            <span className="path1" />
                            <span className="path2" />
                          </i>
                        </span>
                        <span className="menu-title">Coupons</span>
                      </Link>
                    </div>

                    <div className="menu-item">
                      <Link
                        href="/admin/settings"
                        className={`menu-link ${
                          router.pathname.startsWith("/admin/settings") ? "active" : ""
                        }`}
                      >
                        <span className="menu-icon">
                          <i className="ki-duotone ki-setting-2 fs-2">
                            <span className="path1" />
                            <span className="path2" />
                          </i>
                        </span>
                        <span className="menu-title">Settings</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aside footer (user) */}
              <div className="aside-footer flex-column-auto px-9" id="kt_aside_footer">
                <div className="d-flex flex-stack">
                  <div className="d-flex align-items-center">
                    <div className="symbol symbol-circle symbol-40px">
                      <img src="/metronic/assets/media/avatars/300-1.jpg" alt="photo" />
                    </div>
                    <div className="ms-2">
                      <Link
                        href="/admin/settings"
                        className="text-gray-800 text-hover-primary fs-6 fw-bold lh-1"
                      >
                        {adminInfo?.name || "Admin"}
                      </Link>
                      <span className="text-muted fw-semibold d-block fs-7 lh-1">Administrator</span>
                    </div>
                  </div>
                  <div className="ms-1">
                    <div
                      className="btn btn-sm btn-icon btn-active-color-primary position-relative me-n2"
                      data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                      data-kt-menu-overflow="true"
                      data-kt-menu-placement="top-end"
                    >
                      <i className="ki-duotone ki-setting-2 fs-1">
                        <span className="path1" />
                        <span className="path2" />
                      </i>
                    </div>
                    <div
                      className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px"
                      data-kt-menu="true"
                    >
                      <div className="menu-item px-3">
                        <div className="menu-content d-flex align-items-center px-3">
                          <div className="symbol symbol-50px me-5">
                            <img alt="Logo" src="/metronic/assets/media/avatars/300-1.jpg" />
                          </div>
                          <div className="d-flex flex-column">
                            <div className="fw-bold d-flex align-items-center fs-5">
                              {adminInfo?.name || "Administrator"}
                              <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">
                                Admin
                              </span>
                            </div>
                            <Link
                              href="/admin/settings"
                              className="fw-semibold text-muted text-hover-primary fs-7"
                            >
                              {adminInfo?.email || "admin@undangandigital.com"}
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="separator my-2" />
                      <div className="menu-item px-5">
                        <Link href="/admin/settings" className="menu-link px-5">
                          My Profile
                        </Link>
                      </div>
                      <div className="menu-item px-5 my-1">
                        <Link href="/admin/settings" className="menu-link px-5">
                          Account Settings
                        </Link>
                      </div>
                      <div className="menu-item px-5">
                        <button
                          onClick={() => {
                            localStorage.removeItem("adminToken");
                            localStorage.removeItem("adminInfo");
                            router.push("/admin/login");
                          }}
                          className="menu-link px-5 btn btn-link text-start p-0 w-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wrapper */}
            <div className="wrapper d-flex flex-column flex-row-fluid" id="kt_wrapper">
              {/* Header */}
              <div
                id="kt_header"
                className="header mt-0 mt-lg-0 pt-lg-0"
                data-kt-sticky="true"
                data-kt-sticky-name="header"
                data-kt-sticky-offset="{lg: '300px'}"
              >
                <div className="container d-flex flex-stack flex-wrap gap-4" id="kt_header_container">
                  {/* Title */}
                  <div
                    className="page-title d-flex flex-column align-items-start justify-content-center flex-wrap me-lg-2 pb-10 pb-lg-0"
                    data-kt-swapper="true"
                    data-kt-swapper-mode="prepend"
                    data-kt-swapper-parent="{default: '#kt_content_container', lg: '#kt_header_container'}"
                  >
                    <h1 className="d-flex flex-column text-gray-900 fw-bold my-0 fs-1">
                      Hello, {adminInfo?.name || "Admin"}
                      <small className="text-muted fs-6 fw-semibold pt-1">Welcome to your dashboard</small>
                    </h1>
                  </div>

                  {/* Mobile toggle + logo */}
                  <div className="d-flex d-lg-none align-items-center ms-n3 me-2">
                    <div className="btn btn-icon btn-active-icon-primary" id="kt_aside_toggle">
                      <i className="ki-duotone ki-abstract-14 fs-1 mt-1">
                        <span className="path1" />
                        <span className="path2" />
                      </i>
                    </div>
                    <Link href="/admin" className="d-flex align-items-center">
                      <img
                        alt="Logo"
                        src="/metronic/assets/media/logos/demo3.svg"
                        className="theme-light-show h-20px"
                      />
                      <img
                        alt="Logo"
                        src="/metronic/assets/media/logos/demo3-dark.svg"
                        className="theme-dark-show h-20px"
                      />
                    </Link>
                  </div>

                  {/* Topbar */}
                  <div className="d-flex align-items-center flex-shrink-0 mb-0 mb-lg-0">
                    {/* ===== FIXED THEME MODE (dropdown) ===== */}
                    <div className="d-flex align-items-center ms-3 ms-lg-4">
                      <a
                        href="#"
                        className="btn btn-icon btn-color-gray-700 btn-active-color-primary btn-outline w-40px h-40px"
                        data-kt-menu-trigger="{default:'click', lg: 'hover'}"
                        data-kt-menu-attach="parent"
                        data-kt-menu-placement="bottom-end"
                        aria-label="Theme mode"
                      >
                        <i className="ki-duotone ki-night-day theme-light-show fs-1">
                          <span className="path1" />
                          <span className="path2" />
                          <span className="path3" />
                          <span className="path4" />
                          <span className="path5" />
                          <span className="path6" />
                          <span className="path7" />
                          <span className="path8" />
                          <span className="path9" />
                          <span className="path10" />
                        </i>
                        <i className="ki-duotone ki-moon theme-dark-show fs-1">
                          <span className="path1" />
                          <span className="path2" />
                        </i>
                      </a>

                      <div
                        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-500 menu-active-bg menu-state-color fw-semibold py-4 fs-base w-150px"
                        data-kt-menu="true"
                        data-kt-element="theme-mode-menu"
                      >
                        <div className="menu-item px-3 my-0">
                          <a 
                            href="#" 
                            className="menu-link px-3 py-2" 
                            data-kt-element="mode" 
                            data-kt-value="light"
                          >
                            <span className="menu-icon" data-kt-element="icon">
                              <i className="ki-duotone ki-night-day fs-2">
                                <span className="path1" />
                                <span className="path2" />
                                <span className="path3" />
                                <span className="path4" />
                                <span className="path5" />
                                <span className="path6" />
                                <span className="path7" />
                                <span className="path8" />
                                <span className="path9" />
                                <span className="path10" />
                              </i>
                            </span>
                            <span className="menu-title">Light</span>
                          </a>
                        </div>
                        <div className="menu-item px-3 my-0">
                          <a 
                            href="#" 
                            className="menu-link px-3 py-2" 
                            data-kt-element="mode" 
                            data-kt-value="dark"
                          >
                            <span className="menu-icon" data-kt-element="icon">
                              <i className="ki-duotone ki-moon fs-2">
                                <span className="path1" />
                                <span className="path2" />
                              </i>
                            </span>
                            <span className="menu-title">Dark</span>
                          </a>
                        </div>
                        <div className="menu-item px-3 my-0">
                          <a 
                            href="#" 
                            className="menu-link px-3 py-2" 
                            data-kt-element="mode" 
                            data-kt-value="system"
                          >
                            <span className="menu-icon" data-kt-element="icon">
                              <i className="ki-duotone ki-screen fs-2">
                                <span className="path1" />
                                <span className="path2" />
                                <span className="path3" />
                                <span className="path4" />
                              </i>
                            </span>
                            <span className="menu-title">System</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* User menu */}
                    <div className="d-flex align-items-center ms-3 ms-lg-4" id="kt_header_user_menu_toggle">
                      <div
                        className="cursor-pointer symbol symbol-35px symbol-md-40px"
                        data-kt-menu-trigger="click"
                        data-kt-menu-attach="parent"
                        data-kt-menu-placement="bottom-end"
                      >
                        <img src="/metronic/assets/media/avatars/300-1.jpg" alt="user" />
                      </div>
                      <div
                        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px"
                        data-kt-menu="true"
                      >
                        <div className="menu-item px-3">
                          <div className="menu-content d-flex align-items-center px-3">
                            <div className="symbol symbol-50px me-5">
                              <img alt="Logo" src="/metronic/assets/media/avatars/300-1.jpg" />
                            </div>
                            <div className="d-flex flex-column">
                              <div className="fw-bold d-flex align-items-center fs-5">
                                {adminInfo?.name || "Administrator"}
                                <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">Admin</span>
                              </div>
                              <Link href="/admin/settings" className="fw-semibold text-muted text-hover-primary fs-7">
                                {adminInfo?.email || "admin@undangandigital.com"}
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div className="separator my-2" />
                        <div className="menu-item px-5">
                          <Link href="/admin/settings" className="menu-link px-5">
                            My Profile
                          </Link>
                        </div>
                        <div className="menu-item px-5 my-1">
                          <Link href="/admin/settings" className="menu-link px-5">
                            Account Settings
                          </Link>
                        </div>
                        <div className="menu-item px-5">
                          <button
                            onClick={() => {
                              localStorage.removeItem("adminToken");
                              localStorage.removeItem("adminInfo");
                              router.push("/admin/login");
                            }}
                            className="menu-link px-5 btn btn-link text-start p-0 w-100"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="content d-flex flex-column flex-column-fluid" id="kt_content">
                <div className="container-xxl" id="kt_content_container">
                  {children}
                </div>
              </div>

              {/* Footer */}
              <div className="footer py-4 d-flex flex-lg-column" id="kt_footer">
                <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
                  <div className="text-gray-900 order-2 order-md-1">
                    <span className="text-muted fw-semibold me-1">{new Date().getFullYear()}&copy;</span>
                    <Link href="/" target="_blank" className="text-gray-800 text-hover-primary">
                      Digital Invitation
                    </Link>
                  </div>
                  <ul className="menu menu-gray-600 menu-hover-primary fw-semibold order-1">
                    <li className="menu-item">
                      <Link href="/" target="_blank" className="menu-link px-2">
                        About
                      </Link>
                    </li>
                    <li className="menu-item">
                      <Link href="/kontak" target="_blank" className="menu-link px-2">
                        Support
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Wrapper */}
          </div>
        </div>

        {/* Scrolltop */}
        <div id="kt_scrolltop" className="scrolltop" data-kt-scrolltop="true">
          <i className="ki-duotone ki-arrow-up">
            <span className="path1" />
            <span className="path2" />
          </i>
        </div>
      </div>
    </>
  );
}