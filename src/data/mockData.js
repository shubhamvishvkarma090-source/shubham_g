/**
 * DEVELOPMENT / DEMO DATA.
 *
 * Shapes mirror the live VELOOP API so the mock server can stand in for it
 * (set VITE_USE_MOCK=true). Level names and rewards match the current
 * backend configuration; XP thresholds and all amounts are demo values.
 */

export const INITIAL_XP = 6420;

export const LEVELS = [
  { level: 1, name: 'Starter', minXP: 0, reward: null, perks: ['Access to daily tasks'] },
  { level: 2, name: 'Explorer', minXP: 1000, reward: { type: 'VEs', amount: 100 }, perks: ['Watch & Earn unlocked'] },
  { level: 3, name: 'Achiever', minXP: 2500, reward: { type: 'Gems', amount: 10 }, perks: ['Refer & Earn unlocked'] },
  { level: 4, name: 'Momentum', minXP: 4500, reward: { type: 'VEs', amount: 250 }, perks: ['XP Catcher mini-game', '5 daily game attempts'] },
  { level: 5, name: 'Ascendant', minXP: 8000, reward: { type: 'VEs', amount: 500 }, perks: ['Higher daily XP limit', 'Access to new challenges', 'Better reward opportunities'] },
  { level: 6, name: 'Vanguard', minXP: 12000, reward: { type: 'Spins', amount: 2 }, perks: ['Weekly quests', 'Priority support'] },
  { level: 7, name: 'Trailblazer', minXP: 17000, reward: { type: 'Gems', amount: 15 }, perks: ['Exclusive game modes'] },
  { level: 8, name: 'Champion', minXP: 23000, reward: { type: 'VEs', amount: 750 }, perks: ['Champion badge', 'Bonus mission slots'] },
  { level: 9, name: 'Legend', minXP: 30000, reward: { type: 'Spins', amount: 3 }, perks: ['Legend profile frame'] },
  { level: 10, name: 'Mythic', minXP: 40000, reward: { type: 'VEs', amount: 1000 }, perks: ['Mythic status', 'All perks unlocked'] },
];

export const FEATURES = [
  { key: 'watch_earn', title: 'Watch & Earn', xpReward: 15, status: 'available', cooldownHours: 4 },
  { key: 'daily_tasks', title: 'Daily Tasks', xpReward: 30, status: 'available', cooldownHours: 24 },
  { key: 'refer_earn', title: 'Refer & Earn', xpReward: 50, status: 'available', cooldownHours: null },
  { key: 'streak_xp', title: 'Streak XP', xpReward: null, status: 'coming_soon', cooldownHours: null },
  { key: 'weekly_quest', title: 'Weekly Quest', xpReward: null, status: 'coming_soon', cooldownHours: null },
];

export const FEATURE_ACTIVITY_LABELS = {
  watch_earn: 'Watch & Earn Video | Ad: New Product Reveal',
  daily_tasks: 'Daily Task Completed | Goal: Reach 10k steps',
  refer_earn: 'Referral Bonus | Veloop Invite',
};

const HOUR = 3600 * 1000;

/** Seed history, positioned relative to "now" so it always looks recent. */
export function seedActivity(now) {
  return [
    { id: 'seed-1', type: 'refer_earn', label: 'Referral Bonus | Veloop Invite', xpDelta: 20, timestamp: new Date(now - 1 * HOUR).toISOString() },
    { id: 'seed-2', type: 'daily_tasks', label: 'Daily Mission Completed | Reach 10k steps', xpDelta: 50, timestamp: new Date(now - 2 * HOUR).toISOString() },
    { id: 'seed-3', type: 'game', label: 'Mini-Game Win | XP Catcher', xpDelta: 25, veDelta: 10, timestamp: new Date(now - 3 * HOUR).toISOString() },
    { id: 'seed-4', type: 'watch_earn', label: 'Watch & Earn Video | Ad: New Product Reveal', xpDelta: 100, timestamp: new Date(now - 22 * HOUR).toISOString() },
    { id: 'seed-5', type: 'streak', label: 'Streak Bonus | 2-day streak', xpDelta: 25, timestamp: new Date(now - 46 * HOUR).toISOString() },
  ];
}
