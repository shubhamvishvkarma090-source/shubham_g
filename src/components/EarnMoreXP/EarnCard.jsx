import { ArrowRight, CalendarRange, CircleHelp, ClipboardCheck, Clock, Flame, Gamepad2, Loader2, Lock, Target, UserPlus } from 'lucide-react';
import { FaCirclePlay, FaUserGroup } from 'react-icons/fa6';
import { FEATURE_COPY } from '../../data/earnCatalog.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import { formatDuration } from '../../utils/format.js';
import styles from './EarnMoreXP.module.css';

const ICONS = {
  watch_earn: FaCirclePlay,
  daily_tasks: ClipboardCheck,
  refer_earn: FaUserGroup,
  play_earn: Gamepad2,
  streak_xp: Flame,
  weekly_quest: CalendarRange,
  daily_mission: Target,
  quick_quiz: CircleHelp,
  bonus_missions: Target,
};

export default function EarnCard({ feature, onClaim, onPlay, onRefer, isClaiming = false }) {
  const { key, title, xpReward, status, cooldownHours, nextAvailableAt, action, xpPrefix } = feature;
  const copy = FEATURE_COPY[key] ?? { description: '', tone: 'gold' };
  const Icon = ICONS[key] ?? Target;
  const until = nextAvailableAt ? new Date(nextAvailableAt).getTime() : null;
  const left = useCountdown(status === 'claimed' ? until : null);
  const comingSoon = status === 'coming_soon';
  const coolingDown = status === 'claimed' && left > 0;

  let button;
  if (comingSoon) {
    button = (
      <button type="button" className={styles.cardBtn} disabled>
        <Lock size={14} aria-hidden="true" /> Coming Soon
      </button>
    );
  } else if (action === 'play') {
    button = (
      <button type="button" className={`${styles.cardBtn} ${styles.cardBtnPrimary}`} onClick={onPlay}>
        Play Now <ArrowRight size={16} aria-hidden="true" />
      </button>
    );
  } else if (key === 'refer_earn' && onRefer) {
    button = (
      <button type="button" className={`${styles.cardBtn} ${styles.cardBtnPrimary}`} onClick={onRefer}>
        <UserPlus size={16} aria-hidden="true" /> Invite Friends
        {coolingDown && (
          <span className={styles.cardBtnSub}>
            · bonus in <span className="tabular">{formatDuration(left)}</span>
          </span>
        )}
      </button>
    );
  } else if (coolingDown) {
    button = (
      <button type="button" className={styles.cardBtn} disabled>
        <Clock size={14} aria-hidden="true" /> Available in <span className="tabular">{formatDuration(left)}</span>
      </button>
    );
  } else {
    button = (
      <button
        type="button"
        className={`${styles.cardBtn} ${styles.cardBtnPrimary}`}
        onClick={() => onClaim?.(key)}
        disabled={isClaiming}
        aria-busy={isClaiming}
      >
        {isClaiming ? <Loader2 size={16} className={styles.spin} aria-hidden="true" /> : null}
        Claim +{xpReward} XP
      </button>
    );
  }

  return (
    <article className={`${styles.earnCard} ${styles[copy.tone]} ${comingSoon ? styles.soon : ''}`} data-key={key}>
      <div className={styles.cardTop}>
        <span className={styles.cardIcon} aria-hidden="true">
          <Icon size={22} />
        </span>
        {comingSoon ? (
          <span className={styles.soonPill}>Coming Soon</span>
        ) : (
          <span className={styles.xpPill}>
            {xpPrefix ? `${xpPrefix} ` : ''}+{xpReward} XP
          </span>
        )}
      </div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{copy.description}</p>
      {!comingSoon && cooldownHours ? <p className={styles.cardMeta}>Resets every {cooldownHours}h</p> : null}
      {comingSoon && <p className={styles.cardMeta}>Concept — not available yet</p>}
      <div className={styles.cardAction}>{button}</div>
    </article>
  );
}
