import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { templateList } from "../../data/templates";

export default function EditUndangan({ undangan }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    nama_pria: undangan?.nama_pria || "",
    nama_wanita: undangan?.nama_wanita || "",
    tanggal: undangan?.tanggal || "",
    waktu: undangan?.waktu || "",
    lokasi: undangan?.lokasi || "",
    alamat: undangan?.alamat || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const templateObj = templateList.find(t => t.slug === undangan?.template);

  // Validasi akses user & slug
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      router.replace("/login");
      return;
    }
    if (undangan && session?.user?.email !== undangan.user_email) {
      router.replace("/dashboard");
      return;
    }
  }, [session, status, undangan, router]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    const email = session?.user?.email;
    const res = await fetch("/api/invitation/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug: undangan.slug, user_email: email }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess("Undangan berhasil diupdate!");
      setTimeout(() => {
        router.push(`/undangan/${undangan.slug}`);
      }, 1000);
    } else {
      setError(data.message || "Gagal update undangan.");
    }
  };

  if (!undangan) return <div className="p-10 text-center">Undangan tidak ditemukan.</div>;
  if (status === "loading") return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-16 p-4 md:p-6 bg-white rounded shadow grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* FORM EDIT (KIRI) */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Edit Undangan</h2>
        {templateObj && (
          <div className="mb-6 flex items-center gap-4">
            <img src={templateObj.thumbnail} className="w-20 h-20 object-cover rounded" alt={templateObj.name} />
            <div>
              <div className="font-bold">{templateObj.name}</div>
              <div className="text-xs text-gray-500">{templateObj.description}</div>
            </div>
          </div>
        )}
        {/* TOMBOL PREVIEW */}
        <div className="mb-6">
          <button
            type="button"
            className="bg-green-600 text-white px-4 py-2 rounded mr-2"
            onClick={() => window.open(`/undangan/${undangan.slug}`, "_blank")}
          >
            Preview (Versi Tersimpan)
          </button>
        </div>
        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="nama_pria" placeholder="Nama Mempelai Pria" className="w-full p-2 border rounded" value={form.nama_pria} onChange={handleChange} required />
          <input name="nama_wanita" placeholder="Nama Mempelai Wanita" className="w-full p-2 border rounded" value={form.nama_wanita} onChange={handleChange} required />
          <input name="tanggal" type="date" className="w-full p-2 border rounded" value={form.tanggal} onChange={handleChange} required />
          <input name="waktu" placeholder="Waktu (misal 10:00 - 13:00)" className="w-full p-2 border rounded" value={form.waktu} onChange={handleChange} required />
          <input name="lokasi" placeholder="Lokasi Acara" className="w-full p-2 border rounded" value={form.lokasi} onChange={handleChange} required />
          <textarea name="alamat" placeholder="Alamat lengkap" className="w-full p-2 border rounded" value={form.alamat} onChange={handleChange} required />
          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button className="bg-blue-600 text-white px-6 py-2 rounded" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      {/* LIVE PREVIEW (KANAN) */}
      <div>
        <h3 className="text-lg font-bold mb-4">Live Preview (Belum Disimpan)</h3>
        <div className="p-6 border rounded shadow bg-white">
          {/* Preview: bisa custom sesuai template */}
          {templateObj?.component ? (
            <templateObj.component data={form} />
          ) : (
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">{form.nama_pria} & {form.nama_wanita}</h1>
              <div className="mb-2">{form.tanggal} • {form.waktu}</div>
              <div className="mb-2 font-semibold">{form.lokasi}</div>
              <div className="mb-2">{form.alamat}</div>
              {/* Tambah komponen lain sesuai kebutuhan */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// SSR: fetch data undangan (Next.js 12/13/14/15 support)
export async function getServerSideProps({ params }) {
  // Jangan import db/model di komponen, tapi di SSR function
  const dbConnect = (await import("../../utils/db")).default;
  const Invitation = (await import("../../models/Invitation")).default;
  await dbConnect();
  let undangan = await Invitation.findOne({ slug: params.slug }).lean();
  if (!undangan) return { props: { undangan: null } };
  undangan._id = undangan._id.toString();
  if (undangan.createdAt) undangan.createdAt = undangan.createdAt.toISOString();
  if (undangan.updatedAt) undangan.updatedAt = undangan.updatedAt.toISOString();
  return { props: { undangan } };
}
