/**
 * Referral helpers (frontend only).
 * The backend doesn't issue referral codes yet, so a DEMO code is generated once
 * per browser and persisted. The XP bonus itself is claimed through the real
 * POST /api/earning-features/refer_earn/claim endpoint.
 */
export const REFERRAL_KEY = 'veloop_referral';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion

export function generateCode(rng = Math.random) {
  let s = '';
  for (let i = 0; i < 4; i += 1) s += ALPHABET[Math.floor(rng() * ALPHABET.length) % ALPHABET.length];
  return `VELOOP-${s}`;
}

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REFERRAL_KEY));
    if (parsed && typeof parsed.code === 'string') return { code: parsed.code, shares: Number(parsed.shares) || 0 };
  } catch {
    /* corrupt or unavailable */
  }
  return null;
}

function write(state) {
  try {
    localStorage.setItem(REFERRAL_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — keep working in memory */
  }
  return state;
}

export function getReferral() {
  return read() ?? write({ code: generateCode(), shares: 0 });
}

export function recordShare() {
  const current = getReferral();
  return write({ ...current, shares: current.shares + 1 });
}

export function referralLink(code, origin = typeof window !== 'undefined' ? window.location.origin : '') {
  return `${origin}/Lvl-Dashboard?ref=${encodeURIComponent(code)}`;
}

export const SHARE_TEXT = 'Join me on VELOOP Rewards — level up, play and earn rewards!';

export function shareUrls(link) {
  const enc = encodeURIComponent;
  const message = `${SHARE_TEXT} ${link}`;
  return {
    whatsapp: `https://wa.me/?text=${enc(message)}`,
    telegram: `https://t.me/share/url?url=${enc(link)}&text=${enc(SHARE_TEXT)}`,
    x: `https://twitter.com/intent/tweet?text=${enc(message)}`,
    email: `mailto:?subject=${enc('Join me on VELOOP Rewards')}&body=${enc(message)}`,
  };
}
