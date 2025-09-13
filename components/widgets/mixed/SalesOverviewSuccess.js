export default function SalesOverviewSuccess() {
  return (
    <div className="card card-xl-stretch mb-5 mb-xl-8">
      <div className="card-header border-0 py-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">Sales Overview</span>
          <span className="text-muted fw-semibold fs-7">Recent sales statistics</span>
        </h3>
        <div className="card-toolbar">
          <button type="button" className="btn btn-sm btn-icon btn-color-primary btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
            <i className="ki-duotone ki-category fs-6"><span className="path1" /><span className="path2" /><span className="path3" /><span className="path4" /></i>
          </button>
          <div className="menu menu-sub menu-sub-dropdown w-250px w-md-300px" data-kt-menu="true" id="kt_menu_sales_overview_success">
            <div className="px-7 py-5"><div className="fs-5 text-gray-900 fw-bold">Filter Options</div></div>
            <div className="separator border-gray-200" />
            <div className="px-7 py-5">
              {/* sama seperti Primary */}
              <div className="mb-10">
                <label className="form-label fw-semibold">Status:</label>
                <div>
                  <select className="form-select form-select-solid" multiple data-kt-select2="true" data-close-on-select="false" data-placeholder="Select option" data-dropdown-parent="#kt_menu_sales_overview_success" data-allow-clear="true">
                    <option /><option value="1">Approved</option><option value="2">Pending</option><option value="3">In Process</option><option value="4">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="mb-10">
                <label className="form-label fw-semibold">Member Type:</label>
                <div className="d-flex">
                  <label className="form-check form-check-sm form-check-custom form-check-solid me-5">
                    <input className="form-check-input" type="checkbox" value="1" />
                    <span className="form-check-label">Author</span>
                  </label>
                  <label className="form-check form-check-sm form-check-custom form-check-solid">
                    <input className="form-check-input" type="checkbox" value="2" defaultChecked />
                    <span className="form-check-label">Customer</span>
                  </label>
                </div>
              </div>
              <div className="mb-10">
                <label className="form-label fw-semibold">Notifications:</label>
                <div className="form-check form-switch form-switch-sm form-check-custom form-check-solid">
                  <input className="form-check-input" type="checkbox" name="notifications" defaultChecked />
                  <label className="form-check-label">Enabled</label>
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button type="reset" className="btn btn-sm btn-light btn-active-light-primary me-2" data-kt-menu-dismiss="true">Reset</button>
                <button type="submit" className="btn btn-sm btn-primary" data-kt-menu-dismiss="true">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-0 d-flex flex-column">
        <div className="card-p pt-5 bg-body flex-grow-1">
          {/* stats sama */}
          <div className="row g-0">
            <div className="col mr-8">
              <div className="fs-7 text-muted fw-bold">Average Sale</div>
              <div className="d-flex align-items-center">
                <div className="fs-4 fw-bold">$650</div>
                <i className="ki-duotone ki-arrow-up fs-5 text-success ms-1"><span className="path1" /><span className="path2" /></i>
              </div>
            </div>
            <div className="col">
              <div className="fs-7 text-muted fw-bold">Commission</div>
              <div className="fs-4 fw-bold">$233,600</div>
            </div>
          </div>
          <div className="row g-0 mt-8">
            <div className="col mr-8">
              <div className="fs-7 text-muted fw-bold">Annual Taxes 2019</div>
              <div className="fs-4 fw-bold">$29,004</div>
            </div>
            <div className="col">
              <div className="fs-7 text-muted fw-bold">Annual Income</div>
              <div className="d-flex align-items-center">
                <div className="fs-4 fw-bold">$1,480,00</div>
                <i className="ki-duotone ki-arrow-down fs-5 text-danger ms-1"><span className="path1" /><span className="path2" /></i>
              </div>
            </div>
          </div>
        </div>
        <div className="mixed-widget-3-chart card-rounded-bottom" data-kt-chart-color="success" style={{ height: 150 }} />
      </div>
    </div>
  );
}
