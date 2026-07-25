import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    label: '1 · Wonder',
    title: 'Start with a real question',
    Svg: require('@site/static/img/CL_blackboard.svg').default,
    description: 'Choose something you genuinely want to understand, make, or test.',
  },
  {
    label: '2 · Try',
    title: 'Choose what helps',
    Svg: require('@site/static/img/CL_reading.svg').default,
    description: 'Learn, build, investigate, create, or share. You do not need every path.',
  },
  {
    label: '3 · Save',
    title: 'Keep the working record',
    Svg: require('@site/static/img/CL_toybox.svg').default,
    description: 'Save notes, evidence, sketches, results, and ideas in your Lab Notebook.',
  },
  {
    label: '4 · Improve',
    title: 'Return and try again',
    Svg: require('@site/static/img/CL_blackboard.svg').default,
    description: 'Test another version and compare what changed over days, weeks, or months.',
  },
  {
    label: '5 · Reflect',
    title: 'Notice how you changed',
    Svg: require('@site/static/img/CL_reading.svg').default,
    description: 'Capture what worked, failed, surprised you, or changed your mind.',
  },
  {
    label: '6 · Keep going',
    title: 'Follow the next question',
    Svg: require('@site/static/img/CL_toybox.svg').default,
    description: 'Finish the project—or let one question lead somewhere completely new.',
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
          <span>Wonder → Try → Save → Improve → Reflect → Keep Going</span>
          <Heading as="h2">A project can grow with you.</Heading>
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
