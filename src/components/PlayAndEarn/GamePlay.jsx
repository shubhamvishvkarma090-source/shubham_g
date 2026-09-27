import { useCallback, useEffect, useRef, useState } from 'react';
import { Zap } from 'lucide-react';
import { Basket, DudBlock, Gem, VeCoin, XpOrb } from '../Icons/Icons.jsx';
import { GAME, createGame, moveBasket, step, timeLeftMs } from '../../game/engine.js';
import { formatDuration } from '../../utils/format.js';
import styles from './Game.module.css';

const ITEM_ICON = {
  xp: (s) => <XpOrb size={s} />,
  ve: (s) => <VeCoin size={s} />,
  gem: (s) => <Gem size={s} tone="green" />,
  dud: (s) => <DudBlock size={s} />,
};

const KEY_SPEED = 85; // field units per second
const POPUP_MS = 700;

export default function GamePlay({ onFinish }) {
  const fieldRef = useRef(null);
  const stateRef = useRef(createGame());
  const keysRef = useRef({ left: false, right: false });
  const popupsRef = useRef([]);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const [, setFrame] = useState(0);
  const [announce, setAnnounce] = useState('Game started. Catch the falling items.');

  const pointerTo = useCallback((clientX) => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    stateRef.current = moveBasket(stateRef.current, ((clientX - rect.left) / rect.width) * 100);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const set = (e, down) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keysRef.current.left = down;
      else if (k === 'arrowright' || k === 'd') keysRef.current.right = down;
      else return;
      e.preventDefault();
    };
    const onDown = (e) => set(e, true);
    const onUp = (e) => set(e, false);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    let raf;
    let last = performance.now();
    let lastAnnouncedSecond = null;
    let lastMultiplier = 1;

    const loop = (now) => {
      const dt = now - last;
      last = now;
      let s = stateRef.current;
      const dir = (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0);
      if (dir) s = moveBasket(s, s.basketX + (dir * KEY_SPEED * Math.min(dt, GAME.maxDtMs)) / 1000);
      s = step(s, dt);
      stateRef.current = s;

      for (const ev of s.events) {
        if (ev.kind === 'catch') popupsRef.current.push({ id: `${ev.id}-${now}`, x: ev.x, points: ev.points, t: now });
      }
      popupsRef.current = popupsRef.current.filter((p) => now - p.t < POPUP_MS);

      if (s.multiplier !== lastMultiplier) {
        lastMultiplier = s.multiplier;
        setAnnounce(s.multiplier > 1 ? `${s.multiplier} times multiplier active` : 'Combo lost');
      }
      const second = Math.ceil(timeLeftMs(s) / 1000);
      if (second !== lastAnnouncedSecond && second % 5 === 0) {
        lastAnnouncedSecond = second;
        setAnnounce(`${second} seconds left, score ${s.score}`);
      }

      setFrame((f) => (f + 1) % 1_000_000);

      if (s.done) {
        if (!finishedRef.current) {
          finishedRef.current = true;
          onFinishRef.current(s.score);
        }
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const s = stateRef.current;
  const left = timeLeftMs(s);
  const now = performance.now();

  return (
    <div className={styles.playScreen}>
      <div className={styles.hud}>
        <div className={styles.hudScore}>
          <span className={styles.hudLabel}>Score</span>
          <span className={`${styles.hudValue} tabular`}>{s.score}</span>
        </div>
        <div className={styles.combo} aria-hidden="true">
          {Array.from({ length: GAME.comboForMultiplier }, (_, i) => (
            <span key={i} className={i < Math.min(s.combo, GAME.comboForMultiplier) ? styles.comboOn : ''} />
          ))}
        </div>
        <div className={`${styles.timer} ${left <= 5000 ? styles.timerLow : ''} tabular`}>
          {formatDuration(left).slice(3)}
        </div>
      </div>

      <div
        ref={fieldRef}
        className={styles.field}
        role="application"
        aria-label="XP Catcher play area. Move the basket with your pointer, finger, or the arrow keys."
        onPointerMove={(e) => pointerTo(e.clientX)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          pointerTo(e.clientX);
        }}
        tabIndex={0}
      >
        <span className={styles.fieldGlow} aria-hidden="true" />
        {s.items.map((item) => (
          <span
            key={item.id}
            className={styles.item}
            style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${GAME.itemSize}%` }}
          >
            {ITEM_ICON[item.type]('100%')}
          </span>
        ))}
        {popupsRef.current.map((p) => (
          <span
            key={p.id}
            className={`${styles.popup} ${p.points < 0 ? styles.popupBad : ''}`}
            style={{ left: `${p.x}%`, opacity: 1 - (now - p.t) / POPUP_MS, transform: `translate(-50%, ${-((now - p.t) / POPUP_MS) * 40}px)` }}
            aria-hidden="true"
          >
            {p.points > 0 ? `+${p.points}` : p.points}
          </span>
        ))}
        <span className={styles.basket} style={{ left: `${s.basketX}%`, width: `${GAME.basketWidth}%` }} aria-hidden="true">
          <Basket />
        </span>
      </div>

      <div className={styles.playFooter}>
        <span className={`${styles.multiplier} ${s.multiplier > 1 ? styles.multiplierOn : ''}`}>
          <Zap size={14} aria-hidden="true" /> {s.multiplier > 1 ? `${s.multiplier}X Multiplier` : `Combo ${s.combo}/${GAME.comboForMultiplier}`}
        </span>
        <span className={styles.caught}>
          Caught <strong className="tabular">{s.caught}</strong>
        </span>
      </div>

      <p className="visually-hidden-live" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}
