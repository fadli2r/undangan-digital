import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner() {
  const router = useRouter();
  const { slug } = router.query;
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scannedGuests, setScannedGuests] = useState([]);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (!slug) return;

    // Load previously scanned guests
    fetch(`/api/invitation/scanned-guests?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.guests) {
          setScannedGuests(data.guests);
        }
      });

    const html5QrcodeScanner = new Html5Qrcode('reader');
    setScanner(html5QrcodeScanner);

    html5QrcodeScanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: 250,
      },
      (decodedText) => {
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // ignore scan errors
      }
    ).catch(err => {
      setError('Error starting scanner: ' + err);
    });

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, [slug]);

  const onScanSuccess = async (decodedText) => {
    try {
      const qrData = JSON.parse(decodedText);

      if (qrData.slug !== slug) {
        setError('QR Code tidak valid untuk undangan ini');
        return;
      }

      // Check if guest already marked hadir
      const alreadyPresent = scannedGuests.some(g => g.name.toLowerCase() === qrData.guest.toLowerCase());
      if (alreadyPresent) {
        setError('Tamu sudah melakukan presensi');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Stop scanning temporarily
      if (scanner) {
        await scanner.stop();
      }

      // Send attendance data to API
      const res = await fetch('/api/invitation/mark-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: qrData.slug,
          guest: qrData.guest,
          timestamp: new Date().toISOString()
        })
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(`${qrData.guest} telah hadir!`);
        setScannedGuests(prev => {
          // Prevent duplicate in frontend list
          if (prev.some(g => g.name.toLowerCase() === qrData.guest.toLowerCase())) {
            return prev;
          }
          return [
            {
              name: qrData.guest,
              timestamp: new Date().toISOString()
            },
            ...prev
          ];
        });
      } else {
        setError(result.message || 'Gagal mencatat kehadiran');
      }

      // Resume scanning after 3 seconds
      setTimeout(() => {
        setSuccess('');
        setError('');
        if (scanner) {
          scanner.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: 250,
            },
            (decodedText) => {
              onScanSuccess(decodedText);
            },
            (errorMessage) => {
              // ignore scan errors
            }
          ).catch(err => {
            setError('Error restarting scanner: ' + err);
          });
        }
      }, 3000);

    } catch (err) {
      setError('Format QR tidak valid');
      console.error('QR Scan Error:', err);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Scanner QR Code Tamu</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div id="reader" style={{ width: '100%' }}></div>

      {/* Scanned Guests List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Daftar Tamu Hadir</h2>
        {scannedGuests.length === 0 ? (
          <p className="text-gray-500">Belum ada tamu yang hadir</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Tamu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu Hadir
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scannedGuests.map((guest, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {guest.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(guest.timestamp).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
