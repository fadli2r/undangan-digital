// pages/admin/packages/new.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import SeoHead from '@/components/SeoHead';

const INITIAL_FORM = {
  // basic
  name: "",
  slug: "",
  description: "",
  price: 0,
  originalPrice: "",
  currency: "IDR",
  duration: { value: 12, unit: "months" },

  // gating
  type: "fixed",            // 'fixed' | 'custom'
  featureKeys: [],          // default aktif
  selectableFeatures: [],   // utk custom (kosong = semua bisa dipilih)

  // marketing features (opsional untuk landing)
  features: [],

  // limits
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

  // display/status
  metadata: { color: "#3B82F6", icon: "📦", badge: "" },
  isActive: true,
  isPopular: false,
  isFeatured: false,
  sortOrder: 0,
};

export default function NewPackage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // katalog fitur untuk checkbox gating
  const [allFeatures, setAllFeatures] = useState([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  // 🔒 Redirect non-admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.isAdmin) {
      router.replace("/admin/login");
    }
  }, [session, status, router]);

  // fetch katalog fitur
  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      (async () => {
        try {
          setLoadingFeatures(true);
          const res = await fetch(`/api/admin/features?active=true&limit=1000`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to fetch features");
          setAllFeatures(data.features || []);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingFeatures(false);
        }
      })();
    }
  }, [status, session]);

  // ------- handlers -------
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  function handleNestedChange(parent, field, value) {
    setForm((prev) => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  }
  function toggleKey(path, key) {
    setForm((prev) => {
      const draft = { ...prev };
      const set = new Set(draft[path] || []);
      if (set.has(key)) set.delete(key); else set.add(key);
      draft[path] = Array.from(set);
      return draft;
    });
  }
  function addMarketingFeature() {
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, { name: "", description: "", included: true, limit: null }],
    }));
  }
  function updateMarketingFeature(idx, field, value) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === idx ? { ...f, [field]: value } : f)),
    }));
  }
  function removeMarketingFeature(idx) {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create package");
      setSuccess(true);
      // setelah sukses, arahkan ke edit detail paket
      router.replace(`/admin/packages/${data.package._id}/edit`);
    } catch (err) {
      setError(err.message || "Failed to create package");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || (!session?.user?.isAdmin && status !== "unauthenticated")) {
    return (
      <AdminLayout>
        <div className="d-flex align-items-center justify-content-center py-20">
          <div className="spinner-border text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SeoHead
        title="Tambah Paket Baru - Dreamslink"
        description="Halaman untuk menambahkan paket undangan baru di panel admin."
        noindex
        canonical="/admin/packages/new"
      />
      <div className="d-flex flex-column gap-5">
        {/* Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="fs-2hx text-gray-900 fw-bold">New Package</h1>
            <div className="text-muted">Buat paket baru & atur fitur bawaannya.</div>
          </div>
          <div>
            <button type="button" onClick={() => router.push("/admin/packages")} className="btn btn-light">
              <i className="ki-duotone ki-arrow-left fs-3 me-2" />
              Back to Packages
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="alert alert-success d-flex align-items-center">
            <i className="ki-duotone ki-check fs-2 me-3" />
            <div>Package created successfully.</div>
          </div>
        )}
        {error && (
          <div className="alert alert-danger d-flex align-items-center">
            <i className="ki-duotone ki-information-5 fs-2 me-3" />
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
                  <input className="form-control" value={form.name} onChange={(e)=>handleChange("name", e.target.value)} required />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Slug</label>
                  <input className="form-control" value={form.slug} onChange={(e)=>handleChange("slug", e.target.value.toLowerCase())} placeholder="auto from name if empty" />
                </div>

                <div className="col-sm-4">
                  <label className="form-label required">Price</label>
                  <input type="number" className="form-control" value={form.price} onChange={(e)=>handleChange("price", parseFloat(e.target.value || "0"))} min="0" step="0.01" required />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Original Price</label>
                  <input type="number" className="form-control" value={form.originalPrice === "" ? "" : Number(form.originalPrice)} onChange={(e)=>handleChange("originalPrice", e.target.value === "" ? "" : parseFloat(e.target.value || "0"))} min="0" step="0.01" />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Currency</label>
                  <input className="form-control" value={form.currency} onChange={(e)=>handleChange("currency", e.target.value)} />
                </div>

                <div className="col-sm-12">
                  <label className="form-label required">Description</label>
                  <textarea rows={3} className="form-control" value={form.description} onChange={(e)=>handleChange("description", e.target.value)} required />
                </div>

                <div className="col-sm-6">
                  <label className="form-label required">Sort Order</label>
                  <input type="number" className="form-control" value={form.sortOrder} onChange={(e)=>handleChange("sortOrder", parseInt(e.target.value || "0", 10))} required />
                </div>
              </div>
            </div>
          </div>

          {/* Duration & Type */}
          <div className="card">
            <div className="card-header border-0">
              <h3 className="card-title fw-bold text-gray-800">Duration & Type</h3>
            </div>
            <div className="card-body pt-0">
              <div className="row g-6">
                <div className="col-sm-6">
                  <label className="form-label required">Duration</label>
                  <div className="input-group">
                    <input type="number" className="form-control" value={form.duration.value} onChange={(e)=>handleNestedChange("duration","value", parseInt(e.target.value || "1", 10))} min="1" required />
                    <select className="form-select" value={form.duration.unit} onChange={(e)=>handleNestedChange("duration","unit", e.target.value)} required>
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                </div>
                <div className="col-sm-6">
                  <label className="form-label required">Type</label>
                  <select className="form-select" value={form.type} onChange={(e)=>handleChange("type", e.target.value)} required>
                    <option value="fixed">Fixed</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Gating Feature Keys */}
          <div className="card">
            <div className="card-header border-0 align-items-center">
              <h3 className="card-title fw-bold text-gray-800">Feature Keys (Gating)</h3>
            </div>
            <div className="card-body pt-0">
              {loadingFeatures ? (
                <div className="d-flex align-items-center text-primary">
                  <span className="spinner-border spinner-border-sm me-2" /> Memuat fitur…
                </div>
              ) : (
                <>
                  <div className="mb-3 fw-semibold">Default aktif (featureKeys)</div>
                  <div className="row g-3">
                    {allFeatures.map((f) => (
                      <div className="col-md-4" key={f._id}>
                        <label className="form-check form-check-custom">
                          <input
                            type="checkbox"
                            className="form-check-input me-2"
                            checked={form.featureKeys.includes(f.key)}
                            onChange={() => toggleKey("featureKeys", f.key)}
                          />
                          <span className="form-check-label">
                            <code>{f.key}</code> — {f.name}
                          </span>
                        </label>
                      </div>
                    ))}
                    {allFeatures.length === 0 && <div className="text-muted">Belum ada fitur</div>}
                  </div>

                  <div className="separator my-6"></div>

                  <div className="mb-3 fw-semibold">Selectable (khusus paket <b>custom</b>)</div>
                  <div className="form-text mb-3">Kosongkan untuk mengizinkan semua fitur katalog dipilih user.</div>
                  <div className="row g-3">
                    {allFeatures.map((f) => (
                      <div className="col-md-4" key={f._id}>
                        <label className="form-check form-check-custom">
                          <input
                            type="checkbox"
                            className="form-check-input me-2"
                            checked={form.selectableFeatures.includes(f.key)}
                            onChange={() => toggleKey("selectableFeatures", f.key)}
                            disabled={form.type !== "custom"}
                          />
                          <span className="form-check-label">
                            <code>{f.key}</code> — {f.name}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Marketing Features (optional untuk landing) */}
          <div className="card">
            <div className="card-header border-0 align-items-center">
              <h3 className="card-title fw-bold text-gray-800">Marketing Features (optional)</h3>
              <div className="card-toolbar">
                <button type="button" onClick={addMarketingFeature} className="btn btn-light-primary">
                  <i className="ki-duotone ki-plus fs-3 me-1" />
                  Add Feature
                </button>
              </div>
            </div>
            <div className="card-body pt-0">
              {form.features.length === 0 && <div className="text-muted">Belum ada marketing features.</div>}
              <div className="d-flex flex-column gap-4">
                {form.features.map((f, i) => (
                  <div key={i} className="border rounded p-4 bg-light">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label required">Name</label>
                        <input className="form-control" value={f.name} onChange={(e)=>updateMarketingFeature(i,"name", e.target.value)} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Description</label>
                        <input className="form-control" value={f.description || ""} onChange={(e)=>updateMarketingFeature(i,"description", e.target.value)} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Limit</label>
                        <input type="number" className="form-control" value={f.limit ?? ""} onChange={(e)=>updateMarketingFeature(i,"limit", e.target.value ? parseInt(e.target.value, 10) : null)} placeholder="No limit" />
                      </div>
                      <div className="col-md-4 d-flex align-items-end">
                        <label className="form-check form-check-custom">
                          <input type="checkbox" className="form-check-input me-2" checked={!!f.included} onChange={(e)=>updateMarketingFeature(i,"included", e.target.checked)} />
                          <span className="form-check-label">Included</span>
                        </label>
                      </div>
                      <div className="col-md-4 d-flex align-items-end justify-content-end">
                        <button type="button" className="btn btn-light-danger" onClick={()=>removeMarketingFeature(i)}>
                          <i className="ki-duotone ki-trash fs-3 me-1" />
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
                  <input type="number" className="form-control" value={form.limits.invitations} onChange={(e)=>handleNestedChange("limits","invitations", parseInt(e.target.value || "1", 10))} min="1" required />
                </div>
                <div className="col-sm-6">
                  <label className="form-label required">Max Guests per Invitation</label>
                  <input type="number" className="form-control" value={form.limits.guests} onChange={(e)=>handleNestedChange("limits","guests", parseInt(e.target.value || "1", 10))} min="1" required />
                </div>
                <div className="col-sm-6">
                  <label className="form-label required">Max Photos</label>
                  <input type="number" className="form-control" value={form.limits.photos} onChange={(e)=>handleNestedChange("limits","photos", parseInt(e.target.value || "0", 10))} min="0" required />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Available Templates</label>
                  <select
                    multiple
                    className="form-select"
                    value={form.limits.templates}
                    onChange={(e)=>handleNestedChange("limits","templates", Array.from(e.target.selectedOptions, o => o.value))}
                  >
                    <option value="classic">Classic</option>
                    <option value="modern">Modern</option>
                    <option value="elegant">Elegant</option>
                  </select>
                </div>
              </div>

              <div className="separator my-6"></div>

              <div className="d-flex flex-column gap-4">
                <label className="form-check form-check-custom">
                  <input type="checkbox" className="form-check-input me-2" checked={form.limits.customDomain} onChange={(e)=>handleNestedChange("limits","customDomain", e.target.checked)} />
                  <span className="form-check-label">Allow Custom Domain</span>
                </label>
                <label className="form-check form-check-custom">
                  <input type="checkbox" className="form-check-input me-2" checked={form.limits.removeWatermark} onChange={(e)=>handleNestedChange("limits","removeWatermark", e.target.checked)} />
                  <span className="form-check-label">Remove Watermark</span>
                </label>
                <label className="form-check form-check-custom">
                  <input type="checkbox" className="form-check-input me-2" checked={form.limits.analytics} onChange={(e)=>handleNestedChange("limits","analytics", e.target.checked)} />
                  <span className="form-check-label">Analytics</span>
                </label>
                <label className="form-check form-check-custom">
                  <input type="checkbox" className="form-check-input me-2" checked={form.limits.priority_support} onChange={(e)=>handleNestedChange("limits","priority_support", e.target.checked)} />
                  <span className="form-check-label">Priority Support</span>
                </label>
              </div>
            </div>
          </div>

          {/* Display & Status */}
          <div className="card">
            <div className="card-header border-0">
              <h3 className="card-title fw-bold text-gray-800">Display & Status</h3>
            </div>
            <div className="card-body pt-0">
              <div className="row g-6">
                <div className="col-sm-4">
                  <label className="form-label">Color</label>
                  <input type="color" className="form-control form-control-color" value={form.metadata.color} onChange={(e)=>handleNestedChange("metadata","color", e.target.value)} />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Icon</label>
                  <input className="form-control" value={form.metadata.icon} onChange={(e)=>handleNestedChange("metadata","icon", e.target.value)} placeholder="📦" />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Badge</label>
                  <input className="form-control" value={form.metadata.badge} onChange={(e)=>handleNestedChange("metadata","badge", e.target.value)} placeholder="Most Popular" />
                </div>
                <div className="col-12 d-flex flex-wrap gap-6 mt-2">
                  <label className="form-check form-check-custom form-check-solid">
                    <input type="checkbox" className="form-check-input" checked={form.isActive} onChange={(e)=>handleChange("isActive", e.target.checked)} />
                    <span className="form-check-label ms-2">Active</span>
                  </label>
                  <label className="form-check form-check-custom form-check-solid">
                    <input type="checkbox" className="form-check-input" checked={form.isPopular} onChange={(e)=>handleChange("isPopular", e.target.checked)} />
                    <span className="form-check-label ms-2">Popular</span>
                  </label>
                  <label className="form-check form-check-custom form-check-solid">
                    <input type="checkbox" className="form-check-input" checked={form.isFeatured} onChange={(e)=>handleChange("isFeatured", e.target.checked)} />
                    <span className="form-check-label ms-2">Featured</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (<><span className="spinner-border spinner-border-sm me-2" />Saving…</>) : "Create Package"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
