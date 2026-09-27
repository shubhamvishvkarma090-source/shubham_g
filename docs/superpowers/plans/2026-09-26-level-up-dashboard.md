# VELOOP Level-Up Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the responsive, premium `/Lvl-Dashboard` Level-Up hub (hero, reward, roadmap, XP Catcher game, earn cards, activity, level-up modal) on React + Vite, backed by the existing VELOOP API with a mock fallback.

**Architecture:** A service layer (`src/api`) exposes six async functions that hit the live backend or an in-memory mock server (`VITE_USE_MOCK`). TanStack Query hooks wrap them; presentational components consume hooks via the page. The game is a pure engine (`src/game`) driven by a `requestAnimationFrame` loop in a React component, with reward rules isolated from gameplay.

**Tech Stack:** React 18, Vite, React Router 6, TanStack Query 5, Bootstrap 5 (grid/utilities), CSS Modules, lucide-react, react-icons, Vitest + Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-09-26-level-up-dashboard-design.md`

## Global Constraints

- Body background exactly `#161827`.
- All component styles in `*.module.css`; Bootstrap only for grid/utility classes.
- Route `/Lvl-Dashboard` (and `/Lvl-Dashboard/activity`); `/` redirects to `/Lvl-Dashboard`; `vercel.json` SPA rewrite.
- Every demo/dummy value is labelled "Demo" in UI where it represents a reward amount not from the backend.
- Never render raw server errors; use friendly copy from the spec.
- No gambling vocabulary or mechanics (jackpot, spin-to-win, bet, casino).
- All animations disabled/reduced under `prefers-reduced-motion`.
- Responsive from 320px to 1920px+, no horizontal page scroll.

## Review Focus

- User at **max level** (no `nextLevel`) → hero shows "Max level reached", reward card shows completion state, no division by zero. Test in Task 2 (`computeProfile`) and Task 7 (XPProgress).
- **localStorage unavailable / corrupt** → attempts default to 5, no crash. Test in Task 4 (`useGameAttempts`).
- **Tab hidden mid-game** (large rAF delta) → engine clamps dt to 100 ms so items don't teleport past the basket. Test in Task 3 (`step` clamps dt).
- **Score never negative** despite dud items. Test in Task 3.
- **Claiming a feature on cooldown** → friendly "already claimed" error, card shows countdown. Test in Task 2 (mock `claimFeature`).

---

### Task 1: Scaffold project, tooling, tokens

**Files:** `package.json`, `vite.config.js`, `index.html`, `vercel.json`, `.env.example`, `src/main.jsx`, `src/App.jsx`, `src/styles/tokens.css`, `src/styles/global.css`, `src/test/setup.js`

- [ ] Create package.json with scripts `dev`, `build`, `preview`, `test` (`vitest run`); install deps listed in Tech Stack.
- [ ] `vite.config.js` with react plugin and `test: { environment: 'jsdom', setupFiles: './src/test/setup.js', globals: true }`.
- [ ] `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
- [ ] `.env.example`: `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=https://veloop-5zm4.onrender.com`.
- [ ] tokens.css per spec §7; global.css sets body bg `#161827`, fonts Sora/Inter, focus-visible ring, reduced-motion reset.
- [ ] App: QueryClientProvider (retry 1, refetchOnWindowFocus false) + BrowserRouter routes.
- [ ] Run `npm run build` → success. Commit.

### Task 2: Data layer (client, mock server, services)

**Files:** `src/api/config.js`, `src/api/client.js`, `src/api/mockServer.js`, `src/api/services.js`, `src/api/preview.js`, `src/data/mockData.js`, `src/data/gameConfig.js` (reward tiers used by mock), tests `src/api/__tests__/*.test.js`

**Interfaces (Produces):**
- `class ApiError extends Error { status: number }`
- `request(path, {method, body}) → Promise<json>`; network failure → `ApiError(0, 'Unable to reach the server. Check your connection and try again.')`; non-2xx → `ApiError(status, 'Something went wrong loading this. Please try again.')`
- `computeProfile(xp, levelsTable) → {currentLevel, currentLevelName, currentXP, nextLevel|null, nextLevelName|null, requiredXP|null, xpToNext, progressPct, nextLevelReward|null}`; `progressPct = min(100, floor(currentXP/requiredXP*100))`, 100 at max level.
- `createMockServer(now = () => Date.now())` → `{getProfile, getLevels, getActivity(limit), getEarningFeatures, claimFeature(key), submitGame(score)}`
- services: `fetchProfile, fetchLevels, fetchActivity(limit=20), fetchEarningFeatures, claimEarningFeature(key), submitGameSession(score)` — `submitGameSession` resolves `{score, reward:{xp, ve}, profile, playsRemainingToday|null, levelUp:{toLevel, name, reward}|null}`; `claimEarningFeature` resolves `{levelUp|null}`.
- `getPreviewState() → 'loading'|'error'|'empty'|null` from `?state=`.

- [ ] Tests: computeProfile at 6420 XP → level 4, 1580 to next, 80%; at 40000 → max level, nextLevel null, pct 100; mock claim twice on `daily_tasks` → second rejects ApiError 409 with friendly message; claim adds activity + XP; submitGame(85) → reward {xp:30, ve:10}; submitGame crossing threshold → levelUp {toLevel:5}; client maps fetch rejection to status 0.
- [ ] Implement; run `npm test` → pass. Commit.

### Task 3: Game engine + reward rules (pure)

