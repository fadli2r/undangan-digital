import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import UserLayout from "../components/layouts/UserLayout";
import SeoHead from '@/components/SeoHead';

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
    window.open(`/${invitation.custom_slug || invitation.slug}`, '_blank');
  };

  const handleDeleteInvitation = (invitation) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus undangan "${invitation.nama}"?`)) {
      // TODO: Implement delete functionality
      alert("Fitur hapus undangan akan segera tersedia");
    }
  };


  return (
    <UserLayout>
      <SeoHead
        title="Dashboard "
        description="Dashboard pengelolaan undangan digital Anda."
        canonical="/dashboard"
      />
      {/* Header Section */}
      <div className="d-flex flex-wrap flex-stack mb-6">
        <h3 className="fw-bold my-2">
          
          <span className="fs-6 text-gray-400 fw-semibold ms-1">Selamat datang kembali!</span>
        </h3>
        <div className="d-flex my-2">
          <div className="d-flex align-items-center position-relative me-4">
            <i className="ki-duotone ki-calendar-8 fs-3 position-absolute ms-3">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
              <span className="path4"></span>
              <span className="path5"></span>
              <span className="path6"></span>
            </i>
            <input 
              className="form-control form-control-solid w-150px ps-13" 
              placeholder="Pilih tanggal" 
              type="text"
              defaultValue={new Date().toLocaleDateString('id-ID')}
            />
          </div>
          <a href="/pilih-template" className="btn btn-primary">
            <i className="ki-duotone ki-plus fs-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Buat Undangan Baru
          </a> 
        </div>
      </div>

      {/* KPI Cards Row */}
<div className="row g-5 g-xl-10 mb-5 mb-xl-10">
  <div className="col-xxl-3 col-xl-6 col-lg-6 col-md-6">
    <KPICard
      title="Undangan Aktif"
      value={stats.undanganAktif}
      icon="ki-calendar"
      backgroundColor="#F1416C"
      subtitle={{ label: "Rata ucapan / undangan", value: avgUcapanPerUndangan }}
    />
  </div>

  <div className="col-xxl-3 col-xl-6 col-lg-6 col-md-6">
    <KPICard
      title="Total Pengunjung"
      value={stats.totalPengunjung}
      icon="ki-eye"
      backgroundColor="#7239EA"
      trend={{ value: pengunjungDelta, label: "this week" }}
    />
  </div>

  <div className="col-xxl-3 col-xl-6 col-lg-6 col-md-6">
    <KPICard
      title="Total RSVP"
      value={stats.totalRSVP}
      icon="ki-check-circle"
      backgroundColor="#17C653"
      trend={{ value: rsvpDelta, label: "this week" }}
      
    />
  </div>

  <div className="col-xxl-3 col-xl-6 col-lg-6 col-md-6">
    <KPICard
      title="Ucapan & Doa"
      value={stats.totalUcapan}
      icon="ki-message-text-2"
      backgroundColor="#18C853"
      subtitle={{ label: "Ucapan hari ini" }}
    />
  </div>
</div>

        <div className="mb-5 col-xl-12">

      {/* Main Content Row */}                  <QuickActionsCard />
      </div>

      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">

        {/* Left Column - Charts & Tables */}
        <div className="col-xl-8">
          
          {/* Chart Card */}
          <div className="mb-5">
            <ChartCard
              title="Statistik Pengunjung (7 Hari)"
              categories={["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]}
              series={[
                { 
                  name: "Pengunjung", 
                  data: stats.pengunjung7Hari?.length ? stats.pengunjung7Hari : [12, 19, 3, 5, 2, 3, 9] 
                }
              ]}
            />
          </div>

          {/* Invitation Table */}
          <div className="mb-5">
            <InvitationTable
              invitations={undanganTerbaru}
              loading={loading}
              onEdit={handleEditInvitation}
              onView={handleViewInvitation}
              onDelete={handleDeleteInvitation}
            />
          </div>

          {/* Quick Actions */}
        </div>

        {/* Right Column - Sidebar */}
        <div className="col-xl-4">
          {/* Notifications */}
          <div className="mb-5">
            <NotificationPanel 
              notifications={notifikasi}
              loading={loading}
            />
          </div>

          {/* Upcoming Events */}
          <div className="mb-5">
            <UpcomingEventsCard 
              events={upcomingEvents}
              loading={loading}
            />
          </div>

          {/* Tips Card */}
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
    </UserLayout>
  );
}
