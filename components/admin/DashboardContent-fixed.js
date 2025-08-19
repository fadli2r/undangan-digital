import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchStats();
    }
  }, [status, session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/dashboard/stats-fixed');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stats');
      }

      const data = await response.json();
      if (data.success) {
        setStats(data);
      } else {
        throw new Error(data.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard stats error:', err);
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

  if (status === 'loading' || loading) {
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
        <div className="d-flex align-items-center">
          <i className="ki-duotone ki-shield-tick fs-2hx text-danger me-4">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
          <div className="d-flex flex-column">
            <h4 className="mb-1 text-danger">Error Loading Dashboard</h4>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="alert alert-info">
        <div className="d-flex align-items-center">
          <i className="ki-duotone ki-information-5 fs-2hx text-info me-4">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
          </i>
          <div className="d-flex flex-column">
            <h4 className="mb-1 text-info">No Data Available</h4>
            <span>Dashboard statistics are currently unavailable.</span>
          </div>
        </div>
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

        {/* Admins card */}
        <div className="col-md-6 col-lg-6 col-xl-3">
          <div className="card">
            <div className="card-body p-5">
              <div className="d-flex align-items-center">
                <div className="symbol symbol-40px me-3">
                  <i className="ki-duotone ki-shield-tick fs-1 text-primary">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <div>
                  <div className="fs-6 text-gray-800 fw-bold">{stats?.overview?.totalAdmins || 0}</div>
                  <div className="fs-7 text-gray-600">Active Admins</div>
                </div>
              </div>
              <div className="d-flex align-items-center mt-3">
                <span className="text-gray-600 fs-7 fw-bold">System administrators</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users and Invitations */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        {/* Recent Users */}
        <div className="col-xxl-6">
          <div className="card card-flush h-lg-100">
            <div className="card-header pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold text-gray-800">Recent Users</span>
                <span className="text-gray-400 mt-1 fw-semibold fs-6">Latest registered users</span>
              </h3>
            </div>
            <div className="card-body pt-5">
              {stats?.recentUsers?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                    <thead>
                      <tr className="fw-bold text-muted">
                        <th className="min-w-150px">User</th>
                        <th className="min-w-140px">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="d-flex justify-content-start flex-column">
                                <span className="text-gray-800 fw-bold">{user.name}</span>
                                <span className="text-gray-600 fw-semibold d-block fs-7">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="text-gray-600 fw-semibold d-block fs-7">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-600 fw-semibold">
                  No recent users
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Invitations */}
        <div className="col-xxl-6">
          <div className="card card-flush h-lg-100">
            <div className="card-header pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold text-gray-800">Recent Invitations</span>
                <span className="text-gray-400 mt-1 fw-semibold fs-6">Latest created invitations</span>
              </h3>
            </div>
            <div className="card-body pt-5">
              {stats?.recentInvitations?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                    <thead>
                      <tr className="fw-bold text-muted">
                        <th className="min-w-150px">Invitation</th>
                        <th className="min-w-140px">Created By</th>
                        <th className="min-w-120px">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentInvitations.map((invitation) => (
                        <tr key={invitation.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="d-flex justify-content-start flex-column">
                                <a href={`/i/${invitation.slug}`} target="_blank" className="text-gray-800 fw-bold text-hover-primary mb-1">
                                  {invitation.groomName} & {invitation.brideName}
                                </a>
                                <span className="text-gray-600 fw-semibold d-block fs-7">{invitation.slug}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex justify-content-start flex-column">
                              <span className="text-gray-800 fw-bold">{invitation.user?.name}</span>
                              <span className="text-gray-600 fw-semibold d-block fs-7">{invitation.user?.email}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-light-${
                              invitation.status === 'active' ? 'success' :
                              invitation.status === 'expired' ? 'danger' :
                              invitation.status === 'draft' ? 'warning' : 'info'
                            } fw-semibold`}>
                              {invitation.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-600 fw-semibold">
                  No recent invitations
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invitation Stats */}
      <div className="row g-5 g-xl-10">
        <div className="col-xxl-6">
          <div className="card card-flush h-lg-100">
            <div className="card-header pt-5">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold text-gray-800">Invitation Status</span>
                <span className="text-gray-400 mt-1 fw-semibold fs-6">Current status breakdown</span>
              </h3>
            </div>
            <div className="card-body pt-5">
              <div className="d-flex flex-column">
                {Object.entries(stats?.invitationStats || {}).map(([status, count]) => (
                  <div key={status} className="d-flex align-items-center mb-5">
                    <div className="flex-grow-1">
                      <span className="text-gray-800 fw-bold fs-6">{status}</span>
                      <span className="text-gray-400 fw-semibold fs-7 d-block">{count} invitations</span>
                    </div>
                    <div className="w-50px text-end">
                      <span className={`badge badge-light-${
                        status === 'active' ? 'success' :
                        status === 'expired' ? 'danger' :
                        status === 'draft' ? 'warning' : 'info'
                      } fw-bold`}>
                        {((count / stats.overview.totalInvitations) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
