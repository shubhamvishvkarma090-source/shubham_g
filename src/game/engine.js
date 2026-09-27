/**
 * XP Catcher — pure game engine.
 *
 * Prototype gameplay logic only: it knows nothing about React, rewards or the
 * backend. The playing field is a logical 100 × 100 grid that the UI maps to
 * percentages, so the game scales to any screen size.
 */

export const ITEM_TYPES = {
  xp: { points: 5, weight: 45, label: 'XP orb' },
  ve: { points: 3, weight: 33, label: 'VE coin' },
  gem: { points: 10, weight: 8, label: 'Gem' },
  dud: { points: -5, weight: 14, label: 'Dud block' },
};

export const GAME = {
  durationMs: 20_000,
  basketWidth: 22,
  basketY: 88,
  itemSize: 8,
  spawnEveryMs: 520,
  baseSpeed: 30, // field units per second
  speedStepMs: 5_000,
  speedFactor: 1.2,
  comboForMultiplier: 5,
  multiplier: 2,
  maxDtMs: 100,
};

const CATCH_ZONE_TOP = GAME.basketY - 2;
const CATCH_ZONE_BOTTOM = GAME.basketY + 5;
const TOTAL_WEIGHT = Object.values(ITEM_TYPES).reduce((sum, t) => sum + t.weight, 0);

export function createGame() {
  return {
    elapsedMs: 0,
    items: [],
    basketX: 50,
    score: 0,
    combo: 0,
    multiplier: 1,
    caught: 0,
    missed: 0,
    spawnAccMs: 0,
    nextId: 1,
    events: [],
    done: false,
  };
}

export function speedAt(elapsedMs) {
  return GAME.baseSpeed * GAME.speedFactor ** Math.floor(elapsedMs / GAME.speedStepMs);
}

export function timeLeftMs(state) {
  return Math.max(0, GAME.durationMs - state.elapsedMs);
}

export function moveBasket(state, x) {
  const half = GAME.basketWidth / 2;
  return { ...state, basketX: Math.min(100 - half, Math.max(half, x)) };
}

export function applyCatch(state, type, at = {}) {
  const base = ITEM_TYPES[type].points;
  const isGood = base > 0;
  const points = isGood ? base * state.multiplier : base;
  const combo = isGood ? state.combo + 1 : 0;
  const multiplier = isGood && combo >= GAME.comboForMultiplier ? GAME.multiplier : 1;
  return {
    ...state,
    score: Math.max(0, state.score + points),
    combo,
    multiplier,
    caught: state.caught + (isGood ? 1 : 0),
    events: [...state.events, { kind: 'catch', type, points, x: at.x ?? state.basketX, id: at.id ?? state.nextId }],
  };
}

export function applyMiss(state, type) {
  if (ITEM_TYPES[type].points < 0) return state;
  return { ...state, combo: 0, multiplier: 1, missed: state.missed + 1, events: [...state.events, { kind: 'miss', type }] };
}

function pickType(rng) {
  let roll = rng() * TOTAL_WEIGHT;
  for (const [type, { weight }] of Object.entries(ITEM_TYPES)) {
    if (roll < weight) return type;
    roll -= weight;
  }
  return 'xp';
}

export function step(state, dtMs, rng = Math.random) {
  if (state.done) return state;
  const dt = Math.min(Math.max(dtMs, 0), GAME.maxDtMs);
  const elapsedMs = Math.min(GAME.durationMs, state.elapsedMs + dt);
  let next = { ...state, elapsedMs, events: [] };

  // Spawn
  let spawnAccMs = state.spawnAccMs + dt;
  const spawned = [];
  while (spawnAccMs >= GAME.spawnEveryMs) {
    spawnAccMs -= GAME.spawnEveryMs;
    const half = GAME.itemSize / 2;
    spawned.push({ id: next.nextId + spawned.length, type: pickType(rng), x: half + rng() * (100 - GAME.itemSize), y: -GAME.itemSize });
  }
  next = { ...next, spawnAccMs, nextId: next.nextId + spawned.length };

  // Move + collide
  const dy = (speedAt(state.elapsedMs) * dt) / 1000;
  const reach = GAME.basketWidth / 2 + GAME.itemSize * 0.3;
  const remaining = [];
  for (const item of [...state.items, ...spawned]) {
    const y = item.y + dy;
    const inZone = y >= CATCH_ZONE_TOP && y <= CATCH_ZONE_BOTTOM;
    if (inZone && Math.abs(item.x - next.basketX) <= reach) {
      next = applyCatch(next, item.type, item);
    } else if (y > 100) {
      next = applyMiss(next, item.type);
    } else {
      remaining.push({ ...item, y });
    }
  }
  next.items = remaining;

  if (elapsedMs >= GAME.durationMs) next = { ...next, done: true };
  return next;
}
