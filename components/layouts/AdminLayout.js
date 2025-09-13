// components/layouts/AdminLayout.js
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSession, signOut } from "next-auth/react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Auth guard
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/admin/login");
    } else if (status === "authenticated" && !session?.user?.isAdmin) {
      router.replace("/"); // kalau login tapi bukan admin
    }
  }, [status, session, router]);

  // Metronic re-init
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        window.KTApp?.init?.();
        window.KTDrawer?.createInstances?.();
        window.KTMenu?.createInstances?.('[data-kt-menu="true"]');
        window.KTScroll?.createInstances?.();
        window.KTSticky?.createInstances?.();
        window.KTSwapper?.createInstances?.();
        window.KTToggle?.createInstances?.();
        window.KTScrolltop?.createInstances?.();
        
              window.KTThemeMode?.init?.();

      } catch (err) {
        console.warn("Metronic init error:", err);
      }
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false, callbackUrl: "/admin/login" });
    } finally {
      router.push("/admin/login");
    }
  };
  if (status === "loading") {
    return (
      <>
        <Head>
          <title>Admin Dashboard - Digital Invitation</title>
        </Head>
       <div className="d-flex flex-column flex-root">
        <div className="page-loading d-flex flex-column flex-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Admin info dari session
  const adminInfo = session?.user;
  return (
    <div className="d-flex flex-column flex-root">
      {/* begin::Page */}
      <div className="page d-flex flex-row flex-column-fluid">
        {/* begin::Aside */}
        <div id="kt_aside" class="aside py-9" data-kt-drawer="true" data-kt-drawer-name="aside" data-kt-drawer-activate="{default: true, lg: false}" data-kt-drawer-overlay="true" data-kt-drawer-width="{default:'200px', '300px': '250px'}" data-kt-drawer-direction="start" data-kt-drawer-toggle="#kt_aside_toggle">
          {/* begin::Brand */}
          <div className="aside-logo flex-column-auto px-9 mb-9" id="kt_aside_logo">
            <Link href="/admin" className="d-inline-flex align-items-center">
              <img alt="Logo" src="/metronic/assets/media/logos/demo3.svg" className="h-20px logo theme-light-show" />
              <img alt="Logo" src="/metronic/assets/media/logos/demo3-dark.svg" className="h-20px logo theme-dark-show" />
            </Link>
          </div>
          {/* end::Brand */}

          {/* begin::Aside menu */}
          <div className="aside-menu flex-column-fluid ps-5 pe-3 mb-9" id="kt_aside_menu">
            <div
              className="w-100 hover-scroll-overlay-y d-flex pe-3"
              id="kt_aside_menu_wrapper"
              data-kt-scroll="true"
              data-kt-scroll-activate="{default:false, lg:true}"
              data-kt-scroll-height="auto"
              data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
              data-kt-scroll-wrappers="#kt_aside, #kt_aside_menu, #kt_aside_menu_wrapper"
              data-kt-scroll-offset="100"
            >
              <div
                className="menu menu-column menu-rounded menu-sub-indention menu-active-bg fw-semibold my-auto"
                id="#kt_aside_menu"
                data-kt-menu="true"
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
                    href="/admin/features"
                    className={`menu-link ${
                      router.pathname.startsWith("/admin/features") ? "active" : ""
                    }`}
                  >
                    <span className="menu-icon">
                      <i className="ki-duotone ki-package fs-2">
                        <span className="path1" />
                        <span className="path2" />
                        <span className="path3" />
                      </i>
                    </span>
                    <span className="menu-title">Feature</span>
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
          {/* end::Aside menu */}

          {/* begin::Aside footer */}
          <div className="aside-footer flex-column-auto px-9" id="kt_aside_footer">
            {/* begin::User panel */}
            <div className="d-flex flex-stack">
              {/* begin::Wrapper */}
              <div className="d-flex align-items-center">
                {/* begin::Avatar */}
                <div className="symbol symbol-circle symbol-40px">
                  <img src="" alt="photo" />
                </div>
                {/* end::Avatar */}
                {/* begin::User info */}
                <div className="ms-2">
                  {/* begin::Name */}
                  <a href="#" className="text-gray-800 text-hover-primary fs-6 fw-bold lh-1">{adminInfo?.name || 'Paul Melone'}</a>
                  {/* end::Name */}
                  {/* begin::Major */}
                  <span className="text-muted fw-semibold d-block fs-7 lh-1">{adminInfo?.role || 'Python Dev'}</span>
                  {/* end::Major */}
                </div>
                {/* end::User info */}
              </div>
              {/* end::Wrapper */}
              {/* begin::User menu */}
              <div className="ms-1">
                <div className="btn btn-sm btn-icon btn-active-color-primary position-relative me-n2" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-overflow="true" data-kt-menu-placement="top-end">
                  <i className="ki-duotone ki-setting-2 fs-1">
                    <span className="path1" />
                    <span className="path2" />
                  </i>
                </div>
                {/* begin::User account menu */}
                <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px" data-kt-menu="true">
                  {/* begin::Menu item */}
                  <div className="menu-item px-3">
                    <div className="menu-content d-flex align-items-center px-3">
                      {/* begin::Avatar */}
                      <div className="symbol symbol-50px me-5">
                        <img alt="Logo" src="" />
                      </div>
                      {/* end::Avatar */}
                      {/* begin::Username */}
                      <div className="d-flex flex-column">
                        <div className="fw-bold d-flex align-items-center fs-5">{adminInfo?.name || 'Max Smith'}
                          <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">Pro</span>
                        </div>
                        <a href="#" className="fw-semibold text-muted text-hover-primary fs-7">{adminInfo?.email || 'max@kt.com'}</a>
                      </div>
                      {/* end::Username */}
                    </div>
                  </div>
                  {/* end::Menu item */}
                  {/* begin::Menu separator */}
                  <div className="separator my-2" />
                  {/* end::Menu separator */}
                  {/* begin::Menu item */}
                  <div className="menu-item px-5">
                    <a href="/admin/account/overview" className="menu-link px-5">My Profile</a>
                  </div>
                  {/* end::Menu item */}
                  {/* begin::Menu item */}
                  <div className="menu-item px-5">
                    <a href="/admin/projects" className="menu-link px-5">
                      <span className="menu-text">My Projects</span>
                      <span className="menu-badge">
                        <span className="badge badge-light-danger badge-circle fw-bold fs-7">3</span>
                      </span>
                    </a>
                  </div>
                  {/* end::Menu item */}
                  {/* begin::Menu item */}
                  <div className="menu-item px-5" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="right-end" data-kt-menu-offset="-15px, 0">
                    <a href="#" className="menu-link px-5">
                      <span className="menu-title">My Subscription</span>
                      <span className="menu-arrow" />
                    </a>
                    {/* begin::Menu sub */}
                    <div className="menu-sub menu-sub-dropdown w-175px py-4">
                      {/* begin::Menu item */}
                      <div className="menu-item px-3">
                        <a href="/admin/account/referrals" className="menu-link px-5">Referrals</a>
                      </div>
                      {/* end::Menu item */}
                      {/* begin::Menu item */}
                      <div className="menu-item px-3">
                        <a href="/admin/account/billing" className="menu-link px-5">Billing</a>
                      </div>
                      {/* end::Menu item */}
                      {/* begin::Menu item */}
                      <div className="menu-item px-3">
                        <a href="/admin/account/statements" className="menu-link px-5">Payments</a>
                      </div>
                      {/* end::Menu item */}
                      {/* begin::Menu item */}
                      <div className="menu-item px-3">
                        <a href="/admin/account/statements" className="menu-link d-flex flex-stack px-5">Statements
                          <span className="ms-2 lh-0" data-bs-toggle="tooltip" title="View your statements">
                            <i className="ki-duotone ki-information-5 fs-5">
                              <span className="path1" />
                              <span className="path2" />
                              <span className="path3" />
                            </i>
                          </span>
                        </a>
                      </div>
                      {/* end::Menu item */}
                      {/* begin::Menu separator */}
                      <div className="separator my-2" />
                      {/* end::Menu separator */}
                      {/* begin::Menu item */}
                      <div className="menu-item px-3">
                        <div className="menu-content px-3">
                          <label className="form-check form-switch form-check-custom form-check-solid">
                            <input className="form-check-input w-30px h-20px" type="checkbox" defaultChecked name="notifications" />
                            <span className="form-check-label text-muted fs-7">Notifications</span>
                          </label>
                        </div>
                      </div>
                      {/* end::Menu item */}
                    </div>
                    {/* end::Menu sub */}
                  </div>
                  {/* end::Menu item */}
                  {/* begin::Menu item */}
                  <div className="menu-item px-5">
                    <a href="/admin/account/statements" className="menu-link px-5">My Statements</a>
                  </div>
                  {/* end::Menu item */}
                  {/* begin::Menu separator */}
                  <div className="separator my-2" />
                  {/* end::Menu separator */}
                 
                  {/* begin::Menu item */}
                  <div className="menu-item px-5 my-1">
                    <a href="/admin/account/settings" className="menu-link px-5">Account Settings</a>
                  </div>
                  {/* end::Menu item */}
                  {/* begin::Menu item */}
                 
                  {/* end::Menu item */}
                </div>
                {/* end::User account menu */}
              </div>
              {/* end::User menu */}
            </div>
            {/* end::User panel */}
          </div>
          {/* end::Aside footer */}
        </div>
        {/* end::Aside */}

        {/* begin::Wrapper */}
        <div className="wrapper d-flex flex-column flex-row-fluid" id="kt_wrapper">
          {/* begin::Header */}
          <div
            id="kt_header"
            className="header"
            data-kt-sticky="true"
            data-kt-sticky-name="header"
            data-kt-sticky-offset="{lg: '300px'}"
          >
                  {/* Title */}
                  
            <div className="container d-flex flex-stack flex-wrap gap-4" id="kt_header_container">
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
              <div className="d-flex d-lg-none align-items-center ms-n3 me-2">
                <div className="btn btn-icon btn-active-icon-primary" id="kt_aside_toggle">
                  <i className="ki-duotone ki-abstract-14 fs-1 mt-1"><span className="path1"/><span className="path2"/></i>
                </div>
                <Link href="/admin" className="d-flex align-items-center">
                  <img alt="Logo" src="/metronic/assets/media/logos/demo3.svg" className="theme-light-show h-20px" />
                  <img alt="Logo" src="/metronic/assets/media/logos/demo3-dark.svg" className="theme-dark-show h-20px" />
                </Link>
              </div>

              {/* Topbar right buttons */}
              <div className="d-flex align-items-center flex-shrink-0">
               
                {/* Theme mode trigger */}
                <a
                  className="btn btn-icon btn-color-gray-700 btn-active-color-primary btn-outline w-40px h-40px ms-3"
                  href="#"
                  data-kt-menu-trigger="{default:'click', lg: 'hover'}"
                  data-kt-menu-attach="parent"
                  data-kt-menu-placement="bottom-end"
                >
                  <i className="ki-duotone ki-night-day theme-light-show fs-1"><span className="path1"/><span className="path2"/><span className="path3"/><span className="path4"/><span className="path5"/><span className="path6"/><span className="path7"/><span className="path8"/><span className="path9"/><span className="path10"/></i>
                  <i className="ki-duotone ki-moon theme-dark-show fs-1"><span className="path1"/><span className="path2"/></i>
                </a>

                {/* Theme mode dropdown */}
                <div
                  className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-500 menu-active-bg menu-state-color fw-semibold py-4 fs-base w-150px"
                  data-kt-menu="true"
                  data-kt-element="theme-mode-menu"
                >
                  <div className="menu-item px-3 my-0">
                    <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="light">
                      <span className="menu-icon" data-kt-element="icon"><i className="ki-duotone ki-night-day fs-2"><span className="path1"/><span className="path2"/><span className="path3"/><span className="path4"/><span className="path5"/><span className="path6"/><span className="path7"/><span className="path8"/><span className="path9"/><span className="path10"/></i></span>
                      <span className="menu-title">Light</span>
                    </a>
                  </div>
                  <div className="menu-item px-3 my-0">
                    <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="dark">
                      <span className="menu-icon" data-kt-element="icon"><i className="ki-duotone ki-moon fs-2"><span className="path1"/><span className="path2"/></i></span>
                      <span className="menu-title">Dark</span>
                    </a>
                  </div>
                  <div className="menu-item px-3 my-0">
                    <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="system">
                      <span className="menu-icon" data-kt-element="icon"><i className="ki-duotone ki-screen fs-2"><span className="path1"/><span className="path2"/></i></span>
                      <span className="menu-title">System</span>
                    </a>
                  </div>
                </div>
                <div className="d-flex align-items-center ms-3 ms-lg-4" id="kt_header_user_menu_toggle">
                    <div className="cursor-pointer symbol symbol-35px symbol-md-40px" data-kt-menu-trigger="click" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
                      <img src="/metronic/assets/media/avatars/300-1.jpg" alt="user" />
                    </div>
                    <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px" data-kt-menu="true">
                      <div className="menu-item px-3">
                        <div className="menu-content d-flex align-items-center px-3">
                          <div className="symbol symbol-50px me-5">
                            <img alt="Logo" src="/metronic/assets/media/avatars/300-1.jpg" />
                          </div>
                          <div className="d-flex flex-column">
                            <div className="fw-bold d-flex align-items-center fs-5">
                              {adminInfo?.name || "User"}
                              <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">Admin</span>
                            </div>
                            <span className="fw-semibold text-muted fs-7">{adminInfo?.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="separator my-2"></div>
                     
                      <div className="menu-item px-5">
                        <button onClick={handleLogout} className="menu-link px-5 btn btn-link text-start p-0 w-100">Sign Out</button>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
          {/* end::Header */}

          {/* begin::Content */}
          <div className="content d-flex flex-column flex-column-fluid" id="kt_content">
            <div className="container-xxl" id="kt_content_container">
              {children}
            </div>
          </div>
          {/* end::Content */}

          {/* begin::Footer */}
          <div className="footer py-4 d-flex flex-lg-column" id="kt_footer">
            <div className="container d-flex flex-column flex-md-row flex-stack">
              <div className="text-dark order-2 order-md-1">
                <span className="text-muted fw-semibold me-1">©</span>
                <span className="text-gray-800 fw-bold">Dreams Link - DGK Indonesia</span>
              </div>
              <ul className="menu menu-gray-600 menu-hover-primary fw-semibold order-1">
                <li className="menu-item"><Link href="#" className="menu-link px-2">About</Link></li>
                <li className="menu-item"><Link href="#" className="menu-link px-2">Support</Link></li>
              </ul>
            </div>
          </div>
          {/* end::Footer */}
        </div>
        {/* end::Wrapper */}
      </div>
      {/* end::Page */}

      {/* Scrolltop */}
      <div id="kt_scrolltop" className="scrolltop" data-kt-scrolltop="true">
        <i className="ki-duotone ki-arrow-up"><span className="path1"/><span className="path2"/></i>
      </div>
    </div>
  )
}