import { useState, useEffect } from 'react';

export default function InvitationStats({ invitationId }) {
  const [stats, setStats] = useState({
    total: 0,
    opened: 0,
    rsvp: {
      hadir: 0,
      tidak_hadir: 0,
      ragu: 0,
      total_tamu: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/invitation/stats?id=${invitationId}`);
        const data = await res.json();
        
        if (res.ok) {
          setStats(data);
        } else {
          setError(data.message || 'Failed to load statistics');
        }
      } catch (err) {
        setError('Error loading statistics');
        console.error('Stats Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (invitationId) {
      fetchStats();
    }
  }, [invitationId]);

  if (loading) return <div className="text-center p-4">Loading statistics...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Metrik
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jumlah
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Total Undangan
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {stats.total}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Dibuka
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {stats.opened} ({stats.total > 0 ? Math.round((stats.opened / stats.total) * 100) : 0}%)
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Konfirmasi Hadir
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
              {stats.rsvp.hadir} orang
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Konfirmasi Tidak Hadir
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
              {stats.rsvp.tidak_hadir} orang
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Belum Pasti
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-600">
              {stats.rsvp.ragu} orang
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Total Tamu Hadir
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
              {stats.rsvp.total_tamu} orang
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
