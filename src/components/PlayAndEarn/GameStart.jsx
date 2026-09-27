import { Clock, Gauge, Hand, Keyboard, Play, Repeat, ShieldCheck, Target, Trophy } from 'lucide-react';
import { DudBlock, Gem, VeCoin, XpOrb } from '../Icons/Icons.jsx';
import { GAME, ITEM_TYPES } from '../../game/engine.js';
import { REWARD_TIERS } from '../../game/rewardRules.js';
import { isMockMode } from '../../api/services.js';
import { formatDuration } from '../../utils/format.js';
import styles from './Game.module.css';

const ITEMS = [
  { type: 'xp', Icon: XpOrb },
  { type: 've', Icon: VeCoin },
  { type: 'gem', Icon: Gem },
  { type: 'dud', Icon: DudBlock },
];

export default function GameStart({ remaining, max, resetInMs, onStart }) {
  const outOfPlays = remaining <= 0;
  return (
    <div className={styles.screen}>
      <div className={styles.startHero}>
        <p className={styles.kicker}>Level-Up Arcade</p>
        <h2 id="game-title" className={styles.gameTitle}>
          XP Catcher
        </h2>
        <p className={styles.tagline}>Catch XP orbs &amp; coins. Score high for better rewards!</p>
      </div>

      <section className={styles.rules} aria-labelledby="rules-title">
        <h3 id="rules-title" className={styles.rulesTitle}>
          How to play
        </h3>
        <ul className={styles.ruleList}>
          <li>
            <Target size={16} aria-hidden="true" />
            <span>
              <strong>Objective:</strong> catch falling items in the gold basket.
            </span>
          </li>
          <li>
            <Hand size={16} aria-hidden="true" />
            <span>
              <strong>Controls:</strong> drag or move your pointer/finger across the play area.
            </span>
          </li>
          <li>
            <Keyboard size={16} aria-hidden="true" />
            <span>Keyboard: ← / → or A / D.</span>
          </li>
          <li>
            <Clock size={16} aria-hidden="true" />
            <span>
              <strong>Time limit:</strong> {GAME.durationMs / 1000} seconds per run.
            </span>
          </li>
          <li>
            <Gauge size={16} aria-hidden="true" />
            <span>Items fall faster every {GAME.speedStepMs / 1000} seconds.</span>
          </li>
          <li>
            <Repeat size={16} aria-hidden="true" />
            <span>
              <strong>Combo:</strong> {GAME.comboForMultiplier} catches in a row = {GAME.multiplier}× points until you miss or hit a dud.
            </span>
          </li>
        </ul>

        <h3 className={styles.rulesTitle}>Score</h3>
        <ul className={styles.itemGrid}>
          {ITEMS.map(({ type, Icon }) => {
            const { points, label } = ITEM_TYPES[type];
            return (
              <li key={type} className={points < 0 ? styles.itemBad : ''}>
                <Icon size={30} />
                <span className={styles.itemLabel}>{label}</span>
                <span className={styles.itemPoints}>{points > 0 ? `+${points}` : points}</span>
              </li>
            );
          })}
        </ul>

        <h3 className={styles.rulesTitle}>
          <Trophy size={14} aria-hidden="true" /> Rewards
          {isMockMode ? <span className={styles.demoBadge}>Demo values</span> : <span className={styles.demoBadge}>Estimate</span>}
        </h3>
        <ul className={styles.tierList}>
          {REWARD_TIERS.map((t, i) => {
            const upper = i === 0 ? null : REWARD_TIERS[i - 1].min - 1;
            return (
              <li key={t.label}>
                <span>
                  Score {t.min}
                  {upper == null ? '+' : `–${upper}`}
                </span>
                <strong>
                  +{t.xp} XP{t.ve ? ` · +${t.ve} VEs` : ''}
                </strong>
              </li>
            );
          })}
        </ul>

        <p className={styles.eligibility}>
          <ShieldCheck size={16} aria-hidden="true" />
          <span>
            Skill-based, no chance involved. Your reward depends only on your score. Eligible players get{' '}
            <strong>{max} runs per day</strong> (resets at midnight). Final rewards are confirmed by VELOOP.
          </span>
        </p>
      </section>

      <div className={styles.startFooter}>
        <span className={styles.attempts} aria-live="polite">
          {outOfPlays ? `Next attempt in ${formatDuration(resetInMs)}` : `${remaining} of ${max} runs left today`}
        </span>
        <button type="button" className={styles.playBtn} onClick={onStart} disabled={outOfPlays} data-autofocus>
          <Play size={18} aria-hidden="true" /> {outOfPlays ? 'Come back tomorrow' : 'Start Game'}
        </button>
      </div>
    </div>
  );
}
