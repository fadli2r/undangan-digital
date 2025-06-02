import dbConnect from "../../utils/db";
import Invitation from "../../models/Invitation";
import { templateComponentMap } from "../../data/templates";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import OurStory from "../../components/templates/OurStory";
import QRCodeGuest from "../../components/templates/QRCodeGuest";
import AddToCalendar from "../../components/templates/AddToCalendar";




// === RSVP Component ===
function RSVPForm({ slug, namaTamu }) {
  const [status, setStatus] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!namaTamu) return null;

  const submitRSVP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/invitation/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        nama: namaTamu,
        status,
        jumlah,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess("Terima kasih! Kehadiranmu sudah dicatat.");
    }
  };

  return (
    <form onSubmit={submitRSVP} className="max-w-sm mx-auto my-8 p-4 border rounded shadow bg-white">
      <div className="font-semibold mb-2">Konfirmasi Kehadiran</div>
      <div className="mb-2">Nama: <b>{namaTamu}</b></div>
      <div className="mb-2">
        <label>
          <input type="radio" value="Hadir" checked={status === "Hadir"} onChange={() => setStatus("Hadir")} required /> Hadir
        </label>
        <label className="ml-4">
          <input type="radio" value="Tidak Hadir" checked={status === "Tidak Hadir"} onChange={() => setStatus("Tidak Hadir")} /> Tidak Hadir
        </label>
        <label className="ml-4">
          <input type="radio" value="Ragu-ragu" checked={status === "Ragu-ragu"} onChange={() => setStatus("Ragu-ragu")} /> Ragu-ragu
        </label>
      </div>
      <div className="mb-2">
        <label>Jumlah Orang: </label>
        <input type="number" value={jumlah} min={1} max={10} onChange={e => setJumlah(e.target.value)} className="border p-1 w-16 rounded" />
      </div>
      <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? "Menyimpan..." : "Kirim RSVP"}
      </button>
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </form>
  );
}

// === Guestbook Component ===
function Guestbook({ slug }) {
  const [form, setForm] = useState({ nama: "", pesan: "" });
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState("");
  const [error, setError] = useState("");
  const [ucapanList, setUcapanList] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => setUcapanList(res.undangan?.ucapan || []));
  }, [slug, sukses, refresh]);

  const submitUcapan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSukses("");
    const res = await fetch("/api/invitation/ucapan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, nama: form.nama, pesan: form.pesan }),
    });
    setLoading(false);
    if (res.ok) {
      setSukses("Ucapan kamu sudah terkirim!");
      setForm({ nama: "", pesan: "" });
      setRefresh(!refresh);
    } else {
      setError("Gagal mengirim ucapan.");
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 p-4 bg-gray-50 rounded shadow">
      <h3 className="font-bold mb-2">Buku Tamu & Ucapan</h3>
      <form onSubmit={submitUcapan} className="flex flex-col gap-2 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Nama"
          value={form.nama}
          onChange={e => setForm({ ...form, nama: e.target.value })}
          required
        />
        <textarea
          className="border p-2 rounded"
          placeholder="Tulis ucapan terbaikmu..."
          value={form.pesan}
          onChange={e => setForm({ ...form, pesan: e.target.value })}
          required
        />
        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Mengirim..." : "Kirim Ucapan"}
        </button>
        {sukses && <div className="text-green-600">{sukses}</div>}
        {error && <div className="text-red-600">{error}</div>}
      </form>

      <div>
        <h4 className="font-bold mb-2">Ucapan yang masuk:</h4>
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {ucapanList.length === 0 && <li className="text-gray-500">Belum ada ucapan.</li>}
          {ucapanList.map((u, i) => (
            <li key={i} className="p-2 border rounded bg-white">
              <div className="font-semibold">{u.nama}</div>
              <div className="text-sm text-gray-700">{u.pesan}</div>
              <div className="text-xs text-gray-400">{new Date(u.waktu).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// === Main Page Component ===
export default function UndanganDetail({ undangan }) {
  const router = useRouter();
  const { tamu } = router.query;
  const [namaTamu, setNamaTamu] = useState("");

  // Track invitation opened
  useEffect(() => {
    if (undangan?._id) {
      fetch('/api/invitation/opened', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: undangan._id }),
      });
    }
  }, [undangan?._id]);

  useEffect(() => {
    if (tamu) {
      setNamaTamu(
        tamu
          .replace(/-/g, " ")
          .replace(/\b\w/g, c => c.toUpperCase())
      );
    }
  }, [tamu]);

  if (!undangan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-lg bg-red-50 text-red-600">
          Undangan tidak ditemukan
        </div>
      </div>
    );
  }

  if (undangan.isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-lg bg-yellow-50 text-yellow-600">
          <h2 className="text-xl font-bold mb-2">Undangan Telah Kadaluarsa</h2>
          <p>Undangan ini telah melewati masa aktif (1 tahun).</p>
          <p className="mt-2 text-sm">Dibuat pada: {new Date(undangan.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  // Get template component
  const TemplateComponent = templateComponentMap[undangan.template];

  // If no template is found, show error
  if (!TemplateComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 rounded-lg bg-yellow-50 text-yellow-600">
          Template tidak ditemukan
        </div>
      </div>
    );
  }

  // Prepare data with components
  const templateData = {
    ...undangan,
    components: {
      RSVPForm: <RSVPForm slug={undangan.slug} namaTamu={namaTamu} />,
      Guestbook: <Guestbook slug={undangan.slug} />,
      QRCode: namaTamu ? <QRCodeGuest slug={undangan.slug} guestName={namaTamu} /> : null
    },
  };

  return (
    <>
      

      {/* Render Template */}
      <div className={namaTamu ? "pt-12" : ""}>
        <TemplateComponent data={templateData} />
        {/* Add to Calendar Button */}
        {undangan.acara_utama && (
          <div className="max-w-xl mx-auto my-8">
            <AddToCalendar event={undangan.acara_utama} />
          </div>
        )}
        {/* Live Streaming Section */}
        {/* Our Story Section */}
      </div>
    </>
  );
}

// === Server-side Data Fetching ===
export async function getServerSideProps({ params }) {
  await dbConnect();
  const undangan = await Invitation.findOne({ slug: params.slug }).lean();
  if (!undangan) return { props: { undangan: null } };

  // Convert MongoDB document to plain object and handle Date serialization
  const serializeData = (obj) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] instanceof Date) {
        newObj[key] = obj[key].toISOString();
      } else if (obj[key] === null) {
        newObj[key] = null;
      } else if (Array.isArray(obj[key])) {
        newObj[key] = obj[key].map(item => 
          typeof item === 'object' && item !== null ? serializeData(item) : item
        );
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (obj[key]._id) {
          newObj[key] = { ...serializeData(obj[key]), _id: obj[key]._id.toString() };
        } else {
          newObj[key] = serializeData(obj[key]);
        }
      } else {
        newObj[key] = obj[key];
      }
    });
    return newObj;
  };

  const serializedUndangan = serializeData(undangan);
  serializedUndangan._id = undangan._id.toString();

  return { props: { undangan: serializedUndangan } };
}
