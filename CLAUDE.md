# PSP.Pro — Claude Code Context

> **Temporary file** — remove when project is fully shipped.

## Project Overview
Next.js 14.2.35 sports training platform (softball, basketball, soccer). Supabase backend, Stripe payments, Framer Motion animations. Deployed on Vercel.

## Key Architecture

### CSS Specificity (READ THIS FIRST)
- Global text rule in `@layer base` forces `color: slate-700 !important` on `p, span, li, small, label` in light mode
- Span rule has specificity (0,6,2) due to 5 `:not([class*="..."])` selectors
- **ALWAYS scope homepage overrides to `.home-page`** — global overrides WILL break dashboard
- Dashboard `command-panel` gets LIGHT bg on light mode (not dark) — text should be DARK
- Homepage cards (`.glass-card`) get dark bg on light mode — text should be WHITE
- **Never add global command-panel text overrides**

### Booking Slot System (CRITICAL)
- BEFORE INSERT trigger `handle_booking_count()` handles slot increment automatically
- **DO NOT manually increment `current_bookings` in API routes** — causes double-counting
- Migration 052: replaced increment/decrement trigger with `recalculate_slot_availability()` — counts exact active bookings, immune to drift
- Routes already fixed: `admin/create-booking`, `bookings/pay-on-site`
- `create-booking-from-session.ts` (Stripe webhook) was always correct

### Sidebar / Mobile Nav
- Mobile: 5-tab bottom nav (Home, Chat, Lessons, Progress, More) + drag-to-dismiss sheet
- `primaryMobileTabs` indices: [0, 1, 7, 3] from `athleteNavItems`
- `useDragControls` pattern: only drag handle captures gesture, content scrolls independently
- Guide page at index 12 (before Settings at 13) — auto-appears in More sheet

### Security (Deployed)
- CSP: External `public/theme-init.js`, no `unsafe-eval`, `unsafe-inline` kept for styles (Tailwind)
- Rate limiting: In-memory sliding window in `src/lib/rate-limit.ts` (7 routes)
- Audit logging: Fire-and-forget in `src/lib/audit.ts` (5 sensitive actions)
- Calendar token: 90-day rolling expiry with auto-regeneration
- Promo RPC: `increment_promo_usage` SQL function
- Middleware: Root `middleware.ts` injects security headers (HSTS, CSP, X-Frame-Options, etc.)
- hCaptcha on contact/signup forms

### Parent/Guardian Accounts (COPPA Compliance)
- Under-13 athletes get `account_type: 'parent_guardian'` — account belongs to the parent
- `profiles.child_name` and `profiles.child_age` store the athlete's info
- `profiles.full_name` = parent name (account holder), `profiles.email` = parent login
- Migration 050 added these columns
- Signup, invite signup, and admin create-athlete all auto-detect age < 13 → parent mode
- Locker page greeting uses `child_name`, shows purple "Parent/Guardian" badge
- Admin athletes list shows "Parent Account" badge + "Managed by [parent]"
- Settings page shows child name/age fields for parent accounts
- One parent = one child account (Supabase auth enforces unique emails)
- COPPA parent notification email via `/api/auth/parent-notify`

### Theme System
- Dark mode: `.dark` class on `<html>`, light mode: absence of `.dark`
- ThemeProvider in `src/lib/contexts/theme-context.tsx`
- ThemeToggle + ThemeToggleCompact in `src/components/ui/theme-toggle.tsx`
- Homepage hero always has dark overlay regardless of theme

## Environment Notes
- Cold compile ~60s after cache clear
- MetaMask/WalletConnect warnings are harmless (missing optional deps)
- Port 3000 default, falls back to 3001 if busy
- Build warnings about `_document` and `Dynamic server usage: cookies` are pre-existing and harmless

---

## Complete Route Map (57 pages, 53 API routes)

