import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import MetronicUserLayout from "../components/layouts/MetronicUserLayout";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [statusBayar, setStatusBayar] = useState("pending");
  const [undanganList, setUndanganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ambil user info dari backend setiap mount/session berubah
  useEffect(() => {
    const fetchUser = async (email) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/user-info?email=${email}`);
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          const paymentStatus = data.user.status_pembayaran || "pending";
          setStatusBayar(paymentStatus);
          
          // Only redirect to paket page if user hasn't paid AND has no invitations
          if (paymentStatus === "pending") {
            const invitationsRes = await fetch(`/api/invitation/list?email=${email}`);
            const invitationsData = await invitationsRes.json();
            if (!invitationsData.invitations?.length) {
              router.replace("/paket");
              return;
            }
          }
        } else {
          setError(data.message || "User tidak ditemukan");
        }
      } catch (e) {
        setError("Error: " + e.message);
      }
      setLoading(false);
    };

    if (status === "loading") return;

    let email = session?.user?.email;
    if (email) {
      fetchUser(email);
    } else if (typeof window !== "undefined") {
      const userLS = localStorage.getItem("user");
      if (userLS) {
        email = JSON.parse(userLS).email;
        fetchUser(email);
      } else {
        router.replace("/login");
      }
    }
  }, [session, status, router]);

  // Fetch undangan milik user
  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/invitation/list?email=${user.email}`)
      .then(res => res.json())
      .then(data => setUndanganList(data.invitations || []));
  }, [user?.email]);

  if (loading) return (
    <MetronicUserLayout>
      <div className="d-flex justify-content-center align-items-center min-h-300px">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </MetronicUserLayout>
  );
  
  if (error) return (
    <MetronicUserLayout>
      <div className="alert alert-danger">
        {error}
      </div>
    </MetronicUserLayout>
  );
  
  if (!user) return null;

  // Sisa quota
  const sisaQuota = typeof user.quota === "number"
    ? (user.quota - undanganList.length)
    : 0;

  return (
    <MetronicUserLayout>
      {/* Stats Cards */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        {/* Welcome Card */}
        <div className="col-md-6 col-lg-6 col-xl-6">
          <div className="card">
            <div className="card-body p-5">
              <div className="d-flex align-items-center">
                <div className="symbol symbol-40px me-3">
                  <i className="ki-duotone ki-profile-user fs-1 text-primary">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div>
                  <div className="fs-6 text-gray-800 fw-bold">Selamat datang!</div>
                  <div className="fs-7 text-gray-600">{user.name || user.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quota Card */}
        <div className="col-md-6 col-lg-6 col-xl-6">
          <div className="card">
            <div className="card-body p-5">
              <div className="d-flex align-items-center">
                <div className="symbol symbol-40px me-3">
                  <i className="ki-duotone ki-message-text-2 fs-1 text-primary">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div>
                  <div className="fs-6 text-gray-800 fw-bold">Sisa Quota: {sisaQuota}</div>
                  <div className="fs-7 text-gray-600">Total undangan: {undanganList.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          {statusBayar !== "paid" ? (
            <div className="alert alert-warning d-flex align-items-center p-5">
              <i className="ki-duotone ki-shield-tick fs-2hx text-warning me-4">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <div className="d-flex flex-column">
                <h4 className="mb-1 text-warning">Status: Menunggu Pembayaran</h4>
                <span>Setelah membayar, klik tombol di bawah ini untuk simulasi update status (testing):</span>
                <button
                  className="btn btn-success mt-3 align-self-start"
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    const res = await fetch("/api/user-update-status", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: user.email, status: "paid" })
                    });
                    setLoading(false);
                    if (res.ok) {
                      window.location.reload();
                    } else {
                      setError("Gagal update status bayar.");
                    }
                  }}
                >
                  Saya Sudah Bayar (Simulasi)
                </button>
              </div>
            </div>
          ) : (
            <div className="alert alert-success d-flex align-items-center p-5">
              <i className="ki-duotone ki-shield-check fs-2hx text-success me-4">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
              <div className="d-flex flex-column">
                <h4 className="mb-1 text-success">Status: Pembayaran Berhasil</h4>
                <span>Pembayaran sudah diterima, Anda dapat membuat undangan!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="row g-5 g-xl-10 mb-5 mb-xl-10">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <h3>Aksi Cepat</h3>
              </div>
            </div>
            <div className="card-body">
              {statusBayar === "paid" && sisaQuota > 0 ? (
                <button
                  className="btn btn-primary me-3"
                  onClick={() => router.push("/pilih-template")}
                >
                  <i className="ki-duotone ki-plus fs-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  Buat Undangan Baru
                </button>
              ) : statusBayar === "paid" && (
                <div className="alert alert-info">
                  <div className="d-flex flex-column">
                    <h4 className="mb-1 text-info">Quota Habis</h4>
                    <span className="mb-3">Quota undangan anda sudah habis. Silakan order paket lagi untuk bisa membuat undangan baru.</span>
                    <button
                      className="btn btn-success align-self-start"
                      onClick={() => router.push("/paket")}
                    >
                      Order Paket Lagi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invitations List */}
      {statusBayar === "paid" && (
        <div className="row g-5 g-xl-10">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <h3>Daftar Undangan Anda</h3>
                </div>
              </div>
              <div className="card-body">
                {undanganList.length === 0 ? (
                  <div className="text-center py-10">
                    <i className="ki-duotone ki-message-text-2 fs-3x text-gray-300 mb-3">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                    <div className="text-gray-600">Belum ada undangan.</div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                      <thead>
                        <tr className="fw-bold text-muted">
                          <th className="min-w-200px">Undangan</th>
                          <th className="min-w-150px">Template</th>
                          <th className="min-w-100px">Status</th>
                          <th className="min-w-100px text-end">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {undanganList.map((u) => (
                          <tr key={u._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="d-flex justify-content-start flex-column">
                                  <span className="text-dark fw-bold text-hover-primary fs-6">
                                    {u.nama_pria} & {u.nama_wanita}
                                  </span>
                                  <span className="text-muted fw-semibold text-muted d-block fs-7">
                                    {u.tanggal}
                                  </span>
                                  <span className="text-muted fw-semibold d-block fs-8">
                                    /undangan/{u.slug}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-light-primary fw-bold">
                                {u.template}
                              </span>
                            </td>
                            <td>
                              {u.isExpired ? (
                                <span className="badge badge-light-warning fw-bold">
                                  Kadaluarsa
                                </span>
                              ) : (
                                <span className="badge badge-light-success fw-bold">
                                  Aktif
                                </span>
                              )}
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end flex-shrink-0">
                                <button
                                  className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                                  onClick={() => window.open(`/undangan/${u.slug}`, "_blank")}
                                  title="Preview"
                                >
                                  <i className="ki-duotone ki-eye fs-3">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                    <span className="path3"></span>
                                  </i>
                                </button>
                                {!u.isExpired && (
                                  <button
                                    className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                                    onClick={() => router.push(`/edit-undangan/${u.slug}`)}
                                    title="Edit"
                                  >
                                    <i className="ki-duotone ki-pencil fs-3">
                                      <span className="path1"></span>
                                      <span className="path2"></span>
                                    </i>
                                  </button>
                                )}
                                <button
                                  className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      window.location.origin + `/undangan/${u.slug}`
                                    );
                                    alert("Link undangan disalin!");
                                  }}
                                  title="Copy Link"
                                >
                                  <i className="ki-duotone ki-copy fs-3">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                </button>
                                <button
                                  className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                                  onClick={async () => {
                                    if (confirm("Yakin ingin menghapus undangan ini?")) {
                                      await fetch(`/api/invitation/delete`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ slug: u.slug, email: user.email }),
                                      });
                                      setUndanganList((lst) => lst.filter(item => item.slug !== u.slug));
                                    }
                                  }}
                                  title="Hapus"
                                >
                                  <i className="ki-duotone ki-trash fs-3">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                    <span className="path3"></span>
                                    <span className="path4"></span>
                                    <span className="path5"></span>
                                  </i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MetronicUserLayout>
  );
}
