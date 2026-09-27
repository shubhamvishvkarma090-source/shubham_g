export const formatNumber = (n) => (Number.isFinite(n) ? n.toLocaleString('en-US') : '0');

export const padLevel = (n) => String(n ?? 0).padStart(2, '0');

export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((v) => String(v).padStart(2, '0'))
    .join(':');
}

export function formatReward(reward) {
  if (!reward) return 'Badge unlock';
  return `${formatNumber(reward.amount)} ${reward.type}`;
}

export function msUntilMidnight(date = new Date()) {
  const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return midnight - date;
}

export function timeAgo(iso, now = Date.now()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d}d ago`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}
