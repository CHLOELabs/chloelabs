import styles from './styles.module.css';

export default function CometGuide({message, mood = 'thinking', badge}) {
  return (
    <aside className={`${styles.guide} ${styles[mood]}`} aria-live="polite">
      <div className={styles.character} aria-hidden="true">
        <svg viewBox="0 0 220 180" role="img">
          <ellipse className={styles.shadow} cx="110" cy="164" rx="72" ry="10" />
          <path className={styles.tail} d="M55 125c-24-5-29-25-17-32 8-5 16 1 12 9-3 6-10 1-8-3" />
          <ellipse className={styles.body} cx="103" cy="124" rx="54" ry="38" />
          <path className={styles.chest} d="M82 105c14 10 26 10 42 0 2 25-8 46-22 49-15-3-23-24-20-49z" />
          <path className={styles.ear} d="M67 53c-23-20-35-7-23 18 6 12 15 20 26 18z" />
          <path className={styles.ear} d="M143 53c22-20 35-7 23 18-6 12-15 20-26 18z" />
          <ellipse className={styles.head} cx="105" cy="76" rx="48" ry="42" />
          <ellipse className={styles.muzzle} cx="105" cy="91" rx="28" ry="22" />
          <circle className={styles.eye} cx="87" cy="71" r="5" />
          <circle className={styles.eye} cx="124" cy="71" r="5" />
          <circle className={styles.eyeShine} cx="89" cy="69" r="1.5" />
          <circle className={styles.eyeShine} cx="126" cy="69" r="1.5" />
          <path className={styles.nose} d="M98 86q7-7 14 0-2 8-7 8t-7-8z" />
          <path className={styles.smile} d="M105 94v5m0 0c-7 8-15 5-17 0m17 0c7 8 15 5 17 0" />
          <path className={styles.hatBrim} d="M57 48c29-13 68-13 97 0-18 10-77 10-97 0z" />
          <path className={styles.hat} d="M73 46l8-27c15-8 34-8 49 0l8 27c-20 6-45 6-65 0z" />
          <path className={styles.hatBand} d="M76 37c19 5 39 5 59 0l3 9c-20 6-45 6-65 0z" />
          <path className={styles.paw} d="M139 119c20 2 24 17 12 23-12 6-25-7-12-23z" />
          <circle className={styles.lens} cx="163" cy="124" r="22" />
          <path className={styles.handle} d="M178 140l24 24" />
          <path className={styles.spark} d="M181 76l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
        </svg>
      </div>
      <div className={styles.bubble}>
        {badge && <span className={styles.badge}>{badge}</span>}
        <strong>Comet’s field note</strong>
        <p>{message}</p>
      </div>
    </aside>
  );
}
