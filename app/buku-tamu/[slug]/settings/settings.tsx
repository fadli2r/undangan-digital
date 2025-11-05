"use client";

import { useState } from "react";
import styles from "./settings.module.css";
import ModalGlass from "./components/ModalGlass";
import ProfileSettings from "./components/ProfileSettings";
import KehadiranSettings from "./components/KehadiranSettings";
import TemaSettings from "./components/TemaSettings";
import KeamananSettings from "./components/KeamananSettings";
import PrintSettings from "./components/PrintSettings";
import BottomNav from "../componnents/BottomNav"; // ✅ impor bottomnav

type Props = { slug: string };

export default function Settings({ slug }: Props) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const menu = [
    { key: "profile", label: "Profil Undangan", desc: "Edit nama mempelai & detail acara" },
    { key: "kehadiran", label: "Pengaturan Kehadiran", desc: "Atur konfirmasi & jumlah tamu" },
    { key: "tema", label: "Tema & Tampilan", desc: "Sesuaikan warna & desain undangan" },
    { key: "keamanan", label: "Keamanan", desc: "Password & akses tamu" },
    { key: "print", label: "Pengaturan Print", desc: "Template cetakan bukti hadir" },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pengaturan</h1>

      <div className={styles.grid}>
        {menu.map((item) => (
          <div
            key={item.key}
            className={styles.card}
            onClick={() => setActiveModal(item.key)}
          >
            <h3>{item.label}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* ✅ Modal dinamis */}
      {activeModal === "profile" && (
        <ModalGlass title="Pengaturan Profil" onClose={() => setActiveModal(null)}>
          <ProfileSettings slug={slug} />
        </ModalGlass>
      )}

      {activeModal === "kehadiran" && (
        <ModalGlass title="Pengaturan Kehadiran" onClose={() => setActiveModal(null)}>
          <KehadiranSettings slug={slug} />
        </ModalGlass>
      )}

      {activeModal === "tema" && (
        <ModalGlass title="Tema & Tampilan" onClose={() => setActiveModal(null)}>
          <TemaSettings slug={slug} />
        </ModalGlass>
      )}

      {activeModal === "keamanan" && (
        <ModalGlass title="Keamanan" onClose={() => setActiveModal(null)}>
          <KeamananSettings slug={slug} />
        </ModalGlass>
      )}

      {activeModal === "print" && (
        <ModalGlass title="Pengaturan Print" onClose={() => setActiveModal(null)}>
          <PrintSettings slug={slug} />
        </ModalGlass>
      )}

      {/* ✅ BottomNav selalu di bawah */}
      <BottomNav slug={slug} />
    </div>
  );
}
