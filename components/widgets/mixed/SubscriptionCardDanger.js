export default function SubscriptionCardDanger() {
  return (
    <div className="card card-xl-stretch mb-xl-8">
      <div className="card-body">
        <div className="d-flex flex-stack">
          <div className="d-flex align-items-center">
            <div className="symbol symbol-60px me-5">
              <span className="symbol-label bg-danger-light">
                <img src="/metronic/assets/media/svg/brand-logos/plurk.svg" className="h-50 align-self-center" alt="" />
              </span>
            </div>
            <div className="d-flex flex-column flex-grow-1 my-lg-0 my-2 pr-3">
              <a href="#" className="text-gray-900 fw-bold text-hover-primary fs-5">Monthly Subscription</a>
              <span className="text-muted fw-bold">Due: 27 Apr 2020</span>
            </div>
          </div>
          <div className="ms-1">
            <button type="button" className="btn btn-sm btn-icon btn-color-primary btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
              <i className="ki-duotone ki-category fs-6"><span className="path1" /><span className="path2" /><span className="path3" /><span className="path4" /></i>
            </button>
            <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-200px" data-kt-menu="true">
              <div className="menu-item px-3"><div className="menu-content fs-6 text-gray-900 fw-bold px-3 py-4">Quick Actions</div></div>
              <div className="separator mb-3 opacity-75" />
              <div className="menu-item px-3"><a href="#" className="menu-link px-3">New Ticket</a></div>
              <div className="menu-item px-3"><a href="#" className="menu-link px-3">New Customer</a></div>
              <div className="menu-item px-3" data-kt-menu-trigger="hover" data-kt-menu-placement="right-start">
                <a href="#" className="menu-link px-3"><span className="menu-title">New Group</span><span className="menu-arrow" /></a>
                <div className="menu-sub menu-sub-dropdown w-175px py-4">
                  <div className="menu-item px-3"><a href="#" className="menu-link px-3">Admin Group</a></div>
                  <div className="menu-item px-3"><a href="#" className="menu-link px-3">Staff Group</a></div>
                  <div className="menu-item px-3"><a href="#" className="menu-link px-3">Member Group</a></div>
                </div>
              </div>
              <div className="menu-item px-3"><a href="#" className="menu-link px-3">New Contact</a></div>
              <div className="separator mt-3 opacity-75" />
              <div className="menu-item px-3"><div className="menu-content px-3 py-3"><a className="btn btn-primary btn-sm px-4" href="#">Generate Reports</a></div></div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column w-100 mt-12">
          <span className="text-gray-900 me-2 fw-bold pb-3">Progress</span>
          <div className="progress h-5px w-100">
            <div className="progress-bar bg-danger" role="progressbar" style={{ width: '75%' }} aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" />
          </div>
        </div>

        <div className="d-flex flex-column mt-10">
          <div className="text-gray-900 me-2 fw-bold pb-4">Team</div>
          <div className="d-flex">
            <a href="#" className="symbol symbol-35px me-2" data-bs-toggle="tooltip" title="Ana Stone">
              <img src="/metronic/assets/media/avatars/300-6.jpg" alt="" />
            </a>
            <a href="#" className="symbol symbol-35px me-2" data-bs-toggle="tooltip" title="Mark Larson">
              <img src="/metronic/assets/media/avatars/300-5.jpg" alt="" />
            </a>
            <a href="#" className="symbol symbol-35px me-2" data-bs-toggle="tooltip" title="Sam Harris">
              <img src="/metronic/assets/media/avatars/300-9.jpg" alt="" />
            </a>
            <a href="#" className="symbol symbol-35px" data-bs-toggle="tooltip" title="Alice Micto">
              <img src="/metronic/assets/media/avatars/300-10.jpg" alt="" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
