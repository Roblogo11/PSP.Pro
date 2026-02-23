/**
 * Client-side tour helpers.
 * Mirrors the simulation track.ts pattern.
 */

/** Read the tour_id from the JS-readable cookie */
export function getTourId(): string | null {
  if (typeof window === 'undefined') return null
  const cookies = document.cookie.split(';').map(c => c.trim())
  const tourCookie = cookies.find(c => c.startsWith('tour_id_ui='))
  return tourCookie?.split('=')[1] || null
}

/** Check if a tour is currently active */
export function isTourActive(): boolean {
  if (typeof window === 'undefined') return false
  const cookies = document.cookie.split(';').map(c => c.trim())
  const activeCookie = cookies.find(c => c.startsWith('tour_active_ui='))
  return activeCookie?.split('=')[1] === 'true'
}

/**
 * Track a record created during the tour.
 * Reuses the simulation_data_log table via the same track endpoint.
 * No-op if tour is not active.
 */
export async function trackTourData(tableName: string, recordId: string): Promise<void> {
  if (!isTourActive()) return

  const tourId = getTourId()
  if (!tourId) return

  try {
    await fetch('/api/admin/simulation/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName, recordId, simulationId: tourId }),
    })
  } catch {
    // Non-critical
  }
}

/** Pages that have a defined tour. Used to show "Start Tour" prompt. */
export const TOUR_PAGES = [
  '/locker', '/booking', '/sessions', '/progress', '/drills', '/settings',
  '/achievements', '/leaderboards', '/messages', '/courses', '/questionnaires', '/video-analysis', '/progress-report',
]

/** Check if the current page has a tour available */
export function pageHasTour(pathname: string): boolean {
  return TOUR_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'))
}

/** localStorage key for tracking which pages the user has visited */
const VISITED_KEY = 'psp_visited_pages'

/** Mark a page as visited (so Dr. Prop only offers the tour once per page) */
export function markPageVisited(pathname: string): void {
  if (typeof window === 'undefined') return
  try {
    const visited = getVisitedPages()
    visited.add(pathname)
    localStorage.setItem(VISITED_KEY, JSON.stringify([...visited]))
  } catch { /* ignore */ }
}

/** Get all visited pages */
export function getVisitedPages(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(VISITED_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

/** Check if this is the user's first visit to a page */
export function isFirstVisit(pathname: string): boolean {
  return !getVisitedPages().has(pathname)
}

/** Reset visited pages (for testing or re-onboarding) */
export function resetTourHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(VISITED_KEY)
}
