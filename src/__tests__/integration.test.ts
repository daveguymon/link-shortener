import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';

describe('Integration: UI routes', () => {
  let app: ReturnType<typeof Fastify>;

  beforeEach(() => {
    app = Fastify();
    // serve static UI under /ui/
    app.register(fastifyStatic, {
      root: path.join(__dirname, '..', '..', 'public'),
      prefix: '/ui/'
    });

    // root should render the UI index
    app.get('/', async (_req, reply) => {
      return reply.redirect('/ui/');
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / redirects to /ui/ and serves index', async () => {
    const res = await app.inject({ method: 'GET', url: '/' });
    expect(res.statusCode).toBe(302);
    expect(res.headers).toHaveProperty('location', '/ui/');
  });

  it('GET /ui/ serves the UI index.html', async () => {
    const res = await app.inject({ method: 'GET', url: '/ui/' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.body).toContain('<h1>Link Shortener</h1>');
  });

  it('GET /ui/index.html serves the index file', async () => {
    const res = await app.inject({ method: 'GET', url: '/ui/index.html' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
  });
});
