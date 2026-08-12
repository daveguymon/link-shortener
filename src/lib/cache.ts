import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redis: any = null;
let _getCachedLink: (alias: string) => Promise<string | null>;
let _setCachedLink: (alias: string, targetUrl: string, ttlSeconds: number) => Promise<void>;
let _closeRedis: () => Promise<void>;

if (process.env.NODE_ENV === 'test') {
  const store = new Map<string, { value: string; expiresAt: number }>();

  _getCachedLink = async (alias: string) => {
    const entry = store.get(alias);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(alias);
      return null;
    }
    return entry.value;
  };

  _setCachedLink = async (alias: string, targetUrl: string, ttlSeconds: number) => {
    store.set(alias, { value: targetUrl, expiresAt: Date.now() + ttlSeconds * 1000 });
  };

  _closeRedis = async () => {
    /* noop */
  };
} else {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'redis',
    port: Number(process.env.REDIS_PORT || 6379)
  });

  _getCachedLink = async (alias: string) => {
    const key = `link:${alias}`;
    return await redis.get(key);
  };

  _setCachedLink = async (alias: string, targetUrl: string, ttlSeconds: number) => {
    const key = `link:${alias}`;
    await redis.set(key, targetUrl, 'EX', ttlSeconds);
  };

  _closeRedis = async () => {
    await redis.quit();
  };
}

export const getCachedLink = _getCachedLink;
export const setCachedLink = _setCachedLink;
export const closeRedis = _closeRedis;
export { redis };
