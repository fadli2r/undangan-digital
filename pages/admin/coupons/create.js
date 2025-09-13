// pages/admin/coupons/new.js
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';

export default function CreateCouponPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage', // 'percentage' | 'fixed'
    value: '',
    minimumAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    userUsageLimit: '1',
    startDate: '',
    endDate: '',
    isActive: true,
    applicablePackages: [],
    excludedPackages: []
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const isPercentage = useMemo(() => formData.type === 'percentage', [formData.type]);
  const valueNumber = useMemo(() => Number(formData.value || 0), [formData.value]);

  useEffect(() => {
    (async () => {
      try {
        await fetchPackages();
      } catch (e) {
        setError(e?.message || 'Gagal mengambil daftar paket');
      }
    })();
  }, []);

  async function fetchPackages() {
    const response = await fetch('/api/admin/packages', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 401) {
      if (typeof window !== 'undefined') window.location.replace('/admin/login');
      return;
    }
    if (!response.ok) throw new Error('Gagal mengambil daftar paket');
    const data = await response.json();
    setPackages(data.packages || []);
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    // Autouppercase + strip spasi untuk code
    if (name === 'code') {
      const normalized = value.toUpperCase().replace(/\s+/g, '');
      setFormData((prev) => ({ ...prev, [name]: normalized }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? !!checked : value }));
  }

  function handlePackageSelection(packageId, field) {
    setFormData((prev) => {
      const arr = prev[field] || [];
      const exist = arr.includes(packageId);
      return { ...prev, [field]: exist ? arr.filter((id) => id !== packageId) : [...arr, packageId] };
    });
  }

  function selectAll(field) {
    setFormData((prev) => ({ ...prev, [field]: packages.map((p) => p._id) }));
  }
  function clearAll(field) {
    setFormData((prev) => ({ ...prev, [field]: [] }));
  }

  function validate() {
    const v = {};
    if (!formData.code.trim()) v.code = 'Kode wajib diisi';
    if (!/^[A-Z0-9\-]+$/.test(formData.code)) v.code = 'Gunakan huruf besar, angka, dan tanda -';

    if (!formData.name.trim()) v.name = 'Nama kupon wajib diisi';

    if (!formData.startDate) v.startDate = 'Tanggal mulai wajib diisi';
    if (!formData.endDate) v.endDate = 'Tanggal berakhir wajib diisi';
    const start = formData.startDate ? new Date(formData.startDate) : null;
    const end = formData.endDate ? new Date(formData.endDate) : null;
    if (start && end && end < start) v.endDate = 'Tanggal berakhir tidak boleh lebih awal dari tanggal mulai';

    if (isPercentage) {
      if (formData.value === '') v.value = 'Nilai diskon wajib diisi';
      if (valueNumber < 0 || valueNumber > 100) v.value = 'Persentase harus antara 0 - 100';
      if (formData.maximumDiscount && Number(formData.maximumDiscount) < 0) v.maximumDiscount = 'Maksimum diskon tidak valid';
    } else {
      if (formData.value === '') v.value = 'Nilai diskon wajib diisi';
      if (valueNumber < 0) v.value = 'Nominal tidak boleh negatif';
    }

    if (!formData.userUsageLimit || Number(formData.userUsageLimit) < 1) {
      v.userUsageLimit = 'Minimal 1';
    }

    setErrors(v);
    return Object.keys(v).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess(false);
    setError('');
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        if (typeof window !== 'undefined') window.location.replace('/admin/login');
        return;
      }
      if (!response.ok) throw new Error(data?.error || 'Failed to create coupon');

      setSuccess(true);
      setTimeout(() => router.push('/admin/coupons'), 800);
    } catch (e2) {
      setError(e2?.message || 'Gagal membuat kupon');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>


      <div className="content d-flex flex-column flex-column-fluid" id="kt_content">
        <div className="container-xxl" id="kt_content_container">

          <div className="d-flex flex-wrap align-items-center justify-content-between mb-6">
            <h2 className="mb-0">Buat Kupon Baru</h2>
            <div className="d-flex gap-3">
              <button type="button" className="btn btn-light" onClick={() => router.push('/admin/coupons')}>
                <i className="ki-duotone ki-arrow-left fs-2 me-2"><span className="path1"></span><span className="path2"></span></i>
                Kembali
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? (<><span className="spinner-border spinner-border-sm me-2" />Menyimpan...</>) : 'Simpan Kupon'}
              </button>
            </div>
          </div>

          {success && (
            <div className="alert alert-success d-flex align-items-center p-5 mb-6">
              <i className="ki-duotone ki-shield-tick fs-2hx text-success me-4"><span className="path1"></span><span className="path2"></span></i>
              <div>Kupon berhasil dibuat.</div>
            </div>
          )}
          {error && (
            <div className="alert alert-danger d-flex align-items-center p-5 mb-6">
              <i className="ki-duotone ki-information-5 fs-2hx text-danger me-4"><span className="path1"></span><span className="path2"></span></i>
              <div>{error}</div>
            </div>
          )}

          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Informasi Dasar */}
                  <div className="col-md-6">
                    <div className="card mb-6">
                      <div className="card-header"><h3 className="card-title">Informasi Dasar</h3></div>
                      <div className="card-body">
                        <div className="mb-5">
                          <label className="form-label required">Kode Kupon</label>
                          <input
                            name="code"
                            className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder="CONTOH10"
                            required
                          />
                          <div className="form-text">Otomatis diubah ke huruf besar (A–Z), angka, dan tanda "-"</div>
                          {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                        </div>

                        <div className="mb-5">
                          <label className="form-label required">Nama Kupon</label>
                          <input
                            name="name"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nama kupon"
                            required
                          />
                          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>

                        <div className="mb-5">
                          <label className="form-label">Deskripsi</label>
                          <textarea
                            name="description"
                            className="form-control"
                            rows={3}
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Deskripsi kupon (opsional)"
                          />
                        </div>

                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">Kupon Aktif</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pengaturan Diskon */}
                  <div className="col-md-6">
                    <div className="card mb-6">
                      <div className="card-header"><h3 className="card-title">Pengaturan Diskon</h3></div>
                      <div className="card-body">
                        <div className="mb-5">
                          <label className="form-label required">Tipe Diskon</label>
                          <select
                            name="type"
                            className="form-select"
                            value={formData.type}
                            onChange={handleInputChange}
                          >
                            <option value="percentage">Persentase (%)</option>
                            <option value="fixed">Nominal Tetap (Rp)</option>
                          </select>
                        </div>

                        <div className="mb-5">
                          <label className="form-label required">
                            Nilai Diskon {isPercentage ? '(%)' : '(Rp)'}
                          </label>
                          <input
                            type="number"
                            name="value"
                            className={`form-control ${errors.value ? 'is-invalid' : ''}`}
                            value={formData.value}
                            onChange={handleInputChange}
                            min="0"
                            max={isPercentage ? '100' : undefined}
                            placeholder={isPercentage ? 'Contoh: 10' : 'Contoh: 50000'}
                          />
                          {errors.value && <div className="invalid-feedback">{errors.value}</div>}
                        </div>

                        <div className="mb-5">
                          <label className="form-label">Minimum Pembelian (Rp)</label>
                          <input
                            type="number"
                            name="minimumAmount"
                            className="form-control"
                            value={formData.minimumAmount}
                            onChange={handleInputChange}
                            min="0"
                            placeholder="0"
                          />
                        </div>

                        {isPercentage && (
                          <div className="mb-5">
                            <label className="form-label">Maksimum Diskon (Rp)</label>
                            <input
                              type="number"
                              name="maximumDiscount"
                              className={`form-control ${errors.maximumDiscount ? 'is-invalid' : ''}`}
                              value={formData.maximumDiscount}
                              onChange={handleInputChange}
                              min="0"
                              placeholder="Tidak terbatas"
                            />
                            {errors.maximumDiscount && <div className="invalid-feedback">{errors.maximumDiscount}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Batas Penggunaan */}
                  <div className="col-md-6">
                    <div className="card mb-6">
                      <div className="card-header"><h3 className="card-title">Batas Penggunaan</h3></div>
                      <div className="card-body">
                        <div className="mb-5">
                          <label className="form-label">Total Batas Penggunaan</label>
                          <input
                            type="number"
                            name="usageLimit"
                            className="form-control"
                            value={formData.usageLimit}
                            onChange={handleInputChange}
                            min="1"
                            placeholder="Tidak terbatas"
                          />
                          <div className="form-text">Kosongkan untuk tidak terbatas</div>
                        </div>

                        <div className="mb-5">
                          <label className="form-label required">Batas per User</label>
                          <input
                            type="number"
                            name="userUsageLimit"
                            className={`form-control ${errors.userUsageLimit ? 'is-invalid' : ''}`}
                            value={formData.userUsageLimit}
                            onChange={handleInputChange}
                            min="1"
                            required
                          />
                          {errors.userUsageLimit && <div className="invalid-feedback">{errors.userUsageLimit}</div>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Periode */}
                  <div className="col-md-6">
                    <div className="card mb-6">
                      <div className="card-header"><h3 className="card-title">Periode Berlaku</h3></div>
                      <div className="card-body">
                        <div className="mb-5">
                          <label className="form-label required">Tanggal Mulai</label>
                          <input
                            type="datetime-local"
                            name="startDate"
                            className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                            value={formData.startDate}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
                        </div>
                        <div className="mb-5">
                          <label className="form-label required">Tanggal Berakhir</label>
                          <input
                            type="datetime-local"
                            name="endDate"
                            className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                            value={formData.endDate}
                            onChange={handleInputChange}
                            min={formData.startDate || undefined}
                            required
                          />
                          {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pembatasan Paket */}
                  <div className="col-12">
                    <div className="card mb-6">
                      <div className="card-header">
                        <h3 className="card-title">Pembatasan Paket</h3>
                        <div className="card-toolbar d-flex gap-2">
                          <button type="button" className="btn btn-light btn-sm" onClick={() => selectAll('applicablePackages')}>Select All Applicable</button>
                          <button type="button" className="btn btn-light btn-sm" onClick={() => clearAll('applicablePackages')}>Clear Applicable</button>
                          <button type="button" className="btn btn-light btn-sm" onClick={() => selectAll('excludedPackages')}>Select All Excluded</button>
                          <button type="button" className="btn btn-light btn-sm" onClick={() => clearAll('excludedPackages')}>Clear Excluded</button>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <label className="form-label">Paket yang Berlaku</label>
                            <div className="form-text mb-3">Kosongkan untuk berlaku di semua paket</div>
                            <div className="max-h-300px overflow-auto">
                              {packages.map((pkg) => (
                                <div key={pkg._id} className="form-check mb-2">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={formData.applicablePackages.includes(pkg._id)}
                                    onChange={() => handlePackageSelection(pkg._id, 'applicablePackages')}
                                  />
                                  <label className="form-check-label">
                                    {pkg.name} — Rp {Number(pkg.price || 0).toLocaleString('id-ID')}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">Paket yang Dikecualikan</label>
                            <div className="form-text mb-3">Paket yang tidak bisa menggunakan kupon ini</div>
                            <div className="max-h-300px overflow-auto">
                              {packages.map((pkg) => (
                                <div key={pkg._id} className="form-check mb-2">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={formData.excludedPackages.includes(pkg._id)}
                                    onChange={() => handlePackageSelection(pkg._id, 'excludedPackages')}
                                  />
                                  <label className="form-check-label">
                                    {pkg.name} — Rp {Number(pkg.price || 0).toLocaleString('id-ID')}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="d-flex justify-content-end">
                  <button type="button" className="btn btn-light me-3" onClick={() => router.push('/admin/coupons')}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (<><span className="spinner-border spinner-border-sm me-2" />Menyimpan...</>) : 'Simpan Kupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
