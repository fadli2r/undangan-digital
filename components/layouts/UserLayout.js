import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import { useSession, signOut } from 'next-auth/react';

export default function UserLayout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    // Initialize Metronic components after component mounts
    const initializeMetronic = () => {
      if (typeof window !== 'undefined') {
        const checkAndInit = () => {
          if (window.KTMenu) window.KTMenu.createInstances();
          if (window.KTDrawer) window.KTDrawer.createInstances();
          if (window.KTScroll) window.KTScroll.createInstances();
        };

        checkAndInit();
        setTimeout(checkAndInit, 1000);
        setTimeout(checkAndInit, 2000);
      }
    };

    if (status === 'authenticated') {
      initializeMetronic();
    }
  }, [status]);

  // ⛔️ Cek onboarding user
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!session) return;

      try {
        const res = await fetch('/api/user/check-onboarding');
        const data = await res.json();

        if (!data.onboardingCompleted && !router.pathname.startsWith('/onboarding')) {
  router.replace('/onboarding');
        } else {
          setCheckingOnboarding(false);
        }
      } catch (err) {
        console.error('Failed to check onboarding:', err);
        setCheckingOnboarding(false);
      }
    };

    if (status === 'authenticated') {
      checkOnboarding();
    } else if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [session, status, router]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false, callbackUrl: '/login' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state while checking session or onboarding
  if (status === 'loading' || checkingOnboarding) {
    return (
      <>
        <Head>
          <title>Dashboard - Digital Invitation</title>
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

  // ✅ Jika sudah lolos, tampilkan layout
  const userInfo = session?.user;
  return (
    <>
      <Head>
        <title>Dashboard - Digital Invitation</title>
        <meta name="description" content="User dashboard for managing digital invitations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Metronic CSS */}
        <link href="/metronic/assets/plugins/custom/fullcalendar/fullcalendar.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/plugins/custom/datatables/datatables.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
      </Head>

      {/* Metronic JavaScript */}
      <Script src="/metronic/assets/plugins/global/plugins.bundle.js" strategy="beforeInteractive" />
      <Script src="/metronic/assets/js/scripts.bundle.js" strategy="beforeInteractive" />
      <Script src="/metronic/assets/plugins/custom/fullcalendar/fullcalendar.bundle.js" strategy="lazyOnload" />
      <Script src="/metronic/assets/plugins/custom/datatables/datatables.bundle.js" strategy="lazyOnload" />

      {/* Initialize Metronic */}
      <Script id="metronic-init" strategy="afterInteractive">
        {`
          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
              if (typeof KTMenu !== 'undefined') {
                KTMenu.createInstances();
              }
              if (typeof KTDrawer !== 'undefined') {
                KTDrawer.createInstances();
              }
              if (typeof KTScroll !== 'undefined') {
                KTScroll.createInstances();
              }
              if (typeof KTSticky !== 'undefined') {
                KTSticky.createInstances();
              }
              if (typeof KTSwapper !== 'undefined') {
                KTSwapper.createInstances();
              }
              if (typeof KTThemeMode !== 'undefined') {
                KTThemeMode.init();
              }
            }, 500);
          });
        `}
      </Script>

      <div className="d-flex flex-column flex-root" id="kt_body">
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
              <a href="/dashboard">
                <img alt="Logo" src="/images/Dreamslogo.png" className="h-80px logo theme-light-show"/>
                <img alt="Logo" src="/images/Dreamslogo.png" className="h-80px logo theme-dark-show"/>
              </a>
              {/* End::Logo */}
            </div>
            {/* End::Brand */}

            {/* Begin::Aside menu */}
            <div className="aside-menu flex-column-fluid ps-5 pe-3 mb-9" id="kt_aside_menu">
              <div className="hover-scroll-overlay-y my-5 my-lg-5" id="kt_aside_menu_wrapper" data-kt-scroll="true" data-kt-scroll-activate="{default: false, lg: true}" data-kt-scroll-height="auto" data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer" data-kt-scroll-wrappers="#kt_aside_menu" data-kt-scroll-offset="0">
                <div className="menu menu-column menu-title-gray-800 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500" id="kt_aside_menu" data-kt-menu="true" data-kt-menu-expand="false">
                  
                  <div className="menu-item">
                    <a className={`menu-link ${router.pathname === '/dashboard' ? 'active' : ''}`} href="/dashboard">
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
                    <a className={`menu-link ${router.pathname.startsWith('/edit-undangan') ? 'active' : ''}`} href="/edit-undangan">
                      <span className="menu-icon">
                        <i className="ki-duotone ki-message-edit fs-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </span>
                      <span className="menu-title">Edit Undangan</span>
                    </a>
                  </div>

                  <div className="menu-item">
                    <a className={`menu-link ${router.pathname === '/paket' ? 'active' : ''}`} href="/paket">
                      <span className="menu-icon">
                        <i className="ki-duotone ki-package fs-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </span>
                      <span className="menu-title">Paket</span>
                    </a>
                  </div>

                  <div className="menu-item">
                    <a className={`menu-link ${router.pathname === '/support-center' ? 'active' : ''}`} href="/support-center">
                      <span className="menu-icon">
                        <i className="ki-duotone ki-support fs-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </span>
                      <span className="menu-title">Support Center</span>
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
                      {userInfo?.name || 'User'}
                    </a>
                    {/* End::Name */}
                    {/* Begin::Major */}
                    <span className="text-muted fw-semibold d-block fs-7 lh-1">Member</span>
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
                            {userInfo?.name || 'User'}
                            <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">Member</span>
                          </div>
                          <a href="#" className="fw-semibold text-muted text-hover-primary fs-7">
                            {userInfo?.email}
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
                      <a href="/profile" className="menu-link px-5">My Profile</a>
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
                    Hello, {userInfo?.name || 'User'}
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
                  <a href="/dashboard" className="d-flex align-items-center">
                    <img alt="Logo" src="/images/Dreamslogo.png" className="h-40px"/>
                  </a>
                  {/* End::Logo */}
                </div>
                {/* End::Wrapper */}

                {/* Begin::Topbar */}
                <div className="d-flex align-items-center flex-shrink-0 mb-0 mb-lg-0">
                  {/* Begin::Theme mode */}
                  <div className="d-flex align-items-center ms-3 ms-lg-4">
                    {/* Begin::Menu toggle */}
                    <a href="#" className="btn btn-icon btn-color-gray-700 btn-active-color-primary btn-outline w-40px h-40px" data-kt-menu-trigger="{default:'click', lg: 'hover'}" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
                      <i className="ki-duotone ki-night-day theme-light-show fs-1">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                        <span className="path4"></span>
                        <span className="path5"></span>
                        <span className="path6"></span>
                        <span className="path7"></span>
                        <span className="path8"></span>
                        <span className="path9"></span>
                        <span className="path10"></span>
                      </i>
                      <i className="ki-duotone ki-moon theme-dark-show fs-1">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </a>
                    {/* Begin::Menu toggle */}
                    {/* Begin::Menu */}
                    <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-500 menu-active-bg menu-state-color fw-semibold py-4 fs-base w-150px" data-kt-menu="true" data-kt-element="theme-mode-menu">
                      {/* Begin::Menu item */}
                      <div className="menu-item px-3 my-0">
                        <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="light">
                          <span className="menu-icon" data-kt-element="icon">
                            <i className="ki-duotone ki-night-day fs-2">
                              <span className="path1"></span>
                              <span className="path2"></span>
                              <span className="path3"></span>
                              <span className="path4"></span>
                              <span className="path5"></span>
                              <span className="path6"></span>
                              <span className="path7"></span>
                              <span className="path8"></span>
                              <span className="path9"></span>
                              <span className="path10"></span>
                            </i>
                          </span>
                          <span className="menu-title">Light</span>
                        </a>
                      </div>
                      {/* End::Menu item */}
                      {/* Begin::Menu item */}
                      <div className="menu-item px-3 my-0">
                        <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="dark">
                          <span className="menu-icon" data-kt-element="icon">
                            <i className="ki-duotone ki-moon fs-2">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                          </span>
                          <span className="menu-title">Dark</span>
                        </a>
                      </div>
                      {/* End::Menu item */}
                      {/* Begin::Menu item */}
                      <div className="menu-item px-3 my-0">
                        <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="system">
                          <span className="menu-icon" data-kt-element="icon">
                            <i className="ki-duotone ki-screen fs-2">
                              <span className="path1"></span>
                              <span className="path2"></span>
                              <span className="path3"></span>
                              <span className="path4"></span>
                            </i>
                          </span>
                          <span className="menu-title">System</span>
                        </a>
                      </div>
                      {/* End::Menu item */}
                    </div>
                    {/* End::Menu */}
                  </div>
                  {/* End::Theme mode */}

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
                              {userInfo?.name || 'User'}
                              <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">Member</span>
                            </div>
                            <a href="#" className="fw-semibold text-muted text-hover-primary fs-7">
                              {userInfo?.email}
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
                        <a href="/profile" className="menu-link px-5">
                          My Profile
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
