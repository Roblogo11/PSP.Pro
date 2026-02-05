'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MoreVertical, Copy, Trash2, Play, Edit, Lock, Unlock } from 'lucide-react'
import { TransitionTemplate } from '@/types/studio'

interface TemplateCardProps {
  template: TransitionTemplate
  onDelete: () => void
  onDuplicate: () => void
}

export function TemplateCard({ template, onDelete, onDuplicate }: TemplateCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const lockedCount = [
    template.role.locked,
    template.sourceState.locked,
    template.transitionMechanic.locked,
    template.destinationState.locked,
    template.styleTiming.locked,
  ].filter(Boolean).length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-glow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{template.name}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-400">v{template.version}</span>
            {lockedCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-secondary">
                <Lock className="w-3 h-3" />
                {lockedCount} locked
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-dark-200 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-dark-200 border border-secondary/20 rounded-lg shadow-lg z-20">
                <Link
                  href={`/studio/templates/${template.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-secondary/10"
                  onClick={() => setMenuOpen(false)}
                >
                  <Edit className="w-4 h-4" /> Edit
                </Link>
                <button
                  onClick={() => {
                    onDuplicate()
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-secondary/10"
                >
                  <Copy className="w-4 h-4" /> Duplicate
                </button>
                <button
                  onClick={() => {
                    onDelete()
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {template.category && (
        <div className="mb-3">
          <span className="px-2 py-1 text-xs rounded bg-accent/10 text-accent">
            {template.category}
          </span>
        </div>
      )}

      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-1 text-xs text-gray-500">
              +{template.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
        <Link href={`/studio/templates/${template.id}/generate`} className="flex-1">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors font-medium">
            <Play className="w-4 h-4" /> Generate
          </button>
        </Link>
      </div>
    </motion.div>
  )
}
