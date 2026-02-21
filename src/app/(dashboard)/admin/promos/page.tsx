'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { Tag, Plus, Trash2, Copy, Check, X, Loader2 } from 'lucide-react'
import { toastSuccess, toastError } from '@/lib/toast'

interface PromoCode {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed_cents'
  discount_value: number
  max_uses: number | null
  current_uses: number
  expires_at: string | null
  applies_to: string
  min_amount_cents: number
  is_active: boolean
  created_at: string
}

export default function AdminPromosPage() {
  const { isCoach, isAdmin } = useUserRole()
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_cents',
    discount_value: 10,
    max_uses: '',
    expires_at: '',
    applies_to: 'all',
    min_amount_cents: 0,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchPromos()
  }, [])

  const fetchPromos = async () => {
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPromos(data)
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (creating) return
    setCreating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('promo_codes').insert({
        code: form.code.toUpperCase().trim(),
        discount_type: form.discount_type,
        discount_value: form.discount_type === 'fixed_cents' ? Math.round(form.discount_value * 100) : form.discount_value,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
        applies_to: form.applies_to,
        min_amount_cents: form.min_amount_cents,
        created_by: user?.id,
      })

      if (error) throw error
      toastSuccess('Promo code created')
      setShowCreate(false)
      setForm({ code: '', discount_type: 'percentage', discount_value: 10, max_uses: '', expires_at: '', applies_to: 'all', min_amount_cents: 0 })
      fetchPromos()
    } catch (err: any) {
      toastError(err.message || 'Failed to create promo code')
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('promo_codes').update({ is_active: !active }).eq('id', id)
    fetchPromos()
  }

  const deletePromo = async (id: string) => {
    if (!confirm('Delete this promo code?')) return
    await supabase.from('promo_codes').delete().eq('id', id)
    fetchPromos()
    toastSuccess('Promo code deleted')
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!isCoach && !isAdmin) {
    return <div className="p-8 text-center text-slate-500">Access denied</div>
  }

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Tag className="w-8 h-8 text-orange" />
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">Promo Codes</h1>
            <p className="text-cyan-800 dark:text-white/60 text-sm">Create and manage discount codes for marketing</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Code
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="glass-card p-6 mb-8 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Promo Code</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SUMMER25"
                required
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">Discount Type</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed_cents' })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_cents">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">
                {form.discount_type === 'percentage' ? 'Discount %' : 'Discount $'}
              </label>
              <input
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: parseFloat(e.target.value) || 0 })}
                min="0"
                max={form.discount_type === 'percentage' ? 100 : undefined}
                required
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">Max Uses (blank = unlimited)</label>
              <input
                type="number"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                placeholder="Unlimited"
                min="1"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">Expires At (optional)</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-1">Applies To</label>
              <select
                value={form.applies_to}
                onChange={(e) => setForm({ ...form, applies_to: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white"
              >
                <option value="all">All (Bookings + Packages)</option>
                <option value="booking">Bookings Only</option>
                <option value="package">Packages Only</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Promo Codes List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-orange animate-spin mx-auto" />
        </div>
      ) : promos.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Tag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-white/50">No promo codes yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => (
            <div key={promo.id} className={`glass-card p-4 flex items-center gap-4 ${!promo.is_active ? 'opacity-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-lg text-slate-900 dark:text-white">{promo.code}</span>
                  <button onClick={() => copyCode(promo.code, promo.id)} className="text-slate-400 hover:text-cyan">
                    {copiedId === promo.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {!promo.is_active && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">INACTIVE</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-white/50">
                  <span>
                    {promo.discount_type === 'percentage'
                      ? `${promo.discount_value}% off`
                      : `$${(promo.discount_value / 100).toFixed(2)} off`}
                  </span>
                  <span>Used: {promo.current_uses}{promo.max_uses ? `/${promo.max_uses}` : ''}</span>
                  {promo.expires_at && <span>Expires: {new Date(promo.expires_at).toLocaleDateString()}</span>}
                  <span className="capitalize">{promo.applies_to}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(promo.id, promo.is_active)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    promo.is_active
                      ? 'bg-orange/10 text-orange hover:bg-orange/20'
                      : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                  }`}
                >
                  {promo.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => deletePromo(promo.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
