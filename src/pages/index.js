import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const PROJECT_STARTERS = [
  {
    title: 'Where does Minecraft save your world?',
    hook: 'Trace what happens when a game remembers what you built.',
    mode: 'Ages 7–15',
    path: 'Learn or Build',
    category: 'Cloud and internet',
  },
  {
    title: 'What happens when you upload a photo?',
    hook: 'Follow a photo from your device to the internet and back again.',
    mode: 'Ages 9–15',
    path: 'Investigate or Create',
    category: 'Cloud and data',
  },
  {
    title: 'Can you make a weather station better over time?',
    hook: 'Collect observations, improve the design, and compare what changes.',
    mode: 'Ages 7–15',
    path: 'Build or Investigate',
    category: 'Earth and data',
  },
];

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>ChloeLabs · A lab for curious minds</span>
          <Heading as="h1">Turn one question into a project that grows with you.</Heading>
          <p>
            Choose something you wonder about. Learn, build, investigate,
            create, or share. Save what you try, collect evidence, and watch
            your ideas change over time.
          </p>
          <div className={styles.heroActions}>
            <Link className="button button--secondary button--lg" to="/curiosity-engine">
              Start with my own question
            </Link>
            <a className={styles.howLink} href="#project-starters">
              Give me an idea
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
        <HomepageFeatures id="how-it-works" />

        <section className={styles.example}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <span>Example only · not added to My Projects</span>
              <Heading as="h2">See how one question becomes a project</Heading>
            </div>
            <div className={styles.exampleCard}>
              <div className={styles.exampleIntro}>
                <span>Example project</span>
                <Heading as="h3">Where does my Minecraft world go when I save it?</Heading>
                <p>
                  <strong>Starting question:</strong> Where is a game world
                  stored, and how can I open it again later?
                </p>
              </div>
              <ol className={styles.storyTimeline}>
                <StoryStep
                  label="Question"
                  title="First idea"
                  text="The world might live inside the computer or game console."
                />
                <StoryStep
                  label="First attempt"
                  title="Learn and build"
                  text="Games can save data on a device or remotely on a server. The first diagram connected the player, device, internet, server, and storage."
                />
                <StoryStep
                  label="Evidence"
                  title="Keep what happened"
                  text="A first diagram, revised diagram, short observation, and comparison between local and online saving."
                />
                <StoryStep
                  label="Revision"
                  title="What changed"
                  text="At first, “the cloud” seemed like one place. Later, the project showed files moving among devices, servers, and storage systems."
                />
                <StoryStep
                  label="Next question"
                  title="Keep going"
                  text="What happens if millions of players try to save at the same time?"
                />
              </ol>
              <aside className={styles.nextVersion}>
                <strong>Next version</strong>
                <p>
                  Add multiplayer players and show how their actions reach the
                  same saved world.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.starters} id="project-starters">
          <div className="container">
            <div className={styles.sectionHeading}>
              <span>Project Starters</span>
              <Heading as="h2">Need something to wonder about?</Heading>
              <p>
                Pick a starting point, then shape it into a project that is
                yours.
              </p>
            </div>
            <div className={styles.starterGrid}>
              {PROJECT_STARTERS.map((starter, index) => (
                <article key={starter.title}>
                  <span className={styles.starterNumber}>0{index + 1}</span>
                  <small>{starter.category}</small>
                  <Heading as="h3">{starter.title}</Heading>
                  <p>{starter.hook}</p>
                  <dl>
                    <div><dt>Suggested mode</dt><dd>{starter.mode}</dd></div>
                    <div><dt>First path</dt><dd>{starter.path}</dd></div>
                  </dl>
                  <Link
                    className="button button--secondary"
                    to={`/curiosity-engine?topic=${encodeURIComponent(starter.title)}`}>
                    Start this project
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.portfolioGuide}>
          <div className="container">
            <div>
              <span>My Lab Notebook</span>
              <Heading as="h2">The detailed record of your work</Heading>
              <p>
                Every saved note, experiment, build, discovery, creation, and
                sharing plan lives here.
              </p>
              <Link to="/my-lab-notebook">Open the working record →</Link>
            </div>
            <div>
              <span>My Projects</span>
              <Heading as="h2">The story of each project</Heading>
              <p>
                See how each question grew through attempts, evidence, changes,
                and new ideas.
              </p>
              <Link to="/my-projects">Open the project portfolio →</Link>
            </div>
          </div>
        </section>

        <section className={styles.founder}>
          <div className="container">
            <div className={styles.founderMark} aria-hidden="true">AT</div>
            <div>
              <span>Created by Amanda Tan</span>
              <p>
                Amanda is an AI, cloud, and research-computing education leader
                with more than a decade of experience turning complex
                technology into hands-on learning. ChloeLabs was inspired by
                her daughter Chloe and built to help curious children develop
                ideas into meaningful projects over time.
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function StoryStep({label, title, text}) {
  return (
    <li>
      <span>{label}</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </li>
  );
}
