'use client';

import { useState, useMemo } from 'react';
import { showAlert } from '@/utils/sweetAlert';

export default function GiftConfirmation({ slug }) {
  const [form, setForm] = useState({
    nama: '',
    nominal: '',
    bank: '',
    pesan: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const nominalDisplay = useMemo(() => {
    const n = Number(String(form.nominal).replace(/\D/g, '')) || 0;
    return n ? `Rp${n.toLocaleString('id-ID')}` : '';
  }, [form.nominal]);

  const onChange = (field) => (e) => {
    let v = e.target.value;
    if (field === 'nominal') v = v.replace(/\D/g, '');
    setForm((p) => ({ ...p, [field]: v }));
  };

  const validate = () => {
    if (!slug) return 'Data undangan tidak valid.';
    if (!form.nama.trim()) return 'Nama wajib diisi.';
    if (!Number(form.nominal)) return 'Nominal harus lebih dari 0.';
    if (!form.bank.trim()) return 'Bank/E-Wallet wajib diisi.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return showAlert.error('Tidak valid', err);

    setSubmitting(true);
    try {
      const payload = {
        slug,
        nama: form.nama.trim(),
        nominal: Number(form.nominal),
        bank: form.bank.trim(),
        pesan: form.pesan?.trim() || ''
      };

      const res = await fetch('/api/invitation/gift-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showAlert.success('Terima kasih!', 'Konfirmasi hadiah Anda telah terkirim.');
        setForm({ nama: '', nominal: '', bank: '', pesan: '' });
      } else {
        showAlert.error('Gagal mengirim', data?.message || 'Silakan coba lagi.');
      }
    } catch (error) {
      showAlert.error('Terjadi kesalahan', error?.message || 'Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

      {/* Nama */}
      <div>
        <label className="block font-medium text-slate-700 mb-1">
          Nama <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Nama Anda"
          className="w-full border border-slate-300 rounded-lg px-4 py-2"
          value={form.nama}
          onChange={onChange('nama')}
          required
        />
      </div>

      {/* Nominal */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="font-medium text-slate-700">
            Nominal <span className="text-red-500">*</span>
          </label>
          {nominalDisplay && <span className="text-sm text-slate-500">{nominalDisplay}</span>}
        </div>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Contoh: 200000"
          className="w-full border border-slate-300 rounded-lg px-4 py-2"
          value={form.nominal}
          onChange={onChange('nominal')}
          required
        />
        <p className="text-xs text-slate-500 mt-1">Masukkan angka saja (tanpa titik/koma).</p>
      </div>

      {/* Bank */}
      <div>
        <label className="block font-medium text-slate-700 mb-1">
          Bank / E-Wallet <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Contoh: BCA, OVO, DANA"
          className="w-full border border-slate-300 rounded-lg px-4 py-2"
          value={form.bank}
          onChange={onChange('bank')}
          required
        />
      </div>

      {/* Pesan */}
      <div>
        <label className="block font-medium text-slate-700 mb-1">
          Pesan / Ucapan (Opsional)
        </label>
        <textarea
          rows={3}
          placeholder="Tulis pesan singkat..."
          className="w-full border border-slate-300 rounded-lg px-4 py-2"
          value={form.pesan}
          onChange={onChange('pesan')}
        />
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${
            submitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={submitting}
        >
          {submitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
        </button>
      </div>
    </form>
  );
}
