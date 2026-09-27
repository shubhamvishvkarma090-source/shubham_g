/**
 * Hand-built SVG illustrations for the VELOOP Level-Up hub.
 * Every gradient id is namespaced with useId so multiple instances never clash.
 */
import { useId } from 'react';

const uid = (id) => id.replace(/:/g, '');

const HEX = 'M50 4 91 27.5v47L50 98 9 74.5v-47z';

const HEX_PALETTE = {
  current: ['#fff1c2', '#f2cf6f', '#b9832a'],
  completed: ['#c8f1dc', '#4fbf8b', '#2d7d5a'],
  next: ['#dbe6ff', '#7fa7ff', '#4a67b8'],
  locked: ['#9aa0b8', '#5b6078', '#3a3e55'],
};

export function LevelHex({ level, size = 120, state = 'current', showLabel = true, className = '' }) {
  const id = uid(useId());
  const [light, mid, dark] = HEX_PALETTE[state] ?? HEX_PALETTE.current;
  const num = String(level ?? '').padStart(2, '0');
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 102" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="0.5" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`${id}f`} cx="0.5" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#2b3050" />
          <stop offset="1" stopColor="#141627" />
        </radialGradient>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={light} />
        </linearGradient>
      </defs>
      <path d={HEX} fill={`url(#${id}f)`} stroke={`url(#${id}r)`} strokeWidth="6" strokeLinejoin="round" />
      <path d="M50 14 82 32.5v37L50 88 18 69.5v-37z" fill="none" stroke={mid} strokeOpacity="0.35" strokeWidth="1.5" />
      {showLabel && (
        <text x="50" y="39" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="10" letterSpacing="1.5" fill={mid}>
          LEVEL
        </text>
      )}
      <text
        x="50"
        y={showLabel ? 70 : 62}
        textAnchor="middle"
        fontFamily="Sora, sans-serif"
        fontWeight="800"
        fontSize={showLabel ? 32 : 30}
        fill={`url(#${id}t)`}
      >
        {num}
      </text>
    </svg>
  );
}

export function XpOrb({ size = 40, className = '' }) {
  const id = uid(useId());
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}o`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#d9d0ff" />
          <stop offset="0.45" stopColor="#8b7bd8" />
          <stop offset="1" stopColor="#3b2d8c" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill={`url(#${id}o)`} stroke="#e8e2ff" strokeOpacity="0.7" strokeWidth="1.5" />
      <ellipse cx="14" cy="12" rx="6" ry="3.5" fill="#fff" opacity="0.35" />
      <text x="20" y="25" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="800" fontSize="13" fill="#fff">
        XP
      </text>
    </svg>
  );
}

export function VeCoin({ size = 40, className = '' }) {
  const id = uid(useId());
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c2" />
          <stop offset="0.5" stopColor="#e2ab3f" />
          <stop offset="1" stopColor="#9c6a1c" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill={`url(#${id}c)`} />
      <circle cx="20" cy="20" r="13.5" fill="none" stroke="#fff3cf" strokeOpacity="0.6" strokeWidth="1.5" />
      <path d="M13.5 13.5h3.6l2.9 9 2.9-9h3.6L21.9 27h-3.8z" fill="#7a4f10" />
    </svg>
  );
}

export function Gem({ size = 40, tone = 'purple', className = '' }) {
  const id = uid(useId());
  const tones = {
    purple: ['#e4dcff', '#8b7bd8', '#4b3aa6'],
    green: ['#d7ffe9', '#4fbf8b', '#23734f'],
  };
  const [a, b, c] = tones[tone] ?? tones.purple;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.5" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      <path d="M11 6h18l8 10-17 19L3 16z" fill={`url(#${id}g)`} />
      <path d="M3 16h34M11 6l4 10 5 19M29 6l-4 10-5 19M15 16l5-10 5 10" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.1" />
    </svg>
  );
}

