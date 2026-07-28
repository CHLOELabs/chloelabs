import Heading from '@theme/Heading';
import styles from './styles.module.css';

const STEPS = [
  {icon: '💭', label: 'Wonder', text: 'Pick one mystery.'},
  {icon: '🛠️', label: 'Build', text: 'Make a first version.'},
  {icon: '🧪', label: 'Test', text: 'See what happens.'},
  {icon: '📸', label: 'Save', text: 'Keep a photo or sentence.'},
  {icon: '🔁', label: 'Try Again', text: 'Change one thing.'},
];

export default function HomepageFeatures({id}) {
  return (
    <section className={styles.features} id={id}>
      <div className="container">
        <span className={styles.eyebrow}>The project loop</span>
        <Heading as="h2">Make it. Test it. Make it better.</Heading>
        <ol className={styles.loop}>
          {STEPS.map((step, index) => (
            <li key={step.label}>
              <span className={styles.icon} aria-hidden="true">{step.icon}</span>
              <strong>{step.label}</strong>
              <small>{step.text}</small>
              {index < STEPS.length - 1 && <b aria-hidden="true">↓</b>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