### Public / Marketing Pages
| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/app/page.tsx` | Homepage — hero, services, testimonials, role-aware CTAs |
| `/about` | `src/app/about/page.tsx` | About — Coach Rachel, mission statement |
| `/pricing` | `src/app/pricing/page.tsx` | Dynamic pricing from Supabase + static fallbacks |
| `/memberships` | `src/app/memberships/page.tsx` | Basic ($0) vs Elite ($60/mo) comparison |
| `/faq` | `src/app/faq/page.tsx` | FAQ accordion + "Chat with PSP Guide" CTA |
| `/blog` | `src/app/blog/page.tsx` | Blog listing with categories, newsletter signup |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | Individual blog post with custom markdown renderer |
| `/coaches` | `src/app/coaches/page.tsx` | Coach directory |
| `/coaches/[slug]` | `src/app/coaches/[slug]/page.tsx` | Individual coach profile |
| `/contact` | `src/app/contact/page.tsx` | Contact form + Google Reviews |
| `/get-started` | `src/app/get-started/page.tsx` | "Join the Team" signup funnel |
| `/org/[slug]` | `src/app/org/[slug]/page.tsx` | Public org landing page with branding |
| `/invite/[token]` | `src/app/invite/[token]/page.tsx` | Invite link signup (validates token, org enrollment) |
| `/privacy` | `src/app/privacy/page.tsx` | Privacy policy |
| `/terms` | `src/app/terms/page.tsx` | Terms of service |
| `/thank-you` | `src/app/thank-you/page.tsx` | Post-action thank you page |
| `/unsubscribe` | `src/app/unsubscribe/page.tsx` | Email unsubscribe (CAN-SPAM) |
| `/vault` | `src/app/vault/page.tsx` | Web3 vault page |
| `/membership-required` | `src/app/membership-required/page.tsx` | Gate redirect for non-members |

### Auth Pages
| Route | File | Purpose |
|-------|------|---------|
| `/login` | `src/app/(auth)/login/page.tsx` | Login with Supabase Auth |
| `/signup` | `src/app/(auth)/signup/page.tsx` | Signup with age detection, parent/guardian flow |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` | Password reset request (Supabase Auth) |
| `/reset-password` | `src/app/(auth)/reset-password/page.tsx` | Password reset completion |

### Dashboard — Athlete Pages (MEMBER_ONLY routes marked *)
| Route | File | Purpose |
|-------|------|---------|
| `/locker` | `src/app/(dashboard)/locker/page.tsx` | Locker Room — hub with courses, quick rebook, stats |
| `/booking` | `src/app/(dashboard)/booking/page.tsx` | Book sessions — service selector, calendar, Stripe checkout |
| `/booking/success` | `src/app/(dashboard)/booking/success/page.tsx` | Booking confirmation |
| `/sessions` | `src/app/(dashboard)/sessions/page.tsx` | Session history + coach feedback |
| `/leaderboards` | `src/app/(dashboard)/leaderboards/page.tsx` | Regional leaderboards — opt-in, verified toggle |
| `/guide` | `src/app/(dashboard)/guide/page.tsx` | Interactive Play-by-Play Guide |
| `/settings` | `src/app/(dashboard)/settings/page.tsx` | Profile settings, leaderboard opt-in, parent fields |
| `/progress` * | `src/app/(dashboard)/progress/page.tsx` | Trophy Case — multi-sport metric charts, personal records |
| `/progress-report` * | `src/app/(dashboard)/progress-report/page.tsx` | Printable progress report |
| `/drills` * | `src/app/(dashboard)/drills/page.tsx` | Drill library with filters |
| `/drills/[id]` * | `src/app/(dashboard)/drills/[id]/page.tsx` | Individual drill detail |
| `/achievements` * | `src/app/(dashboard)/achievements/page.tsx` | Achievement badges |
| `/video-analysis` * | `src/app/(dashboard)/video-analysis/page.tsx` | Video analysis submissions |
| `/courses` * | `src/app/(dashboard)/courses/page.tsx` | Training courses |
| `/courses/[slug]` * | `src/app/(dashboard)/courses/[slug]/page.tsx` | Individual course |
| `/questionnaires` * | `src/app/(dashboard)/questionnaires/page.tsx` | Pop quiz / intake forms |
| `/messages` | `src/app/(dashboard)/messages/page.tsx` | Direct messages |

