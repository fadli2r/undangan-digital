// pages/welcome.jsx
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSession } from "next-auth/react";

export default function WelcomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const redirectedRef = useRef(false);

  // Jika belum login, arahkan ke login (sekali saja)
  useEffect(() => {
    if (status === "unauthenticated" && !redirectedRef.current) {
      redirectedRef.current = true;
      // kasih callbackUrl supaya setelah login balik ke /welcome
      router.replace(`/login?callbackUrl=${encodeURIComponent("/welcome")}`);
    }
  }, [status, router]);

  // Jika sudah login, timer ke dashboard
  useEffect(() => {
    if (status !== "authenticated") return;
    const t = setTimeout(() => {
      router.replace("/dashboard");
    }, 3000);
    return () => clearTimeout(t);
  }, [status, router]);

  // Loading state saat cek session
  if (status === "loading") {
    return (
      <div className="d-flex flex-column flex-root">
        <div className="d-flex flex-column flex-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      </div>
    );
  }

  // Kalau belum authenticated, biarkan kosong sebentar—router.replace akan bekerja
  if (status !== "authenticated") return null;

  const name = session?.user?.name || "Teman";

  return (
    <div className="d-flex flex-column flex-root">
      <Head>
        <title>Welcome - Digital Wedding Invitation</title>
      </Head>

      {/* ✅ Background Image with Dark Mode fix */}
      <style jsx global>{`
        body {
          background-image: url('/metronic/assets/media/auth/bg8.jpg');
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
        }
        :root[data-bs-theme="dark"] body {
          background-image: url('/metronic/assets/media/auth/bg8-dark.jpg');
        }
      `}</style>

      <div className="d-flex flex-column flex-center flex-column-fluid">
        <div className="d-flex flex-column flex-center text-center p-10">
          <div className="card card-flush w-md-650px py-5 shadow-lg">
            <div className="card-body py-15 py-lg-20">
              {/* Logo */}
              <div className="mb-7">
                <a href="/" aria-label="Dreamslink Home">
                  <img
                    alt="Dreamslink"
                    src="/images/dreamslink-w.png"
                    className="h-50px"
                  />
                </a>
              </div>

              {/* Title */}
              <h1 className="fw-bolder text-gray-900 mb-5">
                Selamat Datang, {name}! 🎉
              </h1>

              <div className="fw-semibold fs-6 text-gray-600 mb-7">
                Akun kamu berhasil dibuat.
                <br />
                Kamu akan diarahkan ke dashboard sebentar lagi…
              </div>

              {/* Illustration */}
              <div className="mb-10">
                <img
                  src="/metronic/assets/media/auth/welcome.png"
                  className="mw-100 mh-300px theme-light-show"
                  alt="Welcome"
                />
                <img
                  src="/metronic/assets/media/auth/welcome-dark.png"
                  className="mw-100 mh-300px theme-dark-show"
                  alt="Welcome Dark"
                />
              </div>

              {/* Manual Redirect */}
              <div className="mb-0">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => router.replace("/dashboard")}
                >
                  Go To Dashboard
                </button>
              </div>

              {/* Info kecil */}
              <div className="text-gray-500 fs-7 mt-4">
                Tidak dialihkan? Pastikan cookie diizinkan lalu klik tombol di atas.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
