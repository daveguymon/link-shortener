import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getCachedLink, setCachedLink } from '../lib/cache';
import { getLinkByAlias } from '../lib/db';

export default async function (fastify: FastifyInstance) {
  fastify.get('/:alias', async (request: FastifyRequest<{ Params: { alias: string } }>, reply: FastifyReply) => {
    const { alias } = request.params;
    if (!alias) return reply.status(400).send({ error: 'Missing alias' });

    // Try cache first
    const cached = await getCachedLink(alias);
    if (cached) {
      return reply.redirect(301, cached);
    }

    // Fallback to DB
    const row = await getLinkByAlias(alias);
    if (!row) return reply.status(404).send({ error: 'Not found or expired' });

    // populate cache
    const ttl = Math.max(1, Math.floor((new Date(row.expires_at).getTime() - Date.now()) / 1000));
    await setCachedLink(alias, row.target_url, ttl);
    return reply.redirect(301, row.target_url);
  });
}
