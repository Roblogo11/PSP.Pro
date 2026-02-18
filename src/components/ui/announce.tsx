'use client'

import { useState, useCallback, createContext, useContext } from 'react'

interface AnnounceContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void
}

const AnnounceContext = createContext<AnnounceContextType>({
  announce: () => {},
})

export function useAnnounce() {
  return useContext(AnnounceContext)
}

export function AnnounceProvider({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('')
  const [assertiveMessage, setAssertiveMessage] = useState('')

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage('')
      // Force re-render by clearing then setting
      requestAnimationFrame(() => setAssertiveMessage(message))
    } else {
      setPoliteMessage('')
      requestAnimationFrame(() => setPoliteMessage(message))
    }
  }, [])

  return (
    <AnnounceContext.Provider value={{ announce }}>
      {children}
      {/* Screen-reader-only live regions */}
      <div
        aria-live="polite"
        aria-atomic="true"
        role="status"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnounceContext.Provider>
  )
}
