import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const responses = [];
vi.mock('../../hooks/useDashboardData.js', () => ({
  useSubmitGame: () => ({ mutate: (score, { onSuccess }) => onSuccess(responses.shift()) }),
}));
vi.mock('../PlayAndEarn/GameCountdown.jsx', () => ({
  default: ({ onDone }) => <button type="button" onClick={onDone}>go</button>,
}));
vi.mock('../PlayAndEarn/GamePlay.jsx', () => ({
  default: ({ onFinish }) => <button type="button" onClick={() => onFinish(50)}>finish</button>,
}));

const { default: GameContainer } = await import('../PlayAndEarn/GameContainer.jsx');

const result = (levelUp) => ({ score: 50, reward: { xp: 20, ve: 0 }, profile: null, playsRemainingToday: null, levelUp });

describe('GameContainer', () => {
  it('still celebrates a level-up earned before "Play Again"', () => {
    responses.push(result({ toLevel: 5, name: 'Ascendant' }), result(null));
    const onLevelUp = vi.fn();
    const onClose = vi.fn();
    const attempts = { remaining: 5, max: 5, consume: vi.fn(), sync: vi.fn() };
    render(<GameContainer open onClose={onClose} attempts={attempts} onLevelUp={onLevelUp} />);

    fireEvent.click(screen.getByRole('button', { name: /start game/i }));
    fireEvent.click(screen.getByText('go'));
    fireEvent.click(screen.getByText('finish'));
    fireEvent.click(screen.getByRole('button', { name: /play again/i }));
    fireEvent.click(screen.getByText('go'));
    fireEvent.click(screen.getByText('finish'));
    fireEvent.click(screen.getByRole('button', { name: /back to dashboard/i }));

    expect(onClose).toHaveBeenCalled();
    expect(onLevelUp).toHaveBeenCalledWith({ toLevel: 5, name: 'Ascendant' });
  });
});
