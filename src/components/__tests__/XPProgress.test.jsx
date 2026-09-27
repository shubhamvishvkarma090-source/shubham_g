import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import XPProgress from '../XPProgress/XPProgress.jsx';

const profile = {
  currentLevel: 4,
  currentXP: 6420,
  nextLevel: 5,
  requiredXP: 8000,
  xpToNext: 1580,
  progressPct: 80,
};

describe('XPProgress', () => {
  it('shows XP totals, percentage and XP needed without the user calculating', () => {
    render(<XPProgress profile={profile} />);
    expect(screen.getByText('6,420 / 8,000 XP')).toBeInTheDocument();
    expect(screen.getByText(/1,580 XP/)).toBeInTheDocument();
    expect(screen.getByText(/to Level 05/)).toBeInTheDocument();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '80');
    expect(bar).toHaveAttribute('aria-valuetext', '6,420 of 8,000 XP, 1,580 XP to Level 05');
  });

  it('renders a max-level state', () => {
    render(<XPProgress profile={{ ...profile, currentLevel: 10, nextLevel: null, requiredXP: null, xpToNext: 0, progressPct: 100 }} />);
    expect(screen.getByText(/max level reached/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
