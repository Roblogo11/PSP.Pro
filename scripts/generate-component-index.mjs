#!/usr/bin/env node
/**
 * generate-component-index.mjs
 * ===========================
 * Walks src/components/, src/lib/, src/app/api/, src/lib/hooks/ and builds
 * COMPONENT-INDEX.md at the PSP.Pro repo root — a fresh index of every
 * component, lib helper, hook, and API route, with the primary export and
 * a one-line description.
 *
 * Description sources, in priority order:
 *   1. The first JSDoc /** ... *\/ block at the top of the file
 *   2. A leading // comment in the first ~8 non-blank lines
 *   3. The exported symbol's name as a fallback
 *
 * Why this exists: PSP.Pro has 57 pages + 53 API routes + dozens of shared
 * components. Without an index, new work re-invents what's already shipped
 * (we've already seen this — two booking-related "current_bookings + 1"
 * paths were maintained in parallel before migration 052 unified them).
 * This file is a hot building memory: search before writing.
 *
 * Idempotent. Run on every commit via the pre-commit hook, or manually with
 * `npm run index`.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const ROOTS = [
  { dir: 'src/components', label: 'Components' },
  { dir: 'src/lib',        label: 'Library / helpers' },
  { dir: 'src/lib/hooks',  label: 'Hooks' },
  { dir: 'src/app/api',    label: 'API routes' },
]

// Skip these — index.ts re-exports, generated types, etc.
const SKIP_FILES = new Set(['index.ts', 'index.tsx'])
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build'])

function walk(dir, hits = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return hits }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue
    const full = join(dir, name)
    const stats = statSync(full)
    if (stats.isDirectory()) {
      walk(full, hits)
    } else if (
      (name.endsWith('.ts') || name.endsWith('.tsx')) &&
      !name.endsWith('.d.ts') &&
      !SKIP_FILES.has(name)
    ) {
      hits.push(full)
    }
  }
  return hits
}

/** Pull the leading JSDoc block (or // comment) as a 1-line description. */
function extractDescription(content) {
  // Try JSDoc first: /** ... */
  const jsdocMatch = content.match(/^\s*\/\*\*([\s\S]*?)\*\//)
  if (jsdocMatch) {
    const lines = jsdocMatch[1]
      .split('\n')
      .map(l => l.replace(/^\s*\*\s?/, '').trim())
      .filter(l => l && !l.startsWith('@') && !l.match(/^[=\-_]{3,}$/))
    const first = lines[0] ?? ''
    if (first) return first.slice(0, 120)
  }
  // Fall back to leading // comments
  const lines = content.split('\n').slice(0, 8)
  for (const line of lines) {
    const m = line.match(/^\s*\/\/\s?(.+)/)
    if (m) return m[1].trim().slice(0, 120)
  }
  return ''
}

/** Pull the primary export name from a file (function/const/class). */
function extractMainExport(content) {
  const fn = content.match(/^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/m)
  if (fn) return fn[1]
  const c = content.match(/^export\s+const\s+(\w+)/m)
  if (c) return c[1]
  const cls = content.match(/^export\s+class\s+(\w+)/m)
  if (cls) return cls[1]
  const def = content.match(/^export\s+default\s+(\w+)/m)
  if (def) return def[1]
  return ''
}

/** API routes: detect which HTTP methods are exported. */
function extractRouteMethods(content) {
  const methods = []
  for (const m of ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']) {
    if (content.match(new RegExp(`^export\\s+(?:async\\s+)?function\\s+${m}\\b`, 'm'))) {
      methods.push(m)
    }
  }
  return methods
}

function gather() {
  const sections = []
  // Track which files we've already indexed (hooks live inside lib/ so we
  // don't want them counted twice).
  const seen = new Set()
  for (const root of ROOTS) {
    const dir = join(ROOT, root.dir)
    const files = walk(dir)
    if (files.length === 0) continue

    const items = []
    for (const file of files.sort()) {
      const rel = relative(ROOT, file).split(sep).join('/')
      // For lib/hooks specifically, only include from the hooks pass.
      // For lib/, exclude hooks (handled separately).
      if (root.dir === 'src/lib' && rel.startsWith('src/lib/hooks/')) continue
      if (seen.has(rel)) continue
      seen.add(rel)

      let content
      try { content = readFileSync(file, 'utf8') } catch { continue }

      const desc = extractDescription(content)
      let label
      if (root.dir === 'src/app/api') {
        const methods = extractRouteMethods(content)
        const route = '/' + rel
          .replace(/^src\/app/, '')
          .replace(/\/route\.tsx?$/, '')
        label = methods.length > 0
          ? `${methods.join(' / ')} ${route}`
          : route
      } else {
        const exp = extractMainExport(content)
        label = exp || rel.split('/').pop().replace(/\.tsx?$/, '')
      }
      items.push({ rel, label, desc })
    }
    sections.push({ ...root, items })
  }
  return sections
}

function format(sections) {
  const date = new Date().toISOString().slice(0, 10)
  const lines = []
  lines.push('# PSP.Pro Component Index')
  lines.push('')
  lines.push(`> **Auto-generated** by \`scripts/generate-component-index.mjs\`. Do not edit by hand — your edits will be overwritten on the next commit.`)
  lines.push(`>`)
  lines.push(`> Last refresh: ${date}. Auto-regenerated by the pre-commit git hook (see \`scripts/git-hooks/pre-commit\`). Run \`npm run index\` to regenerate manually.`)
  lines.push('')
  lines.push('Use this as a hot building memory: **search for what we already have before writing something new.** Each entry shows the file path, the primary export, and a one-line description (pulled from the file\'s top JSDoc / leading comment).')
  lines.push('')

  let totalCount = 0
  for (const section of sections) {
    if (section.items.length === 0) continue
    totalCount += section.items.length
    lines.push(`## ${section.label} (${section.items.length})`)
    lines.push('')
    for (const item of section.items) {
      const path = item.rel
      const label = item.label || ''
      const desc = item.desc || ''
      const labelPart = label ? `\`${label}\`` : ''
      const descPart = desc ? ` — ${desc}` : ''
      lines.push(`- [${path}](${path}) ${labelPart}${descPart}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push(`**Total:** ${totalCount} files indexed across ${sections.length} sections.`)
  lines.push('')

  return lines.join('\n')
}

function main() {
  const sections = gather()
  const md = format(sections)
  const out = join(ROOT, 'COMPONENT-INDEX.md')
  writeFileSync(out, md, 'utf8')
  console.log(`✓ COMPONENT-INDEX.md regenerated (${sections.reduce((n, s) => n + s.items.length, 0)} files indexed)`)
}

main()
