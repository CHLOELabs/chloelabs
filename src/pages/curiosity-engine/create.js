import {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import CometGuide from '../../components/CometGuide';
import DraftControls from '../../components/DraftControls';
import ChallengeLadder from '../../components/ChallengeLadder';
import {NextAdventure, PathJourneyMap} from '../../components/CuriosityJourney';
import TrustNotice from '../../components/TrustNotice';
import {upsertNotebookEntry} from '../../lib/notebookStorage';
import {ensureProjectForTopic} from '../../lib/projectStorage';
import {ageBandForMode, learnerModeFromSearch} from '../../lib/learnerMode';
import {useBrowserDraft} from '../../lib/useBrowserDraft';
import styles from './creativePaths.module.css';

const API='https://chloelabs-learn-api.chloelabs-amanda.workers.dev';
const formats=['story','illustration','comic','video plan','digital exhibit','help me choose'];
const times=['30 minutes','a few hours','several days'];

export default function CreatePath(){
  const location=useLocation();
  const topic=useMemo(()=>new URLSearchParams(location.search).get('topic')?.trim()||'something interesting',[location.search]);
  const learnerMode=useMemo(()=>learnerModeFromSearch(location.search),[location.search]),ageBand=ageBandForMode(learnerMode);
  const resumeId=useMemo(()=>new URLSearchParams(location.search).get('resume')||'',[location.search]);
  const fromPath=useMemo(()=>new URLSearchParams(location.search).get('from')||'',[location.search]);
  const [format,setFormat]=useState('help me choose'),[time,setTime]=useState('a few hours');
  const [ideas,setIdeas]=useState([]),[idea,setIdea]=useState(null),[drafts,setDrafts]=useState([]),[reflection,setReflection]=useState('');
  const [status,setStatus]=useState('idle'),[error,setError]=useState(''),[saved,setSaved]=useState(false);
  const draftSnapshot=useMemo(()=>({format,time,ideas,idea,drafts,reflection,saved}),[format,time,ideas,idea,drafts,reflection,saved]);
  const draft=useBrowserDraft({path:'create',topic,resumeId,snapshot:draftSnapshot,resumeToDraft:(entry)=>({format:entry.idea?.format||'help me choose',time:'a few hours',ideas:entry.idea?[entry.idea]:[],idea:entry.idea||null,drafts:entry.drafts||[],reflection:entry.reflection||'',saved:true}),restore:(data)=>{setFormat(data.format||'help me choose');setTime(data.time||'a few hours');setIdeas(Array.isArray(data.ideas)?data.ideas:[]);setIdea(data.idea||null);setDrafts(Array.isArray(data.drafts)?data.drafts:[]);setReflection(data.reflection||'');setSaved(Boolean(data.saved))}});
  const completed=drafts.filter((value)=>value?.trim()).length;
  async function generate(){setStatus('loading');setError('');setIdea(null);try{const response=await fetch(`${API}/api/create/ideas`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic,ageBand,format,time})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not open the idea studio.');setIdeas(result.ideas);setStatus('ready')}catch(e){setError(e.message);setStatus('error')}}
  function choose(next){setIdea(next);setDrafts(next.steps.map(()=>''));setReflection('');setSaved(false)}
  function save(){if(!idea||!reflection.trim())return;upsertNotebookEntry('chloelabs:create-notebook:v1',{id:draft.projectId,parentProjectId:ensureProjectForTopic(topic).id,topic,idea,drafts,reflection,savedAt:new Date().toISOString()});setSaved(true)}
  function startOver(){if(!window.confirm('Start this creation over? Your notebook entry will stay saved.'))return;draft.clearDraft();setFormat('help me choose');setTime('a few hours');setIdeas([]);setIdea(null);setDrafts([]);setReflection('');setStatus('idle');setError('');setSaved(false)}
  const message=saved?'Your creation is saved! You took an idea through drafting and revision—studio magic complete.':idea?completed?`${completed} of ${idea.steps.length} creative stars are glowing. Keep making choices that feel like yours.`:'The storyboard is ready. I supplied the structure; you supply every original idea.':ideas.length?'Pick the concept that makes your imagination start moving.':'Choose a format and I’ll help you find three ways to transform curiosity into something original.';
  return <Layout title={`Create something about ${topic}`}><main className={`${styles.page} ${styles.createPage}`}>
    <header className={styles.hero}><div className="container"><Link className={styles.back} to={`/curiosity-engine?topic=${encodeURIComponent(topic)}`}>← Choose another path</Link><span>Create path</span><Heading as="h1">Create with {topic}</Heading><p>Imagine it. Draft it. Shape it into something only you would make.</p></div></header>
    <div className={`container ${styles.content}`}><DraftControls noun="creation" onStartOver={startOver} restored={draft.restored} status={draft.status}/><PathJourneyMap currentPath="create" fromPath={fromPath} mode={learnerMode} topic={topic}/><TrustNotice path="create"/><CometGuide role="studio" mood={saved?'celebrate':'thinking'} badge={saved?'Creation saved':'Idea studio'} message={message}/>
      <Panel n="1" title="Choose your creative canvas"><Chooser label="What might you create?" options={formats} value={format} set={setFormat}/><Chooser label="How much time?" options={times} value={time} set={setTime}/><button className="button button--primary button--lg" disabled={status==='loading'} onClick={generate}>{status==='loading'?'Mixing possibilities…':'Create three concepts'}</button>{error&&<p className={styles.error}>{error}</p>}</Panel>
      {ideas.length>0&&<Panel n="2" title="Choose your creative spark"><div className={styles.ideaGrid}>{ideas.map((item,index)=><button key={item.title} className={`${styles.idea} ${idea?.title===item.title?styles.selected:''}`} onClick={()=>choose(item)} aria-pressed={idea?.title===item.title}><b>✦ 0{index+1}</b><small>{item.format}</small><strong>{item.title}</strong><span>{item.concept}</span></button>)}</div></Panel>}
      {idea&&<><CreativeConstellation steps={idea.steps} drafts={drafts}/><Panel n="3" title="Build your storyboard"><div className={styles.prompt}><small>Creative spark—not finished content</small><p>{idea.creativePrompt}</p></div><div className={styles.storyboard}>{idea.steps.map((step,index)=><label key={step}><span><b>{index+1}</b>{step}</span><textarea value={drafts[index]} onChange={e=>setDrafts(current=>current.map((v,i)=>i===index?e.target.value:v))} placeholder="My original idea…" rows={3}/></label>)}</div></Panel>
      <Panel n="4" title="Revise and finish"><div className={styles.finishCard}><small>Finished looks like</small><p>{idea.finishedLooksLike}</p><b>Materials: {idea.materials.join(', ')}</b></div><label className={styles.label}>What choice made this creation feel like yours?<textarea className={styles.textarea} value={reflection} onChange={e=>{setReflection(e.target.value);setSaved(false)}} rows={4} placeholder="It became mine when I…"/></label><button className="button button--primary button--lg" disabled={!reflection.trim()} onClick={save}>Save to my Creation Notebook</button>{saved&&<><p className={styles.saved}>✦ Creation saved in this browser.</p><Link className="button button--secondary button--lg" to="/my-lab-notebook">View My Lab Notebook</Link></>}</Panel></>}
      <ChallengeLadder path="create" ready={saved} topic={topic}/><NextAdventure currentPath="create" mode={learnerMode} saved={saved} topic={topic}/>
    </div></main></Layout>
}
function CreativeConstellation({steps,drafts}){return <section className={styles.constellation} aria-label="Creative constellation"><div className={styles.moon}>My idea</div><svg viewBox="0 0 700 180" preserveAspectRatio="none" aria-hidden="true"><path d="M70 95 L190 35 L330 120 L475 45 L625 100"/></svg>{steps.map((step,index)=><div key={step} className={`${styles.star} ${drafts[index]?.trim()?styles.starOn:''}`} style={{left:`${8+index*(82/Math.max(steps.length-1,1))}%`,top:index%2? '18%':'58%'}}><span>★</span><small>{index+1}</small></div>)}</section>}
function Panel({n,title,children}){return <section className={styles.panel}><span className={styles.number}>{n}</span><div><Heading as="h2">{title}</Heading>{children}</div></section>}
function Chooser({label,options,value,set}){return <fieldset className={styles.fieldset}><legend>{label}</legend><div className={styles.chips}>{options.map(x=><button type="button" className={value===x?styles.chipOn:''} aria-pressed={value===x} onClick={()=>set(x)} key={x}>{x}</button>)}</div></fieldset>}