**Files:** `src/game/engine.js`, `src/game/rewardRules.js`, tests `src/game/__tests__/*.test.js`

**Interfaces:**
- `ITEM_TYPES = {xp:{points:5}, ve:{points:3}, gem:{points:10}, dud:{points:-5}}`
- `GAME = {durationMs:20000, basketWidth:20, basketY:88, itemSize:8, spawnEveryMs:520, baseSpeed:30, speedStepMs:5000, speedFactor:1.2, comboForMultiplier:5, multiplier:2, maxDtMs:100}` (field is 100×100 logical units)
- `createGame() → state {elapsedMs, items:[{id,type,x,y}], basketX, score, combo, multiplier, caught, missed, spawnAccMs, nextId, events:[], done}`
- `step(state, dtMs, rng = Math.random) → state` (clamps dt, spawns, moves, collides, finishes)
- `moveBasket(state, x) → state` (clamped to field)
- `applyCatch(state, type) → state`
- `speedAt(elapsedMs) → number`, `timeLeftMs(state) → number`
- `getReward(score) → {xp, ve, tier}`; tiers 80+ → 30/10, 40+ → 20/0, else 10/0; NaN/negative → tier 0.

- [ ] Tests: catch xp adds 5; 5 consecutive → multiplier 2 then xp adds 10; dud resets combo/multiplier and score floors at 0; missed good item resets combo; step with dt 5000 advances only 100 ms; game done at 20 s; speed increases after 5 s; reward boundaries 39/40/79/80.
- [ ] Implement; tests pass. Commit.

### Task 4: Hooks

**Files:** `src/hooks/useDashboardData.js` (useProfile, useLevels, useActivity, useEarningFeatures, useClaimFeature, useSubmitGame), `src/hooks/useGameAttempts.js`, `src/hooks/useCountdown.js`, `src/hooks/useCountUp.js`, `src/hooks/useReducedMotion.js`, tests.

- `useGameAttempts() → {remaining, consume(), sync(n), resetIn}` key `veloop_game_attempts`, `{date, playsRemainingToday}`, max 5.
- Mutations invalidate `profile`, `levels`, `activity`, `earning-features`.
- [ ] Tests: attempts default 5, consume decrements & persists, stale date resets, corrupt JSON → 5. Commit.

### Task 5: Shared UI primitives & illustrations

**Files:** `src/components/{Modal,InfoTip,Skeleton,ErrorState,EmptyState,Icons}/…`

- Modal: portal, `role="dialog" aria-modal`, focus trap, Esc, restores focus, body scroll lock.
- InfoTip: button `aria-label="More info"`, toggles bubble, closes on Esc/outside.
- Icons: SVG components `LevelHex`, `XpOrb`, `VeCoin`, `Gem`, `Chest`, `Basket`, `Trophy`, `Dud`.
- [ ] Test: ErrorState calls onRetry; InfoTip opens and closes on Esc. Commit.

### Task 6: Dashboard page shell + TopBar + nav

**Files:** `src/pages/LevelDashboard/*`, `src/components/{TopBar,BottomNav,SectionNav}/*`

- Grid per spec §8; sections with ids `overview`, `roadmap`, `play`, `earn`, `activity`; BottomNav (<1280) and SectionNav (≥1280) highlight via IntersectionObserver.

### Task 7: Hero, XP progress, next reward, Today's Boost

**Files:** `src/components/{LevelHero,XPProgress,NextLevelReward,TodaysBoost}/*`, `src/utils/format.js`, `src/utils/activityStats.js`

- XPProgress: `role="progressbar"`, animated fill, "X XP to Level NN", max-level variant.
- `activityStats(activity, now) → {xpToday, actionsToday, streakDays}`.
- [ ] Tests: XPProgress renders "1,580 XP to Level 05"; max-level renders "Max level reached"; activityStats streak. Commit.

### Task 8: Level roadmap + level detail

**Files:** `src/components/{LevelRoadmap,LevelDetail}/*`

- States completed/current/next/locked with icon+text; click → LevelDetail modal; horizontal scroll-snap; auto-scroll current into view.
- [ ] Test: renders "You are here" on current, "Next goal" on next, "Locked" on others. Commit.

### Task 9: Play & Earn — XP Catcher UI

**Files:** `src/components/PlayAndEarn/{PlayAndEarn,GameContainer,GameStart,GameCountdown,GamePlay,GameResult}.jsx`, `Game.module.css`

- State machine per spec §4; GamePlay uses rAF + engine, pointer & keyboard controls, `aria-live` score; submit via useSubmitGame; 403 → out-of-attempts screen; result → onLevelUp(levelUp) after close.

### Task 10: Earn More XP, Recommendation, Activity, Level-up modal, Activity page

**Files:** `src/components/{EarnMoreXP,XPActivity,LevelUpModal}/*`, `src/pages/ActivityPage/*`

- EarnCard states: available (Claim), claimed (countdown), coming_soon (pill, disabled). Recommendation text from xpToNext.
- LevelUpModal: badge transition, reward tiles, perks, Claim Rewards; `?demo=levelup` preview.
- [ ] Test: EarnCard coming_soon disabled; available calls onClaim. Commit.

### Task 11: Verification, README, build

- [ ] `npm test`, `npm run build` pass; run dev server; check `/Lvl-Dashboard` 200 and preview params.
- [ ] README with all 18 sections (screenshots/live/author placeholders for the user to fill after deploy). Commit.
