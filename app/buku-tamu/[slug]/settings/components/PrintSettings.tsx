"use client";

import { useState } from "react";
import styles from "./modal-glass.module.css";

export default function PrintSettings({ slug }: { slug: string }) {
  const [header, setHeader] = useState("Pernikahan Fadli & Andini");
  const [footer, setFooter] = useState("Terima kasih atas kehadiran Anda");
  const [template, setTemplate] = useState(
    "=== Bukti Kehadiran ===\nTamu: {guestName}\nJumlah: {jumlah}\nTanggal: {eventDate}\n========================\nAmbil souvenir dengan bukti ini"
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Pengaturan Print</h3>

      {/* Input Header */}
      <div>
        <label className="block text-sm mb-1 text-white">Header</label>
        <input
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          placeholder="Header"
          className={styles.input}
        />
      </div>

      {/* Input Template */}
      <div>
        <label className="block text-sm mb-1 text-white">Template</label>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          rows={6}
          className={styles.textarea}
        />
        <p className="text-xs text-gray-200 mt-1">
          Placeholder tersedia: {"{guestName}, {jumlah}, {eventDate}"}
        </p>
      </div>

      {/* Input Footer */}
      <div>
        <label className="block text-sm mb-1 text-white">Footer</label>
        <input
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          placeholder="Footer"
          className={styles.input}
        />
      </div>

      {/* Preview */}
      <div className="mt-4 p-3 rounded-lg bg-white/80 text-black text-sm shadow-inner">
        <h4 className="font-semibold mb-2">Preview Cetakan:</h4>
        <pre>
          {header}
          {"\n\n"}
          {template
            .replace("{guestName}", "John Doe")
            .replace("{jumlah}", "2")
            .replace("{eventDate}", "29 Sept 2025")}
          {"\n\n"}
          {footer}
        </pre>
      </div>

      {/* Tombol Simpan */}
      <button className="mt-4 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium">
        💾 Simpan
      </button>
    </div>
  );
}
