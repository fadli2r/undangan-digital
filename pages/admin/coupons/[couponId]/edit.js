import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '@/components/layouts/AdminLayout';

function toLocalDateTimeValue(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => `${n}`.padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function EditCouponPage() {
  const router = useRouter();
  const { couponId } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [packages, setPackages] = useState([]);
  const [coupon, setCoupon] = useState(null);

  const [formData, setFormData] = useState({
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

  // convenience
  const valueNumber = useMemo(() => Number(formData.value || 0), [formData.value]);

  useEffect(() => {
    if (!couponId) return;
    (async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([fetchCoupon(), fetchPackages()]);
      } catch (e) {
        setError(e?.message || 'Error load data');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponId]);

  async function fetchPackages() {
    const res = await fetch('/api/admin/packages', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status === 401) {
      router.replace('/admin/login');
      return;
    }
    if (!res.ok) throw new Error('Gagal mengambil daftar paket');
    const data = await res.json();
    setPackages(data.packages || []);
  }

  async function fetchCoupon() {
    const res = await fetch(`/api/admin/coupons/${couponId}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status === 401) {
      router.replace('/admin/login');
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Gagal mengambil kupon');

    const c = data.coupon;
    setCoupon(c || null);
    setFormData({
      name: c?.name || '',
      description: c?.description || '',
      type: c?.type || 'percentage',
      value: (c?.value ?? '').toString(),
      minimumAmount: (c?.minimumAmount ?? '').toString(),
      maximumDiscount: (c?.maximumDiscount ?? '').toString(),
      usageLimit: (c?.usageLimit ?? '').toString(),
      userUsageLimit: (c?.userUsageLimit ?? '1').toString(),
      startDate: toLocalDateTimeValue(c?.startDate),
      endDate: toLocalDateTimeValue(c?.endDate),
      isActive: c?.isActive !== false,
      applicablePackages: c?.applicablePackages?.map((p) => p?._id || p) || [],
      excludedPackages: c?.excludedPackages?.map((p) => p?._id || p) || []
    });
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? !!checked : value
    }));
  }

  function handlePackageSelection(packageId, field) {
    setFormData((prev) => {
      const arr = prev[field] || [];
      const exist = arr.includes(packageId);
      return {
        ...prev,
        [field]: exist ? arr.filter((id) => id !== packageId) : [...arr, packageId]
      };
    });
  }

  function selectAll(field) {
    setFormData((prev) => ({
      ...prev,
      [field]: packages.map((p) => p._id)
    }));
  }

  function clearAll(field) {
    setFormData((prev) => ({ ...prev, [field]: [] }));
  }

  function validate() {
    const v = {};
    if (!formData.name.trim()) v.name = 'Nama kupon wajib diisi';
    if (!formData.startDate) v.startDate = 'Tanggal mulai wajib diisi';
    if (!formData.endDate) v.endDate = 'Tanggal berakhir wajib diisi';

    const start = formData.startDate ? new Date(formData.startDate) : null;
    const end = formData.endDate ? new Date(formData.endDate) : null;
    if (start && end && end < start) v.endDate = 'Tanggal berakhir tidak boleh lebih awal dari tanggal mulai';

    if (formData.type === 'percentage') {
      if (formData.value === '') v.value = 'Nilai diskon wajib diisi';
      if (valueNumber < 0 || valueNumber > 100) v.value = 'Persentase harus antara 0 - 100';
      if (formData.maximumDiscount && Number(formData.maximumDiscount) < 0) v.maximumDiscount = 'Maksimum diskon tidak valid';
    } else {
      if (formData.value === '') v.value = 'Nilai diskon wajib diisi';
      if (valueNumber < 0) v.value = 'Nominal tidak boleh negatif';
    }

    if (formData.usageLimit && Number(formData.usageLimit) < (coupon?.usageCount || 0)) {
      v.usageLimit = `Minimal ${coupon?.usageCount || 0} karena sudah digunakan`;
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
      setSaving(true);
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal memperbarui kupon');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e2) {
      setError(e2?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center py-20">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
        </div>
      </AdminLayout>
    );
  }

  if (!coupon) {
    return (
      <AdminLayout>
        <div className="alert alert-danger">Kupon tidak ditemukan</div>
      </AdminLayout>
    );
  }

  const isPercentage = formData.type === 'percentage';

  return (
    <AdminLayout>
      <Head><title>Edit Kupon - Digital Invitation</title></Head>

      <div className="content d-flex flex-column flex-column-fluid" id="kt_content">
        <div className="container-xxl" id="kt_content_container">

          <div className="d-flex flex-wrap align-items-center justify-content-between mb-6">
            <div className="d-flex align-items-center gap-3">
              <h2 className="mb-0">Edit Kupon: <span className="fw-bold">{coupon.code}</span></h2>
              {coupon.isActive ? <span className="badge badge-light-success">Active</span> : <span className="badge badge-light-danger">Inactive</span>}
            </div>
            <div className="d-flex gap-3">
              <button type="button" className="btn btn-light" onClick={() => router.push('/admin/coupons')}>
                <i className="ki-duotone ki-arrow-left fs-2 me-2"><span className="path1"></span><span className="path2"></span></i>
                Kembali
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? (<><span className="spinner-border spinner-border-sm me-2" />Menyimpan...</>) : 'Simpan Perubahan'}
              </button>
            </div>
          </div>

          {success && (
            <div className="alert alert-success d-flex align-items-center p-5 mb-6">
              <i className="ki-duotone ki-shield-tick fs-2hx text-success me-4"><span className="path1"></span><span className="path2"></span></i>
              <div>Perubahan kupon berhasil disimpan.</div>
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
              {/* Statistik */}
              <div className="alert alert-info mb-8">
                <div className="d-flex align-items-center">
                  <i className="ki-duotone ki-information-5 fs-2x text-info me-4"><span className="path1"></span><span className="path2"></span></i>
                  <div>
                    <div className="fw-semibold mb-1">Statistik Penggunaan</div>
                    <div>
                      Kupon digunakan <b>{coupon.usageCount}</b> kali
                      {coupon.usageLimit ? ` dari batas ${coupon.usageLimit}` : ''}.
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Info Dasar */}
                  <div className="col-md-6">
                    <div className="card mb-6">
                      <div className="card-header"><h3 className="card-title">Informasi Dasar</h3></div>
                      <div className="card-body">
                        <div className="mb-5">
                          <label className="form-label">Kode Kupon</label>
                          <input className="form-control" value={coupon.code} disabled />
                          <div className="form-text">Kode kupon tidak bisa diubah</div>
                        </div>

                        <div className="mb-5">
                          <label className="form-label required">Nama Kupon</label>
                          <input
                            name="name"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Masukkan nama kupon"
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
                            className={`form-control ${errors.minimumAmount ? 'is-invalid' : ''}`}
                            value={formData.minimumAmount}
                            onChange={handleInputChange}
                            min="0"
                            placeholder="0"
                          />
                          {errors.minimumAmount && <div className="invalid-feedback">{errors.minimumAmount}</div>}
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
                            className={`form-control ${errors.usageLimit ? 'is-invalid' : ''}`}
                            value={formData.usageLimit}
                            onChange={handleInputChange}
                            min={coupon?.usageCount || 0}
                            placeholder="Tidak terbatas"
                          />
                          <div className="form-text">
                            {coupon?.usageCount > 0
                              ? `Minimal ${coupon.usageCount} (sudah digunakan ${coupon.usageCount} kali)`
                              : 'Kosongkan untuk tidak terbatas'}
                          </div>
                          {errors.usageLimit && <div className="invalid-feedback">{errors.usageLimit}</div>}
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
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (<><span className="spinner-border spinner-border-sm me-2" />Menyimpan...</>) : 'Simpan Perubahan'}
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
