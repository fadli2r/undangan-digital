import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import UserLayout from "@/components/layouts/UserLayout";
import { showAlert, showToast } from "@/utils/sweetAlert";

export default function Profile() {
  const { data: session, status } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (status === "loading") {
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

  if (!session) {
    return (
      <UserLayout>
        <div className="alert alert-warning">
          <h4 className="alert-heading">Unauthorized</h4>
          <p>Anda harus login untuk mengakses halaman ini.</p>
        </div>
      </UserLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    showAlert.loading('Menyimpan...', 'Mohon tunggu sebentar');

    const payload = { name };
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showAlert.success('Berhasil!', 'Profil berhasil diperbarui');
        setCurrentPassword("");
        setNewPassword("");
      } else {
        showAlert.error('Gagal!', data.message || 'Gagal memperbarui profil');
      }
    } catch (err) {
      showAlert.error('Error!', 'Terjadi kesalahan saat memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    showAlert.confirm(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      'Ya, Keluar',
      'Batal',
      (result) => {
        if (result.isConfirmed) {
          signOut();
        }
      }
    );
  };

  return (
    <UserLayout>
      <div className="card mx-auto mt-10" style={{ maxWidth: "600px" }}>
        <div className="card-header">
          <h2 className="fw-bold">Pengaturan Profil</h2>
        </div>
        <div className="card-body">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Nama
              </label>
              <input
                type="text"
                id="name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <hr />

            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label">
                Password Saat Ini
              </label>
              <input
                type="password"
                id="currentPassword"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={!newPassword}
                required={!!newPassword}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                Password Baru
              </label>
              <input
                type="password"
                id="newPassword"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="form-text">
                Isi jika ingin mengganti password.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "Simpan Perubahan"
              )}
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
