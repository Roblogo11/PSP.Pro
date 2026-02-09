/**
 * Client-side simulation helpers.
 * Used by components to detect simulation mode and track created data.
 */

/** Read the simulation_id from the JS-readable cookie */
export function getSimulationId(): string | null {
  if (typeof window === 'undefined') return null
  const cookies = document.cookie.split(';').map(c => c.trim())
  const simCookie = cookies.find(c => c.startsWith('simulation_id_ui='))
  return simCookie?.split('=')[1] || null
}

/** Check if a simulation is currently active */
export function isSimulationActive(): boolean {
  return !!getSimulationId()
}

/** Read the simulated role from the JS-readable cookie */
export function getSimulatedRole(): string | null {
  if (typeof window === 'undefined') return null
  const cookies = document.cookie.split(';').map(c => c.trim())
  const roleCookie = cookies.find(c => c.startsWith('simulation_role_ui='))
  return roleCookie?.split('=')[1] || null
}

/**
 * Track a record created during simulation.
 * No-op if not in simulation mode.
 */
export async function trackSimulationData(
  tableName: string,
  recordId: string
): Promise<void> {
  if (!isSimulationActive()) return

  try {
    await fetch('/api/admin/simulation/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName, recordId }),
    })
  } catch {
    // Non-critical — don't break the user flow
  }
}
