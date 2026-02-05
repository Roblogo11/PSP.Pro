'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Info, Briefcase, Users, Mail, Menu, X } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'

type PanelId = 'hero' | 'story' | 'what-we-do' | 'team' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Quick Start', icon: Home },
  { id: 'story', label: 'Our Story', icon: Info },
  { id: 'what-we-do', label: 'What We Do', icon: Briefcase },
  { id: 'team', label: 'Meet The Team', icon: Users },
  { id: 'contact', label: 'Get Started', icon: Mail },
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
            About Us
          </h2>
          <p className="text-sm text-gray-400">Shock Media Production</p>
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
                <span className="text-secondary font-semibold">About Shock Media Production</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
                Shock the Media and Beat the Algorithm
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                The creative force combining multiple expert craftsmen into one powerhouse — Shock Media Production.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a
                  href="https://www.youtube.com/watch?v=rM2iyf9Ivz8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Check Out Our YouTube
                </a>
                <button
                  onClick={() => setActivePanel('story')}
                  className="px-8 py-4 bg-dark-200/50 backdrop-blur-sm border border-secondary/20 rounded-lg font-semibold hover:border-secondary/50 transition-all"
                >
                  Learn Our Story
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <button
                  onClick={() => setActivePanel('story')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group"
                >
                  <Info className="w-10 h-10 text-secondary mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Our Story</h3>
                  <p className="text-gray-400 text-sm">How we got started</p>
                </button>

                <button
                  onClick={() => setActivePanel('what-we-do')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all group"
                >
                  <Briefcase className="w-10 h-10 text-accent mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">What We Do</h3>
                  <p className="text-gray-400 text-sm">Our services</p>
                </button>

                <button
                  onClick={() => setActivePanel('team')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group"
                >
                  <Users className="w-10 h-10 text-secondary mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Meet The Team</h3>
                  <p className="text-gray-400 text-sm">Our creators</p>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Story Panel */}
        {activePanel === 'story' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Our Story</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  How Shock Media Production Got Started
                </h2>
              </div>

              <div className="space-y-8">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <p className="text-xl text-gray-300 leading-relaxed mb-6">
                    Multiple craftsmen combining their expert skills into one company — that's ShockMP. It's the creative force that brings us together and fuels everything we make.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                    <h3 className="text-2xl font-bold mb-3 text-secondary">Expert Craftsmen</h3>
                    <p className="text-gray-300 leading-relaxed">
                      We bring together the best talent in video production, photography, web development, and AI innovation.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all">
                    <h3 className="text-2xl font-bold mb-3 text-accent">Creative Force</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Our passion for pushing creative boundaries drives us to deliver exceptional results for every project.
                    </p>
                  </div>
                </div>

                <div className="text-center mt-12">
                  <button
                    onClick={() => setActivePanel('what-we-do')}
                    className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Learn What We Do
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* What We Do Panel */}
        {activePanel === 'what-we-do' && (
          <section className="relative min-h-screen overflow-hidden">
            <GridPattern />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">What We Do</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Your Creative Extension
                </h2>
              </div>

              <div className="space-y-8">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10">
                  <p className="text-xl text-gray-300 leading-relaxed mb-6">
                    We work as an extension to agencies, helping them deliver stunning visuals and creative assets when they need them most.
                  </p>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    Your advertising firm might not have a camera guy or a web artist immediately available — we do!
                  </p>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <h3 className="text-2xl font-bold mb-4 text-secondary">Keep the Creativity Flowing</h3>
                  <p className="text-lg text-gray-300 leading-relaxed mb-4">
                    Pay per project — no need for full-time hires when you need specialized creative talent.
                  </p>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">→</span>
                      <span>Video Production & Cinematics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">→</span>
                      <span>Professional Photography & Drone Services</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">→</span>
                      <span>Web Development & Design</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary text-xl">→</span>
                      <span>AI-Powered Creative Solutions</span>
                    </li>
                  </ul>
                </div>

                <div className="text-center mt-12">
                  <button
                    onClick={() => setActivePanel('team')}
                    className="px-8 py-4 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Meet Our Team
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Team Panel */}
        {activePanel === 'team' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Our Team</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Learn more about ShockAI© CEO's
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Robbie */}
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">
                      YouTuber <span className="text-secondary">@RobbieCreates</span>
                    </h3>
                  </div>
                  <div className="space-y-4 text-gray-300">
                    <p className="leading-relaxed">
                      Robbie is a multi-passionate creator who fell off the deep-end of AI.
                    </p>
                    <p className="leading-relaxed">
                      Loving every moment of the AI evolution, he now delivers us the research. Exploring every worthy avenue of AI business enhancements. R&D beast!
                    </p>
                    <Link
                      href="/about/ceo-robbie-creates"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                    >
                      Robbie's Bio
                    </Link>
                  </div>
                </div>

                {/* PMBAI */}
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">
                      YouTuber <span className="text-accent">@PMBAI</span>
                    </h3>
                  </div>
                  <div className="space-y-4 text-gray-300">
                    <p className="leading-relaxed">
                      Addicted to movie cinematics, this creator found a way to bridge AI and cinema.
                    </p>
                    <p className="leading-relaxed">
                      This untapped avenue is the largest growing media force on the planet.
                    </p>
                    <Link
                      href="/about/ceo-pmbai"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
                    >
                      PMBAI's Bio
                    </Link>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setActivePanel('contact')}
                  className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Get Started with Us
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Contact Panel */}
        {activePanel === 'contact' && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <span className="text-accent font-semibold">Get Started</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Ready to Work Together?
              </h2>

              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Let's create something amazing. Reach out to us and let's discuss your next project.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Contact Us
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 bg-dark-200/50 backdrop-blur-sm border border-secondary/20 rounded-lg font-semibold hover:border-secondary/50 transition-all"
                >
                  View Pricing
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="p-4 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <div className="text-3xl font-bold text-secondary mb-2">Fast</div>
                  <p className="text-gray-400 text-sm">Quick turnaround times</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10">
                  <div className="text-3xl font-bold text-accent mb-2">Expert</div>
                  <p className="text-gray-400 text-sm">Professional quality</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <div className="text-3xl font-bold text-secondary mb-2">Flexible</div>
                  <p className="text-gray-400 text-sm">Pay per project</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <FunnelNav />
      </main>
    </div>
  )
}
