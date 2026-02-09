'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Lock, CreditCard, Mail, Phone, MapPin, Save, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'

export default function SettingsPage() {
  const { profile, loading: profileLoading } = useUserRole()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing'>('profile')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Profile form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')

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
        .select('phone, location, notification_preferences')
        .eq('id', profile.id)
        .single()

      if (data) {
        setPhone(data.phone || '')
        setLocation(data.location || '')
        if (data.notification_preferences) {
          setNotifications(data.notification_preferences)
        }
      }
    } catch (error) {
      console.error('Error loading user details:', error)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

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
      alert('Failed to save changes: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    if (!profile) return

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
      alert('Failed to save notification preferences')
    } finally {
      setSaving(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-800 dark:text-white">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <p className="text-cyan-800 dark:text-white">Please log in to access settings</p>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 lg:pb-8 relative">
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

                <div className="pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
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
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Preferences'}
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
        </div>
      </div>
    </div>
  )
}
