'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, User, Target, Calendar, CheckCircle, ArrowRight, Menu, X } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'

type PanelId = 'welcome' | 'profile' | 'goals' | 'schedule' | 'confirmation'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ElementType
  step: number
}

const navItems: NavItem[] = [
  { id: 'welcome', label: 'Welcome', icon: Home, step: 1 },
  { id: 'profile', label: 'Your Info', icon: User, step: 2 },
  { id: 'goals', label: 'Training Goals', icon: Target, step: 3 },
  { id: 'schedule', label: 'Schedule', icon: Calendar, step: 4 },
  { id: 'confirmation', label: 'Get Started', icon: CheckCircle, step: 5 },
]

export default function GetStartedPage() {
  const [activePanel, setActivePanel] = useState<PanelId>('welcome')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavClick = (panelId: PanelId) => {
    setActivePanel(panelId)
    setIsMobileMenuOpen(false)
  }

  const currentStep = navItems.find(item => item.id === activePanel)?.step || 1

  return (
    <div className="min-h-screen bg-dark-300 text-white flex">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-dark-200/50 backdrop-blur-sm border-r border-secondary/10 fixed h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
            Get Started
          </h2>
          <p className="text-sm text-gray-400">Athlete Onboarding</p>
        </div>
        <nav className="flex-1 px-4 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePanel === item.id
            const isCompleted = item.step < currentStep
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? 'bg-secondary/20 text-secondary border border-secondary/30'
                    : isCompleted
                    ? 'text-accent hover:text-white hover:bg-dark-100/50'
                    : 'text-gray-400 hover:text-white hover:bg-dark-100/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive ? 'bg-secondary text-white' : isCompleted ? 'bg-accent text-white' : 'bg-dark-100 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : item.step}
                </div>
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
              const isActive = activePanel === item.id
              const isCompleted = item.step < currentStep
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all ${
                    isActive
                      ? 'bg-secondary/20 text-secondary border border-secondary/30'
                      : isCompleted
                      ? 'text-accent hover:text-white hover:bg-dark-100/50'
                      : 'text-gray-400 hover:text-white hover:bg-dark-100/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive ? 'bg-secondary text-white' : isCompleted ? 'bg-accent text-white' : 'bg-dark-100 text-gray-500'
                  }`}>
                    {isCompleted ? '✓' : item.step}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Welcome Panel */}
        {activePanel === 'welcome' && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/80 via-dark-200/80 to-dark-100/80" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                <span className="text-secondary font-semibold">Step 1 of 5</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
                Welcome to PSP.Pro
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Ready to take your baseball or softball game to the next level? Let's get you set up for success.
              </p>

              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                This quick onboarding process will help us understand your goals and get you scheduled for your first training session at our Virginia Beach facility.
              </p>

              <button
                onClick={() => setActivePanel('profile')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform text-lg mb-16"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <div className="text-3xl font-bold text-secondary mb-2">5 min</div>
                  <p className="text-gray-400 text-sm">Quick setup process</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10">
                  <div className="text-3xl font-bold text-accent mb-2">Expert</div>
                  <p className="text-gray-400 text-sm">Professional coaches</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <div className="text-3xl font-bold text-secondary mb-2">Flexible</div>
                  <p className="text-gray-400 text-sm">Schedule that fits you</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Profile Panel */}
        {activePanel === 'profile' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Step 2 of 5</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Tell Us About Yourself
                </h2>
                <p className="text-xl text-gray-300">Help us personalize your training experience</p>
              </div>

              <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-lg bg-dark-100 border border-secondary/20 text-white placeholder-gray-500 focus:border-secondary focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Age *</label>
                      <input
                        type="number"
                        placeholder="Your age"
                        className="w-full px-4 py-3 rounded-lg bg-dark-100 border border-secondary/20 text-white placeholder-gray-500 focus:border-secondary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sport *</label>
                      <select className="w-full px-4 py-3 rounded-lg bg-dark-100 border border-secondary/20 text-white focus:border-secondary focus:outline-none transition-colors">
                        <option value="">Select sport</option>
                        <option value="baseball">Baseball</option>
                        <option value="softball">Softball</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-dark-100 border border-secondary/20 text-white placeholder-gray-500 focus:border-secondary focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 rounded-lg bg-dark-100 border border-secondary/20 text-white placeholder-gray-500 focus:border-secondary focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level *</label>
                    <select className="w-full px-4 py-3 rounded-lg bg-dark-100 border border-secondary/20 text-white focus:border-secondary focus:outline-none transition-colors">
                      <option value="">Select experience level</option>
                      <option value="beginner">Beginner (New to competitive play)</option>
                      <option value="intermediate">Intermediate (Recreational/High School)</option>
                      <option value="advanced">Advanced (Travel/College)</option>
                      <option value="elite">Elite (College/Professional)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Parent/Guardian Email (if under 18)</label>
                    <input
                      type="email"
                      placeholder="parent.email@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-dark-100 border border-secondary/20 text-white placeholder-gray-500 focus:border-secondary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setActivePanel('welcome')}
                    className="flex-1 px-6 py-3 bg-dark-100 border border-secondary/20 rounded-lg font-semibold hover:bg-dark-100/50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActivePanel('goals')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform inline-flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Goals Panel */}
        {activePanel === 'goals' && (
          <section className="relative min-h-screen overflow-hidden">
            <GridPattern />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">Step 3 of 5</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  What Are Your Training Goals?
                </h2>
                <p className="text-xl text-gray-300">Select all that apply - we'll customize your program</p>
              </div>

              <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 mb-8">
                <div className="space-y-4">
                  <label className="flex items-start gap-4 p-4 rounded-lg bg-dark-100/50 border border-secondary/20 hover:border-secondary/40 cursor-pointer transition-all">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-secondary/30 bg-dark-100 text-secondary focus:ring-secondary" />
                    <div>
                      <div className="font-semibold text-white mb-1">Increase Velocity</div>
                      <div className="text-sm text-gray-400">Build throwing velocity through biomechanics and strength training</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 rounded-lg bg-dark-100/50 border border-secondary/20 hover:border-secondary/40 cursor-pointer transition-all">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-secondary/30 bg-dark-100 text-secondary focus:ring-secondary" />
                    <div>
                      <div className="font-semibold text-white mb-1">Improve Mechanics</div>
                      <div className="text-sm text-gray-400">Refine pitching or hitting mechanics for optimal performance</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 rounded-lg bg-dark-100/50 border border-secondary/20 hover:border-secondary/40 cursor-pointer transition-all">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-secondary/30 bg-dark-100 text-secondary focus:ring-secondary" />
                    <div>
                      <div className="font-semibold text-white mb-1">Develop Power</div>
                      <div className="text-sm text-gray-400">Build explosive strength for hitting and throwing</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 rounded-lg bg-dark-100/50 border border-secondary/20 hover:border-secondary/40 cursor-pointer transition-all">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-secondary/30 bg-dark-100 text-secondary focus:ring-secondary" />
                    <div>
                      <div className="font-semibold text-white mb-1">Speed & Agility</div>
                      <div className="text-sm text-gray-400">Improve athletic movement and on-field performance</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 rounded-lg bg-dark-100/50 border border-secondary/20 hover:border-secondary/40 cursor-pointer transition-all">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-secondary/30 bg-dark-100 text-secondary focus:ring-secondary" />
                    <div>
                      <div className="font-semibold text-white mb-1">Injury Prevention</div>
                      <div className="text-sm text-gray-400">Focus on mobility, flexibility, and proper recovery</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 rounded-lg bg-dark-100/50 border border-secondary/20 hover:border-secondary/40 cursor-pointer transition-all">
                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-secondary/30 bg-dark-100 text-secondary focus:ring-secondary" />
                    <div>
                      <div className="font-semibold text-white mb-1">Mental Game</div>
                      <div className="text-sm text-gray-400">Develop confidence, focus, and competitive mindset</div>
                    </div>
                  </label>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Additional Goals or Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us more about what you want to achieve..."
                    className="w-full px-4 py-3 rounded-lg bg-dark-100 border border-secondary/20 text-white placeholder-gray-500 focus:border-secondary focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setActivePanel('profile')}
                  className="flex-1 px-6 py-3 bg-dark-100 border border-secondary/20 rounded-lg font-semibold hover:bg-dark-100/50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setActivePanel('schedule')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform inline-flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Schedule Panel */}
        {activePanel === 'schedule' && (
          <section className="relative min-h-screen overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Step 4 of 5</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Choose Your Training
                </h2>
                <p className="text-xl text-gray-300">Select the program that fits your goals</p>
              </div>

              <div className="space-y-6 mb-8">
                <label className="block p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border-2 border-secondary/20 hover:border-secondary/40 cursor-pointer transition-all">
                  <div className="flex items-start gap-4">
                    <input type="radio" name="training" className="mt-1 w-5 h-5" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-bold text-xl text-white">1-on-1 Pitching Session</div>
                        <div className="text-secondary font-bold text-xl">$75</div>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">60-minute individual pitching training session</p>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li>• Velocity development</li>
                        <li>• Mechanics refinement</li>
                        <li>• Personalized training plan</li>
                      </ul>
                    </div>
                  </div>
                </label>

                <label className="block p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border-2 border-accent/20 hover:border-accent/40 cursor-pointer transition-all">
                  <div className="flex items-start gap-4">
                    <input type="radio" name="training" className="mt-1 w-5 h-5" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-bold text-xl text-white">1-on-1 Hitting Session</div>
                        <div className="text-accent font-bold text-xl">$75</div>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">60-minute individual hitting training session</p>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li>• Power development</li>
                        <li>• Swing mechanics</li>
                        <li>• Customized drill progression</li>
                      </ul>
                    </div>
                  </div>
                </label>

                <label className="block p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border-2 border-secondary/20 hover:border-secondary/40 cursor-pointer transition-all">
                  <div className="flex items-start gap-4">
                    <input type="radio" name="training" className="mt-1 w-5 h-5" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-bold text-xl text-white">Group Speed & Agility</div>
                        <div className="text-secondary font-bold text-xl">$50</div>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">90-minute small group training (max 6 athletes)</p>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li>• Speed and acceleration</li>
                        <li>• Agility and change of direction</li>
                        <li>• Explosive power development</li>
                      </ul>
                    </div>
                  </div>
                </label>
              </div>

              <div className="p-6 rounded-xl bg-dark-300/50 border border-secondary/10 mb-8 text-center">
                <p className="text-gray-300 mb-2">
                  <span className="font-bold text-secondary">Want to save?</span> Check out our multi-session packages
                </p>
                <Link href="/pricing" className="text-accent hover:text-secondary transition-colors underline text-sm">
                  View training packages →
                </Link>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setActivePanel('goals')}
                  className="flex-1 px-6 py-3 bg-dark-100 border border-secondary/20 rounded-lg font-semibold hover:bg-dark-100/50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setActivePanel('confirmation')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform inline-flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Confirmation Panel */}
        {activePanel === 'confirmation' && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <span className="text-accent font-semibold">Step 5 of 5</span>
              </div>

              <div className="mb-8">
                <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
                <h2 className="text-5xl md:text-6xl font-bold mb-6">
                  You're Almost There!
                </h2>
                <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                  Ready to start your journey with PSP.Pro? Complete your booking and let's begin building your athletic excellence.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 mb-12 max-w-2xl mx-auto text-left">
                <h3 className="text-2xl font-bold mb-6 text-center">What Happens Next?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-secondary font-bold">1</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Complete Your Booking</div>
                      <p className="text-gray-400 text-sm">Schedule your first session at a time that works for you</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent font-bold">2</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Receive Confirmation</div>
                      <p className="text-gray-400 text-sm">Get an email with your session details and facility info</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-secondary font-bold">3</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Start Training</div>
                      <p className="text-gray-400 text-sm">Meet your coach and begin your personalized training program</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform inline-flex items-center justify-center gap-2"
                >
                  Complete Booking
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setActivePanel('schedule')}
                  className="px-8 py-4 bg-dark-200/50 backdrop-blur-sm border border-secondary/20 rounded-lg font-semibold hover:border-secondary/50 transition-all"
                >
                  Go Back
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="p-4 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <div className="text-3xl mb-2">📍</div>
                  <p className="text-gray-400 text-sm">Virginia Beach Facility</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10">
                  <div className="text-3xl mb-2">💯</div>
                  <p className="text-gray-400 text-sm">Satisfaction Guaranteed</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <div className="text-3xl mb-2">📞</div>
                  <p className="text-gray-400 text-sm">We'll Call to Confirm</p>
                </div>
              </div>

              <div className="mt-12 p-6 rounded-xl bg-accent/10 border border-accent/20 max-w-2xl mx-auto">
                <p className="text-lg font-semibold text-white mb-2">Progression Over Perfection</p>
                <p className="text-gray-300 text-sm">
                  Remember: every great athlete started somewhere. We're here to guide you every step of the way.
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
