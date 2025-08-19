import MetronicAdminLayout from '../../components/layouts/MetronicAdminLayout';
import { useState, useEffect } from 'react';

export default function MetronicDemo() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvitations: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <MetronicAdminLayout>
      {/* Stats Cards */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-md-6 col-lg-6 col-xl-6 col-xxl-3 mb-md-5 mb-xl-10">
          <div className="card card-flush bgi-no-repeat bgi-size-contain bgi-position-x-end h-md-50 mb-5 mb-xl-10" style={{backgroundColor: '#F1416C'}}>
            <div className="card-header pt-5">
              <div className="card-title d-flex flex-column">
                <span className="fs-2hx fw-bold text-white me-2 lh-1 ls-n2">{stats.totalUsers}</span>
                <span className="text-white opacity-75 pt-1 fw-semibold fs-6">Total Users</span>
              </div>
            </div>
            <div className="card-body d-flex align-items-end pt-0">
              <div className="d-flex align-items-center flex-column mt-3 w-100">
                <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                  <span className="fw-bolder fs-6 text-white opacity-75">Progress</span>
                  <span className="fw-bold fs-6 text-white">76%</span>
                </div>
                <div className="h-8px mx-3 w-100 bg-white bg-opacity-50 rounded">
                  <div className="bg-white rounded h-8px" role="progressbar" style={{width: '76%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-6 col-xl-6 col-xxl-3 mb-md-5 mb-xl-10">
          <div className="card card-flush bgi-no-repeat bgi-size-contain bgi-position-x-end h-md-50 mb-5 mb-xl-10" style={{backgroundColor: '#7239EA'}}>
            <div className="card-header pt-5">
              <div className="card-title d-flex flex-column">
                <span className="fs-2hx fw-bold text-white me-2 lh-1 ls-n2">{stats.totalInvitations}</span>
                <span className="text-white opacity-75 pt-1 fw-semibold fs-6">Total Invitations</span>
              </div>
            </div>
            <div className="card-body d-flex align-items-end pt-0">
              <div className="d-flex align-items-center flex-column mt-3 w-100">
                <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                  <span className="fw-bolder fs-6 text-white opacity-75">Progress</span>
                  <span className="fw-bold fs-6 text-white">84%</span>
                </div>
                <div className="h-8px mx-3 w-100 bg-white bg-opacity-50 rounded">
                  <div className="bg-white rounded h-8px" role="progressbar" style={{width: '84%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-6 col-xl-6 col-xxl-3 mb-md-5 mb-xl-10">
          <div className="card card-flush bgi-no-repeat bgi-size-contain bgi-position-x-end h-md-50 mb-5 mb-xl-10" style={{backgroundColor: '#17C653'}}>
            <div className="card-header pt-5">
              <div className="card-title d-flex flex-column">
                <span className="fs-2hx fw-bold text-white me-2 lh-1 ls-n2">{stats.totalOrders}</span>
                <span className="text-white opacity-75 pt-1 fw-semibold fs-6">Total Orders</span>
              </div>
            </div>
            <div className="card-body d-flex align-items-end pt-0">
              <div className="d-flex align-items-center flex-column mt-3 w-100">
                <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                  <span className="fw-bolder fs-6 text-white opacity-75">Progress</span>
                  <span className="fw-bold fs-6 text-white">69%</span>
                </div>
                <div className="h-8px mx-3 w-100 bg-white bg-opacity-50 rounded">
                  <div className="bg-white rounded h-8px" role="progressbar" style={{width: '69%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-6 col-xl-6 col-xxl-3 mb-md-5 mb-xl-10">
          <div className="card card-flush bgi-no-repeat bgi-size-contain bgi-position-x-end h-md-50 mb-5 mb-xl-10" style={{backgroundColor: '#FFC700'}}>
            <div className="card-header pt-5">
              <div className="card-title d-flex flex-column">
                <span className="fs-2hx fw-bold text-white me-2 lh-1 ls-n2">Rp {stats.totalRevenue?.toLocaleString('id-ID') || 0}</span>
                <span className="text-white opacity-75 pt-1 fw-semibold fs-6">Total Revenue</span>
              </div>
            </div>
            <div className="card-body d-flex align-items-end pt-0">
              <div className="d-flex align-items-center flex-column mt-3 w-100">
                <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                  <span className="fw-bolder fs-6 text-white opacity-75">Progress</span>
                  <span className="fw-bold fs-6 text-white">92%</span>
                </div>
                <div className="h-8px mx-3 w-100 bg-white bg-opacity-50 rounded">
                  <div className="bg-white rounded h-8px" role="progressbar" style={{width: '92%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-xl-6">
          <div className="card card-flush h-xl-100">
            <div className="card-header pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold text-dark">Recent Users</span>
                <span className="text-gray-400 mt-1 fw-semibold fs-6">Latest registered users</span>
              </h3>
            </div>
            <div className="card-body pt-2">
              <div className="timeline-label">
                <div className="timeline-item">
                  <div className="timeline-label fw-bold text-gray-800 fs-6">08:42</div>
                  <div className="timeline-badge">
                    <i className="fa fa-genderless text-warning fs-1"></i>
                  </div>
                  <div className="fw-mormal timeline-content text-muted ps-3">
                    New user registered: john@example.com
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-label fw-bold text-gray-800 fs-6">10:00</div>
                  <div className="timeline-badge">
                    <i className="fa fa-genderless text-success fs-1"></i>
                  </div>
                  <div className="fw-mormal timeline-content text-muted ps-3">
                    Payment received from user: jane@example.com
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-label fw-bold text-gray-800 fs-6">14:37</div>
                  <div className="timeline-badge">
                    <i className="fa fa-genderless text-danger fs-1"></i>
                  </div>
                  <div className="fw-mormal timeline-content text-muted ps-3">
                    New invitation created: Wedding of John & Jane
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          <div className="card card-flush h-xl-100">
            <div className="card-header pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold text-dark">Quick Actions</span>
                <span className="text-gray-400 mt-1 fw-semibold fs-6">Manage your system</span>
              </h3>
            </div>
            <div className="card-body pt-2">
              <div className="d-flex flex-wrap">
                <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="symbol symbol-30px me-5">
                      <div className="symbol-label bg-light-primary">
                        <i className="ki-duotone ki-profile-circle fs-1 text-primary">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </div>
                    </div>
                    <div className="d-flex flex-column">
                      <div className="fw-bold fs-6 text-gray-800">Users</div>
                      <div className="fw-semibold fs-7 text-gray-400">Manage Users</div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="symbol symbol-30px me-5">
                      <div className="symbol-label bg-light-warning">
                        <i className="ki-duotone ki-message-text-2 fs-1 text-warning">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </div>
                    </div>
                    <div className="d-flex flex-column">
                      <div className="fw-bold fs-6 text-gray-800">Invitations</div>
                      <div className="fw-semibold fs-7 text-gray-400">View All</div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="symbol symbol-30px me-5">
                      <div className="symbol-label bg-light-success">
                        <i className="ki-duotone ki-basket fs-1 text-success">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                        </i>
                      </div>
                    </div>
                    <div className="d-flex flex-column">
                      <div className="fw-bold fs-6 text-gray-800">Orders</div>
                      <div className="fw-semibold fs-7 text-gray-400">Process Orders</div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="symbol symbol-30px me-5">
                      <div className="symbol-label bg-light-info">
                        <i className="ki-duotone ki-setting-2 fs-1 text-info">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </div>
                    </div>
                    <div className="d-flex flex-column">
                      <div className="fw-bold fs-6 text-gray-800">Settings</div>
                      <div className="fw-semibold fs-7 text-gray-400">System Config</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MetronicAdminLayout>
  );
}
