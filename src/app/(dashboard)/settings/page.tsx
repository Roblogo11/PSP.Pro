'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Lock, CreditCard, Mail, Phone, MapPin, Save, Check, Medal, ShieldCheck, Download, Trash2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { toastError } from '@/lib/toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SettingsInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, loading: profileLoading, isImpersonating } = useUserRole()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing' | 'privacy'>(
    (searchParams.get('tab') as any) || 'profile'
  )
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Profile form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false)
  const [region, setRegion] = useState('')

  // Privacy tab state
  const [newsletterConsent, setNewsletterConsent] = useState(false)
  const [savingConsent, setSavingConsent] = useState(false)
  const [consentSaved, setConsentSaved] = useState(false)
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Notification preferences
  const [notifications, setNotifications] = useState({
    sessionReminders: true,
    progressUpdates: true,
    newDrills: true,
    achievements: true,
    coachMessages: true,
  })

  // Load user data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setEmail(profile.email || '')
      // Load additional fields from database
      loadUserDetails()
    }
  }, [profile])

  const loadUserDetails = async () => {
    if (!profile) return

    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('phone, location, notification_preferences, leaderboard_opt_in, region, newsletter_consent')
        .eq('id', profile.id)
        .single()

      if (data) {
        setPhone(data.phone || '')
        setLocation(data.location || '')
        setLeaderboardOptIn(data.leaderboard_opt_in || false)
        setRegion(data.region || '')
        setNewsletterConsent(data.newsletter_consent || false)
        if (data.notification_preferences) {
          setNotifications(data.notification_preferences)
        }
      }
    } catch (error) {
      console.error('Error loading user details:', error)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile || isImpersonating) return

    setSaving(true)
    setSaveSuccess(false)

    try {
      const supabase = createClient()

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          location: location,
          leaderboard_opt_in: leaderboardOptIn,
          region: region || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      // Update email if changed (requires separate auth update)
      if (email !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        })
        if (emailError) throw emailError
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toastError('Failed to save changes: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    if (!profile || isImpersonating) return

    setSaving(true)
    setSaveSuccess(false)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: notifications,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error saving notifications:', error)
      toastError('Failed to save notification preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveConsent = async () => {
    if (!profile || isImpersonating) return
    setSavingConsent(true)
    try {
      const supabase = createClient()
      await supabase.from('profiles').update({ newsletter_consent: newsletterConsent }).eq('id', profile.id)
      setConsentSaved(true)
      setTimeout(() => setConsentSaved(false), 3000)
    } catch (err: any) {
      toastError('Failed to save preferences')
    } finally {
      setSavingConsent(false)
    }
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/auth/export-data')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `psp-data-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      toastError('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!profile || deleteConfirmEmail !== profile.email) return
    setDeleting(true)
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      router.push('/?deleted=true')
    } catch (err: any) {
      toastError(err.message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-800 dark:text-white">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen px-3 py-4 md:p-8 flex items-center justify-center">
        <p className="text-cyan-800 dark:text-white">Please log in to access settings</p>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'privacy', label: 'Privacy & Data', icon: ShieldCheck },
  ]

  return (
    <div className="min-h-screen px-3 py-4 md:p-8 pb-24 lg:pb-8 relative">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Account <span className="text-gradient-orange">Settings</span>
        </h1>
        <p className="text-cyan-800 dark:text-white text-lg">Manage your account preferences and settings</p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
          <Check className="w-5 h-5 text-green-400" />
          <p className="text-green-400 font-semibold">Changes saved successfully!</p>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="command-panel space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-orange text-white shadow-glow-orange'
                      : 'text-cyan-600 hover:bg-cyan-900/30 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="command-panel">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Profile Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-slate-900 dark:text-white focus:border-orange focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-slate-900 dark:text-white focus:border-orange focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-cyan-800 dark:text-white mt-1">
                    Changing your email will require verification
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-slate-900 dark:text-white focus:border-orange focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                    className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-slate-900 dark:text-white focus:border-orange focus:outline-none transition-colors"
                  />
                </div>

                {/* Leaderboard Section */}
                <div className="pt-4 mt-4 border-t border-cyan-200/40">
                  <div className="flex items-center gap-2 mb-4">
                    <Medal className="w-5 h-5 text-orange" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Leaderboard Settings</h3>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-cyan-900/20 rounded-xl mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Show on Leaderboards</h4>
                      <p className="text-sm text-cyan-800 dark:text-white">Display your best metrics on regional leaderboards</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={leaderboardOptIn}
                        onChange={(e) => setLeaderboardOptIn(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-cyan-800/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange"></div>
                    </label>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-cyan-700 dark:text-white mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Region / Area Code
                    </label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g., 757, Hampton Roads, VA"
                      className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-slate-900 dark:text-white focus:border-orange focus:outline-none transition-colors"
                    />
                    <p className="text-xs text-cyan-800 dark:text-white mt-1">
                      Used for regional leaderboard filtering
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving || isImpersonating}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {isImpersonating ? 'Read-only mode' : saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="command-panel">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h2>

              <div className="space-y-6">
                {[
                  {
                    key: 'sessionReminders',
                    label: 'Session Reminders',
                    desc: 'Get notified before your training sessions',
                  },
                  {
                    key: 'progressUpdates',
                    label: 'Progress Updates',
                    desc: 'Weekly summaries of your athletic progress',
                  },
                  {
                    key: 'newDrills',
                    label: 'New Drills',
                    desc: 'Notifications when new drills are assigned',
                  },
                  {
                    key: 'achievements',
                    label: 'Achievement Unlocked',
                    desc: 'Celebrate when you hit milestones',
                  },
                  {
                    key: 'coachMessages',
                    label: 'Coach Messages',
                    desc: 'Messages and feedback from your coach',
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-cyan-900/20 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{item.label}</h3>
                      <p className="text-sm text-cyan-800 dark:text-white">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={(e) =>
                          setNotifications({ ...notifications, [item.key]: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-cyan-800/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange"></div>
                    </label>
                  </div>
                ))}

                <div className="pt-4">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving || isImpersonating}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {isImpersonating ? 'Read-only mode' : saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="command-panel">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div className="p-4 bg-cyan/10 border border-cyan/20 rounded-xl">
                  <p className="text-cyan text-sm">
                    Password reset and advanced security features coming soon!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="command-panel">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Billing & Subscription</h2>
              <div className="space-y-6">
                <div className="p-4 bg-cyan/10 border border-cyan/20 rounded-xl">
                  <p className="text-cyan text-sm">
                    Subscription management coming soon! Contact support for billing questions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="command-panel space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy & Data</h2>

              {/* Your Rights */}
              <section>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan" />
                  Your Data Rights
                </h3>
                <ul className="space-y-2 text-sm text-cyan-700 dark:text-white/80">
                  <li>✓ Access — download a copy of all your data below</li>
                  <li>✓ Correction — update your profile in the Profile tab</li>
                  <li>✓ Deletion — permanently delete your account below</li>
                  <li>✓ Portability — export your data in JSON format</li>
                  <li>✓ Opt-out — manage marketing preferences below</li>
                </ul>
              </section>

              {/* Marketing Preferences */}
              <section className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Marketing Preferences</h3>
                <div className="flex items-center justify-between p-4 bg-cyan-900/20 rounded-xl mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Training Tips & Updates</h4>
                    <p className="text-sm text-cyan-800 dark:text-white/70">Receive news, tips, and updates from PSP.Pro</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsletterConsent}
                      onChange={(e) => setNewsletterConsent(e.target.checked)}
                      disabled={isImpersonating}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-cyan-800/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange"></div>
                  </label>
                </div>
                <button
                  onClick={handleSaveConsent}
                  disabled={savingConsent || isImpersonating}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {consentSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {consentSaved ? 'Saved!' : savingConsent ? 'Saving...' : 'Save Preferences'}
                </button>
              </section>

              {/* Download Data */}
              <section className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Download Your Data</h3>
                <p className="text-sm text-cyan-700 dark:text-white/70 mb-4">
                  Export a copy of all your personal data, bookings, performance metrics, and account info as a JSON file.
                </p>
                <button
                  onClick={handleExportData}
                  disabled={exporting || isImpersonating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl hover:bg-cyan-500/30 transition-colors disabled:opacity-50 text-sm font-semibold"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? 'Preparing export...' : 'Download My Data (JSON)'}
                </button>
              </section>

              {/* Delete Account */}
              <section className="border-t border-red-500/20 pt-6">
                <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </h3>
                <p className="text-sm text-white/60 mb-4">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
                {!showDeleteModal ? (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isImpersonating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50 text-sm font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete My Account
                  </button>
                ) : (
                  <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl space-y-4">
                    <p className="text-sm text-red-300 font-semibold">
                      This will permanently delete your account and all data. Type your email address to confirm:
                    </p>
                    <input
                      type="email"
                      value={deleteConfirmEmail}
                      onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                      placeholder={profile.email || 'your@email.com'}
                      className="w-full px-4 py-2.5 bg-black/20 border border-red-500/30 rounded-xl text-white focus:border-red-400 focus:outline-none text-sm"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting || deleteConfirmEmail !== profile.email}
                        className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleting ? 'Deleting...' : 'Permanently Delete Account'}
                      </button>
                      <button
                        onClick={() => { setShowDeleteModal(false); setDeleteConfirmEmail('') }}
                        className="px-5 py-2 bg-white/5 border border-white/10 text-white/70 rounded-xl text-sm hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SettingsInner />
    </Suspense>
  )
}
