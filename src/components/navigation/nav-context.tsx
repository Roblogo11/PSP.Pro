'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getTransitionDirection } from '@/config/navigation'

interface NavContextValue {
  direction: number
  previousPath: string | null
  setNavigationDirection: (dir: number) => void
}

const NavContext = createContext<NavContextValue | null>(null)

export function NavProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const previousPathRef = useRef<string | null>(null)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    if (previousPathRef.current && previousPathRef.current !== pathname) {
      const dir = getTransitionDirection(previousPathRef.current, pathname)
      setDirection(dir)
    }
    previousPathRef.current = pathname
  }, [pathname])

  const setNavigationDirection = useCallback((dir: number) => {
    setDirection(dir)
  }, [])

  return (
    <NavContext.Provider
      value={{
        direction,
        previousPath: previousPathRef.current,
        setNavigationDirection,
      }}
    >
      {children}
    </NavContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavProvider')
  }
  return context
}
