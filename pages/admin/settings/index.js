import { useState, useEffect } from 'react';
import AdminLayoutJWT from '../../../components/layouts/AdminLayoutJWT';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    general: {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      supportPhone: '',
      whatsappNumber: ''
    },
    features: {
      allowRegistration: true,
      requireEmailVerification: true,
      enablePaymentGateway: true,
      enableSocialLogin: true
    },
    limits: {
      maxInvitationsPerUser: 5,
      maxGuestsPerInvitation: 500,
      maxPhotosPerGallery: 20
    },
    payment: {
      xenditApiKey: '',
      xenditWebhookToken: '',
      enableSandbox: true
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: ''
    },
    social: {
      facebookUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      youtubeUrl: ''
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin/settings/index-jwt', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettings(data.settings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin/settings/index-jwt', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: 'ki-setting-2' },
    { id: 'features', name: 'Features', icon: 'ki-toggle-on' },
    { id: 'limits', name: 'Limits', icon: 'ki-chart-simple' },
    { id: 'payment', name: 'Payment', icon: 'ki-credit-cart' },
    { id: 'email', name: 'Email', icon: 'ki-message-text-2' },
    { id: 'social', name: 'Social Media', icon: 'ki-facebook' }
  ];

  if (loading) {
    return (
      <AdminLayoutJWT>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayoutJWT>
    );
  }

  return (
    <AdminLayoutJWT>
      <div className="card">
        {/* Begin::Card header */}
        <div className="card-header border-0 pt-6">
          {/* Begin::Card title */}
          <div className="card-title">
            <h2>Settings</h2>
          </div>
          {/* End::Card title */}

          {/* Begin::Card toolbar */}
          <div className="card-toolbar">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="ki-duotone ki-check fs-2 me-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Save Settings
                </>
              )}
            </button>
          </div>
          {/* End::Card toolbar */}
        </div>
        {/* End::Card header */}

        {/* Begin::Card body */}
        <div className="card-body">
          {/* Success/Error Messages */}
          {success && (
            <div className="alert alert-success d-flex align-items-center p-5 mb-10">
              <i className="ki-duotone ki-shield-tick fs-2hx text-success me-4">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <div className="d-flex flex-column">
                <h4 className="mb-1 text-success">Success</h4>
                <span>Settings saved successfully!</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger d-flex align-items-center p-5 mb-10">
              <i className="ki-duotone ki-shield-cross fs-2hx text-danger me-4">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <div className="d-flex flex-column">
                <h4 className="mb-1 text-danger">Error</h4>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Begin::Tabs */}
          <ul className="nav nav-tabs nav-line-tabs mb-5 fs-6">
            {tabs.map((tab) => (
              <li key={tab.id} className="nav-item">
                <a
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className={`ki-duotone ${tab.icon} fs-2 me-2`}>
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  {tab.name}
                </a>
              </li>
            ))}
          </ul>
          {/* End::Tabs */}

          {/* Begin::Tab content */}
          <div className="tab-content" id="myTabContent">
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="tab-pane fade show active">
                <div className="row">
                  <div className="col-md-6 fv-row">
                    <label className="required fs-6 fw-semibold mb-2">Site Name</label>
                    <input
                      type="text"
                      className="form-control form-control-solid"
                      value={settings.general.siteName}
                      onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Contact Email</label>
                    <input
                      type="email"
                      className="form-control form-control-solid"
                      value={settings.general.contactEmail}
                      onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                    />
                  </div>
                </div>
                <div className="row mt-5">
                  <div className="col-12 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Site Description</label>
                    <textarea
                      className="form-control form-control-solid"
                      rows={3}
                      value={settings.general.siteDescription}
                      onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                    />
                  </div>
                </div>
                <div className="row mt-5">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Support Phone</label>
                    <input
                      type="tel"
                      className="form-control form-control-solid"
                      value={settings.general.supportPhone}
                      onChange={(e) => handleInputChange('general', 'supportPhone', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">WhatsApp Number</label>
                    <input
                      type="tel"
                      className="form-control form-control-solid"
                      value={settings.general.whatsappNumber}
                      onChange={(e) => handleInputChange('general', 'whatsappNumber', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Features Settings */}
            {activeTab === 'features' && (
              <div className="tab-pane fade show active">
                <div className="d-flex flex-stack">
                  <div className="d-flex flex-column">
                    <div className="fs-6 fw-semibold">Allow User Registration</div>
                    <div className="fs-7 text-muted">Allow new users to register on the platform</div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <div className="form-check form-switch form-check-custom form-check-solid">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.features.allowRegistration}
                        onChange={(e) => handleInputChange('features', 'allowRegistration', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
                <div className="separator separator-dashed my-5"></div>
                <div className="d-flex flex-stack">
                  <div className="d-flex flex-column">
                    <div className="fs-6 fw-semibold">Require Email Verification</div>
                    <div className="fs-7 text-muted">Users must verify their email before accessing features</div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <div className="form-check form-switch form-check-custom form-check-solid">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.features.requireEmailVerification}
                        onChange={(e) => handleInputChange('features', 'requireEmailVerification', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
                <div className="separator separator-dashed my-5"></div>
                <div className="d-flex flex-stack">
                  <div className="d-flex flex-column">
                    <div className="fs-6 fw-semibold">Enable Payment Gateway</div>
                    <div className="fs-7 text-muted">Allow users to make payments for premium features</div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <div className="form-check form-switch form-check-custom form-check-solid">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.features.enablePaymentGateway}
                        onChange={(e) => handleInputChange('features', 'enablePaymentGateway', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
                <div className="separator separator-dashed my-5"></div>
                <div className="d-flex flex-stack">
                  <div className="d-flex flex-column">
                    <div className="fs-6 fw-semibold">Enable Social Login</div>
                    <div className="fs-7 text-muted">Allow users to login with Google, Facebook, etc.</div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <div className="form-check form-switch form-check-custom form-check-solid">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.features.enableSocialLogin}
                        onChange={(e) => handleInputChange('features', 'enableSocialLogin', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Limits Settings */}
            {activeTab === 'limits' && (
              <div className="tab-pane fade show active">
                <div className="row">
                  <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Max Invitations Per User</label>
                    <input
                      type="number"
                      className="form-control form-control-solid"
                      value={settings.limits.maxInvitationsPerUser}
                      onChange={(e) => handleInputChange('limits', 'maxInvitationsPerUser', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Max Guests Per Invitation</label>
                    <input
                      type="number"
                      className="form-control form-control-solid"
                      value={settings.limits.maxGuestsPerInvitation}
                      onChange={(e) => handleInputChange('limits', 'maxGuestsPerInvitation', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Max Photos Per Gallery</label>
                    <input
                      type="number"
                      className="form-control form-control-solid"
                      value={settings.limits.maxPhotosPerGallery}
                      onChange={(e) => handleInputChange('limits', 'maxPhotosPerGallery', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="tab-pane fade show active">
                <div className="row">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Xendit API Key</label>
                    <input
                      type="password"
                      className="form-control form-control-solid"
                      value={settings.payment.xenditApiKey}
                      onChange={(e) => handleInputChange('payment', 'xenditApiKey', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Xendit Webhook Token</label>
                    <input
                      type="password"
                      className="form-control form-control-solid"
                      value={settings.payment.xenditWebhookToken}
                      onChange={(e) => handleInputChange('payment', 'xenditWebhookToken', e.target.value)}
                    />
                  </div>
                </div>
                <div className="row mt-5">
                  <div className="col-12">
                    <div className="d-flex flex-stack">
                      <div className="d-flex flex-column">
                        <div className="fs-6 fw-semibold">Enable Sandbox Mode</div>
                        <div className="fs-7 text-muted">Use sandbox environment for testing</div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <div className="form-check form-switch form-check-custom form-check-solid">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.payment.enableSandbox}
                            onChange={(e) => handleInputChange('payment', 'enableSandbox', e.target.checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="tab-pane fade show active">
                <div className="row">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">SMTP Host</label>
                    <input
                      type="text"
                      className="form-control form-control-solid"
                      value={settings.email.smtpHost}
                      onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">SMTP Port</label>
                    <input
                      type="number"
                      className="form-control form-control-solid"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="row mt-5">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">SMTP Username</label>
                    <input
                      type="text"
                      className="form-control form-control-solid"
                      value={settings.email.smtpUser}
                      onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">SMTP Password</label>
                    <input
                      type="password"
                      className="form-control form-control-solid"
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                    />
                  </div>
                </div>
                <div className="row mt-5">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">From Email</label>
                    <input
                      type="email"
                      className="form-control form-control-solid"
                      value={settings.email.fromEmail}
                      onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">From Name</label>
                    <input
                      type="text"
                      className="form-control form-control-solid"
                      value={settings.email.fromName}
                      onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Social Media Settings */}
            {activeTab === 'social' && (
              <div className="tab-pane fade show active">
                <div className="row">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Facebook URL</label>
                    <input
                      type="url"
                      className="form-control form-control-solid"
                      value={settings.social.facebookUrl}
                      onChange={(e) => handleInputChange('social', 'facebookUrl', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Instagram URL</label>
                    <input
                      type="url"
                      className="form-control form-control-solid"
                      value={settings.social.instagramUrl}
                      onChange={(e) => handleInputChange('social', 'instagramUrl', e.target.value)}
                    />
                  </div>
                </div>
                <div className="row mt-5">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Twitter URL</label>
                    <input
                      type="url"
                      className="form-control form-control-solid"
                      value={settings.social.twitterUrl}
                      onChange={(e) => handleInputChange('social', 'twitterUrl', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">YouTube URL</label>
                    <input
                      type="url"
                      className="form-control form-control-solid"
                      value={settings.social.youtubeUrl}
                      onChange={(e) => handleInputChange('social', 'youtubeUrl', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
          {/* End::Tab content */}
        </div>
        {/* End::Card body */}
      </div>
    </AdminLayoutJWT>
  );
}
