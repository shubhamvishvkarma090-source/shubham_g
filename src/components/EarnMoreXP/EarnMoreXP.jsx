import { useState } from 'react';
import { CheckCircle2, CircleAlert, Coins, Gamepad2, ListChecks, PlayCircle, UserPlus } from 'lucide-react';
import SectionHeader from '../SectionHeader/SectionHeader.jsx';
import Skeleton, { SkeletonGroup } from '../Skeleton/Skeleton.jsx';
import ErrorState from '../ErrorState/ErrorState.jsx';
import EmptyState from '../EmptyState/EmptyState.jsx';
import EarnCard from './EarnCard.jsx';
import Recommendation from './Recommendation.jsx';
import ReferModal from '../ReferModal/ReferModal.jsx';
import { buildEarnList } from '../../data/earnCatalog.js';
import { useClaimFeature } from '../../hooks/useDashboardData.js';
import { formatNumber, padLevel } from '../../utils/format.js';
import styles from './EarnMoreXP.module.css';

const QUICK_WAYS = [
  { label: 'Play', icon: Gamepad2, key: 'play_earn' },
  { label: 'Watch', icon: PlayCircle, key: 'watch_earn' },
  { label: 'Complete', icon: ListChecks, key: 'daily_tasks' },
  { label: 'Refer', icon: UserPlus, key: 'refer_earn' },
  { label: 'Earn', icon: Coins, key: 'streak_xp' },
];

export default function EarnMoreXP({ features, profile, isLoading, isError, onRetry, onPlay, onLevelUp }) {
  const claim = useClaimFeature();
  const [claimingKey, setClaimingKey] = useState(null);
  const [notice, setNotice] = useState(null);
  const [referOpen, setReferOpen] = useState(false);

  const openRefer = () => {
    setNotice(null);
    setReferOpen(true);
  };

  const handleClaim = (key) => {
    const feature = features?.find((f) => f.key === key);
    setClaimingKey(key);
    setNotice(null);
    claim.mutate(key, {
      onSuccess: (res) => {
        setNotice({ kind: 'ok', text: `+${feature?.xpReward ?? ''} XP added from ${feature?.title ?? 'activity'}.` });
        if (key === 'refer_earn') setReferOpen(false);
        if (res?.levelUp) onLevelUp?.(res.levelUp);
      },
      onError: (err) => setNotice({ kind: 'error', text: err?.message ?? "We couldn't claim this right now. Please try again." }),
      onSettled: () => setClaimingKey(null),
    });
  };

  const jumpTo = (key) => {
    if (key === 'refer_earn') {
      openRefer();
      return;
    }
    if (key === 'play_earn') {
      onPlay?.();
      return;
    }
    const el = document.querySelector(`[data-key="${key}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
  };

  let body;
  if (isLoading) {
    body = (
      <SkeletonGroup label="Loading earning features" className={styles.grid}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} height={196} radius={18} />
        ))}
      </SkeletonGroup>
    );
  } else if (isError) {
    body = <ErrorState title="Unable to Load Earning Features" message="We couldn't load ways to earn right now." onRetry={onRetry} />;
  } else if (!features?.length) {
    body = <EmptyState title="New ways to earn are on the way." message="Meanwhile, play XP Catcher to keep progressing." actionLabel="Play XP Catcher" onAction={onPlay} />;
  } else {
    body = (
      <div className={styles.grid}>
        {buildEarnList(features).map((f) => (
          <EarnCard
            key={f.key}
            feature={f}
            onClaim={handleClaim}
            onPlay={onPlay}
            onRefer={openRefer}
            isClaiming={claimingKey === f.key}
          />
        ))}
      </div>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="earn-title">
      <SectionHeader
        id="earn-title"
        icon={<Coins size={16} />}
        title="Earn More XP & Rewards"
        subtitle="Actionable ways to reach your next level faster."
        info="Complete these activities to earn extra XP. Some reset after a cooldown before you can claim them again. Items marked Coming Soon are concepts that are not available yet."
      />

      {profile && profile.nextLevel != null && (
        <div className={styles.waysBar}>
          <div className={styles.waysText}>
            <strong className="tabular">{formatNumber(profile.xpToNext)} XP left</strong>
            <span>Ways to reach Level {padLevel(profile.nextLevel)}</span>
          </div>
          <div className={styles.ways} role="group" aria-label="Quick ways to earn">
            {QUICK_WAYS.map(({ label, icon: Icon, key }) => (
              <button key={label} type="button" className={styles.way} onClick={() => jumpTo(key)}>
                <Icon size={16} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {profile && !isLoading && !isError && <Recommendation profile={profile} features={features ?? []} />}

      <p className={styles.notice} aria-live="polite">
        {notice && (
          <span className={notice.kind === 'ok' ? styles.noticeOk : styles.noticeErr}>
            {notice.kind === 'ok' ? <CheckCircle2 size={16} aria-hidden="true" /> : <CircleAlert size={16} aria-hidden="true" />}
            {notice.text}
          </span>
        )}
      </p>

      {body}

      {referOpen && (
        <ReferModal
          open
          feature={features?.find((f) => f.key === 'refer_earn')}
          onClose={() => setReferOpen(false)}
          onClaim={handleClaim}
          isClaiming={claimingKey === 'refer_earn'}
          error={notice?.kind === 'error' ? notice.text : null}
        />
      )}
    </section>
  );
}
