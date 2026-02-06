'use client'

import { VelocityVault } from '@/components/web3/velocity-vault'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function VaultPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with back button */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-cyan-800 dark:text-white hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <VelocityVault />
      </main>

      {/* Funnel Navigation */}
      <FunnelNav />
    </div>
  )
}
