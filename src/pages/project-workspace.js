import {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {PATHS, TopicProgress} from '../components/CuriosityJourney';
import {readNotebook} from '../lib/notebookStorage';
import {
  ensureProjectForTopic,
  readProject,
  updateProject,
} from '../lib/projectStorage';
import styles from './project-workspace.module.css';

const STATUS_OPTIONS = [
  ['exploring', 'Exploring', 'I am finding my direction.'],
  ['active', 'In progress', 'I am doing the project work.'],
  ['reflecting', 'Reflecting', 'I am making sense of what happened.'],
  ['ready-to-share', 'Ready to share', 'I am preparing the story of my work.'],
];

export default function ProjectWorkspace() {
  const location = useLocation();
  const requestedId = useMemo(
    () => new URLSearchParams(location.search).get('project') || '',
    [location.search],
  );
  const requestedTopic = useMemo(
    () =>
      new URLSearchParams(location.search).get('topic')?.trim() ||
      'something interesting',
    [location.search],
  );
  const [project, setProject] = useState(null);
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const current =
      (requestedId && readProject(requestedId)) ||
      ensureProjectForTopic(requestedTopic);
    setProject(current);
  }, [requestedId, requestedTopic]);

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

  const projectEntries = useMemo(() => {
    if (!project) return [];
    const topic = project.topic.trim().toLocaleLowerCase();
    return entries.filter(
      (entry) =>
        entry.parentProjectId === project.id ||
        (!entry.parentProjectId &&
          String(entry.topic || '').trim().toLocaleLowerCase() === topic),
    );
  }, [entries, project]);

  const completedPaths = useMemo(
    () => new Set(projectEntries.map((entry) => entry.notebookPath)),
    [projectEntries],
  );

  function change(field, value) {
    setProject((current) => ({...current, [field]: value}));
    setMessage('');
  }

  function saveProject() {
    if (!project) return;
    const saved = updateProject(project.id, {
      title: project.title.trim() || `My ${project.topic} project`,
      question: project.question.trim(),
      why: project.why.trim(),
      goal: project.goal.trim(),
      nextAction: project.nextAction.trim(),
      status: project.status,
    });
    setProject(saved);
    setMessage('Project workspace saved privately in this browser.');
  }

  if (!project) {
    return (
      <Layout title="Project Workspace">
        <main className={styles.loading}>Opening your project workspace…</main>
      </Layout>
    );
  }

  const pathQuery = (path) => {
    const params = new URLSearchParams({
      topic: project.topic,
      project: project.id,
      from: 'workspace',
    });
    return `/curiosity-engine/${path}?${params.toString()}`;
  };

  return (
    <Layout
      title={project.title}
      description={`A private ChloeLabs project workspace for ${project.topic}.`}>
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div>
              <Link className={styles.back} to="/my-lab-notebook">
                ← My Lab Notebook
              </Link>
              <span className={styles.eyebrow}>One curiosity · one project</span>
              <Heading as="h1">{project.title}</Heading>
              <p>
                Keep your question, choices, notebook work, and next action
                connected in one place.
              </p>
            </div>
            <ProjectOrbit completedPaths={completedPaths} />
          </div>
        </header>

        <div className={`container ${styles.content}`}>
          <aside className={styles.localNotice}>
            <span aria-hidden="true">🔒</span>
            <p>
              <strong>Private to this browser.</strong> This workspace and its
              notebook entries are not sent to AI or published.
            </p>
          </aside>

          {message && (
            <p className={styles.message} role="status">
              {message}
            </p>
          )}

          <section className={styles.overview}>
            <div>
              <span className={styles.sectionLabel}>Project progress</span>
              <Heading as="h2">{completedPaths.size} paths explored</Heading>
              <p>
                Choose only the paths that help this project. You do not need
                all five.
              </p>
            </div>
            <TopicProgress
              completedPaths={completedPaths}
              topic={project.topic}
            />
          </section>

          <div className={styles.workspaceGrid}>
            <section className={styles.identityCard}>
              <span className={styles.sectionLabel}>Make it yours</span>
              <Heading as="h2">Project compass</Heading>
              <label>
                Project name
                <input
                  maxLength={100}
                  onChange={(event) => change('title', event.target.value)}
                  value={project.title}
                />
              </label>
              <label>
                My main question
                <textarea
                  maxLength={300}
                  onChange={(event) => change('question', event.target.value)}
                  placeholder={`What do I really want to find out about ${project.topic}?`}
                  rows={3}
                  value={project.question}
                />
              </label>
              <label>
                Why I chose this
                <textarea
                  maxLength={400}
                  onChange={(event) => change('why', event.target.value)}
                  placeholder="This matters to me because…"
                  rows={3}
                  value={project.why}
                />
              </label>
              <label>
                What I want to accomplish
                <textarea
                  maxLength={400}
                  onChange={(event) => change('goal', event.target.value)}
                  placeholder="By the end, I want to…"
                  rows={3}
                  value={project.goal}
                />
              </label>
              <button
                className="button button--primary button--lg"
                onClick={saveProject}
                type="button">
                Save project compass
              </button>
            </section>

            <aside className={styles.actionColumn}>
              <section className={styles.statusCard}>
                <span className={styles.sectionLabel}>Where I am now</span>
                <div className={styles.statusChoices}>
                  {STATUS_OPTIONS.map(([value, label, description]) => (
                    <button
                      aria-pressed={project.status === value}
                      className={
                        project.status === value ? styles.statusSelected : ''
                      }
                      key={value}
                      onClick={() => change('status', value)}
                      type="button">
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </button>
                  ))}
                </div>
              </section>

              <section className={styles.nextCard}>
                <span aria-hidden="true">→</span>
                <div>
                  <span className={styles.sectionLabel}>My next action</span>
                  <textarea
                    maxLength={250}
                    onChange={(event) =>
                      change('nextAction', event.target.value)
                    }
                    placeholder="The next small thing I will do is…"
                    rows={4}
                    value={project.nextAction}
                  />
                  <button
                    className="button button--secondary"
                    onClick={saveProject}
                    type="button">
                    Save next action
                  </button>
                </div>
              </section>
            </aside>
          </div>

          <section className={styles.pathSection}>
            <span className={styles.sectionLabel}>Choose what helps</span>
            <Heading as="h2">Project paths</Heading>
            <p>
              Each saved path becomes part of this project’s notebook story.
            </p>
            <div className={styles.pathGrid}>
              {PATHS.map((path) => {
                const complete = completedPaths.has(path.id);
                return (
                  <Link
                    className={complete ? styles.pathComplete : ''}
                    key={path.id}
                    to={pathQuery(path.id)}>
                    <span aria-hidden="true">{complete ? '✓' : path.icon}</span>
                    <strong>{path.label}</strong>
                    <small>
                      {complete ? 'Open saved work' : pathDescription(path.id)}
                    </small>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className={styles.activitySection}>
            <div className={styles.activityHeading}>
              <div>
                <span className={styles.sectionLabel}>Project record</span>
                <Heading as="h2">Notebook activity</Heading>
              </div>
              <Link to="/my-lab-notebook">Open full notebook →</Link>
            </div>
            {projectEntries.length ? (
              <ol className={styles.timeline}>
                {projectEntries.map((entry) => (
                  <li key={`${entry.notebookPath}-${entry.notebookId}`}>
                    <span>{PATHS.find((path) => path.id === entry.notebookPath)?.icon}</span>
                    <div>
                      <strong>{entryTitle(entry)}</strong>
                      <small>
                        {entry.notebookLabel} · {formatDate(entry.savedAt)}
                      </small>
                    </div>
                    <Link
                      to={`${pathQuery(entry.notebookPath)}&resume=${encodeURIComponent(entry.notebookId)}`}>
                      Continue
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <div className={styles.emptyActivity}>
                <span aria-hidden="true">✦</span>
                <p>
                  Your project record will grow when you save work from a path.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}

function ProjectOrbit({completedPaths}) {
  return (
    <div className={styles.orbit} aria-label={`${completedPaths.size} project paths explored`}>
      <div className={styles.orbitCore}>
        <span>MY</span>
        <strong>PROJECT</strong>
      </div>
      {PATHS.map((path, index) => (
        <span
          className={`${styles.orbitPath} ${completedPaths.has(path.id) ? styles.orbitComplete : ''}`}
          key={path.id}
          style={{'--orbit-index': index}}>
          {completedPaths.has(path.id) ? '✓' : path.icon}
        </span>
      ))}
    </div>
  );
}

function pathDescription(path) {
  return {
    learn: 'Build the understanding you need.',
    build: 'Make and test something real.',
    investigate: 'Collect and interpret evidence.',
    create: 'Shape an original artifact.',
    share: 'Prepare your work for an audience.',
  }[path];
}

function entryTitle(entry) {
  return (
    entry.customTitle ||
    entry.question ||
    entry.project?.title ||
    entry.idea?.title ||
    `${entry.notebookLabel} ${entry.topic}`
  );
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Saved recently';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
