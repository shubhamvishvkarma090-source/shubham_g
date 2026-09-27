const dayKey = (t) => new Date(t).toDateString();

/** Derives "Today's Boost" numbers from the XP activity feed. */
export function activityStats(activity = [], now = Date.now()) {
  const today = dayKey(now);
  let xpToday = 0;
  let veToday = 0;
  let actionsToday = 0;
  const days = new Set();
  for (const item of activity) {
    const key = dayKey(item.timestamp);
    days.add(key);
    if (key === today) {
      xpToday += item.xpDelta ?? 0;
      veToday += item.veDelta ?? 0;
      actionsToday += 1;
    }
  }

  const base = new Date(now);
  const dayAt = (offset) => new Date(base.getFullYear(), base.getMonth(), base.getDate() - offset).toDateString();
  let offset = days.has(dayAt(0)) ? 0 : days.has(dayAt(1)) ? 1 : -1;
  let streakDays = 0;
  if (offset >= 0) {
    while (days.has(dayAt(offset))) {
      streakDays += 1;
      offset += 1;
    }
  }
  return { xpToday, veToday, actionsToday, streakDays };
}
