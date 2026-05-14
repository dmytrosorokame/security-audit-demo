import { Router } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const usersRouter = Router();

interface AuthedRequest {
  user?: { id: string; role: 'user' | 'admin' };
}

function requireAuth(req: AuthedRequest, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

/**
 * Look up a user by id. Returns the public profile fields.
 * Used by the social/profile pages to render any user's card.
 */
usersRouter.get('/:id', requireAuth, async (req, res) => {
  const targetId = req.params.id;

  const { rows } = await pool.query(
    'SELECT id, email, display_name FROM users WHERE id = $1',
    [targetId],
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'not found' });
  }

  res.json(rows[0]);
});
