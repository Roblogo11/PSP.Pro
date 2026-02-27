'use client'

import { useEffect, useState } from 'react'
import { Eye, UserCircle } from 'lucide-react'

export function ImpersonationBanner() {
  const [userName, setUserName] = useState<string | null>(null)
  const [coachName, setCoachName] = useState<string | null>(null)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const checkCookie = () => {
      const cookies = document.cookie.split(';').map(c => c.trim())

      // Athlete impersonation
      const nameCookie = cookies.find(c => c.startsWith('impersonation_user_name_ui='))
      const name = nameCookie?.split('=')[1]
      setUserName(name ? decodeURIComponent(name) : null)

      // Coach impersonation
      const coachNameCookie = cookies.find(c => c.startsWith('impersonation_coach_name_ui='))
      const cName = coachNameCookie?.split('=')[1]
      setCoachName(cName ? decodeURIComponent(cName) : null)
    }
    checkCookie()
    const interval = setInterval(checkCookie, 3000)
    return () => clearInterval(interval)
  }, [])

  const isActive = !!(userName || coachName)
  if (!isActive) return null

  const handleExit = async () => {
    setExiting(true)
    try {
      const res = await fetch('/api/admin/impersonation', { method: 'DELETE' })
      if (!res.ok) {
        console.error('Failed to exit impersonation:', await res.text())
      }
      window.location.href = '/admin'
    } catch {
      setExiting(false)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[110] bg-amber-600 text-white text-center py-2 px-4 font-bold text-sm flex items-center justify-center gap-2 sm:gap-3 shadow-lg">
      {coachName ? (
        <>
          <UserCircle className="w-4 h-4 flex-shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-none">VIEWING AS COACH: {coachName}</span>
          <span className="hidden sm:inline">— Read-only</span>
        </>
      ) : (
        <>
          <Eye className="w-4 h-4 flex-shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-none">VIEWING AS PLAYER: {userName}</span>
          <span className="hidden sm:inline">— Read-only</span>
        </>
      )}
      <button
        onClick={handleExit}
        disabled={exiting}
        className="ml-1 sm:ml-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex-shrink-0"
      >
        {exiting ? 'Exiting...' : 'Exit'}
      </button>
    </div>
  )
}
