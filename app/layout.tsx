// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import "animate.css";
import Providers from "./providers";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// Pastikan ENV ini ada di Vercel: NEXT_PUBLIC_SITE_URL=https://dreamslink.id
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dreamslink.id";

// PENTING: Untuk SEO yang baik, JANGAN gunakan force-dynamic di root layout
// Biarkan Next.js melakukan static generation untuk performa dan SEO optimal
// export const dynamic = "force-dynamic"; // ❌ DIHAPUS untuk SEO
// export const revalidate = 0; // ❌ DIHAPUS untuk SEO

async function getSettingsSafe() {
  try {
    // Panggil endpoint publik, JANGAN import code yang connect mongoose dari layout
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);

    const res = await fetch(`${SITE_URL}/api/public/settings`, {
      // pastikan ini runtime, tidak di-cache build
      cache: "no-store",
      signal: ctrl.signal,
      // opsional: header simple supaya edge friendly
      headers: { "accept": "application/json" },
    });

    clearTimeout(t);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json?.settings || {};
  } catch {
    // fallback kalau gagal
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettingsSafe();
  const general = s.general || {};
  const seo = s.seo || {};

  const siteName = general.siteName || "Dreamslink Invitation";
  const titleDefault = seo.metaTitle || `${siteName} - Undangan Digital`;
  const descriptionDefault =
    seo.metaDescription ||
    general.siteDescription ||
    "Buat undangan pernikahan digital yang elegan dan modern.";

  return {
    // base URL supaya <link rel="canonical"> & OG URL rapi
    metadataBase: new URL(SITE_URL),
    title: {
      default: titleDefault,
      template: `%s | ${siteName}`,
    },
    description: descriptionDefault,
    keywords: seo.metaKeywords || "undangan digital, undangan pernikahan",
    openGraph: {
      title: titleDefault,
      description: descriptionDefault,
      url: SITE_URL,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description: descriptionDefault,
    },
    icons: { icon: [{ url: "/favicon.ico" }] },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: SITE_URL,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>

        {/* Ionicons */}
        <Script
          type="module"
          src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"
        />
        <Script
          noModule
          src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"
        />
      </body>
    </html>
  );
}
