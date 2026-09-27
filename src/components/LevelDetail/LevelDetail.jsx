import { Sparkles, X } from 'lucide-react';
import Modal from '../Modal/Modal.jsx';
import { LevelHex } from '../Icons/Icons.jsx';
import { RewardIcon } from '../NextLevelReward/NextLevelReward.jsx';
import { formatNumber, formatReward, padLevel } from '../../utils/format.js';
import styles from './LevelDetail.module.css';

const STATE_COPY = {
  completed: 'You completed this level. Its reward has been unlocked.',
  current: "You're on this level right now. Keep earning XP to move up.",
  next: 'Your next goal. Reach it to unlock the reward below.',
  locked: 'A future level. Keep progressing to unlock it.',
};

export default function LevelDetail({ level, state, profile, onClose }) {
  if (!level) return null;
  const titleId = `level-detail-${level.level}`;
  const xpNote =
    state === 'next' && profile?.xpToNext != null
      ? `${formatNumber(profile.xpToNext)} XP to go`
      : level.minXP != null
        ? `Unlocks at ${formatNumber(level.minXP)} XP`
        : null;

  return (
    <Modal open onClose={onClose} labelledBy={titleId}>
      <div className={styles.body}>
        <button type="button" className={styles.close} aria-label="Close level details" onClick={onClose}>
          <X size={18} aria-hidden="true" />
        </button>
        <LevelHex level={level.level} size={96} state={state} />
        <h2 id={titleId} className={styles.title}>
          Level {padLevel(level.level)} · {level.name}
        </h2>
        <p className={styles.copy}>{STATE_COPY[state]}</p>
        {xpNote && <p className={styles.xp}>{xpNote}</p>}

        <div className={styles.reward}>
          <span className={styles.rewardLabel}>Level reward</span>
          <span className={styles.rewardValue}>
            {level.reward && <RewardIcon type={level.reward.type} size={24} />}
            {formatReward(level.reward)}
          </span>
        </div>

        {level.perks?.length > 0 && (
          <ul className={styles.perks}>
            {level.perks.map((p) => (
              <li key={p}>
                <Sparkles size={14} aria-hidden="true" /> {p}
              </li>
            ))}
          </ul>
        )}

        <button type="button" className={styles.done} onClick={onClose} data-autofocus>
          Got it
        </button>
      </div>
    </Modal>
  );
}
