import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayoutJWT from '../../components/layouts/AdminLayoutJWT';
import DashboardContent from '../../components/admin/DashboardContent';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminInfo');

    if (!token || !adminData) {
      router.replace('/admin/login');
      return;
    }

    try {
      const parsed = JSON.parse(adminData);
      setAdminInfo(parsed);
    } catch (error) {
      console.error('Gagal parse adminInfo:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      router.replace('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="d-flex flex-column flex-root">
        <div className="page-loading d-flex flex-column flex-column-fluid">
          <div className="d-flex align-items-center justify-content-center flex-column-fluid">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Memuat...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!adminInfo) return null;

  return (
    <AdminLayoutJWT>
      <DashboardContent/>
    </AdminLayoutJWT>
  );
}
