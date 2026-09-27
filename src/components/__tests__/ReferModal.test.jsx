import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ReferModal from '../ReferModal/ReferModal.jsx';

const feature = { key: 'refer_earn', title: 'Refer & Earn', xpReward: 50, status: 'available', cooldownHours: null, nextAvailableAt: null };

beforeEach(() => {
  localStorage.clear();
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue() } });
});

describe('ReferModal', () => {
  it('shows the referral code and link', () => {
    render(<ReferModal open feature={feature} onClose={() => {}} onClaim={() => {}} />);
    expect(screen.getByRole('dialog', { name: /invite friends/i })).toBeInTheDocument();
    expect(screen.getByText(/^VELOOP-/)).toBeInTheDocument();
    expect(screen.getByLabelText(/your referral link/i).value).toMatch(/\/Lvl-Dashboard\?ref=VELOOP-/);
  });

  it('locks the claim until the link has been shared', () => {
    render(<ReferModal open feature={feature} onClose={() => {}} onClaim={() => {}} />);
    expect(screen.getByRole('button', { name: /share your link to unlock/i })).toBeDisabled();
  });

  it('copying the link gives feedback and unlocks the claim', async () => {
    const onClaim = vi.fn();
    render(<ReferModal open feature={feature} onClose={() => {}} onClaim={onClaim} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy link/i }));
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringMatching(/ref=VELOOP-/));
    expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /claim \+50 xp/i }));
    expect(onClaim).toHaveBeenCalledWith('refer_earn');
  });

  it('opening a share channel unlocks the claim', () => {
    render(<ReferModal open feature={feature} onClose={() => {}} onClaim={() => {}} />);
    fireEvent.click(screen.getByRole('link', { name: /whatsapp/i }));
    expect(screen.getByRole('button', { name: /claim \+50 xp/i })).toBeEnabled();
  });

  it('marks referral milestones as coming soon', () => {
    render(<ReferModal open feature={feature} onClose={() => {}} onClaim={() => {}} />);
    expect(screen.getByText(/referral milestones/i)).toBeInTheDocument();
    expect(screen.getAllByText(/coming soon/i).length).toBeGreaterThan(0);
  });
});

describe('ReferModal errors', () => {
  it('shows claim errors inside the dialog', () => {
    render(<ReferModal open feature={feature} onClose={() => {}} onClaim={() => {}} error="Already claimed — check back when the timer ends." />);
    expect(screen.getByRole('alert')).toHaveTextContent(/already claimed/i);
  });
});
