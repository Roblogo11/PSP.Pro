/**
 * Human-readable date ranges for multi-day events.
 *
 * ⚠ Always parse date-only strings with an explicit midday time. `new Date('2026-08-03')`
 * is parsed as UTC midnight, which renders as the PREVIOUS day in US timezones —
 * a 3-day camp would display starting a day early.
 */

const parseLocal = (isoDate: string) => new Date(`${isoDate}T12:00:00`)

/**
 * "Aug 3–5, 2026"        — same month
 * "Jul 30 – Aug 2, 2026" — spans months
 * "Aug 3, 2026"          — single day
 */
export function formatEventRange(startDate: string, endDate: string): string {
  const start = parseLocal(startDate)
  const end = parseLocal(endDate)

  const month = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' })
  const year = end.getFullYear()

  if (startDate === endDate) {
    return `${month(start)} ${start.getDate()}, ${year}`
  }

  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()

  if (sameMonth) {
    return `${month(start)} ${start.getDate()}–${end.getDate()}, ${year}`
  }

  const startYear = start.getFullYear() !== year ? `, ${start.getFullYear()}` : ''
  return `${month(start)} ${start.getDate()}${startYear} – ${month(end)} ${end.getDate()}, ${year}`
}

/** Inclusive day count — a Mon-to-Wed camp is 3 days, not 2. */
export function eventDayCount(startDate: string, endDate: string): number {
  const ms = parseLocal(endDate).getTime() - parseLocal(startDate).getTime()
  return Math.round(ms / 86_400_000) + 1
}

/** "3-day camp" / "Single day" — for badges. */
export function formatEventDuration(startDate: string, endDate: string): string {
  const days = eventDayCount(startDate, endDate)
  return days === 1 ? 'Single day' : `${days}-day event`
}
