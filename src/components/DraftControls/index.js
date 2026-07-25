import styles from './styles.module.css';

export default function DraftControls({
  restored,
  status,
  onStartOver,
  noun = 'project',
}) {
  return (
    <aside className={styles.controls} aria-label="Draft status">
      <div>
        {restored && <strong>Welcome back—your draft was restored.</strong>}
        <span role="status">
          {status === 'saving' && 'Saving…'}
          {status === 'saved' && '✓ Saved in this browser'}
          {status === 'error' &&
            'This browser could not save. Keep this page open.'}
          {status === 'loading' && 'Checking for a saved draft…'}
        </span>
      </div>
      <button type="button" onClick={onStartOver}>
        Start this {noun} over
      </button>
    </aside>
  );
}
