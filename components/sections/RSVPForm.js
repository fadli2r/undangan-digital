'use client';

import { useEffect, useState } from 'react';

export default function RSVPForm({ slug, namaTamu }) {
  const [form, setForm] = useState({
    nama: namaTamu || '',
    kehadiran: 'hadir', // hadir | tidak_hadir | ragu
    jumlah_tamu: 1,
    pesan: ''
  });
  const [tamuList, setTamuList] = useState([]); // ✅ daftar tamu dari undangan
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Prefill kalau namaTamu dari URL
  useEffect(() => {
    if (namaTamu) {
      setForm((f) => ({ ...f, nama: namaTamu }));
    }
  }, [namaTamu]);

  // ✅ Fetch daftar tamu untuk validasi
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then((res) => res.json())
      .then((res) => {
        if (res?.undangan?.tamu) {
          setTamuList(res.undangan.tamu);
        }
      })
      .catch(() => {});
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ✅ validasi nama ada di daftar tamu
      const norm = (s) => String(s || '').trim().toLowerCase();
      const isInvited = tamuList.some((t) => norm(t.nama) === norm(form.nama));

      if (!isInvited) {
        setError('❌ Nama Anda tidak terdaftar dalam undangan.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/invitation/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...form }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess('✅ Terima kasih atas konfirmasi kehadiran Anda!');
        setForm({
          nama: namaTamu || '',
          kehadiran: 'hadir',
          jumlah_tamu: 1,
          pesan: ''
        });
      } else {
        setError(data.message || 'Gagal mengirim konfirmasi kehadiran');
      }
    } catch (err) {
      console.error('RSVP Error:', err);
      setError('Gagal mengirim konfirmasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama */}
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Masukkan nama Anda"
            readOnly={!!namaTamu}
          />
          {namaTamu && (
            <p className="text-xs text-gray-500 mt-1">
              Nama terisi otomatis dari link undangan.
            </p>
          )}
        </div>

        {/* Kehadiran */}
        <div>
          <label className="block text-sm font-medium mb-1">Konfirmasi Kehadiran</label>
          <select
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={form.kehadiran}
            onChange={(e) => setForm({ ...form, kehadiran: e.target.value })}
          >
            <option value="hadir">Ya, Saya Akan Hadir</option>
            <option value="tidak_hadir">Maaf, Tidak Bisa Hadir</option>
            <option value="ragu">Masih Ragu-ragu</option>
          </select>
        </div>

        {/* Jumlah tamu hanya kalau hadir */}
        {form.kehadiran === 'hadir' && (
          <div>
            <label className="block text-sm font-medium mb-1">Jumlah Tamu</label>
            <input
              type="number"
              min="1"
              max="5"
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.jumlah_tamu}
              onChange={(e) =>
                setForm({
                  ...form,
                  jumlah_tamu: Math.max(1, Math.min(5, parseInt(e.target.value) || 1))
                })
              }
            />
            <p className="text-sm text-gray-500 mt-1">Maksimal 5 orang</p>
          </div>
        )}

        {/* Pesan */}
        <div>
          <label className="block text-sm font-medium mb-1">Pesan/Ucapan</label>
          <textarea
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            value={form.pesan}
            onChange={(e) => setForm({ ...form, pesan: e.target.value })}
            placeholder="Tulis pesan atau ucapan Anda..."
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Mengirim...' : 'Kirim Konfirmasi'}
        </button>
      </form>
    </div>
  );
}
