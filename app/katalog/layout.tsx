// app/katalog/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Template Undangan Digital - Pilih Desain Terbaik",
  description:
    "Jelajahi koleksi template undangan digital premium kami. Lebih dari 100+ desain unik untuk pernikahan, ulang tahun, dan acara spesial lainnya.",
};

export default function KatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
