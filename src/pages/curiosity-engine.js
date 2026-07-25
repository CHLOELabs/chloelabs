import {useEffect, useMemo, useRef, useState} from 'react';
import {useHistory, useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {
  ensureProjectForTopic,
  projectLink,
} from '../lib/projectStorage';
import styles from './curiosity-engine.module.css';

const paths = [
  {
    key: 'learn',
    icon: '✦',
    title: 'Find a surprise',
    verb: 'LEARN',
    prompt: (topic) => `Uncover something unexpected about ${topic}.`,
  },
  {
    key: 'build',
    icon: '◆',
    title: 'Make it work',
    verb: 'BUILD',
    prompt: (topic) => `Turn ${topic} into a model, game, tool, or demonstration.`,
  },
  {
    key: 'investigate',
    icon: '⌕',
    title: 'Test a hunch',
    verb: 'INVESTIGATE',
    prompt: (topic) => `Predict, observe, and collect clues about ${topic}.`,
  },
  {
    key: 'create',
    icon: '★',
    title: 'Remix the idea',
    verb: 'CREATE',
    prompt: (topic) => `Invent a story, image, comic, video, or exhibit about ${topic}.`,
  },
  {
    key: 'share',
    icon: '◉',
    title: 'Show someone',
    verb: 'SHARE',
    prompt: (topic) => `Turn what you discovered into an experience for someone else.`,
  },
];

const QUICK_IDEAS = [
  ['🐙', 'Octopuses'],
  ['🌪️', 'Storms'],
  ['🐕', 'Dogs'],
  ['🧊', 'Ice'],
  ['🎮', 'Video games'],
  ['🌱', 'Plants'],
];
const SURPRISE_IDEAS = [
  'Why popcorn pops',
  'How geckos climb walls',
  'Why the sky changes color',
  'How a robot knows where it is',
  'What makes a paper airplane fly',
];

export default function CuriosityEngine() {
  const history = useHistory();
  const location = useLocation();
  const learnUrl = useBaseUrl('/curiosity-engine/learn');
  const buildUrl = useBaseUrl('/curiosity-engine/build');
  const investigateUrl = useBaseUrl('/curiosity-engine/investigate');
  const createUrl = useBaseUrl('/curiosity-engine/create');
  const shareUrl = useBaseUrl('/curiosity-engine/share');
  const initialTopic = useMemo(() => {
    const value = new URLSearchParams(location.search).get('topic');
    return value?.trim() || '';
  }, [location.search]);
  const [curiosity, setCuriosity] = useState(initialTopic);
  const [topic, setTopic] = useState(initialTopic);
  const [project, setProject] = useState(null);
  const [surpriseIndex, setSurpriseIndex] = useState(0);
  const [revealRequest, setRevealRequest] = useState(0);
  const resultsHeadingRef = useRef(null);

  useEffect(() => {
    if (!revealRequest || !resultsHeadingRef.current) return;

    const frame = window.requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      resultsHeadingRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      resultsHeadingRef.current.focus({preventScroll: true});
    });

    return () => window.cancelAnimationFrame(frame);
  }, [revealRequest]);

  useEffect(() => {
    if (!initialTopic) return;
    setProject(ensureProjectForTopic(initialTopic));
  }, [initialTopic]);

  function explore(event) {
    event.preventDefault();
    startTopic(curiosity);
  }

  function startTopic(value) {
    const nextTopic = value.trim();
    if (!nextTopic) return;
    setCuriosity(nextTopic);
    setTopic(nextTopic);
    setProject(ensureProjectForTopic(nextTopic));
    setRevealRequest((request) => request + 1);
  }

  function surpriseMe() {
    const idea = SURPRISE_IDEAS[surpriseIndex % SURPRISE_IDEAS.length];
    setSurpriseIndex((index) => index + 1);
    startTopic(idea);
  }

  function choosePath(path) {
    const activeProject = project || ensureProjectForTopic(topic);
    const query = `?topic=${encodeURIComponent(topic)}&project=${encodeURIComponent(activeProject.id)}`;
    if (path.key === 'learn') {
      history.push(`${learnUrl}${query}`);
      return;
    }

    if (path.key === 'build') {
      history.push(`${buildUrl}${query}`);
      return;
    }

    if (path.key === 'investigate') {
      history.push(`${investigateUrl}${query}`);
      return;
    }

    if (path.key === 'create') {
      history.push(`${createUrl}${query}`);
      return;
    }

    if (path.key === 'share') {
      history.push(`${shareUrl}${query}`);
      return;
    }

  }

  return (
    <Layout
      title="The Curiosity Engine™"
      description="Turn a question or interest into five possible learning paths with ChloeLabs.">
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <span className={styles.eyebrow}>The Curiosity Engine™</span>
            <Heading as="h1">The Curiosity Engine™</Heading>
            <p className={styles.intro}>
              What cool thing can you build today?
            </p>

            <form className={styles.form} onSubmit={explore}>
              <label htmlFor="curiosity" className={styles.label}>
                Type anything that makes you curious.
              </label>
              <div className={styles.inputRow}>
                <input
                  id="curiosity"
                  className={styles.input}
                  type="text"
                  value={curiosity}
                  onChange={(event) => setCuriosity(event.target.value)}
                  placeholder="Dogs, space, slime, weather, games…"
                  maxLength={100}
                />
                <button className={styles.launchButton} type="submit">
                  Show me what I can make →
                </button>
              </div>
              <div className={styles.quickIdeas}>
                {QUICK_IDEAS.map(([icon, idea]) => (
                  <button
                    key={idea}
                    onClick={() => startTopic(idea)}
                    type="button">
                    <span aria-hidden="true">{icon}</span>
                    {idea}
                  </button>
                ))}
                <button
                  className={styles.surprise}
                  onClick={surpriseMe}
                  type="button">
                  ✦ Surprise me
                </button>
              </div>
            </form>
            <div className={styles.heroPromise}>
              <span>Pick</span><b>→</b><span>Try</span><b>→</b><span>Change</span><b>→</b><span>Make it yours</span>
            </div>
          </div>
        </section>

        {topic && (
          <section className={styles.results} aria-live="polite">
            <div className="container">
              <Heading
                as="h2"
                className={styles.resultsHeading}
                ref={resultsHeadingRef}
                tabIndex={-1}>
                What could you do with “{topic}”?
              </Heading>
              <p>Tap the one that makes you want to start.</p>

              <div className={styles.pathGrid}>
                {paths.map((path) => (
                  <button
                    key={path.key}
                    type="button"
                    className={`${styles.pathCard} ${styles[path.key]}`}
                    onClick={() => choosePath(path)}
                    aria-label={`${path.verb}: ${path.title}. ${path.prompt(topic)}`}>
                    <small>{path.verb}</small>
                    <span className={styles.pathIcon} aria-hidden="true">{path.icon}</span>
                    <span className={styles.pathTitle}>{path.title}</span>
                    <span className={styles.pathPrompt}>{path.prompt(topic)}</span>
                    <strong className={styles.tryIt}>Try it →</strong>
                  </button>
                ))}
              </div>

              {project && (
                <div className={styles.projectPocket}>
                  <div className={styles.pocketGraphic} aria-hidden="true">
                    <span>?</span>
                    <i />
                    <i />
                    <i />
                  </div>
                  <div>
                    <span>Your idea has a home</span>
                    <Heading as="h3">{project.title}</Heading>
                    <p>
                      Keep your attempts, evidence, creations, and next question
                      together.
                    </p>
                  </div>
                  <button
                    className="button button--secondary"
                    onClick={() => history.push(projectLink(project))}
                    type="button">
                    Open my project
                  </button>
                </div>
              )}

              <section className={styles.levels}>
                <span>Every challenge can grow</span>
                <Heading as="h2">Start simple. Take it as far as you want.</Heading>
                <div>
                  <article><b>1</b><strong>Start</strong><small>Make the first version.</small></article>
                  <article><b>2</b><strong>Improve</strong><small>Change one thing.</small></article>
                  <article><b>3</b><strong>Remix</strong><small>Break a rule on purpose.</small></article>
                  <article><b>★</b><strong>Boss Level</strong><small>Invent your own version.</small></article>
                </div>
              </section>
            </div>
          </section>
        )}

        {!topic && (
          <section className={styles.howItWorks}>
            <div className="container">
              <div className={styles.emptyPlay}>
                <span aria-hidden="true">?</span>
              </div>
              <Heading as="h2">One curiosity. Many things to try.</Heading>
              <p>
                No grades. No streaks. No single right answer. Just a place to
                experiment and make your next version better.
              </p>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
