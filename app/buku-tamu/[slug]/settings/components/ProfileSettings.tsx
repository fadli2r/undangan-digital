import styles from "./modal-glass.module.css";

export default function ProfileSettings({ slug }: { slug: string }) {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm mb-1 text-white">Nama Mempelai Pria</label>
        <input type="text" className={styles.input} placeholder="Masukkan nama pria" />
      </div>

      <div>
        <label className="block text-sm mb-1 text-white">Nama Mempelai Wanita</label>
        <input type="text" className={styles.input} placeholder="Masukkan nama wanita" />
      </div>

      <div>
        <label className="block text-sm mb-1 text-white">Tanggal Acara</label>
        <input type="date" className={styles.input} />
      </div>

      <div>
        <label className="block text-sm mb-1 text-white">Lokasi Acara</label>
        <input type="text" className={styles.input} placeholder="Masukkan lokasi acara" />
      </div>
    </form>
  );
}
