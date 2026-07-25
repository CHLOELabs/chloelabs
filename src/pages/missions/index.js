import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import MissionCards from '../../components/MissionCards';
import {MISSIONS} from '../../data/missions';
import styles from './index.module.css';

export default function Missions() {
  return (
    <Layout
      title="Missions"
      description="Hands-on technology missions for curious kids ages 7–15.">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className="container">
            <span>Pick a mystery</span>
            <Heading as="h1">Technology makes more sense when you build it.</Heading>
            <p>
              Choose a mission. Try the activity. Test your thinking. Save what
              you discovered.
            </p>
          </div>
        </header>
        <section className={`container ${styles.content}`}>
          <MissionCards missions={MISSIONS} />
        </section>
      </main>
    </Layout>
  );
}
