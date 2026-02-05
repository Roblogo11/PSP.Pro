'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Target, Users, MapPin, Award, TrendingUp, Menu, X } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'

type PanelId = 'hero' | 'mission' | 'approach' | 'location' | 'values'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Welcome', icon: Home },
  { id: 'mission', label: 'Our Mission', icon: Target },
  { id: 'approach', label: 'Our Approach', icon: TrendingUp },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'values', label: 'Our Values', icon: Award },
]

export default function AboutPage() {
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
            About PSP.Pro
          </h2>
          <p className="text-sm text-gray-400">Proper Sports Performance</p>
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
                <span className="text-secondary font-semibold">About PSP.Pro</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
                Proper Sports Performance
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
                Virginia Beach's premier baseball and softball training facility focused on velocity development and mechanics improvement.
              </p>

              <p className="text-2xl md:text-3xl font-bold text-accent mb-12">
                Progression Over Perfection
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => setActivePanel('mission')}
                  className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Learn More
                </button>
                <Link
                  href="/get-started"
                  className="px-8 py-4 bg-dark-200/50 backdrop-blur-sm border border-secondary/20 rounded-lg font-semibold hover:border-secondary/50 transition-all text-center"
                >
                  Get Started
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <button
                  onClick={() => setActivePanel('mission')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group"
                >
                  <Target className="w-10 h-10 text-secondary mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Our Mission</h3>
                  <p className="text-gray-400 text-sm">Elevating athlete performance</p>
                </button>

                <button
                  onClick={() => setActivePanel('approach')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all group"
                >
                  <TrendingUp className="w-10 h-10 text-accent mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Our Approach</h3>
                  <p className="text-gray-400 text-sm">Science-based training</p>
                </button>

                <button
                  onClick={() => setActivePanel('location')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group"
                >
                  <MapPin className="w-10 h-10 text-secondary mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Location</h3>
                  <p className="text-gray-400 text-sm">Virginia Beach area</p>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Mission Panel */}
        {activePanel === 'mission' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Our Mission</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Developing Elite Athletes
                </h2>
              </div>

              <div className="space-y-8">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <p className="text-xl text-gray-300 leading-relaxed mb-6">
                    At PSP.Pro, we believe in <span className="text-secondary font-bold">Progression Over Perfection</span>. Our mission is to develop elite baseball and softball athletes through science-based training methodologies that focus on continuous improvement.
                  </p>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    We specialize in velocity development, mechanics refinement, and overall athletic performance enhancement for athletes of all levels.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                    <h3 className="text-2xl font-bold mb-3 text-secondary">Baseball Training</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Specialized pitching and hitting programs designed to maximize velocity, power, and consistency.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all">
                    <h3 className="text-2xl font-bold mb-3 text-accent">Softball Excellence</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Comprehensive softball training focusing on mechanics, speed development, and game performance.
                    </p>
                  </div>
                </div>

                <div className="text-center mt-12">
                  <button
                    onClick={() => setActivePanel('approach')}
                    className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    See Our Approach
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Approach Panel */}
        {activePanel === 'approach' && (
          <section className="relative min-h-screen overflow-hidden">
            <GridPattern />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">Our Approach</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Science-Based Athletic Development
                </h2>
              </div>

              <div className="space-y-8">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10">
                  <p className="text-xl text-gray-300 leading-relaxed mb-6">
                    We combine cutting-edge technology with proven training methodologies to deliver measurable results.
                  </p>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <h3 className="text-2xl font-bold mb-4 text-secondary">Training Specialties</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">→</span>
                      <span><strong>Velocity Development</strong> – Increase throwing velocity through biomechanics and strength training</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">→</span>
                      <span><strong>Mechanics Analysis</strong> – Video breakdown and corrective exercises for optimal movement patterns</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">→</span>
                      <span><strong>Power Development</strong> – Build explosive strength for hitting and throwing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">→</span>
                      <span><strong>Speed & Agility</strong> – Improve athletic movement and on-field performance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">→</span>
                      <span><strong>Recovery & Mobility</strong> – Prevent injury and optimize recovery for peak performance</span>
                    </li>
                  </ul>
                </div>

                <div className="text-center mt-12">
                  <button
                    onClick={() => setActivePanel('location')}
                    className="px-8 py-4 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Visit Our Facility
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Location Panel */}
        {activePanel === 'location' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Location</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Serving Virginia Beach & Hampton Roads
                </h2>
              </div>

              <div className="space-y-8">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <div className="flex items-start gap-4 mb-6">
                    <MapPin className="w-8 h-8 text-secondary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-white">Virginia Beach Training Facility</h3>
                      <p className="text-lg text-gray-300 leading-relaxed mb-4">
                        Located in the heart of Virginia Beach, our state-of-the-art facility serves athletes throughout the Hampton Roads region.
                      </p>
                      <p className="text-gray-400">
                        Serving Virginia Beach, Chesapeake, Norfolk, and surrounding areas
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                    <h3 className="text-xl font-bold mb-3 text-secondary">World-Class Facility</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Modern training equipment, video analysis systems, and dedicated space for athlete development.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all">
                    <h3 className="text-xl font-bold mb-3 text-accent">Expert Coaching</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Experienced coaches dedicated to helping athletes reach their full potential.
                    </p>
                  </div>
                </div>

                <div className="text-center mt-12">
                  <button
                    onClick={() => setActivePanel('values')}
                    className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Learn Our Values
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Values Panel */}
        {activePanel === 'values' && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <span className="text-accent font-semibold">Our Values</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                What We Stand For
              </h2>

              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Our core values guide everything we do at PSP.Pro
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <Award className="w-12 h-12 text-secondary mb-4 mx-auto" />
                  <h3 className="text-2xl font-bold mb-3">Excellence</h3>
                  <p className="text-gray-400">Striving for the highest standards in every training session</p>
                </div>

                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10">
                  <TrendingUp className="w-12 h-12 text-accent mb-4 mx-auto" />
                  <h3 className="text-2xl font-bold mb-3">Progress</h3>
                  <p className="text-gray-400">Celebrating continuous improvement over perfection</p>
                </div>

                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <Users className="w-12 h-12 text-secondary mb-4 mx-auto" />
                  <h3 className="text-2xl font-bold mb-3">Community</h3>
                  <p className="text-gray-400">Building a supportive environment for athlete growth</p>
                </div>

                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10">
                  <Target className="w-12 h-12 text-accent mb-4 mx-auto" />
                  <h3 className="text-2xl font-bold mb-3">Results</h3>
                  <p className="text-gray-400">Delivering measurable outcomes through proven methods</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/pricing"
                  className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  View Training Programs
                </Link>
                <Link
                  href="/get-started"
                  className="px-8 py-4 bg-dark-200/50 backdrop-blur-sm border border-secondary/20 rounded-lg font-semibold hover:border-secondary/50 transition-all"
                >
                  Start Training Today
                </Link>
              </div>
            </div>
          </section>
        )}

        <FunnelNav />
      </main>
    </div>
  )
}
