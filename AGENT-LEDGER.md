# PSP.Pro Agent Ledger

> The source of truth I read every session. Three sections:
> (1) **Rules** — always-true, hard-learned. Never rot.
> (2) **Recent Ships** — last 5 major updates at full fidelity.
> (3) **Historical Index** — everything older, compressed to one line each.
>
> When a 6th ship lands, the oldest of the current 5 gets compressed to one line
> and moved to the index. File stays under ~400 lines forever.
>
> **Auto-update rule:** After any shipping commit, this file gets the new entry in
> the same workflow as the push. The push isn't done until the ledger reflects it.

---

## 1. Rules — Permanent

These exist because we hit the pain first. Each rule leads with the fact, then `Why` so future-me can judge edge cases.

### Booking slots & triggers (load-bearing — the heart of PSP)

- **Slot-count triggers MUST cover INSERT, UPDATE, AND DELETE.** `recalculate_slot_availability()` in `supabase/migrations/061_slot_recalc_on_insert_and_periodic_heal.sql` is the source of truth. If you touch slot triggers in a future migration, all three operations must be wired or `current_bookings` will silently drift. *Why:* migrations 052 and 056 only wired UPDATE+DELETE; every new booking left `current_bookings` stale until cancelled. Rachel saw "slot full but no one on calendar." Documented at the top of migration 061.
- **DO NOT manually increment `current_bookings` in API routes.** The BEFORE INSERT trigger handles it. Manual increments cause double-counting. Routes `admin/create-booking`, `bookings/pay-on-site`, and `create-booking-from-session` were all unified to trust the trigger. *Why:* the historical bug was each route incrementing AND the trigger incrementing = +2 per booking.
- **pg_cron `psp-recalc-slot-counts` runs hourly** as a guardrail. Even if a future migration breaks a trigger, drift can't persist > 60 min. To check: `SELECT * FROM cron.job WHERE jobname = 'psp-recalc-slot-counts';`. Manual recalc: `SELECT recalculate_all_slot_counts();`.
- **`available_slots` columns: `slot_date` (not `date`), `max_bookings`, `current_bookings`, `is_available`.** Booking statuses: `confirmed`, `pending`, `cancelled`, `completed`, `no-show`. The recalc trigger counts ONLY `('confirmed','pending')` as active — `completed` does not free the slot.

### Profiles & contact data (where the data ACTUALLY lives)

- **Contact info lives in `parent_guardian_email` / `parent_guardian_phone` / `parent_guardian_name`** — NOT in `email`/`phone`/`parent_email`/`parent_phone`. Coverage: parent_guardian_email 73/112 filled, phone 30/112, name 73/112. The `email`/`phone` columns are nearly empty (`4/112` and `0/112` respectively). When showing contact in any UI, read parent_guardian_* with fallback to account email/phone. Update via `/api/admin/update-athlete`. *Why:* historical schema drift — old types file shows `parent_email` but real data lives in `parent_guardian_*`. The athlete detail page used to read empty columns and show nothing.
- **`database.types.ts` is stale and incomplete.** It lists 7 profile columns; reality has 45+. Never trust it for schema questions — `grep -r 'ADD COLUMN' supabase/migrations/` or query Supabase directly with the service_role key in `.env.local`.

### Auth & roles (don't break these)

- **Membership gating** lives in `src/app/(dashboard)/layout.tsx`. Open routes (any auth user): `/booking`, `/sessions`, `/locker`, `/settings`, `/guide`, `/leaderboards`. Member-only (active package): `/progress`, `/drills`, `/achievements`, `/video-analysis`, `/courses`, `/questionnaires`, `/progress-report`. Staff (`coach`/`admin`/`master_admin`) bypass all checks.
- **RLS rule: NEVER reference the same table from its own policy.** Migration 029 fixed this — profiles SELECT is `USING (true)`, profile data is readable by all. Modify-policies use `id = auth.uid()`. *Why:* the original recursive policy caused infinite recursion and 500s on every dashboard page.
- **Service role key bypasses RLS.** All server-side files use `createAdminClient()` from `@/lib/supabase/admin` for profile/role queries. API routes use it directly. Layouts use try/catch fallback. Never expose service role key client-side.
- **Master admin Simulation vs Impersonation are mutually exclusive.** Simulation = act as role, can write (track via `simulation_data_log` for one-click cleanup). Impersonation = view as user, read-only (write buttons hidden + JS guards). Cookies: `simulation_role_ui` (4hr) and `impersonation_user_id` (2hr).

