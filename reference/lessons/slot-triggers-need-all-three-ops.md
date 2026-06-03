# Lesson: Slot count triggers MUST cover INSERT, UPDATE, AND DELETE

**Status:** Locked. 2026-06-03 (migration 061).
**Pain history:** Lived broken across migrations 052, 056. Cost Rachel weeks of "phantom full" slots before we caught it.

## The fact

The function `recalculate_slot_availability()` (in `supabase/migrations/061_slot_recalc_on_insert_and_periodic_heal.sql`) is the single source of truth for keeping `available_slots.current_bookings` in sync with the `bookings` table. It must be wired to **all three** trigger ops on `bookings`:

- `AFTER INSERT` → `on_booking_inserted`
- `AFTER UPDATE OF status, slot_id` → `on_booking_status_change`
- `AFTER DELETE` → `on_booking_deleted`

If any one is missing, drift accumulates silently and surfaces as either "slot stays full after cancel" (missing DELETE) or "slot looks empty but it's really booked" (missing INSERT) or "slot count never catches up to reality" (missing UPDATE).

## How the bug happened (and why we want it preserved)

1. Migration 052 (Apr 2026) introduced `recalculate_slot_availability()` to fix the drift caused by old `±1` increment/decrement triggers. It wired only `AFTER UPDATE OF status` — UPDATE was the cancellation path being fixed.
2. Same patch removed manual `current_bookings + 1` calls from `admin/create-booking` and `bookings/pay-on-site` routes, on the (correct) reasoning that the trigger was now the source of truth. But the migration never added the INSERT trigger.
3. Migration 056 (May 2026) added `AFTER DELETE`, didn't add `AFTER INSERT`.
4. For ~5 weeks, every new booking left `current_bookings` stale. Drift only manifested when athletes cancelled — by then the count was already wrong from intervening creates.
5. Rachel reported "calendar shows slot full but no one's booked there." Migration 061 added INSERT trigger + a hourly pg_cron self-healing recalc.

## The guardrail (so this can't quietly come back)

Migration 061 schedules `recalculate_all_slot_counts()` via `cron.schedule('psp-recalc-slot-counts', '0 * * * *', ...)`. Every hour at :00, every upcoming slot's count is recomputed from the live `bookings` table.

**Even if a future migration accidentally drops a trigger, drift can't persist > 60 minutes.** That's the lesson made structural.

To verify the cron job is alive:
```sql
SELECT jobname, schedule, command FROM cron.job WHERE jobname = 'psp-recalc-slot-counts';
```

To run a manual recalc:
```sql
SELECT recalculate_all_slot_counts();
```

## ⚠ If you touch slot triggers in a future migration

You **MUST** include INSERT, UPDATE, and DELETE branches in the function AND wire all three triggers. The migration 061 file starts with a ⚠ comment block stating exactly this — read it before touching `recalculate_slot_availability()`. The pg_cron job is a guardrail, not an excuse to ship a broken trigger.

## Related

- Migration 052 — original recalculate function (INSERT missing)
- Migration 056 — re-asserted UPDATE+DELETE, INSERT still missing
- Migration 061 — current correct version with all three + pg_cron
- `supabase/migrations/STANDARDS.md` — the rules that prevent this pattern from happening again across all future migrations
