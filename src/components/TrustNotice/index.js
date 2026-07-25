import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const DETAILS = {
  learn: {
    sent: 'Your topic, age band, and selected learning question.',
    local:
      'Starting ideas, quiz choice, your explanation, reflection, and notebook entry.',
    safety:
      'Check important claims against the linked sources. Ask an adult about health, legal, or safety questions.',
  },
  build: {
    sent: 'Your topic, age band, project type, time, difficulty, and available-tool choices.',
    local:
      'Chosen steps, build notes, test results, improvements, and notebook entry.',
    safety:
      'Treat generated plans as suggestions. Stop and ask an adult before using tools, heat, electricity, downloads, accounts, animals, or unfamiliar materials.',
  },
  investigate: {
    sent: 'Your topic, age band, investigation style, time, and setting.',
    local:
      'Prediction, observations, measurements, evidence, conclusion, and notebook entry.',
    safety:
      'Never observe people secretly or record names, addresses, schools, or identifying photos. Ask an adult before outdoor or hands-on investigations.',
  },
  create: {
    sent: 'Your topic, age band, preferred creative format, and available time.',
    local:
      'Storyboard writing, original drafts, reflection, and notebook entry.',
    safety:
      'AI supplies a starting structure—not finished work. Ask an adult before creating accounts, downloading software, or publishing anything.',
  },
  share: {
    sent: 'Your topic, age band, format, preparation time, and general audience description.',
    local:
      'Your opening, key points, activity, closing, rehearsal, and notebook entry.',
    safety:
      'Describe the audience generally, such as “family” or “my class.” Do not enter a person’s full name, contact details, school, or location.',
  },
};

export default function TrustNotice({path}) {
  const detail = DETAILS[path];
  return (
    <details className={styles.notice}>
      <summary>
        <span aria-hidden="true">🛡️</span>
        <div>
          <strong>What AI sees—and what stays private</strong>
          <small>Open this before generating</small>
        </div>
      </summary>
      <div className={styles.body}>
        <section>
          <span>Sent for AI generation</span>
          <p>{detail.sent}</p>
        </section>
        <section>
          <span>Saved only in this browser</span>
          <p>{detail.local}</p>
        </section>
        <section className={styles.safety}>
          <span>Safety check</span>
          <p>{detail.safety}</p>
        </section>
        <p className={styles.footer}>
          Nothing is published automatically. Learn more on the{' '}
          <Link to="/for-parents">For Parents</Link> page.
        </p>
      </div>
    </details>
  );
}
