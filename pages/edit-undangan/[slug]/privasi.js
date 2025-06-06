import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Pengaturan Privasi
            </h1>
            <p className="text-gray-600">
              Kelola privasi dan keamanan undangan Anda
            </p>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
            >
              {message}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Password Protection */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Proteksi Password
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lindungi undangan dengan password untuk akses terbatas
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.isPasswordProtected}
                    onChange={(e) => handleInputChange('isPasswordProtected', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.isPasswordProtected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="text"
                    value={settings.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan password untuk undangan"
                    required={settings.isPasswordProtected}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password akan diminta sebelum tamu dapat melihat undangan
                  </p>
                </motion.div>
              )}
            </div>

            {/* Hide Guestbook */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Sembunyikan Buku Tamu
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sembunyikan section ucapan dan doa dari tamu
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.hideGuestbook}
                    onChange={(e) => handleInputChange('hideGuestbook', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Hide RSVP */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Sembunyikan RSVP
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sembunyikan form konfirmasi kehadiran
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.hideRSVP}
                    onChange={(e) => handleInputChange('hideRSVP', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </div>
                ) : (
                  'Simpan Pengaturan'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
