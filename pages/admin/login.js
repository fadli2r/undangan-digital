import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import SeoHead from '@/components/SeoHead'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect kalau admin sudah login
  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      router.replace("/admin");
    }
  }, [status, session, router]);

  // Loading session
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("admin-credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else if (result?.ok) {
        router.replace("/admin");
      } else {
        setError("Login gagal. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Head>
        <link
          href="/metronic/assets/plugins/global/plugins.bundle.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="/metronic/assets/css/style.bundle.css"
          rel="stylesheet"
          type="text/css"
        />
      </Head>
      <SeoHead
        title="Login Admin - Dreamslink"
        description="Halaman login untuk masuk ke panel admin."
        noindex
        canonical="/admin/login"
      />

      <div className="d-flex flex-column flex-root min-vh-100" id="kt_body">
        {/* Theme mode */}
        <script
          dangerouslySetInnerHTML={{
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
            `,
          }}
        />

        {/* Begin::Authentication */}
        <div className="d-flex flex-column flex-lg-row flex-column-fluid h-100">
          {/* Body */}
          <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
            {/* Form */}
            <div className="d-flex flex-center flex-column flex-lg-row-fluid">
              <div className="w-lg-500px p-10">
                <form className="form w-100" onSubmit={handleLogin}>
                  <div className="text-center mb-11">
                    <h1 className="text-gray-900 fw-bolder mb-3">Admin Login</h1>
                    <div className="text-gray-500 fw-semibold fs-6">
                      Masuk ke panel admin
                    </div>
                  </div>

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

                  {/* Input Email */}
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

                  {/* Input Password */}
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

                  {/* Submit */}
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
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="w-lg-500px d-flex flex-stack px-10 mx-auto mt-auto">
              <div className="d-flex fw-semibold text-primary fs-base gap-5">
                <Link href="/terms" className="text-gray-400 text-hover-primary">
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="text-gray-400 text-hover-primary"
                >
                  Privacy
                </Link>
                <Link
                  href="/kontak"
                  className="text-gray-400 text-hover-primary"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

          {/* Aside */}
          <div
            className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
            style={{
              backgroundImage:
                "url(/metronic/assets/media/misc/auth-bg.png)",
            }}
          >
            <div className="d-flex flex-column flex-center py-15 px-5 px-md-15 w-100">
              <Link href="/" className="mb-12">
                <img
                  alt="Dreams Logo"
                  src="/images/DreamsWhite.png"
                  className="h-75px"
                />
              </Link>
              <img
                className="mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20"
                src="/metronic/assets/media/misc/auth-screens.png"
                alt=""
              />
              <h1 className="text-white fs-2qx fw-bolder text-center mb-7">
                Panel Admin Undangan Digital
              </h1>
              <div className="text-white fs-base text-center">
                Kelola pengguna, undangan, dan paket Anda di sini
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        html,
        body {
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
