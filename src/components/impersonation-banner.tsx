'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

export function ImpersonationBanner() {
  const [userName, setUserName] = useState<string | null>(null)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const checkCookie = () => {
      const cookies = document.cookie.split(';').map(c => c.trim())
      const nameCookie = cookies.find(c => c.startsWith('impersonation_user_name_ui='))
      const name = nameCookie?.split('=')[1]
      setUserName(name ? decodeURIComponent(name) : null)
    }
    checkCookie()
    const interval = setInterval(checkCookie, 3000)
    return () => clearInterval(interval)
  }, [])

  if (!userName) return null

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
    <div className="fixed top-0 left-0 right-0 z-[110] bg-amber-600 text-white text-center py-2 px-4 font-bold text-sm flex items-center justify-center gap-3 shadow-lg">
      <Eye className="w-4 h-4" />
      VIEWING AS: {userName} — Read-only mode
      <button
        onClick={handleExit}
        disabled={exiting}
        className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
      >
        {exiting ? 'Exiting...' : 'Exit View'}
      </button>
    </div>
  )
}
