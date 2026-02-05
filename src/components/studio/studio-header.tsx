'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Home, Plus, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StudioHeaderProps {
  walletAddress?: string
}

export function StudioHeader({ walletAddress }: StudioHeaderProps) {
  const pathname = usePathname()
  const isNewTemplate = pathname === '/studio/templates/new'

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-50 border-b border-secondary/20 bg-dark-100/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/studio" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-secondary/10">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <span className="font-bold text-white">Shock Studio</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/studio"
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === '/studio'
                    ? 'bg-secondary/10 text-secondary'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Templates
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!isNewTemplate && (
              <Link href="/studio/templates/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </Link>
            )}

            <Link href="/">
              <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                <Home className="w-5 h-5" />
              </button>
            </Link>

            {walletAddress && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 font-mono">
                  {formatAddress(walletAddress)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
