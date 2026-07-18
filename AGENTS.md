<!-- BEGIN:astro-agent-rules -->

# This is Astro 7 — verify before you assume

Astro 7 and Tailwind 4 have moved on from older tutorials and training data. Before writing
non-trivial code, consult the guides linked in `CLAUDE.md` (routing, components, framework
components, content collections, styling, i18n). Heed deprecation notices.

<!-- END:astro-agent-rules -->

# Zyeth — Agent Workflow

This file is the contract for any AI agent (Claude, Codex, etc.) or human contributor working on
this repo. Multiple agents may run in parallel — the rules below prevent collisions.

## Source of truth hierarchy

1. **`PLAN.md`** — vision, business model, stack decisions, phased roadmap (Spanish). Read FIRST
   when working on anything non-trivial.
2. **GitHub Issues** — granular tasks, bugs, features. Each issue carries an `area:*` label and a
   priority (`P0`/`P1`/`P2`).
3. **GitHub Project board** — kanban view synced by `.github/workflows/project-status.yml`.
4. **This file (`AGENTS.md`)** — workflow conventions only.

If `PLAN.md` and an issue conflict, ask the user — do not silently pick.

## Issue-first rule (mandatory)

**No code changes without an open issue.** Before any work:

1. Search existing issues: `gh issue list --search "<keywords>"`. If one exists, use it.
2. If none, create one: `gh issue create --title "..." --label "area:<domain>,P<n>" --body "..."`.
3. Comment on the issue claiming it: `gh issue comment <N> --body "Picking this up — agent: <name>"`.
   This is the lock signal for other agents.
4. Move the issue to `In Progress` on the Project board.

Why: prevents two agents from working on the same thing.

## Epic workflow (standing rules)

For any multi-issue epic (e.g. the `submissions-backend` epic, tracked by an `epic`-labelled
umbrella issue):

1. **Merge the PR to `staging` BEFORE starting the next issue.** Each issue's PR must be squash-merged
   to `staging` before the next issue begins — keeps branches sequential and unstacked, so every new
   feature branches off the latest `staging`.
2. **One sub-agent per issue.** Delegate each issue to a fresh sub-agent run (see § Sub-agent
   orchestration). Keep the orchestrator context clean.
3. **Fetch before branching.** After `gh pr merge`, the local `origin/staging` ref is stale. Run
   `git fetch origin` BEFORE `git checkout -b <next> origin/staging`, or you branch off the
   pre-merge state and lose the just-merged work.

## Branch naming

```
amartinez/<feature|bugfix>/<yyyy-mm-dd>/req-<issue>-<short-slug>
```

Examples:

- `amartinez/feature/2026-07-18/req-28-submission-api`
- `amartinez/bugfix/2026-07-18/req-40-cors-origin`

The `req-<issue>` segment ties the branch to its GitHub issue. When a branch has no single issue
(rare), use a bare `<slug>` instead of `req-<issue>-<slug>`.

## Commit format (conventional commits, no AI attribution)

```
<type>(<scope>): <subject> (#<issue>)
```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `style`.
Common scopes: `home`, `page`, `foundation`, `backend`, `db`, `infra`, `ci`, `docs`.

Examples:

- `feat(backend): public submission API with validation (#28)`
- `fix(db): correct FK ordering on sessions (#40)`
- `docs(page): add how it works page EN/ES (#9)`

NEVER add `Co-Authored-By` or AI attribution lines.

## PR convention

- **Base branch is `staging`** — NOT `main`. `main` is production; `staging` is the integration line.
- Title: same as the closing commit.
- Body must include `Closes #<issue>` so the issue auto-closes on merge.
- Self-review checklist: build passes, backend `astro check` passes (if backend touched), manual
  smoke test described, live-staging verification for UI changes.
- **Squash merge by default** — keeps history linear.

### There is no PR-time CI gate — verify locally

`.github/workflows/deploy.yml` runs `npm ci && npm run build` **on push to `staging` and `main`**,
NOT on the PR. That means:

- A PR has no automated green/red signal. The quality gate is **local verification before merge**
  (see § Verification).
- **Merging to `staging` triggers a live deploy** to `staging.zyeth.work` via rsync. Merging is a
  deploy action — treat it accordingly.
- Because there is no automated gate to certify green, agents do NOT auto-merge. The shipper opens
  the PR and reports; a merge that deploys is confirmed with the user unless the user has explicitly
  authorized the merge for that issue.

