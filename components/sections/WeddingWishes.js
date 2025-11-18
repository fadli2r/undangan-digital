'use client';

import { useState, useEffect } from 'react';

export default function WeddingWishes({ slug }) {
  const [form, setForm] = useState({ nama: '', pesan: '' });
  const [ucapan, setUcapan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (slug) fetchUcapan(); }, [slug]);

  const fetchUcapan = async () => {
    try {
      const res = await fetch(`/api/invitation/ucapan?slug=${slug}`);
      const data = await res.json();
      if (res.ok) setUcapan(data.ucapan || []);
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
  <div className="vars space-y-10">
    {/* 💌 Form Ucapan */}
    <div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Nama <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full border border-slate-300 rounded-lg px-4 py-2"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Masukkan nama Anda"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Ucapan & Harapan <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            className="w-full border border-slate-300 rounded-lg px-4 py-2"
            rows="4"
            value={form.pesan}
            onChange={(e) => setForm({ ...form, pesan: e.target.value })}
            placeholder="Tulis ucapan terbaik Anda untuk kedua mempelai..."
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm font-medium">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Mengirim...' : 'Kirim Ucapan'}
        </button>
      </form>
    </div>

    {/* ✨ Daftar Ucapan */}
    <div>
      <h3 className="text-xl font-semibold mb-5 text-slate-800">
        Ucapan & Harapan ({ucapan.length})
      </h3>

      {ucapan.length === 0 ? (
        <p className="text-slate-500 text-center py-10">
          Belum ada ucapan. Jadilah yang pertama memberikan ucapan!
        </p>
      ) : (
        <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
          {ucapan.map((item, idx) => (
            <div key={idx} className="bg-slate-50 rounded-lg p-4 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-slate-800">{item.nama}</h4>
                <span className="text-xs text-slate-500">{formatDate(item.waktu)}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{item.pesan}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

}
