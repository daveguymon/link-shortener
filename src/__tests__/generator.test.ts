import { describe, it, expect } from 'vitest';
import { generateAlias } from '../lib/generator';

describe('generateAlias', () => {
  it('generates default-length aliases', () => {
    const a = generateAlias();
    expect(a).toHaveLength(8);
  });

  it('generates unique values over many runs', () => {
    const set = new Set<string>();
    for (let i = 0; i < 500; i++) {
      set.add(generateAlias());
    }
    expect(set.size).toBe(500);
  });
});
