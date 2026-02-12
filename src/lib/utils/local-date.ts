/**
 * Returns today's date as YYYY-MM-DD in the user's LOCAL timezone.
 * Avoids the toISOString() UTC conversion bug where late-evening
 * local times shift to the next day.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
