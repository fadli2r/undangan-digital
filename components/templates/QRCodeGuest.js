'use client';

import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QRCodeGuest({ slug, guestName }) {
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    // Create a unique QR value combining slug and guest name
    const value = JSON.stringify({
      slug,
      guest: guestName,
      timestamp: new Date().toISOString()
    });
    setQrValue(value);
  }, [slug, guestName]);

  if (!qrValue) return null;

  return (
      <div className="inline-block p-4 bg-white rounded-lg shadow">
        <QRCodeCanvas 
          value={qrValue}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      
  );
}
