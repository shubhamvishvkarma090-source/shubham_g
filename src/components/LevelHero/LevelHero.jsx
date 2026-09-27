import { ArrowRight, ChevronRight } from 'lucide-react';
import { LevelHex, XpOrb } from '../Icons/Icons.jsx';
import InfoTip from '../InfoTip/InfoTip.jsx';
import XPProgress from '../XPProgress/XPProgress.jsx';
import Skeleton, { SkeletonGroup } from '../Skeleton/Skeleton.jsx';
import ErrorState from '../ErrorState/ErrorState.jsx';
import { useCountUp } from '../../hooks/useCountUp.js';
import { formatNumber, padLevel } from '../../utils/format.js';
import styles from './LevelHero.module.css';

const LEVEL_INFO =
  "XP helps you progress through VELOOP Rewards levels. As you reach new levels, you may unlock additional rewards and experiences according to the platform's level system.";

export default function LevelHero({ profile, nextLevelName, isLoading, isError, onRetry, onWaysToEarn }) {
  if (isLoading) {
    return (
      <SkeletonGroup label="Loading your level" className={styles.card}>
        <div className={styles.top}>
          <Skeleton width={104} height={104} radius={24} />
          <div className={styles.skelText}>
            <Skeleton width="45%" height={12} />
            <Skeleton width="70%" height={30} />
            <Skeleton width="55%" height={20} />
          </div>
        </div>
        <Skeleton height={12} radius={999} style={{ marginTop: 24 }} />
        <Skeleton width="40%" height={14} style={{ marginTop: 12 }} />
      </SkeletonGroup>
    );
  }

  if (isError) {
    return (
      <div className={styles.card}>
        <ErrorState
          title="Unable to Load Level Progress"
          message="We couldn't load your level information right now."
          onRetry={onRetry}
        />
      </div>
    );
  }

  return <HeroContent profile={profile} nextLevelName={nextLevelName} onWaysToEarn={onWaysToEarn} />;
}

function HeroContent({ profile, nextLevelName, onWaysToEarn }) {
  const xp = useCountUp(profile.currentXP);
  const isMax = profile.nextLevel == null;

  return (
    <article className={styles.card} aria-labelledby="current-level-title">
      <span className={styles.glow} aria-hidden="true" />
      <div className={styles.top}>
        <div className={styles.badgeWrap}>
          <LevelHex level={profile.currentLevel} size={112} className={styles.badge} />
        </div>
        <div className={styles.info}>
          <p className={styles.eyebrow}>
            Current Level <InfoTip text={LEVEL_INFO} label="About levels" align="start" />
          </p>
          <h2 id="current-level-title" className={styles.levelTitle}>
            Level {padLevel(profile.currentLevel)}
            {profile.currentLevelName && <span className={styles.levelName}>{profile.currentLevelName}</span>}
          </h2>
          <p className={styles.xp}>
            <XpOrb size={26} />
            <span className="tabular">{formatNumber(xp)}</span>
            <span className={styles.xpUnit}>XP</span>
          </p>
        </div>
      </div>

      <XPProgress profile={profile} />

      {!isMax && (
        <div className={styles.path}>
          <div className={`${styles.step} ${styles.stepCurrent}`}>
            <span className={styles.stepLabel}>Current</span>
            <span className={styles.stepValue}>Level {padLevel(profile.currentLevel)}</span>
          </div>
          <ChevronRight className={styles.stepArrow} size={18} aria-hidden="true" />
          <div className={`${styles.step} ${styles.stepNext}`}>
            <span className={styles.stepLabel}>Next goal</span>
            <span className={styles.stepValue}>
              Level {padLevel(profile.nextLevel)}
              {nextLevelName && <small> · {nextLevelName}</small>}
            </span>
          </div>
          <button type="button" className={styles.cta} onClick={onWaysToEarn}>
            Ways to level up <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </article>
  );
}