### CSS specificity (the homepage trap)

- **Global text rule in `@layer base` forces `color: slate-700 !important` on `p, span, li, small, label` in light mode.** Span rule has specificity (0,6,2) due to 5 `:not([class*="..."])` selectors.
- **ALWAYS scope homepage overrides to `.home-page`** — global overrides WILL break the dashboard. Homepage cards (`.glass-card`) get dark bg on light mode (text=white). Dashboard `command-panel` gets LIGHT bg on light mode (text=dark).
- **Never add global `command-panel` text overrides.** Always scope to specific routes or use the local card class.

### Migrations (see `supabase/migrations/STANDARDS.md` for full)

- **Every migration must `RAISE NOTICE` what it did.** Supabase's silent "Success. No rows returned" hides whether anything happened. Use `DO $$ ... GET DIAGNOSTICS n = ROW_COUNT; RAISE NOTICE '✓ touched % rows', n; END $$`. Migration 061 is the reference implementation.
- **Every migration must be idempotent.** `CREATE OR REPLACE FUNCTION`, `IF NOT EXISTS`, `DROP TRIGGER IF EXISTS … ; CREATE TRIGGER …`. Safe to re-run during recovery or branch comparison.
- **Every migration starts with a `⚠ if you touch X, you must Y` block** at the top. Past bugs (slot drift, RLS recursion) came back because the lesson lived in chat, not in the file. Standards doc enforces this.
- **Two files share migration prefix `030` — known issue (`030_leaderboard_opt_in.sql` and `030_fix_profiles_rls.sql`).** Migration order is alphabetical, so RLS fix runs second. Don't rename without testing.

### Working style (deeply held)

- **Heal, don't just patch.** Every non-trivial fix needs a guardrail/standard/self-healing layer so the bug class can't quietly come back. Documented in `feedback_heal_dont_just_patch.md`.
- **Read the user's literal words before designing the fix.** "Online" = athlete view, "calendar" = coach view. Pattern-matching to the most architecturally-interesting cause wastes rounds.
- **Visual verify mobile-first via screenshot.** Type-check passing ≠ feature works. Render the page with headless Chrome, `Read` the PNG. Mobile 390×844 first, desktop second.
- **`npm run build` before pushing to main.** Vercel's production build runs stricter type-check than `tsc --noEmit`. Catches errors that bypass local typecheck.
- **Never broad-pkill (`pkill -f node` etc.) — kills VS Code, real Chrome, Claude itself.** Always `ps aux | grep` first, kill by specific PID. `lsof -ti:3000 | xargs kill` for dev servers.
- **Long-lived dev servers need `setsid nohup ... & disown`** — bare `&` gets reaped when the tool call returns.
- **Git timeouts on macOS are usually Time Machine, not Claude sessions.** Check `ps aux | sort -nrk 3` before retrying.

---

## 2. Recent Ships

### `204b97e` — 2026-06-03 — Coach calendar surfaces empty/group slots

**Files:** `src/app/(dashboard)/admin/bookings/page.tsx` (+187 lines)

The calendar view at `/admin/bookings` only rendered rows from the `bookings` table — empty group slots existed only as `available_slots` rows and were invisible. Rachel saw her scheduled clinic times as blank on her own calendar.

Added a "Today's Schedule" panel at the top that merges today's slots + bookings sorted by time, with GROUP badges and "X of Y booked, Z spots open" for unbooked clinics. Mini-calendar dots: orange ring on dates with empty group slots, cyan ring on empty 1-on-1 slots. Legend extended. Fetches upcoming slots alongside bookings with the same coach scope.

Companion to `997141b` (athlete-side fix). Both close out Rachel's "I can't see my group sessions" concern.

### `efe12f7` — 2026-06-03 — Migration NOTICE feedback standard + 061 retrofit

**Files:** `supabase/migrations/STANDARDS.md` (new, 130 lines), `supabase/migrations/061_slot_recalc_on_insert_and_periodic_heal.sql` (+48 lines)

Every migration should tell us what it did, not return "Success. No rows returned." Past slot-drift bug existed across 3 migrations partly because each one ran "successfully" with no visible signal of what was missing.

