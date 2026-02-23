/**
 * In-memory sliding window rate limiter.
 * Suitable for single-instance deployments (Vercel serverless handles this per-function).
 * For multi-instance deployments, swap to Upstash Redis (@upstash/ratelimit).
 */

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Periodically clean up expired entries to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now

  const cutoff = now - windowMs
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff)
    if (entry.timestamps.length === 0) store.delete(key)
  }
}

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number
  /** Time window in seconds */
  windowSec: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number // seconds until window resets
}

export function rateLimit(
  key: string,
  { limit, windowSec }: RateLimitOptions
): RateLimitResult {
  const windowMs = windowSec * 1000
  const now = Date.now()
  const cutoff = now - windowMs

  cleanup(windowMs)

  let entry = store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => t > cutoff)

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0]
    const resetIn = Math.ceil((oldest + windowMs - now) / 1000)
    return { allowed: false, remaining: 0, resetIn }
  }

  entry.timestamps.push(now)
  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    resetIn: windowSec,
  }
}

/**
 * Helper to extract a rate limit key from a request.
 * Uses x-forwarded-for (Vercel/proxy), falls back to x-real-ip, then 'unknown'.
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}
