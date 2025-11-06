// app/buku-tamu/[slug]/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buku Tamu Digital - Dreamslink",
  description: "Kelola kehadiran tamu dengan buku tamu digital yang modern dan efisien.",
  keywords: "buku tamu digital, guest book online",
  openGraph: {
    title: "Buku Tamu Digital - Dreamslink",
    description: "Kelola kehadiran tamu dengan buku tamu digital yang modern dan efisien.",
    url: "/buku-tamu",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buku Tamu Digital - Dreamslink",
    description: "Kelola kehadiran tamu dengan buku tamu digital yang modern dan efisien.",
  },
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/buku-tamu",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
