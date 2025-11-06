import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserLayout from "../../../components/layouts/UserLayout";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import SeoHead from '@/components/SeoHead';

export default function PrivacySettings() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [settings, setSettings] = useState({
    isPasswordProtected: false,
    password: '',
    hideGuestbook: false,
    hideRSVP: false
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchPrivacySettings();
    }
  }, [slug]);

  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch(`/api/invitation/detail?slug=${slug}`);
      const data = await response.json();
      
      if (data.undangan && data.undangan.privacy) {
        setSettings({
          isPasswordProtected: data.undangan.privacy.isPasswordProtected || false,
          password: data.undangan.privacy.password || '',
          hideGuestbook: data.undangan.privacy.hideGuestbook || false,
          hideRSVP: data.undangan.privacy.hideRSVP || false
        });
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      setError('Gagal memuat pengaturan privasi');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/invitation/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          slug: slug,
          field: { privacy: settings }
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Pengaturan privasi berhasil disimpan!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      setError('Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <UserLayout>
      <SeoHead
        title="Pengaturan Privasi - Dreamslink"
        description="Kelola privasi dan keamanan undangan Anda."
        canonical="/edit-undangan/[slug]/privasi"
      />
      <BackButton />
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="card-title">
            <h2 className="fw-bold">Pengaturan Privasi</h2>
          </div>
          {slug && (
            <Link href={`/edit-undangan/${slug}/einvitation`} className="btn btn-sm btn-light-primary">
              ✨ Edit E-Invitation
            </Link>
          )}
        </div>
        <div className="card-body">
          <div className="mb-8">
            <p className="text-muted fs-6">
              Kelola privasi dan keamanan undangan Anda
            </p>
          </div>

          {message && (
            <div className="alert alert-success mb-8">
              <i className="ki-duotone ki-check-circle fs-2 me-2">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger mb-8">
              <i className="ki-duotone ki-cross-circle fs-2 me-2">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Password Protection */}
            <div className="card card-flush shadow-sm mb-8">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-5">
                  <div className="flex-grow-1">
                    <h3 className="fs-4 fw-bold text-gray-900 mb-1">
                      Proteksi Password
                    </h3>
                    <p className="text-muted fs-6 mb-0">
                      Lindungi undangan dengan password untuk akses terbatas
                    </p>
                  </div>
                  <div className="form-check form-switch form-check-custom form-check-solid">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.isPasswordProtected}
                      onChange={(e) => handleInputChange('isPasswordProtected', e.target.checked)}
                    />
                  </div>
                </div>

                {settings.isPasswordProtected && (
                  <div className="mt-5">
                    <label className="form-label required">Password</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Masukkan password untuk undangan"
                      required={settings.isPasswordProtected}
                    />
                    <div className="form-text">
                      Password akan diminta sebelum tamu dapat melihat undangan
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hide Guestbook */}
            <div className="card card-flush shadow-sm mb-8">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="flex-grow-1">
                    <h3 className="fs-4 fw-bold text-gray-900 mb-1">
                      Sembunyikan Buku Tamu
                    </h3>
                    <p className="text-muted fs-6 mb-0">
                      Sembunyikan section ucapan dan doa dari tamu
                    </p>
                  </div>
                  <div className="form-check form-switch form-check-custom form-check-solid">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.hideGuestbook}
                      onChange={(e) => handleInputChange('hideGuestbook', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hide RSVP */}
            <div className="card card-flush shadow-sm mb-8">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="flex-grow-1">
                    <h3 className="fs-4 fw-bold text-gray-900 mb-1">
                      Sembunyikan RSVP
                    </h3>
                    <p className="text-muted fs-6 mb-0">
                      Sembunyikan form konfirmasi kehadiran
                    </p>
                  </div>
                  <div className="form-check form-switch form-check-custom form-check-solid">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.hideRSVP}
                      onChange={(e) => handleInputChange('hideRSVP', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
