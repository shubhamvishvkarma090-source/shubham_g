import { useEffect, useState } from 'react';

/** Milliseconds left until `targetMs` (epoch ms), ticking every second. */
export function useCountdown(targetMs) {
  const [left, setLeft] = useState(() => (targetMs ? Math.max(0, targetMs - Date.now()) : 0));
  useEffect(() => {
    if (!targetMs) {
      setLeft(0);
      return undefined;
    }
    const tick = () => setLeft(Math.max(0, targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return left;
}
