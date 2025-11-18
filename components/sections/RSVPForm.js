'use client';

import { useEffect, useState } from 'react';

export default function RSVPForm({ slug, namaTamu }) {
  const [form, setForm] = useState({
    nama: namaTamu || '',
    kehadiran: 'hadir',
    jumlah_tamu: 1,
    pesan: ''
  });
  const [tamuList, setTamuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (namaTamu) {
      setForm((f) => ({ ...f, nama: namaTamu }));
    }
  }, [namaTamu]);

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
    <div className="vars space-y-6">

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama */}
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
            readOnly={!!namaTamu}
          />
          {namaTamu && (
            <p className="text-xs text-slate-500 mt-1">
              Nama diisi otomatis dari link undangan.
            </p>
          )}
        </div>

        {/* Kehadiran */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Kehadiran <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border border-slate-300 rounded-lg px-4 py-2"
            value={form.kehadiran}
            onChange={(e) => setForm({ ...form, kehadiran: e.target.value })}
          >
            <option value="hadir">Ya, Saya Akan Hadir</option>
            <option value="tidak_hadir">Maaf, Tidak Bisa Hadir</option>
            <option value="ragu">Masih Ragu-ragu</option>
          </select>
        </div>

        {/* Jumlah Tamu */}
        {form.kehadiran === 'hadir' && (
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Jumlah Tamu <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="5"
              className="w-full border border-slate-300 rounded-lg px-4 py-2"
              value={form.jumlah_tamu}
              onChange={(e) =>
                setForm({
                  ...form,
                  jumlah_tamu: Math.max(1, Math.min(5, parseInt(e.target.value) || 1))
                })
              }
            />
            <p className="text-sm text-slate-500 mt-1">Maksimal 5 orang</p>
          </div>
        )}

        {/* Pesan */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Pesan / Ucapan</label>
          <textarea
            className="w-full border border-slate-300 rounded-lg px-4 py-2"
            rows={3}
            value={form.pesan}
            onChange={(e) => setForm({ ...form, pesan: e.target.value })}
            placeholder="Tulis pesan atau ucapan Anda..."
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
          {loading ? 'Mengirim...' : 'Kirim Konfirmasi'}
        </button>
      </form>
    </div>
  );
}
