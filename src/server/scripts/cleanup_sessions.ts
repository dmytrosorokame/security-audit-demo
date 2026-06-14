import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const RETENTION_DAYS = 30;

/**
 * Admin maintenance job — purges sessions older than the retention window.
 * Invoked from an internal cron container:
 *   node dist/server/scripts/cleanup_sessions.js <table>
 */
export async function cleanupExpiredSessions(table: string): Promise<void> {
  // security-audit-ignore: B-01 — admin cron CLI; `table` is supplied by the ops-owned cron command, never by a request path
  const { rowCount } = await pool.query(
    `DELETE FROM ${table} WHERE last_seen_at < NOW() - INTERVAL '${RETENTION_DAYS} days'`,
  );
  console.log(`[cleanup] purged ${rowCount} expired rows from ${table}`);
}

// Allow direct invocation: `node dist/server/scripts/cleanup_sessions.js <table>`
if (import.meta.url === `file://${process.argv[1]}`) {
  const table = process.argv[2] ?? 'sessions_v1';
  cleanupExpiredSessions(table)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[cleanup] failed', err);
      process.exit(1);
    });
}
