import { useMemo, useState } from 'react';
import { Check, Clock, Copy, Gift, Loader2, Lock, Mail, Share2, UserPlus, X } from 'lucide-react';
import { FaTelegram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import Modal from '../Modal/Modal.jsx';
import { useCountdown } from '../../hooks/useCountdown.js';
import { formatDuration } from '../../utils/format.js';
import { SHARE_TEXT, getReferral, recordShare, referralLink, shareUrls } from '../../utils/referral.js';
import styles from './ReferModal.module.css';

const MILESTONES = [
  { friends: 1, reward: '+50 XP' },
  { friends: 3, reward: '+100 VEs' },
  { friends: 5, reward: '+10 Gems' },
];

export default function ReferModal({ open, feature, onClose, onClaim, isClaiming = false, error = null }) {
  const [referral, setReferral] = useState(getReferral);
  const [copied, setCopied] = useState(false);
  const link = useMemo(() => referralLink(referral.code), [referral.code]);
  const urls = useMemo(() => shareUrls(link), [link]);
  const until = feature?.nextAvailableAt ? new Date(feature.nextAvailableAt).getTime() : null;
  const cooldownLeft = useCountdown(feature?.status === 'claimed' ? until : null);

  const markShared = () => setReferral(recordShare());

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      document.getElementById('referral-link')?.select();
      document.execCommand?.('copy');
    }
    setCopied(true);
    markShared();
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: 'VELOOP Rewards', text: SHARE_TEXT, url: link });
      markShared();
    } catch {
      /* user cancelled */
    }
  };

  const shared = referral.shares > 0;
  const xp = feature?.xpReward ?? 50;
  let claimButton;
  if (cooldownLeft > 0) {
    claimButton = (
      <button type="button" className={styles.claim} disabled>
        <Clock size={16} aria-hidden="true" /> Bonus available in <span className="tabular">{formatDuration(cooldownLeft)}</span>
      </button>
    );
  } else if (!shared) {
    claimButton = (
      <button type="button" className={styles.claim} disabled>
        <Lock size={16} aria-hidden="true" /> Share your link to unlock +{xp} XP
      </button>
    );
  } else {
    claimButton = (
      <button type="button" className={styles.claim} onClick={() => onClaim('refer_earn')} disabled={isClaiming} aria-busy={isClaiming}>
        {isClaiming ? <Loader2 size={16} className={styles.spin} aria-hidden="true" /> : <Gift size={16} aria-hidden="true" />}
        Claim +{xp} XP referral bonus
      </button>
    );
  }

  const channels = [
    { key: 'whatsapp', label: 'WhatsApp', Icon: FaWhatsapp, href: urls.whatsapp },
    { key: 'telegram', label: 'Telegram', Icon: FaTelegram, href: urls.telegram },
    { key: 'x', label: 'X', Icon: FaXTwitter, href: urls.x },
    { key: 'email', label: 'Email', Icon: Mail, href: urls.email },
  ];

  return (
    <Modal open={open} onClose={onClose} labelledBy="refer-title" className={styles.panel}>
      <div className={styles.body}>
        <button type="button" className={styles.close} aria-label="Close invite friends" onClick={onClose}>
          <X size={18} aria-hidden="true" />
        </button>

        <span className={styles.heroIcon} aria-hidden="true">
          <UserPlus size={30} />
        </span>
        <h2 id="refer-title" className={styles.title}>
          Invite Friends
        </h2>
        <p className={styles.sub}>
          Share VELOOP with friends and earn <strong>+{xp} XP</strong> toward your next level.
        </p>

        <div className={styles.codeBox}>
          <span className={styles.codeLabel}>
            Your referral code <span className={styles.demo}>Demo code</span>
          </span>
          <span className={styles.code}>{referral.code}</span>
        </div>

        <label htmlFor="referral-link" className={styles.linkLabel}>
          Your referral link
        </label>
        <div className={styles.linkRow}>
          <input id="referral-link" className={styles.linkInput} value={link} readOnly onFocus={(e) => e.target.select()} />
          <button type="button" className={`${styles.copy} ${copied ? styles.copied : ''}`} onClick={copy} data-autofocus>
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>

        <div className={styles.channels} aria-label="Share via">
          {channels.map(({ key, label, Icon, href }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.channel} ${styles[key]}`}
              onClick={markShared}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button type="button" className={styles.channel} onClick={nativeShare}>
              <Share2 size={20} aria-hidden="true" />
              <span>More</span>
            </button>
          )}
        </div>
        <p className={styles.shareCount} aria-live="polite">
          {shared ? `Shared ${referral.shares} ${referral.shares === 1 ? 'time' : 'times'} — nice!` : 'Share once to unlock your bonus.'}
        </p>

        <ol className={styles.steps}>
          <li>
            <span>1</span> Share your link
          </li>
          <li>
            <span>2</span> Friend joins VELOOP
          </li>
          <li>
            <span>3</span> You earn +{xp} XP
          </li>
        </ol>

        {claimButton}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.milestones}>
          <p className={styles.milestoneTitle}>
            Referral milestones <span className={styles.soon}>Coming Soon</span>
          </p>
          <ul>
            {MILESTONES.map((m) => (
              <li key={m.friends}>
                <Lock size={12} aria-hidden="true" /> {m.friends} {m.friends === 1 ? 'friend' : 'friends'} · {m.reward}
              </li>
            ))}
          </ul>
          <p className={styles.note}>Friend-join tracking will appear here once the referral API is available.</p>
        </div>
      </div>
    </Modal>
  );
}
