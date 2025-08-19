import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DownloadFeatures from "../../../components/DownloadFeaturesFixed";
import UserLayout from "../../../components/layouts/UserLayout";

export default function Download() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [undangan, setUndangan] = useState(null);
  const [error, setError] = useState("");

  // Fetch data undangan
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        if (res.undangan) {
          setUndangan(res.undangan);
        } else {
          setError("Undangan tidak ditemukan");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching invitation:', err);
        setError("Gagal memuat data undangan");
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

  if (error) {
    return (
      <UserLayout>
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error!</h4>
          <p className="mb-3">{error}</p>
          <button 
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            Kembali
          </button>
        </div>
      </UserLayout>
    );
  }

  if (!undangan) {
    return (
      <UserLayout>
        <div className="alert alert-warning">
          <h4 className="alert-heading">Data Tidak Ditemukan</h4>
          <p>Undangan tidak ditemukan.</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      {/* Header */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-wrap align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <h1 className="fs-2hx fw-bold text-gray-900 mb-3">
                    Download & Export
                  </h1>
                  <div className="text-muted fs-6">
                    Undangan: <span className="fw-bold text-gray-800">
                      {undangan.mempelai?.pria} & {undangan.mempelai?.wanita}
                    </span>
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <button
                    onClick={() => router.back()}
                    className="btn btn-light-secondary"
                  >
                    <i className="ki-duotone ki-arrow-left fs-2">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Kembali
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Features Component */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <DownloadFeatures slug={slug} invitationData={undangan} />
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-5 g-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold">Statistik Undangan</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-6 g-xl-9">
                <div className="col-md-4">
                  <div className="card bg-light-primary">
                    <div className="card-body text-center py-8">
                      <i className="ki-duotone ki-eye fs-3x text-primary mb-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                      </i>
                      <div className="fs-2hx fw-bold text-primary mb-2">
                        {undangan.views || 0}
                      </div>
                      <div className="fs-6 fw-semibold text-gray-600">Total Views</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light-success">
                    <div className="card-body text-center py-8">
                      <i className="ki-duotone ki-message-text-2 fs-3x text-success mb-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                      </i>
                      <div className="fs-2hx fw-bold text-success mb-2">
                        {undangan.ucapan?.length || 0}
                      </div>
                      <div className="fs-6 fw-semibold text-gray-600">Ucapan & Doa</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light-info">
                    <div className="card-body text-center py-8">
                      <i className="ki-duotone ki-check-square fs-3x text-info mb-3">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                      </i>
                      <div className="fs-2hx fw-bold text-info mb-2">
                        {undangan.rsvp?.length || 0}
                      </div>
                      <div className="fs-6 fw-semibold text-gray-600">RSVP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
