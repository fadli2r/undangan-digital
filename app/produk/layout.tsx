// app/produk/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paket & Harga - Undangan Digital",
  description:
    "Pilih paket terbaik untuk undangan digital Anda. Hemat hingga 20% dengan paket tahunan. Cocok untuk kebutuhan pribadi maupun profesional.",
};

export default function ProdukLayout({ children }: { children: React.ReactNode }) {
  return children;
}
