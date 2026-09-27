import InfoTip from '../InfoTip/InfoTip.jsx';
import styles from './SectionHeader.module.css';

export default function SectionHeader({ id, icon, title, subtitle, info, action }) {
  return (
    <div className={styles.header}>
      <div className={styles.titles}>
        <h2 id={id} className={styles.title}>
          {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
          {title}
          {info && <InfoTip text={info} align="start" />}
        </h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
