import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const QUICK_STARTS = [
  ['🐾', 'Animals'],
  ['🌋', 'Volcanoes'],
  ['🤖', 'Robots'],
  ['🌊', 'The ocean'],
  ['🪐', 'Space'],
];

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>ChloeLabs · A lab for curious minds</span>
          <Heading as="h1">What cool thing can you build today?</Heading>
          <p>
            Pick something you wonder about. Then make, test, change, and share
            something that is truly yours.
          </p>
          <Link
            className="button button--secondary button--lg"
            to="/curiosity-engine">
            Start with my own idea
          </Link>
          <div className={styles.quickStarts} aria-label="Quick-start topics">
            {QUICK_STARTS.map(([icon, topic]) => (
              <Link
                key={topic}
                to={`/curiosity-engine?topic=${encodeURIComponent(topic)}`}>
                <span aria-hidden="true">{icon}</span>
                {topic}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.makerScene} aria-label="A playful idea machine turning curiosity into projects">
          <span className={styles.ideaBubble}>What if…?</span>
          <div className={styles.machine}>
            <span>?</span>
            <strong>TRY IT</strong>
            <i />
            <i />
            <i />
          </div>
          <div className={styles.outputCards}>
            <span>MAKE</span>
            <span>TEST</span>
            <span>REMIX</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Turn curiosity into real projects through making, testing, creativity, and reflection.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
