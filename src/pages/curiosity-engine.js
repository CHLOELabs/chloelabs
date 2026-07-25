import {useEffect, useMemo, useRef, useState} from 'react';
import {useHistory, useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './curiosity-engine.module.css';

const paths = [
  {
    key: 'learn',
    icon: '📖',
    title: 'Learn',
    prompt: (topic) => `Discover three surprising facts about ${topic} and explain one in your own words.`,
  },
  {
    key: 'build',
    icon: '🛠️',
    title: 'Build',
    prompt: (topic) => `Make a model, game, diagram, or small tool that helps someone understand ${topic}.`,
  },
  {
    key: 'investigate',
    icon: '🔎',
    title: 'Investigate',
    prompt: (topic) => `Choose one question about ${topic}, collect evidence, and record what you notice.`,
  },
  {
    key: 'create',
    icon: '🎨',
    title: 'Create',
    prompt: (topic) => `Turn what fascinates you about ${topic} into a story, illustration, video, or exhibit.`,
  },
  {
    key: 'share',
    icon: '💬',
    title: 'Share',
    prompt: (topic) => `Teach someone one idea about ${topic} using an explanation they can understand.`,
  },
];

export default function CuriosityEngine() {
  const history = useHistory();
  const location = useLocation();
  const learnUrl = useBaseUrl('/curiosity-engine/learn');
  const initialTopic = useMemo(() => {
    const value = new URLSearchParams(location.search).get('topic');
    return value?.trim() || '';
  }, [location.search]);
  const [curiosity, setCuriosity] = useState(initialTopic);
  const [topic, setTopic] = useState(initialTopic);
  const [selectedPath, setSelectedPath] = useState(null);
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

  function explore(event) {
    event.preventDefault();
    const nextTopic = curiosity.trim();
    if (!nextTopic) return;
    setTopic(nextTopic);
    setSelectedPath(null);
    setRevealRequest((request) => request + 1);
  }

  function choosePath(path) {
    if (path.key === 'learn') {
      history.push(`${learnUrl}?topic=${encodeURIComponent(topic)}`);
      return;
    }

    setSelectedPath(path.key);
  }

  return (
    <Layout
      title="The Curiosity Engine™"
      description="Turn a question or interest into five possible learning paths with ChloeLabs.">
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <span className={styles.eyebrow}>ChloeLabs prototype</span>
            <Heading as="h1">The Curiosity Engine™</Heading>
            <p className={styles.intro}>
              Start with something that makes you wonder. ChloeLabs will help
              you find a way to learn, build, investigate, create, or share.
            </p>

            <form className={styles.form} onSubmit={explore}>
              <label htmlFor="curiosity" className={styles.label}>
                What are you curious about today?
              </label>
              <div className={styles.inputRow}>
                <input
                  id="curiosity"
                  className={styles.input}
                  type="text"
                  value={curiosity}
                  onChange={(event) => setCuriosity(event.target.value)}
                  placeholder="Try dogs, volcanoes, space, or anything else…"
                  maxLength={100}
                />
                <button className="button button--secondary button--lg" type="submit">
                  Start exploring
                </button>
              </div>
            </form>
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
                Five ways to explore “{topic}”
              </Heading>
              <p>Choose the path that sounds most exciting right now.</p>

              <div className={styles.pathGrid}>
                {paths.map((path) => (
                  <button
                    key={path.key}
                    type="button"
                    className={`${styles.pathCard} ${selectedPath === path.key ? styles.selected : ''}`}
                    onClick={() => choosePath(path)}
                    aria-pressed={selectedPath === path.key}>
                    <span className={styles.pathIcon} aria-hidden="true">{path.icon}</span>
                    <span className={styles.pathTitle}>{path.title}</span>
                    <span className={styles.pathPrompt}>{path.prompt(topic)}</span>
                  </button>
                ))}
              </div>

              {selectedPath && (
                <div className={styles.nextStep}>
                  <Heading as="h3">You found a direction</Heading>
                  <p>
                    Next, ChloeLabs will turn this idea into a project plan with
                    a goal, milestones, a lab notebook, and reflection prompts.
                  </p>
                  <p className={styles.prototypeNote}>
                    This is an early prototype. Project-plan generation is the next feature being tested.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {!topic && (
          <section className={styles.howItWorks}>
            <div className="container">
              <Heading as="h2">One curiosity. Many possibilities.</Heading>
              <p>
                The engine does not answer the question for you. It helps you
                choose something meaningful to do with it.
              </p>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
