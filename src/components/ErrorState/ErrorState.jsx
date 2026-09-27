import { AlertTriangle, RotateCw } from 'lucide-react';
import styles from './ErrorState.module.css';

export default function ErrorState({
  title = 'Unable to Load',
  message = "We couldn't load this right now.",
  onRetry,
  compact = false,
}) {
  return (
    <div role="alert" className={`${styles.wrap} ${compact ? styles.compact : ''}`}>
      <span className={styles.icon} aria-hidden="true">
        <AlertTriangle size={compact ? 18 : 22} />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
      </div>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          <RotateCw size={14} aria-hidden="true" /> Try Again
        </button>
      )}
    </div>
  );
}
