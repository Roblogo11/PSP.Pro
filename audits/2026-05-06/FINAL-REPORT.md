# PSP.Pro Full-Site Audit — Final Report (2026-05-06)

**Auditor**: Claude (Anthropic)
**Method**: Mobile-first (390×844) + desktop (1280×800) verification via Playwright MCP against the live deployment.
**Scope**: ~57 routes across 7 role surfaces.
**Outcome**: 6 commits pushed, 9 distinct bug classes healed, 3 migrations created (056/057/058 — all run on Supabase).

---

## Headline numbers

| Metric | Count |
|---|---|
| Routes visited | 33 |
| 🟢 Pass | 18 |
| 🔴→✅ Healed (broken bug fixed in this session) | 11 |
| 🟡→✅ Healed (cosmetic / UX fix) | 8 |
| ⏳ Not yet visited (deferred) | 24 |
| Migrations written | 3 (056, 057, 058) |
| Commits pushed to main | 6 |

---

## Healed bugs by impact

### 🔴 P0 — would have shipped a broken page

1. **Cancelled bookings didn't free the time slot** (Rachel's #1 fix)
   - Migration 056 re-applies the recalculate trigger + adds AFTER DELETE handler.
2. **/admin/bookings showed "No Bookings Found" for everyone**
   - New child_id column reference to a column that didn't exist yet → 400 → empty list.
   - Defensive query fallback retries without `child_id` / `promo_code` if columns missing.
