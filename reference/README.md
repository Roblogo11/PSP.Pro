# 🏟️ PSP.Pro Reference Library

This directory is the **in-repo knowledge layer** — the encyclopedia every PSP.Pro session ships with so each session starts educated instead of re-deriving what was learned yesterday.

PSP's roots are the booking/coach/membership system that Coach Rachel and the parents on the sideline depend on. This library is the **human-readable supplement** that sits alongside the code, capturing knowledge that's load-bearing but doesn't belong in source files or migrations.

**For Claude (assistant) and human contributors alike:** when starting a PSP.Pro session, read this README. Follow links to whatever bible / recipe / lesson is relevant for today's task. Don't re-derive what's already documented.

---

## How this library is organized

```
reference/
  README.md           ← you are here — the index
  bibles/             ← long-form canonical references (read once per topic)
  recipes/            ← short single-pattern guides (read when a situation arises)
  lessons/            ← institutional memory — one file per hard-won lesson
  pending-lessons/    ← scratchpad — half-formed lessons awaiting promotion to lessons/
```

**Rule of thumb:**
- Need the full picture on a subsystem (booking, RLS, membership)? → `bibles/`
- Need to do a specific thing (run a migration, take a screenshot, recover from drift)? → `recipes/`
- Hit something weird, want to know if we've seen it before? → `lessons/`
- Mid-session learning that isn't fully baked? → drop a stub in `pending-lessons/` and promote later

---

## 📖 Bibles (long-form canonical references)

| File | What it covers |
|---|---|
| _(coming)_ `bibles/booking-system.md` | Full booking lifecycle: services, slots, bookings, triggers, double-counting history, payment flows |
| _(coming)_ `bibles/coppa-parent-accounts.md` | Under-13 athletes → parent_guardian accounts. Schema, signup flow, admin UX, notification email |
| _(coming)_ `bibles/css-cascade-traps.md` | Global `!important` text overrides, `.home-page` vs `command-panel` scoping, dark/light mode pitfalls |
| _(coming)_ `bibles/migrations-and-triggers.md` | Slot trigger evolution (025 → 052 → 056 → 061), pg_cron guardrail, RLS recursion gotcha |

---

## 🍳 Recipes (short single-pattern guides)

| File | When to use |
|---|---|
| _(coming)_ `recipes/run-migration-via-supabase-editor.md` | Need to apply a migration but production-bound (no `supabase db push`) |
| _(coming)_ `recipes/headless-screenshot-with-auth.md` | Need to verify a dashboard page from puppeteer with a provisioned test admin |
| _(coming)_ `recipes/probe-supabase-schema.md` | Need column names / live data shape — `database.types.ts` is stale |
| _(coming)_ `recipes/recover-from-stuck-rebase.md` | `git rebase` half-failed during disk timeout — clean abort + retry |

---

## 📓 Lessons (institutional memory — hard-won)

Every lesson here is something we learned the painful way and never want to repeat. New lessons accumulate after every meaningful session.

See [lessons/](lessons/) for the full set. A few key entries:

- `lessons/slot-triggers-need-all-three-ops.md` — INSERT/UPDATE/DELETE all required, learned from migrations 052/056/061
- `lessons/contact-lives-in-parent-guardian-columns.md` — Don't read `profiles.email`/`phone`, they're empty
- `lessons/visual-verify-mobile-first.md` — Type-check passing ≠ feature works
- `lessons/migrations-must-talk-back.md` — Every migration `RAISE NOTICE`s, every step

---

## Where this library fits in the project

| Layer | Purpose | Audience |
|---|---|---|
| `CLAUDE.md` (repo root) | How to BUILD — stack, security, behavioral rules | Every contributor |
| `AGENT-LEDGER.md` (repo root) | What's TRUE today + what CHANGED — rules, last 5 ships | Every session start |
| `COMPONENT-INDEX.md` (repo root) | Auto-generated index of every component/lib/API route | Search before writing |
| `supabase/migrations/STANDARDS.md` | Migration-specific rules (idempotent, RAISE NOTICE, document the don'ts) | Anyone touching SQL |
| `reference/` (this dir) | Long-form knowledge — bibles, recipes, institutional lessons | Deep dives when needed |
| `~/.claude/projects/.../memory/` | Personal feedback memories for Claude sessions | Auto-loaded per session |

The ledger says "what just happened." The reference library says "here's everything we know about the area you're working in." Both feed the same goal: **don't re-learn what we already paid for.**

---

## How to contribute a lesson

When you (Claude or human) learn something durable:

1. **Draft fast:** drop a markdown file in `pending-lessons/` with a slug name and rough notes. Don't optimize.
2. **Promote when baked:** when the lesson holds across a second occurrence (or is clearly portable), move it to `lessons/` and clean it up.
3. **Link from this README:** add a row to the lessons table above so the next session can find it.
4. **If it's a global pattern** (applies across projects, not just PSP), also propose it for `/Users/primmweb/Desktop/CLAUDE-GLOBAL-LESSONS.md`.

The pattern is borrowed from Diggz's `reference/lessons/` workflow — closed-loop, self-accumulating, lessons travel with the code.

---

_Last meaningful update: 2026-06-03 (initial structure + first 4 lessons ported)._
