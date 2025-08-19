import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from 'next/head';
import Link from 'next/link';

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  // Jika sudah login, redirect ke dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    
    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.message);
      } else {
        router.push("/login");
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Head>
        <title>Register - Digital Wedding Invitation</title>
        <link href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" rel="stylesheet" />
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

        {/* Begin::Authentication - Sign-up */}
        <div className="d-flex flex-column flex-lg-row flex-column-fluid h-100">
          {/* Begin::Body */}
          <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
            {/* Begin::Form */}
            <div className="d-flex flex-center flex-column flex-lg-row-fluid">
              {/* Begin::Wrapper */}
              <div className="w-lg-500px p-10">
                <form className="form w-100" onSubmit={handleSubmit}>
                  {/* Begin::Heading */}
                  <div className="text-center mb-11">
                    <h1 className="text-gray-900 fw-bolder mb-3">Daftar Akun</h1>
                    <div className="text-gray-500 fw-semibold fs-6">
                      Buat akun baru untuk memulai
                    </div>
                  </div>
                  {/* End::Heading */}

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
                      type="text"
                      placeholder="Nama Lengkap"
                      name="name"
                      autoComplete="off"
                      className="form-control bg-transparent"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* End::Input group */}

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

                  {/* Begin::Input group */}
                  <div className="fv-row mb-8">
                    <input
                      type="password"
                      placeholder="Konfirmasi Password"
                      name="confirmPassword"
                      autoComplete="off"
                      className="form-control bg-transparent"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* End::Input group */}

                  {/* Begin::Accept */}
                  <div className="fv-row mb-8">
                    <label className="form-check form-check-inline">
                      <input className="form-check-input" type="checkbox" name="toc" value="1" required />
                      <span className="form-check-label fw-semibold text-gray-700 fs-base ms-1">
                        Saya setuju dengan 
                        <a href="#" className="ms-1 link-primary">Syarat & Ketentuan</a>
                      </span>
                    </label>
                  </div>
                  {/* End::Accept */}

                  {/* Begin::Submit button */}
                  <div className="d-grid mb-10">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      <span className="indicator-label">Daftar</span>
                      {loading && (
                        <span className="indicator-progress">
                          Please wait...
                          <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                        </span>
                      )}
                    </button>
                  </div>
                  {/* End::Submit button */}

                  {/* Begin::Sign in */}
                  <div className="text-gray-500 text-center fw-semibold fs-6">
                    Sudah punya akun?
                    <Link href="/login" className="link-primary fw-semibold ms-2">
                      Login di sini
                    </Link>
                  </div>
                  {/* End::Sign in */}
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
                <img alt="Logo" src="/logo.png" className="h-75px" />
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
                Bergabung Sekarang
              </h1>
              {/* End::Title */}

              {/* Begin::Text */}
              <div className="text-white fs-base text-center">
                Daftar dan mulai buat undangan digital impian Anda hari ini
              </div>
              {/* End::Text */}
            </div>
            {/* End::Content */}
          </div>
          {/* End::Aside */}
        </div>
        {/* End::Authentication - Sign-up */}
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
