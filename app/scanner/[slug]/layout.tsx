// app/scanner/[slug]/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scanner QR Code - Dreamslink",
  description: "Scan QR code untuk mencatat kehadiran tamu secara digital.",
  keywords: "qr scanner, scan undangan",
  openGraph: {
    title: "Scanner QR Code - Dreamslink",
    description: "Scan QR code untuk mencatat kehadiran tamu secara digital.",
    url: "/scanner",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scanner QR Code - Dreamslink",
    description: "Scan QR code untuk mencatat kehadiran tamu secara digital.",
  },
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/scanner",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
