import { Router } from 'express';
import { Pool } from 'pg';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const usersRouter = Router();

/**
 * Safe IDOR-resistant handler.
 * Returns the user record only when:
 *   (a) the caller asks for their own id, or
 *   (b) the caller is an admin.
 * Without this check, any authed user could read /api/users/:id for any id.
 */
usersRouter.get('/:id', requireAuth, async (req, res) => {
  const authed = (req as AuthedRequest).user!;
  const targetId = req.params.id;

  const isSelf = authed.id === targetId;
  const isAdmin = authed.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const { rows } = await pool.query(
    'SELECT id, email, display_name FROM users WHERE id = $1',
    [targetId],
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'not found' });
  }

  res.json(rows[0]);
});
