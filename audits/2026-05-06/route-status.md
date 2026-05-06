# PSP.Pro Route Status Tracker — 2026-05-06

Last updated after audit pass 3. Use this as a checklist for future MCP-driven re-verification.

**Status legend**: 🟢 pass · 🟡 polish needed · 🔴 broken · ⏳ not yet tested · ✅ healed in this audit · 🚧 partial

| Route | Role | Status | Screenshot | Notes |
|---|---|---|---|---|
| **Admin / Master** | | | | |
| `/admin` | master_admin | 🟢 | admin-mobile.png | Greeting + Quick Actions render. |
| `/admin/availability` | master_admin | 🔴→✅ | admin-availability-mobile.png | Was filtering by `coach_id` for everyone → admins saw 0 slots. Fixed: skip filter when `isAdmin`. |
| `/admin/bookings` | master_admin | 🔴→✅ | admin-bookings-mobile.png | Earlier hotfix: child_id/promo_code defensive query. 287 bookings load, $2,290 revenue. |
| `/admin/services` | master_admin | 🟡→✅ | admin-services-mobile.png | Header overflow on mobile fixed. |
| `/admin/promos` | master_admin | 🟡→✅ | admin-promos-mobile.png | Header overflow fixed. 3 codes (FREE4ME, SHELTONFAM, DCAA2026). |
| `/admin/courses` | master_admin | 🟡→✅ | — | Header overflow fixed (not re-verified live). |
| `/admin/questionnaires` | master_admin | 🟡→✅ | — | Header overflow fixed (not re-verified live). |
| `/admin/drills` | master_admin | 🟡→✅ | admin-drills-mobile.png | 13 drills. Two-button header overlap fixed. |
| `/admin/athletes` | master_admin | 🟡→✅ | admin-athletes-mobile.png | 100 athletes. Invite Link + Add Athlete header overflow fixed. |
| `/admin/athletes/[id]` | master_admin | 🟢 | athlete-profile-mobile.png | Audrey Clark — Appointments section, edit modal w/ email field, metric form with 6 pitch velos + 5 zones. |
| `/admin/athletes/create` | — | ⏳ | — | Form not yet exercised. |
| `/admin/media` | master_admin | 🔴→🚧 | admin-media-mobile.png | 6 broken cover images. Migration 058 fixes after run on Supabase. |
| `/admin/analytics` | master_admin | 🟢 | admin-analytics-mobile.png | $2,015 revenue, charts, growth %. |
| `/admin/imports` | master_admin | 🟢 | admin-imports-mobile.png | Form + history. |
| `/admin/submissions` | master_admin | 🟢 | admin-submissions-mobile.png | 21 contacts. Home button overlap fixed (now lg-only). |
| `/admin/org` | master_admin | 🟡→✅ | admin-org-mobile.png | Header overflow fixed. 1 named org + 1 URL-only org (data cleanup needed in DB). |
| `/admin/requests` | — | ⏳ | — | Not visited. |
| `/admin/drills/import` | — | ⏳ | — | Not visited. |
| `/admin/images` | — | ⏳ | — | Not visited. |
| **Athlete (impersonated)** | | | | |
| `/locker` | impersonate=athlete | 🔴→✅ | locker-impersonating-mobile.png | `bookings.service_name` and `sessions.peak_velocity` queries fixed. Banner overlap fixed via body class. |
| `/booking` | impersonate=athlete | 🟢 | booking-impersonating-mobile.png | 3-step wizard, services render with badges & pricing. |
| `/sessions` | impersonate=athlete | 🟢 | sessions-impersonating-mobile.png | Real bookings list with coach + location, filter pills. |
| `/leaderboards` | impersonate=athlete | 🟢 | leaderboards-impersonating-mobile.png | Sport tabs, metric selector, opt-in messaging clear. |
| `/guide` | impersonate=athlete | 🟢 | guide-impersonating-mobile.png | Athlete/Coach tabs, category cards. |
| `/settings` | impersonate=athlete | 🟡→✅ | settings-impersonating-mobile.png | Now shows amber notice clarifying settings reflect YOUR account, not impersonated user. |
| `/progress` | impersonate=athlete (member) | ⏳ | — | Member-only — not visited. |
| `/progress-report` | impersonate=athlete (member) | ⏳ | — | Member-only — not visited. |
| `/drills` | impersonate=athlete (member) | ⏳ | — | Member-only — not visited. |
| `/drills/[id]` | impersonate=athlete (member) | ⏳ | — | Member-only — not visited. |
| `/achievements` | impersonate=athlete (member) | ⏳ | — | Member-only — not visited. |
| `/video-analysis` | impersonate=athlete (member) | ⏳ | — | Member-only — not visited. |
| `/courses` | impersonate=athlete (member) | ⏳ | — | Member-only — not visited. |
| `/courses/[slug]` | impersonate=athlete (member) | ⏳ | — | Member-only — not visited. |
| `/questionnaires` | impersonate=athlete (member) | ⏳ | — | Member-only — not visited. |
| `/messages` | impersonate=athlete | ⏳ | — | Migration 055 affects this. Not visited. |
| **Coach (simulated)** | | | | |
| `/admin/bookings` | simulate=coach | ⏳ | — | Coach scoping: should only show their bookings. |
| `/admin/availability` | simulate=coach | ⏳ | — | Coach scoping: only their slots (now correct logic). |
| `/admin/athletes` | simulate=coach | ⏳ | — | Should show only assigned athletes. |
| `/admin/analytics` | simulate=coach | ⏳ | — | Coach earnings dashboard. |
| **Visitor (logged-out)** | | | | |
| `/` (home) | visitor | ⏳ | — | Not yet visited (would require logout). |
| `/about` | visitor | ⏳ | — | |
| `/pricing` | visitor | ⏳ | — | |
| `/memberships` | visitor | ⏳ | — | |
| `/faq` | visitor | ⏳ | — | |
| `/blog` | visitor | ⏳ | — | After mig 058. |
| `/blog/[slug]` | visitor | ⏳ | — | |
| `/coaches` | visitor | ⏳ | — | |
| `/coaches/[slug]` | visitor | ⏳ | — | |
| `/contact` | visitor | ⏳ | — | |
| `/get-started` | visitor | ⏳ | — | |
| `/org/[slug]` | visitor | ⏳ | — | |
| `/invite/[token]` | visitor | 🟢 | — | Already verified (Rachel feedback round). |
| `/privacy` | visitor | ⏳ | — | |
| `/terms` | visitor | ⏳ | — | |
| `/thank-you` | visitor | ⏳ | — | |
| `/unsubscribe` | visitor | ⏳ | — | |
| `/vault` | visitor | ⏳ | — | |
| `/membership-required` | visitor | ⏳ | — | |
| `/login` | visitor | ⏳ | — | |
| `/signup` | visitor | 🟢 | signup-mobile-deployed.png | Athlete name copy verified. Under-13 parent flow verified. |
| `/forgot-password` | visitor | ⏳ | — | |
| `/reset-password` | visitor | ⏳ | — | |
| **Org owner** | | | | |
| `/org/[slug]` (own org) | org_owner | ⏳ | — | Not tested. |

