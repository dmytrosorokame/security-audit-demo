import type { NextFunction, Request, Response } from 'express';

export interface AuthedUser {
  id: string;
  role: 'user' | 'admin';
}

export interface AuthedRequest extends Request {
  user?: AuthedUser;
}

/**
 * Rejects the request with 401 if no authenticated user is attached.
 * Routes that call this can safely read req.user in subsequent handlers.
 */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}
