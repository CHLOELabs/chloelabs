import {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import styles from './build.module.css';

const API_URL = 'https://chloelabs-learn-api.chloelabs-amanda.workers.dev';
const AGE_BAND = '10-12';
const NOTEBOOK_KEY = 'chloelabs:build-notebook:v1';
const typeOptions = [
  ['physical model', 'Model', 'Build something you can hold'],
  ['game', 'Game', 'Make rules, choices, and a challenge'],
  ['interactive webpage', 'Webpage', 'Create something people can use'],
  ['diagram or animation', 'Visual', 'Show how an idea works'],
  ['simple tool', 'Tool', 'Make something useful'],
  ['help me choose', 'Surprise me', 'Let ChloeLabs mix the possibilities'],
];
const timeOptions = ['30 minutes', 'a few hours', 'several days'];
const levelOptions = ['starter', 'growing', 'challenge'];
const toolOptions = [
  'craft materials',
  'computer',
  'coding',
  'building materials',
  'household materials',
];

export default function BuildPath() {
  const location = useLocation();
  const topic = useMemo(() => {
    const value = new URLSearchParams(location.search).get('topic');
    return value?.trim() || 'something interesting';
  }, [location.search]);
  const [buildType, setBuildType] = useState('help me choose');
  const [time, setTime] = useState('a few hours');
  const [difficulty, setDifficulty] = useState('growing');
  const [tools, setTools] = useState(['household materials']);
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [buildNotes, setBuildNotes] = useState('');
  const [testNotes, setTestNotes] = useState('');
  const [improvement, setImprovement] = useState('');
  const [saved, setSaved] = useState(false);
  const draftKey = `chloelabs:build-draft:v1:${topic.toLowerCase()}`;

  useEffect(() => {
    try {
      const draft = JSON.parse(window.localStorage.getItem(draftKey) || '{}');
      if (draft.selectedIdea) setSelectedIdea(draft.selectedIdea);
      if (Array.isArray(draft.completedSteps)) {
        setCompletedSteps(draft.completedSteps);
      }
      if (typeof draft.buildNotes === 'string') setBuildNotes(draft.buildNotes);
      if (typeof draft.testNotes === 'string') setTestNotes(draft.testNotes);
      if (typeof draft.improvement === 'string') {
        setImprovement(draft.improvement);
      }
    } catch {
      // A damaged browser draft should never block a new build.
    }
  }, [draftKey]);

  useEffect(() => {
    if (!selectedIdea) return;
    window.localStorage.setItem(
      draftKey,
      JSON.stringify({
        selectedIdea,
        completedSteps,
        buildNotes,
        testNotes,
        improvement,
      }),
    );
  }, [
    buildNotes,
    completedSteps,
    draftKey,
    improvement,
    selectedIdea,
    testNotes,
  ]);

  const stage = saved
    ? 6
    : improvement.trim()
      ? 6
      : testNotes.trim()
        ? 5
        : completedSteps.length
          ? 4
          : selectedIdea
            ? 3
            : ideas.length
              ? 2
              : 1;

  function toggleTool(tool) {
    setTools((current) =>
      current.includes(tool)
        ? current.filter((item) => item !== tool)
        : [...current, tool],
    );
  }

  async function generateIdeas() {
    setStatus('loading');
    setError('');
    setIdeas([]);
    setSelectedIdea(null);
    setCompletedSteps([]);
    setSaved(false);
    try {
      const response = await fetch(`${API_URL}/api/build/ideas`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          topic,
          ageBand: AGE_BAND,
          buildType,
          time,
          difficulty,
          tools,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Could not create build ideas.');
      }
      setIdeas(result.ideas);
      setStatus('ready');
    } catch (requestError) {
      setError(requestError.message);
      setStatus('error');
    }
  }

  function chooseIdea(idea) {
    setSelectedIdea(idea);
    setCompletedSteps([]);
    setBuildNotes('');
    setTestNotes('');
    setImprovement('');
    setSaved(false);
  }

  function toggleStep(index) {
    setCompletedSteps((current) =>
      current.includes(index)
        ? current.filter((step) => step !== index)
        : [...current, index],
    );
    setSaved(false);
  }

  function saveBuild() {
    if (!selectedIdea || !testNotes.trim() || !improvement.trim()) return;
    const notebook = JSON.parse(
      window.localStorage.getItem(NOTEBOOK_KEY) || '[]',
    );
    const entries = Array.isArray(notebook) ? notebook : [];
    window.localStorage.setItem(
      NOTEBOOK_KEY,
      JSON.stringify([
        ...entries,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          topic,
          project: selectedIdea,
          completedSteps,
          buildNotes: buildNotes.trim(),
          testNotes: testNotes.trim(),
          improvement: improvement.trim(),
          savedAt: new Date().toISOString(),
        },
      ]),
    );
    setSaved(true);
  }

  return (
    <Layout
      title={`Build something about ${topic}`}
      description={`A guided ChloeLabs build about ${topic}.`}>
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className="container">
            <Link
              className={styles.backLink}
              to={`/curiosity-engine?topic=${encodeURIComponent(topic)}`}>
              ← Choose another path
            </Link>
            <span className={styles.eyebrow}>Build path</span>
            <Heading as="h1">Build something about {topic}</Heading>
            <p>Choose your tools. Pick an idea. Make, test, and improve it.</p>
          </div>
        </header>

        <div className={`container ${styles.content}`}>
          <BuildJourney stage={stage} />

          <section className={styles.panel}>
            <span className={styles.number}>1</span>
            <div>
              <Heading as="h2">Set up your build</Heading>
              <p>Give ChloeLabs boundaries so every idea is actually doable.</p>

              <Fieldset legend="What would you like to make?">
                <div className={styles.typeGrid}>
                  {typeOptions.map(([value, label, description]) => (
                    <ChoiceButton
                      key={value}
                      selected={buildType === value}
                      onClick={() => setBuildType(value)}
                      title={label}
                      description={description}
                    />
                  ))}
                </div>
              </Fieldset>

              <div className={styles.twoColumns}>
                <Fieldset legend="How much time do you have?">
                  <div className={styles.chipRow}>
                    {timeOptions.map((option) => (
                      <Chip
                        key={option}
                        selected={time === option}
                        onClick={() => setTime(option)}>
                        {option}
                      </Chip>
                    ))}
                  </div>
                </Fieldset>
                <Fieldset legend="Choose your challenge">
                  <div className={styles.chipRow}>
                    {levelOptions.map((option) => (
                      <Chip
                        key={option}
                        selected={difficulty === option}
                        onClick={() => setDifficulty(option)}>
                        {option}
                      </Chip>
                    ))}
                  </div>
                </Fieldset>
              </div>

              <Fieldset legend="What can you use?">
                <div className={styles.chipRow}>
                  {toolOptions.map((tool) => (
                    <Chip
                      key={tool}
                      selected={tools.includes(tool)}
                      onClick={() => toggleTool(tool)}>
                      {tool}
                    </Chip>
                  ))}
                </div>
              </Fieldset>

              <button
                className="button button--primary button--lg"
                type="button"
                disabled={status === 'loading'}
                onClick={generateIdeas}>
                {status === 'loading'
                  ? 'Sketching ideas…'
                  : 'Create three build ideas'}
              </button>
              {status === 'loading' && (
                <p className={styles.loading} role="status">
                  <span /> Turning your constraints into realistic builds…
                </p>
              )}
              {error && <p className={styles.error}>{error}</p>}
            </div>
          </section>

          {ideas.length > 0 && (
            <section className={styles.panel}>
              <span className={styles.number}>2</span>
              <div>
                <Heading as="h2">Choose your build</Heading>
                <p>Each option fits the boundaries you selected.</p>
                <div className={styles.ideaGrid}>
                  {ideas.map((idea, index) => (
                    <button
                      className={`${styles.ideaCard} ${
                        selectedIdea?.title === idea.title
                          ? styles.ideaSelected
                          : ''
                      }`}
                      type="button"
                      key={idea.title}
                      onClick={() => chooseIdea(idea)}
                      aria-pressed={selectedIdea?.title === idea.title}>
                      <span className={styles.ideaNumber}>0{index + 1}</span>
                      <span className={styles.ideaDifficulty}>
                        {idea.difficulty}
                      </span>
                      <strong>{idea.title}</strong>
                      <span>{idea.summary}</span>
                      <span className={styles.ideaMeta}>
                        {idea.time} · {idea.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {selectedIdea && (
            <>
              <section className={styles.blueprint}>
                <div className={styles.blueprintHeader}>
                  <span>Project blueprint</span>
                  <strong>{selectedIdea.title}</strong>
                  <p>{selectedIdea.goal}</p>
                </div>
                <div className={styles.blueprintFacts}>
                  <BlueprintFact label="Materials" items={selectedIdea.materials} />
                  <BlueprintFact label="Skills" items={selectedIdea.skills} />
                  <BlueprintFact
                    label="Finished looks like"
                    text={selectedIdea.finishedLooksLike}
                  />
                </div>
              </section>

              <section className={styles.panel}>
                <span className={styles.number}>3</span>
                <div>
                  <Heading as="h2">Make it step by step</Heading>
                  <p>Check off each piece as you complete it. Your progress saves in this browser.</p>
                  <div className={styles.stepList}>
                    {selectedIdea.steps.map((step, index) => {
                      const complete = completedSteps.includes(index);
                      return (
                        <button
                          className={`${styles.buildStep} ${
                            complete ? styles.buildStepComplete : ''
                          }`}
                          type="button"
                          key={`${step.title}-${index}`}
                          onClick={() => toggleStep(index)}
                          aria-pressed={complete}>
                          <span className={styles.stepCheck}>
                            {complete ? '✓' : index + 1}
                          </span>
                          <span>
                            <strong>{step.title}</strong>
                            <small>{step.action}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <label className={styles.label} htmlFor="build-notes">
                    What changed while you built?
                  </label>
                  <textarea
                    id="build-notes"
                    className={styles.textarea}
                    value={buildNotes}
                    onChange={(event) => setBuildNotes(event.target.value)}
                    placeholder="I changed the plan because…"
                    rows={3}
                  />
                </div>
              </section>

              <section className={styles.panel}>
                <span className={styles.number}>4</span>
                <div>
                  <Heading as="h2">Test your build</Heading>
                  <div className={styles.testGrid}>
                    {selectedIdea.tests.map((test, index) => (
                      <article key={test}>
                        <span>Test {index + 1}</span>
                        <p>{test}</p>
                      </article>
                    ))}
                  </div>
                  <label className={styles.label} htmlFor="test-notes">
                    What happened when you tested it?
                  </label>
                  <textarea
                    id="test-notes"
                    className={styles.textarea}
                    value={testNotes}
                    onChange={(event) => {
                      setTestNotes(event.target.value);
                      setSaved(false);
                    }}
                    placeholder="The test showed me…"
                    rows={4}
                  />
                </div>
              </section>

              <section className={styles.panel}>
                <span className={styles.number}>5</span>
                <div>
                  <Heading as="h2">Improve and finish</Heading>
                  <div className={styles.iterationGraphic}>
                    <span>First version</span>
                    <b>→</b>
                    <span>What I noticed</span>
                    <b>→</b>
                    <span className={improvement.trim() ? styles.lit : ''}>
                      Improved version
                    </span>
                  </div>
                  <label className={styles.label} htmlFor="improvement">
                    What did you improve—or what would you try next?
                  </label>
                  <textarea
                    id="improvement"
                    className={styles.textarea}
                    value={improvement}
                    onChange={(event) => {
                      setImprovement(event.target.value);
                      setSaved(false);
                    }}
                    placeholder="I improved my build by…"
                    rows={4}
                  />
                  <button
                    className="button button--primary button--lg"
                    type="button"
                    disabled={!testNotes.trim() || !improvement.trim()}
                    onClick={saveBuild}>
                    Save to my Build Notebook
                  </button>
                  {saved && (
                    <p className={styles.saved} role="status">
                      <strong>Build saved!</strong> Your blueprint, progress,
                      test, and improvement notes are stored in this browser.
                    </p>
                  )}
                  {saved && (
                    <Link
                      className="button button--secondary button--lg"
                      to="/my-lab-notebook">
                      View My Lab Notebook
                    </Link>
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

function BuildJourney({stage}) {
  const labels = ['Set up', 'Choose', 'Plan', 'Make', 'Test', 'Improve'];
  return (
    <nav className={styles.journey} aria-label="Your build journey">
      {labels.map((label, index) => (
        <div
          key={label}
          className={`${styles.journeyItem} ${
            index + 1 < stage ? styles.complete : ''
          } ${index + 1 === stage ? styles.current : ''}`}>
          <span>{index + 1 < stage ? '✓' : index + 1}</span>
          <small>{label}</small>
        </div>
      ))}
    </nav>
  );
}

function Fieldset({legend, children}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
}

function ChoiceButton({selected, onClick, title, description}) {
  return (
    <button
      className={`${styles.typeCard} ${selected ? styles.choiceSelected : ''}`}
      type="button"
      onClick={onClick}
      aria-pressed={selected}>
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}

function Chip({selected, onClick, children}) {
  return (
    <button
      className={`${styles.chip} ${selected ? styles.chipSelected : ''}`}
      type="button"
      onClick={onClick}
      aria-pressed={selected}>
      {children}
    </button>
  );
}

function BlueprintFact({label, items, text}) {
  return (
    <article>
      <span>{label}</span>
      {items ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{text}</p>
      )}
    </article>
  );
}
