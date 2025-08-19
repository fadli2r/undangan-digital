import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import { useSession, signOut } from 'next-auth/react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Initialize Metronic components after component mounts
    const initializeMetronic = () => {
      if (typeof window !== 'undefined') {
        // Wait for scripts to be available
        const checkAndInit = () => {
          if (window.KTMenu) {
            window.KTMenu.createInstances();
            console.log('KTMenu initialized in useEffect');
          }
          if (window.KTDrawer) {
            window.KTDrawer.createInstances();
            console.log('KTDrawer initialized in useEffect');
          }
          if (window.KTScroll) {
            window.KTScroll.createInstances();
            console.log('KTScroll initialized in useEffect');
          }
        };
        
        // Try immediately
        checkAndInit();
        
        // Also try after a delay
        setTimeout(checkAndInit, 1000);
        setTimeout(checkAndInit, 2000);
      }
    };

    if (status === 'authenticated') {
      initializeMetronic();
    }
  }, [status]);

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/admin/login' 
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Don't render anything if not authenticated
  if (status === 'loading') {
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

  if (!session?.user?.isAdmin) {
    return null; // Will be handled by parent component
  }

  const adminInfo = session.user;

  return (
    <>
      <Head>
        <title>Admin Dashboard - Digital Invitation</title>
        <meta name="description" content="Admin dashboard for managing digital invitations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Metronic CSS */}
        <link href="/metronic/assets/plugins/custom/fullcalendar/fullcalendar.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/plugins/custom/datatables/datatables.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
        
        {/* Additional Metronic Plugins CSS */}
        <link href="/metronic/assets/plugins/custom/prismjs/prismjs.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/plugins/custom/vis-timeline/vis-timeline.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/plugins/custom/jstree/jstree.bundle.css" rel="stylesheet" type="text/css" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Metronic JavaScript */}
      <Script src="/metronic/assets/plugins/global/plugins.bundle.js" strategy="beforeInteractive" />
      <Script src="/metronic/assets/js/scripts.bundle.js" strategy="beforeInteractive" />
      <Script src="/metronic/assets/plugins/custom/fullcalendar/fullcalendar.bundle.js" strategy="lazyOnload" />
      <Script src="/metronic/assets/plugins/custom/datatables/datatables.bundle.js" strategy="lazyOnload" />
      
      {/* Additional Metronic Plugins JS */}
      <Script src="/metronic/assets/plugins/custom/prismjs/prismjs.bundle.js" strategy="lazyOnload" />
      <Script src="/metronic/assets/plugins/custom/vis-timeline/vis-timeline.bundle.js" strategy="lazyOnload" />
      <Script src="/metronic/assets/plugins/custom/jstree/jstree.bundle.js" strategy="lazyOnload" />
      <Script src="/metronic/assets/plugins/custom/formrepeater/formrepeater.bundle.js" strategy="lazyOnload" />
      <Script src="/metronic/assets/plugins/custom/cookiealert/cookiealert.bundle.js" strategy="lazyOnload" />
      
      {/* Initialize Metronic */}
      <Script id="metronic-init" strategy="afterInteractive">
        {`
          document.addEventListener('DOMContentLoaded', function() {
            // Wait for scripts to load
            setTimeout(function() {
              // Initialize KTMenu
              if (typeof KTMenu !== 'undefined') {
                KTMenu.createInstances();
                console.log('KTMenu initialized');
              }
              
              // Initialize KTDrawer
              if (typeof KTDrawer !== 'undefined') {
                KTDrawer.createInstances();
                console.log('KTDrawer initialized');
              }
              
              // Initialize KTScroll
              if (typeof KTScroll !== 'undefined') {
                KTScroll.createInstances();
                console.log('KTScroll initialized');
              }
              
              // Initialize KTSticky
              if (typeof KTSticky !== 'undefined') {
                KTSticky.createInstances();
                console.log('KTSticky initialized');
              }
              
              // Initialize KTSwapper
              if (typeof KTSwapper !== 'undefined') {
                KTSwapper.createInstances();
                console.log('KTSwapper initialized');
              }
              
              // Initialize theme mode
              if (typeof KTThemeMode !== 'undefined') {
                KTThemeMode.init();
                console.log('KTThemeMode initialized');
              }
              
              // Re-initialize after React renders
              if (typeof KTMenu !== 'undefined') {
                setTimeout(() => {
                  KTMenu.createInstances();
                  console.log('KTMenu re-initialized');
                }, 1000);
              }
            }, 500);
          });
        `}
      </Script>

      <div className="d-flex flex-column flex-root" id="kt_body">
        {/* Begin::Main */}
        {/* Begin::Root */}
        <div className="d-flex flex-column flex-root">
          {/* Begin::Page */}
          <div className="page d-flex flex-row flex-column-fluid">
            
            {/* Begin::Aside */}
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
              {/* Begin::Brand */}
              <div className="aside-logo flex-column-auto px-9 mb-9" id="kt_aside_logo">
                {/* Begin::Logo */}
                <a href="/admin">
                  <img alt="Logo" src="/metronic/assets/media/logos/demo3.svg" className="h-20px logo theme-light-show"/>
                  <img alt="Logo" src="/metronic/assets/media/logos/demo3-dark.svg" className="h-20px logo theme-dark-show"/>
                </a>
                {/* End::Logo */}
              </div>
              {/* End::Brand */}

              {/* Begin::Aside menu */}
              <div className="aside-menu flex-column-fluid ps-5 pe-3 mb-9" id="kt_aside_menu">
                <div className="hover-scroll-overlay-y my-5 my-lg-5" id="kt_aside_menu_wrapper" data-kt-scroll="true" data-kt-scroll-activate="{default: false, lg: true}" data-kt-scroll-height="auto" data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer" data-kt-scroll-wrappers="#kt_aside_menu" data-kt-scroll-offset="0">
                  <div className="menu menu-column menu-title-gray-800 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500" id="kt_aside_menu" data-kt-menu="true" data-kt-menu-expand="false">
                    
                    <div className="menu-item">
                      <a className={`menu-link ${router.pathname === '/admin' ? 'active' : ''}`} href="/admin">
                        <span className="menu-icon">
                          <i className="ki-duotone ki-element-11 fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                          </i>
                        </span>
                        <span className="menu-title">Dashboard</span>
                      </a>
                    </div>

                    <div className="menu-item">
                      <a className={`menu-link ${router.pathname.startsWith('/admin/users') ? 'active' : ''}`} href="/admin/users">
                        <span className="menu-icon">
                          <i className="ki-duotone ki-profile-user fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                          </i>
                        </span>
                        <span className="menu-title">Users</span>
                      </a>
                    </div>

                    <div className="menu-item">
                      <a className={`menu-link ${router.pathname.startsWith('/admin/invitations') ? 'active' : ''}`} href="/admin/invitations">
                        <span className="menu-icon">
                          <i className="ki-duotone ki-message-text-2 fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                          </i>
                        </span>
                        <span className="menu-title">Invitations</span>
                      </a>
                    </div>

                    <div className="menu-item">
                      <a className={`menu-link ${router.pathname.startsWith('/admin/packages') ? 'active' : ''}`} href="/admin/packages">
                        <span className="menu-icon">
                          <i className="ki-duotone ki-package fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                          </i>
                        </span>
                        <span className="menu-title">Packages</span>
                      </a>
                    </div>

                    <div className="menu-item">
                      <a className={`menu-link ${router.pathname.startsWith('/admin/orders') ? 'active' : ''}`} href="/admin/orders">
                        <span className="menu-icon">
                          <i className="ki-duotone ki-basket fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                          </i>
                        </span>
                        <span className="menu-title">Orders</span>
                      </a>
                    </div>

                    <div className="menu-item">
                      <a className={`menu-link ${router.pathname.startsWith('/admin/coupons') ? 'active' : ''}`} href="/admin/coupons">
                        <span className="menu-icon">
                          <i className="ki-duotone ki-discount fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </span>
                        <span className="menu-title">Coupons</span>
                      </a>
                    </div>

                    <div className="menu-item">
                      <a className={`menu-link ${router.pathname.startsWith('/admin/settings') ? 'active' : ''}`} href="/admin/settings">
                        <span className="menu-icon">
                          <i className="ki-duotone ki-setting-2 fs-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </span>
                        <span className="menu-title">Settings</span>
                      </a>
                    </div>

                  </div>
                </div>
              </div>
              {/* End::Aside menu */}

              {/* Begin::Footer */}
              <div className="aside-footer flex-column-auto px-9" id="kt_aside_footer">
                {/* Begin::User panel */}
                <div className="d-flex flex-stack">
                  {/* Begin::Wrapper */}
                  <div className="d-flex align-items-center">
                    {/* Begin::Avatar */}
                    <div className="symbol symbol-circle symbol-40px">
                      <img src="/metronic/assets/media/avatars/300-1.jpg" alt="photo"/>
                    </div>
                    {/* End::Avatar */}
                    {/* Begin::User info */}
                    <div className="ms-2">
                      {/* Begin::Name */}
                      <a href="#" className="text-gray-800 text-hover-primary fs-6 fw-bold lh-1">
                        {adminInfo?.name || 'Admin'}
                      </a>
                      {/* End::Name */}
                      {/* Begin::Major */}
                      <span className="text-muted fw-semibold d-block fs-7 lh-1">Administrator</span>
                      {/* End::Major */}
                    </div>
                    {/* End::User info */}
                  </div>
                  {/* End::Wrapper */}
                  {/* Begin::User menu */}
                  <div className="ms-1">
                    <div className="btn btn-sm btn-icon btn-active-color-primary position-relative me-n2" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-overflow="true" data-kt-menu-placement="top-end">
                      <i className="ki-duotone ki-setting-2 fs-1">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </div>
                    {/* Begin::User account menu */}
                    <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px" data-kt-menu="true">
                      {/* Begin::Menu item */}
                      <div className="menu-item px-3">
                        <div className="menu-content d-flex align-items-center px-3">
                          {/* Begin::Avatar */}
                          <div className="symbol symbol-50px me-5">
                            <img alt="Logo" src="/metronic/assets/media/avatars/300-1.jpg" />
                          </div>
                          {/* End::Avatar */}
                          {/* Begin::Username */}
                          <div className="d-flex flex-column">
                            <div className="fw-bold d-flex align-items-center fs-5">
                              {adminInfo?.name || 'Administrator'}
                              <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">Admin</span>
                            </div>
                            <a href="#" className="fw-semibold text-muted text-hover-primary fs-7">
                              {adminInfo?.email || 'admin@undangandigital.com'}
                            </a>
                          </div>
                          {/* End::Username */}
                        </div>
                      </div>
                      {/* End::Menu item */}
                      
                      {/* Begin::Menu separator */}
                      <div className="separator my-2"></div>
                      {/* End::Menu separator */}
                      
                      {/* Begin::Menu item */}
                      <div className="menu-item px-5">
                        <a href="/admin/settings" className="menu-link px-5">My Profile</a>
                      </div>
                      {/* End::Menu item */}
                      
                      {/* Begin::Menu item */}
                      <div className="menu-item px-5 my-1">
                        <a href="/admin/settings" className="menu-link px-5">Account Settings</a>
                      </div>
                      {/* End::Menu item */}
                      
                      {/* Begin::Menu item */}
                      <div className="menu-item px-5">
                        <button 
                          onClick={handleLogout}
                          className="menu-link px-5 btn btn-link text-start p-0 w-100"
                        >
                          Sign Out
                        </button>
                      </div>
                      {/* End::Menu item */}
                    </div>
                    {/* End::User account menu */}
                  </div>
                  {/* End::User menu */}
                </div>
                {/* End::User panel */}
              </div>
              {/* End::Footer */}
            </div>
            {/* End::Aside */}

            {/* Begin::Wrapper */}
            <div className="wrapper d-flex flex-column flex-row-fluid" id="kt_wrapper">
              
              {/* Begin::Header */}
              <div
                id="kt_header"
                className="header mt-0 mt-lg-0 pt-lg-0"
                data-kt-sticky="true"
                data-kt-sticky-name="header"
                data-kt-sticky-offset="{lg: '300px'}"
              >
                {/* Begin::Container */}
                <div className="container d-flex flex-stack flex-wrap gap-4" id="kt_header_container">
                  
                  {/* Begin::Page title */}
                  <div
                    className="page-title d-flex flex-column align-items-start justify-content-center flex-wrap me-lg-2 pb-10 pb-lg-0"
                    data-kt-swapper="true"
                    data-kt-swapper-mode="prepend"
                    data-kt-swapper-parent="{default: '#kt_content_container', lg: '#kt_header_container'}"
                  >
                    {/* Begin::Heading */}
                    <h1 className="d-flex flex-column text-gray-900 fw-bold my-0 fs-1">
                      Hello, {adminInfo?.name || 'Admin'}
                      <small className="text-muted fs-6 fw-semibold pt-1">Welcome to your dashboard</small>
                    </h1>
                    {/* End::Heading */}
                  </div>
                  {/* End::Page title */}

                  {/* Begin::Wrapper */}
                  <div className="d-flex d-lg-none align-items-center ms-n3 me-2">
                    {/* Begin::Aside mobile toggle */}
                    <div className="btn btn-icon btn-active-icon-primary" id="kt_aside_toggle">
                      <i className="ki-duotone ki-abstract-14 fs-1 mt-1">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </div>
                    {/* End::Aside mobile toggle */}
                    {/* Begin::Logo */}
                    <a href="/admin" className="d-flex align-items-center">
                      <img alt="Logo" src="/metronic/assets/media/logos/demo3.svg" className="theme-light-show h-20px"/>
                      <img alt="Logo" src="/metronic/assets/media/logos/demo3-dark.svg" className="theme-dark-show h-20px"/>
                    </a>
                    {/* End::Logo */}
                  </div>
                  {/* End::Wrapper */}

                  {/* Begin::Topbar */}
                  <div className="d-flex align-items-center flex-shrink-0 mb-0 mb-lg-0">
                    {/* Begin::User menu */}
                    <div className="d-flex align-items-center ms-3 ms-lg-4" id="kt_header_user_menu_toggle">
                      {/* Begin::Menu wrapper */}
                      <div className="cursor-pointer symbol symbol-35px symbol-md-40px" data-kt-menu-trigger="click" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
                        <img src="/metronic/assets/media/avatars/300-1.jpg" alt="user" />
                      </div>
                      {/* End::Menu wrapper */}

                      {/* Begin::User account menu */}
                      <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px" data-kt-menu="true">
                        {/* Begin::Menu item */}
                        <div className="menu-item px-3">
                          <div className="menu-content d-flex align-items-center px-3">
                            {/* Begin::Avatar */}
                            <div className="symbol symbol-50px me-5">
                              <img alt="Logo" src="/metronic/assets/media/avatars/300-1.jpg"/>
                            </div>
                            {/* End::Avatar */}
                            {/* Begin::Username */}
                            <div className="d-flex flex-column">
                              <div className="fw-bold d-flex align-items-center fs-5">
                                {adminInfo?.name || 'Administrator'}
                                <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">Admin</span>
                              </div>
                              <a href="#" className="fw-semibold text-muted text-hover-primary fs-7">
                                {adminInfo?.email || 'admin@undangandigital.com'}
                              </a>
                            </div>
                            {/* End::Username */}
                          </div>
                        </div>
                        {/* End::Menu item */}
                        
                        {/* Begin::Menu separator */}
                        <div className="separator my-2"></div>
                        {/* End::Menu separator */}
                        
                        {/* Begin::Menu item */}
                        <div className="menu-item px-5">
                          <a href="/admin/settings" className="menu-link px-5">
                            My Profile
                          </a>
                        </div>
                        {/* End::Menu item */}
                        
                        {/* Begin::Menu item */}
                        <div className="menu-item px-5 my-1">
                          <a href="/admin/settings" className="menu-link px-5">
                            Account Settings
                          </a>
                        </div>
                        {/* End::Menu item */}
                        
                        {/* Begin::Menu item */}
                        <div className="menu-item px-5">
                          <button 
                            onClick={handleLogout}
                            className="menu-link px-5 btn btn-link text-start p-0 w-100"
                          >
                            Sign Out
                          </button>
                        </div>
                        {/* End::Menu item */}
                      </div>
                      {/* End::User account menu */}
                    </div>
                    {/* End::User menu */}
                  </div>
                  {/* End::Topbar */}

                </div>
                {/* End::Container */}
              </div>
              {/* End::Header */}

              {/* Begin::Content */}
              <div className="content d-flex flex-column flex-column-fluid" id="kt_content">
                {/* Begin::Container */}
                <div className="container-xxl" id="kt_content_container">
                  {children}
                </div>
                {/* End::Container */}
              </div>
              {/* End::Content */}

              {/* Begin::Footer */}
              <div className="footer py-4 d-flex flex-lg-column" id="kt_footer">
                {/* Begin::Container */}
                <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
                  {/* Begin::Copyright */}
                  <div className="text-gray-900 order-2 order-md-1">
                    <span className="text-muted fw-semibold me-1">{new Date().getFullYear()}&copy;</span>
                    <a href="/" target="_blank" className="text-gray-800 text-hover-primary">Digital Invitation</a>
                  </div>
                  {/* End::Copyright */}
                  {/* Begin::Menu */}
                  <ul className="menu menu-gray-600 menu-hover-primary fw-semibold order-1">
                    <li className="menu-item">
                      <a href="/" target="_blank" className="menu-link px-2">About</a>
                    </li>
                    <li className="menu-item">
                      <a href="/kontak" target="_blank" className="menu-link px-2">Support</a>
                    </li>
                  </ul>
                  {/* End::Menu */}
                </div>
                {/* End::Container */}
              </div>
              {/* End::Footer */}

            </div>
            {/* End::Wrapper */}

          </div>
          {/* End::Page */}
        </div>
        {/* End::Root */}
        {/* End::Main */}

        {/* Begin::Scrolltop */}
        <div id="kt_scrolltop" className="scrolltop" data-kt-scrolltop="true">
          <i className="ki-duotone ki-arrow-up">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
        </div>
        {/* End::Scrolltop */}

      </div>
    </>
  );
}
