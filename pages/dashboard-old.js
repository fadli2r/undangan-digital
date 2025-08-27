import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import UserLayout from "../components/layouts/UserLayout";

// Import komponen dashboard yang baru
import {
  KPICard,
  NotificationPanel,
  InvitationTable,
  UpcomingEventsCard,
  QuickActionsCard,
  TipsCard,
  ChartCard
} from "../components/dashboard";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [stats, setStats] = useState({
    undanganAktif: 0,
    totalPengunjung: 0,
    totalRSVP: 0,
    totalUcapan: 0,
    pengunjung7Hari: [], // optional dari API
    rsvp7Hari: [],       // optional dari API
  });
  const [undanganTerbaru, setUndanganTerbaru] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.replace("/login"); return; }

    const fetchDashboard = async () => {
      try {
        const r = await fetch(`/api/dashboard/stats?email=${session.user.email}`);
        const d = await r.json();
        setStats((s) => ({
          ...s,
          ...d.stats,
          pengunjung7Hari: Array.isArray(d.stats?.pengunjung7Hari) ? d.stats.pengunjung7Hari : [],
          rsvp7Hari: Array.isArray(d.stats?.rsvp7Hari) ? d.stats.rsvp7Hari : [],
        }));
        setUndanganTerbaru(d.recentInvitations || []);
        setNotifikasi(d.notifications || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [session, status, router]);

  const computeDelta = (arr) => {
    if (!arr?.length) return 0;
    const mid = Math.floor(arr.length / 2);
    const a = arr.slice(0, mid).reduce((x, y) => x + y, 0);
    const b = arr.slice(mid).reduce((x, y) => x + y, 0);
    const denom = a || 1;
    return Math.round(((b - a) / denom) * 100);
  };

  const pengunjungDelta = computeDelta(stats.pengunjung7Hari);
  const rsvpDelta = computeDelta(stats.rsvp7Hari);

  const conversion = useMemo(() => {
    const denom = stats.totalPengunjung || 0;
    return denom ? Math.round((stats.totalRSVP / denom) * 100) : 0;
  }, [stats.totalPengunjung, stats.totalRSVP]);

  const avgUcapanPerUndangan = useMemo(() => {
    const denom = stats.undanganAktif || undanganTerbaru.length || 0;
    return denom ? Math.round(stats.totalUcapan / denom) : 0;
  }, [stats.totalUcapan, stats.undanganAktif, undanganTerbaru.length]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    const fourteenDaysFromNow = 14 * 24 * 60 * 60 * 1000;
    return undanganTerbaru
      .filter((invitation) => {
        if (!invitation.tanggalAcara) return false;
        const eventTime = new Date(invitation.tanggalAcara).getTime();
        return eventTime - now <= fourteenDaysFromNow && eventTime >= now;
      })
      .sort((a, b) => new Date(a.tanggalAcara) - new Date(b.tanggalAcara))
      .slice(0, 5);
  }, [undanganTerbaru]);

  // Event handlers
  const handleEditInvitation = (invitation) => {
    router.push(`/edit-undangan/${invitation.slug}`);
  };

  const handleViewInvitation = (invitation) => {
    window.open(`/undangan/${invitation.custom_slug || invitation.slug}`, '_blank');
  };

  const handleDeleteInvitation = (invitation) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus undangan "${invitation.nama}"?`)) {
      // TODO: Implement delete functionality
      alert("Fitur hapus undangan akan segera tersedia");
    }
  };

  if (loading || status === "loading") {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center min-h-300px">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      {/* KPI Row ala Demo 3 */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-xxl-3 col-xl-6">
          <div className="card card-flush h-md-50" style={{ backgroundColor: "#F1416C" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div className="card-title d-flex flex-column">
                  <span className="fs-2hx fw-bold text-white lh-1">{stats.undanganAktif}</span>
                  <span className="text-white opacity-75 pt-1 fw-semibold fs-6">Undangan Aktif</span>
                </div>
                <i className="ki-duotone ki-calendar fs-2x text-white opacity-75">
                  <span className="path1"></span><span className="path2"></span>
                </i>
              </div>
              <div className="d-flex justify-content-between mt-4">
                <span className="fw-bolder fs-7 text-white opacity-75">Rata ucapan / undangan</span>
                <span className="fw-bold fs-7 text-white">{avgUcapanPerUndangan}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xxl-3 col-xl-6">
          <KPICard
            title="Total Pengunjung"
            value={stats.totalPengunjung}
            icon="ki-duotone ki-eye"
            backgroundColor="#7239EA"
            trend={{
              value: pengunjungDelta,
              label: "Perbandingan paruh minggu terakhir"
            }}
          />
        </div>

        <div className="col-xxl-3 col-xl-6">
          <KPICard
            title="Total RSVP"
            value={stats.totalRSVP}
            icon="ki-duotone ki-check-circle"
            backgroundColor="#17C653"
            trend={{
              value: rsvpDelta,
              label: "Perbandingan paruh minggu terakhir"
            }}
            badge={
              <>
                <div className="d-flex justify-content-between">
                  <span className="fs-6 text-white opacity-75">Conversion</span>
                  <span className="fs-6 fw-bolder text-white">{conversion}%</span>
                </div>
                <div className="progress mt-2" style={{ height: 6 }}>
                  <div 
                    className="progress-bar bg-white bg-opacity-25" 
                    role="progressbar" 
                    style={{ width: `${Math.min(conversion, 100)}%` }} 
                  />
                </div>
              </>
            }
          />
        </div>

        <div className="col-xxl-3 col-xl-6">
          <KPICard
            title="Ucapan & Doa"
            value={stats.totalUcapan}
            icon="ki-duotone ki-message-text-2"
            backgroundColor="#FFC700"
            textColor="#1B1B29"
            subtitle={{
              label: "Ucapan terbaru hari ini",
              value: "12"
            }}
          />
        </div>
      </div>

      {/* Chart + Tabel & Sidebar */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-xl-8">
          {/* Chart */}
          <ChartCard
            title="Statistik Pengunjung (7 Hari)"
            subtitle="Tren pengunjung undangan dalam seminggu terakhir"
            type="area"
            categories={["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]}
            series={[
              { 
                name: "Pengunjung", 
                data: stats.pengunjung7Hari?.length ? stats.pengunjung7Hari : [12, 19, 3, 5, 2, 3, 9] 
              }
            ]}
            colors={["#0d6efd"]}
            loading={loading}
          />

          {/* Invitation Table */}
          <div className="mt-5">
            <InvitationTable
              invitations={undanganTerbaru}
              loading={loading}
              onEdit={handleEditInvitation}
              onView={handleViewInvitation}
              onDelete={handleDeleteInvitation}
            />
          </div>

          {/* Quick Actions */}
          <div className="mt-5">
            <QuickActionsCard />
          </div>
        </div>

        {/* Sidebar kanan */}
        <div className="col-xl-4">
          {/* Notifikasi */}
          <div className="card card-flush h-xl-50 mb-5">
            <div className="card-header pt-7">
              <h3 className="card-title align-items-start flex-column">
                <span className="card-label fw-bold fs-3 mb-1">Notifikasi</span>
                <span className="text-muted mt-1 fw-semibold fs-7">Aktivitas terbaru</span>
              </h3>
            </div>
            <div className="card-body pt-6">
              {notifikasi.length ? (
                <div className="timeline-label">
                  {notifikasi.map((n, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-label fw-bold text-gray-800 fs-6">{n.waktu}</div>
                      <div className="timeline-badge"><i className="fa fa-genderless text-warning fs-1"></i></div>
                      <div className="fw-mormal timeline-content text-muted ps-3">{n.pesan}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <i className="ki-duotone ki-notification-bing fs-3x text-gray-300 mb-3"><span className="path1"></span><span className="path2"></span><span className="path3"></span></i>
                  <div className="text-muted fs-6 fw-semibold">Belum ada notifikasi</div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming */}
          <div className="card card-flush h-xl-50 mb-5">
            <div className="card-header">
              <h3 className="card-title fw-bold">Undangan Mendekati Acara</h3>
              <span className="text-muted fs-7">≤ 14 hari ke depan</span>
            </div>
            <div className="card-body">
              {upcomingEvents.length ? (
                <ul className="list-unstyled m-0">
                  {upcomingEvents.map((u) => (
                    <li key={u._id} className="d-flex align-items-center justify-content-between py-3 border-bottom">
                      <div className="d-flex flex-column">
                        <a href={`/edit-undangan/${u.slug}`} className="fw-bold text-gray-900 text-hover-primary">{u.nama}</a>
                        <span className="text-muted fs-7">
                          {new Date(u.tanggalAcara).toLocaleDateString("id-ID", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <span className={`badge ${getStatusBadge(u.status)} fw-bold`}>{u.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted">Tidak ada acara dalam 14 hari.</div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="card card-flush">
            <div className="card-header"><h3 className="card-title fw-bold">Tips Optimasi</h3></div>
            <div className="card-body">
              <ul className="m-0">
                <li className="mb-3"><span className="fw-semibold">Conversion {conversion}%</span> <span className="text-muted">– dorong tamu RSVP via reminder & grup.</span></li>
                <li className="mb-3"><span className="fw-semibold">Rata ucapan {avgUcapanPerUndangan}</span> <span className="text-muted">– tambahkan CTA “Tulis Ucapan”.</span></li>
                <li className="mb-3"><span className="fw-semibold">Pengunjung {pengunjungDelta >= 0 ? "naik" : "turun"} {Math.abs(pengunjungDelta)}%</span> <span className="text-muted">– {pengunjungDelta >= 0 ? "pertahankan momentum" : "coba bagikan ulang link"}.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
