# Lesson: Every PSP migration must talk back

**Status:** Locked. 2026-06-03 (`supabase/migrations/STANDARDS.md`).
**Pain history:** Migration 052 silently shipped without an INSERT trigger because Supabase's "Success. No rows returned" gave no signal. Bug lived undetected for 5 weeks.

## The rule

Every migration in `supabase/migrations/` must follow the three rules in `supabase/migrations/STANDARDS.md`:

1. **`RAISE NOTICE` every step.** Including row counts (`GET DIAGNOSTICS n = ROW_COUNT`), what was created, what was skipped, and a final `━━━ Migration NNN complete ━━━` summary block. Supabase SQL Editor shows these in the **Messages** tab below the results.
2. **Idempotent every statement.** `CREATE OR REPLACE FUNCTION`, `IF NOT EXISTS`, `DROP TRIGGER IF EXISTS … ; CREATE TRIGGER …`, `ON CONFLICT DO UPDATE`, backfills guarded with `WHERE col IS NULL`. Re-running the migration must be a no-op.
3. **`⚠ if you touch X` block at the top.** Documents the lesson the next dev needs to know. The slot-drift bug came back twice because the lesson lived in chat, not in the file.

## Why "Success. No rows returned" is the enemy

Supabase's SQL Editor returns that string for any statement that completes without a SELECT result — including silently broken trigger registrations, DDL that succeeded but didn't do what you expected, and `DO $$ … END $$` blocks where the body never ran.

Without RAISE NOTICE output, you can't tell whether the migration:
- Did everything you intended
- Did half of it and exited cleanly on a guard
- Did nothing because the `IF EXISTS` check matched a pre-existing wrong version

The Messages tab is where the truth lives. Make migrations populate it.

## The reference implementation

`supabase/migrations/061_slot_recalc_on_insert_and_periodic_heal.sql` is the canonical example. Read it before writing any new migration. Notable patterns:

- Drift count measured BEFORE recalc and reported, so you know how much you fixed
- pg_cron scheduling wrapped in `EXCEPTION WHEN OTHERS` so the migration succeeds even if pg_cron isn't available (with a clear NOTICE saying so)
- Final summary block enumerates what's now true ("Triggers wired, guardrail running, here's how to recalc manually")

## The template

Copy from `supabase/migrations/STANDARDS.md` (it has a working template at the bottom). Skeleton:

```sql
-- Migration NNN: <one-line description>
--
-- The problem this fixes:
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- <symptom, root cause, what changed>
--
-- ⚠ If you touch <thing> in a future migration:
--   <constraint that, if violated, will recreate the bug>
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ── Step 1: <what> ──
<idempotent statement>;
DO $$ BEGIN RAISE NOTICE '✓ Step 1 done — <specifics>'; END $$;

-- ── Step 2: <data op> ──
DO $$
DECLARE n INTEGER;
BEGIN
  <statement>;
  GET DIAGNOSTICS n = ROW_COUNT;
  RAISE NOTICE '✓ Step 2 done — touched % row(s)', n;
END $$;

-- ── Summary ──
DO $$ BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✓ Migration NNN complete — <what to expect now>';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
```

## Where the messages go in Supabase Editor

After clicking **Run**, the Messages tab is below the Results tab. If you see "Success. No rows returned" and that's all, click Messages. NOTICE output appears there, one line per RAISE NOTICE, in execution order.

If a user reports "I ran the migration but nothing seemed to happen" — first question is "what's in the Messages tab?" Most of the time the migration ran fine and they just didn't look.

## Related

- `supabase/migrations/STANDARDS.md` — the full standards doc with all three rules + template
- `supabase/migrations/061_slot_recalc_on_insert_and_periodic_heal.sql` — reference implementation
- `lessons/slot-triggers-need-all-three-ops.md` — the specific bug class this rule was created to prevent
