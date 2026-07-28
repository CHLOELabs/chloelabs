import {useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {
  ensureProjectForTopic,
  projectLink,
  readProject,
  updateProject,
} from '../../lib/projectStorage';
import styles from './styles.module.css';

const STEP_LABELS = [
  'Start',
  'Materials',
  'Ready',
  'Build',
  'Test',
  'Result',
  'Saved',
  'Next',
];

export default function ChallengeFlow({challenge}) {
  const [step, setStep] = useState(1);
  const [materials, setMaterials] = useState([]);
  const [customMaterial, setCustomMaterial] = useState('');
  const [checked, setChecked] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [outcome, setOutcome] = useState('');
  const [caption, setCaption] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [savedAttempt, setSavedAttempt] = useState(null);
  const [changeChoice, setChangeChoice] = useState('');
  const [nextIdea, setNextIdea] = useState('');
  const [project, setProject] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const buildTimer = useStopwatch(setAnnouncement);
  const testTimer = useStopwatch(setAnnouncement);
  const resultHeading = useRef(null);

  useEffect(() => {
    const existing = ensureProjectForTopic(challenge.project.topic);
    const hydrated = readProject(existing.id) || existing;
    setProject(hydrated);
    setAttempts(readAttempts(hydrated, challenge.id));
  }, [challenge.id, challenge.project.topic]);

  const durationSeconds = useMemo(() => {
    const manual = Number(minutes || 0) * 60 + Number(seconds || 0);
    return manual || testTimer.elapsed;
  }, [minutes, seconds, testTimer.elapsed]);

  function toggleMaterial(id) {
    setMaterials((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function resetForNextAttempt() {
    setStep(2);
    setChecked([]);
    setMinutes('');
    setSeconds('');
    setOutcome('');
    setCaption('');
    setThumbnail('');
    setSavedAttempt(null);
    setShowHint(false);
    buildTimer.reset(false);
    testTimer.reset(false);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function finishTest() {
    testTimer.pause(`${challenge.test.shortLabel} paused. Record what happened.`);
    const total = testTimer.elapsed;
    setMinutes(String(Math.floor(total / 60)));
    setSeconds(String(total % 60));
    setStep(6);
  }

  async function previewPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setThumbnail(await makeThumbnail(file));
    } catch {
      setAnnouncement('That photo could not be previewed. You can choose another or skip it.');
    }
  }

  function saveAttempt({skipOptional = false} = {}) {
    if (!project || !durationSeconds || !outcome) return;
    const savedCaption = skipOptional ? '' : caption.trim();
    const savedThumbnail = skipOptional ? '' : thumbnail;
    const attempt = {
      id: `${challenge.id}-attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      challengeId: challenge.id,
      attemptNumber: attempts.length + 1,
      completedAt: new Date().toISOString(),
      durationSeconds,
      outcome,
      materials,
      customMaterial: materials.includes('other') ? customMaterial.trim() : '',
      caption: savedCaption,
      nextIdea: nextIdea.trim() || changeChoice,
      imageThumbnail: savedThumbnail,
    };
    const artifact = {
      id: attempt.id,
      type: savedThumbnail ? 'sketch' : 'observation',
      title: `${challenge.history.attemptName} ${attempt.attemptNumber}`,
      detail: `${formatTime(durationSeconds)} · ${outcomeLabel(challenge, outcome)} · ${materialLabels(challenge, attempt).join(', ')}`,
      sketch: savedThumbnail,
      photo: savedThumbnail,
      challengeId: challenge.id,
      attempt,
      createdAt: attempt.completedAt,
    };
    const updated = updateProject(project.id, {
      title: challenge.project.title,
      question: challenge.project.question,
      goal: challenge.project.goal,
      status: 'active',
      nextAction: challenge.project.nextAction,
      evidence: [...(project.evidence || []), artifact],
    });
    const nextAttempts = [...attempts, attempt];
    setProject(updated);
    setAttempts(nextAttempts);
    setSavedAttempt(attempt);
    setStep(7);
    setAnnouncement(
      `${challenge.history.attemptName} ${attempt.attemptNumber} saved. ${challenge.result.metricLabel} ${formatTime(durationSeconds)}.`,
    );
    window.requestAnimationFrame(() => resultHeading.current?.focus());
  }

  return (
    <Layout title={challenge.title} description={challenge.description}>
      <main className={styles.page}>
        <header className={styles.topbar}>
          <Link to="/">← Challenges</Link>
          <span>{challenge.shortTitle}</span>
          <small>Saved privately</small>
        </header>
        <div
          className={styles.progress}
          aria-label={`Step ${step} of 8: ${STEP_LABELS[step - 1]}`}>
          <div style={{width: `${(step / 8) * 100}%`}} />
          <span>Step {step} of 8 · {STEP_LABELS[step - 1]}</span>
        </div>
        <p className={styles.srStatus} aria-live="polite">{announcement}</p>

        <div className={styles.stage}>
          {step === 1 && (
            <MissionStart challenge={challenge} onStart={() => setStep(2)} />
          )}

          {step === 2 && (
            <StepShell eyebrow={challenge.materials.eyebrow} title={challenge.materials.title}>
              <div className={styles.materialGrid}>
                {challenge.materials.options.map(({id, icon, label}) => (
                  <button
                    aria-pressed={materials.includes(id)}
                    className={materials.includes(id) ? styles.selected : ''}
                    key={id}
                    onClick={() => toggleMaterial(id)}
                    type="button">
                    <span aria-hidden="true">{icon}</span>
                    <strong>{label}</strong>
                  </button>
                ))}
              </div>
              {materials.includes('other') && (
                <label className={styles.shortField}>
                  {challenge.materials.otherLabel}
                  <input
                    maxLength={50}
                    onChange={(event) => setCustomMaterial(event.target.value)}
                    placeholder="One short answer"
                    value={customMaterial}
                  />
                  <small>{customMaterial.length}/50</small>
                </label>
              )}
              <p className={styles.helper}>{challenge.materials.helper}</p>
              <PrimaryButton disabled={!materials.length} onClick={() => setStep(3)}>
                {challenge.materials.button}
              </PrimaryButton>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell eyebrow="Quick setup" title={challenge.supplies.title}>
              <div className={styles.checklist}>
                {challenge.supplies.items.map((supply) => (
                  <button
                    aria-pressed={checked.includes(supply)}
                    className={checked.includes(supply) ? styles.checked : ''}
                    key={supply}
                    onClick={() =>
                      setChecked((current) =>
                        current.includes(supply)
                          ? current.filter((item) => item !== supply)
                          : [...current, supply],
                      )
                    }
                    type="button">
                    <span aria-hidden="true">{checked.includes(supply) ? '✓' : '○'}</span>
                    {supply}
                  </button>
                ))}
              </div>
              <aside className={styles.safety}>{challenge.supplies.safety}</aside>
              <PrimaryButton onClick={() => setStep(4)}>
                {challenge.supplies.button}
              </PrimaryButton>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell eyebrow="Build" title={challenge.build.title}>
              <div className={styles.goal}>
                <b>Your goal</b>{challenge.build.goal}
              </div>
              <ul className={styles.tips}>
                {challenge.build.tips.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
              <button
                aria-expanded={showHint}
                className={styles.hintButton}
                onClick={() => setShowHint((value) => !value)}
                type="button">
                {showHint ? 'Hide hint' : challenge.build.hintLabel}
              </button>
              {showHint && <p className={styles.hint}>{challenge.build.hint}</p>}
              <TimerCard
                label={challenge.build.timerLabel}
                stopwatch={buildTimer}
              />
              <PrimaryButton onClick={() => {
                buildTimer.pause('Build timer paused. Your first version is ready to test.');
                setStep(5);
              }}>
                {challenge.build.button}
              </PrimaryButton>
            </StepShell>
          )}

          {step === 5 && (
            <StepShell eyebrow="Test" title={challenge.test.title}>
              <p className={styles.lead}>{challenge.test.instructions}</p>
              <TestTimer
                finishLabel={challenge.test.finishLabel}
                shortLabel={challenge.test.shortLabel}
                stopwatch={testTimer}
                onFinish={finishTest}
              />
              <p className={styles.reminder}>{challenge.test.reminder}</p>
              <small className={styles.sessionNote}>
                This timer stays on this page only. A normal stopwatch works too.
              </small>
            </StepShell>
          )}

          {step === 6 && (
            <StepShell eyebrow="Record" title={challenge.result.title}>
              <div className={styles.timeEntry}>
                <label>Minutes<input inputMode="numeric" min="0" onChange={(event) => setMinutes(event.target.value.replace(/\D/g, '').slice(0, 3))} value={minutes} /></label>
                <b>:</b>
                <label>Seconds<input inputMode="numeric" max="59" min="0" onChange={(event) => setSeconds(event.target.value.replace(/\D/g, '').slice(0, 2))} value={seconds} /></label>
              </div>
              <Heading as="h2">{challenge.result.outcomeQuestion}</Heading>
              <div className={styles.outcomeChoices}>
                {challenge.result.outcomes.map(({id, icon, label}) => (
                  <button
                    aria-pressed={outcome === id}
                    className={outcome === id ? styles.selected : ''}
                    key={id}
                    onClick={() => setOutcome(id)}
                    type="button">
                    <span aria-hidden="true">{icon}</span>{label}
                  </button>
                ))}
              </div>
              <div className={styles.optionalCapture}>
                <label className={styles.photoPicker}>
                  <span aria-hidden="true">📷</span>
                  <strong>{thumbnail ? 'Choose a different photo' : challenge.result.photoLabel}</strong>
                  <input accept="image/*" capture="environment" onChange={previewPhoto} type="file" />
                </label>
                {thumbnail && <img alt={challenge.result.photoAlt} src={thumbnail} />}
                <label className={styles.captionField}>
                  {challenge.result.captionLabel} <small>Optional</small>
                  <input maxLength={120} onChange={(event) => setCaption(event.target.value)} value={caption} />
                  <small>{caption.length}/120</small>
                </label>
              </div>
              <PrimaryButton disabled={!durationSeconds || !outcome} onClick={saveAttempt}>
                Save this attempt
              </PrimaryButton>
              <button
                className={styles.skipButton}
                disabled={!durationSeconds || !outcome}
                onClick={() => saveAttempt({skipOptional: true})}
                type="button">
                Skip photo and sentence
              </button>
            </StepShell>
          )}

          {step === 7 && savedAttempt && (
            <StepShell eyebrow="Saved privately" title="Attempt saved" titleRef={resultHeading}>
              <AttemptResult
                attempt={savedAttempt}
                attempts={attempts}
                challenge={challenge}
              />
              <div className={styles.resultActions}>
                <PrimaryButton onClick={() => setStep(8)}>Try another version</PrimaryButton>
                <Link className={styles.finishButton} to={project ? projectLink(project) : '/my-projects'}>
                  Save and finish for now
                </Link>
              </div>
            </StepShell>
          )}

          {step === 8 && (
            <StepShell eyebrow="Next attempt" title={challenge.improve.title}>
              <div className={styles.changeGrid}>
                {challenge.improve.choices.map((choice) => (
                  <button
                    aria-pressed={changeChoice === choice}
                    className={changeChoice === choice ? styles.selected : ''}
                    key={choice}
                    onClick={() => setChangeChoice(choice)}
                    type="button">
                    {choice}
                  </button>
                ))}
              </div>
              <label className={styles.shortField}>
                My next idea <small>Optional</small>
                <input maxLength={120} onChange={(event) => setNextIdea(event.target.value)} value={nextIdea} />
                <small>{nextIdea.length}/120</small>
              </label>
              <p className={styles.hint}>{challenge.improve.connection}</p>
              <PrimaryButton disabled={!changeChoice && !nextIdea.trim()} onClick={resetForNextAttempt}>
                Start attempt {attempts.length + 1}
              </PrimaryButton>
            </StepShell>
          )}
        </div>

        {attempts.length > 0 && (
          <AttemptHistory attempts={attempts} challenge={challenge} />
        )}
      </main>
    </Layout>
  );
}

function MissionStart({challenge, onStart}) {
  return (
    <section className={styles.mission}>
      <div
        className={styles.challengeScene}
        style={{'--scene-start': challenge.scene.start, '--scene-end': challenge.scene.end}}
        aria-hidden="true">
        <span>{challenge.scene.icon}</span><i /><i /><i />
      </div>
      <div>
        <span className={styles.eyebrow}>{challenge.eyebrow}</span>
        <Heading as="h1">{challenge.title}</Heading>
        <p>{challenge.intro}</p>
        <PrimaryButton onClick={onStart}>I’m ready</PrimaryButton>
        <button className={styles.needLink} onClick={onStart} type="button">
          What do I need?
        </button>
      </div>
    </section>
  );
}

function StepShell({children, eyebrow, title, titleRef}) {
  return (
    <section className={styles.stepCard}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <Heading as="h1" ref={titleRef} tabIndex={titleRef ? -1 : undefined}>{title}</Heading>
      {children}
    </section>
  );
}

function PrimaryButton({children, disabled = false, onClick}) {
  return <button className={styles.primaryButton} disabled={disabled} onClick={onClick} type="button">{children}</button>;
}

function TimerCard({label, stopwatch}) {
  return (
    <div className={styles.timerCard}>
      <small>{label}</small>
      <strong aria-live="off">{formatTime(stopwatch.elapsed)}</strong>
      <div>
        <button aria-label={`Start ${label}`} disabled={stopwatch.running} onClick={() => stopwatch.start(`${label} started.`)} type="button">Start timer</button>
        <button aria-label={`Pause ${label}`} disabled={!stopwatch.running} onClick={() => stopwatch.pause(`${label} paused.`)} type="button">Pause</button>
        <button aria-label={`Reset ${label}`} onClick={() => stopwatch.reset()} type="button">Reset</button>
      </div>
    </div>
  );
}

function TestTimer({finishLabel, onFinish, shortLabel, stopwatch}) {
  return (
    <div className={styles.testTimer}>
      <strong>{formatTime(stopwatch.elapsed)}</strong>
      <div>
        <button aria-label={`Start ${shortLabel}`} disabled={stopwatch.running} onClick={() => stopwatch.start(`${shortLabel} started.`)} type="button">Start</button>
        <button aria-label={`Pause ${shortLabel}`} disabled={!stopwatch.running} onClick={() => stopwatch.pause(`${shortLabel} paused.`)} type="button">Pause</button>
        <button aria-label={finishLabel} disabled={!stopwatch.elapsed} onClick={onFinish} type="button">{finishLabel}</button>
        <button aria-label={`Reset ${shortLabel}`} onClick={() => stopwatch.reset()} type="button">Reset</button>
      </div>
    </div>
  );
}

function AttemptResult({attempt, attempts, challenge}) {
  const previousBest = bestDuration(
    attempts.filter((item) => item.id !== attempt.id),
  );
  const difference = attempt.durationSeconds - previousBest;
  return (
    <div className={styles.savedCard}>
      <div><span>Attempt</span><strong>{attempt.attemptNumber}</strong></div>
      <div><span>{challenge.result.metricLabel}</span><strong>{formatTime(attempt.durationSeconds)}</strong></div>
      <div><span>Result</span><strong>{outcomeLabel(challenge, attempt.outcome)}</strong></div>
      <div><span>{challenge.materials.summaryLabel}</span><strong>{materialLabels(challenge, attempt).join(', ')}</strong></div>
      {attempt.caption && <p>“{attempt.caption}”</p>}
      {attempt.imageThumbnail && <img alt={challenge.result.savedPhotoAlt} src={attempt.imageThumbnail} />}
      <p className={styles.comparisonCopy}>
        {!previousBest
          ? challenge.comparison.first
          : difference > 0
            ? `${challenge.comparison.improved} ${formatDurationWords(difference)}.`
            : `${challenge.comparison.notImproved} ${formatTime(previousBest)}. ${challenge.comparison.tryAgain}`}
      </p>
    </div>
  );
}

function AttemptHistory({attempts, challenge}) {
  const best = bestDuration(attempts);
  return (
    <section className={styles.history}>
      <div className={styles.historyHeading}>
        <span>YOUR ATTEMPTS</span>
        <Heading as="h2">Compare your versions</Heading>
      </div>
      <div className={styles.historyGrid}>
        {attempts.map((attempt) => (
          <article className={attempt.durationSeconds === best ? styles.personalBest : ''} key={attempt.id}>
            {attempt.durationSeconds === best && <b>{challenge.comparison.bestLabel}</b>}
            <Heading as="h3">Attempt {attempt.attemptNumber}</Heading>
            <time>{new Date(attempt.completedAt).toLocaleDateString()}</time>
            <strong>{formatTime(attempt.durationSeconds)}</strong>
            <span>{outcomeLabel(challenge, attempt.outcome)}</span>
            <small>{materialLabels(challenge, attempt).join(', ')}</small>
            {attempt.caption && <p>{attempt.caption}</p>}
            {attempt.imageThumbnail && <img alt="" src={attempt.imageThumbnail} />}
          </article>
        ))}
      </div>
      {attempts.length > 1 && (
        <p className={styles.improvementLine}>
          Attempt 1: {formatTime(attempts[0].durationSeconds)} · Latest: {formatTime(attempts.at(-1).durationSeconds)} · Change: {signedTime(attempts.at(-1).durationSeconds - attempts[0].durationSeconds)}
        </p>
      )}
    </section>
  );
}

function useStopwatch(announce) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAt = useRef(0);
  const accumulated = useRef(0);

  useEffect(() => {
    if (!running) return undefined;
    const update = () =>
      setElapsed(accumulated.current + Math.floor((Date.now() - startedAt.current) / 1000));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [running]);

  function start(message) {
    if (running) return;
    startedAt.current = Date.now();
    setRunning(true);
    announce(message);
  }
  function pause(message = 'Timer paused.') {
    if (running) {
      accumulated.current += Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(accumulated.current);
      setRunning(false);
    }
    announce(message);
  }
  function reset(shouldAnnounce = true) {
    accumulated.current = 0;
    startedAt.current = 0;
    setElapsed(0);
    setRunning(false);
    if (shouldAnnounce) announce('Timer reset.');
  }
  return {elapsed, pause, reset, running, start};
}

function readAttempts(project, challengeId) {
  return (project.evidence || [])
    .filter((artifact) => artifact.challengeId === challengeId && artifact.attempt)
    .map((artifact) => ({
      ...artifact.attempt,
      outcome: artifact.attempt.outcome || artifact.attempt.meltState || '',
    }))
    .sort((a, b) => a.attemptNumber - b.attemptNumber);
}

function materialLabels(challenge, attempt) {
  return attempt.materials.map((id) => {
    if (id === 'other') return attempt.customMaterial || 'Something else';
    return challenge.materials.options.find((item) => item.id === id)?.label || id;
  });
}

function outcomeLabel(challenge, id) {
  return challenge.result.outcomes.find((item) => item.id === id)?.label || id;
}

function bestDuration(attempts) {
  return Math.max(0, ...attempts.map((attempt) => attempt.durationSeconds));
}

function formatTime(total) {
  const seconds = Math.max(0, Number(total) || 0);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function signedTime(value) {
  return `${value >= 0 ? '+' : '−'}${formatTime(Math.abs(value))}`;
}

function formatDurationWords(total) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return [
    minutes && `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`,
    seconds && `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`,
  ].filter(Boolean).join(' and ');
}

function makeThumbnail(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const scale = Math.min(1, 360 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.62));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
