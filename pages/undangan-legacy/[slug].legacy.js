// pages/undangan/[slug].js
import Head from "next/head";
import dbConnect from "../../utils/db";
import Invitation from "../../models/Invitation";
import { templateComponentMap } from "../../data/templates";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import OurStory from "../../components/templates/OurStory";
import QRCodeGuest from "../../components/templates/QRCodeGuest";
import AddToCalendar from "../../components/templates/AddToCalendar";

/** =========================
 * Helpers (client & server)
 * ========================= */
function getCoverImage(u) {
  if (!u) return null;
  if (u.coverImage) return u.coverImage;
  if (u.background_photo) return u.background_photo;
  if (Array.isArray(u.galeri) && u.galeri.length > 0) return u.galeri[0];
  return null;
}

// Build canonical that supports:
// - subdomain:  jaja.dreamslink.id  -> https://jaja.dreamslink.id
// - root path:  dreamslink.id/jejenikah -> https://dreamslink.id/jejenikah
function buildCanonical({ host, slug, query }) {
  if (!host) return `https://example.com/${encodeURIComponent(slug)}`;
  // Jika host sudah subdomain *.dreamslink.id (bukan www), gunakan host tsb
  if (host.endsWith(".dreamslink.id")) {
    const sub = host.replace(".dreamslink.id", "");
    if (sub && sub !== "www") {
      // Sertakan query tamu kalau ada
      const q = query?.tamu ? `?tamu=${encodeURIComponent(query.tamu)}` : "";
      return `https://${host}${q}`;
    }
  }
  // Default: pakai path root /:slug
  const q = query?.tamu ? `?tamu=${encodeURIComponent(query.tamu)}` : "";
  return `https://${host}/${encodeURIComponent(slug)}${q}`;
}

function buildDescription(u) {
  if (!u) return "Undangan digital.";
  if (u.deskripsi) return String(u.deskripsi).slice(0, 160);
  if (u.nama) return `Undangan untuk ${u.nama}`;
  return "Undangan digital.";
}

/** =========================
 * RSVP Component
 * ========================= */
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
        <input
          type="number"
          value={jumlah}
          min={1}
          max={10}
          onChange={e => setJumlah(Number(e.target.value))}
          className="border p-1 w-16 rounded"
        />
      </div>
      <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? "Menyimpan..." : "Kirim RSVP"}
      </button>
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </form>
  );
}

/** =========================
 * Guestbook Component
 * ========================= */
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
              {u.waktu && (
                <div className="text-xs text-gray-400">
                  {new Date(u.waktu).toLocaleString()}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** =========================
 * Main Page
 * ========================= */
export default function UndanganDetail({ undangan, canonical, ogImage, robotsNoIndex }) {
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
        String(tamu)
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
      <>
        <Head>
          <title>{undangan.nama} — Undangan Kadaluarsa</title>
          {robotsNoIndex && <meta name="robots" content="noindex, nofollow" />}
          {canonical && <link rel="canonical" href={canonical} />}
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 rounded-lg bg-yellow-50 text-yellow-600">
            <h2 className="text-xl font-bold mb-2">Undangan Telah Kadaluarsa</h2>
            <p>Undangan ini telah melewati masa aktif (1 tahun).</p>
            <p className="mt-2 text-sm">Dibuat pada: {new Date(undangan.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </>
    );
  }

  // Get template component
  const TemplateComponent = templateComponentMap[undangan.template];

  if (!TemplateComponent) {
    return (
      <>
        <Head>
          <title>Template tidak ditemukan — Dreamslink</title>
          {canonical && <link rel="canonical" href={canonical} />}
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 rounded-lg bg-yellow-50 text-yellow-600">
            Template tidak ditemukan
          </div>
        </div>
      </>
    );
  }

  const description = buildDescription(undangan);

  // Data untuk template
  const templateData = {
    ...undangan,
    components: {
      RSVPForm: <RSVPForm slug={undangan.slug} namaTamu={namaTamu} />,
      Guestbook: <Guestbook slug={undangan.slug} />,
      QRCode: namaTamu ? <QRCodeGuest slug={undangan.slug} guestName={namaTamu} /> : null
    },
  };

  // JSON-LD Event (opsional, kalau ada acara utama)
  const eventJsonLd = undangan?.acara_utama
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": undangan.nama || "Undangan",
        "startDate": undangan.acara_utama?.tanggal || undangan.tanggalAcara || undefined,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": undangan.acara_utama?.lokasi
          ? {
              "@type": "Place",
              "name": undangan.acara_utama?.lokasi?.nama || "Lokasi Acara",
              "address": undangan.acara_utama?.lokasi?.alamat || ""
            }
          : undefined,
        "image": ogImage ? [ogImage] : undefined,
        "description": description
      }
    : null;

  return (
    <>
      <Head>
        <title>{undangan.nama} — Dreamslink</title>
        <meta name="description" content={description} />
        {robotsNoIndex && <meta name="robots" content="noindex, nofollow" />}

        {/* Canonical */}
        {canonical && <link rel="canonical" href={canonical} />}

        {/* Open Graph */}
        <meta property="og:title" content={`${undangan.nama} — Dreamslink`} />
        <meta property="og:description" content={description} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {canonical && <meta property="og:url" content={canonical} />}
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${undangan.nama} — Dreamslink`} />
        <meta name="twitter:description" content={description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}

        {/* JSON-LD Event */}
        {eventJsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }} />
        )}
      </Head>

      {/* Render Template */}
      <TemplateComponent data={templateData} />

      {/* Add to Calendar Button */}
      {undangan.acara_utama && (
        <div className="max-w-xl mx-auto my-8">
          <AddToCalendar event={undangan.acara_utama} />
        </div>
      )}
    </>
  );
}

/** =========================
 * Server-side Data Fetching
 * ========================= */
export async function getServerSideProps(ctx) {
  const { params, query, req } = ctx;
  const slug = String(params?.slug || "");
  await dbConnect();

  const undanganDoc = await Invitation.findOne({ slug }).lean();
  if (!undanganDoc) {
    // Canonical fallback saat 404
    const host = req?.headers?.host || process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || '';
    return {
      props: {
        undangan: null,
        canonical: `https://${host}/${encodeURIComponent(slug)}`,
        robotsNoIndex: true,
        ogImage: null,
      },
    };
  }

  // Serialize Mongo document (safe for Next)
  const serializeData = (obj) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      if (val instanceof Date) {
        newObj[key] = val.toISOString();
      } else if (val === null) {
        newObj[key] = null;
      } else if (Array.isArray(val)) {
        newObj[key] = val.map(item =>
          typeof item === 'object' && item !== null ? serializeData(item) : item
        );
      } else if (typeof val === 'object' && val !== null) {
        if (val._id) {
          newObj[key] = { ...serializeData(val), _id: val._id.toString() };
        } else {
          newObj[key] = serializeData(val);
        }
      } else {
        newObj[key] = val;
      }
    });
    return newObj;
  };

  const undangan = serializeData(undanganDoc);
  undangan._id = undanganDoc._id.toString();

  // Canonical & OG image
  const host = req?.headers?.host || process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || '';
  const canonical = buildCanonical({ host, slug, query });
  const ogImage = getCoverImage(undangan) || `${process.env.NEXT_PUBLIC_SITE_URL || `https://${host}`}/metronic/assets/media/og-default.jpg`;

  // Noindex kalau expired
  const isExpired = !!undangan.isExpired;
  return {
    props: {
      undangan,
      canonical,
      ogImage,
      robotsNoIndex: isExpired || false,
    },
  };
}
