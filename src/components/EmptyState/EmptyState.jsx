import { ArrowRight } from 'lucide-react';
import styles from './EmptyState.module.css';

export default function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <div className={styles.wrap}>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <p className={styles.title}>{title}</p>
      {message && <p className={styles.message}>{message}</p>}
      {actionLabel && (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel} <ArrowRight size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
