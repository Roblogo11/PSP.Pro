# Archived migration chain (pre-ground-zero)

These 60 numbered migrations (`002` → `061`) plus `STANDARDS.md` are the **historical**
migration chain that built the PSP schema incrementally. They are **no longer the rebuild
path** and should not be run to stand up a new database.

## Why they were archived

- The chain **could not rebuild itself from zero**: it started at `002` and assumed six
  base tables (`profiles`, `drills`, `assigned_drills`, `sessions`, `drill_completions`,
  `velocity_logs`) that no migration ever created — the original bootstrap was only ever
  applied by hand to the live cloud DB. There was also a duplicate `030`, ~16 non-idempotent
  bare `CREATE INDEX` statements, and no role `GRANT`s. On a fresh Postgres it died at
  `002`.
- The live PSP DB has **no migration ledger** (`supabase_migrations.schema_migrations`
  does not exist) — migrations were applied by hand via the SQL Editor. So there was no
  automated replay of these files anyway.

## What replaced them

**`../../ground-zero.sql`** — a single, fully idempotent, catalog-derived baseline that
reproduces the ENTIRE current `public` schema (46 tables, 167 indexes, 141 RLS policies,
20 functions, 4 views, 23 triggers, RLS on all tables, grants). It was generated verbatim
from the live DB via Postgres' `pg_get_*def()` functions and verified by rebuilding on an
empty Postgres 17 twice (clean run + idempotent re-run).

## Going forward

- To stand up a new/local/branch database: run `supabase/ground-zero.sql` on an empty DB.
- New schema changes: add a new numbered migration **on top of** ground-zero, following the
  idempotency + `RAISE NOTICE` rules in `STANDARDS.md` (kept here for reference). After it's
  live, regenerate `ground-zero.sql` from the live DB so the baseline stays current.
- These files are retained only for provenance / archaeology. Do not run them.
