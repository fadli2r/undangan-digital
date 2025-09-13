// pages/edit-undangan/[slug]/index.js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import UserLayout from "@/components/layouts/UserLayout";
import { useSession } from "next-auth/react";

// --- helper ---
const normalizeSlug = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Mapping menu -> featureKey (tanpa featureKey = basic/selalu boleh)
  const MENU = [
    {
      label: "Ubah Desain",
      path: "desain",
      icon: "ki-design-1",
      color: "primary",
      description: "Ganti template dan warna",
      featureKey: "all-custom",
    },
    {
      label: "Informasi Mempelai",
      path: "mempelai",
      icon: "ki-heart",
      color: "danger",
      description: "Data pengantin pria & wanita",
      // tanpa featureKey → selalu boleh
    },
    {
      label: "Informasi Acara",
      path: "acara",
      icon: "ki-calendar-2",
      color: "success",
      description: "Tanggal, waktu & lokasi",
    },
    {
      label: "Informasi Tambahan",
      path: "tambahan",
      icon: "ki-information-5",
      color: "info",
      description: "Detail acara lainnya",
    },
    {
      label: "Galeri",
      path: "galeri",
      icon: "ki-picture",
      color: "warning",
      description: "Upload foto pre-wedding",
      featureKey: "galeri",
    },
    {
      label: "Amplop Digital",
      path: "gift",
      icon: "ki-gift",
      color: "success",
      description: "Rekening & hadiah",
      featureKey: "gift",
    },
    {
      label: "Our Story",
      path: "ourstory",
      icon: "ki-book-open",
      color: "primary",
      description: "Cerita perjalanan cinta",
      featureKey: "ourstory",
    },
    {
      label: "Kelola Tamu",
      path: "tamu",
      icon: "ki-people",
      color: "info",
      description: "Daftar undangan tamu",
      featureKey: "tamu",
    },
    {
      label: "RSVP",
      path: "rsvp",
      icon: "ki-check-square",
      color: "success",
      description: "Konfirmasi kehadiran",
      featureKey: "rsvp",
    },
    {
      label: "Ucapan",
      path: "ucapan",
      icon: "ki-message-text-2",
      color: "warning",
      description: "Ucapan dari tamu",
      featureKey: "ucapan",
    },
    {
      label: "Pengaturan Privasi",
      path: "privasi",
      icon: "ki-security-user",
      color: "dark",
      description: "Password & akses",
      featureKey: "privacy",
    },
    {
      label: "Download & Export",
      path: "download",
      icon: "ki-file-down",
      color: "primary",
      description: "Unduh PDF & backup",
      featureKey: "download",
    },
  ];

