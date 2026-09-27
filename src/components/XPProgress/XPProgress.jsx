import { useEffect, useState } from 'react';
import { formatNumber, padLevel } from '../../utils/format.js';
import styles from './XPProgress.module.css';

/** Animated XP bar. The user never has to calculate what's left — it's always spelled out. */
export default function XPProgress({ profile, size = 'lg', showMeta = true }) {
  const { currentXP, requiredXP, progressPct, xpToNext, nextLevel } = profile;
  const isMax = nextLevel == null;
  const pct = isMax ? 100 : Math.max(0, Math.min(100, progressPct ?? 0));
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setFill(pct));
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  const valueText = isMax
    ? `${formatNumber(currentXP)} XP, max level reached`
    : `${formatNumber(currentXP)} of ${formatNumber(requiredXP)} XP, ${formatNumber(xpToNext)} XP to Level ${padLevel(nextLevel)}`;

  return (
    <div className={`${styles.wrap} ${styles[size]}`}>
      {showMeta && (
        <div className={styles.topRow}>
          <span className={`${styles.totals} tabular`}>
            {isMax ? `${formatNumber(currentXP)} XP` : `${formatNumber(currentXP)} / ${formatNumber(requiredXP)} XP`}
          </span>
          <span className={`${styles.pct} tabular`}>{pct}%</span>
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-label="XP progress to next level"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={valueText}
      >
        <div className={styles.fill} style={{ width: `${fill}%` }}>
          <span className={styles.shine} />
        </div>
        {!isMax && <span className={styles.goal} aria-hidden="true" />}
      </div>
      {showMeta && (
        <p className={styles.remaining}>
          {isMax ? (
            <strong>Max level reached — you've unlocked every tier.</strong>
          ) : (
            <>
              <strong className="tabular">{formatNumber(xpToNext)} XP</strong> to Level {padLevel(nextLevel)}
            </>
          )}
        </p>
      )}
    </div>
  );
}
