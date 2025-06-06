import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import InvitationStats from "../../../components/templates/InvitationStats";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function EditUndanganIndex() {
  const router = useRouter();
  const { slug } = router.query;
  const { language, changeLanguage, t } = useLanguage();

  const [data, setData] = useState(null);
  const [editingSlug, setEditingSlug] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [slugLoading, setSlugLoading] = useState(false);
  const [slugError, setSlugError] = useState("");

  // Ambil data undangan dari API
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        setData(res.undangan);
        setNewSlug(res.undangan.custom_slug || res.undangan.slug);
      });
  }, [slug]);

  if (!data) return <div className="p-8 text-center">{t('loading')}</div>;

  // Menu navigasi
  const menu = [
    { label: t("ubah_desain") || "Ubah Desain", path: "desain", icon: "🎨" },
    { label: t("informasi_mempelai") || "Informasi Mempelai", path: "mempelai", icon: "👰" },
    { label: t("informasi_acara") || "Informasi Acara", path: "acara", icon: "📅" },
    { label: t("informasi_tambahan") || "Informasi Tambahan", path: "tambahan", icon: "ℹ️" },
    { label: t("gallery") || "Galeri", path: "galeri", icon: "📸" },
    { label: t("digital_envelope") || "Amplop Digital", path: "gift", icon: "💝" },
    { label: t("story") || "Our Story", path: "ourstory", icon: "💕" },
    { label: t("guest_list") || "Kelola Tamu", path: "tamu", icon: "👥" },
    { label: t("rsvp") || "RSVP", path: "rsvp", icon: "✅" },
    { label: t("send_wishes") || "Ucapan", path: "ucapan", icon: "💌" },
    { label: t("privacy_settings") || "Pengaturan Privasi", path: "privasi", icon: "🔒" },
    { label: t("download") + " & " + t("export") || "Download & Export", path: "download", icon: "📥" }
  ];

  // Scanner button handler
  const openScanner = () => {
    window.open(`/scanner/${slug}`, '_blank');
  };

  // Language toggle handler
  const toggleLanguage = () => {
    changeLanguage(language === 'id' ? 'en' : 'id');
  };

  // Handle slug update
  const handleSlugUpdate = async () => {
    if (!newSlug.trim()) {
      setSlugError("Link tidak boleh kosong");
      return;
    }

    setSlugLoading(true);
    setSlugError("");

    try {
      const response = await fetch('/api/invitation/update-slug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentSlug: slug,
          newSlug: newSlug.trim(),
          user_email: data.user_email
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to new URL if slug changed
        if (result.slug !== slug) {
          router.replace(`/edit-undangan/${result.slug}`);
        } else {
          setEditingSlug(false);
        }
      } else {
        setSlugError(result.message || "Gagal mengupdate link");
      }
    } catch (error) {
      setSlugError("Terjadi kesalahan saat mengupdate link");
    } finally {
      setSlugLoading(false);
    }
  };

  const cancelSlugEdit = () => {
    setEditingSlug(false);
    setNewSlug(data.custom_slug || data.slug);
    setSlugError("");
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">
            {t('wedding_invitation')}
          </h2>
          
          {/* Custom Slug Editor */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">undangan/</span>
            {editingSlug ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="px-2 py-1 border rounded text-sm flex-1 max-w-xs"
                  placeholder="link-custom"
                  pattern="[a-zA-Z0-9-]+"
                />
                <button
                  onClick={handleSlugUpdate}
                  disabled={slugLoading}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {slugLoading ? "..." : "✓"}
                </button>
                <button
                  onClick={cancelSlugEdit}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-semibold">{data.slug}</span>
                <button
                  onClick={() => setEditingSlug(true)}
                  className="text-xs text-gray-500 hover:text-blue-600"
                  title="Edit link"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
          
          {slugError && (
            <div className="text-red-600 text-sm mt-1">{slugError}</div>
          )}
        </div>
        
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {language === 'id' ? 'English' : 'Bahasa'}
        </button>
      </div>
      <div className="mb-6 text-gray-500">
        {t('template')}: <b>{data.template}</b>
      </div>
      
      {/* RINGKASAN & STATISTIK */}
      <div className="mb-10 space-y-8">
        <div>
          <h3 className="font-bold mb-2">{t('summary_data')}</h3>
          <ul className="text-sm space-y-1">
            <li>{t('groom')} & {t('bride')}: <b>{data?.mempelai?.pria || "-"} & {data?.mempelai?.wanita || "-"}</b></li>
            <li>{t('wedding_date')}: <b>{data?.acara_utama?.tanggal ? new Date(data.acara_utama.tanggal).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : "-"}</b></li>
            <li>{t('gallery')}: <b>{data?.galeri?.length || 0}</b></li>
            <li>{t('guest_list')}: <b>{data?.tamu?.length || 0}</b></li>
            <li>{t('digital_envelope')}: <b>{data?.gift?.enabled ? t('active') : t('inactive')}</b></li>
          </ul>
        </div>

        {/* Statistik Undangan */}
        <div>
          <h3 className="font-bold mb-4">{t('invitation_stats')}</h3>
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
          {t('open_qr_scanner')}
        </button>
      </div>

      {/* MENU NAVIGASI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {menu.map(item => (
          <Link
            key={item.path}
            href={`/edit-undangan/${slug}/${item.path}`}
            className="flex items-center justify-center gap-2 p-4 rounded shadow text-center bg-blue-50 hover:bg-blue-100 font-semibold text-blue-700 transition"
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
