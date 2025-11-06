// app/preview/[slug]/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preview Undangan - Dreamslink",
  description: "Preview undangan digital Anda sebelum dipublikasikan.",
  keywords: "preview undangan, lihat undangan",
  openGraph: {
    title: "Preview Undangan - Dreamslink",
    description: "Preview undangan digital Anda sebelum dipublikasikan.",
    url: "/preview",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Preview Undangan - Dreamslink",
    description: "Preview undangan digital Anda sebelum dipublikasikan.",
  },
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/preview",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
