import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react"; // ✅ tambahkan signIn
import Head from 'next/head';
import Link from 'next/link';

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
  const router = useRouter();
  const { status } = useSession();

  // 🔒 Kalau sudah login, arahkan ke dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Perbaikan utama: auto-login + welcome page
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Daftar dulu
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal mendaftar.");
        return;
      }

      // 2️⃣ Login otomatis setelah register
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (loginRes?.error) {
        console.error("Auto-login gagal:", loginRes.error);
        setError("Gagal login otomatis. Silakan login manual.");
        router.push("/login");
      } else {
        // 3️⃣ Arahkan ke halaman Welcome
        router.push("/welcome");
      }

    } catch (error) {
      console.error("Register error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
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
        <title>Register - Digital Wedding Invitation</title>
      </Head>

      {/* Auth Layout */}
      <div className="d-flex flex-column flex-lg-row flex-column-fluid">
        {/* Left Side */}
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
                    <i className="ki-duotone ki-shield-cross fs-2hx text-danger me-4"></i>
                    <div className="d-flex flex-column">{error}</div>
                  </div>
                )}

                {/* Input Fields */}
                <div className="fv-row mb-8">
                  <input type="text" placeholder="Nama Lengkap" name="name" className="form-control bg-transparent" value={form.name} onChange={handleChange} required />
                </div>

                <div className="fv-row mb-8">
                  <input type="email" placeholder="Email" name="email" className="form-control bg-transparent" value={form.email} onChange={handleChange} required />
                </div>

                <div className="fv-row mb-8">
                  <input type="tel" placeholder="Nomor HP" name="phone" className="form-control bg-transparent" value={form.phone} onChange={handleChange} required />
                </div>

                <div className="fv-row mb-8">
                  <input type="password" placeholder="Password" name="password" className="form-control bg-transparent" value={form.password} onChange={handleChange} required />
                </div>

                <div className="fv-row mb-8">
                  <input type="password" placeholder="Konfirmasi Password" name="confirmPassword" className="form-control bg-transparent" value={form.confirmPassword} onChange={handleChange} required />
                </div>

                {/* Accept ToS */}
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

        {/* Right Side */}
        <div
          className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
          style={{ backgroundImage: 'url(/metronic/assets/media/misc/auth-bg.png)' }}
        >
          <div className="d-flex flex-column flex-center py-15 px-5 px-md-15 w-100">
            <Link href="/" className="mb-12">
              <img alt="Dreams Logo" src="/images/dreamslink-w.png" className="h-75px" />
            </Link>
            <img className="mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20" src="/metronic/assets/media/misc/auth-screens.png" alt="" />
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
