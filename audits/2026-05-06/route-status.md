# PSP.Pro Route Status Tracker — 2026-05-06

Quick crawl table for MCP-driven re-verification. Each row: route, role tested, last status, last screenshot, notes.

**Status legend**: 🟢 pass · 🟡 polish needed · 🔴 broken · ⏳ not yet tested · ✅ healed in this audit

| Route | Role | Status | Screenshot | Notes |
|---|---|---|---|---|
| `/admin` | master_admin | 🟢 | admin-mobile.png | Greeting + actions render. |
| `/admin/availability` | master_admin | 🔴→✅ | admin-availability-mobile.png | Was filtering by `coach_id` for everyone → admins saw 0 slots. Fixed. |
| `/admin/bookings` | master_admin | 🟢 | admin-bookings-mobile.png | 287 bookings, all stats accurate. Earlier hotfix in place. |
| `/admin/services` | master_admin | 🟡→✅ | admin-services-mobile.png | Header overlap on mobile fixed. |
| `/admin/promos` | master_admin | 🟡→✅ | admin-promos-mobile.png | Header overlap fixed. 3 codes listed. |
| `/admin/courses` | master_admin | 🟡→✅ | — | Header overlap fixed. Not visited live yet. |
| `/admin/questionnaires` | master_admin | 🟡→✅ | — | Header overlap fixed. Not visited live yet. |
| `/admin/drills` | master_admin | 🟡→✅ | admin-drills-mobile.png | 13 drills active. Header overlap fixed (Bulk Import + Create Drill). |
| `/admin/athletes` | master_admin | 🟡→✅ | admin-athletes-mobile.png | 100 athletes loaded. Header overlap (Invite Link + Add Athlete) fixed. |
| `/admin/athletes/[id]` | master_admin | 🟢 | athlete-profile-mobile.png | Audrey Clark — bookings, metric form, edit modal all render. |
| `/admin/media` | master_admin | 🔴→🟡 | admin-media-mobile.png | 6 broken cover images (.jpg → .webp). Migration 058 fixes after run. |
| `/admin/analytics` | master_admin | 🟢 | admin-analytics-mobile.png | $2,015 revenue, charts render. |
| `/admin/imports` | master_admin | 🟢 | admin-imports-mobile.png | Form + history list. |
| `/admin/submissions` | master_admin | 🟢 | admin-submissions-mobile.png | 21 contact records. Title overlap was home button (now hidden < lg). |
| `/admin/org` | master_admin | 🟡→✅ | admin-org-mobile.png | Header overlap fixed. |
| `/admin/requests` | — | ⏳ | — | Not yet visited. |
| `/locker` | impersonate=athlete | 🔴 (queries 400) | locker-impersonating-mobile.png | `bookings.service_name` and `sessions.peak_velocity` don't exist. Fixed. Banner overlap also fixed. |
| `/booking` | impersonate=athlete | ⏳ | — | Next. |
| `/sessions` | impersonate=athlete | ⏳ | — | Next. |
| `/leaderboards` | impersonate=athlete | ⏳ | — | Next. |
| `/guide` | impersonate=athlete | ⏳ | — | Next. |
| `/settings` | impersonate=athlete | ⏳ | — | Next. |
| `/progress` | impersonate=athlete (member) | ⏳ | — | Member-only. |
| `/progress-report` | impersonate=athlete (member) | ⏳ | — | Member-only. |
| `/drills` | impersonate=athlete (member) | ⏳ | — | Member-only. |
| `/drills/[id]` | impersonate=athlete (member) | ⏳ | — | Member-only. |
| `/achievements` | impersonate=athlete (member) | ⏳ | — | Member-only. |
| `/video-analysis` | impersonate=athlete (member) | ⏳ | — | Member-only. |
| `/courses` | impersonate=athlete (member) | ⏳ | — | Member-only. |
| `/courses/[slug]` | impersonate=athlete (member) | ⏳ | — | Member-only. |
| `/questionnaires` | impersonate=athlete (member) | ⏳ | — | Member-only. |
| `/messages` | impersonate=athlete | ⏳ | — | Migration 055 affects this. |
| `/admin` simulation | simulate=coach | ⏳ | — | Coach-scoped admin pages still need crawl. |
| `/` (home) | visitor | ⏳ | — | Visitor crawl last (logout required). |
| `/about` | visitor | ⏳ | — | |
| `/pricing` | visitor | ⏳ | — | |
| `/memberships` | visitor | ⏳ | — | |
| `/faq` | visitor | ⏳ | — | |
| `/blog` | visitor | ⏳ | — | After mig 058 to fix images. |
| `/blog/[slug]` | visitor | ⏳ | — | |
| `/coaches` | visitor | ⏳ | — | |
| `/coaches/[slug]` | visitor | ⏳ | — | |
| `/contact` | visitor | ⏳ | — | |
| `/get-started` | visitor | ⏳ | — | |
| `/org/[slug]` | visitor | ⏳ | — | |
| `/invite/[token]` | visitor | ⏳ | — | Already verified copy. |
| `/privacy` | visitor | ⏳ | — | |
| `/terms` | visitor | ⏳ | — | |
| `/thank-you` | visitor | ⏳ | — | |
| `/unsubscribe` | visitor | ⏳ | — | |
| `/vault` | visitor | ⏳ | — | |
| `/membership-required` | visitor | ⏳ | — | |
| `/login` | visitor | ⏳ | — | |
| `/signup` | visitor | 🟢 | signup-mobile-deployed.png | Athlete name copy verified. |
| `/forgot-password` | visitor | ⏳ | — | |
| `/reset-password` | visitor | ⏳ | — | |

## Outstanding migrations to run on Supabase
- ~~056 (slot recalc)~~ ✅ run
- ~~057 (multi-child + promo_code)~~ ✅ run
- **058** (blog image extensions) — **pending**

## Outstanding global fixes pushed
- HomeButton hidden below `lg` so it stops overlapping page titles on mobile.
- Body class hooks added so impersonation/simulation banners pad `#dashboard-main` by 40-80px.
- `/locker` and `use-user-stats` rewritten to query bookings/metrics (the legacy `sessions` table never existed).
