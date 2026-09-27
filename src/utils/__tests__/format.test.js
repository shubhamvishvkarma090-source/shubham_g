import { describe, it, expect } from 'vitest';
import { formatNumber, padLevel, formatDuration, formatReward, msUntilMidnight, timeAgo } from '../format.js';

describe('format', () => {
  it('formats numbers with separators', () => expect(formatNumber(6420)).toBe('6,420'));
  it('pads levels to two digits', () => expect(padLevel(5)).toBe('05'));
  it('formats durations as HH:MM:SS', () => expect(formatDuration(3_723_000)).toBe('01:02:03'));
  it('clamps negative durations', () => expect(formatDuration(-5)).toBe('00:00:00'));
  it('formats rewards', () => expect(formatReward({ type: 'VEs', amount: 500 })).toBe('500 VEs'));
  it('formats missing rewards', () => expect(formatReward(null)).toBe('Badge unlock'));
  it('computes ms until midnight', () => expect(msUntilMidnight(new Date('2026-09-26T23:00:00'))).toBe(3_600_000));
  it('describes relative time', () => {
    const now = new Date('2026-09-26T10:00:00').getTime();
    expect(timeAgo(new Date(now - 5 * 60_000).toISOString(), now)).toBe('5m ago');
    expect(timeAgo(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe('3h ago');
    expect(timeAgo(new Date(now - 30_000).toISOString(), now)).toBe('Just now');
  });
});
