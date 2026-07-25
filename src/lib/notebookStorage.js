export const NOTEBOOK_VERSION = 1;

export const NOTEBOOK_SOURCES = [
  {path: 'learn', key: 'chloelabs:lab-notebook:v1', label: 'Learn'},
  {path: 'build', key: 'chloelabs:build-notebook:v1', label: 'Build'},
  {
    path: 'investigate',
    key: 'chloelabs:investigation-notebook:v1',
    label: 'Investigate',
  },
  {path: 'create', key: 'chloelabs:create-notebook:v1', label: 'Create'},
  {path: 'share', key: 'chloelabs:share-notebook:v1', label: 'Share'},
];

function readArray(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function readNotebook() {
  return NOTEBOOK_SOURCES.flatMap((source) =>
    readArray(source.key).map((entry, index) => ({
      ...entry,
      notebookPath: source.path,
      notebookLabel: source.label,
      notebookKey: source.key,
      notebookId: String(entry.id ?? `${source.path}-${index}`),
    })),
  ).sort(
    (a, b) =>
      new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime(),
  );
}

export function readNotebookEntry(path, id) {
  return readNotebook().find(
    (entry) =>
      entry.notebookPath === path && entry.notebookId === String(id || ''),
  );
}

export function deleteNotebookEntry(entry) {
  const entries = readArray(entry.notebookKey);
  const next = entries.filter(
    (candidate, index) =>
      String(candidate.id ?? `${entry.notebookPath}-${index}`) !==
      entry.notebookId,
  );
  window.localStorage.setItem(entry.notebookKey, JSON.stringify(next));
  announceNotebookChange();
}

export function upsertNotebookEntry(notebookKey, entry) {
  const entries = readArray(notebookKey);
  const id = String(entry.id);
  const index = entries.findIndex((candidate) => String(candidate.id) === id);
  const next =
    index === -1
      ? [...entries, entry]
      : entries.map((candidate, candidateIndex) =>
          candidateIndex === index ? {...candidate, ...entry} : candidate,
        );
  window.localStorage.setItem(notebookKey, JSON.stringify(next));
  announceNotebookChange();
}

export function renameNotebookEntry(entry, customTitle) {
  const entries = readArray(entry.notebookKey);
  const next = entries.map((candidate, index) => {
    const candidateId = String(
      candidate.id ?? `${entry.notebookPath}-${index}`,
    );
    return candidateId === entry.notebookId
      ? {...candidate, customTitle: customTitle.trim()}
      : candidate;
  });
  window.localStorage.setItem(entry.notebookKey, JSON.stringify(next));
  announceNotebookChange();
}

export function exportNotebookBackup() {
  return {
    product: 'ChloeLabs',
    version: NOTEBOOK_VERSION,
    exportedAt: new Date().toISOString(),
    notebooks: Object.fromEntries(
      NOTEBOOK_SOURCES.map((source) => [source.path, readArray(source.key)]),
    ),
  };
}

export function importNotebookBackup(backup) {
  if (
    !backup ||
    backup.product !== 'ChloeLabs' ||
    typeof backup.notebooks !== 'object'
  ) {
    throw new Error('This file is not a ChloeLabs notebook backup.');
  }

  let imported = 0;
  NOTEBOOK_SOURCES.forEach((source) => {
    const incoming = backup.notebooks[source.path];
    if (!Array.isArray(incoming)) return;

    const current = readArray(source.key);
    const knownIds = new Set(current.map((entry) => String(entry.id)));
    const additions = incoming.filter(
      (entry) => entry && !knownIds.has(String(entry.id)),
    );
    window.localStorage.setItem(
      source.key,
      JSON.stringify([...current, ...additions]),
    );
    imported += additions.length;
  });

  announceNotebookChange();
  return imported;
}

export function announceNotebookChange() {
  window.dispatchEvent(new Event('chloelabs:notebook-changed'));
}
