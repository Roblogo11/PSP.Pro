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

### Course access & tiers (revenue-critical)

- **NEVER insert into `course_enrollments` from client code.** The only write path is `POST /api/courses/enroll`, which calls `checkCourseAccess()` (`src/lib/courses/access.ts`) with the service-role client. RLS (migration 062) now rejects athlete self-inserts; only staff roles may insert directly. *Why:* both `courses/page.tsx` and `courses/[slug]/page.tsx` inserted with `payment_status:'free'` straight from the browser, and the old RLS only checked `athlete_id = auth.uid()` — never price or tier. Any logged-in user could enroll in any paid course for free.
- **`courses.required_tier_id` (FK → `membership_tiers`) is what gates a course.** NULL + `price_cents = 0` = genuinely free. Set it on every new paid course or it will be treated as free. The old `included_in_membership` boolean is retained for display but is NOT the access check.
- **`course_lessons` SELECT is gated on enrollment.** It used to be `USING (true)`, which exposed every paid lesson's `video_url` (a NOT NULL column) to any authenticated user regardless of enrollment. `is_preview = true` lessons stay public by design.
- **Migrations must never silently revoke access from real users.** 062 grandfathers existing enrollments on newly tier-gated courses to `payment_status='membership'` rather than deleting them, and only *reports* suspect rows for human review.

### Multi-child parent accounts (data isolation)

- **A parent account holds ONE `athlete_id` shared by every child.** Filtering athlete data on `athlete_id` alone MERGES all of a family's children into one dataset. Any query returning athlete-specific data must also scope by `child_id`. Use `useActiveChild()` (`src/lib/hooks/use-active-child.ts`) to resolve the active child, and pass it through — `useAthleteMetrics(userId, childId)`. *Why:* audited 2026-07-28 — `parent_children`, `active_child_id`, and 3 API routes all existed, but ZERO metric queries referenced `child_id`. Switching the active child changed bookings and nothing else.
- **When a child is active, include `child_id IS NULL` rows too.** Metrics recorded before migration 057 have no `child_id`; filtering strictly would make a family's older history vanish.
- **`children` is a reserved React prop name.** The athlete switcher takes `athletes`, not `children` — `react/no-children-prop` fails the production build (but NOT `tsc --noEmit`).

### Performance metrics (who may write what)

- **Parent-entered metrics are ALWAYS Self-Reported.** Migration 063 adds `entered_by_role` ('coach'|'parent'|'athlete') and a BEFORE trigger that forces `verified=false` for any non-staff writer. Never add a client-side "verified" control for parents.
- **Leaderboards exclude `entered_by_role = 'parent'` outright**, not just via the verified flag. *Why:* the leaderboard reads `custom_metrics?.verified ?? true` — absent means verified — and `verifiedOnly` is OFF by default, so a flag check alone would let self-reported PRs onto the public board.
- **Adding a new metric type needs NO migration.** Add one line to `SPORT_METRICS` in `src/lib/hooks/use-athlete-metrics.ts` with `jsonKey: true`; values live in the `custom_metrics` JSONB. Only add a DB column if you need to sort/filter on it at scale.

### Multi-day events (camps)

- **An event GROUPS per-day `available_slots` rows; it never replaces them.** `available_slots` stays one-row-per-date because the slot-count triggers + hourly pg_cron heal assume that shape. `POST /api/events` creates the event, then one slot per day, and rolls the event back if slot creation fails.
- **Parse date-only strings with an explicit midday time.** `new Date('2026-08-03')` is UTC midnight → renders as Aug 2 in US timezones, so a camp displays starting a day early. `src/lib/events/format.ts` does this correctly — reuse it rather than hand-rolling.

### Chatbot & tours (they go stale silently)

