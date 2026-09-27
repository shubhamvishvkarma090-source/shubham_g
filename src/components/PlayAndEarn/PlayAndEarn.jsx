import { useRef } from 'react';
import { Clock, Gamepad2, Play, Timer } from 'lucide-react';
import SectionHeader from '../SectionHeader/SectionHeader.jsx';
import EmptyState from '../EmptyState/EmptyState.jsx';
import { Basket, DudBlock, Gem, VeCoin, XpOrb } from '../Icons/Icons.jsx';
import GameContainer from './GameContainer.jsx';
import { useGameAttempts } from '../../hooks/useGameAttempts.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import { formatDuration, msUntilMidnight } from '../../utils/format.js';
import { GAME, ITEM_TYPES } from '../../game/engine.js';
import styles from './PlayAndEarn.module.css';

const PREVIEW = [
  { C: XpOrb, left: 14, delay: 0 },
  { C: VeCoin, left: 38, delay: -1.2 },
  { C: Gem, left: 62, delay: -2.1 },
  { C: XpOrb, left: 82, delay: -0.6 },
  { C: VeCoin, left: 26, delay: -2.8 },
  { C: XpOrb, left: 70, delay: -3.5 },
];

const LEGEND = [
  { C: XpOrb, label: 'XP orb', pts: `+${ITEM_TYPES.xp.points}` },
  { C: VeCoin, label: 'VE coin', pts: `+${ITEM_TYPES.ve.points}` },
  { C: Gem, label: 'Gem', pts: `+${ITEM_TYPES.gem.points}` },
  { C: DudBlock, label: 'Dud', pts: `${ITEM_TYPES.dud.points}`, bad: true },
];

export default function PlayAndEarn({ open, onOpen, onClose, onLevelUp, available = true }) {
  const attempts = useGameAttempts();
  const midnight = useRef(Date.now() + msUntilMidnight());
  const resetIn = useCountdown(attempts.remaining <= 0 ? midnight.current : null);

  return (
    <section className={styles.section} aria-labelledby="play-title">
      <SectionHeader
        id="play-title"
        icon={<Gamepad2 size={16} />}
        title="Play & Earn"
        subtitle="Something fun to do right now, and it counts toward your next level."
      />

      {!available ? (
        <EmptyState icon={<Gamepad2 size={64} />} title="New challenge coming soon." message="Check back shortly for the next game." />
      ) : (
        <div className={styles.card}>
          <div className={styles.preview} aria-hidden="true">
            {PREVIEW.map(({ C, left, delay }, i) => (
              <span key={i} className={styles.drop} style={{ left: `${left}%`, animationDelay: `${delay}s` }}>
                <C size={30} />
              </span>
            ))}
            <span className={styles.basket}>
              <Basket />
            </span>
          </div>

          <div className={styles.info}>
            <p className={styles.kicker}>Level-Up Arcade</p>
            <h3 className={styles.title}>XP Catcher</h3>
            <p className={styles.copy}>Catch XP orbs, VE coins and gems before time runs out. Build combos for 2× points.</p>
            <ul className={styles.chips}>
              <li>
                <Timer size={14} aria-hidden="true" /> {GAME.durationMs / 1000}s run
              </li>
              <li>
                <XpOrb size={16} /> Up to +30 XP
              </li>
              <li>
                <VeCoin size={16} /> Up to +10 VEs
              </li>
            </ul>
            <ul className={styles.legend} aria-label="Points per item">
              {LEGEND.map(({ C, label, pts, bad }) => (
                <li key={label} className={bad ? styles.legendBad : ''}>
                  <C size={22} />
                  <span>{label}</span>
                  <strong>{pts}</strong>
                </li>
              ))}
            </ul>
            <div className={styles.actions}>
              <button type="button" className={styles.play} onClick={onOpen}>
                <Play size={18} aria-hidden="true" /> {attempts.remaining > 0 ? 'Play Now' : 'View rules'}
              </button>
              <span className={styles.attempts}>
                {attempts.remaining > 0 ? (
                  <>
                    <strong>{attempts.remaining}</strong> / {attempts.max} runs left today
                  </>
                ) : (
                  <>
                    <Clock size={14} aria-hidden="true" /> Next attempt in <strong className="tabular">{formatDuration(resetIn)}</strong>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      <GameContainer open={open} onClose={onClose} attempts={attempts} onLevelUp={onLevelUp} />
    </section>
  );
}
