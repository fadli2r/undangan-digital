// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import "animate.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Digital Wedding Invitation - Create Your Dream Wedding Invitation",
  description:
    "Create beautiful digital wedding invitations in minutes. Choose from premium templates and customize to your style.",
  icons: { icon: [{ url: "/favicon.ico" }] },
  openGraph: {
    title: "Digital Wedding Invitation - Create Your Dream Wedding Invitation",
    description:
      "Create beautiful digital wedding invitations in minutes. Choose from premium templates and customize to your style.",
    url: "/",
    siteName: "Digital Wedding Invitation",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