### Dashboard — Admin / Coach Pages
| Route | File | Purpose |
|-------|------|---------|
| `/admin` | `src/app/(dashboard)/admin/page.tsx` | Admin hub — simulation/impersonation, stats, quick nav |
| `/admin/bookings` | `src/app/(dashboard)/admin/bookings/page.tsx` | Manage bookings — calendar/list view, quick metrics, coach notes |
| `/admin/availability` | `src/app/(dashboard)/admin/availability/page.tsx` | Manage time slots — **Bulk Edit** (select all, multi-edit/delete) |
| `/admin/athletes` | `src/app/(dashboard)/admin/athletes/page.tsx` | Athlete roster with search, COPPA badges |
| `/admin/athletes/[id]` | `src/app/(dashboard)/admin/athletes/[id]/page.tsx` | Athlete detail — sport metrics, performance data |
| `/admin/athletes/create` | `src/app/(dashboard)/admin/athletes/create/page.tsx` | Create new athlete account |
| `/admin/services` | `src/app/(dashboard)/admin/services/page.tsx` | Manage services — pricing, categories, Stripe integration |
| `/admin/analytics` | `src/app/(dashboard)/admin/analytics/page.tsx` | Revenue charts, booking stats, top athletes (recharts) |
| `/admin/org` | `src/app/(dashboard)/admin/org/page.tsx` | Org management — members, branding, Stripe Connect, invites |
| `/admin/media` | `src/app/(dashboard)/admin/media/page.tsx` | Content Hub — blog editor + media gallery |
| `/admin/courses` | `src/app/(dashboard)/admin/courses/page.tsx` | Course builder |
| `/admin/drills` | `src/app/(dashboard)/admin/drills/page.tsx` | Drill library management |
| `/admin/drills/import` | `src/app/(dashboard)/admin/drills/import/page.tsx` | Bulk drill import |
| `/admin/images` | `src/app/(dashboard)/admin/images/page.tsx` | Image management |
| `/admin/imports` | `src/app/(dashboard)/admin/imports/page.tsx` | Data import hub |
| `/admin/promos` | `src/app/(dashboard)/admin/promos/page.tsx` | Promo code management |
| `/admin/questionnaires` | `src/app/(dashboard)/admin/questionnaires/page.tsx` | Questionnaire builder |
| `/admin/requests` | `src/app/(dashboard)/admin/requests/page.tsx` | Booking/service requests |

### API Routes (53 total)
**Auth:** `/api/auth/profile-role`, `/api/auth/coach-profile`, `/api/auth/parent-notify`, `/api/auth/delete-account`, `/api/auth/export-data`, `/auth/callback`
**Admin:** `/api/admin/create-athlete`, `/api/admin/update-athlete`, `/api/admin/delete-athlete`, `/api/admin/get-athlete-emails`, `/api/admin/create-booking`, `/api/admin/import-schedule`, `/api/admin/invite`, `/api/admin/invite/[token]`, `/api/admin/impersonation`, `/api/admin/simulation`, `/api/admin/simulation/cleanup`, `/api/admin/simulation/track`
**Bookings:** `/api/bookings/pay-on-site`, `/api/bookings/checkin`, `/api/bookings/rsvp`
**Stripe:** `/api/stripe/checkout`, `/api/stripe/subscribe`, `/api/stripe/webhook`, `/api/stripe/verify`, `/api/stripe/test-mode`, `/api/stripe/installment-checkout`, `/api/stripe/connect/onboard`, `/api/stripe/connect/status`
**Calendar:** `/api/calendar/export`, `/api/calendar/token`
**Org:** `/api/org` (list/create), `/api/org/[id]` (get/update), `/api/org/[id]/members`, `/api/org/by-slug/[slug]`, `/api/org/proxy-image`
**Messaging:** `/api/messages`, `/api/messages/[conversationId]`
**Content:** `/api/upload`, `/api/blog/upload`, `/api/imports/upload`, `/api/gallery`, `/api/media`
**Other:** `/api/contact`, `/api/newsletter`, `/api/promo/validate`, `/api/actions/review`, `/api/actions/request`, `/api/tour`, `/api/tour/end`, `/api/invite/signup`, `/api/sessions/delete`, `/api/reports/progress`, `/api/cron/session-reminders`

---

## Feature Reference

### Membership Gating
- Dashboard layout (`src/app/(dashboard)/layout.tsx`) enforces access
- **Open routes** (any authenticated user): `/booking`, `/sessions`, `/locker`, `/settings`, `/guide`, `/leaderboards`
- **Member-only routes** (active package required): `/progress`, `/drills`, `/achievements`, `/video-analysis`, `/courses`, `/questionnaires`, `/progress-report`
- Staff (admin/coach/master_admin) bypass all checks
- Non-members redirected to `/membership-required`
- Fallback: users with paid bookings can access non-member-only routes

### Memberships & Payments
- Two tiers: Basic ($0/mo) and Elite ($60/mo)
- Elite gets 10% off lessons, camps, academies — auto-applied in Stripe checkout
- Promo codes stack on top of Elite discount
- Promo validation: `/api/promo/validate` — checks active, not expired, within max uses, meets minimum
- Stripe checkout: `/api/stripe/checkout` — supports promo + elite discount + Stripe Connect splits
- Installment checkout: `/api/stripe/installment-checkout`
- Subscription: `/api/stripe/subscribe`

