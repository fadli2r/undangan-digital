// app/kontak/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak Kami - Dreamslink Invitation",
  description:
    "Hubungi kami untuk pertanyaan seputar undangan digital atau bantuan teknis.",
  openGraph: {
    title: "Kontak Kami - Dreamslink Invitation",
    description:
      "Hubungi kami untuk pertanyaan seputar undangan digital atau bantuan teknis.",
    url: "/kontak",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontak Kami - Dreamslink Invitation",
    description:
      "Hubungi kami untuk pertanyaan seputar undangan digital atau bantuan teknis.",
  },
  alternates: {
    canonical: "/kontak",
  },
};

export default function KontakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // bisa langsung return children, tapi enak dibungkus untuk styling global section jika perlu
  return <section>{children}</section>;
}
