import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" || localStorage.getItem("user")) {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Show loading state while checking session
  if (status === "loading") {
    return <div className="max-w-md mx-auto mt-20 text-center">Loading...</div>;
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Login manual
  const handleLoginManual = async (e) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      // Simpan ke localStorage
      localStorage.setItem("user", JSON.stringify(data));
      router.replace("/dashboard");
    } else {
      setError(data.message || "Login gagal");
    }
  };

  // Login Google
  const handleGoogleLogin = () => signIn("google", { callbackUrl: "/dashboard" });

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleLoginManual} className="space-y-4">
        <input name="email" placeholder="Email" className="w-full border p-2 rounded" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" className="w-full border p-2 rounded" value={form.password} onChange={handleChange} required />
        {error && <div className="text-red-600">{error}</div>}
        <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      </form>
      <div className="my-4 text-center text-gray-500">atau</div>
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-red-600 text-white py-2 rounded"
      >
        Login dengan Google
      </button>
      <div className="mt-4 text-center">
        Belum punya akun? <a className="text-blue-600 underline" href="/register">Daftar di sini</a>
      </div>
    </div>
  );
}
