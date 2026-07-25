import {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {readNotebook} from '../lib/notebookStorage';
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
  const [notebookEntries, setNotebookEntries] = useState([]);

  useEffect(() => {
    const refresh = () => {
      setProjects(readProjects());
      setNotebookEntries(readNotebook());
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('chloelabs:projects-changed', refresh);
    window.addEventListener('chloelabs:notebook-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('chloelabs:projects-changed', refresh);
      window.removeEventListener('chloelabs:notebook-changed', refresh);
    };
  }, []);

  return (
    <Layout
      title="My Projects"
      description="See how each question grew through attempts, evidence, changes, and new ideas.">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div>
              <span>Made by me</span>
              <Heading as="h1">The story of each project</Heading>
              <p>
                See how each question grew through attempts, evidence,
                changes, and new ideas.
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
                  <ProjectCard
                    entries={entriesForProject(project, notebookEntries)}
                    index={index}
                    key={project.id}
                    project={project}
                  />
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

          <div className={styles.notebookLink}>
            <div>
              <strong>My Lab Notebook keeps the process.</strong>
              <small>My Projects shows the story.</small>
            </div>
            <Link to="/my-lab-notebook">Open My Lab Notebook →</Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function ProjectCard({entries, index, project}) {
  const artifacts = Array.isArray(project.evidence) ? project.evidence : [];
  const paths = new Set(entries.map((entry) => entry.notebookPath));
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
          <span><b>{paths.size}</b> {paths.size === 1 ? 'path' : 'paths'} explored</span>
          <span><b>{project.challengeIdeas?.length || 0}</b> next-version ideas</span>
        </div>
        <div className={styles.projectUpdate}>
          <span>Latest update</span>
          <p>{new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</p>
        </div>
        {project.nextAction && (
          <div className={styles.projectUpdate}>
            <span>Next action</span>
            <p>{project.nextAction}</p>
          </div>
        )}
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

function entriesForProject(project, entries) {
  const topic = String(project.topic || '').trim().toLocaleLowerCase();
  return entries.filter(
    (entry) =>
      entry.parentProjectId === project.id ||
      (!entry.parentProjectId &&
        String(entry.topic || '').trim().toLocaleLowerCase() === topic),
  );
}

function coverIcon(index) {
  return ['?', '◆', '⌕', '★', '◉'][index % 5];
}
