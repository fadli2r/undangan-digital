import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";

export default function ListRSVP() {
  const router = useRouter();
  const { slug } = router.query;
  const [rsvpList, setRsvpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    hadir: 0,
    tidakHadir: 0,
    totalTamu: 0
  });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        const rsvpData = res.undangan?.rsvp || [];
        setRsvpList(rsvpData);
        
        // Calculate stats
        const total = rsvpData.length;
        const hadir = rsvpData.filter(r => r.status === 'Hadir').length;
        const tidakHadir = rsvpData.filter(r => r.status === 'Tidak Hadir').length;
        const totalTamu = rsvpData.reduce((sum, r) => sum + (parseInt(r.jumlah) || 0), 0);
        
        setStats({ total, hadir, tidakHadir, totalTamu });
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
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
      <BackButton />
      {/* Statistics Cards */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-md-3">
          <div className="card bg-light-primary">
            <div className="card-body text-center py-8">
              <i className="ki-duotone ki-people fs-3x text-primary mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
                <span className="path5"></span>
              </i>
              <div className="fs-2hx fw-bold text-primary mb-2">{stats.total}</div>
              <div className="fs-6 fw-semibold text-gray-600">Total RSVP</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light-success">
            <div className="card-body text-center py-8">
              <i className="ki-duotone ki-check-circle fs-3x text-success mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <div className="fs-2hx fw-bold text-success mb-2">{stats.hadir}</div>
              <div className="fs-6 fw-semibold text-gray-600">Akan Hadir</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light-danger">
            <div className="card-body text-center py-8">
              <i className="ki-duotone ki-cross-circle fs-3x text-danger mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <div className="fs-2hx fw-bold text-danger mb-2">{stats.tidakHadir}</div>
              <div className="fs-6 fw-semibold text-gray-600">Tidak Hadir</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light-info">
            <div className="card-body text-center py-8">
              <i className="ki-duotone ki-user-tick fs-3x text-info mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
              <div className="fs-2hx fw-bold text-info mb-2">{stats.totalTamu}</div>
              <div className="fs-6 fw-semibold text-gray-600">Total Tamu</div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP List */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Daftar RSVP</h2>
          </div>
        </div>
        <div className="card-body">
          {rsvpList.length === 0 ? (
            <div className="text-center py-10">
              <i className="ki-duotone ki-questionnaire-tablet fs-3x text-muted mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <div className="text-muted fs-6">Belum ada RSVP masuk</div>
              <div className="text-muted fs-7">Tamu akan muncul di sini setelah mengisi form RSVP</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-row-dashed table-row-gray-300 gy-7">
                <thead>
                  <tr className="fw-bold fs-6 text-gray-800">
                    <th className="min-w-125px">Nama</th>
                    <th className="min-w-100px">Status</th>
                    <th className="min-w-80px">Jumlah Tamu</th>
                    <th className="min-w-150px">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvpList.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="symbol symbol-35px symbol-circle me-3">
                            <div className="symbol-label bg-light-primary text-primary fs-6 fw-bold">
                              {r.nama.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="fw-bold">{r.nama}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          r.status === 'Hadir' 
                            ? 'badge-light-success' 
                            : 'badge-light-danger'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="ki-duotone ki-people fs-2 me-2 text-muted">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                            <span className="path5"></span>
                          </i>
                          <span className="fw-bold">{r.jumlah}</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-muted">
                          {new Date(r.waktu).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
