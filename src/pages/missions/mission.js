import {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {getMission, MISSIONS} from '../../data/missions';
import {
  readMissionAttempts,
  saveMissionAttempt,
} from '../../lib/missionStorage';
import styles from './mission.module.css';

const ROUTE = ['Browser', 'Internet', 'Server', 'Internet', 'Browser'];

export default function MissionDetail() {
  const location = useLocation();
  const missionId = useMemo(
    () => new URLSearchParams(location.search).get('id') || MISSIONS[0].id,
    [location.search],
  );
  const mission = getMission(missionId);

  if (!mission?.available) {
    return (
      <Layout title="Mission not available">
        <main className={styles.notFound}>
          <Heading as="h1">That mission is not ready yet.</Heading>
          <Link className="button button--primary" to="/missions">
            Choose another mission
          </Link>
        </main>
      </Layout>
    );
  }

  return <WebsiteMission mission={mission} />;
}

function WebsiteMission({mission}) {
  const [route, setRoute] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState('');
  const [caption, setCaption] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [savedMessage, setSavedMessage] = useState('');
  const won = route.length === ROUTE.length;
  const nextStop = ROUTE[route.length];

  useEffect(() => {
    setAttempts(
      readMissionAttempts().filter(
        (attempt) => attempt.missionId === mission.id,
      ),
    );
  }, [mission.id]);

  function sendTo(stop) {
    if (won) return;
    if (stop === nextStop) {
      setRoute((current) => [...current, stop]);
      setSavedMessage('');
    } else {
      setResult(`The packet reached ${stop}, but it needed ${nextStop} next.`);
    }
  }

  function resetRoute() {
    setRoute([]);
    setResult('');
    setSavedMessage('');
  }

  function saveAttempt() {
    const attempt = saveMissionAttempt({
      missionId: mission.id,
      result: result || (won ? 'Delivered the website and returned it to the browser.' : ''),
      caption,
    });
    setAttempts((current) => [...current, attempt]);
    setSavedMessage(`Attempt ${attempt.attemptNumber} saved in this browser.`);
    setCaption('');
  }

  return (
    <Layout title={mission.title} description={mission.hook}>
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className="container">
            <Link to="/missions">← All missions</Link>
            <span>{mission.category}</span>
            <Heading as="h1">{mission.title}</Heading>
            <p>{mission.hook}</p>
            <div className={styles.meta}>
              <b>Ages {mission.ageBand}</b>
              <b>{mission.time}</b>
              <b>{mission.activityType}</b>
            </div>
          </div>
        </header>

        <div className={`container ${styles.content}`}>
          <section className={styles.brief}>
            <div>
              <Heading as="h2">Your mission</Heading>
              <p>
                Deliver a website request to its server, then return the
                website to the browser.
              </p>
            </div>
            <div>
              <strong>Materials</strong>
              <ul>
                {mission.materials.map((material) => (
                  <li key={material}>{material}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className={styles.steps}>
            <Heading as="h2">Five short steps</Heading>
            <ol>
              {mission.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className={styles.game} aria-label="Route the website request">
            <span className={styles.gameLabel}>Interactive activity</span>
            <Heading as="h2">Route the website request</Heading>
            <p>
              Select the next correct stop. The packet must reach the server
              and bring the website back.
            </p>

            <div className={styles.route} aria-label="Current packet route">
              {ROUTE.map((stop, index) => (
                <div
                  className={`${styles.routeStop} ${
                    index < route.length ? styles.reached : ''
                  }`}
                  key={`${stop}-${index}`}>
                  <span>{index < route.length ? '✓' : index + 1}</span>
                  <b>{stop}</b>
                </div>
              ))}
            </div>

            <div className={styles.controls} aria-label="Choose the next stop">
              {['Browser', 'Internet', 'Server'].map((stop) => (
                <button
                  disabled={won}
                  key={stop}
                  onClick={() => sendTo(stop)}
                  type="button">
                  {stop === 'Browser' ? '💻' : stop === 'Internet' ? '☁️' : '🗄️'}
                  <span>Send to {stop}</span>
                </button>
              ))}
            </div>

            <div className={styles.feedback} role="status">
              {won ? (
                <>
                  <strong>Mission complete!</strong>
                  <span>The browser received the website files.</span>
                </>
              ) : (
                <>
                  <strong>{route.length} of {ROUTE.length} stops reached</strong>
                  <span>{result || 'What should the packet visit next?'}</span>
                </>
              )}
            </div>

            <div className={styles.gameActions}>
              <button
                className="button button--secondary"
                onClick={() => setShowHint((current) => !current)}
                type="button">
                {showHint ? 'Hide hint' : 'Show a hint'}
              </button>
              <button
                className="button button--secondary"
                onClick={resetRoute}
                type="button">
                Try again
              </button>
            </div>
            {showHint && <p className={styles.hint}>{mission.hint}</p>}
          </section>

          <section className={styles.discovery}>
            <div>
              <span>What You Discovered</span>
              <Heading as="h2">Websites have a digital home.</Heading>
              <p>{mission.discovered}</p>
            </div>
            <aside>
              <strong>Boss Level</strong>
              <p>{mission.bossLevel}</p>
            </aside>
          </section>

          <section className={styles.save}>
            <Heading as="h2">Save this attempt</Heading>
            <p>
              Saving is optional. It stays in this browser and collects no
              personal information.
            </p>
            <label>
              What happened? <span>Optional</span>
              <input
                maxLength={120}
                onChange={(event) => setResult(event.target.value)}
                placeholder="I delivered the website by…"
                value={result}
              />
            </label>
            <label>
              One-line caption <span>Optional</span>
              <input
                maxLength={100}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="My website route"
                value={caption}
              />
            </label>
            <button
              className="button button--primary button--lg"
              disabled={!won}
              onClick={saveAttempt}
              type="button">
              Save completed attempt
            </button>
            {!won && <small>Complete the route before saving.</small>}
            {savedMessage && <p className={styles.saved} role="status">{savedMessage}</p>}

            {attempts.length > 0 && (
              <div className={styles.attempts}>
                <Heading as="h3">Attempts saved here</Heading>
                {attempts.map((attempt) => (
                  <article key={attempt.id}>
                    <strong>Attempt {attempt.attemptNumber}</strong>
                    <span>{new Date(attempt.date).toLocaleDateString()}</span>
                    <p>{attempt.caption || attempt.result || 'Mission completed.'}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}
