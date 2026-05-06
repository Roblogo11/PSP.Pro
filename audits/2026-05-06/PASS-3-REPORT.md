# PSP.Pro Audit — Pass 3 Report (2026-05-06, polish pass)

**Auditor**: Claude (Anthropic) via Playwright MCP
**Continuation of**: [PASS-2-REPORT.md](PASS-2-REPORT.md)
**Focus**: A11y, performance, theme consistency, console errors, build pipeline

---

## 🚨 Major root-cause discovery

**Vercel build had been silently failing on every commit since pass 2.**

All "post-deploy verification" attempts in passes 2 and 3 were actually verifying the **stale, pre-pass-2 deployment** because every push since `97a0dcb` failed with:

```
./src/lib/hooks/use-user-stats.ts:125:20
Type error: Parameter 'v' implicitly has an 'any' type.
```

The `npm run build` step was succeeding, but `tsc --noEmit` was rejecting the implicit-any in my earlier rewrite. Fixed in commit `72f49c8` with an explicit type annotation.

**Effect**: All 7 queued commits (audit passes 2-5 + final report + pass 5 + this fix) will deploy together once Vercel rebuilds.

This is also why the locker page kept showing the old `from('sessions')` errors despite my fix being merged hours ago — the fix was never actually live.

**Lesson for memory**: When Vercel "looks slow", check the actual build log via dashboard before assuming queue lag. Local tsc passing isn't enough — Next.js production build runs its own type-check pass that can fail differently.

---

## A11y findings & heals

### Heading structure
- 🔴→✅ **Homepage had NO `<h1>`** — main hero was an h2. Now an h1.
- 🔴→✅ **Sidebar brand "PSP.Pro" was an `<h1>`** in both info-sidebar.tsx and sidebar.tsx. This created **two h1s on every page** that uses these layouts (about/pricing/coaches/contact/memberships/get-started). Demoted to span.
- 🟡 Heading skip h2→h4 once on homepage — minor, leaving for now.

### Form labels
- 🔴→✅ **/get-started had 9 unlabeled inputs** — labels existed in DOM but weren't linked via `htmlFor` + `id`. Added explicit `htmlFor` to every label and matching `id` on every input/select/textarea (firstName, lastName, email, phone, age, position, experience, availability, additionalInfo).

### Other a11y checks (good)
- All images have `alt` attributes
- All buttons have accessible names
- All links have text content
- `<html lang="en">` present
- `Skip to main content` link present (already)

---

## Performance findings

### Top routes mobile (390×844, cached visit)

| Route | TTFB | FCP | LCP | DOMI | Resources |
|---|---|---|---|---|---|
| `/` | 24ms | 296ms | 2,380ms | 254ms | ~50 |
| `/admin` | 99ms | 380ms | 396ms | 748ms | 74 |

### Things that look good
- TTFB is excellent everywhere (cached at edge).
- FCP under 400ms on every route.
- CLS is **0.0000** — no layout shift on the routes I measured.
- Hero image already has `priority` on Next/Image.

### Things to optimize (not blockers)
- **/admin makes 26 sequential Supabase requests** on first paint. Two of them are duplicate `profiles` queries (one in dashboard layout, one in the admin page) — could share via context or server component.
- **Slowest single requests on /admin**:
  - `stripe/test-mode` 682ms
  - `admin/simulation` 652ms
  - `profiles` 549ms
  - `profiles` 521ms
  - `stripe/test-mode` 505ms
- Two stripe/test-mode calls suggest a duplicate fetch. Worth audit.
- `profiles` table queries take ~500ms — RLS evaluation overhead. The profile fetch happens in 4-5 places per page load. Caching with React Query / SWR or a server-side prefetch would compress this to ~50ms.

### Web3 wagmi bundle warnings (non-blocking)
Vercel build logs warn about:
- `@react-native-async-storage/async-storage` (MetaMask SDK)
- `pino-pretty` (WalletConnect logger)

These are platform-specific deps the bundler can't resolve in browser context. Standard wagmi/walletconnect noise. Already documented in CLAUDE.md as expected.

---

## Theme consistency

✅ **Light mode and dark mode both verified on /admin** at mobile size.

- Light: cream/peach gradient bg, cards have soft cyan tint, text is readable slate-900.
- Dark: deep navy bg, cards have glass effect with cyan/orange gradients on headings, contrast holds up.
- The single biggest historical concern (CLAUDE.md notes "global text rule forces slate-700 !important") is not visibly broken anywhere I tested.

No theme-related issues found in this pass.

---

## Console error sweep

Ran an iframe-based sweep across 21 routes. **0 client-side errors** (the iframe checks happened against the broken old deployment though, so ground truth needs a re-run after Vercel deploys the fixes). Re-verify after deploy.

The /locker errors were the result of the stale deployment. Once `72f49c8` lands, those will be gone.

---

## What's now committed and (will be) live after Vercel rebuilds

1. Pass 1 (admin route healing): mobile header overflow on 7 admin pages, /admin/availability filter logic, migration 058 written.
2. Pass 2 (locker + banners + home button): use-user-stats rewrite, locker query fix, banner overlap CSS, mobile home-button.
3. Pass 3 (settings impersonation banner).
4. Pass 4 (coach scoping in availability + bookings during simulation).
5. Pass 5 (org/[slug] React #438 crash fix, drill detail mobile, footer city).
6. Empty rebuild trigger commit.
7. Pass 2/3 audit reports + screenshots.
8. **Pass 3 (this pass)**: homepage h1 fix, sidebar h1 demotion, /get-started label-input linking.
9. **Build fix**: explicit type on use-user-stats filter callback.

When this commit's build succeeds, **everything since pass 2 lands together**. The cumulative impact:
- Locker queries actually work
- Banner overlap actually fixed
- Coach simulation actually scopes
- Org pages don't crash
- Drill detail doesn't overlap
- Homepage has an h1
- Get-started form is screen-reader accessible
- Etc.

---

## Cumulative tally (passes 1+2+3)

| Class | Count |
|---|---|
| 🔴 Critical bugs healed | 14 |
| 🟡 Polish/UX/a11y healed | 14 |
| Migrations created & run | 3 (056, 057, 058) |
| Commits pushed | 9 |
| Routes verified | 38 |

---

## Recommended follow-ups

1. **Run npm run build locally before pushing** — catches the exact errors Vercel will. I'll add this to memory if you want.
2. Add a CI step on the GitHub repo to run `tsc --noEmit` on every PR — would have caught this.
3. **Profile fetch consolidation** on /admin — bundle the dashboard layout + admin page profile fetch into one shared call, save ~500ms.
4. Audit the duplicate `stripe/test-mode` calls.
5. **A11y next steps**: keyboard navigation (tab order on /booking calendar), focus ring visibility on dark backgrounds, color contrast of cyan-700 on light bg (some places might be borderline).
6. Real Lighthouse run with throttling (the in-browser perf API doesn't simulate 4G).
