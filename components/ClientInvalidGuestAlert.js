'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function ClientInvalidGuestAlert() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const invalidTamu = searchParams.get('invalid_tamu');

    if (invalidTamu === '1') {
      alert('Nama tamu tidak ditemukan dalam daftar undangan.');

      // Buat ulang query string tanpa invalid_tamu
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('invalid_tamu');

      const newUrl = `${pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`;

      router.replace(newUrl);
    }
  }, [searchParams, pathname, router]);

  return null;
}
