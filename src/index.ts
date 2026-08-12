import dotenv from 'dotenv';
import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import path from 'path';
import fastifyStatic from '@fastify/static';
import createRoutes from './routes/create';
import redirectRoutes from './routes/redirect';
import { pool } from './lib/db';
import { redis } from './lib/cache';

dotenv.config();

const port = Number(process.env.PORT || 3000);
const server = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

// Basic rate limiting for creation endpoint and general protection
server.register(rateLimit, {
  global: false,
  max: Number(process.env.RATE_LIMIT_MAX || 60),
  timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute'
});

// Register routes (creation endpoint will use the rate limit via decorator)
// Serve a minimal UI under /ui/
server.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/ui/',
});

// Redirect root to UI
server.get('/', async (_req, reply) => {
  return reply.redirect('/ui/');
});

server.register(createRoutes);
server.register(redirectRoutes);

const start = async () => {
  try {
    // ensure DB is reachable
    await pool.query('SELECT 1');
    await redis.ping();
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  server.log.info('Shutting down');
  await server.close();
  await pool.end();
  await redis.quit();
  process.exit(0);
});

start();
