'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Video,
  Clock,
  Users,
  X,
  Upload,
  Youtube,
  CheckCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useRouter } from 'next/navigation'

interface Drill {
  id: string
  title: string
  slug: string
  description: string | null
  instructions: string | null
  video_url: string
  thumbnail_url: string | null
  tags: string[]
  category: string | null
  difficulty: string
  duration_seconds: number
  equipment_needed: string[]
  focus_areas: string[]
  published: boolean
  featured: boolean
  view_count: number
  created_at: string
}

interface Athlete {
  id: string
  full_name: string
  avatar_url: string | null
}

export default function DrillsManagementPage() {
  const router = useRouter()
  const { profile, isCoach, isAdmin, loading: profileLoading } = useUserRole()
  const [drills, setDrills] = useState<Drill[]>([])
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    instructions: '',
    video_url: '',
    thumbnail_url: '',
    tags: [] as string[],
    category: 'mechanics',
    difficulty: 'beginner',
    duration_seconds: 300,
    equipment_needed: [] as string[],
    focus_areas: [] as string[],
    published: true,
    featured: false,
  })
  const [tagInput, setTagInput] = useState('')
  const [equipmentInput, setEquipmentInput] = useState('')
  const [focusAreaInput, setFocusAreaInput] = useState('')
  const [videoSource, setVideoSource] = useState<'youtube' | 'upload'>('youtube')

  // Assignment state
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([])
  const [assignmentNotes, setAssignmentNotes] = useState('')
  const [assignmentPriority, setAssignmentPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [assignmentDueDate, setAssignmentDueDate] = useState('')

  // Check if user is coach/admin
  useEffect(() => {
    if (!profileLoading && !isCoach && !isAdmin) {
      router.push('/locker')
    }
  }, [profileLoading, isCoach, isAdmin, router])

  // Load drills and athletes
  useEffect(() => {
    if (!profile || !isCoach) return

    async function loadData() {
      try {
        const supabase = createClient()

        // Load all drills (coaches can see unpublished drills too)
        const { data: drillsData, error: drillsError } = await supabase
          .from('drills')
          .select('*')
          .order('created_at', { ascending: false })

        if (drillsError) throw drillsError

        // Load all athletes for assignment
        const { data: athletesData, error: athletesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('role', 'athlete')
          .order('full_name')

        if (athletesError) throw athletesError

        setDrills(drillsData || [])
        setAthletes(athletesData || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [profile, isCoach])

  // Filter drills
  const filteredDrills = drills.filter((drill) => {
    const matchesSearch = drill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drill.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drill.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = categoryFilter === 'all' || drill.category === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || drill.difficulty === difficultyFilter

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const handleCreateDrill = async () => {
    if (!formData.title || !formData.video_url) {
      alert('Please fill in required fields: Title and Video URL')
      return
    }

    setIsProcessing(true)
    try {
      const supabase = createClient()

      // Generate slug from title if not provided
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      const { error } = await supabase
        .from('drills')
        .insert({
          ...formData,
          slug,
        })

      if (error) throw error

      // Reload drills
      const { data: drillsData } = await supabase
        .from('drills')
        .select('*')
        .order('created_at', { ascending: false })

      setDrills(drillsData || [])
      setCreateModalOpen(false)
      resetForm()
      showSuccess('Drill created successfully!')
    } catch (error: any) {
      console.error('Error creating drill:', error)
      alert(`Failed to create drill: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateDrill = async () => {
    if (!selectedDrill) return

    setIsProcessing(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('drills')
        .update(formData)
        .eq('id', selectedDrill.id)

      if (error) throw error

      // Reload drills
      const { data: drillsData } = await supabase
        .from('drills')
        .select('*')
        .order('created_at', { ascending: false })

      setDrills(drillsData || [])
      setEditModalOpen(false)
      setSelectedDrill(null)
      resetForm()
      showSuccess('Drill updated successfully!')
    } catch (error: any) {
      console.error('Error updating drill:', error)
      alert(`Failed to update drill: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteDrill = async () => {
    if (!selectedDrill) return

    setIsProcessing(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('drills')
        .delete()
        .eq('id', selectedDrill.id)

      if (error) throw error

      setDrills(drills.filter(d => d.id !== selectedDrill.id))
      setDeleteModalOpen(false)
      setSelectedDrill(null)
      showSuccess('Drill deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting drill:', error)
      alert(`Failed to delete drill: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAssignDrill = async () => {
    if (!selectedDrill || selectedAthletes.length === 0) {
      alert('Please select at least one athlete')
      return
    }

    setIsProcessing(true)
    try {
      const supabase = createClient()

      // Create assignment for each selected athlete
      const assignments = selectedAthletes.map(athleteId => ({
        user_id: athleteId,
        drill_id: selectedDrill.id,
        assigned_by: profile?.full_name || 'Coach',
        due_date: assignmentDueDate || null,
        priority: assignmentPriority,
        notes: assignmentNotes || null,
      }))

      const { error } = await supabase
        .from('assigned_drills')
        .insert(assignments)

      if (error) throw error

      setAssignModalOpen(false)
      setSelectedDrill(null)
      setSelectedAthletes([])
      setAssignmentNotes('')
      setAssignmentDueDate('')
      showSuccess(`Drill assigned to ${selectedAthletes.length} athlete${selectedAthletes.length > 1 ? 's' : ''}!`)
    } catch (error: any) {
      console.error('Error assigning drill:', error)
      alert(`Failed to assign drill: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const openEditModal = (drill: Drill) => {
    setSelectedDrill(drill)
    setFormData({
      title: drill.title,
      slug: drill.slug,
      description: drill.description || '',
      instructions: drill.instructions || '',
      video_url: drill.video_url,
      thumbnail_url: drill.thumbnail_url || '',
      tags: drill.tags,
      category: drill.category || 'mechanics',
      difficulty: drill.difficulty,
      duration_seconds: drill.duration_seconds,
      equipment_needed: drill.equipment_needed,
      focus_areas: drill.focus_areas,
      published: drill.published,
      featured: drill.featured,
    })
    setEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      instructions: '',
      video_url: '',
      thumbnail_url: '',
      tags: [],
      category: 'mechanics',
      difficulty: 'beginner',
      duration_seconds: 300,
      equipment_needed: [],
      focus_areas: [],
      published: true,
      featured: false,
    })
    setTagInput('')
    setEquipmentInput('')
    setFocusAreaInput('')
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const addEquipment = () => {
    if (equipmentInput.trim() && !formData.equipment_needed.includes(equipmentInput.trim())) {
      setFormData({ ...formData, equipment_needed: [...formData.equipment_needed, equipmentInput.trim()] })
      setEquipmentInput('')
    }
  }

  const removeEquipment = (item: string) => {
    setFormData({ ...formData, equipment_needed: formData.equipment_needed.filter(e => e !== item) })
  }

  const addFocusArea = () => {
    if (focusAreaInput.trim() && !formData.focus_areas.includes(focusAreaInput.trim())) {
      setFormData({ ...formData, focus_areas: [...formData.focus_areas, focusAreaInput.trim()] })
      setFocusAreaInput('')
    }
  }

  const removeFocusArea = (area: string) => {
    setFormData({ ...formData, focus_areas: formData.focus_areas.filter(f => f !== area) })
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading drill management...</p>
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
            Drill <span className="text-gradient-orange">Bank</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Create, organize, and assign training drills to athletes
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
          Create Drill
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="w-6 h-6 text-orange" />
            <span className="text-sm text-slate-400">Total</span>
          </div>
          <p className="text-3xl font-bold text-white">{drills.length}</p>
          <p className="text-sm text-slate-400">Drills in Library</p>
        </div>
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-sm text-slate-400">Active</span>
          </div>
          <p className="text-3xl font-bold text-white">{drills.filter(d => d.published).length}</p>
          <p className="text-sm text-slate-400">Published Drills</p>
        </div>
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-6 h-6 text-cyan" />
            <span className="text-sm text-slate-400">Content</span>
          </div>
          <p className="text-3xl font-bold text-white">{drills.filter(d => d.video_url).length}</p>
          <p className="text-sm text-slate-400">With Video</p>
        </div>
        <div className="command-panel-active">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-purple-400" />
            <span className="text-sm text-slate-400">Athletes</span>
          </div>
          <p className="text-3xl font-bold text-white">{athletes.length}</p>
          <p className="text-sm text-slate-400">Available to Assign</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="command-panel mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search drills by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange/50 appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="mechanics">Mechanics</option>
              <option value="speed">Speed</option>
              <option value="power">Power</option>
              <option value="recovery">Recovery</option>
              <option value="warmup">Warmup</option>
              <option value="conditioning">Conditioning</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange/50 appearance-none cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drills Grid */}
      <div className="space-y-4">
        {filteredDrills.map((drill) => (
          <div key={drill.id} className="command-panel hover:border-orange/30 transition-all group">
            <div className="flex items-start justify-between gap-4">
              {/* Drill Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-3">
                  {/* Thumbnail */}
                  {drill.thumbnail_url ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                      <img
                        src={drill.thumbnail_url}
                        alt={drill.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Video className="w-8 h-8 text-slate-600" />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-orange transition-colors">
                        {drill.title}
                      </h3>
                      {!drill.published && (
                        <span className="px-2 py-1 bg-slate-700/50 border border-slate-600/30 rounded-lg text-xs text-slate-400">
                          Draft
                        </span>
                      )}
                      {drill.featured && (
                        <span className="px-2 py-1 bg-orange/20 border border-orange/30 rounded-lg text-xs text-orange font-semibold">
                          Featured
                        </span>
                      )}
                    </div>

                    {drill.description && (
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{drill.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {drill.category && (
                        <span className="px-3 py-1 bg-cyan/20 border border-cyan/30 rounded-lg text-cyan font-semibold capitalize">
                          {drill.category}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 capitalize">
                        {drill.difficulty}
                      </span>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(drill.duration_seconds)}</span>
                      </div>
                      {drill.view_count > 0 && (
                        <span className="text-slate-400">{drill.view_count} views</span>
                      )}
                    </div>

                    {drill.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {drill.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-slate-800/50 rounded-lg text-xs text-slate-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setSelectedDrill(drill)
                    setAssignModalOpen(true)
                  }}
                  className="btn-ghost text-sm py-2 px-4 border-cyan/30 hover:border-cyan/50 hover:text-cyan"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Assign
                </button>
                <button
                  onClick={() => openEditModal(drill)}
                  className="btn-ghost text-sm py-2 px-4 border-orange/30 hover:border-orange/50 hover:text-orange"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedDrill(drill)
                    setDeleteModalOpen(true)
                  }}
                  className="btn-ghost text-sm py-2 px-4 border-red-500/30 hover:border-red-500/50 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDrills.length === 0 && (
        <div className="command-panel text-center py-12">
          <Dumbbell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-4">
            {searchQuery || categoryFilter !== 'all' || difficultyFilter !== 'all'
              ? 'No drills match your filters'
              : 'No drills yet'}
          </p>
          {!searchQuery && categoryFilter === 'all' && difficultyFilter === 'all' && (
            <button
              onClick={() => {
                resetForm()
                setCreateModalOpen(true)
              }}
              className="btn-primary"
            >
              Create Your First Drill
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Drill Modal */}
      {(createModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card max-w-3xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editModalOpen ? 'Edit Drill' : 'Create New Drill'}
              </h2>
              <button
                onClick={() => {
                  setCreateModalOpen(false)
                  setEditModalOpen(false)
                  setSelectedDrill(null)
                  resetForm()
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Long Toss Progression"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the drill..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50 resize-none"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Step-by-step instructions..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50 resize-none"
                />
              </div>

              {/* Video Source Toggle */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Video Source <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setVideoSource('youtube')}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      videoSource === 'youtube'
                        ? 'bg-orange text-white shadow-glow-orange'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/10'
                    }`}
                  >
                    <Youtube className="w-5 h-5" />
                    YouTube URL
                  </button>
                  <button
                    onClick={() => setVideoSource('upload')}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      videoSource === 'upload'
                        ? 'bg-orange text-white shadow-glow-orange'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/10'
                    }`}
                  >
                    <Upload className="w-5 h-5" />
                    Upload File
                  </button>
                </div>

                {videoSource === 'youtube' ? (
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                  />
                ) : (
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-orange/50 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-300 mb-1">Click to upload video</p>
                    <p className="text-sm text-slate-400">MP4, MOV up to 500MB</p>
                    <p className="text-xs text-slate-500 mt-2">Video upload feature coming soon - Use YouTube URL for now</p>
                  </div>
                )}
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                />
              </div>

              {/* Category and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange/50 appearance-none cursor-pointer"
                  >
                    <option value="mechanics">Mechanics</option>
                    <option value="speed">Speed</option>
                    <option value="power">Power</option>
                    <option value="recovery">Recovery</option>
                    <option value="warmup">Warmup</option>
                    <option value="conditioning">Conditioning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange/50 appearance-none cursor-pointer"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={formData.duration_seconds}
                  onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange/50"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {formatDuration(formData.duration_seconds)}
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag and press Enter"
                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                  />
                  <button
                    onClick={addTag}
                    className="btn-ghost px-4 py-2"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-800 rounded-lg text-sm text-slate-300 flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Equipment Needed</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={equipmentInput}
                    onChange={(e) => setEquipmentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                    placeholder="Add equipment and press Enter"
                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                  />
                  <button
                    onClick={addEquipment}
                    className="btn-ghost px-4 py-2"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.equipment_needed.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 bg-slate-800 rounded-lg text-sm text-slate-300 flex items-center gap-2"
                    >
                      {item}
                      <button
                        onClick={() => removeEquipment(item)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Focus Areas */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Focus Areas</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={focusAreaInput}
                    onChange={(e) => setFocusAreaInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFocusArea())}
                    placeholder="Add focus area and press Enter"
                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50"
                  />
                  <button
                    onClick={addFocusArea}
                    className="btn-ghost px-4 py-2"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.focus_areas.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1 bg-slate-800 rounded-lg text-sm text-slate-300 flex items-center gap-2"
                    >
                      {area}
                      <button
                        onClick={() => removeFocusArea(area)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Published and Featured */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-slate-800/50 text-orange focus:ring-orange focus:ring-offset-0"
                  />
                  <span className="text-white font-semibold">Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-slate-800/50 text-orange focus:ring-orange focus:ring-offset-0"
                  />
                  <span className="text-white font-semibold">Featured</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setCreateModalOpen(false)
                  setEditModalOpen(false)
                  setSelectedDrill(null)
                  resetForm()
                }}
                className="btn-ghost flex-1"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={editModalOpen ? handleUpdateDrill : handleCreateDrill}
                className="btn-primary flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? 'Saving...' : editModalOpen ? 'Update Drill' : 'Create Drill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedDrill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Delete Drill</h2>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete <span className="font-bold text-white">{selectedDrill.title}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false)
                  setSelectedDrill(null)
                }}
                className="btn-ghost flex-1"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDrill}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete Drill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Drill Modal */}
      {assignModalOpen && selectedDrill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Assign: {selectedDrill.title}
              </h2>
              <button
                onClick={() => {
                  setAssignModalOpen(false)
                  setSelectedDrill(null)
                  setSelectedAthletes([])
                  setAssignmentNotes('')
                  setAssignmentDueDate('')
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Athletes List */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Select Athletes <span className="text-red-400">*</span>
                </label>
                <div className="max-h-64 overflow-y-auto space-y-2 border border-white/10 rounded-xl p-4 bg-slate-800/30">
                  {athletes.map((athlete) => (
                    <label
                      key={athlete.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAthletes.includes(athlete.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAthletes([...selectedAthletes, athlete.id])
                          } else {
                            setSelectedAthletes(selectedAthletes.filter(id => id !== athlete.id))
                          }
                        }}
                        className="w-5 h-5 rounded border-white/20 bg-slate-800/50 text-orange focus:ring-orange focus:ring-offset-0"
                      />
                      <div className="flex items-center gap-3">
                        {athlete.avatar_url ? (
                          <img
                            src={athlete.avatar_url}
                            alt={athlete.full_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan to-orange flex items-center justify-center text-white font-bold text-sm">
                            {athlete.full_name.charAt(0)}
                          </div>
                        )}
                        <span className="text-white font-semibold">{athlete.full_name}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {selectedAthletes.length} athlete{selectedAthletes.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Priority</label>
                <select
                  value={assignmentPriority}
                  onChange={(e) => setAssignmentPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange/50 appearance-none cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Due Date (Optional)</label>
                <input
                  type="date"
                  value={assignmentDueDate}
                  onChange={(e) => setAssignmentDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange/50"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Notes (Optional)</label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Add any special instructions or notes for the athletes..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-orange/50 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setAssignModalOpen(false)
                  setSelectedDrill(null)
                  setSelectedAthletes([])
                  setAssignmentNotes('')
                  setAssignmentDueDate('')
                }}
                className="btn-ghost flex-1"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDrill}
                className="btn-primary flex-1"
                disabled={isProcessing || selectedAthletes.length === 0}
              >
                {isProcessing ? 'Assigning...' : `Assign to ${selectedAthletes.length} Athlete${selectedAthletes.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
