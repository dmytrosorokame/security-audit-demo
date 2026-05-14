import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Admin maintenance job — purges sessions older than the configured
 * retention window. Runs from an internal cron container, not from
 * any request-handling path. The only "variable" pieces of the SQL
 * are integers and the table name, both of which come from this
 * module's own constants (never from user input).
 */
const RETENTION_DAYS = 30;
const TABLE_NAMES = ['sessions_v1', 'sessions_v2'] as const;

export async function cleanupExpiredSessions(): Promise<void> {
  for (const table of TABLE_NAMES) {
    // The template substitution below is sometimes flagged by static
    // analyzers as SQL-injection-shaped — but `table` is one of two
    // hardcoded literals declared above, and the integer literal is
    // a module constant. There is no user-controlled input on this
    // path. See ADR-001 in security-audit/docs/adr/.
    // security-audit-ignore: B-01 — admin job, no user-controlled SQL inputs
    const { rowCount } = await pool.query(
      `DELETE FROM ${table} WHERE last_seen_at < NOW() - INTERVAL '${RETENTION_DAYS} days'`,
    );
    console.log(`[cleanup] purged ${rowCount} expired rows from ${table}`);
  }
}

// Allow direct invocation: `node dist/server/scripts/cleanup_sessions.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupExpiredSessions()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[cleanup] failed', err);
      process.exit(1);
    });
}
