import { useState } from 'react';
import { motion } from 'framer-motion';

export default function DownloadFeatures({ slug, invitationData }) {
  const [loading, setLoading] = useState({
    pdf: false,
    wishes: false
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const downloadPDF = async () => {
    setLoading({ ...loading, pdf: true });
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/invitation/download-pdf?slug=${slug}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `undangan-${slug}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage('PDF undangan berhasil didownload!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Gagal mendownload PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Terjadi kesalahan saat mendownload PDF');
    } finally {
      setLoading({ ...loading, pdf: false });
    }
  };

  const downloadWishes = async () => {
    setLoading({ ...loading, wishes: true });
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/invitation/download-wishes?slug=${slug}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ucapan-${slug}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage('Data ucapan berhasil didownload!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Gagal mendownload data ucapan');
      }
    } catch (error) {
      console.error('Error downloading wishes:', error);
      setError('Terjadi kesalahan saat mendownload data ucapan');
    } finally {
      setLoading({ ...loading, wishes: false });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Download & Export
        </h2>
        <p className="text-gray-600">
          Download undangan dalam format PDF atau export data ucapan
        </p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
        >
          {message}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Download */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Download PDF</h3>
              <p className="text-sm text-gray-600">Undangan dalam format PDF untuk dicetak</p>
            </div>
          </div>
          <button
            onClick={downloadPDF}
            disabled={loading.pdf}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading.pdf ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Wishes Export */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Export Ucapan</h3>
              <p className="text-sm text-gray-600">Data ucapan dalam format Excel</p>
            </div>
          </div>
          <button
            onClick={downloadWishes}
            disabled={loading.wishes}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading.wishes ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Ucapan
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">Informasi:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>PDF undangan akan mencakup semua informasi yang terlihat di undangan online</li>
              <li>Export ucapan berisi nama, pesan, dan waktu ucapan dalam format Excel</li>
              <li>File akan otomatis terdownload ke folder Downloads Anda</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
