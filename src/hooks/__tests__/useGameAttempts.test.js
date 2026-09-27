import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameAttempts, ATTEMPTS_KEY } from '../useGameAttempts.js';

const today = new Date('2026-09-26T10:00:00');
const now = () => today;

beforeEach(() => localStorage.clear());

describe('useGameAttempts', () => {
  it('defaults to 5 attempts', () => {
    const { result } = renderHook(() => useGameAttempts({ now }));
    expect(result.current.remaining).toBe(5);
  });

  it('consume decrements and persists', () => {
    const { result } = renderHook(() => useGameAttempts({ now }));
    act(() => result.current.consume());
    expect(result.current.remaining).toBe(4);
    const saved = JSON.parse(localStorage.getItem(ATTEMPTS_KEY));
    expect(saved).toEqual({ date: today.toDateString(), playsRemainingToday: 4 });
  });

  it('never goes below zero', () => {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ date: today.toDateString(), playsRemainingToday: 0 }));
    const { result } = renderHook(() => useGameAttempts({ now }));
    act(() => result.current.consume());
    expect(result.current.remaining).toBe(0);
  });

  it('resets on a new day', () => {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ date: 'Fri Sep 25 2026', playsRemainingToday: 0 }));
    const { result } = renderHook(() => useGameAttempts({ now }));
    expect(result.current.remaining).toBe(5);
  });

  it('survives corrupt storage', () => {
    localStorage.setItem(ATTEMPTS_KEY, '{not json');
    const { result } = renderHook(() => useGameAttempts({ now }));
    expect(result.current.remaining).toBe(5);
  });

  it('sync adopts the server count', () => {
    const { result } = renderHook(() => useGameAttempts({ now }));
    act(() => result.current.sync(2));
    expect(result.current.remaining).toBe(2);
  });
});

describe('useGameAttempts stability', () => {
  it('keeps consume/sync identities stable across re-renders (no game-loop restarts)', () => {
    const { result, rerender } = renderHook(() => useGameAttempts());
    const { consume, sync } = result.current;
    rerender();
    expect(result.current.consume).toBe(consume);
    expect(result.current.sync).toBe(sync);
  });
});