- **Dr. Prop's knowledge base hardcodes prices and service names.** `KNOWLEDGE_BASE` in `src/components/psp-assistant.tsx` is a static array — it does NOT read from `services` / `membership_tiers`. Change a price anywhere and the chatbot keeps quoting the old one to customers with no error, no warning, nothing. *Why this matters:* audited 2026-07-28 and it was quoting membership at **$30/mo** (never a real price — not the old $60, not the new $50), plus six services and three session packages that exist in NO table. **Any pricing change must include a grep of this file.**
- **Verify chatbot prices against the DB, not against memory.** `services` (7 active, $30–$150) and `membership_tiers` are the truth. `packages` and `training_packages` return 400 — they aren't real tables, so never quote packages.
- **`KBEntry.role` has no `'admin'` value** — it's `'all' | 'athlete' | 'coach' | 'visitor'`, and admins resolve to `'coach'`. An entry tagged `'athlete'` is invisible to logged-out visitors; leave `role` unset for anything the public must see. Match threshold is `score >= 2`, so give new entries distinctive multi-word keywords.
- **Tour steps live ONLY in `PAGE_TOURS` in `src/components/tour-hud.tsx`**, keyed by exact pathname. `highlight: 'x'` resolves via `document.querySelector('[data-tour="x"]')`. Add a step and you must add the matching `data-tour` attribute, or the step silently spotlights nothing.
- **Check for orphans after touching tours:** compare `grep -o "highlight: '[^']*'" src/components/tour-hud.tsx` against `grep -rho 'data-tour="[^"]*"' src/`. Should be zero diff.
- **`src/lib/tour/track.ts` `TOUR_PAGES` is a hand-maintained mirror** of the `PAGE_TOURS` keys and uses PREFIX matching while `PAGE_TOURS` uses exact matching — so `/courses/<slug>` advertises a tour that never renders. Keep both lists in sync when adding a tour.

### Auth & roles (don't break these)

- **Membership gating** lives in `src/app/(dashboard)/layout.tsx`. Open routes (any auth user): `/booking`, `/sessions`, `/locker`, `/settings`, `/guide`, `/leaderboards`. Member-only (active package): `/progress`, `/drills`, `/achievements`, `/video-analysis`, `/courses`, `/questionnaires`, `/progress-report`. Staff (`coach`/`admin`/`master_admin`) bypass all checks.
- **RLS rule: NEVER reference the same table from its own policy.** Migration 029 fixed this — profiles SELECT is `USING (true)`, profile data is readable by all. Modify-policies use `id = auth.uid()`. *Why:* the original recursive policy caused infinite recursion and 500s on every dashboard page.
- **Service role key bypasses RLS.** All server-side files use `createAdminClient()` from `@/lib/supabase/admin` for profile/role queries. API routes use it directly. Layouts use try/catch fallback. Never expose service role key client-side.
- **Master admin Simulation vs Impersonation are mutually exclusive.** Simulation = act as role, can write (track via `simulation_data_log` for one-click cleanup). Impersonation = view as user, read-only (write buttons hidden + JS guards). Cookies: `simulation_role_ui` (4hr) and `impersonation_user_id` (2hr).

### CSS specificity (the homepage trap)

- **Global text rule in `@layer base` forces `color: slate-700 !important` on `p, span, li, small, label` in light mode.** Span rule has specificity (0,6,2) due to 5 `:not([class*="..."])` selectors.
- **ALWAYS scope homepage overrides to `.home-page`** — global overrides WILL break the dashboard. Homepage cards (`.glass-card`) get dark bg on light mode (text=white). Dashboard `command-panel` gets LIGHT bg on light mode (text=dark).
- **Never add global `command-panel` text overrides.** Always scope to specific routes or use the local card class.

### Migrations & schema (ground-zero is now the baseline)

- **`supabase/ground-zero.sql` is the canonical schema source of truth.** One idempotent file that rebuilds the ENTIRE `public` schema (46 tables, 167 indexes, 141 policies, 20 functions, 4 views, 23 triggers, RLS + grants) on an empty DB. Generated verbatim from the live DB via Postgres `pg_get_*def()`; verified 2026-07-06 by rebuilding on empty Postgres 17 (clean + idempotent) with every object hash byte-identical to live. To stand up any DB (local/branch/new env), run this — no chain replay. *Why:* the old `002`→`061` chain couldn't rebuild from zero (missing `001` base, dup `030`, bare DDL, no grants); the live DB had no migration ledger (hand-applied via SQL Editor). This was PSP's "patch-on-patch, not truly healed" state.
- **After any new schema change: regenerate `ground-zero.sql` from live** so the baseline stays current. New changes go as a numbered migration (start at `062`) on top of ground-zero, then regenerate.
- **The historical `002`→`061` chain is archived** at `supabase/migrations/_archive_pre_groundzero/` (with `STANDARDS.md`). Retained for provenance only — NOT runnable from scratch. Don't resurrect it.
- **Every migration must `RAISE NOTICE`, be idempotent, and start with a `⚠ if you touch X, you must Y` block.** Full rules in `_archive_pre_groundzero/STANDARDS.md`. Idempotent = `CREATE OR REPLACE`, `IF NOT EXISTS`, `DROP … IF EXISTS; CREATE …`, `DO $$ IF NOT EXISTS (pg_constraint) $$` for constraints. Safe to re-run. Migration 061 (in archive) is the reference implementation.
- **Generated column gotcha:** `athlete_packages.sessions_remaining` is `GENERATED ALWAYS AS (sessions_total - sessions_used) STORED` — NOT a default. `information_schema.column_default` misreports generated columns; always check `is_generated`/`generation_expression`. It's the only generated column in the schema.
- **Extensions live in the `extensions` schema** (`uuid_generate_v4`, etc.); the DB `search_path` is `"$user", public, extensions`. ground-zero.sql sets this so unqualified extension calls resolve on any DB.

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

