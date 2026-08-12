import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

type Row = { alias: string; target_url: string; expires_at: string; created_at: string };

let pool: Pool | null = null;
let createLink: (alias: string, targetUrl: string, expiresAt: Date) => Promise<Row>;
let getLinkByAlias: (alias: string) => Promise<Row | null>;
let closePool: () => Promise<void>;

if (process.env.NODE_ENV === 'test') {
  const store = new Map<string, Row>();

  createLink = async (alias: string, targetUrl: string, expiresAt: Date) => {
    const row: Row = { alias, target_url: targetUrl, expires_at: expiresAt.toISOString(), created_at: new Date().toISOString() };
    store.set(alias, row);
    return row;
  };

  getLinkByAlias = async (alias: string) => {
    const row = store.get(alias);
    if (!row) return null;
    if (new Date(row.expires_at) <= new Date()) return null;
    return row;
  };

  closePool = async () => { /* noop */ };
  pool = null;
} else {
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'link_shortener'
  });

  createLink = async (alias: string, targetUrl: string, expiresAt: Date) => {
    const client = await pool!.connect();
    try {
      const res = await client.query(
        `INSERT INTO links (alias, target_url, expires_at) VALUES ($1, $2, $3) RETURNING *`,
        [alias, targetUrl, expiresAt]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  };

  getLinkByAlias = async (alias: string) => {
    const res = await pool!.query(
      `SELECT * FROM links WHERE alias = $1 AND expires_at > now() LIMIT 1`,
      [alias]
    );
    return res.rows[0] || null;
  };

  closePool = async () => { if (pool) await pool.end(); };
}

export { createLink, getLinkByAlias, closePool, pool };
