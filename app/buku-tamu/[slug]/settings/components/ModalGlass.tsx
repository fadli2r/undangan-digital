"use client";

import { ReactNode } from "react";
import styles from "./modal-glass.module.css";

type ModalGlassProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function ModalGlass({ title, onClose, children }: ModalGlassProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header dengan close button */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
