'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { Plus, Search, Sparkles, Hammer, ArrowUpRight, Network } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { TemplateGrid } from '@/components/studio/template-grid'
import { templateStorage } from '@/lib/studio/template-storage'
import {
  GenerativeMotion,
  GridPattern,
  FloatingShapes,
} from '@/components/generative-motion'

// Internal apps available in the studio ecosystem
const STUDIO_APPS = [
  {
    name: 'Creator Forge',
    description: 'Build your content network map',
    href: '/studio/creator-forge',
    icon: Network,
    gradient: 'from-purple-500 to-pink-500',
  },
]

export default function StudioDashboard() {
  const { address } = useAccount()
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const templates = useMemo(() => {
    if (!address) return []
    return templateStorage.getAll(address)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refreshKey])

  const filteredTemplates = useMemo(() => {
    if (!search) return templates
    const lower = search.toLowerCase()
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lower)) ||
        t.category.toLowerCase().includes(lower)
    )
  }, [templates, search])

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <Container className="relative z-10 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Your Templates
            </h1>
            <p className="text-gray-400 mt-1">
              AI video transition prompt templates
            </p>
          </div>

          <Link href="/studio/templates/new" className="hidden md:block">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              New Template
            </Button>
          </Link>
        </div>

        {/* Apps Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Hammer className="w-5 h-5 text-secondary" />
            Creator Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STUDIO_APPS.map((app) => {
              const Icon = app.icon
              return (
                <Link
                  key={app.name}
                  href={app.href}
                  className="group p-4 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/5 hover:border-secondary/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${app.gradient}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-secondary transition-colors" />
                  </div>
                  <h3 className="mt-3 font-semibold text-white group-hover:text-secondary transition-colors">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{app.description}</p>
                </Link>
              )
            })}

            {/* New Template Card - styled like an app */}
            <Link
              href="/studio/templates/new"
              className="group p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-pink-500/10 border border-secondary/20 hover:border-secondary/60 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-gradient-to-br from-secondary to-pink-500">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-secondary transition-colors" />
              </div>
              <h3 className="mt-3 font-semibold text-white group-hover:text-secondary transition-colors">
                New Template
              </h3>
              <p className="text-sm text-gray-400 mt-1">Create transition prompt</p>
            </Link>
          </div>
        </div>

        {/* Search and Templates */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-dark-100/80 backdrop-blur-sm border border-secondary/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {search ? 'No templates found' : 'No templates yet'}
            </h2>
            <p className="text-gray-400 mb-6">
              {search
                ? 'Try a different search term'
                : 'Create your first AI transition template'}
            </p>
            {!search && (
              <Link href="/studio/templates/new">
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Template
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <TemplateGrid
            templates={filteredTemplates}
            walletAddress={address!}
            onRefresh={handleRefresh}
          />
        )}
      </Container>

      <Link
        href="/studio/templates/new"
        className="md:hidden fixed bottom-6 right-6 z-50"
      >
        <button className="w-14 h-14 rounded-full bg-secondary text-white shadow-glow-md flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </button>
      </Link>
    </div>
  )
}
