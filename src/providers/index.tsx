'use client'

import { ReactNode, Suspense } from 'react'
import { MotionProvider } from './motion-provider'
import { NavProvider } from '@/components/navigation/nav-context'
import { ThemeProvider } from '@/lib/contexts/theme-context'
import { FlashLoader } from '@/components/flash-loader'
import { AnnounceProvider } from '@/components/ui/announce'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <NavProvider>
        <Suspense fallback={null}>
          <FlashLoader />
        </Suspense>
        <AnnounceProvider>
          <MotionProvider>{children}</MotionProvider>
        </AnnounceProvider>
      </NavProvider>
    </ThemeProvider>
  )
}
