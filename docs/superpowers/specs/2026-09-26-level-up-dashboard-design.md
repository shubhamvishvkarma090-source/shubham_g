# VELOOP Level-Up Dashboard — Design Spec

Date: 2026-09-26 · Source brief: "VELOOP Rewards – Task 16: Complete Level-Up Dashboard Redesign" (PDF) · Deadline: 05 Oct 2026, 5:30 PM IST

## 1. Intent

Rebuild `/Lvl-Dashboard` as a premium, fintech-style **Level-Up + Rewards + Games + Earning hub** that follows the attached mobile mockup (6 screens) and makes it fully responsive (320px → 1920px+). The page must answer, at a glance: where am I, how far have I come, what do I need next, what will I unlock, what can I do now, why should I return.

Loop: Play → Earn XP → Progress → Unlock Reward → Level Up → Discover → Return.

### Decisions made with the user
- **Single page** `/Lvl-Dashboard` with all sections; the game plays in-page; result and level-up are modals. `/Lvl-Dashboard/activity` (full history) is preserved from the existing app.
- **Data: live API + mock fallback.** Same shapes as the existing backend; `VITE_USE_MOCK=true` switches to local demo data. Live calls that fail with a network error do NOT silently fall back (error state is shown), so the error state stays honest.
- **Game: XP Catcher** (from mockup), rules in §4.
- Level numbers come from data (backend currently: Level 4 "Momentum" → Level 5 "Ascendant", reward 500 VEs). The mockup's "05" was illustrative.

## 2. Existing backend (preserved)

Base: `https://veloop-5zm4.onrender.com` (configurable via `VITE_API_BASE_URL`).

| Method | Path | Shape |
|---|---|---|
| GET | `/api/profile` | `{currentLevel, currentLevelName, currentXP, nextLevel, requiredXP, xpToNext, progressPct, nextLevelReward:{type,amount}}` |
| GET | `/api/levels` | `{levels:[{level, name, reward:{type,amount}\|null, status:"completed"\|"current"\|"locked"}]}` |
| GET | `/api/activity?limit=N` | `{activity:[{id, type, label, xpDelta, timestamp}]}` |
| GET | `/api/earning-features` | `{features:[{key, title, xpReward, status:"available"\|"claimed"\|"coming_soon", cooldownHours, lastClaimedAt, nextAvailableAt}]}` |
| POST | `/api/earning-features/:key/claim` | claims feature XP |
| POST | `/api/game/session` `{score}` | submits game; 403 = out of attempts |

Raw server errors are never shown; the API client maps failures to friendly messages.

## 3. Architecture

**Stack:** React 18 + Vite, React Router, Bootstrap 5 (grid/utilities only), CSS Modules for all component styling, TanStack Query, lucide-react + react-icons, Vitest + Testing Library. Deploy on Vercel with an SPA rewrite (`vercel.json`) so `/Lvl-Dashboard` deep links work.

```
src/
  api/          client.js (fetch wrapper, friendly errors), levelService.js, gameService.js, earnService.js — each switches live/mock
  data/         mockData.js (DEMO data: profile, levels, activity, features), gameConfig.js (DEMO reward tiers)
  hooks/        useProfile, useLevels, useActivity, useEarningFeatures, useClaimFeature, useSubmitGame, useLevelUpWatcher, useCountdown, useGameAttempts, useReducedMotion
  game/         engine.js (pure: spawn/step/collide/score), rewardRules.js (pure: score → reward)
  components/
    TopBar/ LevelHero/ XPProgress/ NextLevelReward/ TodaysBoost/ LevelRoadmap/ LevelDetail/
    PlayAndEarn/ (GameContainer, GameStart, GameCountdown, GamePlay, GameResult, Game.module.css)
    EarnMoreXP/ (EarnCard, Recommendation) XPActivity/ (ActivityItem, TodaysSummary)
    LevelUpModal/ InfoTip/ Modal/ Skeleton/ ErrorState/ EmptyState/ BottomNav/ SectionNav/ Icons/ (SVG illustrations)
  pages/        LevelDashboard/, ActivityPage/
  styles/       tokens.css (colors, radii, shadows), global.css
```

Rule: components receive data via props or hooks; no component fetches directly. All UI numbers are derived from the data layer; the UI never computes rewards.

## 4. Game — XP Catcher

States: `start → countdown → playing → submitting → result` (+ `error`, `noAttempts`, `unavailable`).

