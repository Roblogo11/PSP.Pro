'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { toastSuccess, toastError } from '@/lib/toast'
import {
  Building2, Users, CreditCard, Palette, Globe, Plus, X, Check,
  ExternalLink, Loader2, ChevronRight, Settings, AlertCircle,
  Copy, Trash2, UserPlus, Shield, Zap,
} from 'lucide-react'
import { LogoColorExtractor } from '@/components/org/logo-color-extractor'

interface Org {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  tagline: string | null
  stripe_connect_status: string
  platform_fee_percent: number
  allow_self_signup: boolean
  require_approval: boolean
  is_active: boolean
  owner_id: string
  created_at: string
  member_count?: { count: number }[]
  owner?: { id: string; full_name: string; email: string }
  members?: any[]
}

type Tab = 'overview' | 'members' | 'branding' | 'payouts' | 'settings'

export default function OrgPage() {
  const { profile, isMasterAdmin, isAdmin } = useUserRole()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'overview')

  const [orgs, setOrgs] = useState<Org[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Org | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  // Create org form
  const [createForm, setCreateForm] = useState({
    name: '', slug: '', tagline: '', primary_color: '#f97316',
    secondary_color: '#06b6d4', sport_focus: [] as string[], platform_fee_percent: 15,
  })
  const [creating, setCreating] = useState(false)

  // Invite member form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'athlete' | 'coach' | 'admin'>('athlete')
  const [inviting, setInviting] = useState(false)

  // Stripe Connect
  const [connectStatus, setConnectStatus] = useState<any>(null)
  const [onboarding, setOnboarding] = useState(false)

  // Branding form
  const [brandingForm, setBrandingForm] = useState<Partial<Org>>({})
  const [savingBranding, setSavingBranding] = useState(false)

  useEffect(() => { loadOrgs() }, [])
  useEffect(() => {
    if (selectedOrg) {
      setBrandingForm({
        name: selectedOrg.name,
        tagline: selectedOrg.tagline || '',
        primary_color: selectedOrg.primary_color,
        secondary_color: selectedOrg.secondary_color,
      })
      loadConnectStatus()
    }
  }, [selectedOrg])

  // Handle return from Stripe onboarding
  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'connected') {
      toastSuccess('Stripe account connected! Your payout account is ready.')
      loadConnectStatus()
    } else if (status === 'refresh') {
      toastError('Onboarding incomplete. Please try again.')
    }
  }, [searchParams])

  async function loadOrgs() {
    setLoading(true)
    try {
      const res = await fetch('/api/org')
      const data = await res.json()
      setOrgs(data.orgs || [])
      if (data.orgs?.length && !selectedOrg) setSelectedOrg(data.orgs[0])
    } catch {
      toastError('Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }

  async function loadOrgDetail(orgId: string) {
    try {
      const res = await fetch(`/api/org/${orgId}`)
      const data = await res.json()
      if (data.org) {
        setSelectedOrg(data.org)
        setOrgs(prev => prev.map(o => o.id === orgId ? data.org : o))
      }
    } catch {}
  }

  async function loadConnectStatus() {
    if (!selectedOrg) return
    try {
      const res = await fetch(`/api/stripe/connect/status?org_id=${selectedOrg.id}`)
      const data = await res.json()
      setConnectStatus(data)
    } catch {}
  }

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (!res.ok) { toastError(data.error); return }
      toastSuccess(`Organization "${data.org.name}" created!`)
      setShowCreate(false)
      setCreateForm({ name: '', slug: '', tagline: '', primary_color: '#f97316', secondary_color: '#06b6d4', sport_focus: [], platform_fee_percent: 15 })
      await loadOrgs()
      setSelectedOrg(data.org)
    } catch {
      toastError('Failed to create organization')
    } finally {
      setCreating(false)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedOrg) return
    setInviting(true)
    try {
      const res = await fetch(`/api/org/${selectedOrg.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) { toastError(data.error); return }
      toastSuccess(`${inviteEmail} added to ${selectedOrg.name}`)
      setInviteEmail('')
      await loadOrgDetail(selectedOrg.id)
    } catch {
      toastError('Failed to add member')
    } finally {
      setInviting(false)
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!selectedOrg) return
    try {
      const res = await fetch(`/api/org/${selectedOrg.id}/members?user_id=${userId}`, { method: 'DELETE' })
      if (res.ok) {
        toastSuccess('Member removed')
        await loadOrgDetail(selectedOrg.id)
      }
    } catch {
      toastError('Failed to remove member')
    }
  }

  async function handleSaveBranding(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedOrg) return
    setSavingBranding(true)
    try {
      const res = await fetch(`/api/org/${selectedOrg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandingForm),
      })
      const data = await res.json()
      if (!res.ok) { toastError(data.error); return }
      toastSuccess('Branding saved!')
      setSelectedOrg(data.org)
    } catch {
      toastError('Failed to save branding')
    } finally {
      setSavingBranding(false)
    }
  }

  async function handleConnectStripe() {
    if (!selectedOrg) return
    setOnboarding(true)
    try {
      const res = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: selectedOrg.id }),
      })
      const data = await res.json()
      if (!res.ok) { toastError(data.error); return }
      window.location.href = data.url
    } catch {
      toastError('Failed to start Stripe onboarding')
    } finally {
      setOnboarding(false)
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { id: 'branding', label: 'Branding', icon: <Palette className="w-4 h-4" /> },
    { id: 'payouts', label: 'Payouts', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  const statusColors: Record<string, string> = {
    active: 'text-green-400 bg-green-400/10',
    pending: 'text-amber-400 bg-amber-400/10',
    not_connected: 'text-slate-400 bg-slate-400/10',
    restricted: 'text-red-400 bg-red-400/10',
    disabled: 'text-red-400 bg-red-400/10',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            Organizations
          </h1>
          <p className="text-sm text-cyan-700 dark:text-white/60 mt-1">
            Manage your coaching academies, teams, and white-label deployments
          </p>
        </div>
        {(isMasterAdmin || isAdmin) && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Org
          </button>
        )}
      </div>

      {/* Create Org Modal */}
      {showCreate && (
        <div role="dialog" aria-modal="true" aria-label="Create Organization" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cyan-200/40 shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Organization</h3>
              <button onClick={() => setShowCreate(false)} aria-label="Close" className="p-2 hover:bg-cyan-50/50 rounded-lg">
                <X className="w-5 h-5 text-cyan-800 dark:text-white" />
              </button>
            </div>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-1">Org Name *</label>
                <input required value={createForm.name} onChange={e => {
                  const name = e.target.value
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                  setCreateForm(f => ({ ...f, name, slug }))
                }} placeholder="Elite Athletics Academy" className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-1">Slug (URL identifier) *</label>
                <input required value={createForm.slug} onChange={e => setCreateForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} placeholder="elite-athletics" className="input-field w-full font-mono" />
                <p className="text-xs text-cyan-600 dark:text-white/40 mt-1">propersports.pro/org/{createForm.slug || 'your-slug'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-1">Tagline</label>
                <input value={createForm.tagline} onChange={e => setCreateForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Train hard. Play harder." className="input-field w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={createForm.primary_color} onChange={e => setCreateForm(f => ({ ...f, primary_color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border border-cyan-200/40" />
                    <span className="text-sm text-slate-600 dark:text-white/60 font-mono">{createForm.primary_color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={createForm.secondary_color} onChange={e => setCreateForm(f => ({ ...f, secondary_color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border border-cyan-200/40" />
                    <span className="text-sm text-slate-600 dark:text-white/60 font-mono">{createForm.secondary_color}</span>
                  </div>
                </div>
              </div>
              {isMasterAdmin && (
                <div>
                  <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-1">Platform Fee %</label>
                  <input type="number" min="0" max="50" step="0.5" value={createForm.platform_fee_percent} onChange={e => setCreateForm(f => ({ ...f, platform_fee_percent: parseFloat(e.target.value) }))} className="input-field w-full" />
                  <p className="text-xs text-cyan-600 dark:text-white/40 mt-1">PSP keeps this % of each booking. Coaches keep the rest.</p>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {orgs.length === 0 ? (
        /* Empty state */
        <div className="glass-card p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-cyan-400/50 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No organizations yet</h3>
          <p className="text-cyan-700 dark:text-white/60 max-w-sm mx-auto">
            Create an organization to manage multiple coaches, athletes, and white-label deployments under one roof.
          </p>
          {(isMasterAdmin || isAdmin) && (
            <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Your First Org
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Org Sidebar */}
          <div className="space-y-2">
            {orgs.map(org => (
              <button
                key={org.id}
                onClick={() => { setSelectedOrg(org); loadOrgDetail(org.id) }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedOrg?.id === org.id
                    ? 'bg-cyan-50 dark:bg-cyan/10 border-cyan/40 shadow-sm'
                    : 'bg-white/50 dark:bg-slate-800/50 border-cyan-200/20 hover:border-cyan/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: org.primary_color }}>
                    {org.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{org.name}</p>
                    <p className="text-xs text-cyan-700 dark:text-white/50 truncate">/{org.slug}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          {/* Org Detail */}
          {selectedOrg && (
            <div className="lg:col-span-3 space-y-4">
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/70'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* ── Overview Tab ── */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="glass-card p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                        style={{ backgroundColor: selectedOrg.primary_color }}>
                        {selectedOrg.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedOrg.name}</h2>
                        {selectedOrg.tagline && <p className="text-cyan-700 dark:text-white/60">{selectedOrg.tagline}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan/10 text-cyan-800 dark:text-cyan-300 font-mono">
                            /{selectedOrg.slug}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedOrg.is_active ? 'bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400'}`}>
                            {selectedOrg.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="glass-card p-4 text-center">
                      <Users className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedOrg.members?.length ?? '—'}
                      </p>
                      <p className="text-xs text-cyan-700 dark:text-white/50">Members</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                      <CreditCard className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedOrg.platform_fee_percent}%
                      </p>
                      <p className="text-xs text-cyan-700 dark:text-white/50">Platform Fee</p>
                    </div>
                    <div className="glass-card p-4 text-center">
                      <Zap className={`w-6 h-6 mx-auto mb-2 ${connectStatus?.connected ? 'text-green-500' : 'text-slate-400'}`} />
                      <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {connectStatus?.status?.replace('_', ' ') || '...'}
                      </p>
                      <p className="text-xs text-cyan-700 dark:text-white/50">Stripe Connect</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Members Tab ── */}
              {activeTab === 'members' && (
                <div className="space-y-4">
                  {/* Invite form */}
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-cyan-500" /> Add Member
                    </h3>
                    <form onSubmit={handleInvite} className="flex gap-2">
                      <input
                        type="email" required value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="athlete@email.com" className="input-field flex-1"
                      />
                      <select value={inviteRole} onChange={e => setInviteRole(e.target.value as any)} className="input-field">
                        <option value="athlete">Athlete</option>
                        <option value="coach">Coach</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button type="submit" disabled={inviting} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                        {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add
                      </button>
                    </form>
                  </div>

                  {/* Member list */}
                  <div className="glass-card divide-y divide-cyan-200/20 dark:divide-white/5">
                    {selectedOrg.members?.length === 0 && (
                      <p className="p-6 text-center text-cyan-700 dark:text-white/50 text-sm">No members yet</p>
                    )}
                    {selectedOrg.members?.map((m: any) => (
                      <div key={m.id} className="flex items-center gap-3 p-4">
                        <div className="w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan/10 flex items-center justify-center font-bold text-sm text-cyan-700 dark:text-cyan-300">
                          {m.user?.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{m.user?.full_name}</p>
                          <p className="text-xs text-cyan-700 dark:text-white/50 truncate">{m.user?.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                          m.role === 'owner' ? 'bg-orange-100 text-orange-700 dark:bg-orange/10 dark:text-orange-400' :
                          m.role === 'coach' ? 'bg-purple-100 text-purple-700 dark:bg-purple-400/10 dark:text-purple-400' :
                          m.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-white/60'
                        }`}>{m.role}</span>
                        {m.role !== 'owner' && m.user?.id !== profile?.id && (
                          <button onClick={() => handleRemoveMember(m.user?.id)} aria-label="Remove member" className="p-1 text-slate-400 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Branding Tab ── */}
              {activeTab === 'branding' && (
                <div className="space-y-4">
                  {/* Logo + Auto Color Extractor */}
                  <div className="glass-card p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-500" /> Logo → Auto Color Scan
                    </h3>
                    <p className="text-xs text-cyan-700 dark:text-white/50 mb-4">
                      Drop your logo URL or upload it — we'll scan the colors and let you pick your brand palette in one click.
                    </p>
                    <LogoColorExtractor
                      currentLogoUrl={selectedOrg.logo_url}
                      currentPrimary={brandingForm.primary_color || selectedOrg.primary_color}
                      currentSecondary={brandingForm.secondary_color || selectedOrg.secondary_color}
                      onApply={async (logoUrl, primary, secondary) => {
                        setSavingBranding(true)
                        try {
                          const res = await fetch(`/api/org/${selectedOrg.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ logo_url: logoUrl, primary_color: primary, secondary_color: secondary }),
                          })
                          const data = await res.json()
                          if (!res.ok) { toastError(data.error); return }
                          toastSuccess('Logo + colors saved!')
                          setBrandingForm(f => ({ ...f, primary_color: primary, secondary_color: secondary }))
                          setSelectedOrg(data.org)
                        } catch { toastError('Failed to save') }
                        finally { setSavingBranding(false) }
                      }}
                    />
                  </div>

                  {/* Manual text fields */}
                  <div className="glass-card p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-cyan-500" /> Name, Tagline & Copy
                    </h3>
                    <form onSubmit={handleSaveBranding} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-1">Org Name</label>
                          <input value={brandingForm.name || ''} onChange={e => setBrandingForm(f => ({ ...f, name: e.target.value }))} className="input-field w-full" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-1">Tagline</label>
                          <input value={brandingForm.tagline || ''} onChange={e => setBrandingForm(f => ({ ...f, tagline: e.target.value }))} className="input-field w-full" placeholder="Train hard. Play harder." />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-1">Hero Headline</label>
                          <input value={(brandingForm as any).hero_headline || ''} onChange={e => setBrandingForm(f => ({ ...f, hero_headline: e.target.value }))} className="input-field w-full" placeholder={`Train with ${selectedOrg.name}`} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-1">Hero Subheadline</label>
                          <input value={(brandingForm as any).hero_subheadline || ''} onChange={e => setBrandingForm(f => ({ ...f, hero_subheadline: e.target.value }))} className="input-field w-full" placeholder="Elite coaching tailored to your goals." />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cyan-700 dark:text-white mb-1">About Text</label>
                        <textarea
                          rows={3}
                          value={(brandingForm as any).about_text || ''}
                          onChange={e => setBrandingForm(f => ({ ...f, about_text: e.target.value }))}
                          className="input-field w-full resize-none"
                          placeholder="Tell athletes who you are and what makes your coaching different..."
                        />
                      </div>

                      {/* Fine-tune colors manually */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-cyan-200/20">
                        <div>
                          <label className="block text-xs font-medium text-cyan-700 dark:text-white/60 mb-2 uppercase tracking-wider">Fine-tune Primary</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={brandingForm.primary_color || '#f97316'} onChange={e => setBrandingForm(f => ({ ...f, primary_color: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border border-cyan-200/40" />
                            <span className="text-xs font-mono text-slate-500 dark:text-white/50">{brandingForm.primary_color}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-cyan-700 dark:text-white/60 mb-2 uppercase tracking-wider">Fine-tune Secondary</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={brandingForm.secondary_color || '#06b6d4'} onChange={e => setBrandingForm(f => ({ ...f, secondary_color: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border border-cyan-200/40" />
                            <span className="text-xs font-mono text-slate-500 dark:text-white/50">{brandingForm.secondary_color}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button type="submit" disabled={savingBranding} className="btn-primary flex items-center gap-2">
                          {savingBranding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Save Branding
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Org page link */}
                  <div className="glass-card p-4 flex items-center gap-3">
                    <Globe className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-cyan-700 dark:text-white/60">Your public org page</p>
                      <p className="text-sm font-mono text-slate-900 dark:text-white truncate">propersports.pro/org/{selectedOrg.slug}</p>
                    </div>
                    <a href={`/org/${selectedOrg.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-400 whitespace-nowrap">
                      Preview <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* ── Payouts Tab ── */}
              {activeTab === 'payouts' && (
                <div className="space-y-4">
                  <div className="glass-card p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-cyan-500" /> Stripe Connect
                    </h3>

                    {connectStatus?.connected ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-400/5 border border-green-200/40 dark:border-green-400/20 rounded-xl">
                          <Check className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-semibold text-green-700 dark:text-green-400">Stripe Connected</p>
                            <p className="text-sm text-green-600 dark:text-green-400/70">Payouts are enabled. Athletes' payments split automatically.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <p className="text-xs text-cyan-700 dark:text-white/50 mb-1">You Receive</p>
                            <p className="text-2xl font-bold text-green-500">{connectStatus.coach_revenue_percent}%</p>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <p className="text-xs text-cyan-700 dark:text-white/50 mb-1">Platform Fee</p>
                            <p className="text-2xl font-bold text-slate-500">{100 - connectStatus.coach_revenue_percent}%</p>
                          </div>
                        </div>
                        <p className="text-xs text-cyan-700 dark:text-white/50">Account ID: <span className="font-mono">{connectStatus.stripe_account_id}</span></p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-400/5 border border-amber-200/40 dark:border-amber-400/20 rounded-xl">
                          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-amber-700 dark:text-amber-400">Connect Stripe to Receive Payouts</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400/70 mt-1">
                              Link your bank account via Stripe Express. Takes ~5 minutes. PSP platform fee of <strong>{selectedOrg.platform_fee_percent}%</strong> applies — you keep the rest.
                            </p>
                          </div>
                        </div>
                        <button onClick={handleConnectStripe} disabled={onboarding} className="btn-primary flex items-center gap-2">
                          {onboarding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          Connect Stripe Account
                          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="glass-card p-5">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">How splits work</h4>
                    <div className="space-y-2 text-sm text-cyan-700 dark:text-white/60">
                      <div className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" /><p>Athlete pays full price at checkout via Stripe</p></div>
                      <div className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" /><p>PSP platform fee ({selectedOrg.platform_fee_percent}%) automatically deducted</p></div>
                      <div className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" /><p>Remainder transfers to your connected bank account</p></div>
                      <div className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" /><p>Payouts typically arrive in 2 business days</p></div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Settings Tab ── */}
              {activeTab === 'settings' && (
                <div className="glass-card p-6 space-y-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-cyan-500" /> Organization Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">Allow Self-Signup</p>
                        <p className="text-xs text-cyan-700 dark:text-white/50">Athletes can join this org without an invite</p>
                      </div>
                      <button onClick={async () => {
                        await fetch(`/api/org/${selectedOrg.id}`, {
                          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ allow_self_signup: !selectedOrg.allow_self_signup }),
                        })
                        await loadOrgDetail(selectedOrg.id)
                      }} className={`relative w-11 h-6 rounded-full transition-colors ${selectedOrg.allow_self_signup ? 'bg-orange' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${selectedOrg.allow_self_signup ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">Require Coach Approval</p>
                        <p className="text-xs text-cyan-700 dark:text-white/50">New athletes must be approved before accessing content</p>
                      </div>
                      <button onClick={async () => {
                        await fetch(`/api/org/${selectedOrg.id}`, {
                          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ require_approval: !selectedOrg.require_approval }),
                        })
                        await loadOrgDetail(selectedOrg.id)
                      }} className={`relative w-11 h-6 rounded-full transition-colors ${selectedOrg.require_approval ? 'bg-orange' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${selectedOrg.require_approval ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  {isMasterAdmin && (
                    <div className="border-t border-red-200/30 pt-5">
                      <h4 className="text-sm font-semibold text-red-500 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Danger Zone
                      </h4>
                      <button onClick={async () => {
                        if (!confirm(`⚠️ Deactivate "${selectedOrg.name}"?\n\nThis will hide the org and its public landing page from athletes.`)) return
                        if (!confirm(`Are you absolutely sure?\n\nType OK to confirm — this will immediately take "${selectedOrg.name}" offline.`)) return
                        const res = await fetch(`/api/org/${selectedOrg.id}`, { method: 'DELETE' })
                        if (res.ok) { toastSuccess('Org deactivated'); loadOrgs() }
                        else toastError('Failed to deactivate org')
                      }} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium">
                        <Trash2 className="w-4 h-4" /> Deactivate Organization
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
