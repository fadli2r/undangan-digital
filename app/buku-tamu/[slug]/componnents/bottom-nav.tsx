// app/buku-tamu/[slug]/components/bottom-nav.tsx

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ClipboardIcon,
  QrIcon,
  ReportIcon,
  SettingsIcon,
} from "../componnents/icons";

type Props = { slug: string };

export default function BottomNav({ slug }: Props) {
  const pathname = usePathname();

  const navs = [
    {
      label: "Kehadiran",
      href: `/buku-tamu/${slug}`,
      icon: <ClipboardIcon />,
    },
    {
      label: "Scan QR",
      href: `/buku-tamu/${slug}/view-mode`,
      icon: <QrIcon />,
    },
    {
      label: "Laporan",
      href: `/buku-tamu/${slug}/laporan`,
      icon: <ReportIcon />,
    },
    {
      label: "Pengaturan",
      href: `/buku-tamu/${slug}/pengaturan`,
      icon: <SettingsIcon />,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/70">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-4 h-16">
          {navs.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center text-sm ${
    active
      ? "text-indigo-600 font-semibold"
      : "text-gray-600 dark:text-gray-300 hover:text-indigo-500"
  }`}
              >
                <div className="w-6 h-6">{item.icon}</div>
                <span className="text-[11px] mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
