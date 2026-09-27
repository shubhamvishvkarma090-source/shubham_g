import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config.js';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const NETWORK_MESSAGE = 'Unable to reach the server. Check your connection and try again.';
export const GENERIC_MESSAGE = 'Something went wrong loading this. Please try again.';

const STATUS_MESSAGES = {
  403: "You're out of attempts for today — come back tomorrow!",
  404: 'This activity is not available right now.',
  409: 'Already claimed — check back when the timer ends.',
  429: 'Slow down a little — please try again in a moment.',
};

/** Thin fetch wrapper. Raw server errors are never surfaced to the UI. */
export async function request(path, { method = 'GET', body, baseUrl = API_BASE_URL } = {}) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
  let res;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller?.signal,
    });
  } catch {
    throw new ApiError(0, NETWORK_MESSAGE);
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (!res.ok) throw new ApiError(res.status, STATUS_MESSAGES[res.status] ?? GENERIC_MESSAGE);
  try {
    return await res.json();
  } catch {
    return {};
  }
}
