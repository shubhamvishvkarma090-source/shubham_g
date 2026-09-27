import { describe, it, expect, vi, afterEach } from 'vitest';
import { request, ApiError } from '../client.js';

afterEach(() => vi.unstubAllGlobals());

describe('request', () => {
  it('returns parsed JSON on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ a: 1 }) }));
    await expect(request('/api/x')).resolves.toEqual({ a: 1 });
  });

  it('maps network failures to a friendly ApiError with status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const err = await request('/api/x').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
    expect(err.message).toMatch(/unable to reach the server/i);
  });

  it('never exposes the raw server error body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: 'SQL exploded at line 3' }) }));
    const err = await request('/api/x').catch((e) => e);
    expect(err.status).toBe(500);
    expect(err.message).not.toMatch(/SQL/);
  });

  it('sends JSON bodies for POST', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);
    await request('/api/game/session', { method: 'POST', body: { score: 5 } });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ score: 5 });
  });
});