## Labels (canonical list)

| Label             | Meaning                                            |
| ----------------- | -------------------------------------------------- |
| `area:foundation` | Design system, layout, i18n base                   |
| `area:home`       | Home page sections                                 |
| `area:page`       | Standalone pages                                    |
| `area:backend`    | Submissions backend + admin dashboard              |
| `area:infra`      | CI/CD, hosting, deploy                              |
| `area:qa`         | Responsive, a11y, SEO polish                       |
| `P0`              | Blocks everything — do first                        |
| `P1`              | Core build                                          |
| `P2`              | After core                                          |
| `epic`            | Umbrella tracking issue                             |
| `blocked`         | Blocked on external input or dependency. Orthogonal to priority and board status — a flag, not a status. When applying, comment WHAT it's blocked on. Filter with `-label:blocked` to find work you can start. |
| `bug`             | Something broken                                    |
| `documentation`   | Docs only                                           |

## Tech baseline (do not deviate without an issue)

This is an **npm workspaces monorepo**:

- **Root** (`/`) — the public marketing site. Astro 7, **static/SSG** output (no adapter), bilingual
  EN (`/`) + ES (`/es`). Tailwind 4 (CSS-first `@theme`), self-hosted `@fontsource` (Poppins + Inter).
  Zero client JS by default — islands only where interactivity is required. SEO/performance are
  first-class (this site exists to rank and convert).
- **`backend/`** — the submissions backend. Astro 7 **SSR** via `@astrojs/node`, Drizzle ORM 0.45+
  over PostgreSQL (`postgres` driver), `zod` for validation, `file-type` for CV upload sniffing.
  Public API routes live in `backend/src/pages/api/`.

Rules:

- **Package manager**: **npm** (`package-lock.json`). Node `>=22.12.0`. NOT bun, NOT pnpm.
- **Dev server**: `astro dev --background`; manage with `astro dev stop|status|logs` (see `CLAUDE.md`).
- **i18n**: every user-facing string ships EN + ES. New pages exist at both `/<path>` and
  `/es/<path>`. Never hardcode a single-locale string in a shared component.
- **DB (backend)**: connection is a `postgres.js` singleton. Migrations via Drizzle
  (`npm run db:generate` then `npm run db:migrate`). A dedicated least-privilege `zyeth` role/DB is
  used — never the superuser. Money/counters as integers, never floats.
- **Drizzle**: use `sql\`...\`` templates (not raw strings) inside `.where()`, `.default()`, etc.
- **Public API surface (backend)**: submission endpoints are public and must keep their abuse
  controls — CORS allowlist, rate limiting, zod schema validation, and CV upload validation
  (`backend/src/lib/{validation,cors,rate-limit,uploads}.ts`). Do not loosen these without an issue.
