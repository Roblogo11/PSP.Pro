'use client'

import { ReactNode } from 'react'

interface MotionProviderProps {
  children: ReactNode
}

// Slide animation removed for performance - using FlashLoader instead
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  )
}