### Master Admin Simulation Mode
- "Act as Player" or "Act as Coach" from `/admin` page
- Cookie-based: `simulation_role` + `simulation_role_ui` (4hr expiry)
- Auto-enables Stripe test mode during simulation
- Purple banner at z-[110] (`src/components/simulation-banner.tsx`)
- Data tracking: `simulation_data_log` table records all created records
- One-click cleanup: deletes tracked records in reverse-dependency order + refunds test Stripe payments
- Tables: `simulation_sessions`, `simulation_data_log` (migration 027)
- API: `/api/admin/simulation` (GET/POST/DELETE), `/api/admin/simulation/cleanup`, `/api/admin/simulation/track`
- Client: `src/lib/simulation/track.ts` (`isSimulationActive()`, `trackSimulationData()`)

### Master Admin Impersonation ("View as Player/Coach")
- Strictly read-only: banners communicate "read-only mode"
- Cookie-based: `impersonation_user_id` + `impersonation_user_name` (2hr expiry)
- Amber banner at z-[110] (`src/components/impersonation-banner.tsx`)
- Mutually exclusive with simulation mode
- Dashboard uses `effectiveUserId = impersonatedUserId || profile?.id` for queries
- Supports both athlete and coach impersonation types
- API: `/api/admin/impersonation` (GET/POST/DELETE)
- Client: `src/lib/impersonation/helpers.ts`

### Interactive Tour System
- Spotlight overlay: `src/components/spotlight-overlay.tsx` (SVG mask with cutout)
- Tour HUD: `src/components/tour-hud.tsx` (step counter, next/back/dismiss)
- Tour tracking: `src/lib/tour/track.ts` (cookie + localStorage)
- 18+ page tours defined (all athlete + admin pages)
- Chatbot integration: keywords like "walk me through", "tour", "show me how to" trigger tours
- Tour API: `/api/tour`, `/api/tour/end`
- First-visit detection with one-time prompts

### Dr. Prop Chatbot (PSP Assistant)
- File: `src/components/psp-assistant.tsx` (47KB)
- 70+ knowledge base entries
- Route-specific suggestions
- Hype coach tone ("Ayyyy", "FACTS", "LETSSS GOOO")
- Role-aware (athlete/coach/admin get different suggestions)
- Tour trigger capability — detects tour keywords and launches interactive walkthroughs

### Email System (Resend)
- Provider: Resend (`resend@^6.9.1`), sends from `bookings@propersports.pro`
- Core util: `src/lib/email/send.ts` — fallback to console.log if no API key
- Templates: `src/lib/email/templates.ts`
- **Booking confirmation** — sent after Stripe payment (`create-booking-from-session.ts`)
- **Pay-on-site booking** — sent to athlete + coach (`/api/bookings/pay-on-site`)
- **Session reminder** — cron at 8am ET daily (`/api/cron/session-reminders`, schedule in `vercel.json`)
- **COPPA parent notification** — sent once per parent account (`/api/auth/parent-notify`)
- **Progress report** — on-demand, coach-triggered (`/api/reports/progress`)
- **Booking cancellation** — template EXISTS but is orphaned (no route calls it)
- **Password reset** — handled by Supabase Auth (not Resend)
- **Welcome email** — does NOT exist in app code; Supabase may send confirmation if enabled
- Unsubscribe: HMAC tokens in `src/lib/email/unsubscribe-token.ts` (CAN-SPAM compliant)

### Organizations (Multi-tenant)
- Create org: `/admin/org` — slug, tagline, sport focus, platform fee
- Public landing: `/org/[slug]` — branded page with coach list + "Book Now"
- Logo color extraction: `src/components/org/logo-color-extractor.tsx` (client-side K-means, zero deps)
- Invite links: generated from admin panel, validated via `/api/admin/invite/[token]`
- Org-filtered booking: `/booking?org=[id]` filters services to org + global
- Stripe Connect: onboarding + status endpoints for split payments
- Member management: `/api/org/[id]/members`
- Migrations: 040 (base), 041 (Stripe Connect), 049 (invite links)

### Sport-Specific Metrics
- 60 metrics: 15 Softball + 15 Basketball + 15 Soccer + 15 Athleticism
- Stored in `custom_metrics` JSONB on `athlete_performance_metrics`
- PSP Verified vs Self-Reported badges via `custom_metrics.verified`
- Quick Log Metrics on bookings page — links `session_id` to booking
- Hook: `src/lib/hooks/use-athlete-metrics.ts` — fetches + merges DB + JSONB

