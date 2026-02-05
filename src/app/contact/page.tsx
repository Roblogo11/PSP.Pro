'use client'

import { useState } from 'react'
import { Home, Mail, Users, Briefcase, Zap, Menu, X } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import Image from 'next/image'

type PanelId = 'hero' | 'about' | 'services' | 'shockkit' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Quick Start', icon: Home },
  { id: 'about', label: 'Our Story', icon: Users },
  { id: 'services', label: 'What We Do', icon: Briefcase },
  { id: 'shockkit', label: 'Shock Kit', icon: Zap },
  { id: 'contact', label: 'Get In Touch', icon: Mail },
]

export default function ContactPage() {
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
            Contact Us
          </h2>
          <p className="text-sm text-gray-400">Let's work together</p>
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

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                <span className="text-secondary font-semibold">Get In Touch</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
                Contact Us
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                The best way to reach us is email.
              </p>

              <a
                href="mailto:shockmediapr@gmail.com"
                className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform text-lg"
              >
                Email Us Today
              </a>

              <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <Mail className="w-10 h-10 text-secondary mb-3 mx-auto" />
                  <h3 className="text-lg font-semibold mb-2">Email</h3>
                  <p className="text-gray-400 text-sm">shockmediapr@gmail.com</p>
                </div>

                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <Users className="w-10 h-10 text-secondary mb-3 mx-auto" />
                  <h3 className="text-lg font-semibold mb-2">Our Story</h3>
                  <p className="text-gray-400 text-sm">Multiple expert craftsmen</p>
                </div>

                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <Briefcase className="w-10 h-10 text-secondary mb-3 mx-auto" />
                  <h3 className="text-lg font-semibold mb-2">Services</h3>
                  <p className="text-gray-400 text-sm">Full creative extension</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* About Panel */}
        {activePanel === 'about' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Our Story</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  How Shock Media Production Got Started
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Multiple craftsmen combining their expert skills into one company — that's ShockMP. It's the creative force that brings us together and fuels everything we make.
                </p>
              </div>

              <div className="aspect-video rounded-xl overflow-hidden border border-secondary/20 shadow-glow-lg max-w-4xl mx-auto mb-12">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/rM2iyf9Ivz8?si=E5SZ3PBaDbmvs5ET"
                  title="How Shock Media Production Got Started"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              <div className="text-center">
                <a
                  href="https://youtube.com/@shockai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30 rounded-lg hover:scale-105 transition-transform"
                >
                  See YouTube
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Services Panel */}
        {activePanel === 'services' && (
          <section className="relative min-h-screen overflow-hidden">
            <GridPattern />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Services</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">What We Do</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <Briefcase className="w-12 h-12 text-secondary mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Extension to Agencies</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    We work as an extension to agencies, helping them deliver stunning visuals and creative assets when they need them most.
                  </p>
                  <p className="text-gray-400 leading-relaxed">
                    Your advertising firm might not have a camera guy or a web artist immediately available — we do!
                  </p>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <h3 className="text-2xl font-bold mb-4">Our Services</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span>Video Production & Cinematography</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span>Web Development & Design</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span>Photography & Drone Services</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span>Social Media Content Creation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">✓</span>
                      <span>AI-Powered Creative Solutions</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <a
                  href="https://instagram.com/shockai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30 rounded-lg hover:scale-105 transition-transform"
                >
                  View Instagram
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ShockKit Panel */}
        {activePanel === 'shockkit' && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <span className="text-accent font-semibold">Best Seller</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-secondary bg-clip-text text-transparent">
                The Shock Kit
              </h2>

              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Social interactive media created with AI-driven design systems. We create. You post.
              </p>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/20">
                  <div className="text-4xl font-bold text-accent mb-2">124%</div>
                  <p className="text-gray-300">Boosted Impressions</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/20">
                  <div className="text-4xl font-bold text-accent mb-2">20%</div>
                  <p className="text-gray-300">Boosted Views</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/20">
                  <div className="text-4xl font-bold text-accent mb-2">300+</div>
                  <p className="text-gray-300">Content Pieces</p>
                </div>
              </div>

              <a
                href="/shock-kit"
                className="inline-block px-8 py-4 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                Learn More About The Shock Kit
              </a>
            </div>
          </section>
        )}

        {/* Contact Panel */}
        {activePanel === 'contact' && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <span className="text-accent font-semibold">Get Started</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Ready to Work Together?
              </h2>

              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Email is the best way to reach us. Tell us about your project and we'll get back to you within 24 hours.
              </p>

              <div className="max-w-md mx-auto mb-8">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="w-full px-6 py-4 bg-dark-200/50 border border-secondary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50 mb-4"
                />
                <textarea
                  placeholder="Tell us about your project..."
                  rows={4}
                  className="w-full px-6 py-4 bg-dark-200/50 border border-secondary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50 mb-4"
                />
                <a
                  href="mailto:shockmediapr@gmail.com"
                  className="block w-full px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Send Email
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-400">
                <a href="mailto:shockmediapr@gmail.com" className="hover:text-secondary transition-colors">
                  shockmediapr@gmail.com
                </a>
                <span className="hidden sm:inline">•</span>
                <a href="https://instagram.com/shockai" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                  @shockai
                </a>
              </div>
            </div>
          </section>
        )}

        <FunnelNav />
      </main>
    </div>
  )
}
