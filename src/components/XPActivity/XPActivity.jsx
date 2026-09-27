import { Link } from 'react-router-dom';
import { ChevronRight, ClipboardCheck, Flame, Gamepad2, History, PlayCircle, UserPlus, Zap } from 'lucide-react';
import SectionHeader from '../SectionHeader/SectionHeader.jsx';
import Skeleton, { SkeletonGroup } from '../Skeleton/Skeleton.jsx';
import ErrorState from '../ErrorState/ErrorState.jsx';
import EmptyState from '../EmptyState/EmptyState.jsx';
import { VeCoin, XpOrb } from '../Icons/Icons.jsx';
import { activityStats } from '../../utils/activityStats.js';
import { formatNumber, timeAgo } from '../../utils/format.js';
import styles from './XPActivity.module.css';

const TYPE_META = {
  refer_earn: { icon: UserPlus, tone: 'green' },
  daily_tasks: { icon: ClipboardCheck, tone: 'gold' },
  watch_earn: { icon: PlayCircle, tone: 'purple' },
  game: { icon: Gamepad2, tone: 'blue' },
  streak: { icon: Flame, tone: 'orange' },
  streak_xp: { icon: Flame, tone: 'orange' },
};

export function ActivityItem({ item }) {
  const { icon: Icon, tone } = TYPE_META[item.type] ?? { icon: Zap, tone: 'gold' };
  const [title, detail] = String(item.label ?? '').split('|').map((s) => s.trim());
  return (
    <li className={styles.item}>
      <span className={`${styles.icon} ${styles[tone]}`} aria-hidden="true">
        <Icon size={20} />
      </span>
      <div className={styles.text}>
        <p className={styles.delta}>
          <span className="tabular">+{formatNumber(item.xpDelta)} XP</span>
          {item.veDelta ? <span className={styles.ve}>+{formatNumber(item.veDelta)} VEs</span> : null}
        </p>
        <p className={styles.title}>{title}</p>
        {detail && <p className={styles.detail}>{detail}</p>}
      </div>
      <time className={styles.time} dateTime={item.timestamp}>
        {timeAgo(item.timestamp)}
      </time>
    </li>
  );
}

export function TodaysSummary({ activity }) {
  const { xpToday, veToday } = activityStats(activity);
  return (
    <div className={styles.summary}>
      <p className={styles.summaryTitle}>Today's Summary</p>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryTile}>
          <XpOrb size={34} />
          <div>
            <strong className="tabular">{formatNumber(xpToday)} XP</strong>
            <span>Total earned</span>
          </div>
        </div>
        <div className={styles.summaryTile}>
          <VeCoin size={34} />
          <div>
            <strong className="tabular">{formatNumber(veToday)} VEs</strong>
            <span>Total earned</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivitySkeleton({ rows = 4 }) {
  return (
    <SkeletonGroup label="Loading activity" className={styles.list}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skelRow}>
          <Skeleton width={44} height={44} radius={14} />
          <div className={styles.skelText}>
            <Skeleton width="40%" height={14} />
            <Skeleton width="75%" height={12} />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export default function XPActivity({ activity, isLoading, isError, onRetry, onStartEarning, limit = 5 }) {
  let body;
  if (isLoading) body = <ActivitySkeleton />;
  else if (isError) body = <ErrorState title="Unable to Load Activity" message="We couldn't load your recent XP activity." onRetry={onRetry} compact />;
  else if (!activity?.length)
    body = (
      <EmptyState
        icon={<XpOrb size={64} />}
        title="Your XP journey starts here."
        message="Complete an activity or play a game to see your XP history."
        actionLabel="Start Earning XP"
        onAction={onStartEarning}
      />
    );
  else
    body = (
      <>
        <ul className={styles.list}>
          {activity.slice(0, limit).map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </ul>
        <TodaysSummary activity={activity} />
      </>
    );

  return (
    <section className={styles.section} aria-labelledby="activity-title">
      <SectionHeader
        id="activity-title"
        icon={<History size={16} />}
        title="Recent Activity"
        subtitle="Where your XP is coming from."
        action={
          <Link to="/Lvl-Dashboard/activity" className={styles.viewAll}>
            View all <ChevronRight size={16} aria-hidden="true" />
          </Link>
        }
      />
      {body}
    </section>
  );
}
