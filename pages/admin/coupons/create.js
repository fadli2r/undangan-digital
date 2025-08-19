import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayoutJWT from '../../../components/layouts/AdminLayoutJWT';

export default function CreateCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
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

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/packages/index-jwt', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePackageSelection = (packageId, field) => {
    setFormData(prev => {
      const currentArray = prev[field];
      const isSelected = currentArray.includes(packageId);
      
      return {
        ...prev,
        [field]: isSelected 
          ? currentArray.filter(id => id !== packageId)
          : [...currentArray, packageId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/coupons/index-jwt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create coupon');
      }

      alert('Kupon berhasil dibuat!');
      router.push('/admin/coupons');
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayoutJWT>
      <Head>
        <title>Buat Kupon Baru - Digital Invitation</title>
      </Head>

      {/* Begin::Content */}
      <div className="content d-flex flex-column flex-column-fluid" id="kt_content">
        {/* Begin::Container */}
        <div className="container-xxl" id="kt_content_container">
          {/* Begin::Card */}
          <div className="card">
            {/* Begin::Card header */}
            <div className="card-header">
              <div className="card-title">
                <h2>Buat Kupon Baru</h2>
              </div>
              <div className="card-toolbar">
                <button
                  type="button"
                  className="btn btn-light-primary"
                  onClick={() => router.push('/admin/coupons')}
                >
                  <i className="ki-duotone ki-arrow-left fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Kembali
                </button>
              </div>
            </div>
            {/* End::Card header */}

            {/* Begin::Card body */}
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Basic Information */}
                  <div className="col-md-6">
                    <div className="card mb-5">
                      <div className="card-header">
                        <h3 className="card-title">Informasi Dasar</h3>
                      </div>
                      <div className="card-body">
                        {/* Coupon Code */}
                        <div className="mb-5">
                          <label className="form-label required">Kode Kupon</label>
                          <input
                            type="text"
                            className="form-control"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder="Masukkan kode kupon"
                            required
                          />
                          <div className="form-text">Kode akan otomatis diubah ke huruf besar</div>
                        </div>

                        {/* Coupon Name */}
                        <div className="mb-5">
                          <label className="form-label required">Nama Kupon</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Masukkan nama kupon"
                            required
                          />
                        </div>

                        {/* Description */}
                        <div className="mb-5">
                          <label className="form-label">Deskripsi</label>
                          <textarea
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Deskripsi kupon (opsional)"
                          />
                        </div>

                        {/* Status */}
                        <div className="mb-5">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="isActive"
                              checked={formData.isActive}
                              onChange={handleInputChange}
                            />
                            <label className="form-check-label">
                              Kupon Aktif
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discount Settings */}
                  <div className="col-md-6">
                    <div className="card mb-5">
                      <div className="card-header">
                        <h3 className="card-title">Pengaturan Diskon</h3>
                      </div>
                      <div className="card-body">
                        {/* Discount Type */}
                        <div className="mb-5">
                          <label className="form-label required">Tipe Diskon</label>
                          <select
                            className="form-select"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="percentage">Persentase (%)</option>
                            <option value="fixed">Nominal Tetap (Rp)</option>
                          </select>
                        </div>

                        {/* Discount Value */}
                        <div className="mb-5">
                          <label className="form-label required">
                            Nilai Diskon {formData.type === 'percentage' ? '(%)' : '(Rp)'}
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="value"
                            value={formData.value}
                            onChange={handleInputChange}
                            placeholder={formData.type === 'percentage' ? 'Contoh: 10' : 'Contoh: 50000'}
                            min="0"
                            max={formData.type === 'percentage' ? '100' : undefined}
                            required
                          />
                        </div>

                        {/* Minimum Amount */}
                        <div className="mb-5">
                          <label className="form-label">Minimum Pembelian (Rp)</label>
                          <input
                            type="number"
                            className="form-control"
                            name="minimumAmount"
                            value={formData.minimumAmount}
                            onChange={handleInputChange}
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        {/* Maximum Discount (for percentage type) */}
                        {formData.type === 'percentage' && (
                          <div className="mb-5">
                            <label className="form-label">Maksimum Diskon (Rp)</label>
                            <input
                              type="number"
                              className="form-control"
                              name="maximumDiscount"
                              value={formData.maximumDiscount}
                              onChange={handleInputChange}
                              placeholder="Tidak terbatas"
                              min="0"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Usage Limits */}
                  <div className="col-md-6">
                    <div className="card mb-5">
                      <div className="card-header">
                        <h3 className="card-title">Batas Penggunaan</h3>
                      </div>
                      <div className="card-body">
                        {/* Usage Limit */}
                        <div className="mb-5">
                          <label className="form-label">Total Batas Penggunaan</label>
                          <input
                            type="number"
                            className="form-control"
                            name="usageLimit"
                            value={formData.usageLimit}
                            onChange={handleInputChange}
                            placeholder="Tidak terbatas"
                            min="1"
                          />
                          <div className="form-text">Kosongkan untuk penggunaan tidak terbatas</div>
                        </div>

                        {/* User Usage Limit */}
                        <div className="mb-5">
                          <label className="form-label required">Batas Penggunaan per User</label>
                          <input
                            type="number"
                            className="form-control"
                            name="userUsageLimit"
                            value={formData.userUsageLimit}
                            onChange={handleInputChange}
                            min="1"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="col-md-6">
                    <div className="card mb-5">
                      <div className="card-header">
                        <h3 className="card-title">Periode Berlaku</h3>
                      </div>
                      <div className="card-body">
                        {/* Start Date */}
                        <div className="mb-5">
                          <label className="form-label required">Tanggal Mulai</label>
                          <input
                            type="datetime-local"
                            className="form-control"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        {/* End Date */}
                        <div className="mb-5">
                          <label className="form-label required">Tanggal Berakhir</label>
                          <input
                            type="datetime-local"
                            className="form-control"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Package Restrictions */}
                  <div className="col-12">
                    <div className="card mb-5">
                      <div className="card-header">
                        <h3 className="card-title">Pembatasan Paket</h3>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          {/* Applicable Packages */}
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
                                    {pkg.name} - Rp {pkg.price.toLocaleString()}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Excluded Packages */}
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
                                    {pkg.name} - Rp {pkg.price.toLocaleString()}
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

                {/* Submit Button */}
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-light me-3"
                    onClick={() => router.push('/admin/coupons')}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Kupon'
                    )}
                  </button>
                </div>
              </form>
            </div>
            {/* End::Card body */}
          </div>
          {/* End::Card */}
        </div>
        {/* End::Container */}
      </div>
      {/* End::Content */}
    </AdminLayoutJWT>
  );
}
