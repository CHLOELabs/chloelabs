import {useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {readNotebook} from '../../lib/notebookStorage';
import styles from './styles.module.css';

export const PATHS = [
  {id: 'learn', label: 'Learn', icon: '✦'},
  {id: 'build', label: 'Build', icon: '◆'},
  {id: 'investigate', label: 'Investigate', icon: '⌕'},
  {id: 'create', label: 'Create', icon: '★'},
  {id: 'share', label: 'Share', icon: '◉'},
];

const NEXT_STEPS = {
  learn: [
    ['investigate', 'Collect evidence', 'Turn one question into something you can observe or test.'],
    ['build', 'Make the idea tangible', 'Build a model, tool, game, or demonstration.'],
    ['create', 'Transform what you learned', 'Use your understanding in an original story, visual, or exhibit.'],
  ],
  build: [
    ['investigate', 'Test your build', 'Collect evidence about how well it works.'],
    ['create', 'Tell its design story', 'Turn the process into a visual, comic, or exhibit.'],
    ['share', 'Show what you made', 'Plan a clear demonstration for someone else.'],
  ],
  investigate: [
    ['learn', 'Follow the new question', 'Research something your evidence made you wonder about.'],
    ['create', 'Visualize the evidence', 'Transform your pattern into an original explanation.'],
    ['share', 'Share the conclusion', 'Help an audience understand what the evidence supports.'],
  ],
  create: [
    ['learn', 'Deepen the idea', 'Research a question your creative work uncovered.'],
    ['build', 'Bring it into the world', 'Turn part of the creation into something interactive or physical.'],
    ['share', 'Find an audience', 'Prepare your creation so someone else can experience it.'],
  ],
  share: [
    ['learn', 'Explore their question', 'Use audience feedback to find the next thing to learn.'],
    ['investigate', 'Test a claim', 'Collect evidence for an idea people asked about.'],
    ['create', 'Make another version', 'Reimagine the explanation for a different audience.'],
  ],
};

export function useTopicProgress(topic) {
  const [entries, setEntries] = useState([]);
  useEffect(() => {
    const refresh = () => setEntries(readNotebook());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('chloelabs:notebook-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('chloelabs:notebook-changed', refresh);
    };
  }, []);
  return useMemo(() => {
    const normalized = String(topic || '').trim().toLocaleLowerCase();
    return new Set(
      entries
        .filter(
          (entry) =>
            String(entry.topic || '').trim().toLocaleLowerCase() === normalized,
        )
        .map((entry) => entry.notebookPath),
    );
  }, [entries, topic]);
}

export function PathJourneyMap({currentPath, fromPath, topic}) {
  const completed = useTopicProgress(topic);
  return (
    <section className={styles.journey} aria-label={`${topic} curiosity journey`}>
      <div className={styles.journeyHeading}>
        <div>
          <span>Curiosity journey</span>
          <strong>{topic}</strong>
        </div>
        <small>{completed.size} of 5 paths explored</small>
      </div>
      {fromPath && fromPath !== currentPath && (
        <p className={styles.handoff}>
          You explored <strong>{topic}</strong> through the{' '}
          <strong>{pathLabel(fromPath)}</strong> path. Now you can approach it
          from a new angle.
        </p>
      )}
      <div className={styles.pathRow}>
        {PATHS.map((path) => {
          const isComplete = completed.has(path.id);
          const isCurrent = currentPath === path.id;
          return (
            <Link
              aria-current={isCurrent ? 'step' : undefined}
              className={`${styles.path} ${isComplete ? styles.complete : ''} ${isCurrent ? styles.current : ''}`}
              key={path.id}
              to={`/curiosity-engine/${path.id}?topic=${encodeURIComponent(topic)}&from=${encodeURIComponent(currentPath)}`}>
              <span>{isComplete ? '✓' : path.icon}</span>
              <small>{path.label}</small>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function NextAdventure({currentPath, saved, topic}) {
  const panelRef = useRef(null);
  const wasSaved = useRef(saved);

  useEffect(() => {
    if (saved && !wasSaved.current) {
      window.setTimeout(() => {
        panelRef.current?.focus();
        panelRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
      }, 80);
    }
    wasSaved.current = saved;
  }, [saved]);

  if (!saved) return null;
  const options = NEXT_STEPS[currentPath] || [];
  return (
    <section className={styles.next} ref={panelRef} tabIndex={-1}>
      <span className={styles.nextEyebrow}>Your curiosity keeps growing</span>
      <Heading as="h2">What would you like to do next?</Heading>
      <p>
        You completed the {pathLabel(currentPath)} path for{' '}
        <strong>{topic}</strong>. Choose another angle or return to your
        notebook.
      </p>
      <div className={styles.nextGrid}>
        {options.map(([path, title, description]) => (
          <Link
            key={path}
            to={`/curiosity-engine/${path}?topic=${encodeURIComponent(topic)}&from=${encodeURIComponent(currentPath)}`}>
            <span>{PATHS.find((item) => item.id === path)?.icon}</span>
            <strong>{title}</strong>
            <small>{description}</small>
          </Link>
        ))}
      </div>
      <Link className={styles.notebookLink} to="/my-lab-notebook">
        Return to My Lab Notebook →
      </Link>
    </section>
  );
}

export function TopicProgress({completedPaths, topic}) {
  return (
    <div className={styles.miniProgress} aria-label={`${topic} path progress`}>
      {PATHS.map((path) => (
        <span
          className={completedPaths.has(path.id) ? styles.miniComplete : ''}
          key={path.id}>
          {completedPaths.has(path.id) ? '✓' : path.icon}
          <small>{path.label}</small>
        </span>
      ))}
    </div>
  );
}

function pathLabel(path) {
  return PATHS.find((item) => item.id === path)?.label || path;
}
