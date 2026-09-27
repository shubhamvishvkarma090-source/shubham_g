import { LayoutDashboard, RotateCcw } from 'lucide-react';
import { Trophy, VeCoin, XpOrb } from '../Icons/Icons.jsx';
import XPProgress from '../XPProgress/XPProgress.jsx';
import { isMockMode } from '../../api/services.js';
import { getReward } from '../../game/rewardRules.js';
import { padLevel } from '../../utils/format.js';
import styles from './Game.module.css';

const HEADLINE = { Gold: 'Outstanding!', Silver: 'Great run!', Bronze: 'Nice effort!' };

export default function GameResult({ result, isNewBest, remaining, onPlayAgain, onBack }) {
  const { score, reward, profile } = result;
  const { tier } = getReward(score);

  return (
    <div className={`${styles.screen} ${styles.resultScreen}`}>
      <span className={styles.sparkles} aria-hidden="true" />
      <h2 id="game-title" className={styles.resultTitle}>
        <span className={styles.gold}>Challenge</span>
        <br />
        Complete!
      </h2>
      <p className={styles.resultSub}>{HEADLINE[tier]}</p>

      <Trophy size={170} className={styles.trophy} />

      <div className={styles.scoreCard}>
        <span className={styles.hudLabel}>Final Score</span>
        <div className={styles.finalRow}>
          <span className={`${styles.finalScore} tabular`}>{score}</span>
          {isNewBest && <span className={styles.newBest}>New Best!</span>}
        </div>
        <div className={styles.rewardTiles}>
          <div className={styles.rewardTile}>
            <XpOrb size={30} />
            <strong className="tabular">+{reward.xp} XP</strong>
            <span>Experience</span>
          </div>
          <div className={styles.rewardTile}>
            <VeCoin size={30} />
            <strong className="tabular">+{reward.ve} VEs</strong>
            <span>Your Reward</span>
          </div>
        </div>
        {isMockMode && <p className={styles.demoNote}>Demo reward values — final rules pending approval.</p>}
      </div>

      {profile && (
        <div className={styles.resultProgress}>
          <div className={styles.resultLevels}>
            <span>Level {padLevel(profile.currentLevel)}</span>
            {profile.nextLevel && <span>Level {padLevel(profile.nextLevel)}</span>}
          </div>
          <XPProgress profile={profile} size="sm" />
        </div>
      )}

      <div className={styles.resultActions}>
        <button type="button" className={styles.playBtn} onClick={onPlayAgain} disabled={remaining <= 0} data-autofocus>
          <RotateCcw size={18} aria-hidden="true" />
          {remaining > 0 ? `Play Again · ${remaining} left` : 'No runs left today'}
        </button>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <LayoutDashboard size={18} aria-hidden="true" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
