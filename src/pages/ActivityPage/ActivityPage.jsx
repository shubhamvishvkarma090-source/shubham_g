import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LevelHex } from '../../components/Icons/Icons.jsx';
import XPProgress from '../../components/XPProgress/XPProgress.jsx';
import ErrorState from '../../components/ErrorState/ErrorState.jsx';
import EmptyState from '../../components/EmptyState/EmptyState.jsx';
import Skeleton from '../../components/Skeleton/Skeleton.jsx';
import { ActivityItem, ActivitySkeleton, TodaysSummary } from '../../components/XPActivity/XPActivity.jsx';
import { XpOrb } from '../../components/Icons/Icons.jsx';
import { useActivity, useProfile } from '../../hooks/useDashboardData.js';
import { padLevel } from '../../utils/format.js';
import styles from './ActivityPage.module.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'game', label: 'Games' },
  { key: 'daily_tasks', label: 'Tasks' },
  { key: 'refer_earn', label: 'Referrals' },
  { key: 'watch_earn', label: 'Watch' },
];

export default function ActivityPage() {
  const profileQ = useProfile();
  const activityQ = useActivity(50);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    document.title = 'XP Activity · VELOOP Rewards';
  }, []);

  const items = useMemo(
    () => (activityQ.data ?? []).filter((a) => filter === 'all' || a.type === filter),
    [activityQ.data, filter],
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/Lvl-Dashboard" className={styles.back}>
          <ArrowLeft size={18} aria-hidden="true" /> Back to Level Dashboard
        </Link>

        <h1 className={styles.title}>Recent XP Activity</h1>

        <div className={styles.summary}>
          {profileQ.isLoading && <Skeleton height={80} radius={16} />}
          {profileQ.isError && (
            <ErrorState title="Unable to Load Level Progress" message="We couldn't load your level information right now." onRetry={profileQ.refetch} compact />
          )}
          {profileQ.data && (
            <div className={styles.levelRow}>
              <LevelHex level={profileQ.data.currentLevel} size={64} />
              <div className={styles.levelInfo}>
                <p className={styles.levelLabel}>
                  Level {padLevel(profileQ.data.currentLevel)} · {profileQ.data.currentLevelName}
                </p>
                <XPProgress profile={profileQ.data} size="sm" />
              </div>
            </div>
          )}
        </div>

        <div className={styles.filters} role="group" aria-label="Filter activity">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              className={filter === f.key ? styles.filterOn : styles.filter}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {activityQ.isLoading && <ActivitySkeleton rows={6} />}
        {activityQ.isError && <ErrorState title="Unable to Load Activity" message="We couldn't load your XP activity." onRetry={activityQ.refetch} />}
        {activityQ.data && items.length === 0 && (
          <EmptyState
            icon={<XpOrb size={64} />}
            title="Your XP journey starts here."
            message={filter === 'all' ? 'Earn XP to see your history.' : 'No activity of this type yet.'}
            actionLabel="Start Earning XP"
            onAction={() => {
              window.location.href = '/Lvl-Dashboard#earn';
            }}
          />
        )}
        {items.length > 0 && (
          <>
            <ul className={styles.list}>
              {items.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </ul>
            <TodaysSummary activity={activityQ.data} />
          </>
        )}
      </div>
    </div>
  );
}
