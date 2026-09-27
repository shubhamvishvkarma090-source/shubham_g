import { Bell } from 'lucide-react';
import { greeting } from '../../utils/format.js';
import { isMockMode } from '../../api/services.js';
import styles from './TopBar.module.css';

export default function TopBar({ levelName }) {
  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">V</span>
        <span className={styles.brandText}>
          VELOOP <span>Rewards</span>
        </span>
        {isMockMode && <span className={styles.demo}>Demo data</span>}
      </div>
      <div className={styles.greetingBlock}>
        <h1 className={styles.greeting}>
          {greeting()}, VeLooper <span aria-hidden="true">👋</span>
        </h1>
        <p className={styles.sub}>
          Level up your journey{levelName ? ` from ${levelName}` : ''} and unlock better rewards every day.
        </p>
      </div>
      <button type="button" className={styles.bell} aria-label="Notifications (1 new)">
        <Bell size={20} aria-hidden="true" />
        <span className={styles.dot} aria-hidden="true" />
      </button>
    </header>
  );
}
