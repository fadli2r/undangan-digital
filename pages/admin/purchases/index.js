// pages/admin/purchases/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminPurchasesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/orders");
  }, [router]);

  return (
    <div className="container py-10">
      <div className="alert alert-info">
        Mengalihkan ke halaman Orders…
      </div>
    </div>
  );
}
