import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";
import SeoHead from '@/components/SeoHead';

export default function ListUcapan() {
  const router = useRouter();
  const { slug } = router.query;
  const [ucapanList, setUcapanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    today: 0
  });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        const ucapanData = res.undangan?.ucapan || [];
        setUcapanList(ucapanData);
        
        // Calculate stats
        const total = ucapanData.length;
        const today = ucapanData.filter(u => {
          const date = new Date(u.waktu);
          const now = new Date();
          return date.toDateString() === now.toDateString();
        }).length;
        
        setStats({ total, today });
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <UserLayout>
      <SeoHead
        title="Daftar Ucapan "
        description="Lihat ucapan dan doa dari tamu."
        canonical="/edit-undangan/[slug]/ucapan"
      />
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
        <div className="col-md-6">
          <div className="card bg-light-primary">
            <div className="card-body text-center py-8">
              <i className="ki-duotone ki-message-text-2 fs-3x text-primary mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
              <div className="fs-2hx fw-bold text-primary mb-2">{stats.total}</div>
              <div className="fs-6 fw-semibold text-gray-600">Total Ucapan</div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-light-success">
            <div className="card-body text-center py-8">
              <i className="ki-duotone ki-calendar fs-3x text-success mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <div className="fs-2hx fw-bold text-success mb-2">{stats.today}</div>
              <div className="fs-6 fw-semibold text-gray-600">Ucapan Hari Ini</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ucapan List */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Daftar Ucapan & Doa</h2>
          </div>
        </div>
        <div className="card-body">
          {ucapanList.length === 0 ? (
            <div className="text-center py-10">
              <i className="ki-duotone ki-message-text fs-3x text-muted mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <div className="text-muted fs-6">Belum ada ucapan masuk</div>
              <div className="text-muted fs-7">Ucapan akan muncul di sini setelah tamu mengisi form ucapan</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-row-dashed table-row-gray-300 gy-7">
                <thead>
                  <tr className="fw-bold fs-6 text-gray-800">
                    <th className="min-w-125px">Nama</th>
                    <th className="min-w-300px">Ucapan</th>
                    <th className="min-w-150px">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {ucapanList.map((ucapan, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="symbol symbol-35px symbol-circle me-3">
                            <div className="symbol-label bg-light-primary text-primary fs-6 fw-bold">
                              {ucapan.nama.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="fw-bold">{ucapan.nama}</div>
                        </div>
                      </td>
                      <td>
                        <div className="text-gray-800">{ucapan.pesan}</div>
                      </td>
                      <td>
                        <div className="text-muted">
                          {new Date(ucapan.waktu).toLocaleDateString('id-ID', {
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
