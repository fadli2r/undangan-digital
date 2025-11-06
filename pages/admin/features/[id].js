// pages/admin/features/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SeoHead from '@/components/SeoHead';

const emptyFeature = {
  name: "",
  key: "",
  description: "",
  price: 0,
  active: true,
  billing: { type: "one_time", interval: null },
  meta: { icon: "✨", badge: "" }
};

export default function AdminFeatureEdit() {
  const router = useRouter();
  const { id } = router.query;

  const [feature, setFeature] = useState(emptyFeature);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    let aborted = false;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`/api/admin/features/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal memuat data fitur");
        if (!aborted) setFeature({
          ...emptyFeature,
          ...(json.feature || json.data || {})
        });
      } catch (e) {
        if (!aborted) setErr(e.message);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => { aborted = true; };
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("billing.")) {
      const k = name.split(".")[1];
      setFeature((f) => ({ ...f, billing: { ...f.billing, [k]: value } }));
    } else if (name.startsWith("meta.")) {
      const k = name.split(".")[1];
      setFeature((f) => ({ ...f, meta: { ...f.meta, [k]: value } }));
    } else if (type === "checkbox") {
      setFeature((f) => ({ ...f, [name]: checked }));
    } else if (name === "price") {
      setFeature((f) => ({ ...f, price: Number(value || 0) }));
    } else {
      setFeature((f) => ({ ...f, [name]: value }));
    }
  };

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/features/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feature),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan fitur");
      router.push("/admin/features");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Hapus fitur ini?")) return;
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/features/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menghapus fitur");
      router.push("/admin/features");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SeoHead
        title="Edit Fitur - Dreamslink"
        description="Halaman untuk mengedit fitur undangan di panel admin."
        noindex
        canonical="/admin/features/edit"
      />
      <div className="container py-10">
      <div className="d-flex align-items-center justify-content-between mb-6">
        <h1 className="fw-bold">Edit Feature</h1>
        <div className="d-flex gap-3">
          <button className="btn btn-light" onClick={() => router.push("/admin/features")}>Kembali</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>Hapus</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner-border text-primary" />
      ) : (
        <div className="card">
          <div className="card-body">
            {err && <div className="alert alert-danger mb-6">{err}</div>}

            <div className="row g-6">
              <div className="col-md-6">
                <label className="form-label">Nama</label>
                <input className="form-control" name="name" value={feature.name} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Key</label>
                <input className="form-control" name="key" value={feature.key} onChange={handleChange} />
                <div className="form-text">huruf kecil, unik (contoh: rsvp, gift, gallery)</div>
              </div>

              <div className="col-12">
                <label className="form-label">Deskripsi</label>
                <textarea className="form-control" rows={3} name="description"
                  value={feature.description} onChange={handleChange} />
              </div>

              <div className="col-md-4">
                <label className="form-label">Harga</label>
                <input type="number" className="form-control" name="price" value={feature.price} onChange={handleChange} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Billing Type</label>
                <select className="form-select" name="billing.type" value={feature.billing?.type || "one_time"} onChange={handleChange}>
                  <option value="one_time">Sekali (one_time)</option>
                  <option value="recurring">Berulang (recurring)</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Interval (opsional)</label>
                <input className="form-control" name="billing.interval" value={feature.billing?.interval || ""} onChange={handleChange} placeholder="monthly / yearly / null" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Aktif?</label><br />
                <label className="form-check form-switch">
                  <input type="checkbox" className="form-check-input" name="active" checked={!!feature.active} onChange={handleChange} />
                  <span className="form-check-label">Tampilkan di katalog & bisa dipilih</span>
                </label>
              </div>

              <div className="col-md-4">
                <label className="form-label">Icon</label>
                <input className="form-control" name="meta.icon" value={feature.meta?.icon || ""} onChange={handleChange} placeholder="emoji / class icon" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Badge</label>
                <input className="form-control" name="meta.badge" value={feature.meta?.badge || ""} onChange={handleChange} placeholder="contoh: Best Seller" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
