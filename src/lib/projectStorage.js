export const PROJECTS_KEY = 'chloelabs:projects:v1';

function normalizeTopic(topic) {
  return String(topic || '').trim().toLocaleLowerCase();
}

function readArray() {
  try {
    const value = JSON.parse(window.localStorage.getItem(PROJECTS_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeProjects(projects) {
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  window.dispatchEvent(new Event('chloelabs:projects-changed'));
}

export function readProjects() {
  return readArray().sort(
    (a, b) =>
      new Date(b.updatedAt || 0).getTime() -
      new Date(a.updatedAt || 0).getTime(),
  );
}

export function readProject(id) {
  return readArray().find((project) => project.id === String(id || ''));
}

export function findProjectForTopic(topic) {
  const normalized = normalizeTopic(topic);
  return readArray().find(
    (project) => normalizeTopic(project.topic) === normalized,
  );
}

export function ensureProjectForTopic(topic) {
  const cleanTopic = String(topic || '').trim() || 'Untitled curiosity';
  const existing = findProjectForTopic(cleanTopic);
  if (existing) return existing;

  const now = new Date().toISOString();
  const project = {
    id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    topic: cleanTopic,
    title: `My ${cleanTopic} project`,
    question: '',
    why: '',
    goal: '',
    nextAction: '',
    nextQuestion: '',
    completion: {},
    finishedAt: null,
    status: 'exploring',
    createdAt: now,
    updatedAt: now,
  };
  writeProjects([...readArray(), project]);
  return project;
}

export function updateProject(id, changes) {
  const projects = readArray();
  let updated;
  const next = projects.map((project) => {
    if (project.id !== id) return project;
    updated = {
      ...project,
      ...changes,
      id: project.id,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  if (!updated) return undefined;
  writeProjects(next);
  return updated;
}

export function projectLink(project) {
  const params = new URLSearchParams({
    project: project.id,
    topic: project.topic,
  });
  return `/project-workspace?${params.toString()}`;
}
