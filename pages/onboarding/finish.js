// pages/onboarding/finish.js
import UserLayout from "@/components/layouts/UserLayout";
import OnboardingStepper from "@/components/onboarding/OnboardingStepper";
import Link from "next/link";
import { useRouter } from "next/router";

export default function OnboardingFinish() {
  const router = useRouter();
  const { orderId } = router.query;

  return (
    <UserLayout>
      <div className="container py-10">
        <OnboardingStepper current="finish" />
        <div className="card">
          <div className="card-body py-12 text-center">
            <div className="mb-6">
              <i className="ki-duotone ki-shield-tick fs-3x text-success">
                <span className="path1"></span><span className="path2"></span>
              </i>
            </div>
            <h2 className="fw-bold mb-3">Pembayaran Berhasil 🎉</h2>
            <p className="text-muted mb-8">
              Terima kasih! Paket kamu akan aktif otomatis. Kamu bisa langsung membuat undangan.
            </p>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
              {orderId && (
                <Link href={`/buat-undangan?orderId=${orderId}`} className="btn btn-primary">
                  Buat Undangan
                </Link>
              )}
              <Link href="/dashboard" className="btn btn-light">Pergi ke Dashboard</Link>
              <Link href="/" className="btn btn-light">Kembali ke Beranda</Link>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
