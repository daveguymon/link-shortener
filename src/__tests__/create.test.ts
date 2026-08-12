import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';

vi.mock('../../lib/db', () => {
  return {
    createLink: vi.fn(async (alias: string, targetUrl: string, expiresAt: Date) => ({ alias, target_url: targetUrl, expires_at: expiresAt })),
    getLinkByAlias: vi.fn(async () => null)
  };
});

vi.mock('../../lib/cache', () => {
  return {
    setCachedLink: vi.fn(async () => null),
    getCachedLink: vi.fn(async () => null)
  };
});

import createRoutes from '../routes/create';

describe('POST /api/links', () => {
  let app: ReturnType<typeof Fastify>;

  beforeEach(() => {
    app = Fastify();
    app.register(createRoutes);
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 201 and alias for valid URL', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/links',
      payload: { url: 'https://example.com' }
    });
    // debug output in tests to inspect failure
    // eslint-disable-next-line no-console
    console.log('create res body:', res.body);
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('alias');
    expect(body).toHaveProperty('shortUrl');
  });
});
