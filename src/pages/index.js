import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import MissionCards from '@site/src/components/MissionCards';
import {MISSIONS} from '@site/src/data/missions';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>ChloeLabs · A lab for curious minds</span>
          <Heading as="h1">
            Where do your games, photos, and favorite apps actually live?
          </Heading>
          <p>
            Build, test, and explore the technology behind the digital world.
            Interactive missions for curious kids ages 7–15.
          </p>
          <div className={styles.heroActions}>
            <Link className="button button--secondary button--lg" to="/missions">
              Start a Mission
            </Link>
            <a className={styles.howLink} href="#how-it-works">
              See How It Works
            </a>
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
        <section className={styles.missions}>
          <div className="container">
            <div className={styles.missionHeading}>
              <span>Six ways into the digital world</span>
              <Heading as="h2">Choose your first mission.</Heading>
              <p>
                Start with the website mission today. More hands-on missions
                are being prepared.
              </p>
            </div>
            <MissionCards missions={MISSIONS} />
          </div>
        </section>
        <HomepageFeatures id="how-it-works" />
      </main>
    </Layout>
  );
}
