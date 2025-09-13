// components/widgets/ListWidget1Card.js
// Hanya "card" List Widget 1 (tanpa col/row/container)
export default function ListWidget1Card() {
  return (
    <div className="card card-xl-stretch mb-xl-8">
      {/* Header */}
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold text-gray-900">Tasks Overview</span>
          <span className="text-muted mt-1 fw-semibold fs-7">Pending 10 tasks</span>
        </h3>
        <div className="card-toolbar">
          {/* Menu trigger */}
          <button
            type="button"
            className="btn btn-sm btn-icon btn-color-primary btn-active-light-primary"
            data-kt-menu-trigger="click"
            data-kt-menu-placement="bottom-end"
          >
            <i className="ki-duotone ki-category fs-6">
              <span className="path1" />
              <span className="path2" />
              <span className="path3" />
              <span className="path4" />
            </i>
          </button>

          {/* Menu 1 */}
          <div
            className="menu menu-sub menu-sub-dropdown w-250px w-md-300px"
            data-kt-menu="true"
            id="kt_menu_680f413baf1f8"
          >
            {/* Header */}
            <div className="px-7 py-5">
              <div className="fs-5 text-gray-900 fw-bold">Filter Options</div>
            </div>

            <div className="separator border-gray-200" />

            {/* Form */}
            <div className="px-7 py-5">
              {/* Status */}
              <div className="mb-10">
                <label className="form-label fw-semibold">Status:</label>
                <div>
                  <select
                    className="form-select form-select-solid"
                    multiple
                    data-kt-select2="true"
                    data-close-on-select="false"
                    data-placeholder="Select option"
                    data-dropdown-parent="#kt_menu_680f413baf1f8"
                    data-allow-clear="true"
                  >
                    <option />
                    <option value="1">Approved</option>
                    <option value="2">Pending</option>
                    <option value="3">In Process</option>
                    <option value="4">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Member Type */}
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

              {/* Notifications */}
              <div className="mb-10">
                <label className="form-label fw-semibold">Notifications:</label>
                <div className="form-check form-switch form-switch-sm form-check-custom form-check-solid">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="notifications"
                    defaultChecked
                  />
                  <label className="form-check-label">Enabled</label>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex justify-content-end">
                <button
                  type="reset"
                  className="btn btn-sm btn-light btn-active-light-primary me-2"
                  data-kt-menu-dismiss="true"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary"
                  data-kt-menu-dismiss="true"
                >
                  Apply
                </button>
              </div>
            </div>
            {/* /Form */}
          </div>
          {/* /Menu 1 */}
        </div>
      </div>

      {/* Body */}
      <div className="card-body pt-5">
        {/* Item */}
        <div className="d-flex align-items-center mb-7">
          <div className="symbol symbol-50px me-5">
            <span className="symbol-label bg-light-success">
              <i className="ki-duotone ki-abstract-26 fs-2x text-success">
                <span className="path1" />
                <span className="path2" />
              </i>
            </span>
          </div>
          <div className="d-flex flex-column">
            <a href="#" className="text-gray-900 text-hover-primary fs-6 fw-bold">
              Project Briefing
            </a>
            <span className="text-muted fw-bold">Project Manager</span>
          </div>
        </div>

        {/* Item */}
        <div className="d-flex align-items-center mb-7">
          <div className="symbol symbol-50px me-5">
            <span className="symbol-label bg-light-warning">
              <i className="ki-duotone ki-pencil fs-2x text-warning">
                <span className="path1" />
                <span className="path2" />
              </i>
            </span>
          </div>
          <div className="d-flex flex-column">
            <a href="#" className="text-gray-900 text-hover-primary fs-6 fw-bold">
              Concept Design
            </a>
            <span className="text-muted fw-bold">Art Director</span>
          </div>
        </div>

        {/* Item */}
        <div className="d-flex align-items-center mb-7">
          <div className="symbol symbol-50px me-5">
            <span className="symbol-label bg-light-primary">
              <i className="ki-duotone ki-message-text-2 fs-2x text-primary">
                <span className="path1" />
                <span className="path2" />
                <span className="path3" />
              </i>
            </span>
          </div>
          <div className="d-flex flex-column">
            <a href="#" className="text-gray-900 text-hover-primary fs-6 fw-bold">
              Functional Logics
            </a>
            <span className="text-muted fw-bold">Lead Developer</span>
          </div>
        </div>

        {/* Item */}
        <div className="d-flex align-items-center mb-7">
          <div className="symbol symbol-50px me-5">
            <span className="symbol-label bg-light-danger">
              <i className="ki-duotone ki-disconnect fs-2x text-danger">
                <span className="path1" />
                <span className="path2" />
                <span className="path3" />
                <span className="path4" />
                <span className="path5" />
              </i>
            </span>
          </div>
          <div className="d-flex flex-column">
            <a href="#" className="text-gray-900 text-hover-primary fs-6 fw-bold">
              Development
            </a>
            <span className="text-muted fw-bold">DevOps</span>
          </div>
        </div>

        {/* Item */}
        <div className="d-flex align-items-center">
          <div className="symbol symbol-50px me-5">
            <span className="symbol-label bg-light-info">
              <i className="ki-duotone ki-security-user fs-2x text-info">
                <span className="path1" />
                <span className="path2" />
              </i>
            </span>
          </div>
          <div className="d-flex flex-column">
            <a href="#" className="text-gray-900 text-hover-primary fs-6 fw-bold">
              Testing
            </a>
            <span className="text-muted fw-bold">QA Managers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
