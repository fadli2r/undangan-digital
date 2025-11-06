import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DownloadFeatures from "../../../components/DownloadFeaturesFixed";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";
import SeoHead from '@/components/SeoHead';

export default function Download() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [undangan, setUndangan] = useState(null);
  const [error, setError] = useState("");

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
        console.error("Error fetching invitation:", err);
        setError("Gagal memuat data undangan");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <UserLayout>
      <SeoHead
        title="Download & Export "
        description="Download undangan dalam format PDF atau export data."
        canonical="/edit-undangan/[slug]/download"
      />
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
        <div className="card card-flush shadow-sm">
          <div className="card-body">
            <div className="alert alert-danger">
              <h4 className="alert-heading">Error!</h4>
              <p className="mb-3">{error}</p>
              <BackButton />
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      {/* Header */}
      <div className="card card-flush shadow-sm mb-10">
        <div className="card-header d-flex align-items-center justify-content-between">
          <div className="card-title">
            <h2 className="fw-bold">Download & Export</h2>
            <div className="text-muted fs-6">
              Undangan:{" "}
              <span className="fw-bold text-gray-800">
                {undangan.mempelai?.pria} & {undangan.mempelai?.wanita}
              </span>
            </div>
          </div>
          <BackButton />
        </div>
      </div>

      {/* Download Features */}
      <div className="card card-flush shadow-sm mb-10">
        <div className="card-header">
          <div className="card-title">
            <h3 className="fw-bold">Download & Export</h3>
            <span className="text-muted fs-6 ms-2">
              Download undangan dalam format PDF atau export data ucapan
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-6">
            {/* PDF */}
            <div className="col-md-4">
              <div className="card card-bordered hover-elevate-up text-center py-10">
                <i className="ki-duotone ki-file-down fs-3x text-primary mb-4">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <h4 className="fw-bold mb-2">Download PDF</h4>
                <p className="text-muted fs-7 mb-4">
                  Undangan dalam format PDF untuk dicetak
                </p>
                <button className="btn btn-primary">Download PDF</button>
              </div>
            </div>

            {/* Excel */}
            <div className="col-md-4">
              <div className="card card-bordered hover-elevate-up text-center py-10">
                <i className="ki-duotone ki-file-excel fs-3x text-success mb-4">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <h4 className="fw-bold mb-2">Export Excel</h4>
                <p className="text-muted fs-7 mb-4">
                  Export data RSVP atau tamu dalam format Excel
                </p>
                <button className="btn btn-success">Export Excel</button>
              </div>
            </div>

            {/* CSV */}
            <div className="col-md-4">
              <div className="card card-bordered hover-elevate-up text-center py-10">
                <i className="ki-duotone ki-file fs-3x text-info mb-4">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <h4 className="fw-bold mb-2">Export CSV</h4>
                <p className="text-muted fs-7 mb-4">
                  Export daftar tamu dalam format CSV
                </p>
                <button className="btn btn-info">Export CSV</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="card card-flush shadow-sm">
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
                  <i className="ki-duotone ki-eye fs-3x text-primary mb-3"></i>
                  <div className="fs-2hx fw-bold text-primary mb-2">
                    {undangan.views || 0}
                  </div>
                  <div className="fs-6 fw-semibold text-gray-600">
                    Total Views
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light-success">
                <div className="card-body text-center py-8">
                  <i className="ki-duotone ki-message-text-2 fs-3x text-success mb-3"></i>
                  <div className="fs-2hx fw-bold text-success mb-2">
                    {undangan.ucapan?.length || 0}
                  </div>
                  <div className="fs-6 fw-semibold text-gray-600">
                    Ucapan & Doa
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-light-info">
                <div className="card-body text-center py-8">
                  <i className="ki-duotone ki-check-square fs-3x text-info mb-3"></i>
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
    </UserLayout>
  );
}
