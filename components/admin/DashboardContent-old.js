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

      const response = await fetch('/api/admin/dashboard/stats', {
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

      {/* Charts */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        {/* User Growth Chart */}
        <div className="col-xl-6">
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

        {/* Invitation Growth Chart */}
        <div className="col-xl-6">
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
      </div>

      {/* Activity and Expiring */}
      <div className="row g-5 g-xl-10">
        {/* Recent Activity */}
        <div className="col-xl-6">
          <div className="card card-flush h-lg-100">
            <div className="card-header pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold text-gray-800">Recent Activity</span>
              </h3>
            </div>
            <div className="card-body pt-5">
              <div className="timeline-label">
                {stats?.recentActivity?.map((activity, idx) => (
                  <div key={activity.id} className="timeline-item">
                    <div className="timeline-label fw-bold text-gray-800 fs-6">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                    <div className="timeline-badge">
                      <i className="fa fa-genderless text-primary fs-1"></i>
                    </div>
                    <div className="timeline-content fw-semibold text-gray-600">
                      {activity.actor?.name} {activity.action.replace(/\./g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Invitations */}
        <div className="col-xl-6">
          <div className="card card-flush h-lg-100">
            <div className="card-header pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold text-gray-800">Expiring Invitations</span>
              </h3>
            </div>
            <div className="card-body pt-5">
              {stats?.expiringInvitations?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-row-dashed align-middle gs-0 gy-4 my-0">
                    <tbody>
                      {stats.expiringInvitations.map((invitation) => (
                        <tr key={invitation._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="d-flex justify-content-start flex-column">
                                <span className="text-gray-800 fw-bold mb-1">
                                  {invitation.mempelai?.pria} & {invitation.mempelai?.wanita}
                                </span>
                                <span className="text-gray-600 fw-semibold d-block fs-7">
                                  {invitation.user?.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="text-end">
                            <span className="text-danger fs-7 fw-bold">
                              Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-600 fw-semibold">
                  No invitations expiring soon
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
