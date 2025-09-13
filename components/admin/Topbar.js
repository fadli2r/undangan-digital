// components/admin/Topbar.js
export default function Topbar() {
  const setTheme = (mode) => {
    localStorage.setItem("data-bs-theme", mode);
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-bs-theme", prefersDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-bs-theme", mode);
    }
  };

  return (
    <div className="d-flex align-items-center flex-shrink-0 mb-0 mb-lg-0">
      {/* Activities */}
      <div className="d-flex align-items-center ms-3 ms-lg-4">
        <div className="btn btn-icon btn-color-gray-700 btn-active-color-primary btn-outline w-40px h-40px" id="kt_activities_toggle">
          <i className="ki-duotone ki-notification-bing fs-1" />
        </div>
      </div>

      {/* Chat */}
      <div className="d-flex align-items-center ms-3 ms-lg-4">
        <div className="btn btn-icon btn-color-gray-700 btn-active-color-primary btn-outline w-40px h-40px position-relative" id="kt_drawer_chat_toggle">
          <i className="ki-duotone ki-message-text-2 fs-1" />
          <span className="bullet bullet-dot bg-success h-6px w-6px position-absolute translate-middle top-0 start-50 animation-blink" />
        </div>
      </div>

      {/* Theme mode */}
      <div className="d-flex align-items-center ms-3 ms-lg-4">
        <a
          href="#"
          className="btn btn-icon btn-color-gray-700 btn-active-color-primary btn-outline w-40px h-40px"
          data-kt-menu-trigger="{default:'click', lg: 'hover'}"
          data-kt-menu-attach="parent"
          data-kt-menu-placement="bottom-end"
          onClick={(e) => e.preventDefault()}
        >
          <i className="ki-duotone ki-night-day theme-light-show fs-1" />
          <i className="ki-duotone ki-moon theme-dark-show fs-1" />
        </a>

        {/* Dropdown */}
        <div
          className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-500 menu-active-bg menu-state-color fw-semibold py-4 fs-base w-150px"
          data-kt-menu="true"
          data-kt-element="theme-mode-menu"
        >
          {[
            { v: "light", icon: "ki-duotone ki-night-day", label: "Light" },
            { v: "dark", icon: "ki-duotone ki-moon", label: "Dark" },
            { v: "system", icon: "ki-duotone ki-screen", label: "System" },
          ].map((opt) => (
            <div className="menu-item px-3 my-0" key={opt.v}>
              <a
                href="#"
                className="menu-link px-3 py-2"
                data-kt-element="mode"
                data-kt-value={opt.v}
                onClick={(e) => { e.preventDefault(); setTheme(opt.v); }}
              >
                <span className="menu-icon" data-kt-element="icon"><i className={`${opt.icon} fs-2`} /></span>
                <span className="menu-title">{opt.label}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar toggler (xxl only) */}
      <div className="d-flex align-items-center d-xxl-none ms-3 ms-lg-4">
        <div className="btn btn-icon btn-color-gray-700 btn-active-color-primary btn-outline w-40px h-40px position-relative" id="kt_sidebar_toggler">
          <i className="ki-duotone ki-burger-menu-2 fs-1" />
        </div>
      </div>
    </div>
  );
}
