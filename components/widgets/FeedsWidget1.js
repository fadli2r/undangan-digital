// components/widgets/FeedsWidget1.js
// Hanya "Feeds Widget 1" dari snippet yang kamu kirim.
// Ditaruh di dalam container layout (AdminLayoutJWT sudah menyiapkan #kt_content_container)

export default function FeedsWidget1() {
  return (
    <div className="row g-5 g-xl-8">
      {/* Col */}
      <div className="col-xl-6">
        {/* Feeds Widget 1 */}
        <div className="card mb-5 mb-xl-8">
          {/* Body */}
          <div className="card-body pb-0">
            {/* Header */}
            <div className="d-flex align-items-center">
              {/* User */}
              <div className="d-flex align-items-center flex-grow-1">
                {/* Avatar */}
                <div className="symbol symbol-45px me-5">
                  <img src="/metronic/assets/media/avatars/300-6.jpg" alt="avatar" />
                </div>
                {/* Info */}
                <div className="d-flex flex-column">
                  <a href="#" className="text-gray-900 text-hover-primary fs-6 fw-bold">
                    Grace Green
                  </a>
                  <span className="text-gray-500 fw-bold">PHP, SQLite, Artisan CLI</span>
                </div>
              </div>
              {/* Menu */}
              <div className="my-0">
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

                {/* Menu 2 */}
                <div
                  className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-200px"
                  data-kt-menu="true"
                >
                  {/* Title */}
                  <div className="menu-item px-3">
                    <div className="menu-content fs-6 text-gray-900 fw-bold px-3 py-4">
                      Quick Actions
                    </div>
                  </div>
                  {/* Separator */}
                  <div className="separator mb-3 opacity-75" />
                  {/* Items */}
                  <div className="menu-item px-3">
                    <a href="#" className="menu-link px-3">New Ticket</a>
                  </div>
                  <div className="menu-item px-3">
                    <a href="#" className="menu-link px-3">New Customer</a>
                  </div>

                  {/* Submenu (hover) */}
                  <div
                    className="menu-item px-3"
                    data-kt-menu-trigger="hover"
                    data-kt-menu-placement="right-start"
                  >
                    <a href="#" className="menu-link px-3">
                      <span className="menu-title">New Group</span>
                      <span className="menu-arrow" />
                    </a>
                    <div className="menu-sub menu-sub-dropdown w-175px py-4">
                      <div className="menu-item px-3">
                        <a href="#" className="menu-link px-3">Admin Group</a>
                      </div>
                      <div className="menu-item px-3">
                        <a href="#" className="menu-link px-3">Staff Group</a>
                      </div>
                      <div className="menu-item px-3">
                        <a href="#" className="menu-link px-3">Member Group</a>
                      </div>
                    </div>
                  </div>

                  <div className="menu-item px-3">
                    <a href="#" className="menu-link px-3">New Contact</a>
                  </div>

                  <div className="separator mt-3 opacity-75" />

                  <div className="menu-item px-3">
                    <div className="menu-content px-3 py-3">
                      <a className="btn btn-primary btn-sm px-4" href="#">
                        Generate Reports
                      </a>
                    </div>
                  </div>
                </div>
                {/* /Menu 2 */}
              </div>
              {/* /Menu */}
            </div>
            {/* /Header */}

            {/* Form (Quill editor) */}
            <form id="kt_forms_widget_1_form" className="ql-quil ql-quil-plain pb-3">
              {/* Editor */}
              <div id="kt_forms_widget_1_editor" className="py-6" />
              <div className="separator" />
              {/* Toolbar */}
              <div id="kt_forms_widget_1_editor_toolbar" className="ql-toolbar d-flex flex-stack py-2">
                <div className="me-2">
                  <span className="ql-formats ql-size ms-0">
                    <select className="ql-size w-75px" />
                  </span>
                  <span className="ql-formats">
                    <button className="ql-bold" type="button" />
                    <button className="ql-italic" type="button" />
                    <button className="ql-underline" type="button" />
                    <button className="ql-strike" type="button" />
                    <button className="ql-image" type="button" />
                    <button className="ql-link" type="button" />
                    <button className="ql-clean" type="button" />
                  </span>
                </div>
                <div className="me-n3">
                  <span className="btn btn-icon btn-sm btn-active-color-primary">
                    <i className="ki-duotone ki-paper-clip fs-2" />
                  </span>
                  <span className="btn btn-icon btn-sm btn-active-color-primary">
                    <i className="ki-duotone ki-geolocation fs-2">
                      <span className="path1" />
                      <span className="path2" />
                    </i>
                  </span>
                </div>
              </div>
              {/* /Toolbar */}
            </form>
            {/* /Form */}
          </div>
          {/* /Body */}
        </div>
        {/* /Feeds Widget 1 */}
      </div>
      {/* /Col */}
    </div>
  );
}
