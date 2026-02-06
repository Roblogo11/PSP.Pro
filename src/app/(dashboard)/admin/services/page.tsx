'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, DollarSign, Clock, Users, Save, X } from 'lucide-react'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useRouter } from 'next/navigation'

interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price_cents: number
  category: string
  max_participants: number
  is_active: boolean
  stripe_price_id: string | null
}

export default function ServicesManagerPage() {
  const router = useRouter()
  const { isAdmin, loading: roleLoading } = useUserRole()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    description: '',
    duration_minutes: 60,
    price_cents: 7500,
    category: 'individual',
    max_participants: 1,
    is_active: true,
    stripe_price_id: '',
  })

  // Redirect if not admin
  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push('/locker')
    }
  }, [roleLoading, isAdmin, router])

  // Load services
  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true })
        .order('price_cents', { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (err) {
      console.error('Error loading services:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingId(service.id)
    setFormData(service)
    setShowNewForm(false)
  }

  const handleNew = () => {
    setShowNewForm(true)
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      duration_minutes: 60,
      price_cents: 7500,
      category: 'individual',
      max_participants: 1,
      is_active: true,
      stripe_price_id: '',
    })
  }

  const handleSave = async () => {
    try {
      const supabase = createClient()

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('services')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('services')
          .insert([formData])

        if (error) throw error
      }

      // Reload and reset
      await loadServices()
      setEditingId(null)
      setShowNewForm(false)
      setFormData({
        name: '',
        description: '',
        duration_minutes: 60,
        price_cents: 7500,
        category: 'individual',
        max_participants: 1,
        is_active: true,
        stripe_price_id: '',
      })
    } catch (err: any) {
      console.error('Error saving service:', err)
      alert(`Error: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadServices()
    } catch (err: any) {
      console.error('Error deleting service:', err)
      alert(`Error: ${err.message}`)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowNewForm(false)
    setFormData({
      name: '',
      description: '',
      duration_minutes: 60,
      price_cents: 7500,
      category: 'individual',
      max_participants: 1,
      is_active: true,
      stripe_price_id: '',
    })
  }

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'individual': return 'bg-orange/20 text-orange border-orange/50'
      case 'group': return 'bg-cyan/20 text-cyan border-cyan/50'
      case 'package': return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      default: return 'bg-cyan-600/20 text-cyan-600 border-cyan-600/50'
    }
  }

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Services Manager</h1>
            <p className="text-cyan-700 dark:text-white">Manage training sessions, packages, and pricing</p>
          </div>
          <button
            onClick={handleNew}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Service
          </button>
        </div>
      </div>

      {/* New/Edit Form */}
      {(showNewForm || editingId) && (
        <div className="glass-card p-6 mb-6 border-2 border-orange/50">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Edit Service' : 'New Service'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50"
                placeholder="e.g., 1-on-1 Training Session"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50"
                placeholder="Brief description of the service..."
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
                Price (in cents) *
              </label>
              <input
                type="number"
                value={formData.price_cents || 0}
                onChange={(e) => setFormData({ ...formData, price_cents: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50"
                placeholder="7500 = $75.00"
              />
              <p className="text-xs text-cyan-700 dark:text-white mt-1">
                Shows as: {formatPrice(formData.price_cents || 0)}
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration_minutes || 0}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50"
                placeholder="60"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
                Category *
              </label>
              <select
                value={formData.category || 'individual'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan/50"
              >
                <option value="individual">Individual</option>
                <option value="group">Group</option>
                <option value="package">Package</option>
              </select>
            </div>

            {/* Max Participants */}
            <div>
              <label className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
                Max Participants
              </label>
              <input
                type="number"
                value={formData.max_participants || 1}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50"
                placeholder="1"
              />
            </div>

            {/* Stripe Price ID */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-cyan-800 dark:text-white mb-2">
                Stripe Price ID (optional)
              </label>
              <input
                type="text"
                value={formData.stripe_price_id || ''}
                onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                className="w-full px-4 py-3 bg-cyan-50/50 border border-cyan-200/40 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50"
                placeholder="price_xxxxxxxxxxxxx"
              />
            </div>

            {/* Active Toggle */}
            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-cyan-200/40 text-orange focus:ring-cyan/50"
              />
              <label className="text-sm font-medium text-cyan-800 dark:text-white">
                Service is active and visible to athletes
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Service
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-800 dark:text-white border border-cyan-600/30 hover:border-cyan-600/50 transition-all"
            >
              <X className="w-5 h-5 inline mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`glass-card p-6 transition-all ${
              !service.is_active ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{service.name}</h3>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase border ${getCategoryColor(service.category)}`}>
                    {service.category}
                  </span>
                  {!service.is_active && (
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold uppercase bg-red-500/20 text-red-400 border border-red-500/50">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Description */}
                {service.description && (
                  <p className="text-cyan-700 dark:text-white mb-4">{service.description}</p>
                )}

                {/* Details */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-white font-semibold">{formatPrice(service.price_cents)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan" />
                    <span className="text-cyan-700 dark:text-white">{service.duration_minutes} min</span>
                  </div>
                  {service.category === 'group' && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-cyan-700 dark:text-white">Max {service.max_participants}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="p-2 rounded-lg bg-cyan/10 hover:bg-cyan/20 text-cyan border border-cyan/30 hover:border-cyan/50 transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && !showNewForm && (
        <div className="text-center py-12 glass-card">
          <p className="text-cyan-700 dark:text-white mb-4">No services yet. Create your first one!</p>
          <button
            onClick={handleNew}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Service
          </button>
        </div>
      )}
    </div>
  )
}
