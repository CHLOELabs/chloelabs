import {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {PATHS, TopicProgress} from '../components/CuriosityJourney';
import EvidencePlayground from '../components/EvidencePlayground';
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

const COMPLETION_STEPS = [
  {id: 'question', icon: '?', title: 'My question is clear', description: 'I can explain what I wanted to find out or make.', automatic: true},
  {id: 'action', icon: '⚡', title: 'I did something real', description: 'I observed, tested, built, made, interviewed, or analyzed.'},
  {id: 'record', icon: '✎', title: 'I recorded what happened', description: 'My notes describe what I actually did—not what I planned.'},
  {id: 'evidence', icon: '◆', title: 'I have evidence or an artifact', description: 'I added proof of something I noticed, measured, changed, or made.', automatic: true},
  {id: 'reflection', icon: '↻', title: 'I reflected in my own words', description: 'I wrote what changed, surprised me, failed, or worked.'},
  {id: 'nextQuestion', icon: '→', title: 'I found my next question', description: 'This project gave me something new to wonder about.', automatic: true},
];

const PROJECT_STORY_STEPS = [
  ['question', 'Started with a question'],
  ['goal', 'Chose a goal'],
  ['tried', 'Tried something'],
  ['evidence', 'Saved evidence'],
  ['reflected', 'Reflected'],
  ['nextQuestion', 'Found a next question'],
  ['finished', 'Finished the project'],
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
  const completionState = useMemo(
    () => ({
      question: Boolean(project?.question?.trim()),
      action: Boolean(project?.completion?.action),
      record: Boolean(project?.completion?.record),
      evidence: Boolean(project?.evidence?.length),
      reflection: Boolean(project?.completion?.reflection),
      nextQuestion: Boolean(project?.nextQuestion?.trim()),
    }),
    [project],
  );
  const completionCount = Object.values(completionState).filter(Boolean).length;
  const readyToFinish = completionCount === COMPLETION_STEPS.length;

  function change(field, value) {
    setProject((current) => ({
      ...current,
      [field]: value,
      ...((field === 'question' || field === 'nextQuestion') &&
      !value.trim() &&
      current.finishedAt
        ? {finishedAt: null, status: 'reflecting'}
        : {}),
      ...(field === 'status' && current.finishedAt
        ? {finishedAt: null}
        : {}),
    }));
    setMessage('');
  }

  function projectChanges(overrides = {}) {
    return {
      title: project.title.trim() || `My ${project.topic} project`,
      question: project.question.trim(),
      why: project.why.trim(),
      goal: project.goal.trim(),
      nextAction: project.nextAction.trim(),
      nextQuestion: project.nextQuestion?.trim() || '',
      completion: project.completion || {},
      evidence: project.evidence || [],
      finishedAt: project.finishedAt || null,
      status: project.status,
      ...overrides,
    };
  }

  function saveProject() {
    if (!project) return;
    const saved = updateProject(project.id, projectChanges());
    setProject(saved);
    setMessage('Project workspace saved privately in this browser.');
  }

  function toggleCompletion(id) {
    const nextCompletion = {
      ...(project.completion || {}),
      [id]: !project.completion?.[id],
    };
    const saved = updateProject(
      project.id,
      projectChanges({
        completion: nextCompletion,
        ...(project.finishedAt
          ? {finishedAt: null, status: 'reflecting'}
          : {}),
      }),
    );
    setProject(saved);
    setMessage('Finish-line progress saved in this browser.');
  }

  function finishProject() {
    if (!readyToFinish) return;
    const saved = updateProject(
      project.id,
      projectChanges({
        finishedAt: new Date().toISOString(),
        status: 'completed',
      }),
    );
    setProject(saved);
    setMessage('Project finished! Your work is still private to this browser.');
  }

  function saveArtifacts(evidence) {
    try {
      const saved = updateProject(
        project.id,
        projectChanges({
          evidence,
          ...(project.finishedAt
            ? {finishedAt: null, status: 'reflecting'}
            : {}),
        }),
      );
      setProject(saved);
      setMessage(
        evidence.length
          ? 'Evidence board saved privately in this browser.'
          : 'The evidence board is empty.',
      );
    } catch {
      setMessage(
        'This browser could not save that artifact. Try a smaller sketch or remove an older card.',
      );
    }
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
      mode: project.learnerMode || 'show',
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

          <section className={styles.storySoFar}>
            <div>
              <span className={styles.sectionLabel}>Longitudinal record</span>
              <Heading as="h2">Project story so far</Heading>
              <p>Only the steps supported by your saved work are marked complete.</p>
            </div>
            <ol>
              {PROJECT_STORY_STEPS.map(([id, label], index) => {
                const complete = storyStepComplete(
                  id,
                  project,
                  projectEntries,
                );
                return (
                  <li className={complete ? styles.storyComplete : ''} key={id}>
                    <span>{complete ? '✓' : index + 1}</span>
                    <div>
                      <strong>{label}</strong>
                      <small>
                        {complete
                          ? storyStepDetail(id, project, projectEntries)
                          : 'Optional next step'}
                      </small>
                    </div>
                  </li>
                );
              })}
            </ol>
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

          <EvidencePlayground
            artifacts={project.evidence || []}
            onChange={saveArtifacts}
            topic={project.topic}
          />

          <section className={styles.finishLine}>
            <div className={styles.finishHeading}>
              <div>
                <span className={styles.sectionLabel}>Comet’s finish trail</span>
                <Heading as="h2">
                  {project.finishedAt
                    ? 'You finished this project!'
                    : 'What does “finished” mean?'}
                </Heading>
                <p>
                  A finished project is not five clicked paths. It is real work
                  you can explain and support.
                </p>
              </div>
              <div
                className={styles.finishMeter}
                aria-label={`${completionCount} of ${COMPLETION_STEPS.length} finish steps complete`}>
                <strong>
                  {completionCount}/{COMPLETION_STEPS.length}
                </strong>
                <span>ready</span>
              </div>
            </div>

            <div className={styles.trail} aria-label="Project finish checklist">
              {COMPLETION_STEPS.map((step, index) => {
                const complete = completionState[step.id];
                return (
                  <button
                    aria-pressed={complete}
                    className={complete ? styles.trailComplete : ''}
                    disabled={step.automatic}
                    key={step.id}
                    onClick={() => toggleCompletion(step.id)}
                    type="button">
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <span className={styles.stepIcon} aria-hidden="true">
                      {complete ? '✓' : step.icon}
                    </span>
                    <strong>{step.title}</strong>
                    <small>{step.description}</small>
                    {step.automatic && (
                      <em>
                        {step.id === 'question'
                          ? 'Complete when your main question is saved.'
                          : step.id === 'evidence'
                            ? 'Complete when your evidence board has a card.'
                            : 'Complete when your next question is saved.'}
                      </em>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={styles.nextQuestionCard}>
              <span aria-hidden="true">?</span>
              <label>
                <strong>What do you wonder now?</strong>
                <small>
                  Good projects rarely end curiosity. They make the next
                  question sharper.
                </small>
                <textarea
                  maxLength={300}
                  onChange={(event) =>
                    change('nextQuestion', event.target.value)
                  }
                  placeholder={`After this project about ${project.topic}, I now wonder…`}
                  rows={3}
                  value={project.nextQuestion || ''}
                />
              </label>
            </div>

            {project.finishedAt ? (
              <div className={styles.finishedBanner} role="status">
                <span aria-hidden="true">★</span>
                <div>
                  <strong>Finished {formatDate(project.finishedAt)}</strong>
                  <p>
                    You did the work, kept a record, and decided what comes
                    next. That is a project—not just an AI response.
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.finishAction}>
                <div>
                  <strong>
                    {readyToFinish
                      ? 'Your project is ready for the finish flag.'
                      : `${COMPLETION_STEPS.length - completionCount} finish ${COMPLETION_STEPS.length - completionCount === 1 ? 'step' : 'steps'} left.`}
                  </strong>
                  <small>
                    Only you can decide whether the evidence and reflection are
                    honest and complete.
                  </small>
                </div>
                <button
                  className="button button--primary button--lg"
                  disabled={!readyToFinish}
                  onClick={finishProject}
                  type="button">
                  Mark my project finished
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}

function storyStepComplete(id, project, entries) {
  return {
    question: Boolean(project.question?.trim()),
    goal: Boolean(project.goal?.trim()),
    tried: entries.length > 0 || Boolean(project.completion?.action),
    evidence: Boolean(project.evidence?.length),
    reflected: Boolean(project.completion?.reflection),
    nextQuestion: Boolean(project.nextQuestion?.trim()),
    finished: Boolean(project.finishedAt),
  }[id];
}

function storyStepDetail(id, project, entries) {
  return {
    question: project.question,
    goal: project.goal,
    tried: entries.length
      ? `${entries.length} saved notebook ${entries.length === 1 ? 'entry' : 'entries'}`
      : 'Action recorded',
    evidence: `${project.evidence.length} evidence ${project.evidence.length === 1 ? 'item' : 'items'}`,
    reflected: 'Reflection saved',
    nextQuestion: project.nextQuestion,
    finished: `Finished ${formatDate(project.finishedAt)}`,
  }[id];
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
