import { useCallback, useEffect, useMemo, useState } from 'react';
import TopBar from '../../components/TopBar/TopBar.jsx';
import SectionNav, { NAV_ITEMS } from '../../components/SectionNav/SectionNav.jsx';
import LevelHero from '../../components/LevelHero/LevelHero.jsx';
import NextLevelReward from '../../components/NextLevelReward/NextLevelReward.jsx';
import TodaysBoost from '../../components/TodaysBoost/TodaysBoost.jsx';
import LevelRoadmap from '../../components/LevelRoadmap/LevelRoadmap.jsx';
import PlayAndEarn from '../../components/PlayAndEarn/PlayAndEarn.jsx';
import EarnMoreXP from '../../components/EarnMoreXP/EarnMoreXP.jsx';
import XPActivity from '../../components/XPActivity/XPActivity.jsx';
import LevelUpModal from '../../components/LevelUpModal/LevelUpModal.jsx';
import { useActivity, useEarningFeatures, useLevels, useProfile } from '../../hooks/useDashboardData.js';
import { useActiveSection } from '../../hooks/useActiveSection.js';
import { isLevelUpDemo } from '../../api/preview.js';
import { isMockMode } from '../../api/services.js';
import styles from './LevelDashboard.module.css';

const SECTION_IDS = NAV_ITEMS.map((n) => n.id);

export default function LevelDashboard() {
  const profileQ = useProfile();
  const levelsQ = useLevels();
  const activityQ = useActivity(20);
  const featuresQ = useEarningFeatures();

  const [gameOpen, setGameOpen] = useState(false);
  const [levelUp, setLevelUp] = useState(null);
  const active = useActiveSection(SECTION_IDS);

  const profile = profileQ.data;
  const levels = useMemo(() => levelsQ.data ?? [], [levelsQ.data]);
  const nextLevel = levels.find((l) => l.level === profile?.nextLevel);

  useEffect(() => {
    document.title = profile ? `Level ${profile.currentLevel} · VELOOP Rewards` : 'VELOOP Rewards – Level Up';
  }, [profile]);

  // ?demo=levelup previews the celebration (screenshots / QA)
  useEffect(() => {
    if (isLevelUpDemo() && profile?.nextLevel) {
      setLevelUp({ toLevel: profile.nextLevel, name: nextLevel?.name, reward: profile.nextLevelReward });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.nextLevel]);

  const scrollTo = useCallback((id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), []);
  const openGame = useCallback(() => setGameOpen(true), []);
  const levelUpPerks = levels.find((l) => l.level === levelUp?.toLevel)?.perks;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <TopBar levelName={profile?.currentLevelName} />
        <SectionNav active={active} variant="top" />

        <main className={styles.grid}>
          <section id="overview" className={styles.hero} aria-label="Your level">
            <LevelHero
              profile={profile}
              nextLevelName={nextLevel?.name}
              isLoading={profileQ.isLoading}
              isError={profileQ.isError}
              onRetry={profileQ.refetch}
              onWaysToEarn={() => scrollTo('earn')}
            />
          </section>

          <div className={styles.reward}>
            <NextLevelReward
              profile={profile}
              nextLevel={nextLevel}
              isLoading={profileQ.isLoading}
              isError={profileQ.isError}
              onRetry={profileQ.refetch}
              onWaysToEarn={() => scrollTo('earn')}
            />
          </div>

          <div className={styles.boost}>
            <TodaysBoost activity={activityQ.data} isLoading={activityQ.isLoading} />
          </div>

          <div id="roadmap" className={styles.roadmap}>
            <LevelRoadmap
              levels={levels}
              currentLevel={profile?.currentLevel ?? levels.find((l) => l.status === 'current')?.level}
              profile={profile}
              isLoading={levelsQ.isLoading}
              isError={levelsQ.isError}
              onRetry={levelsQ.refetch}
            />
          </div>

          <div id="play" className={styles.play}>
            <PlayAndEarn open={gameOpen} onOpen={openGame} onClose={() => setGameOpen(false)} onLevelUp={setLevelUp} />
          </div>

          <div id="earn" className={styles.earn}>
            <EarnMoreXP
              features={featuresQ.data}
              profile={profile}
              isLoading={featuresQ.isLoading}
              isError={featuresQ.isError}
              onRetry={featuresQ.refetch}
              onPlay={openGame}
              onLevelUp={setLevelUp}
            />
          </div>

          <div id="activity" className={styles.activity}>
            <XPActivity
              activity={activityQ.data}
              isLoading={activityQ.isLoading}
              isError={activityQ.isError}
              onRetry={activityQ.refetch}
              onStartEarning={() => scrollTo('earn')}
            />
          </div>
        </main>

        <footer className={styles.footer}>
          <p>
            Play → Earn XP → Progress → Unlock Reward → Level Up → Discover → Return.
          </p>
          <p className={styles.disclaimer}>
            {isMockMode
              ? 'Demo mode: all levels, XP and reward values shown are development data.'
              : 'Game reward tiers and concept features marked "Coming Soon" are previews and may change.'}
          </p>
        </footer>
      </div>

      <SectionNav active={active} variant="bottom" />

      <LevelUpModal levelUp={levelUp} perks={levelUpPerks} onClose={() => setLevelUp(null)} />
    </div>
  );
}
