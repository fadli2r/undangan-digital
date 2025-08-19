import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";
import { showAlert, showToast } from "../../../utils/sweetAlert";

export default function Galeri() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [undangan, setUndangan] = useState(null);
  const [galeri, setGaleri] = useState([]);
  const [uploading, setUploading] = useState(false);

  const MAX_FOTO = 10;
  const fileInput = useRef();

  // Ambil data galeri
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        setUndangan(res.undangan);
        setGaleri(res.undangan?.galeri || []);
        setLoading(false);
      });
  }, [slug]);

  // Validate file type
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.';
    }
    if (file.size > 2 * 1024 * 1024) {
      return 'Ukuran file terlalu besar. Maksimal 2MB.';
    }
    return null;
  };

  // Handle upload file
  const handleUpload = async (e) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      // Check total photos limit
      if (galeri.length + files.length > MAX_FOTO) {
        showAlert.error('Batas Upload!', `Maksimal hanya ${MAX_FOTO} foto!`);
        fileInput.current.value = "";
        return;
      }

      // Validate each file
      for (let file of files) {
        const error = validateFile(file);
        if (error) {
          showAlert.error('File Tidak Valid!', error);
          fileInput.current.value = "";
          return;
        }
      }

      setUploading(true);
      
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append("foto", file);
      });

      const res = await fetch("/api/invitation/upload.galeri", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`Upload gagal: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.urls && data.urls.length > 0) {
        const newGaleri = [...galeri, ...data.urls].slice(0, MAX_FOTO);
        
        // Save to invitation
        const updateRes = await fetch("/api/invitation/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, field: { galeri: newGaleri } }),
        });

        if (!updateRes.ok) {
          throw new Error('Gagal menyimpan ke database');
        }

        setGaleri(newGaleri);
        showToast.success(`${data.urls.length} foto berhasil di-upload!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showAlert.error('Gagal!', error.message || "Upload gagal. Silakan coba lagi.");
    } finally {
      setUploading(false);
      fileInput.current.value = "";
    }
  };

  // Hapus foto
  const handleHapus = async (idx) => {
    showAlert.confirm(
      'Hapus foto ini?',
      'Foto akan dihapus permanen',
      'Ya, hapus!',
      'Batal',
      async (result) => {
        if (!result.isConfirmed) return;
        try {
          const newGaleri = galeri.filter((_, i) => i !== idx);
          await fetch("/api/invitation/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, field: { galeri: newGaleri } }),
          });
          setGaleri(newGaleri);
          showToast.success('Foto berhasil dihapus');
        } catch (err) {
          showAlert.error('Gagal!', 'Gagal menghapus foto');
        }
      }
    );
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
      
      {/* Main Photo Section */}
      <div className="card mb-5">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Foto Utama</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="mb-5">
            <label className="form-label fw-bold">Upload Foto Utama</label>
            <div className="mb-4">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const error = validateFile(file);
                    if (error) {
                      showAlert.error('File Tidak Valid!', error);
                      return;
                    }
                    // Handle main photo upload
                    const formData = new FormData();
                    formData.append("foto", file);
                    formData.append("slug", slug);
                    setUploading(true);
                    fetch("/api/invitation/upload-main-photo", {
                      method: "POST",
                      body: formData,
                    })
                    .then(async (res) => {
                      if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                      }
                      return res.json();
                    })
                    .then(data => {
                      if (data.url) {
                        setUndangan({...undangan, main_photo: data.url});
                        showToast.success('Foto utama berhasil diupload dan tersimpan');
                      }
                    })
                    .catch(err => {
                      console.error('Upload error:', err);
                      showAlert.error('Gagal!', err.message || "Gagal mengupload foto utama");
                    })
                    .finally(() => {
                      setUploading(false);
                      e.target.value = "";
                    });
                  }
                }}
                className="form-control"
              />
            </div>
            {undangan.main_photo && (
              <div className="card">
                <div className="card-body p-0 position-relative">
                  <img 
                    src={undangan.main_photo} 
                    className="w-100 h-300px object-fit-cover rounded" 
                    alt="Foto Utama"
                  />
                  <div className="position-absolute top-0 end-0 p-3">
                    <button
                      className="btn btn-icon btn-sm btn-danger"
                      onClick={async () => {
                        showAlert.confirm(
                          'Hapus foto utama?',
                          'Foto akan dihapus permanen',
                          'Ya, hapus!',
                          'Batal',
                          async (result) => {
                            if (!result.isConfirmed) return;
                            try {
                              await fetch("/api/invitation/update", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ 
                                  slug, 
                                  field: { main_photo: "" } 
                                }),
                              });
                              setUndangan({...undangan, main_photo: ""});
                              showToast.success('Foto utama berhasil dihapus');
                            } catch (err) {
                              showAlert.error('Gagal!', 'Gagal menghapus foto utama');
                            }
                          }
                        );
                      }}
                      type="button"
                      disabled={uploading}
                      title="Hapus foto utama"
                    >
                      <i className="ki-duotone ki-trash fs-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                        <span className="path4"></span>
                        <span className="path5"></span>
                      </i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Background Photo Section */}
      <div className="card mb-5">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Foto Background</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="mb-5">
            <label className="form-label fw-bold">Upload Foto Background</label>
            <div className="mb-4">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const error = validateFile(file);
                    if (error) {
                      showAlert.error('File Tidak Valid!', error);
                      return;
                    }
                    // Handle background photo upload
                    const formData = new FormData();
                    formData.append("foto", file);
                    formData.append("slug", slug);
                    setUploading(true);
                    fetch("/api/invitation/upload-background", {
                      method: "POST",
                      body: formData,
                    })
                    .then(async (res) => {
                      if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                      }
                      return res.json();
                    })
                    .then(data => {
                      if (data.url) {
                        setUndangan({...undangan, background_photo: data.url});
                        showToast.success('Foto background berhasil diupload dan tersimpan');
                      }
                    })
                    .catch(err => {
                      console.error('Upload error:', err);
                      showAlert.error('Gagal!', err.message || "Gagal mengupload foto background");
                    })
                    .finally(() => {
                      setUploading(false);
                      e.target.value = "";
                    });
                  }
                }}
                className="form-control"
              />
            </div>
            {undangan.background_photo && (
              <div className="card">
                <div className="card-body p-0 position-relative">
                  <img 
                    src={undangan.background_photo} 
                    className="w-100 h-300px object-fit-cover rounded" 
                    alt="Foto Background"
                  />
                  <div className="position-absolute top-0 end-0 p-3">
                    <button
                      className="btn btn-icon btn-sm btn-danger"
                      onClick={async () => {
                        showAlert.confirm(
                          'Hapus foto background?',
                          'Foto akan dihapus permanen',
                          'Ya, hapus!',
                          'Batal',
                          async (result) => {
                            if (!result.isConfirmed) return;
                            try {
                              await fetch("/api/invitation/update", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ 
                                  slug, 
                                  field: { background_photo: "" } 
                                }),
                              });
                              setUndangan({...undangan, background_photo: ""});
                              showToast.success('Foto background berhasil dihapus');
                            } catch (err) {
                              showAlert.error('Gagal!', 'Gagal menghapus foto background');
                            }
                          }
                        );
                      }}
                      type="button"
                      disabled={uploading}
                      title="Hapus foto background"
                    >
                      <i className="ki-duotone ki-trash fs-2">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                        <span className="path4"></span>
                        <span className="path5"></span>
                      </i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <h2 className="fw-bold">Galeri Foto</h2>
          </div>
        </div>
        <div className="card-body">
          {/* Upload Section */}
          <div className="mb-8">
            <label className="form-label fw-bold">Upload Foto (maksimal {MAX_FOTO})</label>
            <div className="mb-4">
              <input
                type="file"
                ref={fileInput}
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                disabled={uploading || galeri.length >= MAX_FOTO}
                onChange={handleUpload}
                className="form-control"
              />
            </div>
            
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="text-muted fs-6">
                {galeri.length}/{MAX_FOTO} foto terupload
              </div>
              {uploading && (
                <div className="d-flex align-items-center text-primary">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Mengupload...
                </div>
              )}
            </div>
            
            <div className="text-muted fs-7 mb-4">
              Format yang didukung: JPG, PNG, GIF, WEBP (maks. 2MB per file)
            </div>

          </div>

          {/* Gallery Grid */}
          <div className="separator separator-dashed my-8"></div>
          
          <h3 className="fw-bold mb-5">Preview Galeri</h3>
          
          {galeri.length === 0 ? (
            <div className="text-center py-10">
              <i className="ki-duotone ki-picture fs-3x text-muted mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <div className="text-muted fs-6">Belum ada foto dalam galeri</div>
              <div className="text-muted fs-7">Upload foto untuk memulai galeri Anda</div>
            </div>
          ) : (
            <div className="row g-6 g-xl-9">
              {galeri.map((url, idx) => (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className="card card-flush">
                    <div className="card-body p-0 position-relative">
                      <img 
                        src={url} 
                        className="w-100 h-200px object-fit-cover rounded" 
                        alt={`Galeri ${idx+1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                      <div className="position-absolute top-0 end-0 p-3">
                        <button
                          className="btn btn-icon btn-sm btn-danger"
                          onClick={() => handleHapus(idx)}
                          type="button"
                          disabled={uploading}
                          title="Hapus foto"
                        >
                          {uploading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="ki-duotone ki-trash fs-2">
                              <span className="path1"></span>
                              <span className="path2"></span>
                              <span className="path3"></span>
                              <span className="path4"></span>
                              <span className="path5"></span>
                            </i>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="card-footer text-center py-3">
                      <span className="text-muted fs-7">Foto {idx + 1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
