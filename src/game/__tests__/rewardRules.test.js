import { describe, it, expect } from 'vitest';
import { getReward, REWARD_TIERS } from '../rewardRules.js';

describe('getReward', () => {
  it.each([
    [0, 10, 0],
    [39, 10, 0],
    [40, 20, 0],
    [79, 20, 0],
    [80, 30, 10],
    [250, 30, 10],
  ])('score %i → +%i XP, +%i VEs', (score, xp, ve) => {
    expect(getReward(score)).toMatchObject({ xp, ve });
  });

  it('treats invalid scores as the lowest tier', () => {
    expect(getReward(NaN)).toMatchObject({ xp: 10, ve: 0 });
    expect(getReward(-5)).toMatchObject({ xp: 10, ve: 0 });
  });

  it('exposes tiers ordered from highest threshold', () => {
    expect(REWARD_TIERS[0].min).toBeGreaterThan(REWARD_TIERS.at(-1).min);
  });
});
