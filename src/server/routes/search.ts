import { Router } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const searchRouter = Router();

/**
 * Safe search endpoint.
 * Uses parameterized query placeholders ($1) — the driver escapes values,
 * so user input cannot break out of the string literal.
 */
searchRouter.get('/', async (req, res) => {
  const q = String(req.query.q ?? '').slice(0, 200);

  const { rows } = await pool.query(
    'SELECT id, title FROM articles WHERE title ILIKE $1 LIMIT 20',
    [`%${q}%`],
  );

  res.json(rows);
});
