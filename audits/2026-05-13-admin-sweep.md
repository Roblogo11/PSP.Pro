# Admin Sweep — 2026-05-13 (post-deploy 9eb07df)

Authenticated sweep as master_admin Rob via MCP at mobile 390×844. Checked every admin page + key athlete dashboard pages on the live deploy.

---

## ✅ Verified working

| Page | Console | Picker / Feature | Notes |
|------|---------|------------------|-------|
| `/admin` | 0 errors / 0 warnings | n/a | Hub renders with all stats (103 athletes, 39 sessions, 13 drills) |
| `/admin/courses` | clean | **Picker opens** | "Choose image" button → modal with Library + Paste URL tabs. **9 photos visible** in library |
| `/admin/drills` | clean | Picker present in edit modal | Same component, works the same |
| `/admin/services` | clean | **Picker on Homepage Image** | "Choose image" wired to `homepage_image_url`, hint copy correct |
| `/admin/org` Branding tab | clean | **Favicon flow renders** | "Website → Auto Brand Scan" with URL input + Scan button — see issue #1 below |
| `/admin/athletes` | clean | n/a | List renders fine |
| `/admin/bookings` | clean | n/a | List renders fine |
| `/admin/availability` | clean | n/a | Renders fine |
| `/locker` | clean | n/a | Athlete dashboard hub clean |
| `/courses` (athlete) | clean | **"Show more" toggle works** | Description clamps to 2 lines, orange "Show more" expands fully — Loren's ask is done |

---

## Issues found

### 1. Favicon scan fails for external URLs (CORS) — HIGH priority
- **Steps to reproduce:** /admin/org → Branding tab → paste `https://stripe.com` → Scan
- **Symptom:** Two console errors, friendly fallback message appears:
  > "Found the favicon but the browser blocked loading it for color analysis. You can still apply it as the logo and choose colors manually below."
- **Console errors:**
  ```
  Access to image at 'https://www.google.com/s2/favicons?domain=stripe.com&sz=256'
    from origin 'https://propersports.pro' has been blocked by CORS policy
  Failed to load resource: net::ERR_FAILED at https://www.google.com/s2/favicons?...
  ```
- **Root cause:** My `/api/org/favicon` route falls back to Google's `s2/favicons` service when the target site's favicon HEAD-check fails. But the client-side color extractor uses `<img crossOrigin="anonymous">` to read pixel data — Google's s2 service doesn't return `Access-Control-Allow-Origin`, so the canvas read fails with a CORS taint exception.
- **Impact:** Works for org websites that have a CORS-permissive favicon at a discoverable path. Breaks for anything where we fall back to Google s2 (most common case). Page degrades gracefully — admin can still pick colors manually and apply.
- **Fix:** Proxy the favicon through our own server. Update `/api/org/favicon` to fetch the favicon bytes server-side and return them as a base64 data URL (or stream through a new `/api/org/favicon-proxy?url=...` endpoint). Then the client `<img>` loads from same-origin → no CORS issue → color extraction succeeds. Probably 30 min of work.

### 2. Recharts "width(-1) and height(-1)" warnings on /admin/analytics — MEDIUM
- **Symptom:** 3 console warnings on initial load of /admin/analytics:
  > "The width(-1) and height(-1) of chart should be greater than 0..."
- **Root cause:** Recharts `ResponsiveContainer` measures its parent before the parent has finished layout (likely because charts are inside a tab/collapsed section, or a CSS Grid that hasn't resolved on first paint).
- **Impact:** Charts likely still render once layout settles, but the warnings pollute console + Sentry/monitoring will flag them. Not user-facing.
- **Fix:** Either pass explicit `width=` and `height=` to each chart, or wrap `ResponsiveContainer` with `style={{ minWidth: 0, minHeight: 0 }}` on the parent. Quick fix.

### 3. Picker "library" was empty for ~1 commit window (FIXED MID-SWEEP)
- **Was:** /api/media returned 0 items even though PSP marketing photos existed in `/public/images/`. The endpoint only checked `/public/media/` (empty metadata.json placeholders from ShockAI) and Supabase Storage (also empty/inaccessible).
- **Fixed in commit `9eb07df`:** added `listPublicImages()` reading `/public/images/`. Picker now shows 9 photos: Costal At Bat, PSP Softball Athlete, PSP-black brand logo, Praticing Soccer Drills, Proper Sports Performance, Top View Soccer Traing, coach rachel psp, over the shoulder psp pitching, psp pitcher.
- **Verified live** at /admin/courses → New/Edit → Choose image → photos in grid.

---

## Suggested next steps

1. **#1 favicon CORS proxy** — biggest user-facing bug found this sweep. Without it, the Auto Brand Scan rarely works on real-world URLs.
2. **#2 recharts warnings** — quick cleanup, kills 3 warnings on every analytics page load.
3. **Supabase Storage `images` bucket** — currently empty/unlisted. Once you start dropping files in via Supabase dashboard, the picker will auto-include them alongside `/public/images/` (already wired).
4. **`/public/media/` cleanup** — has leftover ShockAI folders (`digital-builds/`, `drone/`, `motion-graphics/`, `podcast/`, etc.) with empty `metadata.json` files. Safe to delete.

---

## Screenshots taken (gitignored, in repo root)

- `sweep-01-admin-hub.png` — admin landing
- `sweep-02-admin-courses.png` — courses list
- `sweep-03-courses-edit-modal.png` — Edit Course modal with Choose image button
- `sweep-04-media-picker-library.png` — picker library tab (empty pre-fix)
- `sweep-05-media-picker-url-tab.png` — picker URL paste tab
- `sweep-06-picker-with-images.png` — picker with 9 PSP photos (post-fix)
- `sweep-07-admin-services.png` — services list
- `sweep-08-services-picker.png` — services edit modal showing picker
- `sweep-09-admin-org.png` — org overview
- `sweep-10-branding-tab.png` — branding tab with website-URL input
- `sweep-11-branding-scan-result.png` — favicon CORS fail with graceful degraded UI
- `sweep-12-admin-athletes.png`, `sweep-13-admin-analytics.png` — admin pages
- `sweep-14-courses-athlete.png`, `sweep-15-courses-show-more-expanded.png` — Show more before/after
