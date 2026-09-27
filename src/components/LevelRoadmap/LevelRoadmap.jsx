import { useEffect, useRef, useState } from 'react';
import { Check, Flag, Lock, MapPin, Route } from 'lucide-react';
import { LevelHex } from '../Icons/Icons.jsx';
import SectionHeader from '../SectionHeader/SectionHeader.jsx';
import Skeleton, { SkeletonGroup } from '../Skeleton/Skeleton.jsx';
import ErrorState from '../ErrorState/ErrorState.jsx';
import LevelDetail from '../LevelDetail/LevelDetail.jsx';
import { formatReward, padLevel } from '../../utils/format.js';
import styles from './LevelRoadmap.module.css';

export function roadmapState(level, currentLevel) {
  if (level.level < currentLevel) return 'completed';
  if (level.level === currentLevel) return 'current';
  if (level.level === currentLevel + 1) return 'next';
  return 'locked';
}

const STATE_META = {
  completed: { label: 'Completed', icon: Check },
  current: { label: 'You are here', icon: MapPin },
  next: { label: 'Next goal', icon: Flag },
  locked: { label: 'Locked', icon: Lock },
};

export default function LevelRoadmap({ levels = [], currentLevel, profile, isLoading, isError, onRetry }) {
  const [selected, setSelected] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const node = track?.querySelector('[data-current="true"]');
    if (!track || !node) return;
    track.scrollLeft = node.offsetLeft - track.clientWidth / 2 + node.clientWidth / 2;
  }, [levels.length, currentLevel]);

  const header = (
    <SectionHeader
      id="roadmap-title"
      icon={<Route size={16} />}
      title="Level Roadmap"
      subtitle="Every level unlocks something new. Tap a level for details."
      info="Levels are reached by earning XP. Completed levels stay unlocked; locked levels show the reward waiting for you."
    />
  );

  let body;
  if (isLoading) {
    body = (
      <SkeletonGroup label="Loading level roadmap" className={styles.skeletonRow}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} width={132} height={188} radius={18} />
        ))}
      </SkeletonGroup>
    );
  } else if (isError) {
    body = <ErrorState title="Unable to Load Level Roadmap" message="We couldn't load the level roadmap right now." onRetry={onRetry} />;
  } else {
    body = (
      <div className={styles.scroller} ref={trackRef}>
        <ol className={styles.track}>
          {levels.map((lvl) => {
            const state = roadmapState(lvl, currentLevel);
            const { label, icon: Icon } = STATE_META[state];
            const rewardLabel = formatReward(lvl.reward);
            return (
              <li key={lvl.level} className={`${styles.node} ${styles[state]}`} data-current={state === 'current'}>
                <button
                  type="button"
                  className={styles.nodeBtn}
                  aria-label={`Level ${padLevel(lvl.level)} ${lvl.name}, ${label}, reward ${rewardLabel}`}
                  onClick={() => setSelected(lvl)}
                >
                  <span className={styles.status}>
                    <Icon size={12} aria-hidden="true" /> {label}
                  </span>
                  <LevelHex level={lvl.level} size={state === 'current' ? 76 : 62} state={state} className={styles.hex} />
                  <span className={styles.name}>{lvl.name}</span>
                  <span className={styles.reward}>
                    {state === 'completed' ? <Check size={12} aria-hidden="true" /> : <Lock size={12} aria-hidden="true" />}
                    {rewardLabel}
                  </span>
                  <span className={styles.hover} aria-hidden="true">View details</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="roadmap-title">
      {header}
      {body}
      <LevelDetail
        level={selected}
        state={selected ? roadmapState(selected, currentLevel) : null}
        profile={profile}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