### `f8681cf` — 2026-07-28 — DEPLOYED: client fix list #1–#8 live on propersports.pro

Shipped and verified against **production**, not just locally:

- **Elite membership $60 → $50** (client's latest instruction). Both sides moved: DB `price_cents`, a NEW Stripe price (`price_1TyKlR…`, objects are immutable), made product default, old $60 archived, `stripe_price_id` repointed. `propersports.pro/memberships` renders $50, no $60 anywhere. Safe — 0 subscriptions existed in either system, so no bill changed.
- **Course leak closed in prod**: browser-key enroll into a paid course → `401`; browser-key read of non-preview lesson `video_url` → `[]`.
- **Mobile menu fixed in prod**: 3 nav cycles on a 390×844 viewport, sheet reopens each time, no refresh. Rachel's repro no longer reproduces.
- `/api/events` responding 200.

**Known pre-existing noise (NOT from this work):** the dashboard logs `406` from Supabase on `bookings`/`athlete_packages` for accounts with no rows — `.single()` on an empty result. Cosmetic; worth converting to `.maybeSingle()` in a future pass.

**Known real issue, deliberately not fixed here:** every dashboard page renders empty then fetches client-side (`useEffect` → `fetch` → `setState`), so users see skeleton-then-content on every navigation ("double loading"). Fixing it means converting pages to server components — touches every dashboard page, deserves its own focused pass rather than a late-session change to a live app.

### (pending) — 2026-07-28 — Client fix list: features #4–#8

**Files:** migrations `063_parent_metric_entry.sql`, `064_multi_day_events.sql`, `065_group_chat.sql` (all applied + verified live); `src/lib/hooks/use-active-child.ts`, `src/lib/events/format.ts`, `src/components/parent/athlete-switcher.tsx`, `src/components/parent/log-data-point.tsx`, `src/components/events/event-form.tsx`, `src/components/events/upcoming-events.tsx`, `src/app/api/events/route.ts`, `src/app/api/messages/group/route.ts` (all new); plus progress/messages/booking/availability/leaderboards pages and `use-athlete-metrics.ts`.

Recon changed the scope of two items before any code was written:

**#6 was already built.** All four metric types Rachel requested (pitch velocity + 6 pitch types, overhand throw velocity, baserunning times, catcher pop time) already existed among 71 definitions in `SPORT_METRICS`. The `custom_metrics` JSONB means new types need no migration — her "more types are coming" was already satisfied. Added `home_to_second` and `first_to_third` splits for completeness.

**#5 was half-built.** Coaches already had a full entry form + Quick Log modal, with `recorded_by`/`test_date` tracking. The missing half was PARENTS, blocked by RLS (metrics INSERT was staff-only). Migration 063 adds parent INSERT/UPDATE scoped to their own `athlete_id`, plus a trigger forcing `verified=false`, plus a structural leaderboard exclusion.

**#7 audit found the real bug.** `parent_children`, `active_child_id` and 3 parent API routes all existed — but no metric query filtered on `child_id`, so switching the active child changed bookings and nothing else; both children's numbers merged into one chart. Fixed via `useActiveChild()` + a `childId` parameter on `useAthleteMetrics`, and surfaced a switcher on the progress page (previously buried in Settings).

**#4 multi-day events** are a new `events` table grouping per-day slots (verified live: 3-day camp → 3 linked slots, reversed range rejected 400, cascade delete clean). **#8 group chat** extends the existing N-participant `conversations` model with `is_group`/`title`/`created_by` and the participant DELETE policy that was missing entirely.

### (pending) — 2026-07-28 — Course tier access control + mobile menu fix

**Files:** `supabase/migrations/062_course_tier_access_control.sql` (new), `src/lib/courses/access.ts` (new), `src/app/api/courses/enroll/route.ts` (new), `src/app/(dashboard)/courses/page.tsx`, `src/app/(dashboard)/courses/[slug]/page.tsx`, `src/components/layout/sidebar.tsx`

Client's fix list, bugs first. Audited before writing code — the classification changed two of the three reported bugs.

**Course access leak (real, critical).** Both course pages inserted `course_enrollments` client-side with `payment_status:'free'`; RLS only checked `athlete_id = auth.uid()`, never price or tier. Any logged-in user could enroll in any paid course for free. Second exposure found in the same audit: `course_lessons_select` was `USING (true)`, so every paid lesson's `video_url` was readable by any authenticated user even without enrollment. Fix: `courses.required_tier_id` FK, server-only enrollment route, `checkCourseAccess()` as the single source of truth, and both RLS policies tightened. Blast radius checked first — all 23 live enrollments are on $0 courses, so nobody was actively exploiting it; the door was open but unused. Existing enrollments on newly-gated courses are grandfathered, never revoked.

**Stripe "price mismatch" (NOT a bug).** Audited all live Stripe prices against the DB: they match ($60 Elite, $150 clinic/camp). The "low" charges Rachel saw — $63, $76.50, $27 — are exactly 90% of $70/$85/$30: the Elite 10% discount working correctly. Discounts are computed in app code (`checkout/route.ts`) and passed as a raw amount, so Stripe's dashboard shows list price while receipts show discounted price. That gap is what read as a mismatch. **Doing the requested "sync" would have silently disabled the Elite discount for every paying member.** No code change made.

**Mobile menu (real).** The More sheet closed only via per-link `onClick`, which fires before client-side navigation completes. On a slow route the sheet stayed mounted mid-transition and its drag layer (`touchAction:'none'` + open `dragControls` pointer capture) kept swallowing taps after it visually disappeared — menu worked once, then dead until reload. Fix: close on `pathname` change, plus release implicit pointer capture in `onPointerDown`.

### `0f94f9d` — 2026-07-06 — Schema "ground zero": one consolidated, verified baseline

**Files:** `supabase/ground-zero.sql` (new, ~2460 lines), `supabase/migrations/_archive_pre_groundzero/` (60 migrations + STANDARDS.md moved here), `supabase/migrations/README.md` (new), archive `README.md` (new)

PSP's migration chain couldn't rebuild itself from zero — it started at `002` assuming six base tables no migration ever created, plus a duplicate `030`, ~16 bare non-idempotent `CREATE INDEX`, and zero role grants. The live DB worked only because it held an accreted, hand-applied state (no migration ledger — `supabase_migrations.schema_migrations` doesn't exist). That was the "patch-on-patch, not truly healed" problem.

Built `supabase/ground-zero.sql`: a single, fully idempotent file that reproduces the ENTIRE live `public` schema in one pass. Generated verbatim from the live DB via Postgres `pg_get_*def()` (no hand-authoring, no guessing): 46 tables, 204 constraints, 167 indexes, 141 RLS policies, 20 functions, 4 views, 22 public triggers + 1 auth.users trigger, 1 event trigger, RLS on all tables, grants. Section order is FK-safe; every statement `IF NOT EXISTS` / `CREATE OR REPLACE` / `DROP…IF EXISTS; CREATE`.

Verified without touching prod: rebuilt on an empty local Postgres 17 twice (clean run + idempotent re-run, 0 errors), then hashed every object class and diffed against live — **all seven hashes byte-identical** (tables/constraints/indexes/policies/functions/triggers/views). Caught two real portability bugs along the way: extension calls needed `extensions` on search_path, and `sessions_remaining` is a GENERATED column that `information_schema` misreported as a DEFAULT.

Old `002`→`061` chain archived under `_archive_pre_groundzero/` for provenance. Going forward: new numbered migrations start at `062` on top of ground-zero, then regenerate the baseline from live.

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

---

## 3. Historical Index

Compressed older ships (one-line each, oldest at bottom):

- `f77c524` (2026-05-27) — Athlete contact info surfaced (read `parent_guardian_*`, not empty `email`/`phone`) + messaging search/deep-link fixes
- `7774a5e` (2026-05-22) — Coach image library reference doc (`docs/coach-image-library.md`, 70 CDN images)
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
