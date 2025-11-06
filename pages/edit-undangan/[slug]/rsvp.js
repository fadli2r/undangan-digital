import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";
import SeoHead from '@/components/SeoHead';

export default function ListRSVP() {
  const router = useRouter();
  const { slug } = router.query;

  const [rsvpList, setRsvpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    akanHadir: 0,
    tidakHadir: 0,
    ragu: 0,
    belumIsi: 0,
    totalTamu: 0,
  });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    fetch(`/api/invitation/detail?slug=${slug}`)
      .then((res) => res.json())
      .then((res) => {
        const tamu = res.undangan?.tamu || [];
        const attendance = res.undangan?.attendance || [];

        // Map attendance untuk info sudah check-in
        const attMap = new Map();
        attendance.forEach((a) => {
          attMap.set(String(a.name || "").toLowerCase(), a);
        });

        // Ambil langsung status dari tamu
        const merged = tamu.map((t) => {
          const key = String(t.nama || "").toLowerCase();
          const attData = attMap.get(key) || null;

          return {
            nama: t.nama,
            kontak: t.kontak || "",
            status: t.status_rsvp || "Belum Isi", // ambil dari field tamu
            jumlah: t.jumlah_rsvp || 0,
            waktu: t.waktu_rsvp || null,
            sudahCheckin: !!attData,
          };
        });

        // Hitung statistik
        const total = merged.length;
        const akanHadir = merged.filter((r) => r.status === "hadir").length;
        const tidakHadir = merged.filter((r) => r.status === "tidak_hadir").length;
        const ragu = merged.filter((r) => r.status === "ragu").length;
        const belumIsi = merged.filter((r) => r.status === "Belum Isi").length;
        const totalTamu = merged.reduce(
          (sum, r) => sum + (parseInt(r.jumlah) || 0),
          0
        );

        setRsvpList(merged);
        setStats({ total, akanHadir, tidakHadir, ragu, belumIsi, totalTamu });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <UserLayout>
      <SeoHead
        title="Daftar RSVP "
        description="Lihat dan kelola konfirmasi kehadiran tamu."
        canonical="/edit-undangan/[slug]/rsvp"
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

      {/* Statistik */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-md-2">
          <div className="card bg-light-primary">
            <div className="card-body text-center py-6">
              <div className="fs-2hx fw-bold text-primary mb-2">{stats.total}</div>
              <div className="fs-6 fw-semibold text-gray-600">Total Undangan</div>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-light-success">
            <div className="card-body text-center py-6">
              <div className="fs-2hx fw-bold text-success mb-2">{stats.akanHadir}</div>
              <div className="fs-6 fw-semibold text-gray-600">Akan Hadir</div>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-light-danger">
            <div className="card-body text-center py-6">
              <div className="fs-2hx fw-bold text-danger mb-2">{stats.tidakHadir}</div>
              <div className="fs-6 fw-semibold text-gray-600">Tidak Hadir</div>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-light-info">
            <div className="card-body text-center py-6">
              <div className="fs-2hx fw-bold text-info mb-2">{stats.ragu}</div>
              <div className="fs-6 fw-semibold text-gray-600">Masih Ragu</div>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-light-warning">
            <div className="card-body text-center py-6">
              <div className="fs-2hx fw-bold text-warning mb-2">{stats.belumIsi}</div>
              <div className="fs-6 fw-semibold text-gray-600">Belum Isi</div>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-light-secondary">
            <div className="card-body text-center py-6">
              <div className="fs-2hx fw-bold text-secondary mb-2">{stats.totalTamu}</div>
              <div className="fs-6 fw-semibold text-gray-600">Total Orang</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar RSVP */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Daftar RSVP</h2>
          </div>
        </div>
        <div className="card-body">
          {rsvpList.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-muted fs-6">Belum ada tamu dalam daftar undangan</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-row-dashed table-row-gray-300 gy-7">
                <thead>
                  <tr className="fw-bold fs-6 text-gray-800">
                    <th>Nama</th>
                    <th>Status RSVP</th>
                    <th>Jumlah</th>
                    <th>Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvpList.map((r, i) => (
                    <tr key={i}>
                      <td>{r.nama}</td>
                      <td>
                        {r.status === "hadir" ? (
                          <span className="badge badge-light-success">Akan Hadir</span>
                        ) : r.status === "tidak_hadir" ? (
                          <span className="badge badge-light-danger">Tidak Hadir</span>
                        ) : r.status === "ragu" ? (
                          <span className="badge badge-light-info">Ragu</span>
                        ) : (
                          <span className="badge badge-light-warning">Belum Isi</span>
                        )}
                      </td>
                      <td>{r.jumlah || "-"}</td>
                      <td>{r.waktu ? new Date(r.waktu).toLocaleString("id-ID") : "—"}</td>
                      
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
