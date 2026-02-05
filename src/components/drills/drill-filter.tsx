'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DrillFilterProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  category: string | null
  difficulty: string | null
  search: string
}

const categories = [
  { value: 'mechanics', label: 'Mechanics' },
  { value: 'speed', label: 'Speed & Agility' },
  { value: 'power', label: 'Power Training' },
  { value: 'recovery', label: 'Recovery & Mobility' },
  { value: 'warmup', label: 'Warmup' },
  { value: 'conditioning', label: 'Conditioning' },
]

const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export function DrillFilter({ onFilterChange }: DrillFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    difficulty: null,
    search: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const cleared: FilterState = { category: null, difficulty: null, search: '' }
    setFilters(cleared)
    onFilterChange(cleared)
  }

  const hasActiveFilters = filters.category || filters.difficulty || filters.search

  return (
    <div className="glass-card p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-orange" />
          <h2 className="text-xl font-display font-bold text-white">Filter Drills</h2>
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-orange transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-ghost"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(showFilters || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search Drills
              </label>
              <input
                type="text"
                placeholder="Search by name or tag..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange/50 transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() =>
                      updateFilter('category', filters.category === cat.value ? null : cat.value)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.category === cat.value
                        ? 'bg-orange text-white shadow-glow-orange'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Difficulty Level
              </label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() =>
                      updateFilter('difficulty', filters.difficulty === diff.value ? null : diff.value)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.difficulty === diff.value
                        ? 'bg-orange text-white shadow-glow-orange'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
