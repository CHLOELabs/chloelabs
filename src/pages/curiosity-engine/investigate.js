import {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import CometGuide from '../../components/CometGuide';
import styles from './investigate.module.css';

const API_URL = 'https://chloelabs-learn-api.chloelabs-amanda.workers.dev';
const types = ['observe', 'compare', 'measure', 'use data', 'test an idea', 'help me choose'];
const times = ['30 minutes', 'one day', 'several days', 'several weeks'];
const settings = ['indoors', 'outdoors', 'online public data', 'school or community'];
const emptyRow = () => ({trial: '', condition: '', observation: '', measurement: ''});

export default function InvestigatePath() {
  const location = useLocation();
  const topic = useMemo(() => new URLSearchParams(location.search).get('topic')?.trim() || 'something interesting', [location.search]);
  const [investigationType, setType] = useState('help me choose');
  const [time, setTime] = useState('one day');
  const [setting, setSetting] = useState('indoors');
  const [ideas, setIdeas] = useState([]);
  const [idea, setIdea] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [rows, setRows] = useState([emptyRow(), emptyRow(), emptyRow()]);
  const [claim, setClaim] = useState('');
  const [evidence, setEvidence] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [uncertainty, setUncertainty] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function generateIdeas() {
    setStatus('loading'); setError(''); setIdeas([]); setIdea(null);
    try {
      const response = await fetch(`${API_URL}/api/investigate/ideas`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({topic, ageBand: '10-12', investigationType, time, setting}),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not create investigations.');
      setIdeas(result.ideas); setStatus('ready');
    } catch (requestError) { setError(requestError.message); setStatus('error'); }
  }

  function chooseIdea(nextIdea) {
    setIdea(nextIdea); setPrediction(''); setRows(Array.from({length: Math.min(nextIdea.minimumRows, 5)}, emptyRow));
    setClaim(''); setEvidence(''); setReasoning(''); setUncertainty(''); setSaved(false);
  }

  function updateRow(index, key, value) {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? {...row, [key]: value} : row));
  }

  const measurements = rows
    .filter((row) => row.measurement.trim() !== '')
    .map((row) => Number(row.measurement))
    .filter(Number.isFinite);
  const maximum = Math.max(...measurements, 1);
  const stage = saved ? 6 : claim || evidence || reasoning ? 5 : measurements.length ? 4 : idea ? 3 : ideas.length ? 2 : 1;
  const clueGoal = idea?.minimumRows || 3;
  const cometState = saved
    ? {mood: 'celebrate', badge: 'Case saved', message: 'You followed the evidence all the way to a conclusion. That is real scientific thinking!'}
    : measurements.length
      ? {mood: 'clues', badge: `${measurements.length} clues`, message: measurements.length < clueGoal ? `Good clues! Collect ${clueGoal - measurements.length} more measurement${clueGoal - measurements.length === 1 ? '' : 's'} before deciding what they mean.` : 'You have enough clues to look for a pattern. What does the evidence support?'}
      : idea
        ? {mood: 'clues', badge: 'Field plan ready', message: 'Your question is pinned to the board. Add only observations you actually collect—never what you hope to see.'}
        : ideas.length
          ? {mood: 'thinking', badge: 'Three leads', message: 'Choose the question that makes you most curious. A good investigation is small enough to finish.'}
          : {mood: 'thinking', badge: 'Evidence detective', message: 'Give me a few boundaries and we’ll turn your curiosity into a question you can investigate safely.'};

  function saveInvestigation() {
    if (!claim.trim() || !evidence.trim() || !reasoning.trim()) return;
    const key = 'chloelabs:investigation-notebook:v1';
    let notebook = [];
    try { const stored = JSON.parse(localStorage.getItem(key) || '[]'); notebook = Array.isArray(stored) ? stored : []; } catch {}
    localStorage.setItem(key, JSON.stringify([...notebook, {id: Date.now(), topic, idea, prediction, rows, claim, evidence, reasoning, uncertainty, savedAt: new Date().toISOString()}]));
    setSaved(true);
  }

  return (
    <Layout title={`Investigate ${topic}`} description={`A ChloeLabs evidence investigation about ${topic}.`}>
      <main className={styles.page}>
        <header className={styles.hero}><div className="container">
          <Link className={styles.back} to={`/curiosity-engine?topic=${encodeURIComponent(topic)}`}>← Choose another path</Link>
          <span>Investigate path</span><Heading as="h1">Investigate {topic}</Heading>
          <p>Ask a testable question. Gather evidence. Decide what it supports.</p>
        </div></header>
        <div className={`container ${styles.content}`}>
          <Journey stage={stage} />
          <CometGuide {...cometState} />
          <Panel number="1" title="Design your investigation">
            <p>Choose boundaries. ChloeLabs will suggest safe questions—not answers.</p>
            <Chooser label="How will you investigate?" options={types} value={investigationType} setValue={setType} />
            <div className={styles.split}>
              <Chooser label="How much time?" options={times} value={time} setValue={setTime} />
              <Chooser label="Where?" options={settings} value={setting} setValue={setSetting} />
            </div>
            <button className="button button--primary button--lg" disabled={status === 'loading'} onClick={generateIdeas}>{status === 'loading' ? 'Forming questions…' : 'Create three investigations'}</button>
            {status === 'loading' && <p role="status">Checking scope, evidence, privacy, and safety…</p>}
            {error && <p className={styles.error}>{error}</p>}
          </Panel>

          {ideas.length > 0 && <Panel number="2" title="Choose a question">
            <div className={styles.ideaGrid}>{ideas.map((item) => <button key={item.title} className={`${styles.idea} ${idea?.title === item.title ? styles.selected : ''}`} onClick={() => chooseIdea(item)} aria-pressed={idea?.title === item.title}>
              <small>{item.level}</small><strong>{item.title}</strong><span>{item.question}</span><em>{item.time}</em>
            </button>)}</div>
          </Panel>}

          {idea && <>
            <DetectiveBoard idea={idea} measurements={measurements} clueGoal={clueGoal} claim={claim} saved={saved} />
            <Panel number="3" title="Approve the field plan">
              <div className={styles.plan}>
                <article><small>Record</small><p>{idea.whatToRecord}</p></article>
                <article><small>Materials</small><p>{idea.materials.join(', ')}</p></article>
                <article><small>Safety & privacy</small><p>{idea.safety}</p></article>
              </div>
              <ol>{idea.procedure.map((step) => <li key={step}>{step}</li>)}</ol>
              <label className={styles.label} htmlFor="prediction">My prediction</label>
              <p>{idea.predictionPrompt}</p>
              <textarea id="prediction" className={styles.textarea} value={prediction} onChange={(event) => setPrediction(event.target.value)} rows={3} placeholder="I predict… because…" />
            </Panel>
            <Panel number="4" title="Collect real evidence">
              <p>The AI leaves this table blank. Every result comes from you.</p>
              <div className={styles.tableWrap}><table><thead><tr><th>Trial</th><th>Condition</th><th>Observation</th><th>Measurement</th><th /></tr></thead>
                <tbody>{rows.map((row, index) => <tr key={index}>{['trial','condition','observation','measurement'].map((key) => <td key={key}><input aria-label={`${key} ${index + 1}`} type={key === 'measurement' ? 'number' : 'text'} value={row[key]} onChange={(event) => updateRow(index, key, event.target.value)} /></td>)}<td><button aria-label={`Delete row ${index + 1}`} onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}>×</button></td></tr>)}</tbody>
              </table></div>
              <button className="button button--outline button--secondary" onClick={() => setRows((current) => [...current, emptyRow()])}>+ Add evidence row</button>
              {measurements.length > 0 && <div className={styles.chart} aria-label="Measurement chart">{rows.map((row, index) => { const value = Number(row.measurement); return row.measurement.trim() !== '' && Number.isFinite(value) ? <div key={index}><span style={{height: `${Math.max(8, value / maximum * 100)}%`}} /><small>{row.trial || index + 1}</small></div> : null; })}</div>}
            </Panel>
            <Panel number="5" title="Build an evidence-based conclusion">
              <div className={styles.cer}>
                <TextField label="Claim" value={claim} setValue={setClaim} placeholder="My investigation suggests…" />
                <TextField label="Evidence" value={evidence} setValue={setEvidence} placeholder="The observations or measurements that support this are…" />
                <TextField label="Reasoning" value={reasoning} setValue={setReasoning} placeholder="This evidence supports my claim because…" />
                <TextField label="Uncertainty" value={uncertainty} setValue={setUncertainty} placeholder="I still cannot conclude…" />
              </div>
              <button className="button button--primary button--lg" disabled={!claim.trim() || !evidence.trim() || !reasoning.trim()} onClick={saveInvestigation}>Save to my Investigation Notebook</button>
              {saved && <p className={styles.saved} role="status"><strong>Investigation saved.</strong> Your plan, real evidence, and conclusion are stored in this browser.</p>}
            </Panel>
          </>}
        </div>
      </main>
    </Layout>
  );
}

