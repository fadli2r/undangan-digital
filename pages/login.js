import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('user-credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (result?.error) {
      setError('Email atau password salah');
    } else if (result?.ok) {
      router.replace('/dashboard');
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      console.error(err);
      setError('Login Google gagal. Silakan coba lagi.');
    } finally {
      setGoogleLoading(false);
    }
  };

  if (status === 'loading') {
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
    <>
      <Head>
        <title>Login - Dreamslink Invitation</title>
        <link rel="stylesheet" href="/metronic/assets/plugins/global/plugins.bundle.css" />
        <link rel="stylesheet" href="/metronic/assets/css/style.bundle.css" />
      </Head>

  <div className="d-flex flex-column flex-root min-vh-100" id="kt_body">
        <div className="d-flex flex-column flex-lg-row flex-column-fluid">
          {/* Body */}
          <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
            <div className="d-flex flex-center flex-column flex-lg-row-fluid">
              <div className="w-lg-500px p-10">
                <form className="form w-100" onSubmit={handleLogin}>
                  <div className="text-center mb-11">
                    <h1 className="text-gray-900 fw-bolder mb-3">Sign In</h1>
                    <div className="text-gray-500 fw-semibold fs-6">Login ke akun Anda</div>
                  </div>

                  <div className="row g-3 mb-9">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100"
                      >
                        <img
                          alt="Logo"
                          src="/metronic/assets/media/svg/brand-logos/google-icon.svg"
                          className="h-15px me-3"
                        />
                        {googleLoading ? 'Menghubungkan...' : 'Sign in with Google'}
                      </button>
                   
                  </div>

                  <div className="separator separator-content my-14">
                    <span className="w-125px text-gray-500 fw-semibold fs-7">Or with email</span>
                  </div>

                  {error && (
                    <div className="alert alert-danger d-flex align-items-center p-5 mb-5">
                      <i className="ki-duotone ki-shield-cross fs-2hx text-danger me-4"></i>
                      <div className="d-flex flex-column">{error}</div>
                    </div>
                  )}

                  <div className="fv-row mb-8">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      autoComplete="off"
                      className="form-control bg-transparent"
                      onChange={handleChange}
                      value={form.email}
                      required
                    />
                  </div>

                  <div className="fv-row mb-3">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      autoComplete="off"
                      className="form-control bg-transparent"
                      onChange={handleChange}
                      value={form.password}
                      required
                    />
                  </div>

                  <div className="d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8">
                    <div></div>
                    <Link href="/forgot-password" className="link-primary">Forgot Password?</Link>
                  </div>

                  <div className="d-grid mb-10">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      <span className="indicator-label">Sign In</span>
                      {loading && (
                        <span className="indicator-progress">
                          Please wait...
                          <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="text-gray-500 text-center fw-semibold fs-6">
                    Belum punya akun?
                    <Link href="/register" className="link-primary ms-1">Daftar</Link>
                  </div>
                </form>
              </div>
            </div>

            <div className="w-lg-500px d-flex flex-stack px-10 mx-auto mt-auto">
              <div className="d-flex fw-semibold text-primary fs-base gap-5">
                <Link href="/terms" className="text-gray-400 text-hover-primary">Terms</Link>
                <Link href="/plans" className="text-gray-400 text-hover-primary">Plans</Link>
                <Link href="/contact" className="text-gray-400 text-hover-primary">Contact Us</Link>
              </div>
            </div>
          </div>

          {/* Aside */}
          <div
            className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2"
            style={{ backgroundImage: 'url(/metronic/assets/media/misc/auth-bg.png)' }}
          >
            <div className="d-flex flex-column flex-center py-7 py-lg-15 px-5 px-md-15 w-100">
              <Link href="/" className="mb-0 mb-lg-12">
                <img alt="Logo" src="/images/DreamsWhite.png" className="h-60px h-lg-75px" />
              </Link>

              <img
                className="d-none d-lg-block mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20"
                src="/metronic/assets/media/misc/auth-screens.png"
                alt=""
              />

              <h1 className="d-none d-lg-block text-white fs-2qx fw-bolder text-center mb-7">
                Buat Undangan Digital
              </h1>

              <div className="d-none d-lg-block text-white fs-base text-center">
                Solusi terbaik untuk undangan digital yang elegan dan mudah dibuat
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
