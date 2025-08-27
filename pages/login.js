import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from 'next/head';
import Link from 'next/link';

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="d-flex flex-column flex-root">
        <div className="page-loading d-flex flex-column flex-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Login manual dengan NextAuth
  const handleLoginManual = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const result = await signIn("user-credentials", {
        email: form.email,
        password: form.password,
        redirect: false
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else if (result?.ok) {
        router.replace("/dashboard");
      } else {
        setError("Login gagal. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Login Google
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    
    try {
      await signIn("google", { 
        callbackUrl: "/dashboard",
        redirect: true 
      });
    } catch (error) {
      console.error("Google login error:", error);
      setError("Login Google gagal. Silakan coba lagi.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Head>
        <title>Login - Digital Wedding Invitation</title>
        <link href="/metronic/assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/metronic/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
      </Head>

      <div className="d-flex flex-column flex-root min-vh-100" id="kt_body">
        {/* Begin::Theme mode setup */}
        <script dangerouslySetInnerHTML={{
          __html: `
            var defaultThemeMode = "light";
            var themeMode;
            if (document.documentElement) {
              if (document.documentElement.hasAttribute("data-bs-theme-mode")) {
                themeMode = document.documentElement.getAttribute("data-bs-theme-mode");
              } else {
                if (localStorage.getItem("data-bs-theme") !== null) {
                  themeMode = localStorage.getItem("data-bs-theme");
                } else {
                  themeMode = defaultThemeMode;
                }
              }
              if (themeMode === "system") {
                themeMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
              }
              document.documentElement.setAttribute("data-bs-theme", themeMode);
            }
          `
        }} />
        {/* End::Theme mode setup */}

        {/* Begin::Authentication - Sign-in */}
        <div className="d-flex flex-column flex-lg-row flex-column-fluid h-100">
          {/* Begin::Body */}
          <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
            {/* Begin::Form */}
            <div className="d-flex flex-center flex-column flex-lg-row-fluid">
              {/* Begin::Wrapper */}
              <div className="w-lg-500px p-10">
                <form className="form w-100" onSubmit={handleLoginManual}>
                  {/* Begin::Heading */}
                  <div className="text-center mb-11">
                    <h1 className="text-gray-900 fw-bolder mb-3">Login</h1>
                    <div className="text-gray-500 fw-semibold fs-6">
                      Masuk ke akun Anda
                    </div>
                  </div>
                  {/* End::Heading */}

                  {/* Begin::Login options */}
                  <div className="row g-3 mb-9">
                    <div className="col-12">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100"
                      >
                        <img alt="Logo" src="/metronic/assets/media/svg/brand-logos/google-icon.svg" className="h-15px me-3" />
                        {googleLoading ? 'Menghubungkan...' : 'Login dengan Google'}
                      </button>
                    </div>
                  </div>
                  {/* End::Login options */}

                  {/* Begin::Separator */}
                  <div className="separator separator-content my-14">
                    <span className="w-125px text-gray-500 fw-semibold fs-7">Atau dengan email</span>
                  </div>
                  {/* End::Separator */}

                  {error && (
                    <div className="alert alert-danger d-flex align-items-center p-5 mb-10">
                      <i className="ki-duotone ki-shield-cross fs-2hx text-danger me-4">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <div className="d-flex flex-column">
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Begin::Input group */}
                  <div className="fv-row mb-8">
                    <input
                      type="email"
                      placeholder="Email"
                      name="email"
                      autoComplete="off"
                      className="form-control bg-transparent"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* End::Input group */}

                  {/* Begin::Input group */}
                  <div className="fv-row mb-8">
                    <input
                      type="password"
                      placeholder="Password"
                      name="password"
                      autoComplete="off"
                      className="form-control bg-transparent"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* End::Input group */}

                  {/* Begin::Submit button */}
                  <div className="d-grid mb-10">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      <span className="indicator-label">Login</span>
                      {loading && (
                        <span className="indicator-progress">
                          Please wait...
                          <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                        </span>
                      )}
                    </button>
                  </div>
                  {/* End::Submit button */}

                  {/* Begin::Sign up */}
                  <div className="text-gray-500 text-center fw-semibold fs-6">
                    Belum punya akun?
                    <Link href="/register" className="link-primary fw-semibold ms-2">
                      Daftar di sini
                    </Link>
                  </div>
                  {/* End::Sign up */}
                </form>
              </div>
              {/* End::Wrapper */}
            </div>
            {/* End::Form */}

            {/* Begin::Footer */}
            <div className="w-lg-500px d-flex flex-stack px-10 mx-auto mt-auto">
              <div className="d-flex fw-semibold text-primary fs-base gap-5">
                <Link href="/terms" className="text-gray-400 text-hover-primary">Terms</Link>
                <Link href="/privacy" className="text-gray-400 text-hover-primary">Privacy</Link>
                <Link href="/contact" className="text-gray-400 text-hover-primary">Contact Us</Link>
              </div>
            </div>
            {/* End::Footer */}
          </div>
          {/* End::Body */}

          {/* Begin::Aside */}
          <div className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2" style={{
            backgroundImage: 'url(/metronic/assets/media/misc/auth-bg.png)',
          }}>
            {/* Begin::Content */}
            <div className="d-flex flex-column flex-center py-15 px-5 px-md-15 w-100">
              {/* Begin::Logo */}
              <Link href="/" className="mb-12">
                <img alt="Dreams Logo" src="/images/DreamsWhite.png" className="h-75px" />
              </Link>
              {/* End::Logo */}

              {/* Begin::Image */}
              <img 
                className="mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20" 
                src="/metronic/assets/media/misc/auth-screens.png" 
                alt="" 
              />
              {/* End::Image */}

              {/* Begin::Title */}
              <h1 className="text-white fs-2qx fw-bolder text-center mb-7">
                Buat Undangan Digital
              </h1>
              {/* End::Title */}

              {/* Begin::Text */}
              <div className="text-white fs-base text-center">
                Platform undangan digital terbaik untuk momen spesial Anda
              </div>
              {/* End::Text */}
            </div>
            {/* End::Content */}
          </div>
          {/* End::Aside */}
        </div>
        {/* End::Authentication - Sign-in */}
      </div>

      <style jsx global>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
        }
        body {
          background-color: var(--bs-page-bg) !important;
        }
        #__next {
          height: 100%;
        }
      `}</style>

      <script src="/metronic/assets/plugins/global/plugins.bundle.js"></script>
      <script src="/metronic/assets/js/scripts.bundle.js"></script>
    </div>
  );
}
