import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function WelcomePage() {
  const router = useRouter();

  // Otomatis redirect ke dashboard setelah 4 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="d-flex flex-column flex-root">
      <Head>
        <title>Welcome - Digital Wedding Invitation</title>
      </Head>

      {/* ✅ Background Image (Light & Dark Theme Support) */}
      <style jsx global>{`
        body {
          background-image: url('/metronic/assets/media/auth/bg8.jpg');
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
        }
        [data-bs-theme="dark"] body {
          background-image: url('/metronic/assets/media/auth/bg8-dark.jpg');
        }
      `}</style>

      {/* ✅ Main Wrapper */}
      <div className="d-flex flex-column flex-center flex-column-fluid">
        {/* ✅ Content */}
        <div className="d-flex flex-column flex-center text-center p-10">
          {/* ✅ Card Wrapper */}
          <div className="card card-flush w-md-650px py-5 shadow-lg">
            <div className="card-body py-15 py-lg-20">
              {/* ✅ Logo */}
              <div className="mb-7">
                <a href="/" className="">
                  <img
                    alt="Logo"
                    src="/images/DreamsWhite.png"
                    className="h-50px"
                  />
                </a>
              </div>

              {/* ✅ Title */}
              <h1 className="fw-bolder text-gray-900 mb-5">
                Selamat Datang di Undangan Digital 🎉
              </h1>

              {/* ✅ Subtitle Text */}
              <div className="fw-semibold fs-6 text-gray-600 mb-7">
                Akun Anda berhasil dibuat!
                <br />
                Anda akan diarahkan ke dashboard sebentar lagi...
              </div>

              {/* ✅ Illustration */}
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

              {/* ✅ Button Manual Redirect */}
              <div className="mb-0">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => router.push("/dashboard")}
                >
                  Go To Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
