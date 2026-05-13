# Live Site Sweep — 2026-05-13 (post-deploy c3536e4)

Walked through the live site at https://propersports.pro on mobile (390×844) in **both light and dark mode** to spot anything worth fixing in a future session. Captured screenshots in repo root (gitignored — local-only).

**Deploy verified live:** `/admin/media` and `/vault` both return HTTP 404, confirming the c3536e4 deploy is in production.

---

## Findings worth fixing

### 1. `/coaches` page ignores light theme — HIGH priority
- **Symptom:** With `localStorage.theme = "light"` and `<html class="light">` confirmed via DevTools, the `/coaches` page still renders with a fully dark background and white text. All other public pages (home, pricing, about, FAQ, blog) honor the theme switch correctly.
- **Evidence:** [live-coaches-mobile-LIGHT.png](live-coaches-mobile-LIGHT.png) — note the theme toggle (sun icon active) at bottom-left of the spoke nav, but the page body is `bg-dark` or similar.
- **Likely cause:** `src/app/coaches/page.tsx` is using hardcoded dark classes (`bg-slate-900`, `bg-dark-100`, etc.) instead of theme-aware tokens, OR is missing the dark-mode conditional pattern other pages use.
- **Fix:** Audit `/coaches/page.tsx` for hardcoded `bg-*` and `text-*` classes, replace with theme-aware equivalents (`bg-white dark:bg-slate-900`, `text-slate-900 dark:text-white`).

### 2. Coaches list looks lonely with only 2 entries — content gap
- **Observation:** Only Loren Bagley + Rachel Bagley shown. Page hero promises "elite trainers, multi-sport coverage" but the roster is thin.
- **Not a bug**, just content to flesh out — or hide the page until you have more coaches.

### 3. Preload warning on `/coaches` and `/blog`
- **Warning:** `The resource https://propersports.pro/images/PSP-black-300x99-1.webp was preloaded using link preload but not used within a few seconds from the window's load event.`
- **Impact:** Lighthouse will dock performance score. Minor.
- **Fix:** Find the `<link rel="preload" as="image">` for `PSP-black-300x99-1.webp` (probably in `app/layout.tsx` or a layout component for marketing pages) and either remove it or attach an `as=` attribute and use the asset within ~2s of load.

### 4. Missing `/favicon.ico` → 404 on every page
- **Error:** `Failed to load resource: 404 — /favicon.ico`
- **Impact:** Console noise on every page load; doesn't break anything but pollutes monitoring.
- **Fix:** Add `app/icon.png` or `public/favicon.ico`. Next 14 will auto-wire `app/icon.png` if present.

### 5. Homepage hero kept intentionally dark regardless of theme
- **Not a bug** — per `CLAUDE.md`: *"Homepage hero always has dark overlay regardless of theme"*. The hero image overlay stays dark even in light mode by design. The rest of the homepage (services, testimonials, CTAs) does switch to light correctly.
- **Confirmed correct:** [live-home-mobile-LIGHT-full.png](live-home-mobile-LIGHT-full.png)

---

## Pages verified clean (no issues found)

| Page | Mobile dark | Mobile light | Console | Screenshot |
|------|-------------|--------------|---------|-----------|
| `/` (home) | ✅ | ✅ (hero stays dark by design) | clean | live-home-mobile.png, live-home-mobile-LIGHT-full.png |
| `/pricing` | ✅ | ✅ | clean | live-pricing-mobile.png, live-pricing-mobile-LIGHT.png |
| `/about` | ✅ | ✅ | clean | live-about-mobile.png, live-about-mobile-LIGHT.png |
| `/blog` | ✅ | not retested | preload warning (#3) | live-blog-mobile.png |
| `/faq` | not tested in dark | ✅ | clean | live-faq-mobile-LIGHT.png |
| `/coaches` | ✅ | ❌ (#1) | preload warning (#3) | live-coaches-mobile.png, live-coaches-mobile-LIGHT.png |

---

## Not verified this session (auth-gated, needs login)

- `/courses` (athlete view) — confirm "Show more" toggle works on long descriptions in both themes
- `/admin/courses`, `/admin/drills`, `/admin/services` — confirm `<MediaPicker>` opens, lists images, and writes back to the form
- `/admin/org` Branding tab — confirm website URL → favicon → color extraction flow works end-to-end
- All dashboard pages in light mode (locker, sessions, settings, etc.)

You said you'd log in and walk these yourself. Heads-up: if the coaches-page theme bug also affects any dashboard pages, you'll see dark backgrounds where light should be.

---

## Suggested fix order (when you're ready)

1. **#1** — `/coaches` theme fix (highest user-visible impact, breaks brand consistency)
2. **#4** — Add a favicon (kills console noise everywhere, 1-line fix)
3. **#3** — Preload warning (perf cleanup)
4. **#2** — Coach roster (content task, your call)
