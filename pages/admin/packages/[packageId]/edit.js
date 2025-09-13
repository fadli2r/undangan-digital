// pages/admin/packages/[packageId].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import AdminLayout from "../../../../components/layouts/AdminLayout";

export default function EditPackage() {
  const router = useRouter();
  const { packageId } = router.query;
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [allFeatures, setAllFeatures] = useState([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    originalPrice: "",
    currency: "IDR",
    duration: { value: 1, unit: "months" },
    type: "fixed",
    featureKeys: [],
    selectableFeatures: [],
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
    metadata: { color: "#3B82F6", icon: "📦", badge: "" },
    isActive: true,
    isPopular: false,
    isFeatured: false,
    sortOrder: 0,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !session.user?.isAdmin) {
      router.replace("/admin/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (packageId && status === "authenticated" && session?.user?.isAdmin) {
      fetchPackage();
      fetchFeatures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId, status, session]);

  async function fetchPackage() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/packages/${packageId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch package");

      const pkg = data.package || {};
      setForm({
        name: pkg.name || "",
        slug: pkg.slug || "",
        description: pkg.description || "",
        price: Number(pkg.price || 0),
        originalPrice:
          pkg.originalPrice === null || pkg.originalPrice === undefined
            ? ""
            : Number(pkg.originalPrice || 0),
        currency: pkg.currency || "IDR",
        duration: {
          value: Number(pkg.duration?.value || 1),
          unit: pkg.duration?.unit || "months",
        },
        type: pkg.type || "fixed",
        featureKeys: Array.isArray(pkg.featureKeys) ? pkg.featureKeys : [],
        selectableFeatures: Array.isArray(pkg.selectableFeatures)
          ? pkg.selectableFeatures
          : [],
        features: Array.isArray(pkg.features)
          ? pkg.features.map((f) => ({
              name: f?.name || "",
              description: f?.description || "",
              included: !!f?.included,
              limit: typeof f?.limit === "number" ? f.limit : null,
            }))
          : [],
        limits: {
          invitations: Number(pkg.limits?.invitations || 1),
          guests: Number(pkg.limits?.guests || 100),
          photos: Number(pkg.limits?.photos || 10),
          templates: Array.isArray(pkg.limits?.templates)
            ? pkg.limits.templates
            : [],
          customDomain: !!pkg.limits?.customDomain,
          removeWatermark: !!pkg.limits?.removeWatermark,
          analytics: !!pkg.limits?.analytics,
          priority_support: !!pkg.limits?.priority_support,
        },
        metadata: {
          color: pkg.metadata?.color || "#3B82F6",
          icon: pkg.metadata?.icon || "📦",
          badge: pkg.metadata?.badge || "",
        },
        isActive: pkg.isActive !== false,
        isPopular: !!pkg.isPopular,
        isFeatured: !!pkg.isFeatured,
        sortOrder: Number(pkg.sortOrder || 0),
      });
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch package");
    } finally {
      setLoading(false);
    }
  }

  async function fetchFeatures() {
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
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNestedChange(parent, field, value) {
    setForm((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  }

  function handleFeatureChange(index, field, value) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      ),
    }));
  }

  function addFeature() {
    setForm((prev) => ({
      ...prev,
      features: [
        ...prev.features,
        { name: "", description: "", included: true, limit: null },
      ],
    }));
  }

  function removeFeature(index) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }

  // ========================================================================
  // PERUBAHAN 1: HANDLER BARU UNTUK RADIO BUTTON FITUR
  // ========================================================================
  function handleFeatureGatingChange(key, newStatus) {
    setForm((prev) => {
      // Buat salinan array agar tidak mengubah state secara langsung
      const currentKeys = new Set(prev.featureKeys);
      const currentSelectable = new Set(prev.selectableFeatures);

      // Hapus key dari kedua set untuk memastikan tidak ada duplikasi
      currentKeys.delete(key);
      currentSelectable.delete(key);

      // Tambahkan key ke set yang sesuai berdasarkan status baru
      if (newStatus === "included") {
        currentKeys.add(key);
      } else if (newStatus === "selectable") {
        currentSelectable.add(key);
      }
      // Jika newStatus === 'none', kita tidak melakukan apa-apa (sudah dihapus)

      return {
        ...prev,
        featureKeys: Array.from(currentKeys),
        selectableFeatures: Array.from(currentSelectable),
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/admin/packages/${packageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update package");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update package");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex align-items-center justify-content-center py-20">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="d-flex flex-column gap-5">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h1 className="fs-2hx text-gray-900 fw-bold">Edit Package</h1>
            <div className="text-muted">Update package details and features.</div>
          </div>
          <div>
            <button type="button" onClick={() => router.push("/admin/packages")} className="btn btn-light">
              Back to Packages
            </button>
          </div>
        </div>

        {success && <div className="alert alert-success">Package updated successfully!</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-5">
          {/* ... bagian form lain (Basic Information, Duration, dll.) tetap sama ... */}
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
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleChange("slug", e.target.value.toLowerCase())}
                    className="form-control"
                    placeholder="auto from name if empty"
                  />
                </div>

                <div className="col-sm-4">
                  <label className="form-label required">Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      handleChange("price", parseFloat(e.target.value || "0"))
                    }
                    className="form-control"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Original Price</label>
                  <input
                    type="number"
                    value={form.originalPrice === "" ? "" : Number(form.originalPrice)}
                    onChange={(e) =>
                      handleChange(
                        "originalPrice",
                        e.target.value === "" ? "" : parseFloat(e.target.value || "0")
                      )
                    }
                    className="form-control"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Currency</label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="col-sm-12">
                  <label className="form-label required">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label required">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      handleChange("sortOrder", parseInt(e.target.value || "0", 10))
                    }
                    className="form-control"
                    required
                  />
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
                    <input
                      type="number"
                      value={form.duration.value}
                      onChange={(e) =>
                        handleNestedChange(
                          "duration",
                          "value",
                          parseInt(e.target.value || "1", 10)
                        )
                      }
                      className="form-control"
                      min="1"
                      required
                    />
                    <select
                      value={form.duration.unit}
                      onChange={(e) =>
                        handleNestedChange("duration", "unit", e.target.value)
                      }
                      className="form-select"
                      required
                    >
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                </div>

                <div className="col-sm-6">
                  <label className="form-label required">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="fixed">Fixed</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>


          {/* ======================================================================== */}
          {/* PERUBAHAN 2: TAMPILAN (JSX) BARU UNTUK GATING FITUR */}
          {/* ======================================================================== */}
          <div className="card">
            <div className="card-header border-0">
              <h3 className="card-title fw-bold text-gray-800">Feature Keys (Gating)</h3>
            </div>
            <div className="card-body pt-0">
              <p className="text-muted">
                Atur status setiap fitur untuk paket ini.
              </p>
              {loadingFeatures ? (
                <div className="d-flex align-items-center text-primary">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Memuat fitur…
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-row-dashed align-middle gs-0 gy-4">
                    <thead>
                      <tr className="fw-bold fs-6 text-gray-800 border-bottom-2 border-gray-200">
                        <th>Fitur</th>
                        <th className="text-center">Tidak Termasuk</th>
                        <th className="text-center">Bawaan (Default)</th>
                        <th className="text-center">Tambahan (Add-on)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allFeatures.map((feature) => {
                        const isIncluded = form.featureKeys.includes(feature.key);
                        const isSelectable = form.selectableFeatures.includes(feature.key);
                        const status = isIncluded ? "included" : isSelectable ? "selectable" : "none";

                        return (
                          <tr key={feature._id}>
                            <td>
                              <div className="d-flex flex-column">
                                <span className="text-gray-800 fw-bold">{feature.name}</span>
                                <small className="text-muted"><code>{feature.key}</code></small>
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="form-check form-check-custom form-check-solid form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name={`feature-gating-${feature.key}`}
                                  id={`radio-none-${feature.key}`}
                                  checked={status === "none"}
                                  onChange={() => handleFeatureGatingChange(feature.key, "none")}
                                />
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="form-check form-check-custom form-check-solid form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name={`feature-gating-${feature.key}`}
                                  id={`radio-included-${feature.key}`}
                                  checked={status === "included"}
                                  onChange={() => handleFeatureGatingChange(feature.key, "included")}
                                />
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="form-check form-check-custom form-check-solid form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name={`feature-gating-${feature.key}`}
                                  id={`radio-selectable-${feature.key}`}
                                  checked={status === "selectable"}
                                  onChange={() => handleFeatureGatingChange(feature.key, "selectable")}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {allFeatures.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-5">
                            Belum ada fitur di katalog. Silakan tambahkan fitur terlebih dahulu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
{/* Marketing Features (legacy / optional) */}
          <div className="card">
            <div className="card-header border-0 align-items-center">
              <h3 className="card-title fw-bold text-gray-800">Marketing Features (optional)</h3>
              <div className="card-toolbar">
                <button
                  type="button"
                  onClick={addFeature}
                  className="btn btn-light-primary"
                >
                  <i className="ki-duotone ki-plus fs-3 me-1"></i>
                  Add Feature
                </button>
              </div>
            </div>
            <div className="card-body pt-0">
              {form.features.length === 0 && (
                <div className="text-muted">
                  No marketing features yet. Click <b>Add Feature</b>.
                </div>
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
                          onChange={(e) =>
                            handleFeatureChange(index, "name", e.target.value)
                          }
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Description</label>
                        <input
                          type="text"
                          value={feature.description || ""}
                          onChange={(e) =>
                            handleFeatureChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="form-control"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Limit</label>
                        <input
                          type="number"
                          value={feature.limit ?? ""}
                          onChange={(e) =>
                            handleFeatureChange(
                              index,
                              "limit",
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
                            onChange={(e) =>
                              handleFeatureChange(
                                index,
                                "included",
                                e.target.checked
                              )
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`included-${index}`}
                          >
                            Included
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4 d-flex align-items-end justify-content-end">
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="btn btn-light-danger"
                        >
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
                    onChange={(e) =>
                      handleNestedChange(
                        "limits",
                        "invitations",
                        parseInt(e.target.value || "1", 10)
                      )
                    }
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
                    onChange={(e) =>
                      handleNestedChange(
                        "limits",
                        "guests",
                        parseInt(e.target.value || "1", 10)
                      )
                    }
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
                    onChange={(e) =>
                      handleNestedChange(
                        "limits",
                        "photos",
                        parseInt(e.target.value || "0", 10)
                      )
                    }
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
                        "limits",
                        "templates",
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
                    onChange={(e) =>
                      handleNestedChange("limits", "customDomain", e.target.checked)
                    }
                  />
                  <label className="form-check-label" htmlFor="customDomain">
                    Allow Custom Domain
                  </label>
                </div>

                <div className="form-check form-check-custom form-check-solid">
                  <input
                    id="removeWatermark"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.limits.removeWatermark}
                    onChange={(e) =>
                      handleNestedChange(
                        "limits",
                        "removeWatermark",
                        e.target.checked
                      )
                    }
                  />
                  <label className="form-check-label" htmlFor="removeWatermark">
                    Remove Watermark
                  </label>
                </div>

                <div className="form-check form-check-custom form-check-solid">
                  <input
                    id="analytics"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.limits.analytics}
                    onChange={(e) =>
                      handleNestedChange("limits", "analytics", e.target.checked)
                    }
                  />
                  <label className="form-check-label" htmlFor="analytics">
                    Enable Analytics
                  </label>
                </div>

                <div className="form-check form-check-custom form-check-solid">
                  <input
                    id="priority_support"
                    type="checkbox"
                    className="form-check-input"
                    checked={form.limits.priority_support}
                    onChange={(e) =>
                      handleNestedChange(
                        "limits",
                        "priority_support",
                        e.target.checked
                      )
                    }
                  />
                  <label className="form-check-label" htmlFor="priority_support">
                    Priority Support
                  </label>
                </div>
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
                  <input
                    type="color"
                    value={form.metadata.color}
                    onChange={(e) =>
                      handleNestedChange("metadata", "color", e.target.value)
                    }
                    className="form-control form-control-color"
                  />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Icon</label>
                  <input
                    type="text"
                    value={form.metadata.icon}
                    onChange={(e) =>
                      handleNestedChange("metadata", "icon", e.target.value)
                    }
                    className="form-control"
                    placeholder="📦"
                  />
                </div>
                <div className="col-sm-4">
                  <label className="form-label">Badge Text</label>
                  <input
                    type="text"
                    value={form.metadata.badge || ""}
                    onChange={(e) =>
                      handleNestedChange("metadata", "badge", e.target.value)
                    }
                    className="form-control"
                    placeholder="Most Popular"
                  />
                </div>

                <div className="col-12">
                  <div className="d-flex flex-wrap gap-6 mt-2">
                    <div className="form-check form-check-custom form-check-solid">
                      <input
                        id="isActive"
                        type="checkbox"
                        className="form-check-input"
                        checked={form.isActive}
                        onChange={(e) => handleChange("isActive", e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active
                      </label>
                    </div>
                    <div className="form-check form-check-custom form-check-solid">
                      <input
                        id="isPopular"
                        type="checkbox"
                        className="form-check-input"
                        checked={form.isPopular}
                        onChange={(e) =>
                          handleChange("isPopular", e.target.checked)
                        }
                      />
                      <label className="form-check-label" htmlFor="isPopular">
                        Popular
                      </label>
                    </div>
                    <div className="form-check form-check-custom form-check-solid">
                      <input
                        id="isFeatured"
                        type="checkbox"
                        className="form-check-input"
                        checked={form.isFeatured}
                        onChange={(e) =>
                          handleChange("isFeatured", e.target.checked)
                        }
                      />
                      <label className="form-check-label" htmlFor="isFeatured">
                        Featured
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>          <div className="d-flex justify-content-end">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}