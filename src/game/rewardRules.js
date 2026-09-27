/**
 * XP Catcher reward rules — DEVELOPMENT / DEMO VALUES ONLY.
 *
 * Kept separate from the game engine so the backend (POST /api/game/session)
 * can own the real rules. In live mode the server response wins; these tiers
 * are only used by the mock server and for the rules shown to the player.
 */
export const REWARD_TIERS = [
  { min: 80, xp: 30, ve: 10, label: 'Gold' },
  { min: 40, xp: 20, ve: 0, label: 'Silver' },
  { min: 0, xp: 10, ve: 0, label: 'Bronze' },
];

export const DAILY_ATTEMPTS = 5;

export function getReward(score) {
  const safe = Number.isFinite(score) ? Math.max(0, score) : 0;
  const tier = REWARD_TIERS.find((t) => safe >= t.min) ?? REWARD_TIERS.at(-1);
  return { xp: tier.xp, ve: tier.ve, tier: tier.label };
}
