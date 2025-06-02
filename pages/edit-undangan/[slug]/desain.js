import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { templateList } from "../../../data/templates";

export default function Desain() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [undangan, setUndangan] = useState(null);
  const [success, setSuccess] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Ambil data undangan (untuk tahu template yang sedang dipakai)
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        setUndangan(res.undangan);
        setSelectedTemplate(res.undangan?.template || "");
        setLoading(false);
      })
      .catch(err => {
        setError("Gagal load data undangan");
        setLoading(false);
      });
  }, [slug]);

  // Fungsi update template
  const handleChangeTemplate = async (tpl) => {
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/invitation/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, field: { template: tpl } })
    });
    if (res.ok) {
      setSelectedTemplate(tpl);
      setSuccess("Template berhasil diupdate!");
      setLoading(false);
      setTimeout(() => setSuccess(""), 2000);
    } else {
      const data = await res.json();
      setError(data.message || "Gagal update template");
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!undangan) return <div className="p-8 text-center">Undangan tidak ditemukan.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Ubah Desain / Template Undangan</h2>
      <div className="mb-6">
        <b>Template sekarang:</b>
        <span className="ml-2 px-2 py-1 bg-blue-100 rounded">
          {selectedTemplate || "-"}
        </span>
      </div>
      {success && <div className="mb-4 text-green-600">{success}</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}

      {/* List Template */}
      <div className="grid md:grid-cols-3 gap-6">
        {templateList.map((tpl) => (
          <div key={tpl.slug} className={`border rounded-xl p-4 shadow text-center flex flex-col items-center
            ${selectedTemplate === tpl.slug ? "border-blue-600 ring-2 ring-blue-300" : ""}`}>
            <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-32 object-cover rounded mb-4" />
            <div className="font-semibold">{tpl.name}</div>
            <div className="text-xs mb-4 text-gray-500">{tpl.description}</div>
            <button
              className={`px-4 py-2 rounded mt-auto
                ${selectedTemplate === tpl.slug ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-600 text-white"}`}
              onClick={() => handleChangeTemplate(tpl.slug)}
              disabled={selectedTemplate === tpl.slug || loading}
            >
              {selectedTemplate === tpl.slug ? "Dipakai" : "Pilih Template"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
