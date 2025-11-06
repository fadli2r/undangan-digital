// app/produk/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paket & Harga - Dreamslink Invitation",
  description: "Pilih paket terbaik untuk undangan digital Anda. Hemat hingga 20% dengan paket tahunan. Cocok untuk kebutuhan pribadi maupun profesional.",
  keywords: "paket undangan digital, harga undangan, produk undangan",
  openGraph: {
    title: "Paket & Harga - Dreamslink Invitation",
    description:
      "Pilih paket terbaik untuk undangan digital Anda. Hemat hingga 20% dengan paket tahunan. Cocok untuk kebutuhan pribadi maupun profesional.",
    url: "/produk",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paket & Harga - Dreamslink Invitation",
    description:
      "Pilih paket terbaik untuk undangan digital Anda. Hemat hingga 20% dengan paket tahunan. Cocok untuk kebutuhan pribadi maupun profesional.",
  },
  alternates: {
    canonical: "/produk",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProdukLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