## Outstanding migrations to run on Supabase
- ✅ 056 (slot recalc)
- ✅ 057 (multi-child + promo_code)
- ⏳ **058** (blog image extensions) — pending; blocks /admin/media + /blog cover images

## Global fixes pushed (live after each Vercel deploy)
- HomeButton hidden below `lg:` so it doesn't overlap mobile page titles.
- ImpersonationBanner + SimulationBanner now toggle body classes; CSS pads `#dashboard-main` so headings aren't clipped.
- 7 admin pages: header `flex items-center justify-between` → `flex flex-col sm:flex-row` to stop CTA buttons clipping titles on mobile.
- /admin/availability filter logic: admins see all slots, coaches see only theirs.
- /admin/bookings query: defensive fallback for `child_id` / `promo_code` columns when migration 057 isn't run.
- /admin/create-booking + /admin/apply-promo: same column-defensive retries.
- /locker: rewrote stale `bookings.service_name` query.
- use-user-stats hook: rewrote stale `sessions.peak_velocity` queries to use bookings + athlete_performance_metrics.
- /settings: amber notice when impersonating, explaining settings show your own account.

## Outstanding bugs/polish backlog (not blockers)
- Org with name "https://roblogo.com/" appears in admin/org list — DB cleanup needed.
- Athlete impersonation is read-only by design; consider redirecting from /settings to /admin for impersonators rather than showing the warning, as a cleaner UX.
- Bookings on /admin/bookings calendar view still need verification on mobile post-deploy.
- Coach simulation flow not yet exercised end-to-end in this audit.
- Member-gated routes (8 of them) not tested — would need to impersonate a member with active package, or simulate.
- Visitor walkthrough deferred; would need a separate session or incognito.
