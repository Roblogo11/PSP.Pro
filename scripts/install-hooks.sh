#!/usr/bin/env bash
# PSP.Pro install-hooks.sh — symlink scripts/git-hooks/* into .git/hooks/
# ========================================================================
# One-time setup per clone. Idempotent. Run after `git clone`:
#
#   bash scripts/install-hooks.sh
#   # or
#   npm run hooks
#
# Re-run anytime to verify all tracked hooks are linked + executable.
# Use `bash scripts/install-hooks.sh --check` (or `npm run hooks:check`)
# to verify without modifying anything (returns nonzero if any hook is
# missing/broken — perfect for CI or session startup sanity checks).
#
# Why symlinks (not copies):
#   - When we update a hook in scripts/git-hooks/, the active hook
#     updates immediately. No second install step, no drift.
#   - .git/hooks/ doesn't get committed, so per-clone install is the
#     only way to share a hook across machines anyway.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

CHECK_ONLY=0
if [[ "${1:-}" == "--check" ]]; then
  CHECK_ONLY=1
fi

HOOKS_SOURCE="$REPO_ROOT/scripts/git-hooks"
HOOKS_TARGET="$REPO_ROOT/.git/hooks"

if [[ ! -d "$HOOKS_TARGET" ]]; then
  echo "✗ Not a git repo (missing .git/hooks)."
  exit 1
fi

if [[ ! -d "$HOOKS_SOURCE" ]]; then
  echo "✗ scripts/git-hooks/ missing — nothing to install."
  exit 1
fi

EXIT_CODE=0
INSTALLED=0
ALREADY=0
BROKEN=0

# Walk every tracked hook
shopt -s nullglob
for hook_path in "$HOOKS_SOURCE"/*; do
  hook_name="$(basename "$hook_path")"
  target="$HOOKS_TARGET/$hook_name"

  # Skip non-executables (READMEs, etc.)
  if [[ ! -x "$hook_path" ]]; then
    continue
  fi

  # Already a correct symlink?
  if [[ -L "$target" && "$(readlink "$target")" == "../../scripts/git-hooks/$hook_name" ]]; then
    ((ALREADY++)) || true
    continue
  fi

  # Broken or wrong-target symlink, OR a real file in the way?
  if [[ -e "$target" || -L "$target" ]]; then
    if [[ "$CHECK_ONLY" == "1" ]]; then
      echo "✗ $hook_name: file in place but not the right symlink"
      ((BROKEN++)) || true
      EXIT_CODE=1
      continue
    fi
    rm -f "$target"
  fi

  if [[ "$CHECK_ONLY" == "1" ]]; then
    echo "✗ $hook_name: not installed"
    ((BROKEN++)) || true
    EXIT_CODE=1
    continue
  fi

  # Install: symlink with a relative path so it works from any cwd
  ln -s "../../scripts/git-hooks/$hook_name" "$target"
  echo "✓ Installed $hook_name"
  ((INSTALLED++)) || true
done

if [[ "$CHECK_ONLY" == "1" ]]; then
  if [[ "$EXIT_CODE" == "0" ]]; then
    echo "✓ All hooks installed ($ALREADY linked)."
  else
    echo ""
    echo "  Run \`bash scripts/install-hooks.sh\` (or \`npm run hooks\`) to fix."
  fi
  exit $EXIT_CODE
fi

if [[ "$INSTALLED" == "0" && "$ALREADY" -gt 0 ]]; then
  echo "✓ All $ALREADY hooks already installed and current."
elif [[ "$INSTALLED" -gt 0 ]]; then
  echo ""
  echo "✓ Installed $INSTALLED new hook(s); $ALREADY already current."
fi
