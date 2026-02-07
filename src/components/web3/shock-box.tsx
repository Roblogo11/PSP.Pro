'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useConnect, useSignMessage } from 'wagmi'
import { Lock, Unlock, Play, Wallet, Loader2, Sparkles, Shield } from 'lucide-react'
import Image from 'next/image'

// The secret content revealed after signing
const PARTNER_VIDEO_URL = 'https://roblogo.com/wp-content/uploads/2026/02/AI-vs-jobs-SMP.mp4'
const SIGNATURE_MESSAGE = 'Sign to verify your PSP.Pro Partner Session'

// Shatter animation pieces
const shatterPieces = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: (i % 4) * 25,
  y: Math.floor(i / 4) * 33.33,
  rotation: Math.random() * 360,
  delay: Math.random() * 0.2,
}))

export function ShockBox() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { address, isConnected } = useAccount()
  const { connectors, connectAsync } = useConnect()
  const { signMessageAsync } = useSignMessage()

  const handleConnect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Try injected connector first (MetaMask, etc.)
      const injectedConnector = connectors.find((c) => c.id === 'injected')
      if (injectedConnector) {
        await connectAsync({ connector: injectedConnector })
      } else if (connectors.length > 0) {
        await connectAsync({ connector: connectors[0] })
      }
    } catch (err) {
      console.error('Connection failed:', err)
      setError('Connection failed. Make sure you have a wallet installed.')
    } finally {
      setIsConnecting(false)
    }
  }, [connectors, connectAsync])

  const handleUnlock = useCallback(async () => {
    if (!isConnected) {
      await handleConnect()
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const signature = await signMessageAsync({
        message: SIGNATURE_MESSAGE,
      })

      if (signature) {
        // Small delay for dramatic effect
        await new Promise((resolve) => setTimeout(resolve, 500))
        setIsUnlocked(true)
      }
    } catch (err) {
      console.error('Signature failed:', err)
      setError('Signature rejected or failed.')
    } finally {
      setIsVerifying(false)
    }
  }, [isConnected, handleConnect, signMessageAsync])

  return (
    <div className="relative py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Partner Exclusive</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
            VIP Workflow Session
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Get an inside look at our professional production workflow. Sign with your wallet to
            unlock exclusive partner content.
          </p>
        </div>

        {/* The Shock Box Container */}
        <div className="relative">
          {/* Cyberpunk Glitch Border */}
          <div className="absolute -inset-[2px] rounded-2xl overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-accent to-cyan animate-pulse" />
            {/* Glitch lines */}
            <div className="absolute inset-0">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-[2px] bg-white/30"
                  style={{
                    top: `${20 + i * 15}%`,
                    left: 0,
                    right: 0,
                  }}
                  animate={{
                    x: ['-100%', '100%'],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'linear',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Main Box Content */}
          <div className="relative bg-dark-100 rounded-2xl overflow-hidden">
            {/* Video Thumbnail Area */}
            <div className="relative aspect-video">
              <AnimatePresence mode="wait">
                {!isUnlocked ? (
                  <>
                    {/* Blurred Thumbnail */}
                    <motion.div
                      key="locked"
                      className="absolute inset-0"
                      exit={{ opacity: 0 }}
                    >
                      {/* Background Image (blurred) */}
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-dark-200 to-accent/20">
                        <Image
                          src="https://roblogo.com/wp-content/uploads/2025/02/smp-icon-anim.gif"
                          alt="VIP Content Preview"
                          fill
                          className="object-cover blur-xl opacity-50"
                          unoptimized
                        />
                      </div>

                      {/* Shatter Overlay (for exit animation) */}
                      <AnimatePresence>
                        {isVerifying && (
                          <motion.div className="absolute inset-0 z-10">
                            {shatterPieces.map((piece) => (
                              <motion.div
                                key={piece.id}
                                className="absolute bg-dark-100/80 backdrop-blur-sm"
                                style={{
                                  left: `${piece.x}%`,
                                  top: `${piece.y}%`,
                                  width: '25%',
                                  height: '33.33%',
                                }}
                                initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                                animate={{
                                  opacity: [1, 1, 0],
                                  x: (piece.id % 2 === 0 ? 1 : -1) * (50 + Math.random() * 100),
                                  y: 50 + Math.random() * 100,
                                  rotate: piece.rotation,
                                  scale: [1, 1.1, 0],
                                }}
                                transition={{
                                  duration: 0.8,
                                  delay: piece.delay + 0.3,
                                  ease: 'easeOut',
                                }}
                              />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Lock Icon Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <motion.div
                          className="relative"
                          animate={isVerifying ? { scale: [1, 1.2, 0], rotate: [0, 0, 180] } : {}}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <div className="p-6 rounded-full bg-dark-200/80 backdrop-blur-sm border border-secondary/30 shadow-glow-md">
                            {isVerifying ? (
                              <Loader2 className="w-12 h-12 text-secondary animate-spin" />
                            ) : (
                              <Lock className="w-12 h-12 text-secondary" />
                            )}
                          </div>
                          {/* Glow ring */}
                          <div className="absolute inset-0 rounded-full bg-secondary/20 blur-xl animate-pulse" />
                        </motion.div>

                        {!isVerifying && (
                          <motion.p
                            className="mt-4 text-gray-600 dark:text-gray-400 text-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            Wallet signature required to unlock
                          </motion.p>
                        )}
                      </div>

                      {/* Scan Lines Effect */}
                      <div className="absolute inset-0 pointer-events-none z-30">
                        <div
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage:
                              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* Error Toast */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-500/90 backdrop-blur-sm rounded-lg text-white text-sm font-medium flex items-center gap-2"
                        >
                          <Wallet className="w-4 h-4" />
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  /* Unlocked Content - Video Player */
                  <motion.div
                    key="unlocked"
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    {/* Success Badge */}
                    <motion.div
                      className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Unlock className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs font-medium text-green-400">Partner Verified</span>
                    </motion.div>

                    {/* Video Player */}
                    <div className="relative w-full h-full bg-dark-200">
                      <video
                        src={PARTNER_VIDEO_URL}
                        className="absolute inset-0 w-full h-full object-cover"
                        controls
                        autoPlay
                        playsInline
                      />

                      {/* Teaser Badge */}
                      <div className="absolute top-4 left-4 z-20 px-4 py-2 bg-accent/90 backdrop-blur-sm rounded-lg">
                        <p className="text-white text-sm font-bold">🔥 Teaser — We're cooking up something fire!</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Bar */}
            <div className="p-6 border-t border-secondary/10 bg-dark-200/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-white font-semibold">
                    {isUnlocked ? '🔥 Sneak Peek Unlocked!' : 'Exclusive Partner Content'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {isUnlocked
                      ? 'This is just a teaser — more fire coming soon'
                      : isConnected
                        ? 'Sign with your wallet to verify partner status'
                        : 'Connect your wallet to unlock VIP content'}
                  </p>
                </div>

                {!isUnlocked && (
                  <button
                    onClick={handleUnlock}
                    disabled={isVerifying || isConnecting}
                    className="group relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
                  >
                    {/* Button gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary via-accent to-secondary bg-[length:200%_100%] animate-[gradient_3s_ease_infinite]" />

                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </div>

                    {/* Button content */}
                    <span className="relative flex items-center justify-center gap-2">
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Connecting Wallet...</span>
                        </>
                      ) : isVerifying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : !isConnected ? (
                        <>
                          <Wallet className="w-5 h-5" />
                          <span>Connect Wallet</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-5 h-5" />
                          <span>Unlock Partner Session</span>
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <p className="text-center text-gray-700 dark:text-gray-400 text-xs mt-4">
          {isConnected ? (
            <>
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </>
          ) : (
            'MetaMask, Coinbase Wallet, or any injected wallet supported'
          )}
        </p>
      </div>
    </div>
  )
}
