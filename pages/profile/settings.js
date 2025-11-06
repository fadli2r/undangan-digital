// pages/profile/settings.js

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from 'next/head';
import UserLayout from "../../components/layouts/UserLayout";
import ProfileHeader from "../../components/profile/ProfileHeader"; // Import komponen header
import SeoHead from '@/components/SeoHead';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [user, setUser] = useState(null); // Untuk data asli dari server
  const [formData, setFormData] = useState({ name: '', phone: '' }); // Untuk data di form
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // 1. Ambil data profil saat halaman dimuat
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }

    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/user/profile`);
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          // Isi form dengan data yang ada
          setFormData({
            name: data.user.name || '',
            phone: data.user.phone || '',
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [session, status, router]);

  // 2. Handle perubahan pada input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification({ type: '', message: '' });

    // HAPUS bagian simulasi, dan AKTIFKAN (uncomment) bagian ini
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT', // Gunakan metode PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Kirim data dari form
      });

      const result = await response.json();
      if (response.ok) {
        setNotification({ type: 'success', message: 'Profil berhasil diperbarui!' });
        // Update data user di header dengan data baru dari server
        setUser(prev => ({ ...prev, name: result.user.name, phone: result.user.phone })); 
      } else {
        throw new Error(result.message || 'Gagal menyimpan profil.');
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </UserLayout>
    );
  }
  
  return (
    <UserLayout>
      <SeoHead
        title="Pengaturan Profil - Dreamslink"
        description="Kelola pengaturan profil Anda di Dreamslink."
        canonical="/profile/settings"
      />

      <div className="content d-flex flex-column flex-column-fluid">
          {/* Gunakan komponen ProfileHeader di sini */}
          <ProfileHeader user={user} activeTab="settings" />

          {/* Form untuk edit profil */}
          <div className="card mb-5 mb-xl-10">
            <div className="card-header border-0 cursor-pointer">
              <div className="card-title m-0">
                <h3 className="fw-bold m-0">Detail Profil</h3>
              </div>
            </div>
            <div id="kt_account_settings_profile_details" className="collapse show">
              <form onSubmit={handleSubmit} className="form">
                <div className="card-body border-top p-9">
                  
                  {notification.message && (
                    <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'}`}>
                      {notification.message}
                    </div>
                  )}

                  {/* Input untuk Nama Lengkap */}
                  <div className="row mb-6">
                    <label className="col-lg-4 col-form-label required fw-semibold fs-6">Nama Lengkap</label>
                    <div className="col-lg-8 fv-row">
                      <input
                        type="text"
                        name="name"
                        className="form-control form-control-lg form-control-solid"
                        placeholder="Nama Lengkap"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Input untuk Nomor Telepon */}
                  <div className="row mb-6">
                    <label className="col-lg-4 col-form-label fw-semibold fs-6">
                      <span className="required">Telepon</span>
                    </label>
                    <div className="col-lg-8 fv-row">
                      <input
                        type="tel"
                        name="phone"
                        className="form-control form-control-lg form-control-solid"
                        placeholder="Nomor Telepon"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="card-footer d-flex justify-content-end py-6 px-9">
                  <button type="button" onClick={() => setFormData(user)} className="btn btn-light btn-active-light-primary me-2">
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {!isSaving && <span className="indicator-label">Simpan Perubahan</span>}
                    {isSaving && (
                      <span className="indicator-progress" style={{ display: 'block' }}>
                        Menyimpan...
                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
    </UserLayout>
  );
}