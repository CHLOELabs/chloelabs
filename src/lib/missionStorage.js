export const MISSION_ATTEMPTS_KEY = 'chloelabs:mission-attempts:v1';

export function readMissionAttempts() {
  try {
    const value = JSON.parse(
      window.localStorage.getItem(MISSION_ATTEMPTS_KEY) || '[]',
    );
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveMissionAttempt({missionId, result, caption}) {
  const attempts = readMissionAttempts();
  const attemptNumber =
    attempts.filter((attempt) => attempt.missionId === missionId).length + 1;
  const attempt = {
    id: `mission-attempt-${Date.now()}`,
    missionId,
    date: new Date().toISOString(),
    attemptNumber,
    result: String(result || '').trim(),
    caption: String(caption || '').trim(),
  };
  window.localStorage.setItem(
    MISSION_ATTEMPTS_KEY,
    JSON.stringify([...attempts, attempt]),
  );
  window.dispatchEvent(new Event('chloelabs:mission-attempts-changed'));
  return attempt;
}
