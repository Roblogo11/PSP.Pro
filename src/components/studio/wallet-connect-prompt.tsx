'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Loader2, Lock, Zap } from 'lucide-react'
import { Connector } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import {
  GenerativeMotion,
  FloatingShapes,
  GridPattern,
} from '@/components/generative-motion'

interface WalletConnectPromptProps {
  connectors: readonly Connector[]
  connectAsync: (args: { connector: Connector }) => Promise<unknown>
  isPending: boolean
}

export function WalletConnectPrompt({
  connectors,
  connectAsync,
  isPending,
}: WalletConnectPromptProps) {
  const [error, setError] = useState<string | null>(null)

  const handleConnect = useCallback(async () => {
    setError(null)
    try {
      const injected = connectors.find((c) => c.id === 'injected')
      if (injected) {
        await connectAsync({ connector: injected })
      } else if (connectors.length > 0) {
        await connectAsync({ connector: connectors[0] })
      }
    } catch {
      setError('Connection failed. Make sure you have a wallet installed.')
    }
  }, [connectors, connectAsync])

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <Container className="relative z-10 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-8 rounded-2xl bg-dark-100/90 backdrop-blur-sm border border-secondary/20 shadow-glow-md"
        >
          <div className="text-center space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary to-accent opacity-20 blur-xl" />
              <div className="relative p-5 rounded-full bg-secondary/10 border border-secondary/20">
                <Lock className="w-10 h-10 text-secondary" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-accent" />
                <h1 className="text-2xl font-bold text-white">Shock Studio</h1>
              </div>
              <p className="text-gray-400">
                Connect your wallet to access the AI transition template builder
              </p>
            </div>

            <Button onClick={handleConnect} disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm"
              >
                {error}
              </motion.p>
            )}

            <p className="text-xs text-gray-500">
              MetaMask, Coinbase Wallet, or any injected wallet supported
            </p>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
