'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DrillFilter, FilterState } from '@/components/drills/drill-filter'
import { DrillGrid } from '@/components/drills/drill-grid'
import { Database } from '@/types/database.types'
import { Trophy, TrendingUp, Clock, Award } from 'lucide-react'

type Drill = Database['public']['Tables']['drills']['Row']

export default function DrillsPage() {
  const [drills, setDrills] = useState<Drill[]>([])
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    hoursSpent: 0,
  })

  useEffect(() => {
    fetchDrills()
    fetchUserStats()
  }, [])

  const fetchDrills = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('drills')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setDrills(data || [])
      setFilteredDrills(data || [])
    } catch (error) {
      console.error('Error fetching drills:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get completion count
      const { count } = await supabase
        .from('drill_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setStats((prev) => ({
        ...prev,
        completed: count || 0,
        total: drills.length,
      }))
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...drills]

    // Filter by category (using tags)
    if (filters.category) {
      filtered = filtered.filter((drill) => drill.tags?.includes(filters.category!))
    }

    // Filter by difficulty
    if (filters.difficulty) {
      filtered = filtered.filter((drill) => drill.difficulty === filters.difficulty)
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (drill) =>
          drill.title.toLowerCase().includes(searchLower) ||
          drill.description?.toLowerCase().includes(searchLower) ||
          drill.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }

    setFilteredDrills(filtered)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
          Membership Training
        </h1>
        <p className="text-lg text-cyan-700 dark:text-white">
          Exclusive drills and training videos for PSP members
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange/10">
              <Trophy className="w-6 h-6 text-orange" />
            </div>
            <div>
              <p className="text-sm text-cyan-700 dark:text-white">Total Drills</p>
              <p className="text-2xl font-bold text-white">{drills.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-400/10">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-cyan-700 dark:text-white">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-400/10">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-cyan-700 dark:text-white">Progress</p>
              <p className="text-2xl font-bold text-white">
                {drills.length > 0
                  ? Math.round((stats.completed / drills.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-400/10">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-cyan-700 dark:text-white">Hours Trained</p>
              <p className="text-2xl font-bold text-white">{stats.hoursSpent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <DrillFilter onFilterChange={handleFilterChange} />

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-cyan-700 dark:text-white">
          Showing <span className="text-white font-semibold">{filteredDrills.length}</span> of{' '}
          <span className="text-white font-semibold">{drills.length}</span> drills
        </p>
      </div>

      {/* Drill Grid */}
      <DrillGrid drills={filteredDrills} loading={loading} />
    </div>
  )
}
