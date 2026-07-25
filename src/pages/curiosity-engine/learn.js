import {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import styles from './learn.module.css';

const LEARN_API_URL =
  'https://chloelabs-learn-api.chloelabs-amanda.workers.dev';
const DEFAULT_TOPIC = 'something interesting';
const AGE_BAND = '10-12';

export default function LearnPath() {
  const location = useLocation();
  const topic = useMemo(() => {
    const value = new URLSearchParams(location.search).get('topic');
    return value?.trim() || DEFAULT_TOPIC;
  }, [location.search]);

  const [priorKnowledge, setPriorKnowledge] = useState('');
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
    if (!explanation.trim()) return;
    setSaved(true);
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
          <aside className={styles.aiNotice}>
            <strong>AI-guided, human-powered</strong>
            <span>
              ChloeLabs researches and organizes information. You decide what
              it means and explain it yourself. Check the sources before
              trusting an important claim.
            </span>
          </aside>

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
              <p className={styles.privacyNote}>
                This writing stays in your browser and is not sent to the AI.
              </p>
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
                  <div className={styles.discoveryGrid}>
                    <DiscoveryCard
                      label="Big idea"
                      text={discovery.bigIdea}
                    />
                    <DiscoveryCard
                      label="Surprising fact"
                      text={discovery.surprisingFact}
                    />
                    <DiscoveryCard
                      label="Look more closely"
                      text={discovery.lookMoreClosely}
                    />
                  </div>

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
                  <Heading as="h2">Explain it in your own words</Heading>
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
                  <p className={styles.nextQuestion}>
                    <strong>A possible next question:</strong>{' '}
                    {discovery.nextQuestion}
                  </p>
                  <div className={styles.actions}>
                    <button
                      className="button button--primary button--lg"
                      type="button"
                      disabled={!explanation.trim()}
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
                    <div className={styles.savedMessage} role="status">
                      <strong>Reflection ready!</strong>
                      <span>
                        This prototype keeps it on this page. Persistent Lab
                        Notebook saving is the next product step.
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </Layout>
  );
}

function DiscoveryCard({label, text}) {
  return (
    <article className={styles.discoveryCard}>
      <span>{label}</span>
      <p>{text}</p>
    </article>
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
