export default function SalesProgressPrimary() {
  return (
    <div className="card card-xl-stretch mb-5 mb-xl-8">
      <div className="card-header border-0 bg-primary py-5">
        <h3 className="card-title fw-bold text-white">Sales Progress</h3>
        <div className="card-toolbar">
          <button type="button" className="btn btn-sm btn-icon btn-color-white btn-active-white btn-active-color- border-0 me-n3" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
            <i className="ki-duotone ki-category fs-6"><span className="path1" /><span className="path2" /><span className="path3" /><span className="path4" /></i>
          </button>
          {/* menu sama */}
          <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-200px py-3" data-kt-menu="true">
            <div className="menu-item px-3"><div className="menu-content text-muted pb-2 px-3 fs-7 text-uppercase">Payments</div></div>
            <div className="menu-item px-3"><a href="#" className="menu-link px-3">Create Invoice</a></div>
            <div className="menu-item px-3">
              <a href="#" className="menu-link flex-stack px-3">Create Payment
                <span className="ms-2" data-bs-toggle="tooltip" title="Specify a target name for future usage and reference">
                  <i className="ki-duotone ki-information fs-6"><span className="path1" /><span className="path2" /><span className="path3" /></i>
                </span>
              </a>
            </div>
            <div className="menu-item px-3"><a href="#" className="menu-link px-3">Generate Bill</a></div>
            <div className="menu-item px-3" data-kt-menu-trigger="hover" data-kt-menu-placement="right-end">
              <a href="#" className="menu-link px-3"><span className="menu-title">Subscription</span><span className="menu-arrow" /></a>
              <div className="menu-sub menu-sub-dropdown w-175px py-4">
                <div className="menu-item px-3"><a href="#" className="menu-link px-3">Plans</a></div>
                <div className="menu-item px-3"><a href="#" className="menu-link px-3">Billing</a></div>
                <div className="menu-item px-3"><a href="#" className="menu-link px-3">Statements</a></div>
                <div className="separator my-2" />
                <div className="menu-item px-3">
                  <div className="menu-content px-3">
                    <label className="form-check form-switch form-check-custom form-check-solid">
                      <input className="form-check-input w-30px h-20px" type="checkbox" defaultChecked />
                      <span className="form-check-label text-muted fs-6">Recuring</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="menu-item px-3 my-1"><a href="#" className="menu-link px-3">Settings</a></div>
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="mixed-widget-12-chart card-rounded-bottom bg-primary" data-kt-color="primary" style={{ height: 250 }} />
        <div className="card-rounded bg-body mt-n10 position-relative card-px py-15">
          <div className="row g-0 mb-7">
            <div className="col mx-5"><div className="fs-6 text-gray-500">Avarage Sale</div><div className="fs-2 fw-bold text-gray-800">$650</div></div>
            <div className="col mx-5"><div className="fs-6 text-gray-500">Comissions</div><div className="fs-2 fw-bold text-gray-800">$29,500</div></div>
          </div>
          <div className="row g-0">
            <div className="col mx-5"><div className="fs-6 text-gray-500">Revenue</div><div className="fs-2 fw-bold text-gray-800">$55,000</div></div>
            <div className="col mx-5"><div className="fs-6 text-gray-500">Expenses</div><div className="fs-2 fw-bold text-gray-800">$1,130,600</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
