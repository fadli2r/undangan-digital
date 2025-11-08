import styles from './anim.module.css';

export default function WavingFlower({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* stem as the rotation pivot */}
      <g className={styles.flowerRoot}>
        <path d="M60 150 C58 120, 58 90, 60 60" stroke="#4CAF50" strokeWidth="4" />
        {/* leaves */}
        <ellipse className={styles.leaf} cx="55" cy="100" rx="8" ry="14" fill="#66BB6A" />
        <ellipse className={styles.leaf} cx="65" cy="85" rx="7" ry="12" fill="#66BB6A" />
        {/* petals */}
        <g className={styles.petal}>
          <circle cx="60" cy="50" r="10" fill="#FFC0CB" />
          <circle cx="48" cy="50" r="8" fill="#FF9EB3" />
          <circle cx="72" cy="50" r="8" fill="#FF9EB3" />
          <circle cx="60" cy="38" r="8" fill="#FF9EB3" />
          <circle cx="60" cy="62" r="8" fill="#FF9EB3" />
          <circle cx="60" cy="50" r="4" fill="#FFB300" />
        </g>
      </g>
    </svg>
  );
}