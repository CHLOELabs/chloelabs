import {useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

const CHALLENGES = [
  {
    topic: 'Ice',
    icon: '❄️',
    title: 'Can you rescue an ice cube?',
    hook: 'Build a tiny shelter that keeps an ice cube from melting.',
    difficulty: 'Easy',
    time: '20–40 min',
    build: 'An ice cube shelter',
    test: 'How long it survives',
    goal: 'Beat your own best time',
    route: '/challenges/ice-rescue',
  },
  {
    topic: 'Games',
    icon: '🎮',
    title: 'Can you invent a game with one strange rule?',
    hook: 'Change one familiar rule and see whether the game gets better.',
    difficulty: 'Medium',
    time: '30–60 min',
    action: 'Make a rule, play-test it, and remix it.',
    route: '/challenges/strange-rule-game',
  },
  {
    topic: 'Dogs',
    icon: '🐶',
    title: 'Can you design a puzzle for a dog?',
    hook: 'Create a safe treat puzzle and watch how a dog solves it.',
    difficulty: 'Medium',
    time: '30–45 min',
    action: 'Build a puzzle, observe, and improve it.',
    route: '/challenges/dog-puzzle',
  },
  {
    topic: 'Space',
    icon: '🚀',
    title: 'Can you land a paper spacecraft?',
    hook: 'Protect a tiny passenger during a drop from outer space.',
    difficulty: 'Medium',
    time: '30–60 min',
    action: 'Build a lander, drop-test it, and redesign it.',
  },
  {
    topic: 'Ocean',
    icon: '🌊',
    title: 'Can you make something float twice?',
    hook: 'Use the same material to build two completely different boats.',
    difficulty: 'Easy',
    time: '20–40 min',
    action: 'Build, float-test, and compare two designs.',
  },
  {
    topic: 'Weather',
    icon: '🌦️',
    title: 'Can you catch the wind?',
    hook: 'Build a simple wind detector that moves when the air does.',
    difficulty: 'Easy',
    time: '20–45 min',
    action: 'Make a detector, test it outside, and tune it.',
  },
  {
    topic: 'Plants',
    icon: '🌱',
    title: 'Which way will a plant choose?',
    hook: 'Create a light maze and predict how a plant will grow through it.',
    difficulty: 'Boss quest',
    time: 'Several days',
    action: 'Build a maze, photograph growth, and compare changes.',
  },
];

function HomepageHeader({onSurprise, selectedTopic, spinning}) {
  return (
    <header className={styles.heroBanner}>
      <div className={`container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>ChloeLabs</span>
          <Heading as="h1">Curious Kids. Future Leaders.</Heading>
          <Heading as="h2">What cool thing can you build today?</Heading>
          <p>Pick a mystery, build something surprising, and watch your ideas grow.</p>
          <div className={styles.heroActions}>
            <button
              className={styles.surpriseButton}
              disabled={spinning}
              onClick={() => onSurprise()}
              type="button">
              <span aria-hidden="true">{spinning ? '✨' : '🎲'}</span>
              {spinning ? 'Choosing…' : 'Surprise Me'}
            </button>
            <Link className={styles.questionButton} to="/curiosity-engine">
              <span aria-hidden="true">💡</span> I Have My Own Question
            </Link>
          </div>
          <div className={styles.topicChips} aria-label="Choose a mystery topic">
            {CHALLENGES.map((challenge) => (
              <button
                aria-pressed={selectedTopic === challenge.topic}
                key={challenge.topic}
                onClick={() => onSurprise(challenge.topic)}
                type="button">
                <span aria-hidden="true">{challenge.icon}</span>
                {challenge.topic}
              </button>
            ))}
          </div>
        </div>
        <div className={`${styles.mysteryMachine} ${spinning ? styles.machineSpinning : ''}`} aria-hidden="true">
          <div className={styles.machineWindow}>
            <span>{spinning ? '✨' : '?'}</span>
          </div>
          <strong>MYSTERY<br />MACHINE</strong>
          <div className={styles.machineLights}><i /><i /><i /></div>
          <div className={styles.machineOutput}>TRY THIS!</div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const [selected, setSelected] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const resultRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function chooseChallenge(topic) {
    window.clearTimeout(timerRef.current);
    setSpinning(true);
    setSelected(null);
    timerRef.current = window.setTimeout(() => {
      const choices = topic
        ? CHALLENGES.filter((challenge) => challenge.topic === topic)
        : CHALLENGES;
      const challenge = choices[Math.floor(Math.random() * choices.length)];
      setSelected(challenge);
      setSpinning(false);
      window.requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'}),
      );
    }, 650);
  }

  return (
    <Layout
      title={siteConfig.title}
      description="Pick a mystery, build something surprising, and watch your ideas grow.">
      <HomepageHeader
        onSurprise={chooseChallenge}
        selectedTopic={selected?.topic}
        spinning={spinning}
      />
      <main>
        <section
          aria-live="polite"
          className={`${styles.surpriseStage} ${selected ? styles.hasResult : ''}`}
          ref={resultRef}>
          <div className="container">
            {selected ? (
              <ChallengeCard challenge={selected} featured />
            ) : (
              <div className={styles.stagePrompt}>
                <span aria-hidden="true">{spinning ? '🎲' : '↟'}</span>
                <strong>{spinning ? 'Shuffling mysteries…' : 'Tap Surprise Me to reveal one challenge.'}</strong>
              </div>
            )}
          </div>
        </section>

        <section className={styles.challenges} id="challenges">
          <div className="container">
            <div className={styles.sectionHeading}>
              <span>Choose a challenge</span>
              <Heading as="h2">Pick one. Start making.</Heading>
              <p>No perfect answer needed. Try something and see what happens.</p>
            </div>
            <div className={styles.challengeGrid}>
              {CHALLENGES.slice(0, 6).map((challenge) => (
                <ChallengeCard challenge={challenge} key={challenge.topic} />
              ))}
            </div>
          </div>
        </section>

        <HomepageFeatures id="how-it-works" />

        <section className={styles.keepIt}>
          <div className="container">
            <div>
              <span aria-hidden="true">📸</span>
              <Heading as="h2">Save what happened.</Heading>
              <p>Take a photo or record one sentence. That is enough.</p>
              <Link className="button button--primary button--lg" to="/my-lab-notebook">
                Open My Lab Notebook
              </Link>
            </div>
            <div>
              <span aria-hidden="true">🖼️</span>
              <Heading as="h2">Watch your projects grow.</Heading>
              <p>See the question, attempt, photo, and next idea together.</p>
              <Link className="button button--secondary button--lg" to="/my-projects">
                See My Projects
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function ChallengeCard({challenge, featured = false}) {
  return (
    <article className={`${styles.challengeCard} ${featured ? styles.featuredChallenge : ''}`}>
      <div className={styles.challengeArt} aria-hidden="true">
        <span>{challenge.icon}</span>
        <i />
        <i />
      </div>
      <div className={styles.challengeBody}>
        <small>{challenge.topic} mystery</small>
        <Heading as={featured ? 'h2' : 'h3'}>{challenge.title}</Heading>
        <p>{challenge.hook}</p>
        <div className={styles.challengeFacts}>
          <span><b>Difficulty</b>{challenge.difficulty}</span>
          <span><b>Time</b>{challenge.time}</span>
        </div>
        {challenge.build ? (
          <div className={styles.missionRows}>
            <span><b>You’ll build</b>{challenge.build}</span>
            <span><b>You’ll test</b>{challenge.test}</span>
            <span><b>Your goal</b>{challenge.goal}</span>
          </div>
        ) : (
          <div className={styles.doThis}>
            <b>What you’ll do</b>
            <span>{challenge.action}</span>
          </div>
        )}
        <Link
          className="button button--primary button--lg"
          to={
            challenge.route ||
            `/curiosity-engine?topic=${encodeURIComponent(challenge.title)}`
          }>
          Start this challenge →
        </Link>
      </div>
    </article>
  );
}
