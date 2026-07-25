import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function MissionCards({missions}) {
  return (
    <div className={styles.grid}>
      {missions.map((mission, index) => (
        <article className={styles.card} key={mission.id}>
          <div className={styles.art} aria-hidden="true">
            <span>{['☁', '↗', '▦', '✉', '◉', '☀'][index % 6]}</span>
            <i />
            <i />
          </div>
          <div className={styles.body}>
            <span className={styles.category}>{mission.category}</span>
            <Heading as="h3">{mission.title}</Heading>
            <p>{mission.hook}</p>
            <dl>
              <div>
                <dt>Age</dt>
                <dd>{mission.ageBand}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{mission.time}</dd>
              </div>
              <div>
                <dt>Activity</dt>
                <dd>{mission.activityType}</dd>
              </div>
            </dl>
            {mission.available ? (
              <Link
                className="button button--primary"
                to={`/missions/mission?id=${mission.id}`}>
                Start Mission
              </Link>
            ) : (
              <span className={styles.upcoming}>Mission coming next</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
