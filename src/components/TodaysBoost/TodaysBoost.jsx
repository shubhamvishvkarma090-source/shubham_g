import { Flame, ListChecks, Zap } from 'lucide-react';
import { XpOrb } from '../Icons/Icons.jsx';
import Skeleton from '../Skeleton/Skeleton.jsx';
import { activityStats } from '../../utils/activityStats.js';
import { formatNumber } from '../../utils/format.js';
import styles from './TodaysBoost.module.css';

export default function TodaysBoost({ activity, isLoading }) {
  const stats = activityStats(activity ?? []);
  const tiles = [
    { key: 'xp', icon: <XpOrb size={30} />, label: 'XP Earned', value: `${formatNumber(stats.xpToday)} XP` },
    { key: 'actions', icon: <ListChecks size={22} />, label: 'Actions Today', value: formatNumber(stats.actionsToday) },
    { key: 'streak', icon: <Flame size={22} />, label: 'Streak', value: `${stats.streakDays} ${stats.streakDays === 1 ? 'Day' : 'Days'}` },
  ];

  return (
    <section className={styles.card} aria-labelledby="boost-title">
      <h2 id="boost-title" className={styles.title}>
        <Zap size={16} aria-hidden="true" /> Today's Boost
      </h2>
      <div className={styles.grid}>
        {tiles.map((t) => (
          <div key={t.key} className={`${styles.tile} ${styles[t.key]}`}>
            <span className={styles.icon} aria-hidden="true">{t.icon}</span>
            <span className={styles.label}>{t.label}</span>
            {isLoading ? <Skeleton width={56} height={18} /> : <span className={`${styles.value} tabular`}>{t.value}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
