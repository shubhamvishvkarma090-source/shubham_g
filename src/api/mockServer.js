/**
 * In-memory stand-in for the VELOOP API (development/demo only).
 * Mirrors the live endpoint shapes; reward values come from demo config.
 */
import { ApiError } from './client.js';
import { FEATURES, FEATURE_ACTIVITY_LABELS, INITIAL_XP, LEVELS, seedActivity } from '../data/mockData.js';
import { DAILY_ATTEMPTS, getReward } from '../game/rewardRules.js';

const HOUR = 3600 * 1000;
const clone = (v) => JSON.parse(JSON.stringify(v));

export function computeProfile(xp, levels = LEVELS) {
  const current = [...levels].reverse().find((l) => xp >= l.minXP) ?? levels[0];
  const next = levels.find((l) => l.level === current.level + 1) ?? null;
  if (!next) {
    return {
      currentLevel: current.level,
      currentLevelName: current.name,
      currentXP: xp,
      nextLevel: null,
      requiredXP: null,
      xpToNext: 0,
      progressPct: 100,
      nextLevelReward: null,
    };
  }
  return {
    currentLevel: current.level,
    currentLevelName: current.name,
    currentXP: xp,
    nextLevel: next.level,
    requiredXP: next.minXP,
    xpToNext: next.minXP - xp,
    progressPct: Math.min(100, Math.floor((xp / next.minXP) * 100)),
    nextLevelReward: next.reward,
  };
}

export function createMockServer({ now = () => Date.now(), latency = 0, initialXP = INITIAL_XP } = {}) {
  const state = {
    xp: initialXP,
    activity: seedActivity(now()),
    claims: {}, // key -> lastClaimedAt (ms)
    plays: { date: null, remaining: DAILY_ATTEMPTS },
    seq: 1,
  };

  const respond = (value) =>
    new Promise((resolve) => setTimeout(() => resolve(clone(value)), latency));
  const fail = (status, message) =>
    new Promise((_, reject) => setTimeout(() => reject(new ApiError(status, message)), latency));

  const dayKey = () => new Date(now()).toDateString();

  function featureView(f) {
    const last = state.claims[f.key] ?? null;
    let status = f.status;
    let nextAvailableAt = null;
    if (status !== 'coming_soon' && last && f.cooldownHours) {
      const until = last + f.cooldownHours * HOUR;
      if (now() < until) {
        status = 'claimed';
        nextAvailableAt = new Date(until).toISOString();
      }
    }
    return { ...f, status, lastClaimedAt: last ? new Date(last).toISOString() : null, nextAvailableAt };
  }

  function addXP(amount, entry) {
    const before = computeProfile(state.xp);
    state.xp += amount;
    const after = computeProfile(state.xp);
    state.activity.unshift({ id: `mock-${state.seq++}`, timestamp: new Date(now()).toISOString(), xpDelta: amount, ...entry });
    if (after.currentLevel > before.currentLevel) {
      const lvl = LEVELS.find((l) => l.level === after.currentLevel);
      return { toLevel: lvl.level, name: lvl.name, reward: lvl.reward };
    }
    return null;
  }

  return {
    getProfile: () => respond(computeProfile(state.xp)),

    getLevels: () => {
      const { currentLevel } = computeProfile(state.xp);
      return respond({
        levels: LEVELS.map(({ level, name, reward, minXP, perks }) => ({
          level,
          name,
          reward,
          minXP,
          perks,
          status: level < currentLevel ? 'completed' : level === currentLevel ? 'current' : 'locked',
        })),
      });
    },

    getActivity: (limit = 20) => respond({ activity: state.activity.slice(0, limit) }),

    getEarningFeatures: () => respond({ features: FEATURES.map(featureView) }),

    claimFeature: (key) => {
      const feature = FEATURES.find((f) => f.key === key);
      if (!feature) return fail(404, 'This activity is not available right now.');
      const view = featureView(feature);
      if (view.status === 'coming_soon') return fail(409, 'This activity is coming soon.');
      if (view.status === 'claimed') return fail(409, 'Already claimed — check back when the timer ends.');
      state.claims[key] = now();
      const levelUp = addXP(feature.xpReward, { type: key, label: FEATURE_ACTIVITY_LABELS[key] ?? feature.title });
      return respond({ xpAwarded: feature.xpReward, levelUp, profile: computeProfile(state.xp) });
    },

    submitGame: (score) => {
      if (state.plays.date !== dayKey()) state.plays = { date: dayKey(), remaining: DAILY_ATTEMPTS };
      if (state.plays.remaining <= 0) return fail(403, "You're out of attempts for today — come back tomorrow!");
      state.plays.remaining -= 1;
      const { xp, ve } = getReward(score);
      const levelUp = addXP(xp, { type: 'game', label: 'Mini-Game Challenge | XP Catcher', veDelta: ve || undefined });
      return respond({
        score,
        reward: { xp, ve },
        profile: computeProfile(state.xp),
        playsRemainingToday: state.plays.remaining,
        levelUp,
      });
    },
  };
}
