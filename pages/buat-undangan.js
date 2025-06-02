import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { templateList } from "../data/templates";

export default function BuatUndangan() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { template } = router.query;
  const [form, setForm] = useState({
    nama_pria: "",
    nama_wanita: "",
    tanggal: "",
    waktu: "",
    lokasi: "",
    alamat: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  // Proteksi akses: hanya user paid (support Google/manual)
  useEffect(() => {
    const cekStatusUser = async () => {
      if (status === "loading") return;

      let email = session?.user?.email;
      let userData = null;

      if (email) {
        const res = await fetch(`/api/user-info?email=${email}`);
        const data = await res.json();
        userData = data.user;
      } else if (typeof window !== "undefined") {
        const userLS = window.localStorage.getItem("user");
        if (userLS) {
          const userObj = JSON.parse(userLS);
          email = userObj.email;
          userData = userObj;
        }
      }

      if (!email) {
        router.replace("/login");
        return;
      }
      if (!userData || userData.status_pembayaran !== "paid") {
        router.replace("/dashboard");
        return;
      }
      setUser(userData);
      setChecking(false);
    };
    cekStatusUser();
  }, [session, status, router]);

  // Validasi template
  const templateObj = templateList.find(tpl => tpl.slug === template);
  useEffect(() => {
    if (!template) return;
    if (!templateObj) {
      router.replace("/pilih-template");
    }
  }, [template, templateObj, router]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validasi form
    if (!form.nama_pria || !form.nama_wanita || !form.tanggal || !form.waktu || !form.lokasi || !form.alamat) {
      setError("Semua field harus diisi.");
      setLoading(false);
      return;
    }

    let email = session?.user?.email;
    if (!email && typeof window !== "undefined") {
      const userLS = window.localStorage.getItem("user");
      if (userLS) email = JSON.parse(userLS).email;
    }
    
    if (!email) {
      setError("User belum login.");
      setLoading(false);
      return;
    }
    
    if (!template) {
      setError("Template belum dipilih.");
      setLoading(false);
      return;
    }

    try {
      // Restructure the data to match the schema
      const invitationData = {
        template,
        user_email: email,
        mempelai: {
          pria: form.nama_pria,
          wanita: form.nama_wanita
        },
        acara_utama: {
          nama: "Resepsi",
          tanggal: form.tanggal,
          waktu: form.waktu,
          lokasi: form.lokasi,
          alamat: form.alamat
        }
      };

      const res = await fetch("/api/invitation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invitationData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Berhasil membuat undangan
        router.push(`/undangan/${data.slug}`);
      } else {
        setError(data.message || "Gagal membuat undangan.");
      }
    } catch (error) {
      console.error("Error creating invitation:", error);
      setError("Terjadi kesalahan saat membuat undangan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || checking || !templateObj) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Isi Data Undangan</h2>
      <div className="mb-6 flex items-center gap-4">
        <img src={templateObj.thumbnail} className="w-20 h-20 object-cover rounded" alt={templateObj.name} />
        <div>
          <div className="font-bold">{templateObj.name}</div>
          <div className="text-xs text-gray-500">{templateObj.description}</div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="nama_pria" placeholder="Nama Mempelai Pria" className="w-full p-2 border rounded" value={form.nama_pria} onChange={handleChange} required />
        <input name="nama_wanita" placeholder="Nama Mempelai Wanita" className="w-full p-2 border rounded" value={form.nama_wanita} onChange={handleChange} required />
        <input name="tanggal" type="date" className="w-full p-2 border rounded" value={form.tanggal} onChange={handleChange} required />
        <input name="waktu" placeholder="Waktu (misal 10:00 - 13:00)" className="w-full p-2 border rounded" value={form.waktu} onChange={handleChange} required />
        <input name="lokasi" placeholder="Lokasi Acara" className="w-full p-2 border rounded" value={form.lokasi} onChange={handleChange} required />
        <textarea name="alamat" placeholder="Alamat lengkap" className="w-full p-2 border rounded" value={form.alamat} onChange={handleChange} required />
        {error && <div className="text-red-600">{error}</div>}
        <button className="bg-blue-600 text-white px-6 py-2 rounded" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan & Lihat Undangan"}
        </button>
      </form>
    </div>
  );
}
