import { useState } from 'react';
import { ArrowRight, Eye, Lock, Sparkles, X } from 'lucide-react';
import { Chest, Gem, VeCoin } from '../Icons/Icons.jsx';
import InfoTip from '../InfoTip/InfoTip.jsx';
import XPProgress from '../XPProgress/XPProgress.jsx';
import Skeleton, { SkeletonGroup } from '../Skeleton/Skeleton.jsx';
import ErrorState from '../ErrorState/ErrorState.jsx';
import { formatNumber, formatReward, padLevel } from '../../utils/format.js';
import styles from './NextLevelReward.module.css';

const REWARD_INFO =
  'The displayed reward is associated with the next level according to the current reward configuration. It is granted when you reach that level.';

export function RewardIcon({ type, size = 28 }) {
  if (type === 'Gems') return <Gem size={size} />;
  return <VeCoin size={size} />;
}

export default function NextLevelReward({ profile, nextLevel, isLoading, isError, onRetry, onWaysToEarn }) {
  const [peek, setPeek] = useState(false);

  if (isLoading) {
    return (
      <SkeletonGroup label="Loading next level reward" className={styles.card}>
        <Skeleton width="50%" height={12} />
        <Skeleton width={140} height={120} radius={20} style={{ margin: '20px auto' }} />
        <Skeleton width="40%" height={28} style={{ margin: '0 auto' }} />
        <Skeleton height={8} radius={999} style={{ marginTop: 20 }} />
      </SkeletonGroup>
    );
  }

  if (isError) {
    return (
      <div className={styles.card}>
        <ErrorState title="Unable to Load Reward" message="We couldn't load your next reward right now." onRetry={onRetry} compact />
      </div>
    );
  }

  if (profile.nextLevel == null) {
    return (
      <article className={styles.card} aria-label="All rewards unlocked">
        <p className={styles.eyebrow}>All rewards unlocked</p>
        <div className={styles.stage}>
          <Chest locked={false} size={150} />
        </div>
        <p className={styles.unlock}>You've reached the highest level. Keep earning to stay on top.</p>
      </article>
    );
  }

  const reward = profile.nextLevelReward;
  const perks = nextLevel?.perks ?? [];

  return (
    <article className={`${styles.card} ${peek ? styles.peeking : ''}`} aria-labelledby="next-reward-title">
      <div className={styles.head}>
        <p className={styles.eyebrow}>
          <Sparkles size={14} aria-hidden="true" /> Next Level Reward
        </p>
        <InfoTip text={REWARD_INFO} label="About next level reward" align="end" />
      </div>

      <div className={styles.stage}>
        <span className={styles.rays} aria-hidden="true" />
        <Chest locked size={150} className={styles.chest} />
        <span className={`${styles.floater} ${styles.f1}`} aria-hidden="true"><VeCoin size={26} /></span>
        <span className={`${styles.floater} ${styles.f2}`} aria-hidden="true"><Gem size={24} /></span>
        <span className={`${styles.floater} ${styles.f3}`} aria-hidden="true"><VeCoin size={18} /></span>
        <span className={styles.lockChip}>
          <Lock size={12} aria-hidden="true" /> Locked
        </span>
      </div>

      <h3 id="next-reward-title" className={styles.amount}>
        {reward && <RewardIcon type={reward.type} size={30} />}
        <span className={styles.amountText}>{formatReward(reward)}</span>
      </h3>
      <p className={styles.unlock}>
        Reach <strong>Level {padLevel(profile.nextLevel)}</strong>
        {nextLevel?.name && <> · {nextLevel.name}</>} to unlock
      </p>

      <XPProgress profile={profile} size="sm" showMeta={false} />
      <p className={styles.meta}>
        <span className="tabular">{profile.progressPct}% complete</span>
        <span className="tabular">{formatNumber(profile.xpToNext)} XP to go</span>
      </p>

      <div className={styles.actions}>
        {perks.length > 0 && (
          <button type="button" className={styles.peekBtn} aria-expanded={peek} onClick={() => setPeek((p) => !p)}>
            {peek ? <X size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            {peek ? 'Hide perks' : 'Preview perks'}
          </button>
        )}
        <button type="button" className={styles.unlockBtn} onClick={onWaysToEarn}>
          Ways to unlock <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>

      {peek && (
        <ul className={styles.perks} aria-label={`Level ${padLevel(profile.nextLevel)} perks`}>
          {perks.map((p) => (
            <li key={p}>
              <Sparkles size={14} aria-hidden="true" /> {p}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
