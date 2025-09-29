# Codex Workflow — Automatic process for Claude Code & Codex CLI

Make Claude Code or Codex CLI work the way you want, automatically. This package bootstraps your plan-first workflow, documents every session, and updates status docs without you pasting prompts or hand-holding.

**Supports both:**
- 🧠 **Claude Code** (terminal CLI)
- ⚡ **Codex CLI** (if you have it)

## What it does (no fluff)
- `npx cw init` — One-time setup per repo
  - Adds/updates: `AGENTS.md`, `CODING_AGENT.md`, `docs/templates/*`, `docs/status/board.md`
  - Registers MCP server with available CLI (Claude Code or Codex)
- `npx cw "<objective>"` — Start any session
  - Auto-detects available CLI (Claude Code or Codex)
  - Launches with auto-kickoff message
  - Claude/Codex automatically: creates session doc, updates status board, follows your workflow rules
  - Zero manual prompting needed

Result: Every session creates `docs/sessions/<date>-<slug>.md`, updates `docs/status/board.md`, and follows your AGENTS.md rules (plan → execute → wrap-up) without you doing anything.

## How it works
- MCP server (Node/TS) exposes:
  - `workflow.init_session({ objective })` → creates `docs/sessions/...`, commits a header scaffold.
  - `workflow.update_board({ state, links })` → inserts/updates row in `docs/status/board.md`.
  - `workflow.append_agents()` → appends a single fenced section if missing.
  - `workflow.wrap_up({ summary, next })` → writes outcomes back to the session doc + board.
- Wrapper spawns Codex CLI and pushes an initial prompt that instructs Codex to call these MCP tools (so you don’t paste anything).
- Approval mode defaults to `suggest`; commands never run destructively without Codex’s consent.

## Install & use
```bash
# One-time per repo
npx cw init

# Start any session (much shorter!)
npx cw "Fix payment retry bug"
npx cw "Add user dashboard"
npx cw "Refactor auth module"
```

## How users get it
- **GitHub**: You publish this repo to npm (`npm publish`)
- **Usage**: They run `npx cw init` (downloads latest, runs, cleans up automatically)
- **MCP server**: Auto-registers with Claude Code (`claude mcp add`) or Codex CLI (TOML config)
- **No installation needed**: npx handles everything, works from any repo
- **Auto-detection**: Automatically finds Claude Code or Codex CLI on their system

## Files it manages
- `AGENTS.md` and `CODING_AGENT.md` aligned to plan-first rules (short, actionable).
- `docs/templates/session-kickoff.md`, `docs/templates/feature-plan.md`.
- `docs/status/board.md` (Backlog → Active → Review → Done).
- Optional: `.github/pull_request_template.md` if missing.

## MVP scope (Week 1)
1. **Core CLI**: `npx cw init` and `npx cw "<objective>"`
2. **MCP server**: Session management, status board updates, template population
3. **Auto-kickoff**: Codex launches with workflow already activated
4. **Templates**: AGENTS.md, session docs, status board

## Roadmap (iterative releases)

**v0.2 - Smart Planning (Week 2)**
- Auto-analyze codebase scope before planning
- Different plan templates for features vs bugfixes vs refactoring
- Architecture doc maintenance: `docs/ARCHITECTURE.md` stays current
- `npx cw check` → validates doc consistency

**v0.3 - Quality Gates (Week 3)**
- Auto-run tests before wrapping up sessions
- Security scanning integration
- PR template auto-population with session links
- `workflow.ensure_tests()`, `workflow.security_scan()`

**v0.4 - Team Features (Week 4)**
- Stakeholder notifications ("feature X ready for review")
- Board integrations (Linear, Jira status sync)
- GitHub Actions: fail PRs missing session docs
- Analytics: "time to completion", "planning accuracy"

**v0.5 - Advanced Automation (Month 2)**
- `workflow.create_pr()` → auto-opens PRs with proper descriptions
- `workflow.deploy()` → handles deployment workflows
- Multi-session features (epics spanning multiple sessions)
- Team templates (different workflows for different teams)

## Why this is actually useful
- Zero rituals: Codex auto-creates plans, session docs, and board rows.
- Predictable quality: decisions and outcomes always land in docs.
- Easy to adopt: one `npx` command; no manual prompts; uses official MCP.

## Quick Start

### Option A: From npm (when published)
```bash
# One-time setup in any repo
npx cw init

# Start working (that's it!)
npx cw "Fix the authentication bug"
npx cw "Add user profile page"
```

### Option B: From GitHub (available now)
```bash
# One-time setup
git clone https://github.com/manastm/codex-workflow
cd codex-workflow
npm install
npm link

# Now use from any directory:
cw init
cw "Fix authentication bug"
cw "Add user profile page"
```

### Option C: Direct usage (no install)
```bash
# Clone and use directly
git clone https://github.com/manastm/codex-workflow
cd codex-workflow
npm install

# Use with node commands:
node bin/cw.js init
node bin/cw.js "Fix authentication bug"
```

## What this solves

**Before:** Manual workflow management
- Copy-paste prompts into Claude/Codex
- No session documentation
- Inconsistent development process
- Lost context between sessions

**After:** Automatic workflow
- Zero setup after `npx cw init`
- Every session documented automatically
- Consistent plan → execute → wrap-up process
- Persistent progress tracking

