import { useCallback, useState } from 'react';
import { DAILY_ATTEMPTS } from '../game/rewardRules.js';

export const ATTEMPTS_KEY = 'veloop_game_attempts';

function read(today) {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return DAILY_ATTEMPTS;
    const { date, playsRemainingToday } = JSON.parse(raw);
    if (date !== today || !Number.isFinite(playsRemainingToday)) return DAILY_ATTEMPTS;
    return Math.min(DAILY_ATTEMPTS, Math.max(0, playsRemainingToday));
  } catch {
    return DAILY_ATTEMPTS;
  }
}

function write(today, value) {
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ date: today, playsRemainingToday: value }));
  } catch {
    /* storage unavailable — attempts still tracked in memory */
  }
}

/** Daily game attempts, persisted per calendar day (the server is the final authority in live mode). */
const systemNow = () => new Date();

export function useGameAttempts({ now = systemNow } = {}) {
  const [remaining, setRemaining] = useState(() => read(now().toDateString()));

  const set = useCallback(
    (value) => {
      const next = Math.min(DAILY_ATTEMPTS, Math.max(0, value));
      write(now().toDateString(), next);
      setRemaining(next);
    },
    [now],
  );

  const consume = useCallback(() => set(read(now().toDateString()) - 1), [set, now]);

  return { remaining, max: DAILY_ATTEMPTS, consume, sync: set };
}
