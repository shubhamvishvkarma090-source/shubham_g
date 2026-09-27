/**
 * Presentation metadata for earning features.
 * Live features come from GET /api/earning-features; entries here only add copy.
 * CONCEPT_FEATURES are proposals that are NOT supported yet — always shown as "Coming Soon".
 */
export const FEATURE_COPY = {
  watch_earn: { description: 'Watch a short eligible video and earn XP.', tone: 'purple' },
  daily_tasks: { description: "Complete today's tasks for a daily XP boost.", tone: 'green' },
  refer_earn: { description: 'Invite friends to VELOOP and earn XP together.', tone: 'gold' },
  play_earn: { description: 'Play XP Catcher and earn XP & VEs by skill.', tone: 'blue' },
  streak_xp: { description: 'Keep your daily streak alive for bonus XP.', tone: 'orange' },
  weekly_quest: { description: 'Complete weekly quests for big XP rewards.', tone: 'purple' },
  daily_mission: { description: 'One focused mission each day.', tone: 'green' },
  quick_quiz: { description: 'Answer a few quick questions about VELOOP.', tone: 'blue' },
  bonus_missions: { description: 'Limited-time special missions.', tone: 'gold' },
};

/** UI-only action card that opens the in-page mini-game. Rewards shown are demo tiers. */
export const PLAY_FEATURE = {
  key: 'play_earn',
  title: 'XP Catcher',
  xpReward: 30,
  xpPrefix: 'Up to',
  status: 'available',
  action: 'play',
};

export const CONCEPT_FEATURES = [
  { key: 'daily_mission', title: 'Daily Mission', xpReward: null, status: 'coming_soon' },
  { key: 'quick_quiz', title: 'Quick Quiz', xpReward: null, status: 'coming_soon' },
];

/** Live features first (in API order), then the game, then concepts not already provided by the API. */
export function buildEarnList(features = []) {
  const keys = new Set(features.map((f) => f.key));
  const available = features.filter((f) => f.status !== 'coming_soon');
  const comingSoon = features.filter((f) => f.status === 'coming_soon');
  return [...available, PLAY_FEATURE, ...comingSoon, ...CONCEPT_FEATURES.filter((c) => !keys.has(c.key))];
}
