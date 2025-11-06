// pages/register.js
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

const REGISTER_ENDPOINT = "/api/auth/register"; // ubah jika endpoint kamu beda

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const justSubmittedRef = useRef(false);

  const router = useRouter();
  const { status } = useSession();

  // Jika sudah login & bukan habis submit register → lempar ke dashboard
  useEffect(() => {
    if (status === "authenticated" && !justSubmittedRef.current) {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValidPhone = (v) => /^[0-9]{9,15}$/.test((v || "").trim());
  const isValidEmail = (v) => /\S+@\S+\.\S+/.test((v || "").trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi ringan
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Format email tidak valid.");
      return;
    }
    if (!isValidPhone(form.phone)) {
      setError("Nomor HP tidak valid (hanya angka, 9–15 digit).");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    justSubmittedRef.current = true;

    try {
      // 1) Register
      const resp = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        setError(data?.message || "Gagal mendaftar.");
        return;
      }

      // 2) Auto-login (id provider credentials kamu: "user-credentials")
      await signIn("user-credentials", {
        redirect: true,
        email: form.email,
        password: form.password,
        callbackUrl: "/welcome",
      });
    } catch (err) {
      console.error("Register error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
      // biarkan justSubmittedRef tetap true sampai redirect
    }
  };

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

  return (
    <div className="d-flex flex-column flex-root min-vh-100" id="kt_body">
      <Head>
        <title>Register - Dreamslink Invitation</title>
      </Head>

      <div className="d-flex flex-column flex-lg-row flex-column-fluid">
        {/* Left */}
        <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
          <div className="d-flex flex-center flex-column flex-lg-row-fluid">
            <div className="w-lg-500px p-10">
              <form className="form w-100" onSubmit={handleSubmit}>
                <div className="text-center mb-11">
                  <h1 className="text-gray-900 fw-bolder mb-3">Daftar Akun</h1>
                  <div className="text-gray-500 fw-semibold fs-6">
                    Buat akun baru untuk memulai
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center p-5 mb-5">
                    <i className="ki-duotone ki-shield-cross fs-2hx text-danger me-4" />
                    <div className="d-flex flex-column">{error}</div>
                  </div>
                )}

                <div className="fv-row mb-8">
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    name="name"
                    className="form-control bg-transparent"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="fv-row mb-8">
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    className="form-control bg-transparent"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="fv-row mb-8">
                  <input
                    type="tel"
                    placeholder="Nomor HP"
                    name="phone"
                    className="form-control bg-transparent"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="fv-row mb-8">
                  <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    className="form-control bg-transparent"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="fv-row mb-8">
                  <input
                    type="password"
                    placeholder="Konfirmasi Password"
                    name="confirmPassword"
                    className="form-control bg-transparent"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="fv-row mb-8">
                  <label className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" name="toc" required />
                    <span className="form-check-label fw-semibold text-gray-700 fs-base ms-1">
                      Saya setuju dengan{" "}
                      <a href="#" className="ms-1 link-primary">Syarat & Ketentuan</a>
                    </span>
                  </label>
                </div>

                <div className="d-grid mb-10">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <span className="indicator-progress">
                        Please wait...
                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                      </span>
                    ) : (
                      <span className="indicator-label">Daftar</span>
                    )}
                  </button>
                </div>

                <div className="text-gray-500 text-center fw-semibold fs-6">
                  Sudah punya akun?
                  <Link href="/login" className="link-primary ms-1">
                    Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right */}
        <div
          className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
          style={{ backgroundImage: 'url(/metronic/assets/media/misc/auth-bg.png)' }}
        >
          <div className="d-flex flex-column flex-center py-15 px-5 px-md-15 w-100">
            <Link href="/" className="mb-12">
              <img alt="Dreams Logo" src="/images/dreamslink-w.png" className="h-75px" />
            </Link>
            <img
              className="mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20"
              src="/metronic/assets/media/misc/auth-screens.png"
              alt=""
            />
            <h1 className="text-white fs-2qx fw-bolder text-center mb-7">
              Bergabung Sekarang
            </h1>
            <div className="text-white fs-base text-center">
              Daftar dan mulai buat undangan digital impian Anda hari ini
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
