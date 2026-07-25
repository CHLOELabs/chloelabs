import {useEffect, useMemo, useRef, useState} from 'react';
import {readNotebookEntry} from './notebookStorage';

const DRAFT_PREFIX = 'chloelabs:path-draft:v2';

function topicSlug(topic) {
  return String(topic || 'something interesting').trim().toLocaleLowerCase();
}

export function useBrowserDraft({
  path,
  topic,
  snapshot,
  restore,
  resumeId,
  resumeToDraft,
}) {
  const key = useMemo(
    () => `${DRAFT_PREFIX}:${path}:${topicSlug(topic)}`,
    [path, topic],
  );
  const restoreRef = useRef(restore);
  const snapshotRef = useRef(snapshot);
  const resumeToDraftRef = useRef(resumeToDraft);
  const [readyKey, setReadyKey] = useState('');
  const [restored, setRestored] = useState(false);
  const [status, setStatus] = useState('loading');
  const [projectId, setProjectId] = useState('');

  restoreRef.current = restore;
  snapshotRef.current = snapshot;
  resumeToDraftRef.current = resumeToDraft;

  useEffect(() => {
    setStatus('loading');
    setRestored(false);
    try {
      const raw = window.localStorage.getItem(key);
      const draft = raw ? JSON.parse(raw) : null;
      const id =
        draft?.projectId ||
        `${path}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setProjectId(id);
      if (draft?.data) {
        restoreRef.current(draft.data);
        setRestored(true);
      } else if (resumeId && resumeToDraftRef.current) {
        const entry = readNotebookEntry(path, resumeId);
        if (entry) {
          restoreRef.current(resumeToDraftRef.current(entry));
          setRestored(true);
        }
      }
      setStatus('saved');
    } catch {
      setProjectId(
        `${path}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      );
      setStatus('error');
    } finally {
      setReadyKey(key);
    }
  }, [key, path, resumeId]);

  useEffect(() => {
    if (readyKey !== key || !projectId) return undefined;
    setStatus('saving');
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            version: 2,
            projectId,
            path,
            topic,
            updatedAt: new Date().toISOString(),
            data: snapshotRef.current,
          }),
        );
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [key, path, projectId, readyKey, snapshot, topic]);

  function clearDraft() {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Resetting the screen should still work if storage is unavailable.
    }
    const nextId = `${path}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
    setProjectId(nextId);
    setRestored(false);
    setStatus('saved');
    return nextId;
  }

  return {clearDraft, projectId, restored, status};
}
