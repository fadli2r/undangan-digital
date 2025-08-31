// pages/admin/packages/[packageId]/edit.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayoutJWT from '../../../../components/layouts/AdminLayoutJWT';

export default function EditPackage() {
  const router = useRouter();
  const { packageId } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    duration: { value: 1, unit: 'months' },
    // ← Hapus TypeScript: [] as Array<{ ... }>
    features: [],
    limits: {
      invitations: 1,
      guests: 100,
      photos: 10,
      templates: [],
      customDomain: false,
      removeWatermark: false,
      analytics: false,
      priority_support: false,
    },
    metadata: { color: '#3B82F6', icon: '📦', badge: '' },
    isActive: true,
    isPopular: false,
    isFeatured: false,
    sortOrder: 0,
  });

  useEffect(() => {
    if (packageId) fetchPackage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId]);

  async function fetchPackage() {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No authentication token found');

      const res = await fetch(`/api/admin/packages/${packageId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch package');

      const data = await res.json();

      // Normalisasi data agar tidak undefined
      const pkg = data.package || {};
      setForm({
        name: pkg.name || '',
        description: pkg.description || '',
        price: Number(pkg.price || 0),
        originalPrice: Number(pkg.originalPrice || 0),
        duration: {
          value: Number(pkg.duration?.value || 1),
          unit: pkg.duration?.unit || 'months',
        },
        features: Array.isArray(pkg.features)
          ? pkg.features.map((f) => ({
              name: f?.name || '',
              description: f?.description || '',
              included: !!f?.included,
              limit: typeof f?.limit === 'number' ? f.limit : null,
            }))
          : [],
        limits: {
          invitations: Number(pkg.limits?.invitations || 1),
          guests: Number(pkg.limits?.guests || 100),
          photos: Number(pkg.limits?.photos || 10),
          templates: Array.isArray(pkg.limits?.templates) ? pkg.limits.templates : [],
          customDomain: !!pkg.limits?.customDomain,
          removeWatermark: !!pkg.limits?.removeWatermark,
          analytics: !!pkg.limits?.analytics,
          priority_support: !!pkg.limits?.priority_support,
        },
        metadata: {
          color: pkg.metadata?.color || '#3B82F6',
          icon: pkg.metadata?.icon || '📦',
          badge: pkg.metadata?.badge || '',
        },
        isActive: pkg.isActive !== false,
        isPopular: !!pkg.isPopular,
        isFeatured: !!pkg.isFeatured,
        sortOrder: Number(pkg.sortOrder || 0),
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch package');
    } finally {
      setLoading(false);
    }
  }

  // ------ handlers (tanpa TS types) ------
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNestedChange(parent, field, value) {
    setForm((prev) => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  }

  function handleFeatureChange(index, field, value) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    }));
  }

  function addFeature() {
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, { name: '', description: '', included: true, limit: null }],
    }));
  }

  function removeFeature(index) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No authentication token found');

      const res = await fetch(`/api/admin/packages/${packageId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update package');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update package');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayoutJWT>
        <div className="d-flex align-items-center justify-content-center py-20">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayoutJWT>
    );
  }

  return (
    <AdminLayoutJWT>
      <div className="d-flex flex-column gap-5">
        {/* Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="fs-2hx text-gray-900 fw-bold">Edit Package</h1>
            <div className="text-muted">Update package details and features.</div>
          </div>
          <div>
            <button type="button" onClick={() => router.push('/admin/packages')} className="btn btn-light">
              <i className="ki-duotone ki-arrow-left fs-3 me-2"></i>
              Back to Packages
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <i className="ki-duotone ki-check fs-2 me-3"></i>
            <div>Package updated successfully!</div>
          </div>
        )}
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="ki-duotone ki-information-5 fs-2 me-3"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-5">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header border-0">
              <h3 className="card-title fw-bold text-gray-800">Basic Information</h3>
            </div>
            <div className="card-body pt-0">
              <div className="row g-6">
                <div className="col-sm-6">
                  <label className="form-label required">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label required">Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value || '0'))}
                    className="form-control"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Original Price</label>
                  <input
                    type="number"
                    value={form.originalPrice ?? 0}
                    onChange={(e) => handleChange('originalPrice', parseFloat(e.target.value || '0'))}
                    className="form-control"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label required">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => handleChange('sortOrder', parseInt(e.target.value || '0', 10))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label required">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="card">
            <div className="card-header border-0">
              <h3 className="card-title fw-bold text-gray-800">Duration</h3>
            </div>
            <div className="card-body pt-0">
              <div className="row g-6">
                <div className="col-sm-6">
                  <label className="form-label required">Value</label>
                  <input
                    type="number"
                    value={form.duration.value}
                    onChange={(e) => handleNestedChange('duration', 'value', parseInt(e.target.value || '1', 10))}
                    className="form-control"
                    min="1"
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label required">Unit</label>
                  <select
                    value={form.duration.unit}
                    onChange={(e) => handleNestedChange('duration', 'unit', e.target.value)}
                    className="form-select"
                    data-kt-select2="true"
                    required
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="card">
            <div className="card-header border-0 align-items-center">
              <h3 className="card-title fw-bold text-gray-800">Features</h3>
              <div className="card-toolbar">
                <button type="button" onClick={addFeature} className="btn btn-light-primary">
                  <i className="ki-duotone ki-plus fs-3 me-1"></i>
                  Add Feature
                </button>
              </div>
            </div>
            <div className="card-body pt-0">
              {form.features.length === 0 && (
                <div className="text-muted">No features yet. Click <b>Add Feature</b> to add one.</div>
              )}

              <div className="d-flex flex-column gap-4">
                {form.features.map((feature, index) => (
                  <div key={index} className="border rounded p-4 bg-light">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label required">Name</label>
                        <input
                          type="text"
                          value={feature.name}
                          onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Description</label>
                        <input
                          type="text"
                          value={feature.description || ''}
                          onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Limit</label>
                        <input
                          type="number"
                          value={feature.limit ?? ''}
                          onChange={(e) =>
                            handleFeatureChange(
                              index,
                              'limit',
                              e.target.value ? parseInt(e.target.value, 10) : null
                            )
                          }
                          className="form-control"
                          placeholder="No limit"
                        />
                      </div>
                      <div className="col-md-4 d-flex align-items-end">
                        <div className="form-check form-check-custom form-check-solid">
                          <input
                            id={`included-${index}`}
                            type="checkbox"
                            className="form-check-input"
                            checked={!!feature.included}
                            onChange={(e) => handleFeatureChange(index, 'included', e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor={`included-${index}`}>Included</label>
                        </div>
                      </div>
                      <div className="col-md-4 d-flex align-items-end justify-content-end">
                        <button type="button" onClick={() => removeFeature(index)} className="btn btn-light-danger">
                          <i className="ki-duotone ki-trash fs-3 me-1"></i>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="card">
            <div className="card-header border-0">
              <h3 className="card-title fw-bold text-gray-800">Limits</h3>
            </div>
            <div className="card-body pt-0">
              <div className="row g-6">
                <div className="col-sm-6">
                  <label className="form-label required">Max Invitations</label>
                  <input
                    type="number"
                    value={form.limits.invitations}
                    onChange={(e) => handleNestedChange('limits', 'invitations', parseInt(e.target.value || '1', 10))}
                    className="form-control"
                    min="1"
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label required">Max Guests per Invitation</label>
                  <input
                    type="number"
                    value={form.limits.guests}
                    onChange={(e) => handleNestedChange('limits', 'guests', parseInt(e.target.value || '1', 10))}
                    className="form-control"
                    min="1"
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label required">Max Photos</label>
                  <input
                    type="number"
                    value={form.limits.photos}
                    onChange={(e) => handleNestedChange('limits', 'photos', parseInt(e.target.value || '0', 10))}
                    className="form-control"
                    min="0"
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Available Templates</label>
                  <select
                    multiple
                    value={form.limits.templates}
                    onChange={(e) =>
                      handleNestedChange(
                        'limits',
                        'templates',
                        Array.from(e.target.selectedOptions, (o) => o.value)
                      )
                    }
                    className="form-select"
                    data-kt-select2="true"
                    data-placeholder="Select templates"
                  >
                    <option value="classic">Classic</option>
                    <option value="modern">Modern</option>
                    <option value="elegant">Elegant</option>
                  </select>
                </div>
              </div>

              <div className="separator my-6"></div>

              <div className="d-flex flex-column gap-4">
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    id="customDomain"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.limits.customDomain}
                    onChange={(e) => handleNestedChange('limits', 'customDomain', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="customDomain">Allow Custom Domain</label>
                </div>

                <div className="form-check form-check-custom form-check-solid">
                  <input
                    id="removeWatermark"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.limits.removeWatermark}
                    onChange={(e) => handleNestedChange('limits', 'removeWatermark', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="removeWatermark">Remove Watermark</label>
                </div>

                <div className="form-check form-check-custom form-check-solid">
                  <input
                    id="analytics"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.limits.analytics}
                    onChange={(e) => handleNestedChange('limits', 'analytics', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="analytics">Enable Analytics</label>
                </div>

                <div className="form-check form-check-custom form-check-solid">
                  <input
                    id="priority_support"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.limits.priority_support}
                    onChange={(e) => handleNestedChange('limits', 'priority_support', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="priority_support">Priority Support</label>
                </div>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="card">
            <div className="card-header border-0">
              <h3 className="card-title fw-bold text-gray-800">Display Settings</h3>
            </div>
            <div className="card-body pt-0">
              <div className="row g-6">
                <div className="col-sm-4">
                  <label className="form-label">Color</label>
                  <input
                    type="color"
                    value={form.metadata.color}
                    onChange={(e) => handleNestedChange('metadata', 'color', e.target.value)}
                    className="form-control form-control-color"
                  />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Icon</label>
                  <input
                    type="text"
                    value={form.metadata.icon}
                    onChange={(e) => handleNestedChange('metadata', 'icon', e.target.value)}
                    className="form-control"
                    placeholder="📦"
                  />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Badge Text</label>
                  <input
                    type="text"
                    value={form.metadata.badge || ''}
                    onChange={(e) => handleNestedChange('metadata', 'badge', e.target.value)}
                    className="form-control"
                    placeholder="Most Popular"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="card">
            <div className="card-header border-0">
              <h3 className="card-title fw-bold text-gray-800">Status</h3>
            </div>
            <div className="card-body pt-0">
              <div className="d-flex flex-wrap gap-6">
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    id="isActive"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isActive">Active</label>
                </div>
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    id="isPopular"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.isPopular}
                    onChange={(e) => handleChange('isPopular', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isPopular">Popular</label>
                </div>
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    id="isFeatured"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.isFeatured}
                    onChange={(e) => handleChange('isFeatured', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isFeatured">Featured</label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="d-flex justify-content-end">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayoutJWT>
  );
}
