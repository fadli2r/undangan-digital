import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import "animate.css";
import Providers from "./providers";
import Script from "next/script";
import { fetchSettings } from "@/lib/getSettings";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// Ambil dari env untuk og:url, canonical, dsb
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dreamslink.id";

export async function generateMetadata(): Promise<Metadata> {
  const s = await fetchSettings();
  const general = s?.general || {};
  const seo = s?.seo || {};

  const siteName = general.siteName || "Dreamslink Invitation";
  const titleDefault = seo.metaTitle || `${siteName} - Undangan Digital`;
  const descriptionDefault =
    seo.metaDescription ||
    general.siteDescription ||
    "Buat undangan pernikahan digital yang elegan dan modern.";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      // default dan template untuk halaman yang override
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
