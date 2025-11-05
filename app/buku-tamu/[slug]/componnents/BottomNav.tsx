"use client";

import {
  IoHomeOutline,
  IoCreateOutline,
  IoPersonOutline,
  IoCameraOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { usePathname } from "next/navigation";
import styles from "./bottom-nav.module.css";

type NavItem = {
  icon: React.ComponentType;
  text: string;
  href: string;
};

export default function BottomNav({ slug }: { slug: string }) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { text: "Home", icon: IoHomeOutline, href: `/buku-tamu/${slug}` },
    { text: "Add Guest", icon: IoCreateOutline, href: `/buku-tamu/${slug}/add` },
    { text: "View Mode", icon: IoCameraOutline, href: `/buku-tamu/${slug}/view-mode` },
    { text: "List Undangan", icon: IoPersonOutline, href: `/buku-tamu/${slug}/list` },
    { text: "Settings", icon: IoSettingsOutline, href: `/buku-tamu/${slug}/settings` },
  ];

  // cari index aktif, default 0 kalau tidak ketemu
  const activeIndex = Math.max(
    0,
    navItems.findIndex((item) => pathname === item.href)
  );

  return (
    <div className={`${styles.navigation} fixed bottom-0 left-0 right-0 z-50`}>
      <ul>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <li
              key={item.text}
              className={`${styles.list} ${isActive ? styles.active : ""}`}
            >
              <a href={item.href}>
                <span className={styles.icon}>
                  <Icon />
                </span>
              </a>
            </li>
          );
        })}
        {/* indikator geser sesuai halaman aktif */}
        <div
          className={styles.indicator}
          style={{
            transform: `translateX(calc(var(--item-width) * ${activeIndex}))`,
          }}
        />
      </ul>
    </div>
  );
}
