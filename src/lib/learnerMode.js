export const LEARNER_MODES = [
  {id: 'show', label: 'Show me', description: 'More visual clues and smaller steps', ageBand: '7-10'},
  {id: 'try', label: 'Let me try', description: 'Short hints when I need them', ageBand: '10-12'},
  {id: 'challenge', label: 'Challenge me', description: 'Fewer hints and deeper questions', ageBand: '13-15'},
];

export function learnerModeFromSearch(search) {
  const requested = new URLSearchParams(search).get('mode');
  return LEARNER_MODES.some((mode) => mode.id === requested)
    ? requested
    : 'show';
}

export function ageBandForMode(mode) {
  return LEARNER_MODES.find((candidate) => candidate.id === mode)?.ageBand || '7-10';
}
