import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameStart from '../PlayAndEarn/GameStart.jsx';

describe('GameStart', () => {
  it('explains objective, time limit, scoring, rewards and play frequency', () => {
    render(<GameStart remaining={5} max={5} resetInMs={0} onStart={() => {}} />);
    expect(screen.getByText(/objective:/i)).toBeInTheDocument();
    expect(screen.getByText(/20 seconds per run/i)).toBeInTheDocument();
    expect(screen.getByText('Score 80+')).toBeInTheDocument();
    expect(screen.getByText(/5 runs per day/i)).toBeInTheDocument();
    expect(screen.getByText(/no chance involved/i)).toBeInTheDocument();
  });

  it('starts when attempts remain', () => {
    const onStart = vi.fn();
    render(<GameStart remaining={3} max={5} resetInMs={0} onStart={onStart} />);
    fireEvent.click(screen.getByRole('button', { name: /start game/i }));
    expect(onStart).toHaveBeenCalled();
  });

  it('is disabled with a reset countdown when out of attempts', () => {
    render(<GameStart remaining={0} max={5} resetInMs={3_600_000} onStart={() => {}} />);
    expect(screen.getByRole('button', { name: /come back tomorrow/i })).toBeDisabled();
    expect(screen.getByText('Next attempt in 01:00:00')).toBeInTheDocument();
  });
});
