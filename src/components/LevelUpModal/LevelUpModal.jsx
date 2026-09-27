import { useEffect, useState } from 'react';
import { Award, Gift, Sparkles, TrendingUp } from 'lucide-react';
import Modal from '../Modal/Modal.jsx';
import { Gem, LevelHex, VeCoin } from '../Icons/Icons.jsx';
import { RewardIcon } from '../NextLevelReward/NextLevelReward.jsx';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { formatReward, padLevel } from '../../utils/format.js';
import styles from './LevelUpModal.module.css';

const DEFAULT_PERKS = ['Higher daily XP limit', 'Access to new challenges', 'Better reward opportunities'];
const PERK_ICONS = [TrendingUp, Award, Gift];

/** Premium, restrained celebration: badge reveal, number transition, coins drifting to the reward. */
export default function LevelUpModal({ levelUp, perks, onClose }) {
  const reduced = useReducedMotion();
  const toLevel = levelUp?.toLevel;
  const [shownLevel, setShownLevel] = useState(toLevel);

  useEffect(() => {
    if (!toLevel) return undefined;
    if (reduced) {
      setShownLevel(toLevel);
      return undefined;
    }
    setShownLevel(toLevel - 1);
    const t = setTimeout(() => setShownLevel(toLevel), 650);
    return () => clearTimeout(t);
  }, [toLevel, reduced]);

  if (!levelUp) return null;
  const list = perks?.length ? perks : DEFAULT_PERKS;

  return (
    <Modal open onClose={onClose} labelledBy="levelup-title" className={styles.panel}>
      <div className={styles.body}>
        <span className={styles.particles} aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} style={{ '--i': i }} />
          ))}
        </span>

        <h2 id="levelup-title" className={styles.title}>
          Level Up!
        </h2>
        <p className={styles.sub}>You've reached</p>

        <div className={styles.badgeStage}>
          <span className={styles.halo} aria-hidden="true" />
          <span className={`${styles.float} ${styles.fl1}`} aria-hidden="true"><VeCoin size={28} /></span>
          <span className={`${styles.float} ${styles.fl2}`} aria-hidden="true"><Gem size={26} /></span>
          <span className={`${styles.float} ${styles.fl3}`} aria-hidden="true"><VeCoin size={20} /></span>
          <div key={shownLevel} className={styles.badge}>
            <LevelHex level={shownLevel} size={150} />
          </div>
        </div>
        <p className={styles.levelName}>
          Level {padLevel(toLevel)}
          {levelUp.name ? ` · ${levelUp.name}` : ''}
        </p>

        <div className={styles.tiles}>
          <div className={styles.tile}>
            {levelUp.reward && <RewardIcon type={levelUp.reward.type} size={40} />}
            <strong>+{formatReward(levelUp.reward)}</strong>
            <span>Level reward</span>
          </div>
          <div className={styles.tile}>
            <Sparkles size={34} className={styles.tileIcon} aria-hidden="true" />
            <strong>Achievement</strong>
            <span>Tier {padLevel(toLevel)} unlocked</span>
          </div>
        </div>

        <ul className={styles.perks}>
          {list.slice(0, 3).map((p, i) => {
            const Icon = PERK_ICONS[i % PERK_ICONS.length];
            return (
              <li key={p}>
                <Icon size={16} aria-hidden="true" /> {p}
              </li>
            );
          })}
        </ul>

        <button type="button" className={styles.claim} onClick={onClose} data-autofocus>
          Claim Rewards
        </button>
      </div>
    </Modal>
  );
}
