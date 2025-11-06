// app/tentang/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami - Dreamslink",
  description: "Kenali lebih dekat Dreamslink, platform undangan digital terpercaya di Indonesia.",
  keywords: "tentang dreamslink, profil perusahaan, tentang kami",
  openGraph: {
    title: "Tentang Kami - Dreamslink",
    description: "Kenali lebih dekat Dreamslink, platform undangan digital terpercaya di Indonesia.",
    url: "/tentang",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tentang Kami - Dreamslink",
    description: "Kenali lebih dekat Dreamslink, platform undangan digital terpercaya di Indonesia.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/tentang",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
