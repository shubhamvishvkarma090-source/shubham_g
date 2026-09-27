import { describe, it, expect } from 'vitest';
import {
  GAME,
  ITEM_TYPES,
  createGame,
  step,
  moveBasket,
  applyCatch,
  applyMiss,
  speedAt,
  timeLeftMs,
} from '../engine.js';

const noSpawn = () => 0.999; // rng that never matters when we control items directly

describe('applyCatch', () => {
  it('adds item points to score', () => {
    const s = applyCatch(createGame(), 'xp');
    expect(s.score).toBe(ITEM_TYPES.xp.points);
    expect(s.caught).toBe(1);
  });

  it('activates the multiplier after consecutive catches', () => {
    let s = createGame();
    for (let i = 0; i < GAME.comboForMultiplier; i += 1) s = applyCatch(s, 'xp');
    expect(s.multiplier).toBe(GAME.multiplier);
    const before = s.score;
    s = applyCatch(s, 'xp');
    expect(s.score - before).toBe(ITEM_TYPES.xp.points * GAME.multiplier);
  });

  it('dud resets combo and multiplier and never makes the score negative', () => {
    let s = createGame();
    for (let i = 0; i < GAME.comboForMultiplier; i += 1) s = applyCatch(s, 've');
    s = applyCatch(s, 'dud');
    expect(s.combo).toBe(0);
    expect(s.multiplier).toBe(1);
    s = applyCatch(applyCatch(applyCatch(s, 'dud'), 'dud'), 'dud');
    expect(s.score).toBe(0);
  });
});

describe('applyMiss', () => {
  it('missing a good item breaks the combo', () => {
    let s = createGame();
    for (let i = 0; i < GAME.comboForMultiplier; i += 1) s = applyCatch(s, 'xp');
    s = applyMiss(s, 'gem');
    expect(s.combo).toBe(0);
    expect(s.multiplier).toBe(1);
    expect(s.missed).toBe(1);
  });

  it('letting a dud fall is not a miss', () => {
    const s = applyMiss(applyCatch(createGame(), 'xp'), 'dud');
    expect(s.combo).toBe(1);
    expect(s.missed).toBe(0);
  });
});

describe('step', () => {
  it('clamps large frame deltas (e.g. hidden tab)', () => {
    const s = step(createGame(), 5000, noSpawn);
    expect(s.elapsedMs).toBe(GAME.maxDtMs);
  });

  it('finishes after the game duration', () => {
    let s = createGame();
    while (!s.done) s = step(s, 100, noSpawn);
    expect(s.elapsedMs).toBe(GAME.durationMs);
    expect(timeLeftMs(s)).toBe(0);
  });

  it('spawns items over time', () => {
    let s = createGame();
    for (let i = 0; i < 20; i += 1) s = step(s, 100, () => 0.3);
    expect(s.items.length + s.caught + s.missed).toBeGreaterThan(0);
  });

  it('catches an item that falls into the basket', () => {
    let s = { ...createGame(), items: [{ id: 1, type: 'xp', x: 50, y: GAME.basketY - 1 }], basketX: 50 };
    s = step(s, 100, noSpawn);
    expect(s.caught).toBe(1);
    expect(s.score).toBe(ITEM_TYPES.xp.points);
    expect(s.events.at(-1)).toMatchObject({ kind: 'catch', type: 'xp' });
  });

  it('misses an item that falls past the basket', () => {
    let s = { ...createGame(), items: [{ id: 1, type: 'xp', x: 5, y: 99 }], basketX: 90 };
    s = step(s, 100, noSpawn);
    expect(s.items).toHaveLength(0);
    expect(s.missed).toBe(1);
  });
});

describe('helpers', () => {
  it('speed increases every step interval', () => {
    expect(speedAt(GAME.speedStepMs + 1)).toBeGreaterThan(speedAt(0));
  });

  it('moveBasket clamps to the field', () => {
    expect(moveBasket(createGame(), -40).basketX).toBe(GAME.basketWidth / 2);
    expect(moveBasket(createGame(), 400).basketX).toBe(100 - GAME.basketWidth / 2);
  });
});
