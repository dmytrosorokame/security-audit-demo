import { Router } from 'express';

export const proxyRouter = Router();

/**
 * Outbound proxy used by the frontend to embed third-party content
 * (RSS, images, oEmbed previews). Accepts any URL the user supplies.
 */
proxyRouter.get('/', async (req, res) => {
  const target = String(req.query.url ?? '');

  if (!target) {
    return res.status(400).json({ error: 'url query param is required' });
  }

  const upstream = await fetch(target);
  const body = await upstream.text();

  res
    .status(upstream.status)
    .type(upstream.headers.get('content-type') ?? 'text/plain')
    .send(body);
});
