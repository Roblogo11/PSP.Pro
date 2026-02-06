'use client'

import { ReactNode, Suspense } from 'react'
import { Web3Provider } from './web3-provider'
import { MotionProvider } from './motion-provider'
import { NavProvider } from '@/components/navigation/nav-context'
import { ThemeProvider } from '@/lib/contexts/theme-context'
import { FlashLoader } from '@/components/flash-loader'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <Web3Provider>
        <NavProvider>
          <Suspense fallback={null}>
            <FlashLoader />
          </Suspense>
          <MotionProvider>{children}</MotionProvider>
        </NavProvider>
      </Web3Provider>
    </ThemeProvider>
  )
}
