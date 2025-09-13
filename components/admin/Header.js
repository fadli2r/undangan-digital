// components/admin/Header.js
import Topbar from "./Topbar";

export default function Header() {
  return (
    <div
      id="kt_header"
      className="header mt-0 mt-lg-0 pt-lg-0"
      data-kt-sticky="true"
      data-kt-sticky-name="header"
      data-kt-sticky-offset="{lg: '300px'}"
    >
      <div className="container d-flex flex-stack flex-wrap gap-4" id="kt_header_container">
        {/* Page Title */}
        <div
          className="page-title d-flex flex-column align-items-start justify-content-center flex-wrap me-lg-2 pb-10 pb-lg-0"
          data-kt-swapper="true"
          data-kt-swapper-mode="prepend"
          data-kt-swapper-parent="{default: '#kt_content_container', lg: '#kt_header_container'}"
        >
          <h1 className="d-flex flex-column text-gray-900 fw-bold my-0 fs-1">
            Hello, Paul
            <small className="text-muted fs-6 fw-semibold pt-1">You’ve got 24 New Sales</small>
          </h1>
        </div>

        {/* Mobile Aside Toggle + Logo (lg hidden) */}
        <div className="d-flex d-lg-none align-items-center ms-n3 me-2">
          <div className="btn btn-icon btn-active-icon-primary" id="kt_aside_toggle">
            <i className="ki-duotone ki-abstract-14 fs-1 mt-1" />
          </div>
          <a href="/admin/dashboard" className="d-flex align-items-center">
            <img alt="Logo" src="/metronic/media/logos/demo3.svg" className="theme-light-show h-20px" />
            <img alt="Logo" src="/metronic/media/logos/demo3-dark.svg" className="theme-dark-show h-20px" />
          </a>
        </div>

        {/* Topbar icons + theme mode */}
        <Topbar />
      </div>
    </div>
  );
}
