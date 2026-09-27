import { describe, it, expect, beforeEach } from 'vitest';
import { REFERRAL_KEY, generateCode, getReferral, recordShare, referralLink, shareUrls } from '../referral.js';

beforeEach(() => localStorage.clear());

describe('referral utils', () => {
  it('generates readable VELOOP codes without ambiguous characters', () => {
    const code = generateCode(() => 0.5);
    expect(code).toMatch(/^VELOOP-[A-HJ-NP-Z2-9]{4}$/);
  });

  it('keeps the same code for the user across reads', () => {
    const first = getReferral();
    const second = getReferral();
    expect(second.code).toBe(first.code);
    expect(first.shares).toBe(0);
  });

  it('records shares persistently', () => {
    getReferral();
    recordShare();
    expect(getReferral().shares).toBe(1);
  });

  it('recovers from corrupt storage', () => {
    localStorage.setItem(REFERRAL_KEY, '{oops');
    expect(getReferral().code).toMatch(/^VELOOP-/);
  });

  it('builds a link to the dashboard carrying the code', () => {
    expect(referralLink('VELOOP-AB2C', 'https://x.app')).toBe('https://x.app/Lvl-Dashboard?ref=VELOOP-AB2C');
  });

  it('encodes share URLs for each channel', () => {
    const urls = shareUrls('https://x.app/Lvl-Dashboard?ref=VELOOP-AB2C');
    expect(urls.whatsapp).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(urls.whatsapp).toContain(encodeURIComponent('https://x.app/Lvl-Dashboard?ref=VELOOP-AB2C'));
    expect(urls.telegram).toMatch(/^https:\/\/t\.me\/share\/url\?url=/);
    expect(urls.x).toMatch(/^https:\/\/twitter\.com\/intent\/tweet\?text=/);
    expect(urls.email).toMatch(/^mailto:\?subject=/);
  });
});
