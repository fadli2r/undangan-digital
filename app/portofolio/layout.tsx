// app/portofolio/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portofolio - Dreamslink",
  description: "Lihat koleksi undangan digital yang telah kami buat untuk berbagai acara spesial.",
  keywords: "portofolio undangan, contoh undangan digital, galeri undangan",
  openGraph: {
    title: "Portofolio - Dreamslink",
    description: "Lihat koleksi undangan digital yang telah kami buat untuk berbagai acara spesial.",
    url: "/portofolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portofolio - Dreamslink",
    description: "Lihat koleksi undangan digital yang telah kami buat untuk berbagai acara spesial.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/portofolio",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