- **Security carry-forwards** (opened by #28, MUST be closed by later epic issues — do not treat as
  permanent):
  - CSRF: `backend/astro.config.mjs` sets `security.checkOrigin: false` globally as a scoped
    tradeoff. The admin-auth issue (#30) must re-tighten this.
  - Caddy/edge hardening is deferred to #34.
- **Tests**: there is **no test framework** in this repo (no vitest/jest/playwright). Do NOT invent
  one or add test scaffolding without an issue. Verification is `astro check` + `npm run build` +
  manual/live smoke (see § Verification).

## Verification (no build-skip rule here — build IS the gate)

Unlike some sibling repos, zyeth has no lint step and no test suite, and `npm run build` is exactly
what CI runs on deploy. So build locally to catch what CI would catch:

```bash
# Frontend (root) — SSG build; this is the deploy gate
npm run build

# Backend — typecheck (astro check) when backend/ was touched
cd backend && npm run check

# Manual smoke — background dev server
astro dev --background   # then astro dev logs / astro dev stop
```

For UI-affecting changes, verify the live result on `https://staging.zyeth.work` (EN and ES) after
the deploy completes.

## gh CLI identity

All GitHub work MUST run as the **`ingamartinez`** account (owner of `ingamartinez/zyeth`). Verify:

```bash
gh auth status   # must show: Logged in to github.com account ingamartinez
```

On this Mac the default `gh` config is already `ingamartinez` — no prefix needed. On multi-agent
hosts (e.g. ia-server) where the default `gh` belongs to a different agent, select the
`ingamartinez` identity explicitly via `GH_CONFIG_DIR` (that identity lives at
`~/.config/gh-findash`, shared across `ingamartinez` repos):

```bash
GH_CONFIG_DIR=~/.config/gh-findash gh auth status   # if the default account is wrong
```

Never run `gh auth switch` / `gh auth setup-git` under the wrong config — it rewrites the global
gitconfig and breaks other accounts.

## Local commands

```bash
npm install                    # root + backend workspace
npm run build                  # frontend SSG build (the deploy gate)
astro dev --background         # frontend dev server (managed via astro dev status|logs|stop)

cd backend
npm run dev                    # backend SSR dev server
npm run check                  # astro check (typecheck)
npm run db:generate            # generate Drizzle migration from schema
npm run db:migrate             # apply migrations (tsx src/db/migrate.ts)
npm run db:studio              # drizzle-kit studio
```

`.env` files are NOT committed.

## Deploy

`.github/workflows/deploy.yml` on push to `staging` or `main`:

1. `npm ci && npm run build`
2. rsync `dist/` to the target host over SSH.
   - `staging` → `/srv/zyeth/staging/current` → `https://staging.zyeth.work`
   - `main` → `/srv/zyeth/prod/current` (production)

There is no separate PR CI. A failed build on push to `staging` means broken staging — so the
build must be green locally before merge.

## Multi-agent etiquette

- One issue → one agent at a time. Claim by commenting on the issue.
- If you find related work in progress, comment on the OTHER agent's issue instead of opening a
  parallel branch.
- Never force-push to `staging` or `main`. Never bypass hooks.
- If you discover a non-obvious gotcha, save it to engram (`mem_save`) AND add it to the relevant
  section of this file.
- After running scaffolders/codegen (`astro add`, drizzle generators, `npx create-*`), run
  `git log -1` BEFORE committing manually — some tools auto-commit with non-conventional messages.
  If you find one, `git reset --soft HEAD~1` and rebuild it with the proper
  `<type>(<scope>): <subject> (#<issue>)` format.

## Sub-agent orchestration (Claude Code)

Claude Code on this repo runs project-scoped sub-agents in `.claude/agents/`. Each one knows these
conventions, reads engram at start, and follows `AGENTS.md`. **The main orchestrator SHOULD delegate
to them** instead of writing code directly — bypassing them re-introduces bugs already documented in
memory.

| Agent               | Role                                                | When to invoke                                                                                                                                              |
| ------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `zyeth-explorer`    | Read-only digest                                    | BEFORE implementer when the task touches 4+ files, needs module mapping, needs prior art from engram, or the issue scope is unclear. Skip for obvious tasks. |
| `zyeth-implementer` | Code + i18n + local verify + commit                 | For EVERY code change. Turns a claimed issue into a branch ready to ship. Does NOT push, does NOT open PRs.                                                 |
| `zyeth-reviewer`    | Read-only review (CRITICAL / WARNING / SUGGESTION)  | BETWEEN implementer and shipper for non-trivial changes: backend API routes, DB schema/queries, validation, security controls, i18n coverage. Skip for docs-only or mechanical refactors. |
| `zyeth-shipper`     | Local gates + push + PR + merge (confirmed)         | AFTER implementer (and reviewer if applicable). Mechanical only — no new logic. Merge is confirmed with the user (no auto-merge — merging deploys).          |

### Standard flow

```
gh issue (claim) → zyeth-explorer     (if 4+ files or scope unclear)
                 → zyeth-implementer   (ALWAYS — do not write code directly)
                 → zyeth-reviewer      (non-trivial: backend, db, validation, security, i18n)
                 → zyeth-shipper        (push + PR + merge-on-confirm)
```

### Why this flow

- **The orchestrator does not carry every documented gotcha.** The sub-agents `mem_search` first —
  bypassing them re-introduces bugs already paid for (e.g. the `git fetch` staleness after merge).
- **Role separation** keeps the implementer out of architectural design (use `/sdd-new` for that)
  and keeps the shipper out of logic changes.
- **Reviewer between implementer and shipper** catches what no test suite exists to catch here:
  public-API abuse-control regressions, missing EN/ES coverage, Drizzle/FK mistakes, loosened
  security carry-forwards.

This applies to Claude Code specifically. Other agents can ignore this section — the rules above
(issue-first, branch naming, commits, PRs, gh identity, verification) apply to all agents equally.