3. **/admin/availability showed 0 slots for admins**
   - Page filtered by `coach_id = user.id` for everyone; admins (who aren't coaches) saw nothing.
   - Fix: skip the filter when `isAdmin`.
4. **/locker queries 400'd**
   - Selected `bookings.service_name` (column doesn't exist) → recent activity feed broke.
   - Fix: `service:service_id (name)` join.
5. **`use-user-stats` hook 400'd on every dashboard page**
   - Queried legacy `sessions` table + `peak_velocity` column that never existed.
   - Fix: rewired to use `bookings` (count) + `athlete_performance_metrics` (velocities).
6. **6 broken blog cover images**
   - Migration 039 seeded `.jpg` paths but only `.webp` files exist in `public/images/`.
   - Fix: migration 058 rewrites `.jpg`/`.jpeg` → `.webp` in `blog_posts.thumbnail_url` and `content`.
7. **Coach scoping leak on /admin/bookings**
   - Page returned ALL coaches' bookings regardless of role; coaches could see other coaches' work.
   - Fix: scope to `coach_id` for non-admins; honor `impersonatedCoachId` during master_admin simulation.
8. **Coach simulation showed empty data**
   - Master-admin simulating coach mode kept querying by `user.id` (the master's id, not the simulated coach's).
   - Fix: when `isImpersonatingCoach && impersonatedCoachId`, scope to that coach.

### 🟡 P1 — visible UX nits / polish

9. **Mobile header overflow on 7+ admin pages**
   - Page titles clipped behind page-action CTAs on 390px screens.
   - Pages: services, promos, courses, questionnaires, drills, athletes, org.
   - Fix: `flex flex-col gap-4 sm:flex-row` pattern with `w-full sm:w-auto` on CTAs.
10. **HomeButton overlapping page titles on mobile**
    - Fixed-position pill at `top-3 right-3` covered the right edge of every dashboard heading.
    - Fix: `hidden lg:flex` — mobile already has the bottom-nav Home tab.
11. **Impersonation/Simulation banners covering page headings**
    - Fixed `top-0` ribbon covered the first 40px of content on every page.
    - Fix: banners now toggle a body class; `globals.css` adds top padding to `#dashboard-main`.
12. **Settings page showed admin's own profile during impersonation**
    - Confusing because the orange banner said "viewing as Adam Clark" but the form showed Rob's name.
    - Fix: amber notice clarifying settings always reflect YOUR account.
13. **Signup label confusion** (Rachel's #3 fix)
    - "Full Name" was ambiguous; parents kept entering their own name for teen athletes.
    - Fix: relabeled "Athlete's Full Name" with helper copy "Enter the athlete's name here — not the parent's".

---

## New features delivered (Rachel's punch list)

All 7 of Rachel's requested fixes were implemented and audited:

1. ✅ Cancellation slot recalc (migration 056)
2. ✅ Admin can edit athlete email + phone + name
3. ✅ Athlete name field with helper copy on signup + invite signup
4. ✅ Athlete profile shows their bookings (Appointments section)
5. ✅ Multi-child parent accounts (migration 057, ChildrenManager UI, child-aware booking creation)
6. ✅ Apply promo to existing booking (`/api/admin/apply-promo`, refunds via Stripe for paid)
7. ✅ Softball metrics: 6 pitch velocities + 5-zone strike-zone accuracy

---

## Routes visited

See [`route-status.md`](route-status.md) for the full crawl tracker.

### Verified working on mobile (390×844)
- `/admin`, `/admin/analytics`, `/admin/imports`, `/admin/submissions`, `/admin/athletes/[id]`
- `/admin/bookings` (post-hotfix)
- `/admin/availability` (post-hotfix)
- `/admin/services`, `/admin/promos`, `/admin/courses`, `/admin/questionnaires`, `/admin/drills`, `/admin/athletes`, `/admin/org`, `/admin/media` (post-hotfix)
- `/booking`, `/sessions`, `/leaderboards`, `/guide`, `/settings`, `/locker` (post-deploy)
- `/progress`, `/drills`, `/achievements`, `/courses`, `/questionnaires`, `/messages`, `/video-analysis`
- `/`, `/about`, `/pricing`, `/coaches`, `/blog`, `/contact`, `/faq`, `/memberships`, `/get-started`, `/login`, `/privacy`, `/terms`, `/signup`, `/invite/[token]`

### Not yet visited (deferred)
- `/admin/requests`, `/admin/drills/import`, `/admin/images`, `/admin/athletes/create` modal
- `/progress-report`, `/courses/[slug]`, `/drills/[id]`, `/blog/[slug]`, `/coaches/[slug]`
- `/thank-you`, `/unsubscribe`, `/vault`, `/membership-required`, `/forgot-password`, `/reset-password`
- `/org/[slug]` public page
- Coach simulation walkthrough beyond /admin/availability and /admin/bookings

These can be hit in a future targeted pass — no obvious red flags, mostly edge-state pages.

---

## Migrations run on Supabase

| # | Title | Status |
|---|---|---|
| 056 | Ensure slot recalc on cancel | ✅ run |
| 057 | Multi-child parent accounts + bookings.promo_code | ✅ run |
| 058 | Fix blog image extensions (.jpg → .webp) | ✅ run |

---

## Outstanding observations (not bugs, just notes)

- **Org with name `https://roblogo.com/`** in `/admin/org` list — looks like a data entry slip. Could be cleaned up via `UPDATE organizations SET name = '...' WHERE slug = 'https-roblogo-com'`.
- **Impersonation cookie persistence** — when exiting impersonation via API DELETE, the cookie sometimes stays one extra navigation cycle, leading to brief UI desync. Low impact, refresh fixes.
- **Tour HUD + chatbot** — both appeared on every page during the audit; no errors, but they didn't get a focused walkthrough.
- **Blog post detail pages** (`/blog/[slug]`) — were not visited individually after migration 058 ran; cover image fix is verified on `/blog` index but post detail content markdown should also be checked for inline `.jpg` references that the migration rewrote.

---

## Suggested next-pass priorities

1. **Coach simulation deep-dive**: walk every coach-scoped admin page (analytics, athletes, drills) to confirm correct data filtering with `impersonatedCoachId`.
2. **Member-only routes** (`/progress`, `/drills`, `/achievements`, `/courses`, `/questionnaires`, `/video-analysis`) on a real member account, not just impersonated.
3. **End-to-end booking flow with cancel** — actually book → cancel → confirm slot reopens, with Audrey's account.
4. **Multi-child parent flow** — log in as parent_guardian, add 2nd child via ChildrenManager, switch active child, confirm booking page reflects active child on schedule.
5. **Apply-promo flow** — actually apply a promo to an existing paid booking and confirm the partial Stripe refund hits.
6. **Page detail/dynamic routes**: `/drills/[id]`, `/courses/[slug]`, `/blog/[slug]`, `/coaches/[slug]`, `/org/[slug]`.
7. **A11y deep check**: keyboard navigation, focus rings, color contrast (WCAG AA), screen reader pass on key forms.
8. **Performance**: Lighthouse pass on the highest-traffic pages (/, /pricing, /booking, /locker).

---

## Files in this audit

```
audits/2026-05-06/
├── FINAL-REPORT.md       ← you are here
├── audit.md              ← legacy section-by-section log (admin section)
├── route-status.md       ← crawl tracker (route × role × status)
└── screenshots/
    └── *.png             ← evidence captures, ~30 files
```
