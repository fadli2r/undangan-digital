import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardContent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin/dashboard/stats-jwt', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-h-300px">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        {/* Users card */}
        <div className="col-md-6 col-lg-6 col-xl-3">
          <div className="card">
            <div className="card-body p-5">
              <div className="d-flex align-items-center">
                <div className="symbol symbol-40px me-3">
                  <i className="ki-duotone ki-profile-user fs-1 text-primary">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div>
                  <div className="fs-6 text-gray-800 fw-bold">{stats?.overview?.totalUsers || 0}</div>
                  <div className="fs-7 text-gray-600">Total Users</div>
                </div>
              </div>
              <div className="d-flex align-items-center mt-3">
                <span className="text-success fs-7 fw-bold me-2">+{stats?.overview?.newUsersToday || 0} today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invitations card */}
        <div className="col-md-6 col-lg-6 col-xl-3">
          <div className="card">
            <div className="card-body p-5">
              <div className="d-flex align-items-center">
                <div className="symbol symbol-40px me-3">
                  <i className="ki-duotone ki-message-text-2 fs-1 text-primary">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div>
                  <div className="fs-6 text-gray-800 fw-bold">{stats?.overview?.totalInvitations || 0}</div>
                  <div className="fs-7 text-gray-600">Total Invitations</div>
                </div>
              </div>
              <div className="d-flex align-items-center mt-3">
                <span className="text-success fs-7 fw-bold me-2">+{stats?.overview?.newInvitationsToday || 0} today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Invitations card */}
        <div className="col-md-6 col-lg-6 col-xl-3">
          <div className="card">
            <div className="card-body p-5">
              <div className="d-flex align-items-center">
                <div className="symbol symbol-40px me-3">
                  <i className="ki-duotone ki-check-square fs-1 text-primary">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <div>
                  <div className="fs-6 text-gray-800 fw-bold">{stats?.overview?.activeInvitations || 0}</div>
                  <div className="fs-7 text-gray-600">Active Invitations</div>
                </div>
              </div>
              <div className="d-flex align-items-center mt-3">
                <span className="text-gray-600 fs-7 fw-bold">
                  {((stats?.overview?.activeInvitations / stats?.overview?.totalInvitations) * 100 || 0).toFixed(1)}% of total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth card */}
        <div className="col-md-6 col-lg-6 col-xl-3">
          <div className="card">
            <div className="card-body p-5">
              <div className="d-flex align-items-center">
                <div className="symbol symbol-40px me-3">
                  <i className="ki-duotone ki-chart-simple fs-1 text-primary">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                  </i>
                </div>
                <div>
                  <div className="fs-6 text-gray-800 fw-bold">
                    {stats?.overview?.userGrowthPercentage > 0 ? '+' : ''}{stats?.overview?.userGrowthPercentage}%
                  </div>
                  <div className="fs-7 text-gray-600">User Growth</div>
                </div>
              </div>
              <div className="d-flex align-items-center mt-3">
                <span className="text-gray-600 fs-7 fw-bold">vs last week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        {/* User Growth Chart */}
        <div className="col-xxl-6">
          <div className="card card-flush h-lg-100">
            <div className="card-header pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold text-gray-800">User Growth (30 days)</span>
              </h3>
            </div>
            <div className="card-body pt-5">
              <Line
                data={{
                  labels: stats?.growth?.users?.map(item => item._id) || [],
                  datasets: [{
                    label: 'New Users',
                    data: stats?.growth?.users?.map(item => item.count) || [],
                    borderColor: '#009ef7',
                    backgroundColor: '#009ef720',
                    tension: 0.1,
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-xxl-6">
          <div className="card card-xl-stretch mb-xl-10">
            <div className="card-header align-items-center border-0 mt-4">
              <h3 className="card-title align-items-start flex-column">
                <span className="fw-bold mb-2 text-gray-900">Activities</span>
                <span className="text-muted fw-semibold fs-7">Recent Activities</span>
              </h3>
              <div className="card-toolbar">
                <button type="button" className="btn btn-sm btn-icon btn-color-primary btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
                  <i className="ki-duotone ki-category fs-6">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                  </i>
                </button>
                <div className="menu menu-sub menu-sub-dropdown w-250px w-md-300px" data-kt-menu="true" id="kt_menu_activities">
                  <div className="px-7 py-5">
                    <div className="fs-5 text-gray-900 fw-bold">Filter Options</div>
                  </div>
                  <div className="separator border-gray-200"></div>
                  <div className="px-7 py-5">
                    <div className="mb-10">
                      <label className="form-label fw-semibold">Status:</label>
                      <div>
                        <select className="form-select" data-kt-select2="true" data-placeholder="Select option">
                          <option></option>
                          <option value="1">All</option>
                          <option value="2">Users</option>
                          <option value="3">Orders</option>
                          <option value="4">Invitations</option>
                        </select>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="reset" className="btn btn-sm btn-light btn-active-light-primary me-2">Reset</button>
                      <button type="submit" className="btn btn-sm btn-primary">Apply</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body pt-5">
              <div className="timeline-label">
                {stats?.recentActivity?.map((activity, index) => (
                  <div key={activity.id || index} className="timeline-item">
                    <div className="timeline-label fw-bold text-gray-800 fs-6">
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="timeline-badge">
                      <i className={`fa fa-genderless text-${
                        activity.type === 'order' ? 'warning' : 
                        activity.type === 'user' ? 'success' :
                        activity.type === 'invitation' ? 'primary' : 'info'
                      } fs-1`}></i>
                    </div>
                    <div className="timeline-content fw-mormal text-muted ps-3">
                      {activity.actor?.name} {activity.action.replace(/\./g, ' ')}
                      {activity.type === 'order' && activity.orderId && (
                        <a href="#" className="text-primary ms-1">#{activity.orderId}</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="row g-5 g-xl-10">
        {/* Invitation Growth Chart */}
        <div className="col-xxl-6">
          <div className="card card-flush h-lg-100">
            <div className="card-header pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold text-gray-800">Invitation Growth (30 days)</span>
              </h3>
            </div>
            <div className="card-body pt-5">
              <Line
                data={{
                  labels: stats?.growth?.invitations?.map(item => item._id) || [],
                  datasets: [{
                    label: 'New Invitations',
                    data: stats?.growth?.invitations?.map(item => item.count) || [],
                    borderColor: '#50cd89',
                    backgroundColor: '#50cd8920',
                    tension: 0.1,
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Active Invitations Detail */}
        <div className="col-xxl-6">
          <div className="card card-flush h-lg-100">
            <div className="card-header pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold text-gray-800">Active Invitations</span>
                <span className="text-muted fw-semibold fs-7">Recent active invitations with user details</span>
              </h3>
            </div>
            <div className="card-body pt-5">
              {stats?.activeInvitationsDetail?.length > 0 ? (
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-row-dashed align-middle gs-0 gy-4 my-0">
                    <thead>
                      <tr className="fw-bold text-muted bg-light">
                        <th className="ps-4 min-w-200px rounded-start">Invitation</th>
                        <th className="min-w-150px">User</th>
                        <th className="min-w-100px">Stats</th>
                        <th className="min-w-100px rounded-end">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.activeInvitationsDetail.slice(0, 10).map((invitation) => (
                        <tr key={invitation._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="d-flex justify-content-start flex-column">
                                <span className="text-gray-800 fw-bold mb-1">
                                  {invitation.mempelai?.pria && invitation.mempelai?.wanita 
                                    ? `${invitation.mempelai.pria} & ${invitation.mempelai.wanita}`
                                    : invitation.slug
                                  }
                                </span>
                                <span className="text-gray-600 fw-semibold d-block fs-7">
                                  Template: {invitation.template}
                                </span>
                                {invitation.acara_utama?.tanggal && (
                                  <span className="text-primary fw-semibold d-block fs-8">
                                    {new Date(invitation.acara_utama.tanggal).toLocaleDateString('id-ID')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex justify-content-start flex-column">
                              <span className="text-gray-800 fw-bold mb-1">
                                {invitation.user?.name || 'Unknown User'}
                              </span>
                              <span className="text-gray-600 fw-semibold d-block fs-7">
                                {invitation.user_email}
                              </span>
                              {invitation.user?.phone && (
                                <span className="text-gray-500 fw-semibold d-block fs-8">
                                  {invitation.user.phone}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex justify-content-start flex-column">
                              <span className="text-gray-800 fw-bold mb-1">
                                👁️ {invitation.views || 0}
                              </span>
                              <span className="text-gray-600 fw-semibold d-block fs-7">
                                💬 {invitation.ucapan || 0} | ✅ {invitation.rsvp || 0}
                              </span>
                            </div>
                          </td>
                          <td className="text-end">
                            <span className="text-gray-600 fs-7 fw-bold">
                              {new Date(invitation.createdAt).toLocaleDateString('id-ID')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stats.activeInvitationsDetail.length > 10 && (
                    <div className="text-center mt-3">
                      <span className="text-muted fs-7">
                        Showing 10 of {stats.activeInvitationsDetail.length} active invitations
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-600 fw-semibold text-center py-10">
                  <i className="ki-duotone ki-message-text-2 fs-3x text-gray-300 mb-3">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  <div>No active invitations found</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
