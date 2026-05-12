import { Router } from 'express';

const ALLOWED_HOSTS = new Set([
  'api.example.com',
  'cdn.example.com',
  'images.example.com',
]);

export const proxyRouter = Router();

/**
 * Safe outbound proxy.
 * Verifies the target URL hostname against an allowlist before fetching,
 * preventing SSRF to internal infrastructure (metadata endpoints, 127.0.0.1, etc.).
 */
proxyRouter.get('/', async (req, res) => {
  const target = String(req.query.url ?? '');

  if (!target) {
    return res.status(400).json({ error: 'url query param is required' });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return res.status(400).json({ error: 'invalid url' });
  }

  if (parsed.protocol !== 'https:') {
    return res.status(400).json({ error: 'only https is allowed' });
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return res.status(403).json({ error: 'host not in allowlist' });
  }

  const upstream = await fetch(parsed.toString(), {
    redirect: 'error',
    signal: AbortSignal.timeout(5000),
  });

  const body = await upstream.text();
  res.status(upstream.status).type(upstream.headers.get('content-type') ?? 'text/plain').send(body);
});
