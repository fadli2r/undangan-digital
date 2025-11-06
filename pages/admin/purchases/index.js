// pages/admin/purchases/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import SeoHead from '@/components/SeoHead';

export default function AdminPurchasesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/orders");
  }, [router]);

  return (
    <>
      <SeoHead
        title="Manajemen Pembelian - Dreamslink"
        description="Halaman untuk mengelola pembelian di panel admin."
        noindex
        canonical="/admin/purchases"
      />
      <div className="container py-10">
        <div className="alert alert-info">
          Mengalihkan ke halaman Orders…
        </div>
      </div>
    </>
  );
}
