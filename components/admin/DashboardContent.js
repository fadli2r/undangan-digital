'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function DashboardContent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/dashboard/stats-jwt', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Gagal mengambil data dashboard');

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-20">
        <span className="spinner-border text-primary" role="status"></span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="alert alert-danger" role="alert">
        {error || 'Gagal memuat data dashboard.'}
      </div>
    );
  }

  const chartData = {
    labels: stats?.overview?.userGrowth?.map((item) => item.date) || [],
    datasets: [
      {
        label: 'User Growth',
        data: stats?.overview?.userGrowth?.map((item) => item.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Invitation Growth',
        data: stats?.overview?.invitationGrowth?.map((item) => item.count) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="app-main flex-column flex-row-fluid" id="kt_app_main">
      <div className="app-content flex-column-fluid" id="kt_app_content">
        <div className="app-container container-xxl">

          {/* STAT CARDS */}
          <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
            {[
              { title: 'Total Users', value: stats?.overview?.totalUsers },
              { title: 'Total Invitations', value: stats?.overview?.totalInvitations },
              { title: 'New Users This Week', value: stats?.overview?.newUsersThisWeek },
              {
                title: 'User Growth %',
                value: `${stats?.overview?.userGrowthPercentage >= 0 ? '+' : ''}${(stats?.overview?.userGrowthPercentage ?? 0).toFixed(1)}%`
              },
            ].map((item, i) => (
              <div className="col-md-6 col-xl-3" key={i}>
                <div className="card h-100">
                  <div className="card-body">
                    <div className="fs-7 text-gray-600 fw-semibold">{item.title}</div>
                    <div className="fs-2hx fw-bold text-dark">{item.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CHART */}
          <div className="card mb-10">
            <div className="card-header">
              <h3 className="card-title">Growth Chart</h3>
            </div>
            <div className="card-body" style={{ minHeight: '300px' }}>
              <Line data={chartData} />
            </div>
          </div>

          {/* TIMELINE */}
          <div className="card mb-10">
            <div className="card-header">
              <h3 className="card-title">Activity Timeline</h3>
            </div>
            <div className="card-body">
              <div className="timeline">
                {stats?.timeline?.length > 0 ? (
                  stats.timeline.map((event, i) => (
                    <div className="timeline-item" key={i}>
                      <div className="timeline-line w-40px"></div>
                      <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
                        <div className="symbol-label bg-primary text-white">{i + 1}</div>
                      </div>
                      <div className="timeline-content mb-10 mt-n1">
                        <div className="pe-3 mb-2">
                          <div className="fs-5 fw-semibold mb-1">{event.title}</div>
                          <div className="d-flex align-items-center mt-1 fs-7">
                            <div className="text-muted me-2">{event.timestamp}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-600 fw-semibold">Tidak ada aktivitas terbaru</div>
                )}
              </div>
            </div>
          </div>

          {/* ACTIVE INVITATIONS TABLE */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Active Invitations</h3>
            </div>
            <div className="card-body table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {stats?.activeInvitationsDetail?.length > 0 ? (
                <table className="table table-striped gy-5 gs-7 border rounded">
                  <thead>
                    <tr className="fw-bold fs-6 text-gray-800 border-bottom-2 border-gray-200">
                      <th>Name</th>
                      <th>Template</th>
                      <th>Created</th>
                      <th>RSVPs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.activeInvitationsDetail.slice(0, 10).map((inv) => (
                      <tr key={inv.slug}>
                        <td>{inv.name}</td>
                        <td>{inv.template}</td>
                        <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td>{inv.rsvpCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-600 fw-semibold py-10 text-center">Tidak ada data undangan aktif</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
