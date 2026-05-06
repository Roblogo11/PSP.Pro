# PSP.Pro Full Route Audit — 2026-05-06

**Auditor**: Claude (mobile-first via Playwright MCP)
**Stack**: Next.js 14.2.35, Supabase, Stripe, Vercel
**Migrations applied**: through 057 (multi-child + slot-recalc + promo_code)

## Audit dimensions

Each route is scored on:

1. **Logic** — does it do what it should? data flows, mutations, permissions, edge cases
2. **Visual** — design system consistency, no broken layouts, dark/light mode, mobile-first (390×844) + desktop (1280×800)
3. **Polish** — spacing, typography, animations, empty states
4. **Functionality** — every button, link, form actually works end-to-end
5. **UX** — can a real user finish a task without stalling?
6. **A11y** — keyboard nav, ARIA labels, color contrast (WCAG AA), focus states

## Status legend

- 🟢 **Pass** — works as designed, no fixes needed
- 🟡 **Polish** — works but cosmetic / UX nits worth fixing
- 🔴 **Broken** — functional bug or showstopper; healed in place if fixable now

---

## Roles tested

- **Visitor** (logged out)
- **Athlete (member)** — has active package
- **Athlete (non-member)** — gated, redirects to /membership-required
- **Parent/Guardian** — manages 1+ children
- **Coach** — via /admin/simulation (Act as Coach)
- **Admin** — direct master_admin login
- **Master Admin** — same login + simulation/impersonation tools
- **Org Owner** — niche, evaluated last

---

## Results

### Admin / Master Admin

#### `/admin` — Admin Control Center
- **Status**: 🟢 Pass (mobile)
- **Logic**: Personalized greeting, accurate counts (1 pending, 46 upcoming).
- **Visual**: Quick Actions grid renders cleanly at 390px. Bottom nav present.
- **Console**: 0 errors, 2 info.
- **Screenshot**: [admin-mobile.png](screenshots/admin-mobile.png)

#### `/admin/services` — Lesson Builder
- **Status**: 🟡→🟢 Healed
- **Visual bug**: Page header used `flex items-center justify-between` with no mobile stack → title clipped behind "New Lesson Type" button on 390px.
- **Fix**: stacked layout below `sm:` breakpoint, full-width button on mobile.
- **Featured banner copy**: "3/6 Featured Slots — Homepage shows up to 2 individual + 3 group" — clear.
- **Logic**: services list loads, badges render (GROUP, FEATURED), action row (toggle/feature/edit/delete) works.

#### `/admin/promos` — Promo Codes
- **Status**: 🟡→🟢 Healed (header overflow same pattern, same fix).
- **Logic**: 3 codes listed (FREE4ME, SHELTONFAM, DCAA2026 with 37 uses). All controls present.

#### `/admin/courses` — Course Builder
- **Status**: 🟡→🟢 Healed (header overflow same pattern).

#### `/admin/questionnaires` — Pop Quiz
- **Status**: 🟡→🟢 Healed (header overflow same pattern).

#### `/admin/drills` — Drill Library
- **Status**: 🟡→🟢 Healed
- **Visual bug**: TWO buttons (Bulk Import + Create Drill) stacked horizontally, each clipping the title.
- **Fix**: stacked vertically on mobile, full-width.
- **Stats**: 13 drills, all active, all with video, 100 athletes.

#### `/admin/athletes` — Athlete Roster
- **Status**: 🟡→🟢 Healed (header overflow with Invite Link + Add Athlete).
- **Stats accurate**: 100 athletes, 6 soccer, 2 basketball, 92 softball.

#### `/admin/media` — Content Hub
- **Status**: 🔴→🟡 Partially healed
- **Visual bug**: header overflow + dark page bg makes "Manage blog posts and media" subtitle barely readable.
- **🔴 Logic bug**: 6 broken blog cover images (404 on .jpg files).
- **Root cause**: Migration 039 seeded `.jpg` paths; only `.webp` files exist in `public/images/`.
- **Fix**: New migration `058_fix_blog_image_extensions.sql` rewrites `.jpg`/`.jpeg` → `.webp` in `blog_posts.cover_image` and `blog_posts.content`.
- **Action required**: Run migration 058 on Supabase.
- **Screenshot**: [admin-media-mobile.png](screenshots/admin-media-mobile.png)

#### `/admin/analytics` — Platform Analytics
- **Status**: 🟢 Pass
- **Logic**: $2,015 revenue, 160 bookings, 46 athletes, growth % calculations rendering.
- **Visual**: Tabs (7d/30d/90d) clean, stat cards stack on mobile.

#### `/admin/availability` — Time slot manager
- **Status**: 🔴→🟢 Healed
- **Logic bug**: Page filtered slots by `coach_id = user.id` for everyone — admins/master_admins saw 0 slots.
- **Fix**: Skip the coach filter when `isAdmin` is true ([admin/availability/page.tsx](../../src/app/(dashboard)/admin/availability/page.tsx)).
- **Visual**: layout fine on mobile.
- **Screenshot**: [admin-availability-mobile.png](screenshots/admin-availability-mobile.png) (pre-fix)

#### `/admin/bookings` — Confirm Lessons
- **Status**: 🟢 Pass (mobile, post-hotfix)
- **Logic**: 287 bookings load, stats accurate ($2,290.50 revenue, 112 confirmed, 1 pending, 7 no-shows). Promo+child fallback queries working.
- **Visual**: Filter pills, view toggle (Calendar/Table), stats grid all stack cleanly at 390px.
- **Console**: 0 errors.
- **Healed earlier this session**: defensive fallback for `child_id`/`promo_code` columns when migration 057 hadn't run.
- **Screenshot**: [admin-bookings-mobile.png](screenshots/admin-bookings-mobile.png)

