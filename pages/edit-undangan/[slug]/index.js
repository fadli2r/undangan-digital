import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import InvitationStats from "../../../components/templates/InvitationStats";

export default function EditUndanganIndex() {
  const router = useRouter();
  const { slug } = router.query;

  const [data, setData] = useState(null);

  // Ambil data undangan dari API
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => setData(res.undangan));
  }, [slug]);

  if (!data) return <div className="p-8 text-center">Loading...</div>;

  // Menu navigasi
  const menu = [
    { label: "Ubah Desain", path: "desain" },
    { label: "Informasi Mempelai", path: "mempelai" },
    { label: "Informasi Acara", path: "acara" },
    { label: "Informasi Tambahan", path: "tambahan" },
    { label: "Galeri", path: "galeri" },
    { label: "Amplop Digital", path: "gift" },
    { label: "Our Story", path: "ourstory" },
    { label: "Kelola Tamu", path: "tamu" },
    { label: "RSVP", path: "rsvp" },
    { label: "Ucapan", path: "ucapan" }
  ];

  // Scanner button handler
  const openScanner = () => {
    window.open(`/scanner/${slug}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-2">Edit Undangan: <span className="text-blue-600">{data.slug}</span></h2>
      <div className="mb-6 text-gray-500">
        Template: <b>{data.template}</b>
      </div>
      
      {/* RINGKASAN & STATISTIK */}
      <div className="mb-10 space-y-8">
        <div>
          <h3 className="font-bold mb-2">Ringkasan Data</h3>
          <ul className="text-sm space-y-1">
            <li>Mempelai: <b>{data?.mempelai?.pria || "-"} & {data?.mempelai?.wanita || "-"}</b></li>
            <li>Tanggal Acara: <b>{data?.acara_utama?.tanggal ? new Date(data.acara_utama.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : "-"}</b></li>
            <li>Jumlah Foto Galeri: <b>{data?.galeri?.length || 0}</b></li>
            <li>Jumlah Tamu: <b>{data?.tamu?.length || 0}</b></li>
            <li>Amplop Digital: <b>{data?.gift?.enabled ? "Aktif" : "Tidak Aktif"}</b></li>
          </ul>
        </div>

        {/* Statistik Undangan */}
        <div>
          <h3 className="font-bold mb-4">Statistik Undangan</h3>
          <InvitationStats invitationId={data._id} />
        </div>
      </div>

      {/* Scanner Button */}
      <div className="mb-8">
        <button
          onClick={openScanner}
          className="w-full p-4 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Buka Scanner QR Code Tamu
        </button>
      </div>

      {/* MENU NAVIGASI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {menu.map(item => (
          <Link
            key={item.path}
            href={`/edit-undangan/${slug}/${item.path}`}
            className="block p-4 rounded shadow text-center bg-blue-50 hover:bg-blue-100 font-semibold text-blue-700 transition"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
