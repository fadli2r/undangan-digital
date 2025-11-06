// app/undangan/[slug]/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Undangan Digital - Dreamslink",
  description: "Undangan digital yang elegan dan modern untuk acara spesial Anda.",
  keywords: "undangan digital, undangan online, e-invitation",
  openGraph: {
    title: "Undangan Digital - Dreamslink",
    description: "Undangan digital yang elegan dan modern untuk acara spesial Anda.",
    url: "/undangan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Undangan Digital - Dreamslink",
    description: "Undangan digital yang elegan dan modern untuk acara spesial Anda.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/undangan",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
