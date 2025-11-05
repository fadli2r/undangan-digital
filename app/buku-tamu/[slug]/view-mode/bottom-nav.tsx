"use client";

import { usePathname } from "next/navigation";
import { HomeIcon, CameraIcon, UsersIcon,SettingsIcon } from "../componnents/icons";

import React from "react";

export type BottomNavProps = {
  slug: string;
  onScanClick: () => void;
  onScrollToPresence?: () => void;
};

export default function BottomNav({ slug, onScanClick, onScrollToPresence }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/70">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-4 h-16">
          <NavItem label="Undangan" href={`/undangan/${slug}`} icon={<HomeIcon />} />
          <button
            onClick={onScanClick}
            className="flex flex-col items-center justify-center text-indigo-600"
          >
            <div className="w-12 h-12 -mt-6 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg ring-4 ring-indigo-200 dark:ring-indigo-800">
              <CameraIcon />
            </div>
            <span className="text-xs mt-1 font-medium">Scan</span>
          </button>
          <NavItem label="Kehadiran" onClick={onScrollToPresence} icon={<UsersIcon />} />
          <NavItem label="Pengaturan" href="#" icon={<SettingsIcon />} />
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  label,
  href,
  icon,
  onClick,
}: {
  label: string;
  href?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const Comp: any = onClick ? "button" : "a";
  return (
    <Comp
      {...(href ? { href } : {})}
      onClick={onClick}
      className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-[11px] mt-1">{label}</span>
    </Comp>
  );
}
