import { Coins, Gamepad2, History, House, Route } from 'lucide-react';
import styles from './SectionNav.module.css';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Home', icon: House },
  { id: 'roadmap', label: 'Roadmap', icon: Route },
  { id: 'play', label: 'Play', icon: Gamepad2 },
  { id: 'earn', label: 'Earn', icon: Coins },
  { id: 'activity', label: 'Activity', icon: History },
];

/** Sticky top navigation (desktop) and fixed bottom navigation (mobile/tablet). */
export default function SectionNav({ active, variant = 'top' }) {
  return (
    <nav className={variant === 'top' ? styles.top : styles.bottom} aria-label="Dashboard sections">
      <ul>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? 'true' : undefined} className={active === id ? styles.active : ''}>
              <Icon size={variant === 'top' ? 16 : 20} aria-hidden="true" />
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
