export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
// Empty = same origin: /api is proxied by Vite (dev) and vercel.json (prod) to avoid CORS.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
export const REQUEST_TIMEOUT_MS = 45_000; // Render free tier can take ~50s to wake up
