'use client';

import { useState } from 'react';

export default function GiftConfirmation({ slug }) {
  const [form, setForm] = useState({
    nama: '',
    nominal: '',
    bank: '',
    pesan: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/invitation/gift-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug }),
      });

      if (res.ok) {
        setSuccess('Terima kasih! Konfirmasi hadiah Anda telah terkirim.');
        setForm({ nama: '', nominal: '', bank: '', pesan: '' });
      } else {
        setError('Gagal mengirim konfirmasi. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nominal</label>
          <input
            type="number"
            value={form.nominal}
            onChange={(e) => setForm({ ...form, nominal: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bank/E-Wallet</label>
          <input
            type="text"
            value={form.bank}
            onChange={(e) => setForm({ ...form, bank: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Contoh: BCA, OVO, DANA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Pesan/Ucapan (Opsional)</label>
          <textarea
            value={form.pesan}
            onChange={(e) => setForm({ ...form, pesan: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {loading ? 'Mengirim...' : 'Kirim Konfirmasi'}
        </button>

        {success && <div className="text-green-600 text-center mt-2">{success}</div>}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </form>
    </div>
  );
}