- Objective: catch falling items in the gold basket in **20 s**.
- Controls: pointer/touch drag, ←/→ or A/D keys.
- Items: XP orb +5, VE coin +3, Gem +10 (rare), Dud block −5.
- Combo: 5 consecutive catches → 2× multiplier until a miss (missed good item) or dud.
- Difficulty: fall speed increases every 5 s.
- Attempts: **5 per day** (localStorage `veloop_game_attempts`, reset at local midnight), "Next attempt in HH:MM:SS"; server 403 also mapped to the out-of-attempts state.
- **DEMO reward tiers** (labelled on-screen): 0–39 → +10 XP; 40–79 → +20 XP; 80+ → +30 XP +10 VEs.
- Separation: `engine.js` + `rewardRules.js` are pure; `gameService.submitScore(score)` returns `{xpAwarded, veAwarded, leveledUp, newLevel}` — live mode from server response (fields normalised), mock mode from `rewardRules` + mock profile update.
- Result screen: trophy, final score, "New Best!" (localStorage), reward tiles, mini progress bar, Play Again (attempts left) / Back to Dashboard.
- Trust: skill-based only; no wheels, jackpots, random prizes, flashing.

## 5. Level-up

`useLevelUpWatcher` compares `currentLevel` before/after any mutation (game or claim). On increase → `LevelUpModal`: badge transition old→new level, reward tiles, perks list (DEMO copy), "Claim Rewards" (closes + refetch). Subtle particles, no confetti storm; disabled under `prefers-reduced-motion`. A dev-only "Preview level-up" trigger is available via `?demo=levelup` for screenshots.

## 6. States

- **Loading:** section-shaped skeletons for hero, XP, reward, roadmap, game card, earn cards, activity.
- **Error (per section):** "Unable to Load Level Progress / Level Roadmap / Earning Features / Activity" + friendly line + **Try Again** (refetch).
- **Empty:** activity → "Your XP journey starts here." + "Start Earning XP →" (scrolls to Earn). Game unavailable → "New challenge coming soon." Earn list empty → "New ways to earn are on the way."
- Dev preview: `?state=loading|error|empty` forces states in mock mode for screenshots.

## 7. Visual design

- Body background `#161827` (required). Tokens: navy surfaces `#1E2135/#252a42`, gold `#E9B949 → #C8912E` (controlled gradient), silver `#C9CED8`, white text, soft blue `#7FA7FF` (progress info), muted purple `#8B7BD8` (XP), subtle green `#4FBF8B` (completed), locked grey `#5B6078`.
- State colours: completed = green, current = gold, next = soft blue outline, locked = grey + lock, reward = gold.
- Typography: "Sora" for display numbers/headings, "Inter" for body (Google Fonts). Tabular numerals for XP.
- Illustrations: custom inline SVGs — hex level badge, XP orb, VE coin, gem, reward chest/vault, gold basket, trophy with laurels.
- Avoid neon, rainbow gradients, casino styling, flashing.

## 8. Responsive

- **<768 (mobile, from 320):** mockup order — TopBar, Hero, Next Reward, Today's Boost, Roadmap (horizontal scroll-snap), Play & Earn, Earn More (list), Activity. Fixed bottom nav (Home/Earn/Play/Activity) anchor-scrolls with active highlight. Game fills viewport-height modal.
- **768–1279 (tablet):** 2-column for Hero+Reward, Boost inline, earn cards 2-up.
- **≥1280 (laptop/desktop):** [Hero | Reward] → Roadmap full width (horizontal path) → [Play & Earn | Activity] → Earn More (3-up). Sticky top section nav replaces bottom nav. Max content width 1200 (1440+) / 1360 (1920+).

## 9. Interactions & animation

XP bar fills on load (~900 ms ease-out) and count-up on XP number; roadmap level hover/focus shows tooltip, click opens LevelDetail sheet; reward card hover/tap tilts + reveals lock shimmer; earn cards lift + CTA glow on hover; [i] InfoTips (click/focus, Esc to close). All animations respect `prefers-reduced-motion`.

## 10. Accessibility

Semantic landmarks and headings; buttons for all actions; visible focus rings; modals with focus trap, Esc, `aria-modal`, return focus; progress bar `role="progressbar"` with values; game keyboard-playable with `aria-live` score announcements; colour never the sole state indicator (icons + text); contrast ≥ 4.5:1 for text.

## 11. Testing

Vitest unit tests: `engine.js` (collision, scoring, combo, speed), `rewardRules.js` (tiers, boundaries), `api/client` (error mapping), mock services (claim, submit, level-up), `useGameAttempts` (daily reset). Component tests: XPProgress numbers, LevelRoadmap states, EarnCard (available/cooldown/coming soon), ErrorState retry. Manual: responsive at 320/768/1280/1440/1920, no console errors, `npm run build` passes, live route `/Lvl-Dashboard` after deploy.

## 12. Deliverables

GitHub repo (no node_modules/.env), Vercel deployment, README.md with all 18 required sections (screenshots/live URL/author filled by the user), screenshots listed in brief §56.4 (captured with the dev preview params).

## 13. Out of scope

Authentication, real ad playback/referral flows (cards call the existing claim endpoint only), backend changes, multiple games.
