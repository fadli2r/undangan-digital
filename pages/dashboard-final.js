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
    pengunjung7Hari: [],
    rsvp7Hari: [],
  });
  const [undanganTerbaru, setUndanganTerbaru] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { 
      router.replace("/login"); 
      return; 
    }

    const fetchDashboard = async () => {
      try {
        const response = await fetch(`/api/dashboard/stats?email=${session.user.email}`);
        const data = await response.json();
        
        setStats((prevStats) => ({
          ...prevStats,
          ...data.stats,
          pengunjung7Hari: Array.isArray(data.stats?.pengunjung7Hari) ? data.stats.pengunjung7Hari : [],
          rsvp7Hari: Array.isArray(data.stats?.rsvp7Hari) ? data.stats.rsvp7Hari : [],
        }));
        setUndanganTerbaru(data.recentInvitations || []);
        setNotifikasi(data.notifications || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [session, status, router]);

  // Computed values
  const computeDelta = (arr) => {
    if (!arr?.length) return 0;
    const mid = Math.floor(arr.length / 2);
    const firstHalf = arr.slice(0, mid).reduce((x, y) => x + y, 0);
    const secondHalf = arr.slice(mid).reduce((x, y) => x + y, 0);
    const denominator = firstHalf || 1;
    return Math.round(((secondHalf - firstHalf) / denominator) * 100);
  };

  const pengunjungDelta = computeDelta(stats.pengunjung7Hari);
  const rsvpDelta = computeDelta(stats.rsvp7Hari);

  const conversion = useMemo(() => {
    const denominator = stats.totalPengunjung || 0;
    return denominator ? Math.round((stats.totalRSVP / denominator) * 100) : 0;
  }, [stats.totalPengunjung, stats.totalRSVP]);

  const avgUcapanPerUndangan = useMemo(() => {
    const denominator = stats.undanganAktif || undanganTerbaru.length || 0;
    return denominator ? Math.round(stats.totalUcapan / denominator) : 0;
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

  // Loading state
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
      {/* KPI Cards Row */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-xxl-3 col-xl-6">
          <KPICard
            title="Undangan Aktif"
            value={stats.undanganAktif}
            icon="ki-duotone ki-calendar"
            backgroundColor="#F1416C"
            subtitle={{
              label: "Rata ucapan / undangan",
              value: avgUcapanPerUndangan
            }}
          />
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

      {/* Main Content Row */}
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

        {/* Sidebar */}
        <div className="col-xl-4">
          {/* Notifications */}
          <NotificationPanel
            notifications={notifikasi}
            loading={loading}
          />

          {/* Upcoming Events */}
          <UpcomingEventsCard
            events={upcomingEvents}
            loading={loading}
          />

          {/* Tips */}
          <TipsCard
            stats={{
              conversion,
              avgUcapanPerUndangan,
              pengunjungDelta,
              totalPengunjung: stats.totalPengunjung,
              totalRSVP: stats.totalRSVP
            }}
          />
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-xl-6">
          <ChartCard
            title="RSVP Trend (7 Hari)"
            subtitle="Perkembangan konfirmasi kehadiran"
            type="line"
            categories={["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]}
            series={[
              { 
                name: "RSVP", 
                data: stats.rsvp7Hari?.length ? stats.rsvp7Hari : [2, 5, 1, 3, 1, 2, 4] 
              }
            ]}
            colors={["#17C653"]}
            height={250}
            loading={loading}
          />
        </div>
        <div className="col-xl-6">
          <ChartCard
            title="Status Undangan"
            subtitle="Distribusi status undangan Anda"
            type="donut"
            series={[
              undanganTerbaru.filter(inv => inv.status === 'aktif').length,
              undanganTerbaru.filter(inv => inv.status === 'draft').length,
              undanganTerbaru.filter(inv => inv.status === 'expired').length
            ]}
            categories={["Aktif", "Draft", "Expired"]}
            colors={["#17C653", "#FFC700", "#F1416C"]}
            height={250}
            loading={loading}
            showLegend={true}
          />
        </div>
      </div>
    </UserLayout>
  );
}
