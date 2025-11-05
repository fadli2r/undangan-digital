import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UserLayout from "@/components/layouts/UserLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);

const StatusBadge = ({ status }) => {
  const map = {
    paid: "badge-light-success",
    pending: "badge-light-warning",
    expired: "badge-light-danger",
    canceled: "badge-light-danger",
  };
  return (
    <span className={`badge ${map[status] || "badge-light-secondary"}`}>
      {status}
    </span>
  );
};

export default function BillingHistoryPage() {
  const { status: authStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    (async () => {
      try {
        const [p, h] = await Promise.all([
          fetch("/api/user/profile").then((r) => r.json()).catch(() => ({})),
          fetch("/api/user/billing-history").then((r) => r.json()).catch(() => ({})),
        ]);
        if (p?.success) setUser(p.user);
        if (h?.success) setHistory(h.history || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [authStatus]);

  if (loading) {
    return (
      <UserLayout>
        <div className="d-flex justify-content-center py-20">
          <span className="spinner-border text-primary" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="content d-flex flex-column flex-column-fluid">
        <ProfileHeader user={user} activeTab="billing" />

        <div className="card">
          <div className="card-header">
            <h3 className="card-title align-items-start flex-column">
              <span className="card-label fw-bold text-dark">Riwayat Transaksi</span>
              <span className="text-muted mt-1 fw-semibold fs-7">
                Daftar semua pembelian Anda
              </span>
            </h3>
          </div>

          <div className="card-body pt-0">
            {history.length === 0 ? (
              <div className="text-center py-10">
                <i className="ki-duotone ki-information-5 fs-3x text-muted mb-3" />
                <p className="text-gray-600">Belum ada riwayat transaksi.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-row-dashed align-middle gy-4">
                  <thead>
                    <tr className="fw-semibold text-muted">
                      <th>Invoice</th>
                      <th>Paket</th>
                      <th>Tipe</th>
                      <th>Tanggal</th>
                      <th>Status</th>
                      <th className="text-end">Jumlah</th>
                      <th className="text-end">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td className="fw-bold">{h.invoiceId || "-"}</td>
                        <td>{h.packageName}</td>
                        <td>{h.packageType}</td>
                        <td>{formatDate(h.createdAt)}</td>
                        <td>
                          <StatusBadge status={h.status} />
                        </td>
                        <td className="text-end fw-bold">
                          {formatCurrency(h.amount)}
                        </td>
                        <td className="text-end">
                          {h.invoiceId && h.invoiceId !== "-" ? (
                            <Link
                              href={`/profile/invoice/${h.invoiceId}`}
                              className="btn btn-sm btn-light-primary"
                            >
                              <i className="ki-duotone ki-eye fs-3 me-1" />
                              Lihat Invoice
                            </Link>
                          ) : (
                            "-"
                          )}
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
    </UserLayout>
  );
}
