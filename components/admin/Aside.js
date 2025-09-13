// components/admin/Aside.js
export default function Aside() {
  return (
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
      {/* Brand */}
      <div className="aside-logo flex-column-auto px-9 mb-9" id="kt_aside_logo">
        <a href="/admin/dashboard">
          <img alt="Logo" src="/metronic/media/logos/demo3.svg" className="h-20px logo theme-light-show" />
          <img alt="Logo" src="/metronic/media/logos/demo3-dark.svg" className="h-20px logo theme-dark-show" />
        </a>
      </div>

      {/* Aside menu */}
      <div className="aside-menu flex-column-fluid ps-5 pe-3 mb-9" id="kt_aside_menu">
        <div
          className="w-100 hover-scroll-overlay-y d-flex pe-3"
          id="kt_aside_menu_wrapper"
          data-kt-scroll="true"
          data-kt-scroll-activate="{default: false, lg: true}"
          data-kt-scroll-height="auto"
          data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
          data-kt-scroll-wrappers="#kt_aside, #kt_aside_menu, #kt_aside_menu_wrapper"
          data-kt-scroll-offset="100"
        >
          {/* Menu root */}
          <div
            className="menu menu-column menu-rounded menu-sub-indention menu-active-bg fw-semibold my-auto"
            id="#kt_aside_menu"
            data-kt-menu="true"
          >
            {/* Dashboards */}
            <div data-kt-menu-trigger="click" className="menu-item here show menu-accordion">
              <span className="menu-link">
                <span className="menu-icon">
                  <i className="ki-duotone ki-black-right fs-2" />
                </span>
                <span className="menu-title">Dashboards</span>
                <span className="menu-arrow" />
              </span>
              <div className="menu-sub menu-sub-accordion">
                {[
                  { href: "/admin/dashboard", title: "Default", active: true },
                  { href: "/admin/dashboards/ecommerce", title: "eCommerce" },
                  { href: "/admin/dashboards/projects", title: "Projects" },
                  { href: "/admin/dashboards/online-courses", title: "Online Courses" },
                  { href: "/admin/dashboards/marketing", title: "Marketing" },
                ].map((m) => (
                  <div className="menu-item" key={m.title}>
                    <a className={`menu-link ${m.active ? "active" : ""}`} href={m.href}>
                      <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                      <span className="menu-title">{m.title}</span>
                    </a>
                  </div>
                ))}

                {/* Collapsible "Show 12 More" */}
                <div className="menu-inner flex-column collapse" id="kt_app_sidebar_menu_dashboards_collapse">
                  {[
                    ["Bidding", "/admin/dashboards/bidding"],
                    ["POS System", "/admin/dashboards/pos"],
                    ["Call Center", "/admin/dashboards/call-center"],
                    ["Logistics", "/admin/dashboards/logistics"],
                    ["Website Analytics", "/admin/dashboards/website-analytics"],
                    ["Finance Performance", "/admin/dashboards/finance-performance"],
                    ["Store Analytics", "/admin/dashboards/store-analytics"],
                    ["Social", "/admin/dashboards/social"],
                    ["Delivery", "/admin/dashboards/delivery"],
                    ["Crypto", "/admin/dashboards/crypto"],
                    ["School", "/admin/dashboards/school"],
                    ["Podcast", "/admin/dashboards/podcast"],
                    ["Landing", "/admin/landing"],
                  ].map(([title, href]) => (
                    <div className="menu-item" key={title}>
                      <a className="menu-link" href={href}>
                        <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                        <span className="menu-title">{title}</span>
                      </a>
                    </div>
                  ))}
                </div>

                <div className="menu-item">
                  <div className="menu-content">
                    <a
                      className="btn btn-flex btn-color-primary d-flex flex-stack fs-base p-0 ms-2 mb-2 toggle collapsible collapsed"
                      data-bs-toggle="collapse"
                      href="#kt_app_sidebar_menu_dashboards_collapse"
                      data-kt-toggle-text="Show Less"
                    >
                      <span data-kt-toggle-text-target="true">Show 12 More</span>
                      <i className="ki-duotone ki-minus-square toggle-on fs-2 me-0" />
                      <i className="ki-duotone ki-plus-square toggle-off fs-2 me-0" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Pages (User Profile, Account, Authentication, …) */}
            <div data-kt-menu-trigger="click" className="menu-item menu-accordion">
              <span className="menu-link">
                <span className="menu-icon"><i className="ki-duotone ki-black-right fs-2" /></span>
                <span className="menu-title">Pages</span>
                <span className="menu-arrow" />
              </span>
              <div className="menu-sub menu-sub-accordion">
                {/* User Profile */}
                <div data-kt-menu-trigger="click" className="menu-item menu-accordion">
                  <span className="menu-link">
                    <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                    <span className="menu-title">User Profile</span>
                    <span className="menu-arrow" />
                  </span>
                  <div className="menu-sub menu-sub-accordion">
                    {[
                      ["Overview", "/admin/pages/user-profile/overview"],
                      ["Projects", "/admin/pages/user-profile/projects"],
                      ["Campaigns", "/admin/pages/user-profile/campaigns"],
                      ["Documents", "/admin/pages/user-profile/documents"],
                      ["Followers", "/admin/pages/user-profile/followers"],
                      ["Activity", "/admin/pages/user-profile/activity"],
                    ].map(([title, href]) => (
                      <div className="menu-item" key={title}>
                        <a className="menu-link" href={href}>
                          <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                          <span className="menu-title">{title}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account */}
                <div data-kt-menu-trigger="click" className="menu-item menu-accordion">
                  <span className="menu-link">
                    <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                    <span className="menu-title">Account</span>
                    <span className="menu-arrow" />
                  </span>
                  <div className="menu-sub menu-sub-accordion">
                    {[
                      ["Overview", "/admin/account/overview"],
                      ["Settings", "/admin/account/settings"],
                      ["Security", "/admin/account/security"],
                      ["Activity", "/admin/account/activity"],
                      ["Billing", "/admin/account/billing"],
                      ["Statements", "/admin/account/statements"],
                      ["Referrals", "/admin/account/referrals"],
                      ["API Keys", "/admin/account/api-keys"],
                      ["Logs", "/admin/account/logs"],
                    ].map(([title, href]) => (
                      <div className="menu-item" key={title}>
                        <a className="menu-link" href={href}>
                          <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                          <span className="menu-title">{title}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Authentication (Corporate/Overlay/Creative/Fancy + Email Templates + General) */}
                {/* ——— Corporate */}
                <div data-kt-menu-trigger="click" className="menu-item menu-accordion">
                  <span className="menu-link">
                    <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                    <span className="menu-title">Authentication</span>
                    <span className="menu-arrow" />
                  </span>
                  <div className="menu-sub menu-sub-accordion">
                    {[
                      {
                        section: "Corporate Layout",
                        links: [
                          ["Sign-in", "/admin/authentication/layouts/corporate/sign-in"],
                          ["Sign-up", "/admin/authentication/layouts/corporate/sign-up"],
                          ["Two-Factor", "/admin/authentication/layouts/corporate/two-factor"],
                          ["Reset Password", "/admin/authentication/layouts/corporate/reset-password"],
                          ["New Password", "/admin/authentication/layouts/corporate/new-password"],
                        ],
                      },
                      {
                        section: "Overlay Layout",
                        links: [
                          ["Sign-in", "/admin/authentication/layouts/overlay/sign-in"],
                          ["Sign-up", "/admin/authentication/layouts/overlay/sign-up"],
                          ["Two-Factor", "/admin/authentication/layouts/overlay/two-factor"],
                          ["Reset Password", "/admin/authentication/layouts/overlay/reset-password"],
                          ["New Password", "/admin/authentication/layouts/overlay/new-password"],
                        ],
                      },
                      {
                        section: "Creative Layout",
                        links: [
                          ["Sign-in", "/admin/authentication/layouts/creative/sign-in"],
                          ["Sign-up", "/admin/authentication/layouts/creative/sign-up"],
                          ["Two-Factor", "/admin/authentication/layouts/creative/two-factor"],
                          ["Reset Password", "/admin/authentication/layouts/creative/reset-password"],
                          ["New Password", "/admin/authentication/layouts/creative/new-password"],
                        ],
                      },
                      {
                        section: "Fancy Layout",
                        links: [
                          ["Sign-in", "/admin/authentication/layouts/fancy/sign-in"],
                          ["Sign-up", "/admin/authentication/layouts/fancy/sign-up"],
                          ["Two-Factor", "/admin/authentication/layouts/fancy/two-factor"],
                          ["Reset Password", "/admin/authentication/layouts/fancy/reset-password"],
                          ["New Password", "/admin/authentication/layouts/fancy/new-password"],
                        ],
                      },
                      {
                        section: "Email Templates",
                        links: [
                          ["Welcome Message", "/admin/authentication/email/welcome-message"],
                          ["Reset Password", "/admin/authentication/email/reset-password"],
                          ["Subscription Confirmed", "/admin/authentication/email/subscription-confirmed"],
                          ["Credit Card Declined", "/admin/authentication/email/card-declined"],
                          ["Promo 1", "/admin/authentication/email/promo-1"],
                          ["Promo 2", "/admin/authentication/email/promo-2"],
                          ["Promo 3", "/admin/authentication/email/promo-3"],
                        ],
                      },
                    ].map(({ section, links }) => (
                      <div data-kt-menu-trigger="click" className="menu-item menu-accordion" key={section}>
                        <span className="menu-link">
                          <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                          <span className="menu-title">{section}</span>
                          <span className="menu-arrow" />
                        </span>
                        <div className="menu-sub menu-sub-accordion menu-active-bg">
                          {links.map(([title, href]) => (
                            <div className="menu-item" key={title}>
                              <a className="menu-link" href={href}>
                                <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                                <span className="menu-title">{title}</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* General pages under Authentication */}
                    {[
                      ["Multi-steps Sign-up", "/admin/authentication/extended/multi-steps-sign-up"],
                      ["Welcome Message", "/admin/authentication/general/welcome"],
                      ["Verify Email", "/admin/authentication/general/verify-email"],
                      ["Coming Soon", "/admin/authentication/general/coming-soon"],
                      ["Password Confirmation", "/admin/authentication/general/password-confirmation"],
                      ["Account Deactivation", "/admin/authentication/general/account-deactivated"],
                      ["Error 404", "/admin/authentication/general/error-404"],
                      ["Error 500", "/admin/authentication/general/error-500"],
                    ].map(([title, href]) => (
                      <div className="menu-item" key={title}>
                        <a className="menu-link" href={href}>
                          <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                          <span className="menu-title">{title}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corporate */}
                <div data-kt-menu-trigger="click" className="menu-item menu-accordion">
                  <span className="menu-link">
                    <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                    <span className="menu-title">Corporate</span>
                    <span className="menu-arrow" />
                  </span>
                  <div className="menu-sub menu-sub-accordion">
                    {[
                      ["About", "/admin/pages/about"],
                      ["Our Team", "/admin/pages/team"],
                      ["Contact Us", "/admin/pages/contact"],
                      ["Licenses", "/admin/pages/licenses"],
                      ["Sitemap", "/admin/pages/sitemap"],
                    ].map(([title, href]) => (
                      <div className="menu-item" key={title}>
                        <a className="menu-link" href={href}>
                          <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                          <span className="menu-title">{title}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social */}
                <div data-kt-menu-trigger="click" className="menu-item menu-accordion">
                  <span className="menu-link">
                    <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                    <span className="menu-title">Social</span>
                    <span className="menu-arrow" />
                  </span>
                  <div className="menu-sub menu-sub-accordion">
                    {[
                      ["Feeds", "/admin/pages/social/feeds"],
                      ["Activty", "/admin/pages/social/activity"],
                      ["Followers", "/admin/pages/social/followers"],
                      ["Settings", "/admin/pages/social/settings"],
                    ].map(([title, href]) => (
                      <div className="menu-item" key={title}>
                        <a className="menu-link" href={href}>
                          <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                          <span className="menu-title">{title}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blog */}
                <div data-kt-menu-trigger="click" className="menu-item menu-accordion">
                  <span className="menu-link">
                    <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                    <span className="menu-title">Blog</span>
                    <span className="menu-arrow" />
                  </span>
                  <div className="menu-sub menu-sub-accordion menu-active-bg">
                    {[
                      ["Blog Home", "/admin/pages/blog/home"],
                      ["Blog Post", "/admin/pages/blog/post"],
                    ].map(([title, href]) => (
                      <div className="menu-item" key={title}>
                        <a className="menu-link" href={href}>
                          <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                          <span className="menu-title">{title}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ */}
                <div data-kt-menu-trigger="click" className="menu-item menu-accordion">
                  <span className="menu-link">
                    <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                    <span className="menu-title">FAQ</span>
                    <span className="menu-arrow" />
                  </span>
                  <div className="menu-sub menu-sub-accordion menu-active-bg">
                    {[
                      ["FAQ Classic", "/admin/pages/faq/classic"],
                      ["FAQ Extended", "/admin/pages/faq/extended"],
                    ].map(([title, href]) => (
                      <div className="menu-item" key={title}>
                        <a className="menu-link" href={href}>
                          <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                          <span className="menu-title">{title}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div data-kt-menu-trigger="click" className="menu-item menu-accordion">
                  <span className="menu-link">
                    <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                    <span className="menu-title">Pricing</span>
                    <span className="menu-arrow" />
                  </span>
                  <div className="menu-sub menu-sub-accordion menu-active-bg">
                    {[
                      ["Column Pricing", "/admin/pages/pricing"],
                      ["Table Pricing", "/admin/pages/pricing/table"],
                    ].map(([title, href]) => (
                      <div className="menu-item" key={title}>
                        <a className="menu-link" href={href}>
                          <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                          <span className="menu-title">{title}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Careers */}
                <div data-kt-menu-trigger="click" className="menu-item menu-accordion">
                  <span className="menu-link">
                    <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                    <span className="menu-title">Careers</span>
                    <span className="menu-arrow" />
                  </span>
                  <div className="menu-sub menu-sub-accordion">
                    {[
                      ["Careers List", "/admin/pages/careers/list"],
                      ["Careers Apply", "/admin/pages/careers/apply"],
                    ].map(([title, href]) => (
                      <div className="menu-item" key={title}>
                        <a className="menu-link" href={href}>
                          <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                          <span className="menu-title">{title}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Widgets */}
                <div data-kt-menu-trigger="click" className="menu-item menu-accordion">
                  <span className="menu-link">
                    <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                    <span className="menu-title">Widgets</span>
                    <span className="menu-arrow" />
                  </span>
                  <div className="menu-sub menu-sub-accordion">
                    {[
                      ["Lists", "/admin/widgets/lists"],
                      ["Statistics", "/admin/widgets/statistics"],
                      ["Charts", "/admin/widgets/charts"],
                      ["Mixed", "/admin/widgets/mixed"],
                      ["Tables", "/admin/widgets/tables"],
                      ["Feeds", "/admin/widgets/feeds"],
                    ].map(([title, href]) => (
                      <div className="menu-item" key={title}>
                        <a className="menu-link" href={href}>
                          <span className="menu-bullet"><span className="bullet bullet-dot" /></span>
                          <span className="menu-title">{title}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* /Pages */}
          </div>
          {/* /Menu root */}
        </div>
      </div>

      {/* Aside footer with user panel */}
      <div className="aside-footer flex-column-auto px-9" id="kt_aside_footer">
        <div className="d-flex flex-stack">
          <div className="d-flex align-items-center">
            <div className="symbol symbol-circle symbol-40px">
              <img src="/metronic/media/avatars/300-1.jpg" alt="photo" />
            </div>
            <div className="ms-2">
              <a href="#" className="text-gray-800 text-hover-primary fs-6 fw-bold lh-1">Paul Melone</a>
              <span className="text-muted fw-semibold d-block fs-7 lh-1">Python Dev</span>
            </div>
          </div>

          <div className="ms-1">
            <div
              className="btn btn-sm btn-icon btn-active-color-primary position-relative me-n2"
              data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
              data-kt-menu-overflow="true"
              data-kt-menu-placement="top-end"
            >
              <i className="ki-duotone ki-setting-2 fs-1" />
            </div>

            {/* User account dropdown */}
            <div
              className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px"
              data-kt-menu="true"
            >
              <div className="menu-item px-3">
                <div className="menu-content d-flex align-items-center px-3">
                  <div className="symbol symbol-50px me-5">
                    <img alt="Logo" src="/metronic/media/avatars/300-1.jpg" />
                  </div>
                  <div className="d-flex flex-column">
                    <div className="fw-bold d-flex align-items-center fs-5">
                      Max Smith <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">Pro</span>
                    </div>
                    <a href="#" className="fw-semibold text-muted text-hover-primary fs-7">max@kt.com</a>
                  </div>
                </div>
              </div>

              <div className="separator my-2"></div>

              <div className="menu-item px-5"><a href="/admin/account/overview" className="menu-link px-5">My Profile</a></div>
              <div className="menu-item px-5">
                <a href="/admin/apps/projects/list" className="menu-link px-5">
                  <span className="menu-text">My Projects</span>
                  <span className="menu-badge"><span className="badge badge-light-danger badge-circle fw-bold fs-7">3</span></span>
                </a>
              </div>

              <div
                className="menu-item px-5"
                data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                data-kt-menu-placement="right-end"
                data-kt-menu-offset="-15px, 0"
              >
                <a href="#" className="menu-link px-5">
                  <span className="menu-title">My Subscription</span><span className="menu-arrow" />
                </a>
                <div className="menu-sub menu-sub-dropdown w-175px py-4">
                  <div className="menu-item px-3"><a href="/admin/account/referrals" className="menu-link px-5">Referrals</a></div>
                  <div className="menu-item px-3"><a href="/admin/account/billing" className="menu-link px-5">Billing</a></div>
                  <div className="menu-item px-3"><a href="/admin/account/statements" className="menu-link px-5">Payments</a></div>
                  <div className="menu-item px-3">
                    <a href="/admin/account/statements" className="menu-link d-flex flex-stack px-5">
                      Statements
                      <span className="ms-2 lh-0" data-bs-toggle="tooltip" title="View your statements">
                        <i className="ki-duotone ki-information-5 fs-5" />
                      </span>
                    </a>
                  </div>
                  <div className="separator my-2"></div>
                  <div className="menu-item px-3">
                    <div className="menu-content px-3">
                      <label className="form-check form-switch form-check-custom form-check-solid">
                        <input className="form-check-input w-30px h-20px" type="checkbox" defaultChecked name="notifications" />
                        <span className="form-check-label text-muted fs-7">Notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="menu-item px-5"><a href="/admin/account/statements" className="menu-link px-5">My Statements</a></div>

              <div className="separator my-2"></div>

              <div
                className="menu-item px-5"
                data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
                data-kt-menu-placement="right-end"
                data-kt-menu-offset="-15px, 0"
              >
                <a href="#" className="menu-link px-5">
                  <span className="menu-title position-relative">
                    Language
                    <span className="fs-8 rounded bg-light px-3 py-2 position-absolute translate-middle-y top-50 end-0">
                      English <img className="w-15px h-15px rounded-1 ms-2" src="/metronic/media/flags/united-states.svg" alt="" />
                    </span>
                  </span>
                </a>
                <div className="menu-sub menu-sub-dropdown w-175px py-4">
                  {[
                    ["English", "united-states"],
                    ["Spanish", "spain"],
                    ["German", "germany"],
                    ["Japanese", "japan"],
                    ["French", "france"],
                  ].map(([lang, flag]) => (
                    <div className="menu-item px-3" key={lang}>
                      <a href="/admin/account/settings" className={`menu-link d-flex px-5 ${lang === "English" ? "active" : ""}`}>
                        <span className="symbol symbol-20px me-4">
                          <img className="rounded-1" src={`/metronic/media/flags/${flag}.svg`} alt="" />
                        </span>
                        {lang}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="menu-item px-5 my-1"><a href="/admin/account/settings" className="menu-link px-5">Account Settings</a></div>
              <div className="menu-item px-5"><a href="/admin/authentication/layouts/corporate/sign-in" className="menu-link px-5">Sign Out</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
