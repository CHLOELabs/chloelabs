import {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {ensureProjectForTopic, updateProject} from '../../lib/projectStorage';
import styles from './styles.module.css';

const CHALLENGES = {
  learn: [
    ['start', 'Start', 'Find one surprising idea.', 'What surprised you most?'],
    ['improve', 'Improve', 'Explain it with less help.', 'Could you explain it with a picture or three sentences?'],
    ['remix', 'Remix', 'Look for an exception.', 'When might this idea not work the way you expect?'],
    ['boss', 'Boss Level', 'Design your own question.', 'What question would make an expert stop and think?'],
  ],
  build: [
    ['start', 'Start', 'Make the first working version.', 'What is the smallest version you could make?'],
    ['improve', 'Improve', 'Beat your previous design.', 'What one change might make it work better?'],
    ['remix', 'Remix', 'Change a material or rule.', 'What happens if you remove something you thought you needed?'],
    ['boss', 'Boss Level', 'Invent a new constraint.', 'Can you make a version nobody asked for?'],
  ],
  investigate: [
    ['start', 'Start', 'Collect your first clues.', 'What is one thing you can observe fairly?'],
    ['improve', 'Improve', 'Make the comparison stronger.', 'What could you measure more carefully next time?'],
    ['remix', 'Remix', 'Change one variable.', 'What happens if you test the opposite condition?'],
    ['boss', 'Boss Level', 'Design a new investigation.', 'What result would genuinely surprise you?'],
  ],
  create: [
    ['start', 'Start', 'Make the first version.', 'What can you make before it feels perfect?'],
    ['improve', 'Improve', 'Strengthen one choice.', 'What should your audience notice first?'],
    ['remix', 'Remix', 'Change the format or rule.', 'What happens if the story becomes a game or the image becomes a comic?'],
    ['boss', 'Boss Level', 'Invent your own form.', 'What could you create that does not fit a normal category?'],
  ],
  share: [
    ['start', 'Start', 'Explain it to one person.', 'What is the one idea they should remember?'],
    ['improve', 'Improve', 'Use their question to revise.', 'Where did your audience look confused or curious?'],
    ['remix', 'Remix', 'Change the audience.', 'How would you explain it to someone much younger—or an expert?'],
    ['boss', 'Boss Level', 'Make the audience participate.', 'Can they test, choose, predict, or build something too?'],
  ],
};

export default function ChallengeLadder({path, ready, topic}) {
  const levels = CHALLENGES[path] || [];
  const [selected, setSelected] = useState('improve');
  const [idea, setIdea] = useState('');
  const [message, setMessage] = useState('');
  const active = useMemo(
    () => levels.find(([id]) => id === selected) || levels[0],
    [levels, selected],
  );

  if (!ready) return null;

  function saveNextVersion() {
    if (!idea.trim()) return;
    try {
      const project = ensureProjectForTopic(topic);
      const challengeIdeas = Array.isArray(project.challengeIdeas)
        ? project.challengeIdeas
        : [];
      updateProject(project.id, {
        challengeIdeas: [
          ...challengeIdeas,
          {
            id: `challenge-${Date.now()}`,
            path,
            level: selected,
            idea: idea.trim(),
            createdAt: new Date().toISOString(),
          },
        ],
        nextAction: idea.trim(),
        status: 'active',
        finishedAt: null,
      });
      setIdea('');
      setMessage('Your next-version idea is saved in the Project Workspace.');
    } catch {
      setMessage('This browser could not save that idea. Keep this page open so you do not lose it.');
    }
  }

  return (
    <section className={styles.ladder}>
      <div className={styles.heading}>
        <div>
          <span>Your first version is only the beginning</span>
          <Heading as="h2">How far will you take it?</Heading>
        </div>
        <div className={styles.loop} aria-hidden="true">
          <b>TRY</b><i>→</i><b>CHANGE</b><i>→</i><b>TRY AGAIN</b>
        </div>
      </div>
      <div className={styles.levels}>
        {levels.map(([id, label, description], index) => (
          <button
            aria-pressed={selected === id}
            className={selected === id ? styles.selected : ''}
            key={id}
            onClick={() => {
              setSelected(id);
              setMessage('');
            }}
            type="button">
            <span>{id === 'boss' ? '★' : index + 1}</span>
            <strong>{label}</strong>
            <small>{description}</small>
          </button>
        ))}
      </div>
      <div className={styles.prompt}>
        <span aria-hidden="true">?</span>
        <div>
          <strong>{active?.[3]}</strong>
          <textarea
            maxLength={300}
            onChange={(event) => {
              setIdea(event.target.value);
              setMessage('');
            }}
            placeholder="My next version will…"
            rows={3}
            value={idea}
          />
          <div className={styles.actions}>
            <button
              className="button button--primary"
              disabled={!idea.trim()}
              onClick={saveNextVersion}
              type="button">
              Save my next-version idea
            </button>
            <Link
              to={`/project-workspace?topic=${encodeURIComponent(topic)}`}>
              Open Project Workspace →
            </Link>
          </div>
          {message && <p role="status">{message}</p>}
        </div>
      </div>
    </section>
  );
}
