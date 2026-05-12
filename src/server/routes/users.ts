import { Router } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const usersRouter = Router();

// In a real app these would come from a session/JWT middleware.
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
