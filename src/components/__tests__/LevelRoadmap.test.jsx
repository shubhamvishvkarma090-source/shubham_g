import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import LevelRoadmap, { roadmapState } from '../LevelRoadmap/LevelRoadmap.jsx';

const levels = [
  { level: 3, name: 'Achiever', reward: { type: 'Gems', amount: 10 }, status: 'completed' },
  { level: 4, name: 'Momentum', reward: { type: 'VEs', amount: 250 }, status: 'current' },
  { level: 5, name: 'Ascendant', reward: { type: 'VEs', amount: 500 }, status: 'locked' },
  { level: 6, name: 'Vanguard', reward: { type: 'Spins', amount: 2 }, status: 'locked' },
];

describe('roadmapState', () => {
  it('marks the first locked level after current as next', () => {
    expect(levels.map((l) => roadmapState(l, 4))).toEqual(['completed', 'current', 'next', 'locked']);
  });
});

describe('LevelRoadmap', () => {
  it('shows each level state with text, not colour alone', () => {
    render(<LevelRoadmap levels={levels} currentLevel={4} />);
    const items = screen.getAllByRole('listitem');
    expect(within(items[0]).getByText(/completed/i)).toBeInTheDocument();
    expect(within(items[1]).getByText(/you are here/i)).toBeInTheDocument();
    expect(within(items[2]).getByText(/next goal/i)).toBeInTheDocument();
    expect(within(items[3]).getByText(/locked/i)).toBeInTheDocument();
  });

  it('opens level details on click', () => {
    render(<LevelRoadmap levels={levels} currentLevel={4} />);
    fireEvent.click(screen.getByRole('button', { name: /level 05 ascendant/i }));
    expect(screen.getByRole('dialog', { name: /level 05/i })).toBeInTheDocument();
  });

  it('shows an error state with retry', () => {
    render(<LevelRoadmap isError onRetry={() => {}} />);
    expect(screen.getByText('Unable to Load Level Roadmap')).toBeInTheDocument();
  });
});
