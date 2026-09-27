import { describe, it, expect } from 'vitest';
import { normalizeGameResult } from '../services.js';

describe('normalizeGameResult', () => {
  it('fills safe defaults for missing fields', () => {
    expect(normalizeGameResult({}, 42)).toEqual({
      score: 42,
      reward: { xp: 0, ve: 0 },
      profile: null,
      playsRemainingToday: null,
      levelUp: null,
    });
  });

  it('keeps server values', () => {
    const r = normalizeGameResult({ score: 90, reward: { xp: 30, ve: 10 }, playsRemainingToday: 2, levelUp: { toLevel: 5 } }, 1);
    expect(r).toMatchObject({ score: 90, reward: { xp: 30, ve: 10 }, playsRemainingToday: 2, levelUp: { toLevel: 5 } });
  });
});
