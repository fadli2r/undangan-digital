import styles from './GlassButton.module.css';

export default function GlassButton({ label, onClick }) {
  return (
    <div className={styles.buttonWrap}>
      <button className={styles.button} onClick={onClick}>
        <span className={styles.buttonText}>{label}</span>
      </button>
      <div className={styles.buttonShadow}></div>
    </div>
  );
}
