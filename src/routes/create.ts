import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { generateAlias } from '../lib/generator';
import { createLink } from '../lib/db';
import { setCachedLink } from '../lib/cache';
import { normalizeUrl, normalizeBaseUrl } from '../lib/normalize';

export default async function (fastify: FastifyInstance) {
  fastify.post(
    '/api/links',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            targetUrl: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
            expiresInDays: { type: 'number' }
          }
        }
      },
      config: {
        rateLimit: {
          max: Number(process.env.CREATE_RATE_LIMIT_MAX || 10),
          timeWindow: process.env.CREATE_RATE_LIMIT_WINDOW || '1 minute'
        }
      }
    },
    async (request: FastifyRequest<{ Body: { url: string; expiresAt?: string } }>, reply: FastifyReply) => {
    const body = request.body || {};
    const rawUrl = (body.url as string) || (body.targetUrl as string);
    if (!rawUrl) return reply.status(400).send({ error: 'Missing url' });
    let target: string;
    try {
      target = normalizeUrl(rawUrl);
    } catch (err) {
      return reply.status(400).send({ error: 'Invalid or unsupported URL' });
    }

    const defaultExpiryMs = 1000 * 60 * 60 * 24 * 365 * 2; // 2 years
    const maxExpiryMs = 1000 * 60 * 60 * 24 * 365 * 5; // 5 years
    let expiresAt: Date;
    if (body.expiresAt) {
      expiresAt = new Date(body.expiresAt);
    } else if (typeof body.expiresInDays === 'number') {
      expiresAt = new Date(Date.now() + Math.max(1, Math.floor(body.expiresInDays)) * 24 * 60 * 60 * 1000);
    } else {
      expiresAt = new Date(Date.now() + defaultExpiryMs);
    }
    if (isNaN(expiresAt.getTime())) return reply.status(400).send({ error: 'Invalid expiresAt' });
    if (expiresAt.getTime() - Date.now() > maxExpiryMs) return reply.status(400).send({ error: 'expiresAt too far in future' });

    const aliasLength = Number(process.env.ALIAS_LENGTH || 8);
    const maxAttempts = 5;
    let lastErr: unknown = null;
    for (let i = 0; i < maxAttempts; i++) {
      const alias = generateAlias(aliasLength);
      try {
        const row = await createLink(alias, target, expiresAt);
        // set cache TTL to seconds until expiration
        const ttl = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
        await setCachedLink(alias, target, ttl);
        const baseRaw = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
        let base: string;
        try {
          base = normalizeBaseUrl(baseRaw);
        } catch (_) {
          base = `http://localhost:${process.env.PORT || 3000}`;
        }
        return reply.status(201).send({ alias, shortUrl: `${base}/${alias}`, target, expiresAt: row.expires_at });
      } catch (err: unknown) {
        // unique violation -> retry
        lastErr = err;
        const dbErr = err as { code?: string; message?: string };
        if (dbErr.code === '23505') continue;
        break;
      }
    }
    type DBError = { message?: string };
    const detail = (lastErr && typeof lastErr === 'object' && 'message' in lastErr) ? (lastErr as DBError).message : undefined;
    return reply.status(500).send({ error: 'Could not generate unique alias', detail });
  });
}
