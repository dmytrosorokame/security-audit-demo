# security-audit-demo

End-to-end demo of the [`dmytrosorokame/security-audit`](https://github.com/dmytrosorokame/security-audit) GitHub Action.

The `main` branch is a deliberately **safe** mini full-stack TypeScript app: an Express API
(SSRF-resistant proxy, IDOR-resistant user lookup, parameterized SQL), a React frontend
(DOMPurify-sanitized comments, origin-checked postMessage), and a hardened Dockerfile /
docker-compose.

Every other branch introduces **one specific vulnerability** to exercise the audit.

## How the demo works

1. A PR is opened against `main`.
2. `.github/workflows/security-audit.yml` runs `dmytrosorokame/security-audit@main`.
3. The action diffs the PR against `main`, sends only the diff plus the OWASP/CWE grounding
   catalog to the configured LLM (OpenAI by default), validates findings against the diff,
   and posts a single sticky PR comment.
4. SARIF is uploaded to the repo's **Security → Code scanning** tab.
5. The PR check fails if any finding is at or above `fail-on: high`.

## Reference PRs

| # | Branch | Category | Pattern under test | Rule | Severity | Expected verdict |
|---|---|---|---|---|---|---|
| 1 | `demo/01-dom-xss` | Frontend | New `Bio.tsx` injects unsanitized user HTML via `dangerouslySetInnerHTML` | R-01 | high | TP |
| 2 | `demo/02-ssrf` | Backend | Proxy route accepts any URL — allowlist removed | B-04 | critical | TP |
| 3 | `demo/03-safe-refactor` | Negative control | Pure refactor — extract helper, no security impact | — | — | TN (0 findings) |
| 4 | `demo/04-idor` | Backend | User route returns any user by id without ownership check | B-11 | medium | TP (low confidence) |
| 5 | `demo/05-sanitizer-removed` | Frontend | `DOMPurify` wrapper removed from `Comment.tsx` — `dangerouslySetInnerHTML` now consumes raw input | R-01 | high | TP |
| 6 | `demo/06-sqli` | Backend | `search.ts` swaps parameterized `ILIKE $1` for template-literal concat — disguised as a perf optimisation | B-01 | critical | TP |
| 7 | `demo/07-docker-root` | Container | `Dockerfile` drops `USER app` (and the `addgroup`/`adduser` lines) — process runs as root, justified as "easier log-volume perms" | D-01 | high | TP |
| 8 | `demo/08-fp-suppress` | Suppression | Admin cron CLI builds a raw-SQL `DELETE` by interpolating a `process.argv` table argument — a genuine B-01 the scanner flags, but it's ops-controlled and unreachable from any request path. Inline `// security-audit-ignore: B-01 — admin cron CLI; ...` is honored. | (B-01 suppressed) | — | TP→Suppressed (0 active findings) |

The catalog (`references/owasp-rules.md`) covers **R-01..R-11** (frontend, 11 rules), **B-01..B-22** (backend, 22 rules), and **D-01..D-08** (Docker / compose, 8 rules) — 41 total, mapping to all 10 OWASP Top 10 (2025) categories. The demo exercises one rule from each category plus a suppression case; the parent project's `benchmark/` directory covers ~50 cases with stricter F1/precision/recall reporting.

Both PRs #1 and #5 collapse to R-01 because the resulting code shape is identical (`dangerouslySetInnerHTML` with no sanitizer); PR #1 introduces a new unsafe component, PR #5 regresses an existing safe one. A future "sanitizer regression" rule would split these, but for now R-01 with the diff context is enough to remediate either.

PRs 1, 2, 4, 5, 6, 7 should result in a **failed check** (severity ≥ high or critical), PRs 3 and 8 should be **green** (PR 3 because no finding, PR 8 because the single finding is suppressed by the inline directive — visible in the `suppressed_findings` block of the comment, with the reason quoted from the directive).

## Local reproduction

```bash
# Clone both repos as siblings
git clone https://github.com/dmytrosorokame/security-audit.git
git clone https://github.com/dmytrosorokame/security-audit-demo.git
cd security-audit-demo

# Check out one of the demo branches
git checkout demo/01-dom-xss

# Run the scanner locally against main
export OPENAI_API_KEY=sk-...
node ../security-audit/scripts/scan_diff.mjs \
  --against=origin/main \
  --provider=openai \
  --model=cheap \
  --format=markdown
```

## Required secrets

The workflow needs **one** of:

- `OPENAI_API_KEY` (default — used by `provider: openai`)
- `ANTHROPIC_API_KEY` (swap `provider: anthropic` in the workflow)

Configure them in **Settings → Secrets and variables → Actions**.

## What is *not* in this demo

This repo is for E2E action smoke-testing. It is **not** a full benchmark — see the parent
project's `benchmark/` directory for that.
