import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DownloadFeatures from "../../../components/DownloadFeaturesFixed";

export default function Download() {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(true);
  const [undangan, setUndangan] = useState(null);
  const [error, setError] = useState("");

  // Fetch data undangan
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invitation/detail?slug=${slug}`)
      .then(res => res.json())
      .then(res => {
        if (res.undangan) {
          setUndangan(res.undangan);
        } else {
          setError("Undangan tidak ditemukan");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching invitation:', err);
        setError("Gagal memuat data undangan");
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => router.back()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    </div>
  );

  if (!undangan) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Undangan tidak ditemukan.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Download & Export
          </h1>
          <p className="text-gray-600 mt-2">
            Undangan: {undangan.mempelai?.pria} & {undangan.mempelai?.wanita}
          </p>
        </div>

        {/* Download Features Component */}
        <DownloadFeatures slug={slug} invitationData={undangan} />

        {/* Statistics */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Statistik Undangan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {undangan.views || 0}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {undangan.ucapan?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Ucapan & Doa</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {undangan.rsvp?.length || 0}
              </div>
              <div className="text-sm text-gray-600">RSVP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
