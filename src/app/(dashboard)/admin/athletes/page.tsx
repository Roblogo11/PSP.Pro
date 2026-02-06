'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  X,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Dumbbell,
  Target,
  CheckCircle,
  Award,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useRouter } from 'next/navigation'

interface Athlete {
  id: string
  full_name: string
  email: string | null
  avatar_url: string | null
  athlete_type: string | null
  age: number | null
  parent_email: string | null
  parent_phone: string | null
  emergency_contact: string | null
  velocity_goal_mph: number | null
  phone: string | null
  location: string | null
  role: string
  created_at: string
}

interface AthleteStats {
  total_sessions: number
  drills_completed: number
  avg_velocity: number | null
  max_velocity: number | null
  assigned_drills: number
  pending_drills: number
}

export default function AthletesManagementPage() {
  const router = useRouter()
  const { profile, isCoach, isAdmin, loading: profileLoading } = useUserRole()
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [athleteStats, setAthleteStats] = useState<Record<string, AthleteStats>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    athlete_type: 'baseball',
    age: '',
    parent_email: '',
    parent_phone: '',
    emergency_contact: '',
    velocity_goal_mph: '',
  })

  // Check if user is coach/admin
  useEffect(() => {
    if (!profileLoading && !isCoach && !isAdmin) {
      router.push('/locker')
    }
  }, [profileLoading, isCoach, isAdmin, router])

  // Load athletes
  useEffect(() => {
    if (!profile || !isCoach) return

    async function loadAthletes() {
      try {
        const supabase = createClient()

        // Load all athletes
        const { data: athletesData, error: athletesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'athlete')
          .order('full_name')

        if (athletesError) throw athletesError

        setAthletes(athletesData || [])

        // Load stats for each athlete
        if (athletesData && athletesData.length > 0) {
          const statsMap: Record<string, AthleteStats> = {}

          for (const athlete of athletesData) {
            // Get session count
            const { count: sessionCount } = await supabase
              .from('sessions')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', athlete.id)
              .eq('completed', true)

            // Get drill completions
            const { count: drillCount } = await supabase
              .from('drill_completions')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', athlete.id)

            // Get velocity stats
            const { data: velocityData } = await supabase
              .from('velocity_logs')
              .select('velocity_mph')
              .eq('user_id', athlete.id)
              .order('velocity_mph', { ascending: false })
              .limit(10)

            const avgVelocity = velocityData && velocityData.length > 0
              ? velocityData.reduce((sum, v) => sum + (v.velocity_mph || 0), 0) / velocityData.length
              : null

            const maxVelocity = velocityData && velocityData.length > 0
              ? Math.max(...velocityData.map(v => v.velocity_mph || 0))
              : null

            // Get assigned drills
            const { count: assignedCount } = await supabase
              .from('assigned_drills')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', athlete.id)

            const { count: pendingCount } = await supabase
              .from('assigned_drills')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', athlete.id)
              .eq('completed', false)

            statsMap[athlete.id] = {
              total_sessions: sessionCount || 0,
              drills_completed: drillCount || 0,
              avg_velocity: avgVelocity ? parseFloat(avgVelocity.toFixed(1)) : null,
              max_velocity: maxVelocity ? parseFloat(maxVelocity.toFixed(1)) : null,
              assigned_drills: assignedCount || 0,
              pending_drills: pendingCount || 0,
            }
          }

          setAthleteStats(statsMap)
        }
      } catch (error) {
        console.error('Error loading athletes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAthletes()
  }, [profile, isCoach])

  // Filter athletes
  const filteredAthletes = athletes.filter((athlete) => {
    const matchesSearch = athlete.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === 'all' || athlete.athlete_type === typeFilter

    return matchesSearch && matchesType
  })

  const handleCreateAthlete = async () => {
    if (!formData.full_name || !formData.email) {
      alert('Please fill in required fields: Full Name and Email')
      return
    }

    setIsProcessing(true)
    try {
      const supabase = createClient()

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
        },
      })

      if (authError) throw authError

      // Update profile with additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          athlete_type: formData.athlete_type,
          age: formData.age ? parseInt(formData.age) : null,
          parent_email: formData.parent_email || null,
          parent_phone: formData.parent_phone || null,
          emergency_contact: formData.emergency_contact || null,
          velocity_goal_mph: formData.velocity_goal_mph ? parseFloat(formData.velocity_goal_mph) : null,
          phone: formData.phone || null,
          role: 'athlete',
        })
        .eq('id', authData.user.id)

      if (profileError) throw profileError

      // Reload athletes
      const { data: athletesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'athlete')
        .order('full_name')

      setAthletes(athletesData || [])
      setCreateModalOpen(false)
      resetForm()
      showSuccess('Athlete created successfully! Login credentials sent to email.')
    } catch (error: any) {
      console.error('Error creating athlete:', error)
      alert(`Failed to create athlete: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateAthlete = async () => {
    if (!selectedAthlete) return

    setIsProcessing(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          athlete_type: formData.athlete_type,
          age: formData.age ? parseInt(formData.age) : null,
          parent_email: formData.parent_email || null,
          parent_phone: formData.parent_phone || null,
          emergency_contact: formData.emergency_contact || null,
          velocity_goal_mph: formData.velocity_goal_mph ? parseFloat(formData.velocity_goal_mph) : null,
          phone: formData.phone || null,
        })
        .eq('id', selectedAthlete.id)

      if (error) throw error

      // Reload athletes
      const { data: athletesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'athlete')
        .order('full_name')

      setAthletes(athletesData || [])
      setEditModalOpen(false)
      setSelectedAthlete(null)
      resetForm()
      showSuccess('Athlete updated successfully!')
    } catch (error: any) {
      console.error('Error updating athlete:', error)
      alert(`Failed to update athlete: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteAthlete = async () => {
    if (!selectedAthlete) return

    setIsProcessing(true)
    try {
      const supabase = createClient()

      // Delete athlete (this will cascade to all related data)
      const { error } = await supabase.auth.admin.deleteUser(selectedAthlete.id)

      if (error) throw error

      setAthletes(athletes.filter(a => a.id !== selectedAthlete.id))
      setDeleteModalOpen(false)
      setSelectedAthlete(null)
      showSuccess('Athlete deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting athlete:', error)
      alert(`Failed to delete athlete: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const openEditModal = (athlete: Athlete) => {
    setSelectedAthlete(athlete)
    setFormData({
      full_name: athlete.full_name,
      email: athlete.email || '',
      phone: athlete.phone || '',
      athlete_type: athlete.athlete_type || 'baseball',
      age: athlete.age?.toString() || '',
      parent_email: athlete.parent_email || '',
      parent_phone: athlete.parent_phone || '',
      emergency_contact: athlete.emergency_contact || '',
      velocity_goal_mph: athlete.velocity_goal_mph?.toString() || '',
    })
    setEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      athlete_type: 'baseball',
      age: '',
      parent_email: '',
      parent_phone: '',
      emergency_contact: '',
      velocity_goal_mph: '',
    })
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading athletes...</p>
        </div>
      </div>
    )
  }

  if (!isCoach && !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-scale-in">
          <div className="glass-card border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400 font-semibold">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
            Athlete <span className="text-gradient-orange">Management</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Manage your athletes, track progress, and assign training
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setCreateModalOpen(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Athlete
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-orange" />
            <span className="text-sm text-slate-400">Total</span>
          </div>
          <p className="text-3xl font-bold text-white">{athletes.length}</p>
          <p className="text-sm text-slate-400">Active Athletes</p>
        </div>
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-6 h-6 text-cyan" />
            <span className="text-sm text-slate-400">Baseball</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {athletes.filter(a => a.athlete_type === 'baseball').length}
          </p>
          <p className="text-sm text-slate-400">Baseball Players</p>
        </div>
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-6 h-6 text-purple-400" />
            <span className="text-sm text-slate-400">Softball</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {athletes.filter(a => a.athlete_type === 'softball').length}
          </p>
          <p className="text-sm text-slate-400">Softball Players</p>
        </div>
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <span className="text-sm text-slate-400">Avg Goal</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {athletes.filter(a => a.velocity_goal_mph).length > 0
              ? Math.round(
                  athletes
                    .filter(a => a.velocity_goal_mph)
                    .reduce((sum, a) => sum + (a.velocity_goal_mph || 0), 0) /
                    athletes.filter(a => a.velocity_goal_mph).length
                )
              : 0}
          </p>
          <p className="text-sm text-slate-400">MPH Target</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="command-panel mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange/50 appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="baseball">Baseball</option>
              <option value="softball">Softball</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Athletes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAthletes.map((athlete) => {
          const stats = athleteStats[athlete.id]
          return (
            <div
              key={athlete.id}
              className="command-panel hover:border-orange/30 transition-all group cursor-pointer"
              onClick={() => {
                setSelectedAthlete(athlete)
                setViewModalOpen(true)
              }}
            >
              {/* Athlete Header */}
              <div className="flex items-start gap-3 mb-4">
                {athlete.avatar_url ? (
                  <img
                    src={athlete.avatar_url}
                    alt={athlete.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan to-orange flex items-center justify-center text-white font-bold text-2xl">
                    {athlete.full_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-orange transition-colors mb-1">
                    {athlete.full_name}
                  </h3>
                  {athlete.athlete_type && (
                    <span className="inline-block px-2 py-1 bg-cyan/20 border border-cyan/30 rounded-lg text-xs text-cyan font-semibold capitalize">
                      {athlete.athlete_type}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-800/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Sessions</p>
                    <p className="text-xl font-bold text-white">{stats.total_sessions}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Drills</p>
                    <p className="text-xl font-bold text-white">{stats.drills_completed}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Avg MPH</p>
                    <p className="text-xl font-bold text-gradient-orange">
                      {stats.avg_velocity || '-'}
                    </p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Max MPH</p>
                    <p className="text-xl font-bold text-gradient-orange">
                      {stats.max_velocity || '-'}
                    </p>
                  </div>
                </div>
              )}

              {/* Pending Drills Badge */}
              {stats && stats.pending_drills > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 bg-orange/20 border border-orange/30 rounded-lg flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange" />
                    <span className="text-sm text-orange font-semibold">
                      {stats.pending_drills} drill{stats.pending_drills !== 1 ? 's' : ''} assigned
                    </span>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                {athlete.email && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{athlete.email}</span>
                  </div>
                )}
                {athlete.phone && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{athlete.phone}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openEditModal(athlete)
                  }}
                  className="flex-1 btn-ghost text-sm py-2 border-orange/30 hover:border-orange/50 hover:text-orange"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedAthlete(athlete)
                    setDeleteModalOpen(true)
                  }}
                  className="btn-ghost text-sm py-2 px-4 border-red-500/30 hover:border-red-500/50 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAthletes.length === 0 && (
        <div className="command-panel text-center py-12">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-4">
            {searchQuery || typeFilter !== 'all'
              ? 'No athletes match your filters'
              : 'No athletes yet'}
          </p>
          {!searchQuery && typeFilter === 'all' && (
            <button
              onClick={() => {
                resetForm()
                setCreateModalOpen(true)
              }}
              className="btn-primary"
            >
              Add Your First Athlete
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Athlete Modal */}
      {(createModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editModalOpen ? 'Edit Athlete' : 'Add New Athlete'}
              </h2>
              <button
                onClick={() => {
                  setCreateModalOpen(false)
                  setEditModalOpen(false)
                  setSelectedAthlete(null)
                  resetForm()
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    disabled={editModalOpen}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50 disabled:opacity-50"
                  />
                  {editModalOpen && (
                    <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="16"
                    min="5"
                    max="100"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Athlete Type</label>
                  <select
                    value={formData.athlete_type}
                    onChange={(e) => setFormData({ ...formData, athlete_type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange/50 appearance-none cursor-pointer"
                  >
                    <option value="baseball">Baseball</option>
                    <option value="softball">Softball</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Velocity Goal (MPH)</label>
                  <input
                    type="number"
                    value={formData.velocity_goal_mph}
                    onChange={(e) => setFormData({ ...formData, velocity_goal_mph: e.target.value })}
                    placeholder="75"
                    step="0.1"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                  />
                </div>
              </div>

              {/* Parent/Guardian Info */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Parent/Guardian Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Parent Email</label>
                      <input
                        type="email"
                        value={formData.parent_email}
                        onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                        placeholder="parent@example.com"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Parent Phone</label>
                      <input
                        type="tel"
                        value={formData.parent_phone}
                        onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Emergency Contact</label>
                    <input
                      type="text"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="Name and phone number"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setCreateModalOpen(false)
                  setEditModalOpen(false)
                  setSelectedAthlete(null)
                  resetForm()
                }}
                className="btn-ghost flex-1"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={editModalOpen ? handleUpdateAthlete : handleCreateAthlete}
                className="btn-primary flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? 'Saving...' : editModalOpen ? 'Update Athlete' : 'Create Athlete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Delete Athlete</h2>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete <span className="font-bold text-white">{selectedAthlete.full_name}</span>?
              This will permanently delete all their sessions, drills, and progress data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false)
                  setSelectedAthlete(null)
                }}
                className="btn-ghost flex-1"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAthlete}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete Athlete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Athlete Modal */}
      {viewModalOpen && selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedAthlete.full_name}</h2>
              <button
                onClick={() => {
                  setViewModalOpen(false)
                  setSelectedAthlete(null)
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Athlete Details */}
            <div className="space-y-6">
              {/* Stats */}
              {athleteStats[selectedAthlete.id] && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-cyan" />
                      <span className="text-sm text-slate-400">Sessions</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{athleteStats[selectedAthlete.id].total_sessions}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-slate-400">Drills</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{athleteStats[selectedAthlete.id].drills_completed}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange" />
                      <span className="text-sm text-slate-400">Avg MPH</span>
                    </div>
                    <p className="text-2xl font-bold text-gradient-orange">
                      {athleteStats[selectedAthlete.id].avg_velocity || '-'}
                    </p>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-slate-400">Max MPH</span>
                    </div>
                    <p className="text-2xl font-bold text-gradient-orange">
                      {athleteStats[selectedAthlete.id].max_velocity || '-'}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-slate-800/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {selectedAthlete.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-300">{selectedAthlete.email}</span>
                    </div>
                  )}
                  {selectedAthlete.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-300">{selectedAthlete.phone}</span>
                    </div>
                  )}
                  {selectedAthlete.parent_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-300">{selectedAthlete.parent_email} (Parent)</span>
                    </div>
                  )}
                  {selectedAthlete.parent_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-300">{selectedAthlete.parent_phone} (Parent)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <Link href={`/admin/drills?assign=${selectedAthlete.id}`} className="flex-1">
                  <button className="btn-primary w-full">
                    <Target className="w-5 h-5 mr-2" />
                    Assign Drills
                  </button>
                </Link>
                <button
                  onClick={() => {
                    setViewModalOpen(false)
                    openEditModal(selectedAthlete)
                  }}
                  className="btn-ghost flex-1"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
