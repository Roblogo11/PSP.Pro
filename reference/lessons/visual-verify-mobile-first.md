# Lesson: Visual-verify mobile-first via screenshot, every UI change

**Status:** Locked. Reinforced across every PSP session.
**Pain history:** Multiple sessions where "typecheck passing → ship" produced regressions visible only when actually rendering the page.

## The rule

For ANY UI change on PSP.Pro:

1. Start the dev server (or hit production after deploy)
2. Capture the affected page with headless Chrome at **mobile viewport (390×844) first**
3. Capture desktop (1280×2000) second
4. **`Read` the PNG file** — actually look at the image, don't just confirm "200 OK"
5. Only then declare the change verified

Mobile first because PSP's primary user is a parent on the sideline at a game checking the booking app on their phone. Rachel uses her phone to spot-check most of the time. Mobile breaks first when something's wrong; desktop hides bugs that ship to the people who matter.

## Why typecheck isn't enough

- `tsc --noEmit` proves the code compiles
- It does NOT prove the layout renders without overlap, that the data actually loads, that auth gates fire correctly, that Tailwind classes apply, that the hydration boundary holds, or that the user sees what we think they see
- Most of our worst regressions (busted course detail page, courses list dark mode, gray-flash issue) all passed type-check

## The screenshot recipe

Quick capture without MCP (Chrome CLI works):

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Mobile FIRST
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-sandbox \
  --window-size=390,1800 --virtual-time-budget=4000 \
  --screenshot=/tmp/page-mobile.png \
  "https://propersports.pro/<route>"

# Desktop second
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-sandbox \
  --window-size=1280,2000 --virtual-time-budget=4000 \
  --screenshot=/tmp/page-desktop.png \
  "https://propersports.pro/<route>"
```

Then use the `Read` tool on each PNG path.

## Auth-gated pages

Most of `/admin/*`, `/locker`, `/booking` etc. require login. For these, use `puppeteer-core` (installed in PSP — uses existing Chrome, no extra Chromium download). Provision a disposable test admin via Supabase service_role key, log in via `/login`, then drive the captures. Pattern saved in commit history; ask if you need to rebuild it.

## Walk siblings, go deep

- If a component is shared (e.g. `command-panel`, `glass-card`), screenshot it on 3+ consumer pages — bug on one is usually bug on all
- Go at least 3 click-levels from the changed root element
- Don't stop at first match — `grep -rln '<ComponentName' src/` to find every consumer
- Report findings grouped by root cause, not by URL

## Composes with

- `feedback_visual_via_screenshot_mobile_first.md` (the personal-memory version)
- `feedback_visual_audit_depth_dedupe.md` (deep + wide + deduped audits)
- `feedback_mobile_first.md` (original — superseded by this but kept for backref)
