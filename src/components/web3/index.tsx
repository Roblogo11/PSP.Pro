'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { ShockBoxSkeleton } from './shock-box-skeleton'

// Dynamically import ShockBox with SSR disabled (uses wagmi hooks)
const ShockBoxClient = dynamic(() => import('./shock-box').then((mod) => ({ default: mod.ShockBox })), {
  ssr: false,
  loading: () => <ShockBoxSkeleton />,
})

// Export a Suspense-wrapped version for easy use
export function ShockBoxGated() {
  return (
    <Suspense fallback={<ShockBoxSkeleton />}>
      <ShockBoxClient />
    </Suspense>
  )
}

export { ShockBoxSkeleton }
