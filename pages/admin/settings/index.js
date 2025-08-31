// pages/admin/settings/index.js
import { useEffect, useState } from 'react';
import AdminLayoutJWT from '../../../components/layouts/AdminLayoutJWT';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    general: { siteName: '', siteDescription: '', contactEmail: '', supportPhone: '', whatsappNumber: '' },
    features: { allowRegistration: true, requireEmailVerification: true, enablePaymentGateway: true, enableSocialLogin: true },
    limits: { maxInvitationsPerUser: 5, maxGuestsPerInvitation: 500, maxPhotosPerGallery: 20 },
    payment: { xenditApiKey: '', xenditWebhookToken: '', enableSandbox: true },
    email: { smtpHost: '', smtpPort: 587, smtpUser: '', smtpPassword: '', fromEmail: '', fromName: '' },
    social: { facebookUrl: '', instagramUrl: '', twitterUrl: '', youtubeUrl: '' },
  });

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ---------- Data Fetch ----------
  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No authentication token found');

      const res = await fetch('/api/admin/settings/index-jwt', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch settings');

      const data = await res.json();
      if (data?.settings) setSettings(data.settings);
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No authentication token found');

      const res = await fetch('/api/admin/settings/index-jwt', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error('Failed to save settings');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e) {
      setError(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function handleInput(section, field, value) {
    setSettings((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  }

  // ---------- UI Helpers ----------
  const NavItem = ({ id, icon, title, desc }) => (
    <div
      role="button"
      onClick={() => setActiveTab(id)}
      className={`d-flex flex-stack py-4 px-4 rounded border mb-3 ${activeTab === id ? 'bg-light-primary border-primary' : 'bg-body'}`}
    >
      <div className="d-flex align-items-center">
        <i className={`ki-duotone ${icon} fs-2 text-primary me-3`}>
          <span className="path1"></span><span className="path2"></span>
        </i>
        <div className="d-flex flex-column">
          <span className="fw-bold text-gray-900">{title}</span>
          <span className="fs-7 text-muted">{desc}</span>
        </div>
      </div>
      <i className="ki-duotone ki-right fs-2 text-gray-500"></i>
    </div>
  );

  const HeaderBar = () => (
    <div className="d-flex flex-wrap align-items-center justify-content-between mb-6">
      <div className="d-flex flex-column">
        <h1 className="fs-2hx text-gray-900 fw-bold">Settings</h1>
        <div className="text-muted">Kelola konfigurasi platform dan preferensi sistem.</div>
      </div>
      <div className="d-flex gap-3">
        <button type="button" className="btn btn-light" onClick={fetchSettings} disabled={loading || saving}>
          Reset
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <>
              <i className="ki-duotone ki-check fs-2 me-2"><span className="path1"></span><span className="path2"></span></i>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ---------- Loading ----------
  if (loading) {
    return (
      <AdminLayoutJWT>
        <div className="d-flex align-items-center justify-content-center py-20">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
        </div>
      </AdminLayoutJWT>
    );
  }

  return (
    <AdminLayoutJWT>
      <HeaderBar />

      {/* Alerts */}
      {success && (
        <div className="alert alert-success d-flex align-items-center p-5 mb-6">
          <i className="ki-duotone ki-shield-tick fs-2hx text-success me-4"><span className="path1"></span><span className="path2"></span></i>
          <div className="d-flex flex-column">
            <h4 className="mb-1 text-success">Saved</h4>
            <span>Settings saved successfully.</span>
          </div>
        </div>
      )}
      {error && (
        <div className="alert alert-danger d-flex align-items-center p-5 mb-6">
          <i className="ki-duotone ki-information-5 fs-2hx text-danger me-4"><span className="path1"></span><span className="path2"></span></i>
          <div className="d-flex flex-column">
            <h4 className="mb-1 text-danger">Error</h4>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Layout: Aside Nav (left) + Content (right) */}
      <div className="row g-5 g-xl-10">
        {/* Aside */}
        <div className="col-xl-3">
          <div
            className="card"
            data-kt-sticky="true"
            data-kt-sticky-name="settings-nav"
            data-kt-sticky-offset="{default: 90, lg: 120}"
            data-kt-sticky-width="250px"
            data-kt-sticky-left="auto"
            data-kt-sticky-top="150px"
          >
            <div className="card-body">
              <NavItem id="general"  icon="ki-setting-2"    title="General"  desc="Nama situs, deskripsi, kontak" />
              <NavItem id="features" icon="ki-toggle-on"    title="Features" desc="Opsi fitur dan izin" />
              <NavItem id="limits"   icon="ki-chart-simple" title="Limits"   desc="Batasan undangan & galeri" />
              <NavItem id="payment"  icon="ki-credit-cart"  title="Payment"  desc="Xendit & sandbox" />
              <NavItem id="email"    icon="ki-message-text-2" title="Email"  desc="SMTP & pengirim" />
              <NavItem id="social"   icon="ki-facebook"     title="Social"   desc="Tautan media sosial" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="col-xl-9">
          {/* General */}
          {activeTab === 'general' && (
            <div className="card">
              <div className="card-header border-0">
                <h3 className="card-title fw-bold text-gray-800">General</h3>
              </div>
              <div className="card-body pt-0">
                <div className="row g-6">
                  <div className="col-md-6 fv-row">
                    <label className="required fs-6 fw-semibold mb-2">Site Name</label>
                    <input
                      type="text"
                      className="form-control form-control-solid"
                      value={settings.general.siteName}
                      onChange={(e) => handleInput('general', 'siteName', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Contact Email</label>
                    <input
                      type="email"
                      className="form-control form-control-solid"
                      value={settings.general.contactEmail}
                      onChange={(e) => handleInput('general', 'contactEmail', e.target.value)}
                    />
                  </div>
                </div>
                <div className="row g-6 mt-0">
                  <div className="col-12 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Site Description</label>
                    <textarea
                      rows={3}
                      className="form-control form-control-solid"
                      value={settings.general.siteDescription}
                      onChange={(e) => handleInput('general', 'siteDescription', e.target.value)}
                    />
                  </div>
                </div>
                <div className="row g-6 mt-0">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Support Phone</label>
                    <input
                      type="tel"
                      className="form-control form-control-solid"
                      value={settings.general.supportPhone}
                      onChange={(e) => handleInput('general', 'supportPhone', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">WhatsApp Number</label>
                    <input
                      type="tel"
                      className="form-control form-control-solid"
                      value={settings.general.whatsappNumber}
                      onChange={(e) => handleInput('general', 'whatsappNumber', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          {activeTab === 'features' && (
            <div className="card">
              <div className="card-header border-0">
                <h3 className="card-title fw-bold text-gray-800">Features</h3>
              </div>
              <div className="card-body pt-0">
                {[
                  {
                    key: 'allowRegistration',
                    title: 'Allow User Registration',
                    desc: 'Allow new users to register on the platform',
                  },
                  {
                    key: 'requireEmailVerification',
                    title: 'Require Email Verification',
                    desc: 'Users must verify their email before accessing features',
                  },
                  {
                    key: 'enablePaymentGateway',
                    title: 'Enable Payment Gateway',
                    desc: 'Allow users to make payments for premium features',
                  },
                  {
                    key: 'enableSocialLogin',
                    title: 'Enable Social Login',
                    desc: 'Allow users to login with Google, Facebook, etc.',
                  },
                ].map((item) => (
                  <div key={item.key}>
                    <div className="d-flex flex-stack py-3">
                      <div className="d-flex flex-column">
                        <div className="fs-6 fw-semibold">{item.title}</div>
                        <div className="fs-7 text-muted">{item.desc}</div>
                      </div>
                      <div className="form-check form-switch form-check-custom form-check-solid">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={!!settings.features[item.key]}
                          onChange={(e) => handleInput('features', item.key, e.target.checked)}
                        />
                      </div>
                    </div>
                    <div className="separator separator-dashed my-4"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limits */}
          {activeTab === 'limits' && (
            <div className="card">
              <div className="card-header border-0">
                <h3 className="card-title fw-bold text-gray-800">Limits</h3>
              </div>
              <div className="card-body pt-0">
                <div className="row g-6">
                  <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Max Invitations Per User</label>
                    <input
                      type="number"
                      className="form-control form-control-solid"
                      value={settings.limits.maxInvitationsPerUser}
                      onChange={(e) =>
                        handleInput('limits', 'maxInvitationsPerUser', parseInt(e.target.value || '0', 10))
                      }
                    />
                  </div>
                  <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Max Guests Per Invitation</label>
                    <input
                      type="number"
                      className="form-control form-control-solid"
                      value={settings.limits.maxGuestsPerInvitation}
                      onChange={(e) =>
                        handleInput('limits', 'maxGuestsPerInvitation', parseInt(e.target.value || '0', 10))
                      }
                    />
                  </div>
                  <div className="col-md-4 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Max Photos Per Gallery</label>
                    <input
                      type="number"
                      className="form-control form-control-solid"
                      value={settings.limits.maxPhotosPerGallery}
                      onChange={(e) =>
                        handleInput('limits', 'maxPhotosPerGallery', parseInt(e.target.value || '0', 10))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          {activeTab === 'payment' && (
            <div className="card">
              <div className="card-header border-0">
                <h3 className="card-title fw-bold text-gray-800">Payment (Xendit)</h3>
              </div>
              <div className="card-body pt-0">
                <div className="row g-6">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Xendit API Key</label>
                    <input
                      type="password"
                      className="form-control form-control-solid"
                      value={settings.payment.xenditApiKey}
                      onChange={(e) => handleInput('payment', 'xenditApiKey', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Xendit Webhook Token</label>
                    <input
                      type="password"
                      className="form-control form-control-solid"
                      value={settings.payment.xenditWebhookToken}
                      onChange={(e) => handleInput('payment', 'xenditWebhookToken', e.target.value)}
                    />
                  </div>
                </div>
                <div className="separator my-6"></div>
                <div className="d-flex flex-stack">
                  <div className="d-flex flex-column">
                    <div className="fs-6 fw-semibold">Enable Sandbox Mode</div>
                    <div className="fs-7 text-muted">Use sandbox environment for testing</div>
                  </div>
                  <div className="form-check form-switch form-check-custom form-check-solid">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.payment.enableSandbox}
                      onChange={(e) => handleInput('payment', 'enableSandbox', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          {activeTab === 'email' && (
            <div className="card">
              <div className="card-header border-0">
                <h3 className="card-title fw-bold text-gray-800">Email (SMTP)</h3>
              </div>
              <div className="card-body pt-0">
                <div className="row g-6">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">SMTP Host</label>
                    <input
                      type="text"
                      className="form-control form-control-solid"
                      value={settings.email.smtpHost}
                      onChange={(e) => handleInput('email', 'smtpHost', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">SMTP Port</label>
                    <input
                      type="number"
                      className="form-control form-control-solid"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleInput('email', 'smtpPort', parseInt(e.target.value || '0', 10))}
                    />
                  </div>
                </div>
                <div className="row g-6 mt-0">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">SMTP Username</label>
                    <input
                      type="text"
                      className="form-control form-control-solid"
                      value={settings.email.smtpUser}
                      onChange={(e) => handleInput('email', 'smtpUser', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">SMTP Password</label>
                    <input
                      type="password"
                      className="form-control form-control-solid"
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleInput('email', 'smtpPassword', e.target.value)}
                    />
                  </div>
                </div>
                <div className="row g-6 mt-0">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">From Email</label>
                    <input
                      type="email"
                      className="form-control form-control-solid"
                      value={settings.email.fromEmail}
                      onChange={(e) => handleInput('email', 'fromEmail', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">From Name</label>
                    <input
                      type="text"
                      className="form-control form-control-solid"
                      value={settings.email.fromName}
                      onChange={(e) => handleInput('email', 'fromName', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social */}
          {activeTab === 'social' && (
            <div className="card">
              <div className="card-header border-0">
                <h3 className="card-title fw-bold text-gray-800">Social Media</h3>
              </div>
              <div className="card-body pt-0">
                <div className="row g-6">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Facebook URL</label>
                    <input
                      type="url"
                      className="form-control form-control-solid"
                      value={settings.social.facebookUrl}
                      onChange={(e) => handleInput('social', 'facebookUrl', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Instagram URL</label>
                    <input
                      type="url"
                      className="form-control form-control-solid"
                      value={settings.social.instagramUrl}
                      onChange={(e) => handleInput('social', 'instagramUrl', e.target.value)}
                    />
                  </div>
                </div>
                <div className="row g-6 mt-0">
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">Twitter URL</label>
                    <input
                      type="url"
                      className="form-control form-control-solid"
                      value={settings.social.twitterUrl}
                      onChange={(e) => handleInput('social', 'twitterUrl', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 fv-row">
                    <label className="fs-6 fw-semibold mb-2">YouTube URL</label>
                    <input
                      type="url"
                      className="form-control form-control-solid"
                      value={settings.social.youtubeUrl}
                      onChange={(e) => handleInput('social', 'youtubeUrl', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom bar Save (nice UX) */}
          <div className="d-flex justify-content-end mt-6">
            <button type="button" className="btn btn-light me-3" onClick={fetchSettings} disabled={loading || saving}>
              Reset
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
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
        </div>
      </div>
    </AdminLayoutJWT>
  );
}
