import {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {getMission} from '../data/missions';
import {readMissionAttempts} from '../lib/missionStorage';
import {readProjects, projectLink} from '../lib/projectStorage';
import styles from './my-projects.module.css';

const STATUS = {
  exploring: 'Exploring',
  active: 'In progress',
  reflecting: 'Reflecting',
  'ready-to-share': 'Ready to share',
  completed: 'Finished',
};

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [missionAttempts, setMissionAttempts] = useState([]);

  useEffect(() => {
    const refresh = () => {
      setProjects(readProjects());
      setMissionAttempts(readMissionAttempts());
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('chloelabs:projects-changed', refresh);
    window.addEventListener('chloelabs:mission-attempts-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('chloelabs:projects-changed', refresh);
      window.removeEventListener('chloelabs:mission-attempts-changed', refresh);
    };
  }, []);

  return (
    <Layout
      title="My Projects"
      description="A private visual gallery of ChloeLabs projects, evidence, and next versions.">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div>
              <span>Made by me</span>
              <Heading as="h1">My Project Gallery</Heading>
              <p>
                Questions I followed. Things I tried. Evidence I kept. Ideas I
                want to make better.
              </p>
            </div>
            <div className={styles.galleryScene} aria-hidden="true">
              <i />
              <i />
              <i />
              <strong>MY WORK</strong>
            </div>
          </div>
        </header>

        <div className={`container ${styles.content}`}>
          <aside className={styles.localNotice}>
            <span aria-hidden="true">🔒</span>
            <p>
              <strong>Private to this browser.</strong> Nothing in this gallery
              is public or sent to AI.
            </p>
          </aside>

          {projects.length ? (
            <>
              <div className={styles.heading}>
                <div>
                  <span>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
                  <Heading as="h2">Look how your ideas changed.</Heading>
                </div>
                <Link className="button button--primary" to="/curiosity-engine">
                  Start another curiosity
                </Link>
              </div>
              <div className={styles.grid}>
                {projects.map((project, index) => (
                  <ProjectCard index={index} key={project.id} project={project} />
                ))}
              </div>
            </>
          ) : (
            <section className={styles.empty}>
              <div aria-hidden="true">?</div>
              <Heading as="h2">Your first project starts with “What if?”</Heading>
              <p>
                Pick something curious. Your attempts and evidence will build
                this gallery automatically.
              </p>
              <Link className="button button--primary button--lg" to="/curiosity-engine">
                Find something to try
              </Link>
            </section>
          )}

          {missionAttempts.length > 0 && (
            <section className={styles.missionAttempts}>
              <div className={styles.missionAttemptsHeading}>
                <div>
                  <span>Technology missions</span>
                  <Heading as="h2">My mission attempts</Heading>
                </div>
                <Link to="/missions">Try another mission →</Link>
              </div>
              <div className={styles.attemptGrid}>
                {missionAttempts
                  .slice()
                  .reverse()
                  .map((attempt) => {
                    const mission = getMission(attempt.missionId);
                    if (!mission) return null;
                    return (
                      <article key={attempt.id}>
                        <span>Attempt {attempt.attemptNumber}</span>
                        <Heading as="h3">{mission.title}</Heading>
                        <p>
                          {attempt.caption ||
                            attempt.result ||
                            mission.outcome}
                        </p>
                        <small>
                          Saved {new Date(attempt.date).toLocaleDateString()}
                        </small>
                        <Link
                          className="button button--secondary button--sm"
                          to={`/missions/mission?id=${mission.id}`}>
                          Try this mission again
                        </Link>
                      </article>
                    );
                  })}
              </div>
            </section>
          )}

          <div className={styles.notebookLink}>
            <div>
              <strong>Looking for every note and saved path?</strong>
              <small>The Lab Notebook keeps the detailed record.</small>
            </div>
            <Link to="/my-lab-notebook">Open My Lab Notebook →</Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function ProjectCard({index, project}) {
  const artifacts = Array.isArray(project.evidence) ? project.evidence : [];
  const sketch = artifacts.find((artifact) => artifact.type === 'sketch' && artifact.sketch);
  const latestChallenge = Array.isArray(project.challengeIdeas)
    ? project.challengeIdeas.at(-1)
    : null;
  return (
    <article className={`${styles.card} ${project.finishedAt ? styles.finished : ''}`}>
      <div className={styles.cover}>
        {sketch ? (
          <img alt={`A sketch from ${project.title}`} src={sketch.sketch} />
        ) : (
          <div className={styles.coverPattern}>
            <span>{coverIcon(index)}</span>
            <i />
            <i />
            <i />
          </div>
        )}
        <span className={styles.status}>
          {project.finishedAt ? '★ Finished' : STATUS[project.status] || 'Exploring'}
        </span>
      </div>
      <div className={styles.cardBody}>
        <small>{project.topic}</small>
        <Heading as="h3">{project.title}</Heading>
        <p>{project.question || 'This project still needs its main question.'}</p>
        <div className={styles.facts}>
          <span><b>{artifacts.length}</b> evidence {artifacts.length === 1 ? 'card' : 'cards'}</span>
          <span><b>{project.challengeIdeas?.length || 0}</b> next-version ideas</span>
        </div>
        {latestChallenge && (
          <div className={styles.latest}>
            <span>My next version</span>
            <p>{latestChallenge.idea}</p>
          </div>
        )}
        <Link className="button button--secondary" to={projectLink(project)}>
          Open this project
        </Link>
      </div>
    </article>
  );
}

function coverIcon(index) {
  return ['?', '◆', '⌕', '★', '◉'][index % 5];
}
