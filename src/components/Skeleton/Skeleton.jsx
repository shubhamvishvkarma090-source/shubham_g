import styles from './Skeleton.module.css';

export default function Skeleton({ width = '100%', height = 16, radius = 10, className = '', style }) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

/** Wraps skeletons with an accessible loading label. */
export function SkeletonGroup({ label, children, className = '' }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="visually-hidden-live">{label}</span>
      {children}
    </div>
  );
}
