/**
 * Single entry point for all dashboard data.
 * Live API by default; VITE_USE_MOCK=true switches to the in-memory demo server.
 */
import { USE_MOCK } from './config.js';
import { ApiError, GENERIC_MESSAGE, request } from './client.js';
import { createMockServer } from './mockServer.js';
import { getPreviewState } from './preview.js';

const mock = USE_MOCK ? createMockServer({ latency: 500 }) : null;

async function read(livePath, mockCall, emptyValue) {
  const preview = getPreviewState();
  if (preview === 'loading') return new Promise(() => {});
  if (preview === 'error') throw new ApiError(500, GENERIC_MESSAGE);
  const data = mock ? await mockCall() : await request(livePath);
  if (preview === 'empty' && emptyValue) return emptyValue;
  return data;
}

export const fetchProfile = () => read('/api/profile', () => mock.getProfile());
export const fetchLevels = () => read('/api/levels', () => mock.getLevels());
export const fetchActivity = (limit = 20) =>
  read(`/api/activity?limit=${limit}`, () => mock.getActivity(limit), { activity: [] });
export const fetchEarningFeatures = () =>
  read('/api/earning-features', () => mock.getEarningFeatures(), { features: [] });

export async function claimEarningFeature(key) {
  const res = mock
    ? await mock.claimFeature(key)
    : await request(`/api/earning-features/${encodeURIComponent(key)}/claim`, { method: 'POST' });
  return { levelUp: res?.levelUp ?? null };
}

export function normalizeGameResult(res, score) {
  return {
    score: res?.score ?? score,
    reward: { xp: res?.reward?.xp ?? 0, ve: res?.reward?.ve ?? 0 },
    profile: res?.profile ?? null,
    playsRemainingToday: res?.playsRemainingToday ?? null,
    levelUp: res?.levelUp ?? null,
  };
}

export async function submitGameSession(score) {
  const res = mock
    ? await mock.submitGame(score)
    : await request('/api/game/session', { method: 'POST', body: { score } });
  return normalizeGameResult(res, score);
}

export const isMockMode = USE_MOCK;
