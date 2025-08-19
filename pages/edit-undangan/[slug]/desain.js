import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { templateList } from "../../../data/templates";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";

export default function Desain() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [undangan, setUndangan] = useState(null);
  const [success, setSuccess] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Ambil data undangan (untuk tahu template yang sedang dipakai)
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        setUndangan(res.undangan);
        setSelectedTemplate(res.undangan?.template || "");
        setLoading(false);
      })
      .catch(err => {
        setError("Gagal load data undangan");
        setLoading(false);
      });
  }, [slug]);

  // Fungsi update template
  const handleChangeTemplate = async (tpl) => {
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/invitation/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, field: { template: tpl } })
    });
    if (res.ok) {
      setSelectedTemplate(tpl);
      setSuccess("Template berhasil diupdate!");
      setLoading(false);
      setTimeout(() => setSuccess(""), 2000);
    } else {
      const data = await res.json();
      setError(data.message || "Gagal update template");
      setLoading(false);
    }
  };

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
          <p>{error}</p>
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
      <BackButton />
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Ubah Desain / Template Undangan</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="mb-6">
            <div className="d-flex align-items-center">
              <span className="fw-bold me-3">Template sekarang:</span>
              <span className="badge badge-light-primary">
                {selectedTemplate || "-"}
              </span>
            </div>
          </div>

          {success && (
            <div className="alert alert-success mb-4">
              <i className="ki-duotone ki-check-circle fs-2 me-2">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              {success}
            </div>
          )}

          {error && (
            <div className="alert alert-danger mb-4">
              <i className="ki-duotone ki-cross-circle fs-2 me-2">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              {error}
            </div>
          )}

          {/* List Template */}
          <div className="row g-6 g-xl-9">
            {templateList.map((tpl) => (
              <div key={tpl.slug} className="col-md-6 col-lg-4">
                <div className={`card card-flush h-100 ${selectedTemplate === tpl.slug ? "border-primary" : ""}`}>
                  <div className="card-header pt-7">
                    <div className="card-title">
                      <img 
                        src={tpl.thumbnail} 
                        alt={tpl.name} 
                        className="w-100 h-150px object-fit-cover rounded" 
                      />
                    </div>
                  </div>
                  <div className="card-body pt-0 text-center">
                    <div className="fs-4 fw-bold text-gray-900 mb-2">{tpl.name}</div>
                    <div className="fs-6 fw-semibold text-gray-600 mb-4">{tpl.description}</div>
                    
                    {selectedTemplate === tpl.slug && (
                      <div className="badge badge-light-success mb-3">
                        <i className="ki-duotone ki-check fs-2 me-1">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        Template Aktif
                      </div>
                    )}
                    
                    <button
                      className={`btn w-100 ${
                        selectedTemplate === tpl.slug 
                          ? "btn-light-secondary" 
                          : "btn-primary"
                      }`}
                      onClick={() => handleChangeTemplate(tpl.slug)}
                      disabled={selectedTemplate === tpl.slug || loading}
                    >
                      {loading && (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      )}
                      {selectedTemplate === tpl.slug ? "Sedang Digunakan" : "Pilih Template"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
