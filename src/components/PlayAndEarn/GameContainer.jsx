import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, CircleAlert, Loader2 } from 'lucide-react';
import Modal from '../Modal/Modal.jsx';
import GameStart from './GameStart.jsx';
import GameCountdown from './GameCountdown.jsx';
import GamePlay from './GamePlay.jsx';
import GameResult from './GameResult.jsx';
import { useSubmitGame } from '../../hooks/useDashboardData.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import { msUntilMidnight } from '../../utils/format.js';
import styles from './Game.module.css';

const BEST_KEY = 'veloop_game_best';

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {
    /* ignore */
  }
}

/**
 * Game state machine: start → countdown → playing → submitting → result | error | noAttempts.
 * UI-only prototype logic lives here; rewards come from the service layer.
 */
export default function GameContainer({ open, onClose, attempts, onLevelUp }) {
  const [phase, setPhase] = useState('start');
  const [result, setResult] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const submit = useSubmitGame();
  const midnight = useRef(Date.now() + msUntilMidnight());
  const resetIn = useCountdown(attempts.remaining <= 0 ? midnight.current : null);
  // A level-up earned in any run of this session is celebrated when the game closes,
  // even if the player chose "Play Again" in between.
  const pendingLevelUp = useRef(null);

  useEffect(() => {
    if (open) {
      setPhase('start');
      setResult(null);
      pendingLevelUp.current = null;
    }
  }, [open]);

  const start = () => {
    if (attempts.remaining <= 0) return;
    attempts.consume();
    setPhase('countdown');
  };

  const send = useCallback(
    (score) => {
      setLastScore(score);
      setPhase('submitting');
      submit.mutate(score, {
        onSuccess: (res) => {
          if (res.playsRemainingToday != null) attempts.sync(res.playsRemainingToday);
          const best = readBest();
          setIsNewBest(res.score > best);
          if (res.score > best) saveBest(res.score);
          if (res.levelUp) pendingLevelUp.current = res.levelUp;
          setResult(res);
          setPhase('result');
        },
        onError: (err) => {
          if (err?.status === 403) {
            attempts.sync(0);
            setPhase('noAttempts');
          } else {
            setPhase('error');
          }
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submit.mutate, attempts.sync],
  );

  const onCountdownDone = useCallback(() => setPhase('playing'), []);

  const close = () => {
    if (phase === 'playing' || phase === 'countdown' || phase === 'submitting') return; // don't lose a run mid-play
    const levelUp = pendingLevelUp.current;
    pendingLevelUp.current = null;
    onClose();
    if (levelUp) onLevelUp?.(levelUp);
  };

  const canClose = !['playing', 'countdown', 'submitting'].includes(phase);

  return (
    <Modal open={open} onClose={close} labelledBy="game-title" variant="sheet" className={styles.modal}>
      <div className={styles.shell}>
        <div className={styles.topBar}>
          <button type="button" className={styles.iconBtn} onClick={close} disabled={!canClose} aria-label="Close game">
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          {(phase === 'playing' || phase === 'countdown') && (
            <span id="game-title" className={styles.topTitle}>
              XP Catcher
            </span>
          )}
          <span className={styles.topSpacer} />
        </div>

        {phase === 'start' && (
          <GameStart remaining={attempts.remaining} max={attempts.max} resetInMs={resetIn} onStart={start} />
        )}
        {phase === 'countdown' && <GameCountdown onDone={onCountdownDone} />}
        {phase === 'playing' && <GamePlay onFinish={send} />}
        {phase === 'submitting' && (
          <div className={styles.center} role="status">
            <Loader2 size={36} className={styles.spin} aria-hidden="true" />
            <p>Calculating your reward…</p>
            <p className={styles.muted}>Score: {lastScore}</p>
          </div>
        )}
        {phase === 'result' && result && (
          <GameResult
            result={result}
            isNewBest={isNewBest}
            remaining={attempts.remaining}
            onPlayAgain={() => {
              setResult(null);
              start();
            }}
            onBack={close}
          />
        )}
        {phase === 'noAttempts' && (
          <div className={styles.center}>
            <CircleAlert size={36} aria-hidden="true" className={styles.warnIcon} />
            <h2 id="game-title" className={styles.centerTitle}>
              You're out of attempts for today
            </h2>
            <p className={styles.muted}>Come back tomorrow for {attempts.max} fresh runs.</p>
            <button type="button" className={styles.backBtn} onClick={close} data-autofocus>
              Back to Dashboard
            </button>
          </div>
        )}
        {phase === 'error' && (
          <div className={styles.center} role="alert">
            <CircleAlert size={36} aria-hidden="true" className={styles.warnIcon} />
            <h2 id="game-title" className={styles.centerTitle}>
              We couldn't save this run
            </h2>
            <p className={styles.muted}>Your score was {lastScore}. Check your connection and try again.</p>
            <div className={styles.resultActions}>
              <button type="button" className={styles.playBtn} onClick={() => send(lastScore)} data-autofocus>
                Try Again
              </button>
              <button type="button" className={styles.backBtn} onClick={close}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
