"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Kamu bisa pass prop `session` di sini kalau ambil dari server,
  // tapi kalau tidak, cukup render kosong—next-auth akan fetch session via API.
  return <SessionProvider>{children}</SessionProvider>;
}
