import styles from "./modal-glass.module.css";

export default function TemaSettings({ slug }: { slug: string }) {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm mb-1 text-white">Pilih Warna Utama</label>
        <input type="color" className={styles.input} />
      </div>

      <div>
        <label className="block text-sm mb-1 text-white">Font Undangan</label>
        <select className={styles.input}>
          <option value="serif">Serif Elegan</option>
          <option value="sans-serif">Sans-Serif Modern</option>
          <option value="script">Script (Tulis Tangan)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1 text-white">Latar Belakang</label>
        <input type="file" accept="image/*" className={styles.input} />
      </div>
    </form>
  );
}