Retrofitted 061 with `RAISE NOTICE` blocks: each step reports what it touched, drift count is measured before recalc and printed, pg_cron success/skip is logged, final summary block confirms the migration ran end-to-end. Added `supabase/migrations/STANDARDS.md` codifying three rules: always RAISE NOTICE, always idempotent, always document the don'ts at the top. Copy-paste template for new migrations included.

### `997141b` — 2026-06-03 — Group sessions visible + slot-count drift permanently healed

**Files:** `src/components/booking/tonight-available.tsx` (new), `src/app/(dashboard)/booking/page.tsx`, `supabase/migrations/061_slot_recalc_on_insert_and_periodic_heal.sql` (new)

Two bugs Rachel reported, shared root cause in slot system.

Bug 1: athletes had to pick the exact right service to see group session slots — they were never surfaced. Fix: new "Available Tonight" panel on `/booking` that surfaces today's open sessions across ALL services, with group sessions highlighted and spots-remaining shown.

Bug 2: coach schedule said "slot full" but calendar showed no athlete. Root cause: migrations 052/056 wired `recalculate_slot_availability()` to UPDATE+DELETE but NOT INSERT, while every booking route had been updated to trust the trigger (to stop double-counting). Result: creating a booking silently failed to update `current_bookings`, drift accumulated.

Fix (migration 061, applied via Supabase SQL editor): extend recalc function to handle INSERT, add AFTER INSERT trigger, one-time recalc of every upcoming slot, AND pg_cron schedules `recalculate_all_slot_counts()` every hour as a self-healing guardrail. Even if a future migration breaks a trigger again, drift can't persist > 60 min.

### `f77c524` — 2026-05-27 — Athlete contact info surfaced + in-app messaging fixes

**Files:** `src/app/(dashboard)/admin/athletes/[id]/page.tsx`, `src/app/(dashboard)/messages/page.tsx`, `src/app/api/admin/update-athlete/route.ts`

Rachel reported: blank contact info on athlete profiles AND couldn't message Lauren Long.

Root cause: page read `profiles.email/phone` (almost entirely empty across 112 athletes — 4/112 and 0/112 respectively). Real contact lives in `parent_guardian_email`/`phone` (73/112 and 30/112). Page now reads parent_guardian_* with fallback, labels it "Parent/Guardian Contact," shows "No contact on file — add" prompt when empty.

Messaging fix: coach new-chat list was capped at 50 names alphabetically with no search — Lauren (L) fell outside the cap. Added a search box, dropped the cap, made child_name show for parent accounts, and added `/messages?to=<id>` deep-link. Athlete profile page now has a "Message" button that uses the deep-link.

Update-athlete API extended to persist `parent_guardian_phone/email/name` so the Edit modal writes to the columns the page reads.

### `7774a5e` — 2026-05-22 — Coach image library reference doc

**Files:** `docs/coach-image-library.md` (new)

Documented all 70 images Rachel uses for marketing across Supabase CDN. Categories: Featured (1), Soccer Training (23), Softball Pitching (37), and site hero/feature shots. Each entry has a clickable public URL ready to drop into an email blast.

---

## 3. Historical Index

Compressed older ships (one-line each, oldest at bottom):

- `9d43a86` (2026-05-18) — Stop drill edit modal from horizontal-scrolling on mobile
- `ee36854` (2026-05-18) — Fix individually-created drill videos: write `video_url`, not `youtube_url`
- `b8237cd` (2026-05-18) — Revert middleware consolidation (e439c15)
- `e439c15` (2026-05-18) — (reverted) Consolidate middleware: merge CSP/security headers into `src/middleware.ts`
- `8229681` (2026-05-18) — Allow youtube-nocookie.com in CSP `frame-src`
- Migrations 049–060 — see `supabase/migrations/` (parent_guardian fields, multi-child parent accounts, slot recalc fixes, blog image extensions, drill video URL backfill)
- Migration 052 — replaced slot increment/decrement triggers with recalculate-on-change approach (drift-immune for UPDATE/DELETE; INSERT was missed — fixed in 061)
- Migration 040–041 — Organizations + Stripe Connect base
- Migration 027 — Master admin simulation mode tables

---

_Update this file on every shipping commit. When section 2 grows past 5, compress the oldest into section 3. Keep it under 400 lines forever._
