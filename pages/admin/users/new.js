import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/layouts/AdminLayout';

export default function CreateUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    source: 'whatsapp',
    package: '',
    createInvitation: false,
    invitation: {
      template: 'classic',
      mempelai: {
        pria: '',
        wanita: '',
        orangtua_pria: '',
        orangtua_wanita: ''
      },
      acara_utama: {
        nama: 'Akad & Resepsi',
        tanggal: '',
        waktu: '',
        lokasi: '',
        alamat: ''
      }
    }
  });

  const [packages, setPackages] = useState([]);
  const [templates, setTemplates] = useState([
    { id: 'classic', name: 'Classic' },
    { id: 'modern', name: 'Modern' },
    { id: 'elegant', name: 'Elegant' }
  ]);

  // Fetch available packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages');
      if (!response.ok) throw new Error('Failed to fetch packages');
      const data = await response.json();
      setPackages(data.packages.filter(p => p.isActive));
    } catch (err) {
      setError('Failed to load packages');
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInvitationChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        [field]: value
      }
    }));
  };

  const handleMempelaiChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        mempelai: {
          ...prev.invitation.mempelai,
          [field]: value
        }
      }
    }));
  };

  const handleAcaraChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        acara_utama: {
          ...prev.invitation.acara_utama,
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create user
      const userResponse = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          source: form.source,
          packageId: form.package
        })
      });

      if (!userResponse.ok) {
        throw new Error('Failed to create user');
      }

      const userData = await userResponse.json();

      // If createInvitation is checked, create invitation
      if (form.createInvitation) {
        const invitationResponse = await fetch('/api/admin/invitations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userData.user._id,
            template: form.invitation.template,
            mempelai: form.invitation.mempelai,
            acara_utama: form.invitation.acara_utama
          })
        });

        if (!invitationResponse.ok) {
          throw new Error('Failed to create invitation');
        }
      }

      setSuccess(true);
      router.push(`/admin/users/${userData.user._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="card">
        <div className="card-header border-0 pt-6">
          <div className="card-title">
            <h2>Create New User</h2>
          </div>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger mb-5">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-5">
              User created successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* User Information */}
            <div className="mb-8">
              <h3 className="mb-5">User Information</h3>
              <div className="row g-5">
                <div className="col-md-6">
                  <label className="form-label required">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label required">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label required">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label required">Package</label>
                  <select
                    className="form-select"
                    value={form.package}
                    onChange={(e) => handleChange('package', e.target.value)}
                    required
                  >
                    <option value="">Select Package</option>
                    {packages.map(pkg => (
                      <option key={pkg._id} value={pkg._id}>
                        {pkg.name} - Rp {pkg.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Create Invitation Option */}
            <div className="mb-8">
              <div className="form-check form-switch form-check-custom form-check-solid">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={form.createInvitation}
                  onChange={(e) => handleChange('createInvitation', e.target.checked)}
                />
                <label className="form-check-label">
                  Create invitation now
                </label>
              </div>
            </div>

            {/* Invitation Form */}
            {form.createInvitation && (
              <div className="mb-8">
                <h3 className="mb-5">Invitation Details</h3>
                <div className="row g-5">
                  <div className="col-md-6">
                    <label className="form-label required">Template</label>
                    <select
                      className="form-select"
                      value={form.invitation.template}
                      onChange={(e) => handleInvitationChange('template', e.target.value)}
                      required
                    >
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mempelai Information */}
                  <div className="col-12">
                    <h4 className="mb-3">Mempelai</h4>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required">Nama Mempelai Pria</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.invitation.mempelai.pria}
                      onChange={(e) => handleMempelaiChange('pria', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required">Nama Mempelai Wanita</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.invitation.mempelai.wanita}
                      onChange={(e) => handleMempelaiChange('wanita', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Orangtua Mempelai Pria</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.invitation.mempelai.orangtua_pria}
                      onChange={(e) => handleMempelaiChange('orangtua_pria', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Orangtua Mempelai Wanita</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.invitation.mempelai.orangtua_wanita}
                      onChange={(e) => handleMempelaiChange('orangtua_wanita', e.target.value)}
                    />
                  </div>

                  {/* Acara Information */}
                  <div className="col-12">
                    <h4 className="mb-3">Acara</h4>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required">Tanggal</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.invitation.acara_utama.tanggal}
                      onChange={(e) => handleAcaraChange('tanggal', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required">Waktu</label>
                    <input
                      type="time"
                      className="form-control"
                      value={form.invitation.acara_utama.waktu}
                      onChange={(e) => handleAcaraChange('waktu', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required">Lokasi</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.invitation.acara_utama.lokasi}
                      onChange={(e) => handleAcaraChange('lokasi', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label required">Alamat</label>
                    <textarea
                      className="form-control"
                      value={form.invitation.acara_utama.alamat}
                      onChange={(e) => handleAcaraChange('alamat', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-end">
              <button
                type="button"
                className="btn btn-light me-3"
                onClick={() => router.push('/admin/users')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
