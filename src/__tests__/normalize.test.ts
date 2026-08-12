import { describe, it, expect } from 'vitest';
import { normalizeBaseUrl } from '../lib/normalize';

describe('normalizeBaseUrl', () => {
  it('adds https when missing and strips trailing slash', () => {
    expect(normalizeBaseUrl('example.com')).toBe('https://example.com');
  });

  it('lowercases host and removes trailing slash', () => {
    expect(normalizeBaseUrl('https://Example.COM/')).toBe('https://example.com');
  });

  it('removes credentials, query and fragment but preserves path', () => {
    expect(normalizeBaseUrl('https://user:pass@example.com/foo?bar=baz#frag')).toBe('https://example.com/foo');
  });

  it('throws on empty input', () => {
    expect(() => normalizeBaseUrl('')).toThrow();
  });
});
