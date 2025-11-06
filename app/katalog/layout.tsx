// app/katalog/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Template Undangan Digital - Pilih Desain Terbaik",
  description:
    "Jelajahi koleksi template undangan digital premium kami. Lebih dari 100+ desain unik untuk pernikahan, ulang tahun, dan acara spesial lainnya.",
  openGraph: {
    title: "Katalog Template Undangan Digital - Pilih Desain Terbaik",
    description:
      "Jelajahi koleksi template undangan digital premium kami. Lebih dari 100+ desain unik untuk pernikahan, ulang tahun, dan acara spesial lainnya.",
    url: "/katalog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Katalog Template Undangan Digital - Pilih Desain Terbaik",
    description:
      "Jelajahi koleksi template undangan digital premium kami. Lebih dari 100+ desain unik untuk pernikahan, ulang tahun, dan acara spesial lainnya.",
  },
  alternates: {
    canonical: "/katalog",
  },
};

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
