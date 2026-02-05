'use client'

import { DrillCard } from './drill-card'
import { Database } from '@/types/database.types'

type Drill = Database['public']['Tables']['drills']['Row']

interface DrillGridProps {
  drills: Drill[]
  loading?: boolean
}

export function DrillGrid({ drills, loading = false }: DrillGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card p-4 h-80 skeleton" />
        ))}
      </div>
    )
  }

  if (drills.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-orange"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">
            No Drills Found
          </h3>
          <p className="text-slate-400">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drills.map((drill) => (
        <DrillCard
          key={drill.id}
          id={drill.id}
          title={drill.title}
          description={drill.description || undefined}
          thumbnailUrl={drill.thumbnail_url || undefined}
          category={drill.category || 'general'}
          difficulty={drill.difficulty as 'beginner' | 'intermediate' | 'advanced'}
          duration={drill.duration_seconds}
          tags={drill.tags || []}
          featured={drill.featured}
        />
      ))}
    </div>
  )
}
