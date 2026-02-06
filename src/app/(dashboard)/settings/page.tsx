'use client'

import { useState } from 'react'
import { User, Bell, Lock, CreditCard, Mail, Phone, MapPin, Save } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing'>(
    'profile'
  )

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
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
          Account <span className="text-gradient-orange">Settings</span>
        </h1>
        <p className="text-slate-400 text-lg">Manage your account preferences and settings</p>
      </div>

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
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
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
              <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Athlete"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="athlete@psppro.com"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue="(555) 123-4567"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <input
                    type="text"
                    defaultValue="Los Angeles, CA"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
                  />
                </div>

                <div className="pt-4">
                  <button className="btn-primary">
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="command-panel">
              <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>

              <div className="space-y-6">
                {[
                  { label: 'Session Reminders', desc: 'Get notified before your training sessions' },
                  { label: 'Progress Updates', desc: 'Weekly summaries of your athletic progress' },
                  { label: 'New Drills', desc: 'Notifications when new drills are assigned' },
                  { label: 'Achievement Unlocked', desc: 'Celebrate when you hit milestones' },
                  { label: 'Coach Messages', desc: 'Messages and feedback from your coach' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.label}</h3>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="command-panel">
              <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
                      />
                    </div>
                    <button className="btn-primary">Update Password</button>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="font-semibold text-white mb-4">Two-Factor Authentication</h3>
                  <p className="text-slate-400 mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <button className="btn-secondary">Enable 2FA</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="command-panel">
              <h2 className="text-2xl font-bold text-white mb-6">Billing & Subscription</h2>

              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-orange/10 to-cyan/10 border border-orange/20 rounded-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Pro Athlete Plan</h3>
                      <p className="text-slate-400">Unlimited sessions & drills</p>
                    </div>
                    <span className="text-3xl font-bold text-orange">$199/mo</span>
                  </div>
                  <button className="btn-ghost w-full">Manage Subscription</button>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-4">Payment Method</h3>
                  <div className="p-4 bg-slate-800/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gradient-to-r from-orange to-cyan rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">•••• •••• •••• 4242</p>
                        <p className="text-sm text-slate-400">Expires 12/25</p>
                      </div>
                    </div>
                    <button className="btn-ghost text-sm">Update</button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-4">Billing History</h3>
                  <div className="space-y-2">
                    {['Jan 2026', 'Dec 2025', 'Nov 2025'].map((month) => (
                      <div
                        key={month}
                        className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl"
                      >
                        <div>
                          <p className="font-semibold text-white">{month}</p>
                          <p className="text-sm text-slate-400">Pro Athlete Plan</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">$199.00</p>
                          <button className="text-sm text-cyan hover:underline">Download</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
