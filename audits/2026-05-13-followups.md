# Follow-Up Fixes — 2026-05-13 (commits 35d7e25 + 8f9568c + this commit)

After the admin sweep (`b2becd7`) found two issues, this round addressed:

## ✅ Fixed

### 1. Favicon CORS proxy — HIGH (`35d7e25`)
**Before:** Pasting any external URL into /admin/org Branding triggered Google s2 favicon fallback → client `<img crossOrigin="anonymous">` → CORS taint → color extraction silently failed.

**Fix:** `/api/org/favicon` now fetches the favicon bytes server-side from the first working candidate (parsed `<link rel="icon">`, then `/favicon.ico`, then Google s2), base64-encodes them with sniffed MIME, and returns both `faviconUrl` (for storage as `logo_url`) and `dataUrl` (for client canvas extraction). `LogoColorExtractor` reads from `dataUrl` → no cross-origin → canvas read succeeds.

**Verified live:** Pasted `https://stripe.com` → got purple Stripe icon + color swatches extracted ("Colors extracted — pick one for each slot") → **zero console errors**.

### 2. /admin/courses action pill contrast in light mode — MEDIUM (this commit)
**Before:** Action buttons (Lessons, Enroll, Edit, Delete) used Tailwind text colors designed for dark mode (`text-pink-400`, `text-cyan`, `text-red-400`) on near-transparent backgrounds. In light mode those resolved to faded pastels with no contrast against light pill backgrounds — unreadable.

**Fix:** Added `dark:`-qualified colors so light mode now uses the saturated 700 shade (`text-pink-700`, `text-cyan-700`, `text-red-700`).

## ⚠️ Attempted but recharts is recharts

### 3. Recharts width(-1) height(-1) warnings — MEDIUM (`8f9568c`)
**Tried:** Added `minWidth={0} minHeight={0}` to all 3 `ResponsiveContainer` instances, then also gated each chart behind a `chartsReady` flag flipped after `requestAnimationFrame`.

**Result:** **Warnings still fire 3x on every analytics page load.** Charts themselves render correctly (332×192). The warning is emitted by recharts during its first synchronous measurement before React commits the parent layout — neither `minWidth` nor deferred mounting suppresses it.

**Accepted as noise.** No user impact. To truly silence we'd need to either patch recharts, swap to a different chart lib, or wrap with an IntersectionObserver-based mount. Not worth it right now.

## ✅ Light-mode sweep (was missing from previous audit)

Done on all key pages at mobile 390×844 with `localStorage.theme = 'light'` forced:

| Page | Light mode | Notes |
|------|------------|-------|
| `/admin` | ✅ Clean | Cream bg, dark text, KPI cards readable |
| `/admin/courses` | ✅ Fixed in this commit | Action pills now readable |
| `/admin/drills` | ✅ Clean | |
| `/admin/services` | ✅ Clean | |
| `/admin/org` (Branding tab) | ✅ Clean | Scan flow renders well |
| `/admin/analytics` | ✅ Clean | KPI cards readable; recharts warnings (#3) noise only |
| `/admin/athletes` | ✅ Clean | |
| `/admin/bookings` | ✅ Clean | |
| `/locker` | ✅ Clean | |
| `/courses` (athlete) | ✅ Clean — "Show more" link orange/visible | |
| `/progress` | ✅ Clean | |

**No more contrast issues found in light mode beyond #2.** All admin and athlete dashboard pages respect both themes correctly now.

---

## Net state after this round

- ✅ Picker working end-to-end with 9 PSP photos (commit `9eb07df`)
- ✅ "Show more" on /courses (commit `da81fd6`)
- ✅ Favicon CORS proxied (commit `35d7e25`)
- ✅ Both themes verified across all major surfaces
- ✅ /admin/courses pills fixed (this commit)
- ⚠️ Recharts warnings present but harmless

No more known UX bugs on the live deploy.
