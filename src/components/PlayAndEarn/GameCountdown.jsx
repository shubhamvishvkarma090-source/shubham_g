import { useEffect, useState } from 'react';
import styles from './Game.module.css';

const STEP_MS = 700;

export default function GameCountdown({ onDone }) {
  const [n, setN] = useState(3);

  useEffect(() => {
    const t = setTimeout(() => (n === 0 ? onDone() : setN(n - 1)), STEP_MS);
    return () => clearTimeout(t);
  }, [n, onDone]);

  return (
    <div className={styles.countdown} aria-live="assertive">
      <span key={n} className={styles.countNum}>
        {n === 0 ? 'GO!' : n}
      </span>
      <p className={styles.countHint}>Get ready…</p>
    </div>
  );
}