function Journey({stage}) { return <nav className={styles.journey} aria-label="Your investigation journey">{['Design','Question','Plan','Evidence','Reason','Save'].map((label,index) => <div className={index + 1 < stage ? styles.done : index + 1 === stage ? styles.current : ''} key={label}><span>{index + 1 < stage ? '✓' : index + 1}</span><small>{label}</small></div>)}</nav>; }
function Panel({number,title,children}) { return <section className={styles.panel}><span className={styles.number}>{number}</span><div><Heading as="h2">{title}</Heading>{children}</div></section>; }
function Chooser({label,options,value,setValue}) { return <fieldset className={styles.fieldset}><legend>{label}</legend><div className={styles.chips}>{options.map((option) => <button type="button" className={value === option ? styles.chipOn : ''} aria-pressed={value === option} onClick={() => setValue(option)} key={option}>{option}</button>)}</div></fieldset>; }
function TextField({label,value,setValue,placeholder}) { return <label><strong>{label}</strong><textarea className={styles.textarea} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} rows={3} /></label>; }
function DetectiveBoard({idea, measurements, clueGoal, claim, saved}) {
  const enough = measurements.length >= clueGoal;
  return <section className={styles.detectiveScene} aria-label="Interactive evidence board">
    <div className={styles.corkBoard}>
      <article className={styles.questionPin}><span className={styles.pin} /><small>Question</small><strong>{idea.question}</strong></article>
      <svg className={styles.string} viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true"><path d="M115 55 C220 20 225 160 310 120 S455 45 515 95" /></svg>
      <div className={styles.clueArea} aria-label={`${measurements.length} evidence clues collected`}>
        {Array.from({length: Math.min(Math.max(measurements.length, 1), 6)}, (_, index) => measurements[index] !== undefined
          ? <span className={styles.clue} key={index} style={{'--clue-index': index}}>Clue {index + 1}<b>{measurements[index]}</b></span>
          : <span className={`${styles.clue} ${styles.clueEmpty}`} key={index}>?</span>)}
      </div>
      <article className={`${styles.conclusionPin} ${claim ? styles.active : ''}`}><span className={styles.pin} /><small>Conclusion</small><strong>{claim || (enough ? 'Ready for your claim' : 'Need more clues')}</strong></article>
      {saved && <div className={styles.caseStamp}>Case supported!</div>}
    </div>
    <div className={styles.fieldMonitor}>
      <span className={styles.monitorLight} />
      <strong>Field monitor</strong>
      <div className={styles.miniChart}>{measurements.length ? measurements.slice(0,6).map((value,index) => <i key={index} style={{height:`${Math.max(12, value / Math.max(...measurements,1) * 100)}%`}} />) : <p>Waiting for data…</p>}</div>
      <small>{measurements.length}/{clueGoal} clues</small>
    </div>
  </section>;
}
