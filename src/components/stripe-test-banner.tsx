'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export function StripeTestBanner() {
  const [testMode, setTestMode] = useState(false)

  useEffect(() => {
    const checkCookie = () => {
      const cookies = document.cookie.split(';').map(c => c.trim())
      const testCookie = cookies.find(c => c.startsWith('stripe_test_mode_ui='))
      setTestMode(testCookie?.split('=')[1] === 'true')
    }

    checkCookie()
    // Re-check periodically in case admin toggles it in another tab
    const interval = setInterval(checkCookie, 3000)
    return () => clearInterval(interval)
  }, [])

  if (!testMode) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-black text-center py-2 px-4 font-bold text-sm flex items-center justify-center gap-2 shadow-lg">
      <AlertTriangle className="w-4 h-4" />
      STRIPE TEST MODE — No real charges will be processed. Use card 4242 4242 4242 4242
      <AlertTriangle className="w-4 h-4" />
    </div>
  )
}
