'use client'

import { useEffect, useState } from 'react'
import { toastError } from '@/lib/toast'
import Link from 'next/link'
import {
  Users,
  Link2,
  Copy,
  Check as CheckIcon,
  User,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  X,
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
  email: string | null // Fetched from auth.users
  avatar_url: string | null
  athlete_type: string | null
  age: number | null
  role: string
  created_at: string
  updated_at: string
  account_type: string | null
  child_name: string | null
}

interface AthleteStats {
  total_sessions: number
  drills_completed: number
  avg_velocity: number | null
  max_velocity: number | null
  assigned_drills: number
  pending_drills: number
}

interface InviteLink {
  id: string
  coach_id: string
  token: string
  sport: string | null
  max_uses: number
  uses: number
  expires_at: string
  created_at: string
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
  const [showParentFields, setShowParentFields] = useState(false)

  // Invite link state
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([])
  const [inviteSport, setInviteSport] = useState<string>('')
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
  const [newlyGeneratedUrl, setNewlyGeneratedUrl] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    athlete_type: 'softball',
    age: '',
    parent_guardian_name: '',
    parent_guardian_email: '',
    parent_guardian_phone: '',
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

        // Load all athletes WITH emails (after migration 020)
        const { data: athletesData, error: athletesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, athlete_type, age, role, created_at, updated_at, account_type, child_name')
          .eq('role', 'athlete')
          .order('full_name')

        if (athletesError) throw athletesError

        // Email is now in profiles table after migration 020
        const athletesWithSchema = (athletesData || []).map((athlete: any) => ({
          ...athlete,
          email: athlete.email || null
        }))

        setAthletes(athletesWithSchema)

        // Load stats for each athlete from real performance metrics
        if (athletesData && athletesData.length > 0) {
          const statsMap: Record<string, AthleteStats> = {}

          for (const athlete of athletesData) {
            // Get total sessions from bookings
            const { count: sessionCount } = await supabase
              .from('bookings')
              .select('*', { count: 'exact', head: true })
              .eq('athlete_id', athlete.id)
              .eq('status', 'completed')

            // Get performance metrics
            const { data: metricsData } = await supabase
              .from('athlete_performance_metrics')
              .select('throwing_velocity_mph, throwing_velocity_avg_mph')
              .eq('athlete_id', athlete.id)
              .order('test_date', { ascending: false })
              .limit(10)

            const avgVelocity = metricsData && metricsData.length > 0
              ? metricsData.reduce((sum: number, v: any) => sum + (v.throwing_velocity_avg_mph || v.throwing_velocity_mph || 0), 0) / metricsData.length
              : null

            const maxVelocity = metricsData && metricsData.length > 0
              ? Math.max(...metricsData.map((v: any) => v.throwing_velocity_mph || 0).filter((v: number) => v > 0))
              : null

            // Get total metrics count
            const { count: metricsCount } = await supabase
              .from('athlete_performance_metrics')
              .select('*', { count: 'exact', head: true })
              .eq('athlete_id', athlete.id)

            // Get assigned drills count
            const { count: assignedCount } = await supabase
              .from('assigned_drills')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', athlete.id)

            // Get pending (not completed) drills
            const { count: pendingCount } = await supabase
              .from('assigned_drills')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', athlete.id)
              .eq('completed', false)

            statsMap[athlete.id] = {
              total_sessions: sessionCount || 0,
              drills_completed: metricsCount || 0,
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

  const fetchInviteLinks = async () => {
    try {
      const res = await fetch('/api/admin/invite')
      const data = await res.json()
      if (res.ok) setInviteLinks(data.links || [])
    } catch (err) {
      console.error('Failed to fetch invite links', err)
    }
  }

  const generateInviteLink = async () => {
    setIsGeneratingLink(true)
    setNewlyGeneratedUrl(null)
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: inviteSport || null,
          max_uses: 1,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate link')
      const url = `${window.location.origin}/invite/${data.link.token}`
      setNewlyGeneratedUrl(url)
      await fetchInviteLinks()
    } catch (err: any) {
      toastError(`Failed to generate invite link: ${err.message}`)
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const deleteInviteLink = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/invite?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setInviteLinks(prev => prev.filter(l => l.id !== id))
      if (newlyGeneratedUrl && newlyGeneratedUrl.includes(id)) {
        setNewlyGeneratedUrl(null)
      }
    } catch (err: any) {
      toastError(`Failed to delete invite link: ${err.message}`)
    }
  }

  const copyInviteLink = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLinkId(id)
      setTimeout(() => setCopiedLinkId(null), 2000)
    } catch {
      toastError('Failed to copy link')
    }
  }

  const handleCreateAthlete = async () => {
    if (!formData.full_name || !formData.email) {
      toastError('Please fill in required fields: Full Name and Email')
      return
    }

    setIsProcessing(true)
    try {
      // Call API route to create athlete (uses service role)
      const response = await fetch('/api/admin/create-athlete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          athlete_type: formData.athlete_type,
          age: formData.age,
          parent_guardian_name: formData.parent_guardian_name,
          parent_guardian_email: formData.parent_guardian_email,
          parent_guardian_phone: formData.parent_guardian_phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create athlete')
      }

      // Reload athletes
      const supabase = createClient()
      const { data: athletesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, athlete_type, age, role, created_at, updated_at, account_type, child_name')
        .eq('role', 'athlete')
        .order('full_name')

      const athletesWithSchema = (athletesData || []).map((athlete: any) => ({
        ...athlete,
        email: null
      }))
      setAthletes(athletesWithSchema)
      setCreateModalOpen(false)
      resetForm()
      showSuccess('Athlete created successfully! They can now log in with their email.')
    } catch (error: any) {
      console.error('Error creating athlete:', error)
      toastError(`Failed to create athlete: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateAthlete = async () => {
    if (!selectedAthlete) return

    setIsProcessing(true)
    try {
      // Use API route with adminClient to bypass profiles RLS (id = auth.uid())
      const response = await fetch('/api/admin/update-athlete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athlete_id: selectedAthlete.id,
          full_name: formData.full_name,
          athlete_type: formData.athlete_type,
          age: formData.age,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update athlete')

      // Reload athletes
      const supabase = createClient()
      const { data: athletesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, athlete_type, age, role, created_at, updated_at, account_type, child_name')
        .eq('role', 'athlete')
        .order('full_name')

      const athletesWithSchema = (athletesData || []).map((athlete: any) => ({
        ...athlete,
        email: athlete.email || null
      }))
      setAthletes(athletesWithSchema)
      setEditModalOpen(false)
      setSelectedAthlete(null)
      resetForm()
      showSuccess('Athlete updated successfully!')
    } catch (error: any) {
      console.error('Error updating athlete:', error)
      toastError(`Failed to update athlete: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteAthlete = async () => {
    if (!selectedAthlete) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/delete-athlete?id=${selectedAthlete.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete athlete')
      }

      setAthletes(athletes.filter(a => a.id !== selectedAthlete.id))
      setDeleteModalOpen(false)
      setSelectedAthlete(null)
      showSuccess('Athlete deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting athlete:', error)
      toastError(`Failed to delete athlete: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAgeChange = (value: string) => {
    setFormData({ ...formData, age: value })
    const ageNum = parseInt(value, 10)
    setShowParentFields(ageNum > 0 && ageNum < 18)
  }

  const openEditModal = (athlete: Athlete) => {
    setSelectedAthlete(athlete)
    setFormData({
      full_name: athlete.full_name,
      email: athlete.email || '',
      athlete_type: athlete.athlete_type || 'softball',
      age: athlete.age?.toString() || '',
      parent_guardian_name: '',
      parent_guardian_email: '',
      parent_guardian_phone: '',
    })
    setEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      athlete_type: 'softball',
      age: '',
      parent_guardian_name: '',
      parent_guardian_email: '',
      parent_guardian_phone: '',
    })
    setShowParentFields(false)
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-800 dark:text-white">Loading athletes...</p>
        </div>
      </div>
    )
  }

  if (!isCoach && !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8 relative">
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
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Athlete <span className="text-gradient-orange">Management</span>
          </h1>
          <p className="text-cyan-800 dark:text-white text-lg">
            Manage your athletes, track progress, and assign training
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewlyGeneratedUrl(null)
              fetchInviteLinks()
              setInviteModalOpen(true)
            }}
            className="btn-ghost flex items-center gap-2"
          >
            <Link2 className="w-5 h-5" />
            Invite Link
          </button>
          <Link
            href="/admin/athletes/create"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Athlete
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div data-tour="athletes-stats" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-orange" />
            <span className="text-sm text-cyan-800 dark:text-white">Total</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{athletes.length}</p>
          <p className="text-sm text-cyan-800 dark:text-white">Active Athletes</p>
        </div>
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-6 h-6 text-cyan" />
            <span className="text-sm text-cyan-800 dark:text-white">Soccer</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {athletes.filter(a => a.athlete_type === 'soccer').length}
          </p>
          <p className="text-sm text-cyan-800 dark:text-white">Soccer Players</p>
        </div>
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-6 h-6 text-orange" />
            <span className="text-sm text-cyan-800 dark:text-white">Basketball</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {athletes.filter(a => a.athlete_type === 'basketball').length}
          </p>
          <p className="text-sm text-cyan-800 dark:text-white">Basketball Players</p>
        </div>
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-6 h-6 text-purple-400" />
            <span className="text-sm text-cyan-800 dark:text-white">Softball</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {athletes.filter(a => a.athlete_type === 'softball').length}
          </p>
          <p className="text-sm text-cyan-800 dark:text-white">Softball Players</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="command-panel mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-800 dark:text-white" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-cyan-900/30 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder:text-cyan-800 dark:text-white focus:outline-none focus:border-orange/50"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-800 dark:text-white" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-cyan-900/30 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange/50 appearance-none cursor-pointer"
            >
              <option value="all">All Sports</option>
              <option value="softball">Softball</option>
              <option value="basketball">Basketball</option>
              <option value="soccer">Soccer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Athletes Grid */}
      <div data-tour="athletes-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAthletes.map((athlete) => {
          const stats = athleteStats[athlete.id]
          return (
            <Link
              key={athlete.id}
              href={`/admin/athletes/${athlete.id}`}
              className="command-panel hover:border-orange/30 transition-all group cursor-pointer block"
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
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange transition-colors mb-1">
                    {athlete.account_type === 'parent_guardian' && athlete.child_name
                      ? athlete.child_name
                      : athlete.full_name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {athlete.athlete_type && (
                      <span className="inline-block px-2 py-1 bg-cyan/20 border border-cyan/30 rounded-lg text-xs text-cyan font-semibold capitalize">
                        {athlete.athlete_type}
                      </span>
                    )}
                    {athlete.account_type === 'parent_guardian' && (
                      <span className="inline-block px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs text-purple-400 font-semibold">
                        Parent Account
                      </span>
                    )}
                  </div>
                  {athlete.account_type === 'parent_guardian' && (
                    <p className="text-xs text-cyan-700 dark:text-white/50 mt-1">
                      Managed by {athlete.full_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-cyan-900/20 rounded-lg p-3">
                    <p className="text-xs text-cyan-800 dark:text-white mb-1">Sessions</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total_sessions}</p>
                  </div>
                  <div className="bg-cyan-900/20 rounded-lg p-3">
                    <p className="text-xs text-cyan-800 dark:text-white mb-1">Drills</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.drills_completed}</p>
                  </div>
                  <div className="bg-cyan-900/20 rounded-lg p-3">
                    <p className="text-xs text-cyan-800 dark:text-white mb-1">Avg MPH</p>
                    <p className="text-xl font-bold text-gradient-orange">
                      {stats.avg_velocity || '-'}
                    </p>
                  </div>
                  <div className="bg-cyan-900/20 rounded-lg p-3">
                    <p className="text-xs text-cyan-800 dark:text-white mb-1">Max MPH</p>
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

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={(e) => {
                    e.preventDefault()
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
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedAthlete(athlete)
                    setDeleteModalOpen(true)
                  }}
                  className="btn-ghost text-sm py-2 px-4 border-red-500/30 hover:border-red-500/50 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Link>
          )
        })}
      </div>

      {filteredAthletes.length === 0 && (
        <div className="command-panel text-center py-12">
          <Users className="w-16 h-16 text-cyan-700 dark:text-white mx-auto mb-4" />
          <p className="text-cyan-800 dark:text-white text-lg mb-4">
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editModalOpen ? 'Edit Athlete' : 'Add New Athlete'}
              </h2>
              <button
                onClick={() => {
                  setCreateModalOpen(false)
                  setEditModalOpen(false)
                  setSelectedAthlete(null)
                  resetForm()
                }}
                className="text-cyan-800 dark:text-white hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder:text-cyan-800 dark:text-white focus:outline-none focus:border-orange/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    disabled={editModalOpen}
                    className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder:text-cyan-800 dark:text-white focus:outline-none focus:border-orange/50 disabled:opacity-50"
                  />
                  {editModalOpen && (
                    <p className="text-xs text-cyan-800 dark:text-white mt-1">Email cannot be changed</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Sport</label>
                  <select
                    value={formData.athlete_type}
                    onChange={(e) => setFormData({ ...formData, athlete_type: e.target.value })}
                    className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange/50 appearance-none cursor-pointer"
                  >
                    <option value="soccer">Soccer</option>
                    <option value="basketball">Basketball</option>
                    <option value="softball">Softball</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Age (Optional)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleAgeChange(e.target.value)}
                    placeholder="16"
                    min="5"
                    max="100"
                    className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder:text-cyan-800 dark:text-white focus:outline-none focus:border-orange/50"
                  />
                </div>
              </div>

              {/* Parent/Guardian Information (only if under 18 and creating new athlete) */}
              {showParentFields && !editModalOpen && (
                <div className="space-y-4 p-4 rounded-xl bg-orange/10 border border-orange/30 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-orange" />
                    <h3 className="text-sm font-semibold text-orange">Parent/Guardian Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Parent/Guardian Name
                    </label>
                    <input
                      type="text"
                      value={formData.parent_guardian_name}
                      onChange={(e) => setFormData({ ...formData, parent_guardian_name: e.target.value })}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder:text-cyan-800 dark:text-white focus:outline-none focus:border-orange/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Parent/Guardian Email
                    </label>
                    <input
                      type="email"
                      value={formData.parent_guardian_email}
                      onChange={(e) => setFormData({ ...formData, parent_guardian_email: e.target.value })}
                      placeholder="parent@example.com"
                      className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder:text-cyan-800 dark:text-white focus:outline-none focus:border-orange/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Parent/Guardian Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.parent_guardian_phone}
                      onChange={(e) => setFormData({ ...formData, parent_guardian_phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white placeholder:text-cyan-800 dark:text-white focus:outline-none focus:border-orange/50"
                    />
                  </div>
                </div>
              )}
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Delete Athlete</h2>
            <p className="text-cyan-700 dark:text-white mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{selectedAthlete.full_name}</span>?
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedAthlete.full_name}</h2>
              <button
                onClick={() => {
                  setViewModalOpen(false)
                  setSelectedAthlete(null)
                }}
                className="text-cyan-800 dark:text-white hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Athlete Details */}
            <div className="space-y-6">
              {/* Stats */}
              {athleteStats[selectedAthlete.id] && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-cyan-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-cyan" />
                      <span className="text-sm text-cyan-800 dark:text-white">Sessions</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{athleteStats[selectedAthlete.id].total_sessions}</p>
                  </div>
                  <div className="bg-cyan-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-cyan-800 dark:text-white">Drills</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{athleteStats[selectedAthlete.id].drills_completed}</p>
                  </div>
                  <div className="bg-cyan-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange" />
                      <span className="text-sm text-cyan-800 dark:text-white">Avg MPH</span>
                    </div>
                    <p className="text-2xl font-bold text-gradient-orange">
                      {athleteStats[selectedAthlete.id].avg_velocity || '-'}
                    </p>
                  </div>
                  <div className="bg-cyan-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-cyan-800 dark:text-white">Max MPH</span>
                    </div>
                    <p className="text-2xl font-bold text-gradient-orange">
                      {athleteStats[selectedAthlete.id].max_velocity || '-'}
                    </p>
                  </div>
                </div>
              )}

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
      {/* Invite Link Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card max-w-lg w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange/20 border border-orange/30 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-orange" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Generate Invite Link</h2>
              </div>
              <button
                onClick={() => {
                  setInviteModalOpen(false)
                  setNewlyGeneratedUrl(null)
                }}
                className="text-cyan-800 dark:text-white hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-cyan-700 dark:text-white/70 text-sm mb-6">
              Share a link with an athlete to let them create their own account and join your roster.
            </p>

            {/* Configuration */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Sport (Optional)</label>
                <select
                  value={inviteSport}
                  onChange={e => setInviteSport(e.target.value)}
                  className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-200/40 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-orange/50 appearance-none cursor-pointer"
                >
                  <option value="">Any Sport</option>
                  <option value="softball">Softball</option>
                  <option value="basketball">Basketball</option>
                  <option value="soccer">Soccer</option>
                </select>
              </div>

            </div>

            <button
              onClick={generateInviteLink}
              disabled={isGeneratingLink}
              className="btn-primary w-full mb-6"
            >
              {isGeneratingLink ? 'Generating...' : 'Generate Link'}
            </button>

            {/* Newly generated link */}
            {newlyGeneratedUrl && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-sm font-semibold text-green-400 mb-2">Link generated! Share this with your athlete:</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={newlyGeneratedUrl}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => copyInviteLink(newlyGeneratedUrl, 'new')}
                    className="flex-shrink-0 px-3 py-2 bg-orange/20 border border-orange/30 rounded-lg text-orange hover:bg-orange/30 transition-all"
                  >
                    {copiedLinkId === 'new' ? <CheckIcon className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Existing invite links */}
            {inviteLinks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Active Invite Links ({inviteLinks.length})
                </h3>
                <div className="space-y-2">
                  {inviteLinks.map(link => {
                    const linkUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${link.token}`
                    const isExpired = new Date(link.expires_at) < new Date()
                    const isExhausted = link.uses >= link.max_uses
                    return (
                      <div
                        key={link.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${
                          isExpired || isExhausted
                            ? 'bg-white/3 border-white/10 opacity-60'
                            : 'bg-cyan-900/20 border-cyan-200/30'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {link.sport ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan/20 border border-cyan/30 text-cyan font-semibold capitalize">
                                {link.sport}
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-slate-600 dark:text-white/50 font-semibold">
                                Any sport
                              </span>
                            )}
                            <span className={`text-xs font-semibold ${isExpired || isExhausted ? 'text-red-400' : 'text-green-400'}`}>
                              {isExpired ? 'Expired' : isExhausted ? 'Used' : `${link.uses}/${link.max_uses} uses`}
                            </span>
                          </div>
                          <p className="text-xs text-cyan-700 dark:text-white/40 truncate">/invite/{link.token.substring(0, 16)}...</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => copyInviteLink(linkUrl, link.id)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-600 dark:text-white/50 hover:text-orange hover:border-orange/30 transition-all"
                          >
                            {copiedLinkId === link.id ? <CheckIcon className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => deleteInviteLink(link.id)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-600 dark:text-white/50 hover:text-red-400 hover:border-red-400/30 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {inviteLinks.length === 0 && !newlyGeneratedUrl && (
              <p className="text-center text-sm text-cyan-700 dark:text-white/40 py-4">
                No invite links yet. Generate one above to get started.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
