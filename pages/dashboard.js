import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Header from "../components/Header";

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
    <>
      <Header />
      <div className="p-10">Loading...</div>
    </>
  );
  
  if (error) return (
    <>
      <Header />
      <div className="p-10 text-red-600">{error}</div>
    </>
  );
  
  if (!user) return null;

  // Sisa quota
  const sisaQuota = typeof user.quota === "number"
    ? (user.quota - undanganList.length)
    : 0;

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto mt-10 p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <p>Selamat datang, <b>{user.name || user.email}</b></p>

            {/* Status pembayaran */}
            {statusBayar !== "paid" ? (
              <div className="p-4 bg-yellow-100 border mb-4 rounded">
                <b>Status:</b> Menunggu pembayaran.<br />
                Setelah membayar, klik tombol di bawah ini untuk simulasi update status (testing):
                <button
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
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
                      // Force refetch data
                      window.location.reload();
                    } else {
                      setError("Gagal update status bayar.");
                    }
                  }}
                >Saya Sudah Bayar (Simulasi)</button>
              </div>
            ) : (
              <div className="p-4 bg-green-100 border mb-4 rounded">
                <b>Status:</b> Pembayaran sudah diterima, Anda dapat membuat undangan!
              </div>
            )}

            {/* Tombol buat undangan: quota > undangan yang sudah ada */}
            {statusBayar === "paid" && sisaQuota > 0 ? (
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded mb-8"
                onClick={() => router.push("/pilih-template")}
              >
                Buat Undangan Baru
              </button>
            ) : statusBayar === "paid" && (
              <div className="mb-8 p-4 rounded bg-gray-100 text-gray-700 text-center">
                Quota undangan anda sudah habis.<br />
                Silakan <b>order paket lagi</b> untuk bisa membuat undangan baru.
                <br />
                <button
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
                  onClick={() => router.push("/paket")}
                >
                  Order Paket Lagi
                </button>
              </div>
            )}

            {/* List undangan user */}
            {statusBayar === "paid" && (
              <>
                <h3 className="text-lg font-bold mt-10 mb-4">Daftar Undangan Anda</h3>
                {undanganList.length === 0 ? (
                  <div className="text-gray-600">Belum ada undangan.</div>
                ) : (
                  <ul className="space-y-4">
                    {undanganList.map((u) => (
                      <li key={u._id} className="border p-4 rounded flex items-center justify-between">
                        <div>
                          <div className="font-bold">{u.nama_pria} & {u.nama_wanita}</div>
                          <div className="text-xs text-gray-500">{u.tanggal} | {u.template}</div>
                          <div className="text-xs text-gray-600">
                            Link: <a className="underline" href={`/undangan/${u.slug}`} target="_blank" rel="noopener noreferrer">
                              /undangan/{u.slug}
                            </a>
                          </div>
                          {u.isExpired && (
                            <div className="text-xs text-yellow-600 mt-1">
                              ⚠️ Kadaluarsa ({new Date(u.createdAt).toLocaleDateString()})
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="bg-green-600 px-2 py-1 text-white rounded"
                            onClick={() => window.open(`/undangan/${u.slug}`, "_blank")}
                          >Preview</button>
                          {!u.isExpired && (
                            <button
                              className="bg-yellow-500 px-2 py-1 text-white rounded"
                              onClick={() => router.push(`/edit-undangan/${u.slug}`)}
                            >Edit</button>
                          )}
                          <button
                            className="bg-red-600 px-2 py-1 text-white rounded"
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
                          >Hapus</button>
                          <button
                            className="bg-blue-600 px-2 py-1 text-white rounded"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                window.location.origin + `/undangan/${u.slug}`
                              );
                              alert("Link undangan disalin!");
                            }}
                          >Copy Link</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
