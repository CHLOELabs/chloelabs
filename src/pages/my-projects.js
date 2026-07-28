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
      description="See each question, photo, attempt, and next idea together.">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div>
              <span>Made by me</span>
              <Heading as="h1">Look what you tried.</Heading>
              <p>Question. Photo. Attempt. Next question.</p>
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
                  <Heading as="h2">Your project stories</Heading>
                </div>
                <Link className="button button--primary" to="/curiosity-engine">
                  Start another challenge
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
                Pick a challenge. Your photos and attempts will build this
                gallery automatically.
              </p>
              <Link className="button button--primary button--lg" to="/curiosity-engine">
                Find a challenge
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
  const photo = artifacts.find((artifact) => artifact.photo || artifact.sketch);
  const latestChallenge = Array.isArray(project.challengeIdeas)
    ? project.challengeIdeas.at(-1)
    : null;
  const latestEntry = entries[0];
  const attempt = getAttempt(project, latestEntry);
  const nextQuestion =
    project.nextQuestion ||
    latestChallenge?.idea ||
    'What could you change and try next?';
  return (
    <article className={`${styles.card} ${project.finishedAt ? styles.finished : ''}`}>
      <div className={styles.cover}>
        {photo ? (
          <img
            alt={`A saved attempt from ${project.title}`}
            src={photo.photo || photo.sketch}
          />
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
        <div className={styles.storyFlow}>
          <StoryBeat
            icon="?"
            label="Question"
            value={project.question || project.topic || 'What will you try?'}
          />
          <StoryBeat
            icon="📸"
            label="Photo"
            value={photo ? 'Attempt captured' : 'Add one in My Lab Notebook'}
          />
          <StoryBeat icon="◆" label="Attempt" value={attempt} />
          <StoryBeat icon="→" label="Next Question" value={nextQuestion} />
        </div>
        <p className={styles.projectDate}>
          Updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
          {paths.size ? ` · ${paths.size} quest ${paths.size === 1 ? 'path' : 'paths'}` : ''}
        </p>
        <Link className="button button--secondary" to={projectLink(project)}>
          Keep building →
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

function StoryBeat({icon, label, value}) {
  return (
    <div>
      <span aria-hidden="true">{icon}</span>
      <small>{label}</small>
      <p>{value}</p>
    </div>
  );
}

function getAttempt(project, entry) {
  return (
    project.nextAction ||
    entry?.improvement ||
    entry?.claim ||
    entry?.thinkingChange ||
    entry?.reflection ||
    entry?.captureSentence ||
    'Make a first version and see what happens.'
  );
}
