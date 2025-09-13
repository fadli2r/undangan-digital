// app/kontak/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak Kami - Undangan Digital",
  description:
    "Hubungi kami untuk pertanyaan seputar undangan digital atau bantuan teknis.",
};

export default function KontakLayout({ children }: { children: React.ReactNode }) {
  return children;
}
