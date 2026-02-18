'use client'

import { useEffect, useState } from 'react'
import { UserCircle } from 'lucide-react'

export function SimulationBanner() {
  const [simulatedRole, setSimulatedRole] = useState<string | null>(null)
  const [ending, setEnding] = useState(false)

  useEffect(() => {
    const checkCookie = () => {
      const cookies = document.cookie.split(';').map(c => c.trim())
      const simCookie = cookies.find(c => c.startsWith('simulation_role_ui='))
      setSimulatedRole(simCookie?.split('=')[1] || null)
    }
    checkCookie()
    const interval = setInterval(checkCookie, 3000)
    return () => clearInterval(interval)
  }, [])

  if (!simulatedRole) return null

  const handleEndAndCleanup = async () => {
    setEnding(true)
    try {
      // Read simulation ID from cookie before clearing
      const cookies = document.cookie.split(';').map(c => c.trim())
      const simIdCookie = cookies.find(c => c.startsWith('simulation_id_ui='))
      const simulationId = simIdCookie?.split('=')[1]

      // End the simulation (clears cookies)
      const endRes = await fetch('/api/admin/simulation', { method: 'DELETE' })
      if (!endRes.ok) {
        console.error('Failed to end simulation:', await endRes.text())
      }

      // Clean up simulation data if we have a session ID
      if (simulationId) {
        const cleanupRes = await fetch('/api/admin/simulation/cleanup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ simulationId }),
        })
        if (!cleanupRes.ok) {
          console.error('Failed to cleanup simulation:', await cleanupRes.text())
        }
      }

      window.location.reload()
    } catch {
      setEnding(false)
    }
  }

  const roleLabel = simulatedRole === 'athlete' ? 'PLAYER' : 'COACH'

  return (
    <div className="fixed top-0 left-0 right-0 z-[110] bg-purple-600 text-white text-center py-2 px-4 font-bold text-sm flex items-center justify-center gap-3 shadow-lg">
      <UserCircle className="w-4 h-4" />
      SIMULATING AS: {roleLabel} — All actions tracked for cleanup
      <button
        onClick={handleEndAndCleanup}
        disabled={ending}
        className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
      >
        {ending ? 'Cleaning up...' : 'End & Clean Up'}
      </button>
    </div>
  )
}
