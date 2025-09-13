import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";
import { showAlert, showToast } from "@/utils/sweetAlert";

export default function Mempelai() {
  const router = useRouter();
  const { slug } = router.query;
const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);
  const [undangan, setUndangan] = useState(null);
  const [form, setForm] = useState({
    pria: "",
    wanita: "",
    foto_pria: "",
    foto_wanita: "",
    orangtua_pria: "",
    orangtua_wanita: "",
    instagram_pria: "",
    instagram_wanita: "",
  });
  const [uploading, setUploading] = useState({
    foto_pria: false,
    foto_wanita: false,
  });

  // Fetch data undangan
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        setUndangan(res.undangan);
        setForm({
          pria: res.undangan?.mempelai?.pria || "",
          wanita: res.undangan?.mempelai?.wanita || "",
          foto_pria: res.undangan?.mempelai?.foto_pria || "",
          foto_wanita: res.undangan?.mempelai?.foto_wanita || "",
          orangtua_pria: res.undangan?.mempelai?.orangtua_pria || "",
          orangtua_wanita: res.undangan?.mempelai?.orangtua_wanita || "",
          instagram_pria: res.undangan?.tambahan?.instagram_pria || "",
          instagram_wanita: res.undangan?.tambahan?.instagram_wanita || "",
        });
        setLoading(false);
      });
  }, [slug]);

  // Handle input change
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle file upload
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast.error('Format file harus JPG, PNG, atau GIF');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Ukuran file maksimal 5MB');
      return;
    }

    setUploading({ ...uploading, [fieldName]: true });
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch('/api/invitation/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setForm({ ...form, [fieldName]: result.path });
        showToast.success(`Foto ${fieldName === 'foto_pria' ? 'pria' : 'wanita'} berhasil diupload!`);
      } else {
        showToast.error(result.message || 'Gagal upload foto');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast.error('Gagal upload foto: ' + error.message);
    } finally {
      setUploading({ ...uploading, [fieldName]: false });
    }
  };

  // Handle submit
  const handleSubmit = async e => {
    e.preventDefault();
    showAlert.loading('Menyimpan...', 'Mohon tunggu sebentar');
    
    const updateData = { 
      slug, 
      field: { 
        mempelai: {
          pria: form.pria,
          wanita: form.wanita,
          foto_pria: form.foto_pria,
          foto_wanita: form.foto_wanita,
          orangtua_pria: form.orangtua_pria,
          orangtua_wanita: form.orangtua_wanita,
        },
        tambahan: {
          instagram_pria: form.instagram_pria,
          instagram_wanita: form.instagram_wanita,
        }
      } 
    };
    
    try {
      const res = await fetch("/api/invitation/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        showAlert.success('Berhasil!', 'Data mempelai berhasil disimpan');
        // Refresh data to verify update
        const refreshRes = await fetch(`/api/invitation/detail?slug=${slug}`);
        const refreshData = await refreshRes.json();
        setUndangan(refreshData.undangan);
      } else {
        showAlert.error('Gagal!', result.message || 'Gagal menyimpan data. Coba lagi');
      }
    } catch (error) {
      console.error('Update error:', error);
      showAlert.error('Error!', 'Gagal menyimpan data: ' + error.message);
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
            <h2 className="fw-bold">Informasi Mempelai</h2>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-5">
              {/* Mempelai Pria */}
              <div className="col-md-6">
                <div className="card card-flush h-100">
                  <div className="card-header">
                    <h3 className="card-title fw-bold">Mempelai Pria</h3>
                  </div>
                  <div className="card-body">
                    <div className="mb-5">
                      <label className="form-label required">Nama Lengkap</label>
                      <input
                        name="pria"
                        className="form-control"
                        value={form.pria}
                        onChange={handleChange}
                        required
                        placeholder="Contoh: Adi Pratama"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="form-label">Nama Orangtua</label>
                      <input
                        name="orangtua_pria"
                        className="form-control"
                        value={form.orangtua_pria}
                        onChange={handleChange}
                        placeholder="Contoh: Bpk. Surya & Ibu Ani"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="form-label">Instagram</label>
                      <input
                        name="instagram_pria"
                        className="form-control"
                        value={form.instagram_pria}
                        onChange={handleChange}
                        placeholder="Contoh: https://instagram.com/username"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="form-label">Foto</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control mb-3"
                        onChange={(e) => handleFileUpload(e, 'foto_pria')}
                        disabled={uploading.foto_pria}
                      />
                      {uploading.foto_pria && (
                        <div className="d-flex align-items-center text-primary mb-3">
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Mengupload foto...
                        </div>
                      )}
                      {form.foto_pria && (
                        <div className="text-center">
                          <img 
                            src={form.foto_pria} 
                            alt="Preview Foto Pria" 
                            className="rounded w-150px h-150px object-fit-cover border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mempelai Wanita */}
              <div className="col-md-6">
                <div className="card card-flush h-100">
                  <div className="card-header">
                    <h3 className="card-title fw-bold">Mempelai Wanita</h3>
                  </div>
                  <div className="card-body">
                    <div className="mb-5">
                      <label className="form-label required">Nama Lengkap</label>
                      <input
                        name="wanita"
                        className="form-control"
                        value={form.wanita}
                        onChange={handleChange}
                        required
                        placeholder="Contoh: Siti Ayu"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="form-label">Nama Orangtua</label>
                      <input
                        name="orangtua_wanita"
                        className="form-control"
                        value={form.orangtua_wanita}
                        onChange={handleChange}
                        placeholder="Contoh: Bpk. Hadi & Ibu Rita"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="form-label">Instagram</label>
                      <input
                        name="instagram_wanita"
                        className="form-control"
                        value={form.instagram_wanita}
                        onChange={handleChange}
                        placeholder="Contoh: https://instagram.com/username"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="form-label">Foto</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control mb-3"
                        onChange={(e) => handleFileUpload(e, 'foto_wanita')}
                        disabled={uploading.foto_wanita}
                      />
                      {uploading.foto_wanita && (
                        <div className="d-flex align-items-center text-primary mb-3">
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Mengupload foto...
                        </div>
                      )}
                      {form.foto_wanita && (
                        <div className="text-center">
                          <img 
                            src={form.foto_wanita} 
                            alt="Preview Foto Wanita" 
                            className="rounded w-150px h-150px object-fit-cover border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="text-center mt-8">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || uploading.foto_pria || uploading.foto_wanita}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
