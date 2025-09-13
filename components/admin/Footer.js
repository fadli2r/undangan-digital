// components/admin/Footer.js
export default function Footer() {
  return (
    <div className="footer py-4 d-flex flex-lg-column" id="kt_footer">
      <div className="container d-flex flex-column flex-md-row flex-stack">
        <div className="text-gray-900 order-2 order-md-1">
          <span className="text-gray-500 fw-semibold me-1">Created by</span>
          <a href="https://keenthemes.com" target="_blank" rel="noreferrer" className="text-muted text-hover-primary fw-semibold me-2 fs-6">
            Keenthemes
          </a>
        </div>
        <ul className="menu menu-gray-600 menu-hover-primary fw-semibold order-1">
          <li className="menu-item"><a href="https://keenthemes.com" target="_blank" rel="noreferrer" className="menu-link px-2">About</a></li>
          <li className="menu-item"><a href="https://devs.keenthemes.com" target="_blank" rel="noreferrer" className="menu-link px-2">Support</a></li>
          <li className="menu-item">
            <a
              href="https://themeforest.net/item/metronic-responsive-admin-dashboard-template/4021469"
              target="_blank" rel="noreferrer" className="menu-link px-2"
            >
              Purchase
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
