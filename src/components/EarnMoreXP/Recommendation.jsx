import { Sparkles } from 'lucide-react';
import { formatNumber, padLevel } from '../../utils/format.js';
import styles from './EarnMoreXP.module.css';

export function recommendation(profile, features = []) {
  if (!profile || profile.nextLevel == null) {
    return { headline: "You're at the top level.", detail: 'Keep earning to stay ahead and be first in line for new rewards.' };
  }
  const headline = `You're ${formatNumber(profile.xpToNext)} XP away from Level ${padLevel(profile.nextLevel)}.`;
  const best = features
    .filter((f) => f.status === 'available' && Number.isFinite(f.xpReward))
    .sort((a, b) => b.xpReward - a.xpReward)[0];
  if (!best) return { headline, detail: 'Play XP Catcher to keep your progress moving.' };
  if (profile.xpToNext <= best.xpReward) {
    return { headline, detail: `Just one more activity could level you up — try ${best.title} (+${best.xpReward} XP).`, feature: best };
  }
  return { headline, detail: `${best.title} gives the biggest boost right now (+${best.xpReward} XP).`, feature: best };
}

export default function Recommendation({ profile, features }) {
  const r = recommendation(profile, features);
  return (
    <div className={styles.recommend} role="note" aria-label="Recommended for you">
      <span className={styles.recommendIcon} aria-hidden="true">
        <Sparkles size={18} />
      </span>
      <div>
        <p className={styles.recommendLabel}>Recommended for you</p>
        <p className={styles.recommendHeadline}>{r.headline}</p>
        <p className={styles.recommendDetail}>{r.detail}</p>
      </div>
    </div>
  );
}
