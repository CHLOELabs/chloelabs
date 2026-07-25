import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    label: '1 · Pick a mystery',
    title: 'Start with “What if?”',
    Svg: require('@site/static/img/CL_blackboard.svg').default,
    description: 'Choose animals, weather, games, space—or anything that makes you stop and wonder.',
  },
  {
    label: '2 · Try something',
    title: 'Make. Test. Change.',
    Svg: require('@site/static/img/CL_reading.svg').default,
    description: 'Build a model, investigate a hunch, remix an idea, or teach someone what you found.',
  },
  {
    label: '3 · Keep the evidence',
    title: 'Grow a real portfolio',
    Svg: require('@site/static/img/CL_toybox.svg').default,
    description: 'Save attempts, discoveries, creations, and reflections—not scores, streaks, or rankings.',
  },
];

function Feature({Svg, label, title, description}) {
  return (
    <article className={styles.feature}>
      <div>
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div>
        <span>{label}</span>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </article>
  );
}

export default function HomepageFeatures({id}) {
  return (
    <section className={styles.features} id={id}>
      <div className="container">
        <div className={styles.heading}>
          <span>No points. No streaks. Just better ideas.</span>
          <Heading as="h2">Curiosity is the engine.</Heading>
        </div>
        <div className={styles.grid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
