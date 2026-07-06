# supabase/migrations/

**The canonical schema baseline is [`../ground-zero.sql`](../ground-zero.sql), not this folder.**

`ground-zero.sql` is a single, fully idempotent SQL file that reproduces the entire current
`public` schema of the live PSP database (46 tables, 167 indexes, 141 RLS policies, 20
functions, 4 views, 23 triggers, RLS + grants). It was generated verbatim from the live DB
via Postgres' `pg_get_*def()` functions and verified by rebuilding on an empty Postgres 17
(clean run + idempotent re-run + byte-identical object-hash diff against live).

## To stand up a database (local, branch, new environment)

Run `ground-zero.sql` on an empty database. That's it — no chain replay.

## History

The historical incremental migration chain (`002`→`061`) lives in
[`_archive_pre_groundzero/`](./_archive_pre_groundzero/). It is retained for provenance
only and is **not** runnable from scratch (it assumed a hand-applied base and had a
duplicate `030`, non-idempotent DDL, and missing grants — see that folder's README).

## Adding new schema changes going forward

1. Add a new numbered migration here (start at `062`), following the idempotency +
   `RAISE NOTICE` conventions in `_archive_pre_groundzero/STANDARDS.md`.
2. Apply it to the live DB.
3. **Regenerate `ground-zero.sql` from the live DB** so the baseline stays current
   (the header of that file documents the generator approach).