export default function EditUndanganIndex() {
  const router = useRouter();
  const { slug } = router.query;
  const { data: session, status } = useSession();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // slug editor state
  const [editingSlug, setEditingSlug] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [slugLoading, setSlugLoading] = useState(false);
  const [slugError, setSlugError] = useState("");

  const host = typeof window !== "undefined" ? window.location.host : "dreamslink.id";

  // ambil detail undangan (sudah include package via populate di /api/invitation/detail)
  useEffect(() => {
    if (!slug || !session || status === "loading") return;
    let aborted = false;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/invitation/detail?slug=${encodeURIComponent(String(slug))}`, { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.undangan) throw new Error(json?.message || "Data undangan tidak ditemukan");

        if (!aborted) {
          setData(json.undangan);
          setNewSlug(json.undangan.slug);
        }
      } catch (e) {
        if (!aborted) setErr(e.message || "Gagal memuat data undangan");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => { aborted = true; };
  }, [slug, session, status]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // features paket yang diizinkan → UNION dari packageId.featureKeys + allowedFeatures
  const allowedFeatures = useMemo(() => {
    const fromPkg = Array.isArray(data?.packageId?.featureKeys) ? data.packageId.featureKeys : [];
    const fromInvite = Array.isArray(data?.allowedFeatures) ? data.allowedFeatures : [];
    return Array.from(
      new Set(
        [...fromPkg, ...fromInvite]
          .map((k) => String(k || "").toLowerCase().trim())
          .filter(Boolean)
      )
    );
  }, [data]);

  const isAllowed = (featureKey) => !featureKey || allowedFeatures.includes(String(featureKey).toLowerCase());

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
      : "-";

  const openScanner = () => {
    if (!data?.slug) return;
    window.open(`/scanner/${data.slug}`, "_blank");
  };

  const handleSlugUpdate = async () => {
    const norm = normalizeSlug(newSlug);
    if (!norm) return setSlugError("Link tidak boleh kosong");
    if (norm.length < 3) return setSlugError("Slug minimal 3 karakter");

    setSlugLoading(true);
    setSlugError("");

    try {
      const res = await fetch("/api/invitation/update-slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data._id, newSlug: norm }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Gagal mengupdate link");

      const updated = json.slug || norm;
      setData((prev) => ({ ...prev, slug: updated }));
      setNewSlug(updated);
      setEditingSlug(false);

      if (updated !== slug) router.replace(`/edit-undangan/${updated}`, undefined, { shallow: true });
    } catch (e) {
      setSlugError(e.message || "Terjadi kesalahan saat mengupdate link");
    } finally {
      setSlugLoading(false);
    }
  };

  const cancelSlugEdit = () => {
    setEditingSlug(false);
    setNewSlug(data?.slug || "");
    setSlugError("");
  };

  const copyLink = () => {
    if (typeof window === "undefined") return;
    const link = `${window.location.origin}/${data?.slug || ""}`;
    navigator.clipboard?.writeText(link).then(
      () => alert("Link berhasil disalin!"),
      () => alert(link) // fallback
    );
  };

  // ---- UI states ----
  if (status === "loading" || loading) {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center align-items-center min-h-300px">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!session) return null;

  if (err) {
    return (
      <UserLayout>
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error!</h4>
          <p>{err}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Coba Lagi
          </button>
        </div>
      </UserLayout>
    );
  }

  if (!data) {
    return (
      <UserLayout>
        <div className="alert alert-info">
          <h4 className="alert-heading">Undangan Tidak Ditemukan</h4>
          <p>Data undangan yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.</p>
          <Link href="/edit-undangan" className="btn btn-primary">
            Kembali ke Daftar Undangan
          </Link>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      {/* Begin::Header */}
      <div className="card card-flush mb-9">
        <div className="card-header pt-8">
          <div className="card-title">
            <h2 className="fw-bold text-gray-900">Edit Undangan Digital</h2>
          </div>
          <div className="card-toolbar">
            <div className="d-flex gap-3">
              <button onClick={() => router.push("/edit-undangan")} className="btn btn-light-secondary">
                <i className="ki-duotone ki-arrow-left fs-2">
                  <span className="path1"></span><span className="path2"></span>
                </i>
                Kembali
              </button>
              <a href={`/${data.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <i className="ki-duotone ki-eye fs-2">
                  <span className="path1"></span><span className="path2"></span><span className="path3"></span>
                </i>
                Lihat Undangan
              </a>
            </div>
          </div>
        </div>

        <div className="card-body pt-0">
          <div className="text-gray-600 fw-semibold fs-6 mb-5">
            Kelola konten undangan digital Anda. Edit informasi, lihat statistik, dan bagikan kepada tamu.
          </div>

          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="text-muted fs-6">{host}/</span>
            {editingSlug ? (
              <div className="d-flex align-items-center gap-2">
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(normalizeSlug(e.target.value))}
                  className="form-control form-control-sm w-200px"
                  placeholder="link-custom"
                  pattern="[a-z0-9-]+"
                />
                <button onClick={handleSlugUpdate} disabled={slugLoading} className="btn btn-sm btn-success">
                  {slugLoading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <i className="ki-duotone ki-check fs-4"><span className="path1"></span><span className="path2"></span></i>
                  )}
                </button>
                <button onClick={cancelSlugEdit} className="btn btn-sm btn-light-danger">
                  <i className="ki-duotone ki-cross fs-4"><span className="path1"></span><span className="path2"></span></i>
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <span className="text-primary fw-bold fs-6">{data.slug}</span>
                <button
                  onClick={() => { setSlugError(""); setNewSlug(data.slug); setEditingSlug(true); }}
                  className="btn btn-sm btn-light-primary"
                  title="Edit link"
                >
                  <i className="ki-duotone ki-pencil fs-6"><span className="path1"></span><span className="path2"></span></i>
                </button>
                <button onClick={copyLink} className="btn btn-sm btn-light-success" title="Copy link">
                  <i className="ki-duotone ki-copy fs-6"><span className="path1"></span><span className="path2"></span></i>
                </button>
              </div>
            )}
          </div>

          {slugError && <div className="alert alert-danger py-2 px-3 fs-7 mb-3">{slugError}</div>}

          <div className="text-muted fs-6">
            Template: <span className="fw-bold text-gray-800">{data.template}</span>
          </div>
        </div>
      </div>
      {/* End::Header */}

      {/* Summary & Statistics */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold">Ringkasan Data</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-row-dashed table-row-gray-300 gy-7">
                  <tbody>
                    <tr>
                      <td className="fw-bold text-muted">Mempelai</td>
                      <td className="text-end fw-bold text-gray-800">
                        {data?.mempelai?.pria || "-"} & {data?.mempelai?.wanita || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Tanggal Pernikahan</td>
                      <td className="text-end fw-bold text-gray-800">
                        {formatDate(data?.acara_utama?.tanggal)}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Galeri</td>
                      <td className="text-end">
                        <span className="badge badge-light-primary">{data?.galeri?.length || 0} foto</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Daftar Tamu</td>
                      <td className="text-end">
                        <span className="badge badge-light-info">{data?.tamu?.length || 0} tamu</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold text-muted">Amplop Digital</td>
                      <td className="text-end">
                        <span className={`badge ${data?.gift?.enabled ? "badge-light-success" : "badge-light-danger"}`}>
                          {data?.gift?.enabled ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                    </tr>
                    {Array.isArray(data?.packageId?.featureKeys) && data.packageId.featureKeys.length > 0 && (
                      <tr>
                        <td className="fw-bold text-muted">Fitur Paket</td>
                        <td className="text-end">
                          <div className="d-flex flex-wrap gap-2 justify-content-end">
                            {data.packageId.featureKeys.map((k) => (
                              <span key={k} className="badge badge-light-secondary">{k}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Statistik */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <div className="card-title">
                <h3 className="fw-bold">Statistik Undangan</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-0">
                <div className="col-6 text-center border-end pb-5">
                  <div className="fs-2hx fw-bold text-primary">{data?.views || 0}</div>
                  <div className="fs-6 fw-semibold text-gray-600">Total Views</div>
                </div>
                <div className="col-6 text-center pb-5">
                  <div className="fs-2hx fw-bold text-success">{Array.isArray(data?.rsvp) ? data.rsvp.length : 0}</div>
                  <div className="fs-6 fw-semibold text-gray-600">RSVP</div>
                </div>
                <div className="col-6 text-center border-end pt-5">
                  <div className="fs-2hx fw-bold text-warning">{Array.isArray(data?.ucapan) ? data.ucapan.length : 0}</div>
                  <div className="fs-6 fw-semibold text-gray-600">Ucapan</div>
                </div>
                <div className="col-6 text-center pt-5">
                  <div className="fs-2hx fw-bold text-info">{Array.isArray(data?.attendance) ? data.attendance.length : 0}</div>
                  <div className="fs-6 fw-semibold text-gray-600">Kehadiran</div>
                </div>
              </div>
            </div>
            <button
  type="button"
  onClick={() => {
    if (!data?.slug) return;
    router.push(`/edit-undangan/${encodeURIComponent(data.slug)}/upgrade`);
  }}
  className="btn btn-light-warning"
  title="Upgrade fitur untuk undangan ini"
  disabled={!data?.slug}
>
  <i className="ki-duotone ki-flash fs-2 me-1">
    <span className="path1"></span><span className="path2"></span>
  </i>
  Upgrade Fitur
</button>


          </div>
        </div>
      </div>

      {/* QR Scanner */}
{/* QR Scanner (dengan gating fitur) */}
<div className="row g-5 g-xl-10 mb-5 mb-xl-10">
  <div className="col-12">
    <div className="card bg-light-success">
      <div className="card-body text-center py-10">
        <i className="ki-duotone ki-scan-barcode fs-3x text-success mb-5">
          <span className="path1"></span><span className="path2"></span>
          <span className="path3"></span><span className="path4"></span>
          <span className="path5"></span><span className="path6"></span>
        </i>

        <h3 className="text-gray-900 fw-bold mb-3">QR Code Scanner</h3>
        <div className="text-gray-700 fw-semibold fs-6 mb-5">
          Scan QR code untuk melihat siapa saja yang sudah membuka undangan
        </div>

        {(() => {
          // izinkan jika salah satu feature key ini ada di paket
          const canScan = ["scanner", "attendance", "analytics"].some((k) =>
            typeof isAllowed === "function" ? isAllowed(k) : false
          );

          return canScan ? (
            <button
              type="button"
              onClick={openScanner}
              className="btn btn-success"
              aria-label="Buka Scanner QR"
            >
              <i className="ki-duotone ki-scan-barcode fs-2">
                <span className="path1"></span><span className="path2"></span>
                <span className="path3"></span><span className="path4"></span>
                <span className="path5"></span><span className="path6"></span>
              </i>
              Buka Scanner QR
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-light disabled"
              disabled
              aria-disabled="true"
              title="Tidak termasuk paket"
            >
              <i className="ki-duotone ki-lock-2 fs-2 me-2">
                <span className="path1"></span><span className="path2"></span>
              </i>
              <span className="badge badge-light-danger">Terkunci di paket saat ini</span>
            </button>
          );
        })()}
      </div>
    </div>
  </div>
</div>


      {/* Menu Navigation (gating per paket; yang tidak allowed = disabled & tidak bisa diklik) */}
      <div className="row g-5 g-xl-10">
  {MENU.map((item) => {
    const allowed = isAllowed(item.featureKey);
    const href = `/edit-undangan/${data.slug}/${item.path}`;

    return (
      <div key={item.path} className="col-lg-4 col-md-6">
        <div
          className={`card card-flush h-100 shadow-sm ${allowed ? "hover-elevate-up" : ""}`}
          aria-disabled={!allowed}
        >
          <div className={`card-body d-flex flex-column text-center p-9 ${!allowed ? "opacity-50" : ""}`}>
            <div className="mb-5">
              <i className={`ki-duotone ${item.icon} fs-3x text-${item.color}`}>
                <span className="path1" />
                <span className="path2" />
                <span className="path3" />
              </i>
            </div>

            <div className="fs-4 fw-bold text-gray-900 mb-2">{item.label}</div>
            <div className="fs-6 fw-semibold text-gray-600 mb-4">{item.description}</div>

            <div className="mt-auto">
              {allowed ? (
                // HANYA tombol ini yang bisa diklik
                <Link href={href} className={`btn btn-sm btn-light-${item.color}`} role="button">
                  Kelola
                  <i className="ki-duotone ki-arrow-right fs-5 ms-1">
                    <span className="path1" />
                    <span className="path2" />
                  </i>
                </Link>
              ) : (
                // Tombol diganti badge lock
                <span className="badge badge-light-danger">
                  Terkunci di paket saat ini
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>

    </UserLayout>
  );
}
