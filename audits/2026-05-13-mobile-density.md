# Mobile KPI Density — 2026-05-13 (commit f6acfca)

You called out massive vertical wasted space on mobile because KPI/stat tile rows were `grid-cols-1` (full-width single column). Fixed across 5 pages.

## What changed

Pattern: `grid-cols-1 md:grid-cols-4` → `grid-cols-2 md:grid-cols-4`
Also tightened gap from `gap-4` to `gap-3 md:gap-4` so 2 tiles breathe at 390px wide.

### Pages converted

| Page | Tiles | Before | After |
|------|-------|--------|-------|
| `/admin/analytics` | Revenue / Bookings / Athletes / Completion | 1-col stack | 2×2 grid |
| `/admin/drills` | Total / Active / Content / Athletes | 1-col stack | 2×2 grid |
| `/admin/athletes` | Total / Soccer / Basketball / Softball | 1-col stack | 2×2 grid |
| `/progress` | Peak Vel / Avg Vel / Sessions / Drills | 1-col stack | 2×2 grid |
| `/drills` (athlete) | stats row | 1-col stack | 2×2 grid |

### Untouched (intentionally)

- **Content cards** (course cards, athlete cards, drill detail cards) — stay 1-col on mobile, too much body text to crunch into half-width
- **`/admin/bookings`** — already `grid-cols-2 md:grid-cols-5`, no change needed
- **`/locker` admin stats** — already `grid-cols-2 lg:grid-cols-4`, no change needed
- **Chart rows** — stay 1-col (`grid-cols-1 lg:grid-cols-2`), charts need width

## Verified on live (Vercel deploy f6acfca → dpl_*) at mobile 390×844

Captured fresh screenshots in **both dark and light mode** for every fixed page. Archive lives in repo root (gitignored, kept locally for visual diff reference):

| Page | Dark | Light |
|------|------|-------|
| /admin/analytics | archive-dark-01-analytics.png | archive-light-01-analytics.png |
| /admin/drills | archive-dark-02-drills.png | archive-light-02-drills.png |
| /admin/athletes | archive-dark-03-athletes.png | archive-light-03-athletes.png |
| /progress | archive-dark-04-progress.png | archive-light-04-progress.png |
| /drills (athlete) | archive-dark-05-athlete-drills.png | archive-light-05-athlete-drills.png |

### Visual review notes

- **Analytics**: Revenue + Bookings on row 1, Athletes + Completion on row 2. Monthly Revenue chart now visible above the fold instead of needing scroll.
- **Drills**: Total/Active/Content/Athletes all in one screen. Search bar visible without scrolling.
- **Athletes**: Biggest win — was the most-scrolled page, now all 4 sport-breakdown tiles fit in one viewport.
- **Progress**: Peak Vel + Avg Vel side-by-side reads cleanly even with `--` placeholders.
- **Both themes look identical structurally**; only theme colors differ as expected.

### No regressions found

Dev tools `getComputedStyle().gridTemplateColumns` confirmed `177px 177px` (2 columns at 390px viewport) on every converted page. No overlap, no text truncation, no broken alignment.

## Visual archive practice

Establishing convention for future sessions:
- `archive-dark-NN-pagename.png` and `archive-light-NN-pagename.png` for after-fix snapshots
- Numbered prefix preserves traversal order
- Living gitignored (covered by `/live-*.png`, `/fix-verify-*.png`, `/verify-*.png` in .gitignore — adding `/archive-*.png` next commit)
