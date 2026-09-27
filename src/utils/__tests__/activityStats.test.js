import { describe, it, expect } from 'vitest';
import { activityStats } from '../activityStats.js';

const now = new Date('2026-09-26T18:00:00').getTime();
const at = (hoursAgo, xp, ve) => ({ id: String(hoursAgo), xpDelta: xp, veDelta: ve, timestamp: new Date(now - hoursAgo * 3_600_000).toISOString() });

describe('activityStats', () => {
  it('sums today XP/VEs and counts actions', () => {
    const s = activityStats([at(1, 20), at(2, 50, 10), at(30, 100)], now);
    expect(s).toMatchObject({ xpToday: 70, veToday: 10, actionsToday: 2 });
  });

  it('counts consecutive active days ending today', () => {
    expect(activityStats([at(1, 5), at(20, 5), at(44, 5)], now).streakDays).toBe(3);
  });

  it('streak is 0 when nothing today or yesterday', () => {
    expect(activityStats([at(80, 5)], now).streakDays).toBe(0);
  });

  it('handles empty input', () => {
    expect(activityStats([], now)).toEqual({ xpToday: 0, veToday: 0, actionsToday: 0, streakDays: 0 });
  });
});
