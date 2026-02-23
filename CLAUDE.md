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
- AFTER UPDATE trigger `increment_slot_availability()` decrements on cancellation
- Routes already fixed: `admin/create-booking`, `bookings/pay-on-site`
- `create-booking-from-session.ts` (Stripe webhook) was always correct

### Sidebar / Mobile Nav
- Mobile: 5-tab bottom nav (Home, Chat, Lessons, Progress, More) + drag-to-dismiss sheet
- `primaryMobileTabs` indices: [0, 1, 7, 3] from `athleteNavItems`
- `useDragControls` pattern: only drag handle captures gesture, content scrolls independently
- Guide page at index 13 (before Settings at 14) — auto-appears in More sheet

### Security (Deployed)
- CSP: External `public/theme-init.js`, no `unsafe-eval`, `unsafe-inline` kept for styles (Tailwind)
- Rate limiting: In-memory sliding window in `src/lib/rate-limit.ts` (7 routes)
- Audit logging: Fire-and-forget in `src/lib/audit.ts` (5 sensitive actions)
- Calendar token: 90-day rolling expiry with auto-regeneration
- Promo RPC: `increment_promo_usage` SQL function

### Theme System
- Dark mode: `.dark` class on `<html>`, light mode: absence of `.dark`
- ThemeProvider in `src/lib/contexts/theme-context.tsx`
- Homepage hero always has dark overlay regardless of theme

## Environment Notes
- Cold compile ~60s after cache clear
- MetaMask/WalletConnect warnings are harmless (missing optional deps)
- Port 3000 default, falls back to 3001 if busy
- Build warnings about `_document` and `Dynamic server usage: cookies` are pre-existing and harmless

## What's Been Done (Recent Sessions)
1. 8 competitive gap-closing features (achievements, leaderboards, video analysis, etc.)
2. Mobile visual upgrade (5-tab nav, stat card sizing, touch targets, bottom sheets)
3. Vercel Analytics installed
4. Security hardening (CSP, rate limiting, audit logging, token expiry, promo RPC)
5. Mobile More sheet drag-to-dismiss fix
6. Booking slot double-counting fix (migration 048 — already run in Supabase)
7. Interactive Play-by-Play Guide at `/guide`

## Next Up: Chatbot Interactive Walkthrough
**User approved this feature — build it next session.**

### Concept
Intercom-style product tours triggered from the PSP Assistant chatbot. User asks "how do I book?" → chatbot launches a step-by-step overlay that highlights actual UI elements and walks them through.

### What Needs Building
1. **Overlay/spotlight system** — semi-transparent backdrop with cutout highlighting a target element
2. **Step definitions** — each walkthrough is a sequence of { selector, tooltip text, position }
3. **Walkthrough engine** — component that advances through steps, positions tooltips, handles next/back/dismiss
4. **Chatbot integration** — PSP Assistant (`src/components/psp-assistant.tsx`) triggers walkthroughs; currently self-contained with own `isOpen` state and route-specific knowledge base
5. **Walkthrough content** — at minimum: "How to book a session", "How to track progress", "How to manage athletes" (coach)

### Key Files
- `src/components/psp-assistant.tsx` — chatbot (38KB, has route-specific suggestions + knowledge base)
- `src/app/(dashboard)/guide/page.tsx` — static play-by-play guide (already deployed)
- `src/components/layout/sidebar.tsx` — sidebar with nav items + mobile bottom nav

### Constraints
- Zero new npm packages (keep bundle small)
- Use Framer Motion for animations (already available)
- Must work on mobile (bottom-positioned tooltips, no overflow issues)
- Don't break existing chatbot functionality
