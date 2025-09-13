// pages/404.tsx
export default function Custom404() {
  return (
    <div className="d-flex flex-column flex-center text-center p-10">
      <h1 className="fs-2hx fw-bold mb-5">404 — Page Not Found</h1>
      <p className="fs-4 text-muted mb-10">Halaman tidak ditemukan.</p>
      <a className="btn btn-primary" href="/admin">Kembali ke Dashboard</a>
    </div>
  );
}
