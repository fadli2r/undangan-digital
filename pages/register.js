import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();
  const { status } = useSession();

  // Jika sudah login, redirect ke dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    } else if (typeof window !== "undefined" && localStorage.getItem("user")) {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <div className="mb-2 text-red-500">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input className="block mb-2 w-full border p-2" placeholder="Nama" name="name" value={form.name} onChange={handleChange} required />
        <input className="block mb-2 w-full border p-2" placeholder="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
        <input className="block mb-4 w-full border p-2" placeholder="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
        <button className="bg-blue-600 text-white w-full py-2 rounded" type="submit">Register</button>
      </form>
      <p className="mt-2 text-sm">Sudah punya akun? <a href="/login" className="text-blue-600">Login</a></p>
    </div>
  );
}
