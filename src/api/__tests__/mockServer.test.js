import { describe, it, expect } from 'vitest';
import { computeProfile, createMockServer } from '../mockServer.js';
import { LEVELS } from '../../data/mockData.js';
import { ApiError } from '../client.js';

describe('computeProfile', () => {
  it('derives level progress from XP', () => {
    const p = computeProfile(6420, LEVELS);
    expect(p).toMatchObject({
      currentLevel: 4,
      currentLevelName: 'Momentum',
      currentXP: 6420,
      nextLevel: 5,
      requiredXP: 8000,
      xpToNext: 1580,
      progressPct: 80,
      nextLevelReward: { type: 'VEs', amount: 500 },
    });
  });

  it('handles the max level without dividing by zero', () => {
    const p = computeProfile(999_999, LEVELS);
    expect(p.currentLevel).toBe(LEVELS.at(-1).level);
    expect(p.nextLevel).toBeNull();
    expect(p.xpToNext).toBe(0);
    expect(p.progressPct).toBe(100);
    expect(p.nextLevelReward).toBeNull();
  });
});

describe('createMockServer', () => {
  const clock = (start = Date.parse('2026-09-26T10:00:00Z')) => {
    let t = start;
    return { now: () => t, advance: (ms) => { t += ms; } };
  };

  it('lists levels with completed/current/locked states', async () => {
    const server = createMockServer({ now: clock().now });
    const { levels } = await server.getLevels();
    expect(levels.find((l) => l.level === 3).status).toBe('completed');
    expect(levels.find((l) => l.level === 4).status).toBe('current');
    expect(levels.find((l) => l.level === 5).status).toBe('locked');
  });

  it('claiming a feature adds XP and activity, then enforces the cooldown', async () => {
    const c = clock();
    const server = createMockServer({ now: c.now });
    const before = await server.getProfile();
    await server.claimFeature('daily_tasks');
    const after = await server.getProfile();
    expect(after.currentXP).toBeGreaterThan(before.currentXP);
    const { activity } = await server.getActivity(5);
    expect(activity[0].type).toBe('daily_tasks');

    const err = await server.claimFeature('daily_tasks').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
    const { features } = await server.getEarningFeatures();
    const daily = features.find((f) => f.key === 'daily_tasks');
    expect(daily.status).toBe('claimed');
    expect(daily.nextAvailableAt).toBeTruthy();

    c.advance(25 * 3600 * 1000);
    const again = await server.getEarningFeatures();
    expect(again.features.find((f) => f.key === 'daily_tasks').status).toBe('available');
  });

  it('refuses to claim coming-soon features', async () => {
    const server = createMockServer({ now: clock().now });
    const err = await server.claimFeature('weekly_quest').catch((e) => e);
    expect(err.status).toBe(409);
  });

  it('submitGame returns the demo reward and remaining plays', async () => {
    const server = createMockServer({ now: clock().now });
    const res = await server.submitGame(85);
    expect(res.reward).toEqual({ xp: 30, ve: 10 });
    expect(res.score).toBe(85);
    expect(res.playsRemainingToday).toBe(4);
    expect(res.levelUp).toBeNull();
    expect(res.profile.currentXP).toBe(6420 + 30);
  });

  it('submitGame reports a level-up when XP crosses the threshold', async () => {
    const server = createMockServer({ now: clock().now, initialXP: 7990 });
    const res = await server.submitGame(10);
    expect(res.levelUp).toMatchObject({ toLevel: 5, name: 'Ascendant', reward: { type: 'VEs', amount: 500 } });
  });

  it('submitGame rejects with 403 when out of daily attempts', async () => {
    const server = createMockServer({ now: clock().now });
    for (let i = 0; i < 5; i += 1) await server.submitGame(1);
    const err = await server.submitGame(1).catch((e) => e);
    expect(err.status).toBe(403);
  });
});
