'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

const COOKIE_KEY = 'cookie_consent'
const COOKIE_EXPIRY_DAYS = 365

function setCookieConsent(value: 'all' | 'essential') {
  const expires = new Date()
  expires.setDate(expires.getDate() + COOKIE_EXPIRY_DAYS)
  document.cookie = `${COOKIE_KEY}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

function getCookieConsent(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if no consent recorded yet
    const existing = getCookieConsent()
    if (!existing) {
      // Small delay so it doesn't flash immediately on load
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  const handleAccept = () => {
    setCookieConsent('all')
    setVisible(false)
  }

  const handleEssentialOnly = () => {
    setCookieConsent('essential')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-[105] p-4 md:p-6"
    >
      <div className="max-w-4xl mx-auto bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Icon + text */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Cookie className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/80 leading-relaxed">
              We use essential cookies for authentication and optional analytics to improve your experience.{' '}
              <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleEssentialOnly}
              className="px-4 py-2 text-sm text-white/60 hover:text-white/90 border border-white/10 hover:border-white/20 rounded-lg transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={handleEssentialOnly}
              aria-label="Dismiss"
              className="p-1.5 text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
