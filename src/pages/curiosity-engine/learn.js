import {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import styles from './learn.module.css';

const DEFAULT_TOPIC = 'something interesting';

const owlQuestions = [
  'How can owls see and hunt at night?',
  'Why can owls fly so quietly?',
  'Do all owls live and hunt in the same way?',
];

function buildQuestions(topic) {
  if (topic.toLowerCase().includes('owl')) return owlQuestions;

  return [
    `What makes ${topic} interesting or unusual?`,
    `How does ${topic} work?`,
    `How does ${topic} affect the world around us?`,
  ];
}

function buildDiscovery(topic, question) {
  if (topic.toLowerCase().includes('owl') && question.toLowerCase().includes('quiet')) {
    return [
      {
        label: 'Big idea',
        text: 'Special feather shapes soften the sound made as air moves over an owl’s wings.',
      },
      {
        label: 'Surprising fact',
        text: 'Quiet flight helps an owl hear its prey while the owl itself is moving.',
      },
      {
        label: 'Look more closely',
        text: 'Compare the soft, fringed edge of an owl feather with the smoother edge of another bird’s feather.',
      },
    ];
  }

  return [
    {
      label: 'Big idea',
      text: `A strong way to learn about ${topic} is to look for the structures, systems, or patterns that make it work.`,
    },
    {
      label: 'Surprising fact',
      text: `The most memorable discoveries about ${topic} often begin when something does not behave the way we expect.`,
    },
    {
      label: 'Look more closely',
      text: `Find one reliable book, museum, university, or science source about ${topic}, then write down one detail you can verify.`,
    },
  ];
}

export default function LearnPath() {
  const location = useLocation();
  const topic = useMemo(() => {
    const value = new URLSearchParams(location.search).get('topic');
    return value?.trim() || DEFAULT_TOPIC;
  }, [location.search]);
  const questions = useMemo(() => buildQuestions(topic), [topic]);

  const [priorKnowledge, setPriorKnowledge] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [checkedAnswer, setCheckedAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [saved, setSaved] = useState(false);

  const activeQuestion =
    selectedQuestion === 'custom' ? customQuestion.trim() : selectedQuestion;
  const discoveryCards = useMemo(
    () => buildDiscovery(topic, activeQuestion),
    [topic, activeQuestion],
  );

  const isOwlQuietFlight =
    topic.toLowerCase().includes('owl') &&
    activeQuestion.toLowerCase().includes('quiet');

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
            <Link className={styles.backLink} to={`/curiosity-engine?topic=${encodeURIComponent(topic)}`}>
              ← Choose another path
            </Link>
            <span className={styles.eyebrow}>Learn path</span>
            <Heading as="h1">Learn about {topic}</Heading>
            <p>Let’s turn a big curiosity into one question you can explain in your own words.</p>
          </div>
        </header>

        <div className={`container ${styles.content}`}>
          <section className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div>
              <Heading as="h2">What do you already know?</Heading>
              <p>Write what you know—or what you think might be true. It is okay to be unsure.</p>
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
            </div>
          </section>

          <section className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div>
              <Heading as="h2">Choose a learning question</Heading>
              <p>A focused question is easier to explore than a giant topic.</p>
              <div className={styles.questionGrid}>
                {questions.map((question) => (
                  <button
                    className={`${styles.questionCard} ${selectedQuestion === question ? styles.selected : ''}`}
                    key={question}
                    type="button"
                    onClick={() => {
                      setSelectedQuestion(question);
                      setSaved(false);
                    }}
                    aria-pressed={selectedQuestion === question}>
                    {question}
                  </button>
                ))}
                <button
                  className={`${styles.questionCard} ${selectedQuestion === 'custom' ? styles.selected : ''}`}
                  type="button"
                  onClick={() => {
                    setSelectedQuestion('custom');
                    setSaved(false);
                  }}
                  aria-pressed={selectedQuestion === 'custom'}>
                  Write my own question
                </button>
              </div>

              {selectedQuestion === 'custom' && (
                <div className={styles.customQuestion}>
                  <label className={styles.label} htmlFor="custom-question">My question</label>
                  <input
                    id="custom-question"
                    className={styles.input}
                    value={customQuestion}
                    onChange={(event) => setCustomQuestion(event.target.value)}
                    placeholder={`What do you wonder about ${topic}?`}
                  />
                </div>
              )}
            </div>
          </section>

          {activeQuestion && (
            <>
              <section className={styles.step} aria-live="polite">
                <span className={styles.stepNumber}>3</span>
                <div>
                  <Heading as="h2">Discover</Heading>
                  <p className={styles.activeQuestion}>{activeQuestion}</p>
                  <div className={styles.discoveryGrid}>
                    {discoveryCards.map((card) => (
                      <article className={styles.discoveryCard} key={card.label}>
                        <span>{card.label}</span>
                        <p>{card.text}</p>
                      </article>
                    ))}
                  </div>
                  {!isOwlQuietFlight && (
                    <p className={styles.prototypeNote}>
                      This prototype demonstrates the learning flow. Topic-specific,
                      cited discoveries will be added with the research service.
                    </p>
                  )}
                </div>
              </section>

              <section className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div>
                  <Heading as="h2">Check your understanding</Heading>
                  <p>Which choice best describes useful scientific learning?</p>
                  <div className={styles.answerList}>
                    {[
                      'Remembering every sentence exactly',
                      'Using evidence to explain an idea',
                      'Choosing the longest answer',
                    ].map((choice) => (
                      <label className={styles.answerChoice} key={choice}>
                        <input
                          type="radio"
                          name="understanding"
                          value={choice}
                          checked={answer === choice}
                          onChange={(event) => {
                            setAnswer(event.target.value);
                            setCheckedAnswer('');
                          }}
                        />
                        <span>{choice}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    className="button button--secondary"
                    type="button"
                    disabled={!answer}
                    onClick={() => setCheckedAnswer(answer)}>
                    Check my answer
                  </button>
                  {checkedAnswer && (
                    <p className={checkedAnswer === 'Using evidence to explain an idea' ? styles.correct : styles.tryAgain}>
                      {checkedAnswer === 'Using evidence to explain an idea'
                        ? 'Exactly. Evidence helps you support and communicate what you learned.'
                        : 'Try again. Think about how scientists support an explanation.'}
                    </p>
                  )}
                </div>
              </section>

              <section className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div>
                  <Heading as="h2">Explain it in your own words</Heading>
                  <p>Imagine Comet asked you about this. What would you say?</p>
                  <label className={styles.label} htmlFor="explanation">My explanation</label>
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
                  <div className={styles.actions}>
                    <button
                      className="button button--primary button--lg"
                      type="button"
                      disabled={!explanation.trim()}
                      onClick={saveReflection}>
                      Save to my Lab Notebook
                    </button>
                    <Link className="button button--outline button--secondary button--lg" to="/curiosity-engine">
                      Explore another question
                    </Link>
                  </div>
                  {saved && (
                    <div className={styles.savedMessage} role="status">
                      <strong>Reflection ready!</strong>
                      <span>
                        This prototype keeps it on this page. Persistent Lab Notebook
                        saving is the next product step.
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
