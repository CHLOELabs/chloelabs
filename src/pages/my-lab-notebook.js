import {useEffect, useMemo, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {TopicProgress} from '../components/CuriosityJourney';
import {
  deleteNotebookEntry,
  exportNotebookBackup,
  importNotebookBackup,
  renameNotebookEntry,
  readNotebook,
} from '../lib/notebookStorage';
import styles from './my-lab-notebook.module.css';

const PATHS = {
  learn: {label: 'Learn', icon: '✦', className: 'learn'},
  build: {label: 'Build', icon: '◆', className: 'build'},
  investigate: {label: 'Investigate', icon: '⌕', className: 'investigate'},
  create: {label: 'Create', icon: '★', className: 'create'},
  share: {label: 'Share', icon: '◉', className: 'share'},
};

export default function MyLabNotebook() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState('');
  const [message, setMessage] = useState('');
  const fileInput = useRef(null);

  function refresh() {
    setEntries(readNotebook());
  }

  useEffect(() => {
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('chloelabs:notebook-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('chloelabs:notebook-changed', refresh);
    };
  }, []);

  const visibleEntries = useMemo(
    () =>
      filter === 'all'
        ? entries
        : entries.filter((entry) => entry.notebookPath === filter),
    [entries, filter],
  );

  const counts = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(PATHS).map((path) => [
          path,
          entries.filter((entry) => entry.notebookPath === path).length,
        ]),
      ),
    [entries],
  );
  const topicGroups = useMemo(() => {
    const groups = new Map();
    visibleEntries.forEach((entry) => {
      const topic = entry.topic || 'Untitled curiosity';
      const key = topic.trim().toLocaleLowerCase();
      if (!groups.has(key)) groups.set(key, {topic, entries: []});
      groups.get(key).entries.push(entry);
    });
    return [...groups.values()];
  }, [visibleEntries]);

  function removeEntry(entry) {
    const title = getTitle(entry);
    if (!window.confirm(`Delete “${title}” from this browser?`)) return;
    deleteNotebookEntry(entry);
    if (expandedId === entry.notebookId) setExpandedId('');
    setMessage(`${title} was deleted.`);
  }

  function renameEntry(entry) {
    const title = window.prompt('Name this notebook entry:', getTitle(entry));
    if (title === null || !title.trim()) return;
    renameNotebookEntry(entry, title);
    refresh();
    setMessage(`Notebook entry renamed to “${title.trim()}.”`);
  }

  function downloadBackup() {
    downloadFile(
      `chloelabs-notebook-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(exportNotebookBackup(), null, 2),
      'application/json',
    );
    setMessage('Your complete notebook backup was downloaded.');
  }

  async function importBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const imported = importNotebookBackup(JSON.parse(await file.text()));
      refresh();
      setMessage(
        imported
          ? `${imported} notebook ${imported === 1 ? 'entry was' : 'entries were'} imported.`
          : 'Everything in that backup is already in this notebook.',
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Layout
      title="My Lab Notebook"
      description="Your private collection of ChloeLabs discoveries and projects.">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div>
              <span className={styles.eyebrow}>Your curiosity collection</span>
              <Heading as="h1">My Lab Notebook</Heading>
              <p>
                Every saved discovery, build, investigation, creation, and
                sharing plan—together in one place.
              </p>
            </div>
            <NotebookComet />
          </div>
        </header>

        <div className={`container ${styles.content}`}>
          <aside className={styles.storageNotice}>
            <span aria-hidden="true">🔒</span>
            <div>
              <strong>Private to this browser</strong>
              <p>
                Your notebook is stored on this device, not in a ChloeLabs
                account. Download a backup before clearing browser data or
                changing devices.
              </p>
            </div>
          </aside>

          {message && (
            <p className={styles.message} role="status">
              {message}
            </p>
          )}

          <section className={styles.toolbar} aria-label="Notebook tools">
            <div>
              <Heading as="h2">
                {entries.length
                  ? `${entries.length} saved ${entries.length === 1 ? 'entry' : 'entries'}`
                  : 'Your notebook is ready'}
              </Heading>
              <p>Filter your collection or make a portable backup.</p>
            </div>
            <div className={styles.backupActions}>
              <button
                className="button button--secondary"
                disabled={!entries.length}
                onClick={downloadBackup}>
                Download backup
              </button>
              <button
                className="button button--secondary"
                onClick={() => fileInput.current?.click()}>
                Import backup
              </button>
              <input
                accept=".json,application/json"
                className={styles.fileInput}
                onChange={importBackup}
                ref={fileInput}
                type="file"
              />
            </div>
          </section>

          {entries.length ? (
            <>
              <div className={styles.filters} aria-label="Filter notebook">
                <FilterButton
                  active={filter === 'all'}
                  count={entries.length}
                  label="All"
                  onClick={() => setFilter('all')}
                />
                {Object.entries(PATHS).map(([path, details]) => (
                  <FilterButton
                    active={filter === path}
                    count={counts[path]}
                    key={path}
                    label={details.label}
                    onClick={() => setFilter(path)}
                  />
                ))}
              </div>

              {visibleEntries.length ? (
                <div className={styles.topicGroups}>
                  {topicGroups.map((group) => (
                    <section className={styles.topicGroup} key={group.topic}>
                      <div className={styles.topicGroupHeading}>
                        <div>
                          <span>Curiosity collection</span>
                          <Heading as="h2">{group.topic}</Heading>
                        </div>
                        <Link
                          to={`/curiosity-engine?topic=${encodeURIComponent(group.topic)}`}>
                          Continue this curiosity →
                        </Link>
                      </div>
                      <TopicProgress
                        completedPaths={
                          new Set(
                            group.entries.map((entry) => entry.notebookPath),
                          )
                        }
                        topic={group.topic}
                      />
                      <div className={styles.grid}>
                        {group.entries.map((entry) => (
                          <NotebookCard
                            entry={entry}
                            expanded={expandedId === entry.notebookId}
                            key={`${entry.notebookPath}-${entry.notebookId}`}
                            onDelete={() => removeEntry(entry)}
                            onExport={() => exportEntry(entry)}
                            onRename={() => renameEntry(entry)}
                            onToggle={() =>
                              setExpandedId((current) =>
                                current === entry.notebookId
                                  ? ''
                                  : entry.notebookId,
                              )
                            }
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <p className={styles.noMatches}>
                  No {PATHS[filter]?.label.toLowerCase()} entries yet.
                </p>
              )}
            </>
          ) : (
            <EmptyNotebook />
          )}
        </div>
      </main>
    </Layout>
  );
}

function FilterButton({active, count, label, onClick}) {
  return (
    <button
      aria-pressed={active}
      className={active ? styles.filterActive : ''}
      onClick={onClick}
      type="button">
      {label} <span>{count}</span>
    </button>
  );
}

function NotebookCard({
  entry,
  expanded,
  onDelete,
  onExport,
  onRename,
  onToggle,
}) {
  const path = PATHS[entry.notebookPath];
  const summary = getSummary(entry);
  return (
    <article className={`${styles.card} ${styles[path.className]}`}>
      <div className={styles.cardTop}>
        <span className={styles.pathIcon} aria-hidden="true">
          {path.icon}
        </span>
        <span className={styles.pathLabel}>{path.label}</span>
        <time dateTime={entry.savedAt}>{formatDate(entry.savedAt)}</time>
      </div>
      <Heading as="h3">{getTitle(entry)}</Heading>
      <p className={styles.topic}>Topic: {entry.topic || 'Untitled curiosity'}</p>
      <p>{summary}</p>
      <div className={styles.cardActions}>
        <Link
          to={`/curiosity-engine/${entry.notebookPath}?topic=${encodeURIComponent(entry.topic || '')}&resume=${encodeURIComponent(entry.notebookId)}`}>
          Continue working
        </Link>
        <button aria-expanded={expanded} onClick={onToggle} type="button">
          {expanded ? 'Hide details' : 'Open details'}
        </button>
        <button onClick={onExport} type="button">
          Export
        </button>
        <button onClick={onRename} type="button">
          Rename
        </button>
        <button className={styles.deleteButton} onClick={onDelete} type="button">
          Delete
        </button>
      </div>
      {expanded && <EntryDetails entry={entry} />}
    </article>
  );
}

function EntryDetails({entry}) {
  const details = getDetails(entry);
  return (
    <div className={styles.details}>
      <Heading as="h4">Notebook details</Heading>
      {details.map(({label, value}) => (
        <section key={label}>
          <strong>{label}</strong>
          {Array.isArray(value) ? (
            <ul>
              {value.map((item, index) => (
                <li key={`${label}-${index}`}>{renderValue(item)}</li>
              ))}
            </ul>
          ) : (
            <p>{renderValue(value)}</p>
          )}
        </section>
      ))}
    </div>
  );
}

function EmptyNotebook() {
  return (
    <section className={styles.empty}>
      <div className={styles.emptyBook} aria-hidden="true">
        <span>?</span>
      </div>
      <Heading as="h2">Your first page starts with a curiosity</Heading>
      <p>
        Explore a topic, follow one of the five paths, and save your work. It
        will appear here automatically.
      </p>
      <Link className="button button--primary button--lg" to="/curiosity-engine">
        Start with a curiosity
      </Link>
    </section>
  );
}

function NotebookComet() {
  return (
    <div className={styles.cometScene} aria-label="Comet carrying a lab notebook">
      <div className={styles.comet}>
        <span className={styles.earLeft} />
        <span className={styles.earRight} />
        <span className={styles.face}>
          <i />
          <i />
          <b />
        </span>
      </div>
      <div className={styles.cometBook}>
        <span>MY LAB</span>
        <strong>NOTEBOOK</strong>
        <i>✦</i>
      </div>
    </div>
  );
}

function getTitle(entry) {
  return (
    entry.customTitle ||
    entry.question ||
    entry.project?.title ||
    entry.idea?.title ||
    `${entry.notebookLabel} ${entry.topic || 'project'}`
  );
}

function getSummary(entry) {
  return (
    entry.thinkingChange ||
    entry.improvement ||
    entry.claim ||
    entry.reflection ||
    entry.closing ||
    'A saved ChloeLabs project.'
  );
}

function getDetails(entry) {
  const detailsByPath = {
    learn: [
      ['Question', entry.question],
      ['Starting ideas', entry.startingIdeas],
      ['My explanation', entry.explanation],
      ['How my thinking changed', entry.thinkingChange],
    ],
    build: [
      ['Goal', entry.project?.goal || entry.project?.description],
      ['Materials', entry.project?.materials],
      ['Build notes', entry.buildNotes],
      ['Test notes', entry.testNotes],
      ['Next improvement', entry.improvement],
    ],
    investigate: [
      ['Question', entry.idea?.question],
      ['Prediction', entry.prediction],
      ['Evidence collected', summarizeRows(entry.rows)],
      ['Claim', entry.claim],
      ['Evidence', entry.evidence],
      ['Reasoning', entry.reasoning],
      ['Uncertainty', entry.uncertainty],
    ],
    create: [
      ['Creative concept', entry.idea?.concept],
      ['My storyboard', entry.drafts],
      ['Reflection', entry.reflection],
      ['Materials', entry.idea?.materials],
    ],
    share: [
      ['Audience', entry.audience],
      ['Opening hook', entry.hook],
      ['Key points', entry.points],
      ['Audience activity', entry.activity],
      ['Closing', entry.closing],
    ],
  };
  return (detailsByPath[entry.notebookPath] || [])
    .filter(([, value]) =>
      Array.isArray(value) ? value.length : value !== undefined && value !== '',
    )
    .map(([label, value]) => ({label, value}));
}

function summarizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((row) => Object.values(row || {}).some(Boolean))
    .map((row) =>
      [row.trial, row.condition, row.observation, row.measurement]
        .filter((value) => value !== undefined && value !== '')
        .join(' — '),
    );
}

function renderValue(value) {
  if (value === null || value === undefined || value === '') return 'Not added';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
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

function exportEntry(entry) {
  const title = getTitle(entry);
  const details = getDetails(entry);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{color:#173f49;font:16px/1.6 system-ui;margin:3rem auto;max-width:760px;padding:0 1rem}h1{color:#173f49}small{color:#697b75;text-transform:uppercase}section{border-top:1px solid #d7ded9;padding:1rem 0}strong{color:#246457}ul{padding-left:1.25rem}</style></head><body><small>ChloeLabs · ${escapeHtml(entry.notebookLabel)} · ${escapeHtml(formatDate(entry.savedAt))}</small><h1>${escapeHtml(title)}</h1><p><strong>Topic:</strong> ${escapeHtml(entry.topic || '')}</p>${details.map(({label, value}) => `<section><strong>${escapeHtml(label)}</strong>${Array.isArray(value) ? `<ul>${value.map((item) => `<li>${escapeHtml(renderValue(item))}</li>`).join('')}</ul>` : `<p>${escapeHtml(renderValue(value))}</p>`}</section>`).join('')}<script>window.print()</script></body></html>`;
  downloadFile(`${slugify(title)}.html`, html, 'text/html');
}

function downloadFile(filename, contents, type) {
  const url = URL.createObjectURL(new Blob([contents], {type}));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}