export function DudBlock({ size = 40, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M8 10 22 4l12 8-2 18-14 6L5 26z" fill="#4a4f68" stroke="#6b7090" strokeWidth="1.5" />
      <path d="M17 12l4 7-3 5 5 6" fill="none" stroke="#2a2d40" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Chest({ size = 140, locked = true, className = '' }) {
  const id = uid(useId());
  return (
    <svg className={className} width={size} height={size * 0.86} viewBox="0 0 140 120" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b4a2b" />
          <stop offset="1" stopColor="#3b2715" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c2" />
          <stop offset="0.5" stopColor="#e2ab3f" />
          <stop offset="1" stopColor="#9c6a1c" />
        </linearGradient>
        <radialGradient id={`${id}l`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f2cf6f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f2cf6f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="70" cy="62" rx="68" ry="56" fill={`url(#${id}l)`} />
      <ellipse cx="70" cy="112" rx="50" ry="6" fill="#000" opacity="0.35" />
      {/* body */}
      <rect x="22" y="56" width="96" height="52" rx="6" fill={`url(#${id}w)`} stroke={`url(#${id}g)`} strokeWidth="4" />
      {/* lid */}
      <path d="M22 58V42c0-16 14-26 48-26s48 10 48 26v16z" fill={`url(#${id}w)`} stroke={`url(#${id}g)`} strokeWidth="4" />
      <path d="M40 20v38M100 20v38M40 56v52M100 56v52" stroke={`url(#${id}g)`} strokeWidth="6" />
      <rect x="22" y="54" width="96" height="8" fill={`url(#${id}g)`} />
      {/* lock plate */}
      <rect x="58" y="50" width="24" height="28" rx="5" fill={`url(#${id}g)`} />
      {locked ? (
        <>
          <path d="M64 60v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#5a3b0e" strokeWidth="2.5" />
          <rect x="62" y="60" width="16" height="12" rx="2.5" fill="#5a3b0e" />
          <circle cx="70" cy="66" r="2" fill="#f2cf6f" />
        </>
      ) : (
        <circle cx="70" cy="64" r="4" fill="#5a3b0e" />
      )}
    </svg>
  );
}

export function Basket({ className = '' }) {
  const id = uid(useId());
  return (
    <svg className={className} viewBox="0 0 120 64" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c2" />
          <stop offset="0.5" stopColor="#e2ab3f" />
          <stop offset="1" stopColor="#9c6a1c" />
        </linearGradient>
      </defs>
      <path d="M14 14 28 58h64l14-44" fill="rgba(242,207,111,0.06)" stroke="#e2ab3f" strokeOpacity="0.55" strokeWidth="1.2" />
      <path d="M22 14l12 44M38 14l6 44M60 14v44M82 14l-6 44M98 14 86 58M18 28h84M22 43h76" stroke="#f2cf6f" strokeOpacity="0.4" strokeWidth="1" />
      <ellipse cx="60" cy="14" rx="54" ry="9" fill="none" stroke={`url(#${id}g)`} strokeWidth="6" />
    </svg>
  );
}

export function Trophy({ size = 180, className = '' }) {
  const id = uid(useId());
  const leaf = (i, side) => {
    const angle = side * (18 + i * 17);
    return (
      <ellipse
        key={`${side}-${i}`}
        cx="0"
        cy="-58"
        rx="6"
        ry="13"
        fill={`url(#${id}g)`}
        transform={`rotate(${angle}) translate(0 0) rotate(${side * 35} 0 -58)`}
      />
    );
  };
  return (
    <svg className={className} width={size} height={size} viewBox="-90 -100 180 190" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c2" />
          <stop offset="0.5" stopColor="#e2ab3f" />
          <stop offset="1" stopColor="#9c6a1c" />
        </linearGradient>
        <radialGradient id={`${id}l`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f2cf6f" stopOpacity="0.45" />
          <stop offset="1" stopColor="#f2cf6f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="-10" r="88" fill={`url(#${id}l)`} />
      <g transform="translate(0 -6)">
        {[0, 1, 2, 3, 4].map((i) => leaf(i, 1))}
        {[0, 1, 2, 3, 4].map((i) => leaf(i, -1))}
      </g>
      <path d="M0-62 38-40v44L0 26-38 4v-44z" fill="#1a1d31" stroke={`url(#${id}g)`} strokeWidth="6" strokeLinejoin="round" />
      <path d="M0-36 7.6-20.5 24.7-18 12.4-6 15.3 11 0 3-15.3 11-12.4-6-24.7-18-7.6-20.5z" fill={`url(#${id}g)`} />
      <path d="M-44 52h88l-8 16h-72z" fill={`url(#${id}g)`} />
      <rect x="-54" y="68" width="108" height="10" rx="3" fill="#9c6a1c" />
      <path d="M-10 26h20l4 26h-28z" fill={`url(#${id}g)`} />
    </svg>
  );
}
