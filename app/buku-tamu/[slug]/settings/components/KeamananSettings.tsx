import styles from "./modal-glass.module.css";

export default function KeamananSettings({ slug }: { slug: string }) {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm mb-1 text-white">Password Akses Tamu</label>
        <input type="password" className={styles.input} placeholder="Isi jika ingin proteksi" />
      </div>

      <div>
        <label className="block text-sm mb-1 text-white">Batas Waktu Akses</label>
        <input type="datetime-local" className={styles.input} />
      </div>

      <div>
        <label className="block text-sm mb-1 text-white">Izinkan Undangan Dibagikan</label>
        <select className={styles.input}>
          <option value="ya">Ya</option>
          <option value="tidak">Tidak</option>
        </select>
      </div>
    </form>
  );
}
