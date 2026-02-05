'use client'

import { ReactNode } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { WalletConnectPrompt } from '@/components/studio/wallet-connect-prompt'
import { StudioHeader } from '@/components/studio/studio-header'

interface StudioLayoutProps {
  children: ReactNode
}

export default function StudioLayout({ children }: StudioLayoutProps) {
  const { address, isConnected } = useAccount()
  const { connectors, connectAsync, isPending } = useConnect()

  if (!isConnected) {
    return (
      <WalletConnectPrompt
        connectors={connectors}
        connectAsync={connectAsync}
        isPending={isPending}
      />
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <StudioHeader walletAddress={address} />
      <main>{children}</main>
    </div>
  )
}
