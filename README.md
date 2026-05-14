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

| # | Branch | Pattern under test | Rule | Severity | Expected verdict |
|---|---|---|---|---|---|
| 1 | `demo/01-dom-xss` | New `Bio.tsx` injects unsanitized user HTML via `dangerouslySetInnerHTML` | R-01 | high | TP |
| 2 | `demo/02-ssrf` | Proxy route accepts any URL — allowlist removed | B-04 | critical | TP |
| 3 | `demo/03-safe-refactor` | Pure refactor — extract helper, no security impact | — | — | TN (0 findings) |
| 4 | `demo/04-idor` | User route returns any user by id without ownership check | B-11 | medium | TP (low confidence) |
| 5 | `demo/05-sanitizer-removed` | `DOMPurify` wrapper removed from `Comment.tsx` — `dangerouslySetInnerHTML` now consumes raw input | R-01 | high | TP |

The catalog (`references/owasp-rules.md`) currently covers **R-01..R-11** (frontend), **B-01..B-15** (backend), and **D-01..D-08** (Docker / compose) — 34 rules total. Both PRs #1 and #5 collapse to R-01 because the resulting code shape is identical (`dangerouslySetInnerHTML` with no sanitizer); PR #1 introduces a new unsafe component, PR #5 regresses an existing safe one. A future "sanitizer regression" rule would split these, but for now R-01 with the diff context is enough to remediate either.

PRs 1, 2, 4, 5 should result in a **failed check** (severity ≥ high or critical), PR 3 should be **green**.

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