### Regional Leaderboards
- Route: `/leaderboards` — sport tabs, metric selector, verified-only toggle, region filter
- Opt-in: `leaderboard_opt_in` boolean + `region` text on profiles (migration 030)
- Settings page has "Leaderboard Settings" section

### Blog & Content Hub
- Blog editor: `/admin/media` — Content Hub with Blog + Media tabs
- Image upload: `/api/blog/upload` — 5MB max, auto-optimize with Sharp
- Video embeds: `[video](url)` markdown — YouTube/Vimeo only
- Blog display: `/blog/[slug]` with custom markdown renderer

### Courses & Questionnaires
- Courses: `/courses`, `/courses/[slug]`, `/admin/courses`
- Questionnaires: `/questionnaires`, `/admin/questionnaires`
- Both are member-only routes

### Drill System
- Athlete view: `/drills`, `/drills/[id]`
- Admin: `/admin/drills`, `/admin/drills/import` (bulk import)
- Filters, categories, difficulty levels

### Video Analysis
- Route: `/video-analysis` (member-only)
- Migration 044: video analysis submissions table

### Calendar Export
- `/api/calendar/export` — iCal format
- `/api/calendar/token` — 90-day rolling token with auto-regeneration

### Coach Features
- Coach profile: `/api/auth/coach-profile`
- Coach directory: `/coaches`, `/coaches/[slug]`
- Coach-scoped analytics: `/admin/analytics` filters by `coach_id`
- Coach feedback: `bookings.coach_notes` (visible to athletes) + `bookings.internal_notes` (private)
- Availability: `/admin/availability` with **Bulk Edit** (multi-select, multi-edit/delete, repeat slots)
- Coach earnings dashboard in analytics (recharts)

### Booking Flow
- Components: `calendar.tsx`, `time-slot-picker.tsx`, `service-selector.tsx`
- Quick Rebook: last 3 distinct booked services as quick-pick cards
- One-tap booking: URL params `?service=UUID&coach=UUID`
- Pay-on-site: `/api/bookings/pay-on-site`
- Check-in: `/api/bookings/checkin`
- RSVP: `/api/bookings/rsvp`

### Data Management
- Account deletion: `/api/auth/delete-account`
- Data export: `/api/auth/export-data`
- Contact form: `/api/contact` (saves to DB only — no email notification to staff)
- Newsletter: `/api/newsletter` (subscriber list only — no broadcast endpoint)

---

## Supabase Migrations (52 total)
Latest: `052_fix_slot_counts_and_cancellation_trigger.sql` — recalculates exact slot counts + replaces increment trigger

Key migrations:
- 010: profile creation trigger
- 027: simulation mode tables
- 028-029: master admin RLS + recursion fix
- 030: leaderboard opt-in (NOTE: duplicate 030 prefix with RLS fix)
- 034-036: courses + questionnaires
- 039: blog posts
- 040-041: organizations + Stripe Connect
- 044: video analysis
- 045: membership tiers
- 048-052: slot count fixes

---

## RLS Policies
- Migration 028 added `master_admin` to ALL RLS policies
- Migration 029 fixed recursive profiles RLS — `USING (true)` for SELECT
- Profiles INSERT/UPDATE/DELETE: `id = auth.uid()`
- Staff operations bypass RLS via admin client (service role key)
- **NEVER create RLS policies that self-reference the same table** — causes infinite recursion and 500s

## Server-Side Auth Pattern
- All 18 server-side files use `createAdminClient()` for profile/role queries (bypasses RLS)
- Layouts use try/catch fallback: try adminClient, catch → regular client
- API routes use adminClient directly
- Login page uses `/api/auth/profile-role` API route

## Known Gaps (Not Blockers)
- Booking cancellation email template exists but is never sent (orphaned)
- Coach does NOT get email notification on Stripe-paid bookings (only pay-on-site)
- Contact form saves to DB but sends no email to staff
- Newsletter captures subscribers but has no broadcast endpoint
- Welcome/onboarding email does not exist — relies on Supabase's built-in confirmation
- `CRON_SECRET` env var needed for session reminders but not in `.env.example`
- Two files share the `030` migration prefix (potential ordering issue)
- `src/middleware.ts` (inside src/) may be superseded by root `middleware.ts`
