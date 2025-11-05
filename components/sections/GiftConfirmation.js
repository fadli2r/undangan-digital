'use client';

import { useState, useMemo } from 'react';
import { showAlert } from '@/utils/sweetAlert'; // pastikan util ini ada

export default function GiftConfirmation({ slug }) {
  const [form, setForm] = useState({
    nama: '',
    nominal: '',
    bank: '',
    pesan: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Format IDR tampilan (read-only helper)
  const nominalDisplay = useMemo(() => {
    const n = Number(String(form.nominal).replace(/\D/g, '')) || 0;
    return n ? `Rp${n.toLocaleString('id-ID')}` : '';
  }, [form.nominal]);

  const onChange = (field) => (e) => {
    let v = e.target.value;

    if (field === 'nominal') {
      // hanya angka, tanpa minus
      v = v.replace(/\D/g, '');
    }
    setForm((p) => ({ ...p, [field]: v }));
  };

  const validate = () => {
    if (!slug) return 'Data undangan tidak valid.';
    if (!form.nama.trim()) return 'Nama wajib diisi.';
    const nominalNum = Number(form.nominal);
    if (!nominalNum || nominalNum < 1) return 'Nominal harus lebih dari 0.';
    if (!form.bank.trim()) return 'Bank/E-Wallet wajib diisi.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      showAlert.error('Tidak valid', err);
      return;
    }

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
    <div className="card shadow-sm">
      <div className="card-header">
        <div className="card-title">
          <h3 className="fw-bold">Konfirmasi Hadiah</h3>
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit} noValidate>
          {/* Nama */}
          <div className="mb-6">
            <label className="form-label required">Nama</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="Nama Anda"
              value={form.nama}
              onChange={onChange('nama')}
              required
            />
          </div>

          {/* Nominal */}
          <div className="mb-6">
            <div className="d-flex align-items-center justify-content-between">
              <label className="form-label required mb-0">Nominal</label>
              <small className="text-muted">{nominalDisplay}</small>
            </div>
            <input
              type="text"
              inputMode="numeric"
              className="form-control form-control-solid"
              placeholder="Contoh: 200000"
              value={form.nominal}
              onChange={onChange('nominal')}
              required
            />
            <div className="form-text">Masukkan angka saja (tanpa titik/koma).</div>
          </div>

          {/* Bank / E-Wallet */}
          <div className="mb-6">
            <label className="form-label required">Bank / E-Wallet</label>
            <input
              type="text"
              className="form-control form-control-solid"
              placeholder="Contoh: BCA, OVO, DANA"
              value={form.bank}
              onChange={onChange('bank')}
              required
            />
          </div>

          {/* Pesan (opsional) */}
          <div className="mb-6">
            <label className="form-label">Pesan / Ucapan (Opsional)</label>
            <textarea
              className="form-control form-control-solid"
              rows={3}
              placeholder="Tulis pesan singkat..."
              value={form.pesan}
              onChange={onChange('pesan')}
            />
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting && (
                <span className="spinner-border spinner-border-sm me-2" />
              )}
              {submitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
