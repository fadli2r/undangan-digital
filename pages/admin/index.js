import AdminLayout from '../../components/layouts/AdminLayout'

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="row gy-5 g-xl-10">
        <div className="col-xl-4">
          <div className="card card-xl-stretch mb-xl-10" style={{ backgroundColor: '#F7D9E3' }}>
            <div className="card-body d-flex flex-column">
              <a href="#" className="text-gray-900 text-hover-primary fw-bold fs-3">Earnings</a>
              <div className="mixed-widget-13-chart" style={{ height: 100 }} />
              <div className="pt-5">
                <span className="text-gray-900 fw-bold fs-2x lh-0">$</span>
                <span className="text-gray-900 fw-bold fs-3x me-2 lh-0">560</span>
                <span className="text-gray-900 fw-bold fs-6 lh-0">+ 28% this week</span>
              </div>
            </div>
          </div>
        </div>
        {/* Tambahkan widget lain sesuai template */}
      </div>
    </AdminLayout>
  )
}