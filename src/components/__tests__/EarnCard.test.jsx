import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EarnCard from '../EarnMoreXP/EarnCard.jsx';
import { recommendation } from '../EarnMoreXP/Recommendation.jsx';

const base = { key: 'daily_tasks', title: 'Daily Tasks', xpReward: 30, cooldownHours: 24, status: 'available', nextAvailableAt: null };

describe('EarnCard', () => {
  it('claims an available feature', () => {
    const onClaim = vi.fn();
    render(<EarnCard feature={base} onClaim={onClaim} />);
    fireEvent.click(screen.getByRole('button', { name: /claim \+30 xp/i }));
    expect(onClaim).toHaveBeenCalledWith('daily_tasks');
  });

  it('shows a cooldown countdown when already claimed', () => {
    const nextAvailableAt = new Date(Date.now() + 2 * 3600_000).toISOString();
    render(<EarnCard feature={{ ...base, status: 'claimed', nextAvailableAt }} onClaim={() => {}} />);
    const btn = screen.getByRole('button', { name: /available in/i });
    expect(btn).toBeDisabled();
  });

  it('marks unsupported concepts as Coming Soon and disables them', () => {
    render(<EarnCard feature={{ key: 'weekly_quest', title: 'Weekly Quest', xpReward: null, status: 'coming_soon' }} onClaim={() => {}} />);
    expect(screen.getAllByText(/coming soon/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /coming soon/i })).toBeDisabled();
  });

  it('play cards call onPlay', () => {
    const onPlay = vi.fn();
    render(<EarnCard feature={{ key: 'play_earn', title: 'XP Catcher', xpReward: 30, status: 'available', action: 'play' }} onPlay={onPlay} />);
    fireEvent.click(screen.getByRole('button', { name: /play now/i }));
    expect(onPlay).toHaveBeenCalled();
  });
});

describe('recommendation', () => {
  const features = [
    { key: 'watch_earn', title: 'Watch & Earn', xpReward: 15, status: 'available' },
    { key: 'refer_earn', title: 'Refer & Earn', xpReward: 50, status: 'available' },
    { key: 'weekly_quest', title: 'Weekly Quest', xpReward: null, status: 'coming_soon' },
  ];

  it('points to the highest available reward', () => {
    const r = recommendation({ nextLevel: 5, xpToNext: 1580 }, features);
    expect(r.headline).toBe("You're 1,580 XP away from Level 05.");
    expect(r.detail).toMatch(/Refer & Earn/);
  });

  it('celebrates when one activity is enough', () => {
    const r = recommendation({ nextLevel: 5, xpToNext: 40 }, features);
    expect(r.detail).toMatch(/one more activity/i);
  });

  it('handles max level', () => {
    expect(recommendation({ nextLevel: null, xpToNext: 0 }, features).headline).toMatch(/top level/i);
  });
});

describe('EarnCard — Refer & Earn', () => {
  const refer = { key: 'refer_earn', title: 'Refer & Earn', xpReward: 50, status: 'available', cooldownHours: null };

  it('opens the invite flow instead of claiming directly', () => {
    const onRefer = vi.fn();
    const onClaim = vi.fn();
    render(<EarnCard feature={refer} onRefer={onRefer} onClaim={onClaim} />);
    fireEvent.click(screen.getByRole('button', { name: /invite friends/i }));
    expect(onRefer).toHaveBeenCalled();
    expect(onClaim).not.toHaveBeenCalled();
  });

  it('still lets users share while the bonus is cooling down', () => {
    const onRefer = vi.fn();
    const nextAvailableAt = new Date(Date.now() + 3_600_000).toISOString();
    render(<EarnCard feature={{ ...refer, status: 'claimed', nextAvailableAt }} onRefer={onRefer} />);
    fireEvent.click(screen.getByRole('button', { name: /invite friends/i }));
    expect(onRefer).toHaveBeenCalled();
  });
});
