import styles from "./modal-glass.module.css";

export default function KehadiranSettings({ slug }: { slug: string }) {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm mb-1 text-white">Maksimal Jumlah Tamu</label>
        <input type="number" className={styles.input} placeholder="Contoh: 500" />
      </div>

      <div>
        <label className="block text-sm mb-1 text-white">Konfirmasi Wajib</label>
        <select className={styles.input}>
          <option value="ya">Ya</option>
          <option value="tidak">Tidak</option>
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1 text-white">Pesan Default RSVP</label>
        <textarea className={styles.textarea} rows={3} placeholder="Pesan default ke tamu"></textarea>
      </div>
    </form>
  );
}
