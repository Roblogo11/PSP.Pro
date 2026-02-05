'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Zap, Users, Video, Activity, Package, Menu, X } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'

type PanelId = 'hero' | 'individual' | 'group' | 'packages' | 'specialty'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Training Programs', icon: Home },
  { id: 'individual', label: '1-on-1 Training', icon: Zap },
  { id: 'group', label: 'Group Training', icon: Users },
  { id: 'packages', label: 'Training Packages', icon: Package },
  { id: 'specialty', label: 'Specialty Services', icon: Video },
]

export default function PricingPage() {
  const [activePanel, setActivePanel] = useState<PanelId>('hero')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavClick = (panelId: PanelId) => {
    setActivePanel(panelId)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-dark-300 text-white flex">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-dark-200/50 backdrop-blur-sm border-r border-secondary/10 fixed h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
            Training Programs
          </h2>
          <p className="text-sm text-gray-400">Pricing & Packages</p>
        </div>
        <nav className="flex-1 px-4 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  activePanel === item.id
                    ? 'bg-secondary/20 text-secondary border border-secondary/30'
                    : 'text-gray-400 hover:text-white hover:bg-dark-100/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-dark-200/90 backdrop-blur-sm rounded-lg border border-secondary/20"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-dark-300/95 backdrop-blur-md">
          <nav className="flex flex-col gap-2 p-6 mt-20">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all ${
                    activePanel === item.id
                      ? 'bg-secondary/20 text-secondary border border-secondary/30'
                      : 'text-gray-400 hover:text-white hover:bg-dark-100/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Hero Panel */}
        {activePanel === 'hero' && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/80 via-dark-200/80 to-dark-100/80" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                <span className="text-secondary font-semibold">PSP.Pro Training</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
                Elite Training Programs
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Baseball & softball training programs designed to elevate your game through velocity development, mechanics refinement, and athletic performance.
              </p>

              <Link
                href="/get-started"
                className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform text-lg mb-16"
              >
                Book Your Session
              </Link>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <button
                  onClick={() => setActivePanel('individual')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all text-left"
                >
                  <Zap className="w-10 h-10 text-secondary mb-3" />
                  <h3 className="text-xl font-bold mb-2">1-on-1 Sessions</h3>
                  <p className="text-gray-400 text-sm mb-3">Personalized Training</p>
                  <span className="text-secondary font-bold">View Programs →</span>
                </button>

                <button
                  onClick={() => setActivePanel('group')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all text-left"
                >
                  <Users className="w-10 h-10 text-accent mb-3" />
                  <h3 className="text-xl font-bold mb-2">Group Training</h3>
                  <p className="text-gray-400 text-sm mb-3">Small Group Sessions</p>
                  <span className="text-accent font-bold">View Programs →</span>
                </button>

                <button
                  onClick={() => setActivePanel('packages')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all text-left"
                >
                  <Package className="w-10 h-10 text-secondary mb-3" />
                  <h3 className="text-xl font-bold mb-2">Training Packages</h3>
                  <p className="text-gray-400 text-sm mb-3">Save with Bundles</p>
                  <span className="text-secondary font-bold">View Packages →</span>
                </button>

                <button
                  onClick={() => setActivePanel('specialty')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all text-left"
                >
                  <Video className="w-10 h-10 text-accent mb-3" />
                  <h3 className="text-xl font-bold mb-2">Specialty Services</h3>
                  <p className="text-gray-400 text-sm mb-3">Video & Recovery</p>
                  <span className="text-accent font-bold">View Services →</span>
                </button>
              </div>

              <div className="mt-16 p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Why Choose PSP.Pro?</h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div>
                    <Activity className="w-8 h-8 text-secondary mb-3" />
                    <h4 className="font-bold mb-2">Science-Based Training</h4>
                    <p className="text-gray-400 text-sm">Evidence-based methodologies for measurable results</p>
                  </div>
                  <div>
                    <Zap className="w-8 h-8 text-accent mb-3" />
                    <h4 className="font-bold mb-2">Expert Coaching</h4>
                    <p className="text-gray-400 text-sm">Experienced trainers dedicated to your success</p>
                  </div>
                  <div>
                    <Video className="w-8 h-8 text-secondary mb-3" />
                    <h4 className="font-bold mb-2">Modern Technology</h4>
                    <p className="text-gray-400 text-sm">Video analysis and performance tracking systems</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Individual Training Panel */}
        {activePanel === 'individual' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">1-on-1 Training</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Personalized Individual Sessions
                </h2>
                <p className="text-xl text-gray-300">Focused attention on your specific development goals</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-secondary/20">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">1-on-1 Pitching Session</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-5xl font-bold text-secondary">$75</span>
                      <span className="text-gray-400">/ 60 minutes</span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-gray-300 mb-8">
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">✓</span>
                      <span>Velocity development techniques</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">✓</span>
                      <span>Pitching mechanics refinement</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">✓</span>
                      <span>Command and control work</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">✓</span>
                      <span>Personalized training plan</span>
                    </li>
                  </ul>

                  <Link
                    href="/get-started"
                    className="block text-center px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Book Pitching Session
                  </Link>
                </div>

                <div className="p-8 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-accent/20">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">1-on-1 Hitting Session</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-5xl font-bold text-accent">$75</span>
                      <span className="text-gray-400">/ 60 minutes</span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-gray-300 mb-8">
                    <li className="flex items-start gap-3">
                      <span className="text-accent text-xl">✓</span>
                      <span>Power development training</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent text-xl">✓</span>
                      <span>Swing mechanics optimization</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent text-xl">✓</span>
                      <span>Plate discipline and approach</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent text-xl">✓</span>
                      <span>Customized drill progression</span>
                    </li>
                  </ul>

                  <Link
                    href="/get-started"
                    className="block text-center px-8 py-4 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Book Hitting Session
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-dark-300/50 border border-secondary/10 text-center">
                <p className="text-gray-300 mb-4">
                  <span className="font-bold text-secondary">New athletes:</span> First session includes comprehensive assessment and personalized training plan development
                </p>
                <p className="text-gray-400 text-sm">
                  Save with our multi-session packages – see Training Packages for details
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Group Training Panel */}
        {activePanel === 'group' && (
          <section className="relative min-h-screen overflow-hidden">
            <GridPattern />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">Group Training</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Small Group Sessions
                </h2>
                <p className="text-xl text-gray-300">Train with peers in a competitive, supportive environment</p>
              </div>

              <div className="max-w-3xl mx-auto mb-12">
                <div className="p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-accent/20">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold mb-3">Group Speed & Agility</h3>
                    <div className="flex items-baseline gap-2 justify-center mb-2">
                      <span className="text-6xl font-bold text-accent">$50</span>
                      <span className="text-gray-400">/ athlete</span>
                    </div>
                    <p className="text-gray-400">90-minute sessions • Max 6 athletes</p>
                  </div>

                  <ul className="space-y-3 text-gray-300 mb-8">
                    <li className="flex items-start gap-3">
                      <span className="text-accent text-xl">✓</span>
                      <span>Speed and acceleration training</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent text-xl">✓</span>
                      <span>Agility and change of direction</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent text-xl">✓</span>
                      <span>Explosive power development</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent text-xl">✓</span>
                      <span>Sport-specific movement patterns</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent text-xl">✓</span>
                      <span>Competitive training environment</span>
                    </li>
                  </ul>

                  <div className="p-6 rounded-xl bg-dark-300/50 border border-accent/10 mb-8">
                    <h4 className="font-bold mb-3 text-center">Perfect For:</h4>
                    <p className="text-gray-400 leading-relaxed text-center">
                      Athletes looking to improve overall athleticism, speed, and explosiveness in a group setting. Ideal for off-season training and supplementing position-specific work.
                    </p>
                  </div>

                  <Link
                    href="/get-started"
                    className="block text-center px-8 py-4 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Book Group Training
                  </Link>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Limited spots available • First come, first served • Contact us for team training options
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Training Packages Panel */}
        {activePanel === 'packages' && (
          <section className="relative min-h-screen overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Training Packages</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Save with Multi-Session Packages
                </h2>
                <p className="text-xl text-gray-300">Commit to your development and save on training sessions</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">5-Session Pack</h3>
                    <div className="mb-4">
                      <div className="text-4xl font-bold text-secondary mb-1">$350</div>
                      <div className="text-sm text-gray-400 line-through">$375 value</div>
                      <div className="text-accent font-semibold">Save $25</div>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-300 mb-6 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">✓</span>
                      <span>5 individual sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">✓</span>
                      <span>90-day expiration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">✓</span>
                      <span>Progress tracking</span>
                    </li>
                  </ul>
                  <Link
                    href="/get-started"
                    className="block text-center px-6 py-3 bg-secondary/20 border border-secondary/30 rounded-lg font-semibold hover:bg-secondary/30 transition-all"
                  >
                    Purchase Pack
                  </Link>
                </div>

                <div className="p-8 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 border-2 border-secondary/50 relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-secondary to-accent rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">10-Session Pack</h3>
                    <div className="mb-4">
                      <div className="text-5xl font-bold text-secondary mb-1">$675</div>
                      <div className="text-sm text-gray-400 line-through">$750 value</div>
                      <div className="text-accent font-semibold">Save $75</div>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-300 mb-6 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">✓</span>
                      <span>10 individual sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">✓</span>
                      <span>120-day expiration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">✓</span>
                      <span>Progress tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>Free video analysis</span>
                    </li>
                  </ul>
                  <Link
                    href="/get-started"
                    className="block text-center px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Purchase Pack
                  </Link>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">20-Session Pack</h3>
                    <div className="mb-4">
                      <div className="text-4xl font-bold text-accent mb-1">$1,300</div>
                      <div className="text-sm text-gray-400 line-through">$1,500 value</div>
                      <div className="text-accent font-semibold">Save $200</div>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-300 mb-6 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>20 individual sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>180-day expiration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>Progress tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>Monthly video analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>Priority scheduling</span>
                    </li>
                  </ul>
                  <Link
                    href="/get-started"
                    className="block text-center px-6 py-3 bg-accent/20 border border-accent/30 rounded-lg font-semibold hover:bg-accent/30 transition-all"
                  >
                    Purchase Pack
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-dark-300/50 border border-secondary/10 text-center max-w-3xl mx-auto">
                <p className="text-gray-300">
                  <span className="font-bold text-secondary">Package Benefits:</span> Mix and match pitching and hitting sessions • Transfer to family members • Pause for injuries • Satisfaction guaranteed
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Specialty Services Panel */}
        {activePanel === 'specialty' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">Specialty Services</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Specialized Performance Services
                </h2>
                <p className="text-xl text-gray-300">Enhance your training with video analysis and recovery sessions</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <Video className="w-12 h-12 text-secondary mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Video Analysis Session</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-secondary">$50</span>
                    <span className="text-gray-400">/ 30 minutes</span>
                  </div>
                  <p className="text-gray-300 mb-6">
                    In-depth video breakdown of your pitching or hitting mechanics with actionable feedback and drill recommendations.
                  </p>
                  <ul className="space-y-2 text-gray-300 mb-6 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">✓</span>
                      <span>Frame-by-frame analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">✓</span>
                      <span>Side-by-side comparisons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">✓</span>
                      <span>Detailed written report</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary">✓</span>
                      <span>Corrective drill plan</span>
                    </li>
                  </ul>
                  <Link
                    href="/get-started"
                    className="block text-center px-6 py-3 bg-secondary/20 border border-secondary/30 rounded-lg font-semibold hover:bg-secondary/30 transition-all"
                  >
                    Book Analysis
                  </Link>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10">
                  <Activity className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Recovery & Mobility</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-accent">$45</span>
                    <span className="text-gray-400">/ 45 minutes</span>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Guided recovery session focused on mobility, flexibility, and injury prevention for optimal performance.
                  </p>
                  <ul className="space-y-2 text-gray-300 mb-6 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>Dynamic stretching protocols</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>Mobility assessments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>Foam rolling techniques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">✓</span>
                      <span>Personalized recovery plan</span>
                    </li>
                  </ul>
                  <Link
                    href="/get-started"
                    className="block text-center px-6 py-3 bg-accent/20 border border-accent/30 rounded-lg font-semibold hover:bg-accent/30 transition-all"
                  >
                    Book Recovery
                  </Link>
                </div>
              </div>

              <div className="p-8 rounded-xl bg-dark-300/50 border border-secondary/10 text-center">
                <h3 className="text-2xl font-bold mb-4">Add-On Services</h3>
                <p className="text-gray-300 mb-4">
                  Enhance any training session with video analysis (+$25) or extended mobility work (+$20)
                </p>
                <p className="text-gray-400 text-sm">
                  Recovery sessions recommended 1-2x per week for optimal performance and injury prevention
                </p>
              </div>
            </div>
          </section>
        )}

        <FunnelNav />
      </main>
    </div>
  )
}
