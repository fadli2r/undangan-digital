import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '../../components/admin/Layout';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const { data: session } = useSession();
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
        if (response.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
          window.location.href = '/admin/login';
          return;
        }
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Chart configurations
  const userGrowthData = {
    labels: stats?.growth?.users?.map(item => item._id) || [],
    datasets: [
      {
        label: 'New Users',
        data: stats?.growth?.users?.map(item => item.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const invitationGrowthData = {
    labels: stats?.growth?.invitations?.map(item => item._id) || [],
    datasets: [
      {
        label: 'New Invitations',
        data: stats?.growth?.invitations?.map(item => item.count) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const invitationStatusData = {
    labels: Object.keys(stats?.invitationStats || {}),
    datasets: [
      {
        data: Object.values(stats?.invitationStats || {}),
        backgroundColor: [
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
        ],
      },
    ],
  };

  const templateUsageData = {
    labels: stats?.templateStats?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Usage Count',
        data: stats?.templateStats?.map(item => item.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {session?.user?.name}! Here's what's happening with your platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.overview?.totalUsers || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">+{stats?.overview?.newUsersToday || 0}</span>
                <span className="text-gray-500"> today</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Invitations</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.overview?.totalInvitations || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">+{stats?.overview?.newInvitationsToday || 0}</span>
                <span className="text-gray-500"> today</span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Invitations</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.overview?.activeInvitations || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-gray-500">
                  {((stats?.overview?.activeInvitations / stats?.overview?.totalInvitations) * 100 || 0).toFixed(1)}% of total
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">User Growth</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.overview?.userGrowthPercentage > 0 ? '+' : ''}{stats?.overview?.userGrowthPercentage}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-gray-500">vs last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth (30 days)</h3>
            <Line data={userGrowthData} options={chartOptions} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invitation Growth (30 days)</h3>
            <Line data={invitationGrowthData} options={chartOptions} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Invitation Status</h3>
            <div className="h-64">
              <Doughnut data={invitationStatusData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Templates</h3>
            <Bar data={templateUsageData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activity & Expiring Invitations */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
              <div className="mt-5">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {stats?.recentActivity?.map((activity, idx) => (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {idx !== stats.recentActivity.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                          )}
                          <div className="relative flex space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {activity.actor?.name} {activity.action.replace(/\./g, ' ')}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                {new Date(activity.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Expiring Invitations</h3>
              <div className="mt-5">
                {stats?.expiringInvitations?.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {stats.expiringInvitations.map((invitation) => (
                      <li key={invitation._id} className="py-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {invitation.mempelai?.pria} & {invitation.mempelai?.wanita}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {invitation.user?.email}
                            </p>
                          </div>
                          <div className="text-sm text-red-600">
                            Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No invitations expiring soon</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
