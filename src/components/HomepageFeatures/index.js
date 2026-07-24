import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Empowering Future Innovators',
    Svg: require('@site/static/img/CL_blackboard.svg').default,
    description: (
      <>
ChloeLabs simplifies AI and cloud computing for young learners, turning complex ideas into fun, accessible lessons. We ignite curiosity, build confidence, and empower kids to see themselves as creators and leaders in a tech-driven world.      
</>
    ),
  },
  {
    title: 'Learning Through Discovery',
    Svg: require('@site/static/img/CL_reading.svg').default,
    description: (
      <>
Interactive, hands-on tutorials spark curiosity and transform technology into a powerful tool for creativity and bold ideas, encouraging kids to dream big and achieve more.
</>
    ),
  },
  {
    title: 'Small Hands, Big Futures',
    Svg: require('@site/static/img/CL_toybox.svg').default,
    description: (
      <>
With real-world tech skills, kids are prepared to tackle challenges, think critically, and build solutions that shape the future and leave a lasting impact.
</>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
