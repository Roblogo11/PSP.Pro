# PSP.Pro Migration Standards

> Every migration in this folder must follow these rules. They exist because we
> hate "Success. No rows returned." and because past bugs (slot drift, RLS
> recursion, double-counting) all came from migrations that *looked* successful
> but silently did the wrong thing.

## The Three Rules

### 1. Tell us what you did — always use `RAISE NOTICE`

Supabase SQL Editor shows `NOTICE` output in the **Messages** tab. Use it. A
migration with no notices reads as "did nothing" to a future human.

Every migration must `RAISE NOTICE` for:
- ✓ Each major step that completed (function created, trigger wired, data migrated)
- 📊 Counts of rows touched (`GET DIAGNOSTICS rows = ROW_COUNT`)
- ⚠ Anything skipped or that fell back to a default
- ━━━ A final summary line so you know the migration ran end-to-end

**Pattern:**
```sql
DO $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE my_table SET x = y WHERE z;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RAISE NOTICE '✓ Updated % row(s) in my_table', affected;
END $$;
```

**Emoji legend (consistent across migrations):**
- `✓` = step completed
- `📊` = a number you'd want to know
- `⚠` = soft failure / fallback / something to keep an eye on
- `━━━` = section boundary or final summary

### 2. Make every step idempotent — safe to run twice

Migrations get re-run during recovery, branch comparison, or when a junior dev
copy-pastes the file by mistake. Every statement must survive a second run
without erroring or doubling work.

| Goal | Use this | Not this |
|---|---|---|
| Create table | `CREATE TABLE IF NOT EXISTS` | `CREATE TABLE` |
| Create function | `CREATE OR REPLACE FUNCTION` | `CREATE FUNCTION` |
| Create trigger | `DROP TRIGGER IF EXISTS … ; CREATE TRIGGER …` | bare `CREATE TRIGGER` |
| Add column | `ADD COLUMN IF NOT EXISTS` | `ADD COLUMN` |
| Add policy | `DROP POLICY IF EXISTS … ; CREATE POLICY …` | bare `CREATE POLICY` |
| Backfill | gate with `WHERE col IS NULL` (or similar) | unconditional `UPDATE` |
| Schedule cron | unschedule first, then schedule | bare `cron.schedule()` |

### 3. Document the *why* at the top — and the *don'ts* for future devs

Past bug pattern: migration 052 fixed slot counts but only wired UPDATE/DELETE,
not INSERT. A later dev (us!) had to figure that out from symptoms. Could've
been prevented with a 3-line warning in the migration header.

Every migration starts with:
```sql
-- Migration NNN: <one-line description>
--
-- The problem this fixes:
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- <2–5 sentences on the symptom, root cause, and what changed>
--
-- ⚠ If you touch <thing> in a future migration:
--   YOU MUST <constraint that, if violated, will recreate the bug>
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The ⚠ block is where you put **the lesson that, if forgotten, will re-create
this bug**. Slot triggers must cover INSERT/UPDATE/DELETE. RLS policies on
`profiles` must not reference `profiles` (infinite recursion). Etc.

## Template — copy this to start a new migration

```sql
-- Migration 062: <one-line description>
--
-- The problem this fixes:
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- <symptom, root cause, what changed>
--
-- ⚠ If you touch <thing> in a future migration:
--   <constraint>
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


-- ── Step 1: <what> ──
<idempotent statement>;
DO $$ BEGIN RAISE NOTICE '✓ Step 1 done — <specifics>'; END $$;


-- ── Step 2: <what> ──
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

## See in action

Migration 061 (`061_slot_recalc_on_insert_and_periodic_heal.sql`) is the
reference implementation — copy its structure.

## Why this matters (the heal philosophy)

The slot-count drift bug existed for *months* across 3 migrations (052, 056, 061)
because each fix only patched the visible symptom. The real fix is making bugs
**impossible to silently introduce**:
- `RAISE NOTICE` makes "did it actually run?" visible at a glance
- Idempotent statements make recovery trivial
- The ⚠ header preserves hard-won knowledge in the place a future dev will look

If you're adding a migration and you can't follow this template, that's a
signal to ask before merging.
