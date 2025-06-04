import { useState, useEffect } from 'react';

export default function WeddingWishes({ slug }) {
  const [form, setForm] = useState({
    nama: '',
    pesan: ''
  });
  const [ucapan, setUcapan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch ucapan yang sudah ada
  useEffect(() => {
    if (slug) {
      fetchUcapan();
    }
  }, [slug]);

  const fetchUcapan = async () => {
    try {
      const res = await fetch(`/api/invitation/ucapan?slug=${slug}`);
      const data = await res.json();
      if (res.ok) {
        setUcapan(data.ucapan || []);
      }
    } catch (err) {
      console.error('Error fetching ucapan:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.pesan.trim()) {
      setError('Nama dan ucapan harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/invitation/ucapan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          nama: form.nama.trim(),
          pesan: form.pesan.trim()
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Terima kasih atas ucapan Anda!');
        setForm({ nama: '', pesan: '' });
        // Refresh ucapan list
        fetchUcapan();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Gagal mengirim ucapan');
      }
    } catch (err) {
      console.error('Ucapan Error:', err);
      setError('Gagal mengirim ucapan. Silakan coba lagi.');
    }

    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Form Ucapan */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Kirim Ucapan</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Masukkan nama Anda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ucapan & Harapan</label>
            <textarea
              required
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              value={form.pesan}
              onChange={(e) => setForm({ ...form, pesan: e.target.value })}
              placeholder="Tulis ucapan dan harapan terbaik Anda untuk kedua mempelai..."
            ></textarea>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Mengirim...' : 'Kirim Ucapan'}
          </button>
        </form>
      </div>

      {/* Daftar Ucapan */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">
          Ucapan & Harapan ({ucapan.length})
        </h3>
        
        {ucapan.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Belum ada ucapan. Jadilah yang pertama memberikan ucapan!
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {ucapan.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{item.nama}</h4>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.waktu)}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">{item.pesan}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
