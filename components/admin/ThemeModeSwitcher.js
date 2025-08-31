// components/admin/ThemeModeSwitcher.js
export default function ThemeModeSwitcher() {
  return (
    <div className="d-flex align-items-center ms-3 ms-lg-4">
      <a
        href="#"
        className="btn btn-icon btn-color-gray-700 btn-active-color-primary btn-outline w-40px h-40px"
        data-kt-menu-trigger="{default:'click', lg: 'hover'}"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-end"
      >
        <i className="ki-duotone ki-night-day theme-light-show fs-1"><span className="path1"/><span className="path2"/><span className="path3"/><span className="path4"/><span className="path5"/><span className="path6"/><span className="path7"/><span className="path8"/><span className="path9"/><span className="path10"/></i>
        <i className="ki-duotone ki-moon theme-dark-show fs-1"><span className="path1"/><span className="path2"/></i>
      </a>

      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-500 menu-active-bg menu-state-color fw-semibold py-4 fs-base w-150px"
        data-kt-menu="true"
        data-kt-element="theme-mode-menu"
      >
        <div className="menu-item px-3 my-0">
          <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="light">
            <span className="menu-icon" data-kt-element="icon"><i className="ki-duotone ki-night-day fs-2"></i></span>
            <span className="menu-title">Light</span>
          </a>
        </div>
        <div className="menu-item px-3 my-0">
          <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="dark">
            <span className="menu-icon" data-kt-element="icon"><i className="ki-duotone ki-moon fs-2"></i></span>
            <span className="menu-title">Dark</span>
          </a>
        </div>
        <div className="menu-item px-3 my-0">
          <a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="system">
            <span className="menu-icon" data-kt-element="icon"><i className="ki-duotone ki-screen fs-2"></i></span>
            <span className="menu-title">System</span>
          </a>
        </div>
      </div>
    </div>
  );
}
