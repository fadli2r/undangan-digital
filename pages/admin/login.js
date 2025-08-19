import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      router.push('/admin');
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and admin info
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminInfo', JSON.stringify(data.admin));
        
        // Redirect to admin dashboard
        router.push('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column flex-root" id="kt_app_root">
      <div className="d-flex flex-column flex-lg-row flex-column-fluid">
        {/* Left side - Background */}
        <div className="d-flex flex-lg-row-fluid">
          <div className="d-flex flex-column flex-center pb-0 pb-lg-10 p-10 w-100">
            <img className="theme-light-show mx-auto mw-100 w-150px w-lg-300px mb-10 mb-lg-20" 
                 src="/metronic/assets/media/auth/agency.png" alt="" />
            <img className="theme-dark-show mx-auto mw-100 w-150px w-lg-300px mb-10 mb-lg-20" 
                 src="/metronic/assets/media/auth/agency-dark.png" alt="" />
            <h1 className="text-gray-800 fs-2qx fw-bold text-center mb-7">
              Fast, Efficient and Productive
            </h1>
            <div className="text-gray-600 fs-base text-center fw-semibold">
              In this kind of post, 
              <a href="#" className="opacity-75-hover text-primary me-1">the blogger</a>
              introduces a person they've interviewed <br />
              and provides some background information about 
              <a href="#" className="opacity-75-hover text-primary me-1">the interviewee</a>
              and their <br /> work following this is a transcript of the interview.
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="d-flex flex-column-fluid flex-lg-row-auto justify-content-center justify-content-lg-end p-12">
          <div className="bg-body d-flex flex-column flex-center rounded-4 w-md-600px p-10">
            <div className="d-flex flex-center flex-column align-items-stretch h-lg-100 w-md-400px">
              <div className="d-flex flex-center flex-column flex-column-fluid pb-15 pb-lg-20">
                <form className="form w-100" onSubmit={handleSubmit}>
                  <div className="text-center mb-11">
                    <h1 className="text-gray-900 fw-bolder mb-3">Admin Login</h1>
                    <div className="text-gray-500 fw-semibold fs-6">Sign in to access the admin panel</div>
                  </div>

                  {error && (
                    <div className="alert alert-danger d-flex align-items-center p-5 mb-10">
                      <i className="ki-duotone ki-shield-tick fs-2hx text-danger me-4">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <div className="d-flex flex-column">
                        <h4 className="mb-1 text-danger">Error</h4>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  <div className="fv-row mb-8">
                    <input 
                      type="email" 
                      placeholder="Email" 
                      name="email" 
                      autoComplete="off" 
                      className="form-control bg-transparent" 
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="fv-row mb-3">
                    <input 
                      type="password" 
                      placeholder="Password" 
                      name="password" 
                      autoComplete="off" 
                      className="form-control bg-transparent" 
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="d-grid mb-10">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <i className="ki-duotone ki-entrance-left fs-2 me-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                          Sign In
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-gray-500 text-center fw-semibold fs-6">
                    <Link href="/" className="link-primary">
                      ← Back to main site
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
