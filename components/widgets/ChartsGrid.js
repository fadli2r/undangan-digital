// components/widgets/ChartsGrid.js
export default function ChartsGrid() {
  return (
    <>
      {/* Row 1 */}
      <div className="row g-5 g-xl-8">
        <div className="col-xl-6">
          {/* Charts Widget 1 */}
          <div className="card card-xl-stretch mb-xl-8">
            {/* Header */}
            <div className="card-header border-0 pt-5">
              {/* Title */}
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Recent Statistics</span>
                <span className="text-muted fw-semibold fs-7">More than 400 new members</span>
              </h3>
              {/* Toolbar */}
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

                {/* Dropdown menu */}
                <div
                  className="menu menu-sub menu-sub-dropdown w-250px w-md-300px"
                  data-kt-menu="true"
                  id="kt_menu_680f413f690b5"
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
                          data-dropdown-parent="#kt_menu_680f413f690b5"
                          data-allow-clear="true"
                        >
                          <option />
                          <option value="1">Approved</option>
                          <option value="2">Pending</option>
                          <option value="2">In Process</option>
                          <option value="2">Rejected</option>
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
                </div>
                {/* /Dropdown */}
              </div>
              {/* /Toolbar */}
            </div>
            {/* Body */}
            <div className="card-body">
              {/* Chart container */}
              <div id="kt_charts_widget_1_chart" style={{ height: 350 }} />
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          {/* Charts Widget 2 */}
          <div className="card card-xl-stretch mb-5 mb-xl-8">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Recent Orders</span>
                <span className="text-muted fw-semibold fs-7">More than 500 new orders</span>
              </h3>
              <div className="card-toolbar" data-kt-buttons="true">
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary active px-4 me-1" id="kt_charts_widget_2_year_btn">Year</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary px-4 me-1" id="kt_charts_widget_2_month_btn">Month</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary px-4" id="kt_charts_widget_2_week_btn">Week</a>
              </div>
            </div>
            <div className="card-body">
              <div id="kt_charts_widget_2_chart" style={{ height: 350 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="row g-5 g-xl-8">
        <div className="col-xl-6">
          {/* Charts Widget 3 */}
          <div className="card card-xl-stretch mb-xl-8">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Recent Transactions</span>
                <span className="text-muted fw-semibold fs-7">More than 1000 new records</span>
              </h3>
              <div className="card-toolbar" data-kt-buttons="true">
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary active px-4 me-1" id="kt_charts_widget_3_year_btn">Year</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary px-4 me-1" id="kt_charts_widget_3_month_btn">Month</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary px-4" id="kt_charts_widget_3_week_btn">Week</a>
              </div>
            </div>
            <div className="card-body">
              <div id="kt_charts_widget_3_chart" style={{ height: 350 }} />
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          {/* Charts Widget 4 */}
          <div className="card card-xl-stretch mb-5 mb-xl-8">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Recent Customers</span>
                <span className="text-muted fw-semibold fs-7">More than 500 new customers</span>
              </h3>
              <div className="card-toolbar" data-kt-buttons="true">
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary active px-4 me-1" id="kt_charts_widget_4_year_btn">Year</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary px-4 me-1" id="kt_charts_widget_4_month_btn">Month</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary px-4" id="kt_charts_widget_4_week_btn">Week</a>
              </div>
            </div>
            <div className="card-body">
              <div id="kt_charts_widget_4_chart" style={{ height: 350 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="row g-5 g-xl-8">
        <div className="col-xl-6">
          {/* Charts Widget 5 (secondary buttons) */}
          <div className="card card-xl-stretch mb-xl-8">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Recent Customers</span>
                <span className="text-muted fw-semibold fs-7">More than 500 new customers</span>
              </h3>
              <div className="card-toolbar" data-kt-buttons="true">
                <a className="btn btn-sm btn-color-muted btn-active btn-active-secondary px-4 me-1" id="kt_charts_widget_5_year_btn">Year</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-secondary px-4 me-1" id="kt_charts_widget_5_month_btn">Month</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-secondary px-4 active" id="kt_charts_widget_5_week_btn">Week</a>
              </div>
            </div>
            <div className="card-body">
              <div id="kt_charts_widget_5_chart" style={{ height: 350 }} />
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          {/* Charts Widget 6 (Sales/Expenses) */}
          <div className="card card-xl-stretch mb-5 mb-xl-8">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Recent Orders</span>
                <span className="text-muted fw-semibold fs-7">More than 500+ new orders</span>
              </h3>
              <div className="card-toolbar" data-kt-buttons="true">
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary active px-4 me-1" id="kt_charts_widget_6_sales_btn">Sales</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary px-4 me-1" id="kt_charts_widget_6_expenses_btn">Expenses</a>
              </div>
            </div>
            <div className="card-body">
              <div id="kt_charts_widget_6_chart" style={{ height: 350 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 4 */}
      <div className="row g-5 g-xl-8">
        <div className="col-xl-6">
          {/* Charts Widget 7 */}
          <div className="card card-xl-stretch mb-xl-8">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Recent Users</span>
                <span className="text-muted fw-semibold fs-7">More than 500 new users</span>
              </h3>
              <div className="card-toolbar" data-kt-buttons="true">
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary active px-4 me-1" id="kt_charts_widget_7_year_btn">Year</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary px-4 me-1" id="kt_charts_widget_7_month_btn">Month</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary px-4" id="kt_charts_widget_7_week_btn">Week</a>
              </div>
            </div>
            <div className="card-body">
              <div id="kt_charts_widget_7_chart" style={{ height: 350 }} className="card-rounded-bottom" />
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          {/* Charts Widget 8 */}
          <div className="card card-xl-stretch mb-5 mb-xl-8">
            <div className="card-header border-0 pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Recent Orders</span>
                <span className="text-muted fw-semibold fs-7">More than 500 new orders</span>
              </h3>
              <div className="card-toolbar" data-kt-buttons="true">
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary active px-4 me-1" id="kt_charts_widget_8_year_btn">Year</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary px-4 me-1" id="kt_charts_widget_8_month_btn">Month</a>
                <a className="btn btn-sm btn-color-muted btn-active btn-active-primary px-4" id="kt_charts_widget_8_week_btn">Week</a>
              </div>
            </div>
            <div className="card-body">
              <div id="kt_charts_widget_8_chart" style={{ height: 350 }} className="card-rounded-bottom" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
