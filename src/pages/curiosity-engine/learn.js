import {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import DraftControls from '../../components/DraftControls';
import {
  NextAdventure,
  PathJourneyMap,
} from '../../components/CuriosityJourney';
import {upsertNotebookEntry} from '../../lib/notebookStorage';
import {useBrowserDraft} from '../../lib/useBrowserDraft';
import styles from './learn.module.css';

const LEARN_API_URL =
  'https://chloelabs-learn-api.chloelabs-amanda.workers.dev';
const DEFAULT_TOPIC = 'something interesting';
const AGE_BAND = '10-12';
const LAB_NOTEBOOK_KEY = 'chloelabs:lab-notebook:v1';
const LEARNING_STAGES = [
  {label: 'Start', icon: 'spark'},
  {label: 'Question', icon: 'question'},
  {label: 'Discover', icon: 'compass'},
  {label: 'Check', icon: 'check'},
  {label: 'Reflect', icon: 'reflect'},
];

export default function LearnPath() {
  const location = useLocation();
  const topic = useMemo(() => {
    const value = new URLSearchParams(location.search).get('topic');
    return value?.trim() || DEFAULT_TOPIC;
  }, [location.search]);
  const resumeId = useMemo(
    () => new URLSearchParams(location.search).get('resume') || '',
    [location.search],
  );
  const fromPath = useMemo(
    () => new URLSearchParams(location.search).get('from') || '',
    [location.search],
  );

  const [priorKnowledge, setPriorKnowledge] = useState('');
  const [thinkingChange, setThinkingChange] = useState('');
  const [storageMessage, setStorageMessage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionsStatus, setQuestionsStatus] = useState('loading');
  const [questionsError, setQuestionsError] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [discovery, setDiscovery] = useState(null);
  const [discoveryStatus, setDiscoveryStatus] = useState('idle');
  const [discoveryError, setDiscoveryError] = useState('');
  const [answer, setAnswer] = useState(null);
  const [checkedAnswer, setCheckedAnswer] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [saved, setSaved] = useState(false);

  const activeQuestion =
    selectedQuestion === 'custom' ? customQuestion.trim() : selectedQuestion;
  const draftSnapshot = useMemo(
    () => ({
      priorKnowledge,
      thinkingChange,
      selectedQuestion,
      customQuestion,
      discovery,
      answer,
      checkedAnswer,
      explanation,
      saved,
    }),
    [
      answer,
      checkedAnswer,
      customQuestion,
      discovery,
      explanation,
      priorKnowledge,
      saved,
      selectedQuestion,
      thinkingChange,
    ],
  );
  const draft = useBrowserDraft({
    path: 'learn',
    topic,
    resumeId,
    snapshot: draftSnapshot,
    resumeToDraft: (entry) => ({
      priorKnowledge: entry.startingIdeas || '',
      thinkingChange: entry.thinkingChange || '',
      selectedQuestion: entry.question || '',
      customQuestion: '',
      discovery: null,
      answer: null,
      checkedAnswer: false,
      explanation: entry.explanation || '',
      saved: true,
    }),
    restore: (data) => {
      setPriorKnowledge(data.priorKnowledge || '');
      setThinkingChange(data.thinkingChange || '');
      setSelectedQuestion(data.selectedQuestion || '');
      setCustomQuestion(data.customQuestion || '');
      setDiscovery(data.discovery || null);
      setAnswer(data.answer || null);
      setCheckedAnswer(Boolean(data.checkedAnswer));
      setExplanation(data.explanation || '');
      setSaved(Boolean(data.saved));
    },
  });
  const currentStage = saved
    ? 5
    : discovery && checkedAnswer
      ? 5
      : discovery
        ? 4
        : discoveryStatus === 'loading'
          ? 3
          : activeQuestion
            ? 2
            : 1;

  useEffect(() => {
    const controller = new AbortController();

    async function loadQuestions() {
      setQuestionsStatus('loading');
      setQuestionsError('');

      try {
        const result = await requestLearnApi(
          '/api/learn/questions',
          {topic, ageBand: AGE_BAND},
          controller.signal,
        );
        setQuestions(result.questions);
        setQuestionsStatus('ready');
      } catch (error) {
        if (error.name === 'AbortError') return;
        setQuestionsError(error.message);
        setQuestionsStatus('error');
      }
    }

    loadQuestions();
    return () => controller.abort();
  }, [topic]);

  function chooseQuestion(question) {
    setSelectedQuestion(question);
    resetDiscovery();
  }

  async function exploreQuestion() {
    if (!activeQuestion) return;

    setDiscoveryStatus('loading');
    setDiscoveryError('');
    setDiscovery(null);
    setAnswer(null);
    setCheckedAnswer(false);
    setExplanation('');
    setSaved(false);

    try {
      const result = await requestLearnApi('/api/learn/discover', {
        topic,
        question: activeQuestion,
        ageBand: AGE_BAND,
      });
      setDiscovery(result);
      setDiscoveryStatus('ready');
    } catch (error) {
      setDiscoveryError(error.message);
      setDiscoveryStatus('error');
    }
  }

  function resetDiscovery() {
    setDiscovery(null);
    setDiscoveryStatus('idle');
    setDiscoveryError('');
    setAnswer(null);
    setCheckedAnswer(false);
    setExplanation('');
    setSaved(false);
  }

  function saveReflection() {
    if (!explanation.trim() || !thinkingChange.trim()) return;

    try {
      const entry = {
        id: draft.projectId,
        topic,
        question: activeQuestion,
        startingIdeas: priorKnowledge.trim(),
        explanation: explanation.trim(),
        thinkingChange: thinkingChange.trim(),
        savedAt: new Date().toISOString(),
      };
      upsertNotebookEntry(LAB_NOTEBOOK_KEY, entry);
      setSaved(true);
      setStorageMessage('');
    } catch {
      setSaved(false);
      setStorageMessage(
        'This browser could not save your reflection. Keep this page open so you do not lose it.',
      );
    }
  }

  function clearStartingIdeas() {
    setPriorKnowledge('');
    setThinkingChange('');
    setSaved(false);
    try {
      setStorageMessage('');
    } catch {
      setStorageMessage('This browser could not clear the saved draft.');
    }
  }

  function startOver() {
    if (!window.confirm('Start this learning project over? Your notebook entry will stay saved.')) return;
    draft.clearDraft();
    setPriorKnowledge('');
    setThinkingChange('');
    setSelectedQuestion('');
    setCustomQuestion('');
    resetDiscovery();
    setStorageMessage('');
  }

  return (
    <Layout
      title={`Learn about ${topic}`}
      description={`A guided ChloeLabs discovery about ${topic}.`}>
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className="container">
            <Link
              className={styles.backLink}
              to={`/curiosity-engine?topic=${encodeURIComponent(topic)}`}>
              ← Choose another path
            </Link>
            <span className={styles.eyebrow}>Learn path</span>
            <Heading as="h1">Learn about {topic}</Heading>
            <p>
              Let’s turn a big curiosity into one question you can explain in
              your own words.
            </p>
          </div>
        </header>

        <div className={`container ${styles.content}`}>
          <DraftControls
            noun="learning project"
            onStartOver={startOver}
            restored={draft.restored}
            status={draft.status}
          />
          <PathJourneyMap
            currentPath="learn"
            fromPath={fromPath}
            topic={topic}
          />
          <aside className={styles.aiNotice}>
            <strong>AI-guided, human-powered</strong>
            <span>
              ChloeLabs researches and organizes information. You decide what
              it means and explain it yourself. Check the sources before
              trusting an important claim.
            </span>
          </aside>

          <LearningJourney currentStage={currentStage} />

          <section className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div>
              <Heading as="h2">What do you already know?</Heading>
              <p>
                Write what you know—or what you think might be true. It is okay
                to be unsure.
              </p>
              <label className={styles.label} htmlFor="prior-knowledge">
                My starting ideas
              </label>
              <textarea
                id="prior-knowledge"
                className={styles.textarea}
                value={priorKnowledge}
                onChange={(event) => setPriorKnowledge(event.target.value)}
                placeholder={`I already know that ${topic}…`}
                rows={4}
              />
              <div className={styles.draftControls}>
                <p className={styles.privacyNote}>
                  Saved only in this browser so you can return to it later. It
                  is not sent to the AI.
                </p>
                {priorKnowledge && (
                  <button
                    className={styles.clearButton}
                    type="button"
                    onClick={clearStartingIdeas}>
                    Clear my starting ideas
                  </button>
                )}
              </div>
              {storageMessage && (
                <p className={styles.storageWarning} role="status">
                  {storageMessage}
                </p>
              )}
            </div>
          </section>

          <section className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div>
              <Heading as="h2">Choose a learning question</Heading>
              <p>A focused question is easier to explore than a giant topic.</p>

              {questionsStatus === 'loading' && (
                <StatusMessage>Creating three directions for you…</StatusMessage>
              )}

              {questionsStatus === 'error' && (
                <ErrorMessage
                  message={questionsError}
                  actionLabel="Try generating questions again"
                  onRetry={() => window.location.reload()}
                />
              )}

              {questionsStatus === 'ready' && (
                <div className={styles.questionGrid}>
                  {questions.map((question) => (
                    <button
                      className={`${styles.questionCard} ${
                        selectedQuestion === question ? styles.selected : ''
                      }`}
                      key={question}
                      type="button"
                      onClick={() => chooseQuestion(question)}
                      aria-pressed={selectedQuestion === question}>
                      {question}
                    </button>
                  ))}
                  <button
                    className={`${styles.questionCard} ${
                      selectedQuestion === 'custom' ? styles.selected : ''
                    }`}
                    type="button"
                    onClick={() => chooseQuestion('custom')}
                    aria-pressed={selectedQuestion === 'custom'}>
                    Write my own question
                  </button>
                </div>
              )}

              {selectedQuestion === 'custom' && (
                <div className={styles.customQuestion}>
                  <label className={styles.label} htmlFor="custom-question">
                    My question
                  </label>
                  <input
                    id="custom-question"
                    className={styles.input}
                    value={customQuestion}
                    maxLength={240}
                    onChange={(event) => {
                      setCustomQuestion(event.target.value);
                      resetDiscovery();
                    }}
                    placeholder={`What do you wonder about ${topic}?`}
                  />
                </div>
              )}

              {activeQuestion && (
                <button
                  className={`button button--primary button--lg ${styles.exploreButton}`}
                  type="button"
                  disabled={discoveryStatus === 'loading'}
                  onClick={exploreQuestion}>
                  {discoveryStatus === 'loading'
                    ? 'Researching…'
                    : 'Explore this question'}
                </button>
              )}

              {discoveryStatus === 'error' && (
                <ErrorMessage
                  message={discoveryError}
                  actionLabel="Try this question again"
                  onRetry={exploreQuestion}
                />
              )}
            </div>
          </section>

          {discoveryStatus === 'loading' && (
            <section className={styles.step} aria-live="polite">
              <span className={styles.stepNumber}>3</span>
              <div>
                <Heading as="h2">Researching your question</Heading>
                <StatusMessage>
                  Looking for reliable sources and building your discovery
                  cards…
                </StatusMessage>
              </div>
            </section>
          )}

          {discovery && (
            <>
              <section className={styles.step} aria-live="polite">
                <span className={styles.stepNumber}>3</span>
                <div>
                  <Heading as="h2">Discover</Heading>
                  <p className={styles.activeQuestion}>{activeQuestion}</p>
                  <DiscoveryExplorer topic={topic} discovery={discovery} />

                  {discovery.uncertaintyNote && (
                    <p className={styles.uncertainty}>
                      <strong>What remains uncertain:</strong>{' '}
                      {discovery.uncertaintyNote}
                    </p>
                  )}

                  <div className={styles.sources}>
                    <Heading as="h3">Sources to check</Heading>
                    <ul>
                      {discovery.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer">
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div>
                  <Heading as="h2">Check your understanding</Heading>
                  <p>{discovery.comprehensionCheck.question}</p>
                  <div className={styles.answerList}>
                    {discovery.comprehensionCheck.choices.map(
                      (choice, index) => (
                        <label className={styles.answerChoice} key={choice}>
                          <input
                            type="radio"
                            name="understanding"
                            value={index}
                            checked={answer === index}
                            onChange={() => {
                              setAnswer(index);
                              setCheckedAnswer(false);
                            }}
                          />
                          <span>{choice}</span>
                        </label>
                      ),
                    )}
                  </div>
                  <button
                    className="button button--secondary"
                    type="button"
                    disabled={answer === null}
                    onClick={() => setCheckedAnswer(true)}>
                    Check my answer
                  </button>
                  {checkedAnswer && (
                    <p
                      className={
                        answer ===
                        discovery.comprehensionCheck.correctChoice
                          ? styles.correct
                          : styles.tryAgain
                      }>
                      {answer === discovery.comprehensionCheck.correctChoice
                        ? discovery.comprehensionCheck.feedback
                        : 'Try again. Look for the choice best supported by the discovery cards and sources.'}
                    </p>
                  )}
                </div>
              </section>

              <section className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div>
                  <Heading as="h2">Reflect on what you learned</Heading>
                  <p>Imagine Comet asked you about this. What would you say?</p>
                  <label className={styles.label} htmlFor="explanation">
                    My explanation
                  </label>
                  <textarea
                    id="explanation"
                    className={styles.textarea}
                    value={explanation}
                    onChange={(event) => {
                      setExplanation(event.target.value);
                      setSaved(false);
                    }}
                    placeholder="I would explain it like this…"
                    rows={5}
                  />
                  <ThinkingBridge
                    priorKnowledge={priorKnowledge}
                    thinkingChange={thinkingChange}
                  />
                  <label className={styles.label} htmlFor="thinking-change">
                    What would you keep, change, or add?
                  </label>
                  <textarea
                    id="thinking-change"
                    className={styles.textarea}
                    value={thinkingChange}
                    onChange={(event) => {
                      setThinkingChange(event.target.value);
                      setSaved(false);
                    }}
                    placeholder="At first I thought… Now I would…"
                    rows={4}
                  />
                  <p className={styles.privacyNote}>
                    Your reflection is also saved only in this browser and is
                    not sent to the AI.
                  </p>
                  <p className={styles.nextQuestion}>
                    <strong>A possible next question:</strong>{' '}
                    {discovery.nextQuestion}
                  </p>
                  <div className={styles.actions}>
                    <button
                      className="button button--primary button--lg"
                      type="button"
                      disabled={
                        !explanation.trim() || !thinkingChange.trim()
                      }
                      onClick={saveReflection}>
                      Save to my Lab Notebook
                    </button>
                    <Link
                      className="button button--outline button--secondary button--lg"
                      to="/curiosity-engine">
                      Explore another question
                    </Link>
                  </div>
                  {saved && (
                    <>
                      <div className={styles.savedMessage} role="status">
                        <strong>Reflection ready!</strong>
                        <span>
                          Your starting ideas and final reflection are saved in
                          this browser’s Lab Notebook. They are not synced to
                          other devices.
                        </span>
                      </div>
                      <Link
                        className="button button--secondary button--lg"
                        to="/my-lab-notebook">
                        View My Lab Notebook
                      </Link>
                    </>
                  )}
                </div>
              </section>
            </>
          )}
          <NextAdventure currentPath="learn" saved={saved} topic={topic} />
        </div>
      </main>
    </Layout>
  );
}

function LearningJourney({currentStage}) {
  return (
    <nav className={styles.journey} aria-label="Your learning journey">
      <div className={styles.journeyHeading}>
        <strong>Your learning journey</strong>
        <span>
          Step {currentStage} of {LEARNING_STAGES.length}
        </span>
      </div>
      <ol className={styles.journeyTrack}>
        {LEARNING_STAGES.map((stage, index) => {
          const number = index + 1;
          const isComplete = number < currentStage;
          const isCurrent = number === currentStage;
          return (
            <li
              className={`${styles.journeyStage} ${
                isComplete ? styles.journeyComplete : ''
              } ${isCurrent ? styles.journeyCurrent : ''}`}
              key={stage.label}
              aria-current={isCurrent ? 'step' : undefined}>
              <span className={styles.journeyIcon}>
                {isComplete ? (
                  <GraphicIcon name="check" />
                ) : (
                  <GraphicIcon name={stage.icon} />
                )}
              </span>
              <span>{stage.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function DiscoveryExplorer({topic, discovery}) {
  const insights = [
    {
      id: 'big-idea',
      label: 'Big idea',
      shortLabel: 'Idea',
      icon: 'bulb',
      text: discovery.bigIdea,
    },
    {
      id: 'surprising-fact',
      label: 'Surprising fact',
      shortLabel: 'Surprise',
      icon: 'spark',
      text: discovery.surprisingFact,
    },
    {
      id: 'look-closer',
      label: 'Look more closely',
      shortLabel: 'Look closer',
      icon: 'search',
      text: discovery.lookMoreClosely,
    },
  ];
  const [activeInsight, setActiveInsight] = useState(insights[0].id);
  const selectedInsight =
    insights.find((insight) => insight.id === activeInsight) || insights[0];

  return (
    <div className={styles.discoveryExplorer}>
      <div>
        <p className={styles.interactionHint}>
          Choose a discovery point to reveal what ChloeLabs found.
        </p>
        <div className={styles.discoveryOrbit}>
          <div className={styles.orbitLine} aria-hidden="true" />
          <div className={styles.topicCore}>
            <GraphicIcon name="compass" />
            <strong>{topic}</strong>
          </div>
          {insights.map((insight, index) => (
            <button
              className={`${styles.orbitButton} ${
                styles[`orbitButton${index + 1}`]
              } ${
                activeInsight === insight.id ? styles.orbitButtonActive : ''
              }`}
              type="button"
              key={insight.id}
              aria-pressed={activeInsight === insight.id}
              aria-controls="active-discovery"
              onClick={() => setActiveInsight(insight.id)}>
              <GraphicIcon name={insight.icon} />
              <span>{insight.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>
      <article
        className={styles.discoveryReveal}
        id="active-discovery"
        aria-live="polite">
        <span className={styles.revealIcon}>
          <GraphicIcon name={selectedInsight.icon} />
        </span>
        <div>
          <span className={styles.revealLabel}>{selectedInsight.label}</span>
          <p>{selectedInsight.text}</p>
        </div>
      </article>
    </div>
  );
}

function ThinkingBridge({priorKnowledge, thinkingChange}) {
  const hasNewThinking = Boolean(thinkingChange.trim());

  return (
    <section className={styles.thinkingBridge} aria-label="How my thinking changed">
      <div className={styles.thinkingPanel}>
        <span className={styles.thinkingLabel}>Before exploring</span>
        <p>
          {priorKnowledge.trim() ||
            'I began with a question instead of a starting idea.'}
        </p>
      </div>
      <div
        className={`${styles.thinkingArrow} ${
          hasNewThinking ? styles.thinkingArrowActive : ''
        }`}
        aria-hidden="true">
        <span />
        <GraphicIcon name="arrow" />
      </div>
      <div
        className={`${styles.thinkingPanel} ${styles.thinkingPanelAfter} ${
          hasNewThinking ? styles.thinkingPanelFilled : ''
        }`}>
        <span className={styles.thinkingLabel}>After exploring</span>
        <p>
          {hasNewThinking
            ? thinkingChange
            : 'Write what you would keep, change, or add below.'}
        </p>
      </div>
    </section>
  );
}

function GraphicIcon({name}) {
  const paths = {
    spark: (
      <>
        <path d="M12 2l1.7 5.1L19 9l-5.3 1.9L12 16l-1.7-5.1L5 9l5.3-1.9L12 2z" />
        <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
      </>
    ),
    question: (
      <>
        <path d="M9.3 8.2a3 3 0 115.3 1.9c-.8.9-2.6 1.4-2.6 3.1" />
        <path d="M12 17.7h.01" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M15.8 8.2l-2.1 5.5-5.5 2.1 2.1-5.5 5.5-2.1z" />
      </>
    ),
    check: <path d="M5 12.5l4.2 4.2L19 7" />,
    reflect: (
      <>
        <path d="M5 7h10a4 4 0 014 4v1" />
        <path d="M8 4L5 7l3 3M19 17H9a4 4 0 01-4-4v-1" />
        <path d="M16 14l3 3-3 3" />
      </>
    ),
    bulb: (
      <>
        <path d="M8.5 14.5a6 6 0 117 0c-1 .8-1.5 1.8-1.5 3h-4c0-1.2-.5-2.2-1.5-3z" />
        <path d="M10 21h4M10 18h4" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="M15 15l5 5" />
      </>
    ),
    arrow: <path d="M4 12h15M14 7l5 5-5 5" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function StatusMessage({children}) {
  return (
    <div className={styles.statusMessage} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function ErrorMessage({message, actionLabel, onRetry}) {
  return (
    <div className={styles.errorMessage} role="alert">
      <p>{message}</p>
      <button
        className="button button--outline button--secondary"
        type="button"
        onClick={onRetry}>
        {actionLabel}
      </button>
    </div>
  );
}

async function requestLearnApi(path, payload, signal) {
  const response = await fetch(`${LEARN_API_URL}${path}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
    signal,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.error ||
        'ChloeLabs could not reach the learning service. Please try again.',
    );
  }

  return result;
}
