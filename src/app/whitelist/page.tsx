'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Users, TrendingUp, Briefcase, Package, Mail, Menu, X } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'

type PanelId = 'hero' | 'benefits' | 'services' | 'shockkit' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Quick Start', icon: Home },
  { id: 'benefits', label: 'Partner Benefits', icon: TrendingUp },
  { id: 'services', label: 'Services Overview', icon: Briefcase },
  { id: 'shockkit', label: 'Shock Kit', icon: Package },
  { id: 'contact', label: 'Get Started', icon: Mail },
]

export default function WhitelistPage() {
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
            🎉 Whitelist Creatives
          </h2>
          <p className="text-sm text-gray-400">Partner with us</p>
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
              <div className="inline-block mb-6 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <span className="text-accent font-semibold">🎉 Whitelist Creatives 🎉</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-secondary bg-clip-text text-transparent">
                Your Agency, Our Team
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                "Partnering with businesses & agencies to build a greater network"
              </p>

              <div className="max-w-md mx-auto mb-12">
                <input
                  type="email"
                  placeholder="Email Address Here..."
                  className="w-full px-6 py-4 bg-dark-200/50 border border-secondary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50 mb-4"
                />
                <button className="w-full px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform mb-2">
                  Join Our Market Alerts
                </button>
                <p className="text-gray-400 text-sm">Sign-up for AI blogs & tips.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <button
                  onClick={() => setActivePanel('contact')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all text-center"
                >
                  <Users className="w-10 h-10 text-secondary mb-3 mx-auto" />
                  <h3 className="text-lg font-semibold mb-2">Special Event pricing</h3>
                  <p className="text-gray-400 text-sm mb-3">Get Info</p>
                  <span className="text-secondary font-semibold hover:underline">Learn More →</span>
                </button>

                <button
                  onClick={() => setActivePanel('services')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all text-center"
                >
                  <Briefcase className="w-10 h-10 text-accent mb-3 mx-auto" />
                  <h3 className="text-lg font-semibold mb-2">Web Help</h3>
                  <p className="text-gray-400 text-sm mb-3">Add Our Team</p>
                  <span className="text-accent font-semibold hover:underline">View Services →</span>
                </button>

                <button
                  onClick={() => setActivePanel('benefits')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all text-center"
                >
                  <TrendingUp className="w-10 h-10 text-secondary mb-3 mx-auto" />
                  <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                  <p className="text-gray-400 text-sm mb-3">Fast With The Best Tech</p>
                  <span className="text-secondary font-semibold hover:underline">See Benefits →</span>
                </button>
              </div>

              <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">AI-Powered Services</h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <Link href="/media-production" className="hover:opacity-80 transition-opacity">
                    <h4 className="font-bold mb-2">⚡ AI-Accelerated Media Production</h4>
                    <p className="text-gray-400 text-sm">From 4K drone captures to rapid post-production. AI supercharges our speed and precision.</p>
                  </Link>
                  <Link href="/motion-graphics" className="hover:opacity-80 transition-opacity">
                    <h4 className="font-bold mb-2">⚡ Generative Visual Systems</h4>
                    <p className="text-gray-400 text-sm">3D, motion graphics, and AI-rendered imagery designed to surprise and inspire.</p>
                  </Link>
                  <Link href="/website-help" className="hover:opacity-80 transition-opacity">
                    <h4 className="font-bold mb-2">⚡ Web + Digital Builds</h4>
                    <p className="text-gray-400 text-sm">Websites and interactive media created with AI-driven design systems.</p>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Benefits Panel */}
        {activePanel === 'benefits' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">Partnership</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Work With Us</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  🎉 Whitelist Creatives — Your Agency, Our Team
                </p>
              </div>

              <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-accent/20 mb-12">
                <p className="text-gray-300 leading-relaxed mb-6">
                  ⚡ Partner with ShockAI to extend your capabilities. We collaborate with businesses and marketing agencies across Norfolk, Chesapeake, and Virginia Beach, delivering high-impact digital content that drives engagement and conversions.
                </p>
                <p className="text-gray-400 mb-6">
                  Not an advertising agency? <a href="#contact" className="text-accent hover:underline">Click here ⚡</a>
                </p>
                <div className="text-center">
                  <a
                    href="https://instagram.com/shockai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30 rounded-lg hover:scale-105 transition-transform"
                  >
                    Follow on IG for updates (click here)
                  </a>
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4">Partner Benefits / Capabilities</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <Link href="/shock-kit" className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold mb-3">Social Media & Brand Growth</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Boost local reach and visibility with AI-powered social media strategies. Stop your audience from scrolling with content that stands out.
                  </p>
                </Link>

                <Link href="/get-started" className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold mb-3">AI-Enhanced Creative Production</h3>
                  <p className="text-gray-400 leading-relaxed">
                    We combine human creativity with AI workflows for faster turnaround and higher engagement. Ideal for video, photography, and web campaigns.
                  </p>
                </Link>

                <Link href="/whitelist" className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold mb-3">Extend Your Team</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Work alongside our team to deliver high-quality digital content. Perfect for agencies that need extra bandwidth without hiring full-time.
                  </p>
                </Link>
              </div>

              <div className="text-center p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                <h3 className="text-2xl font-bold mb-4">Let's Get Started?</h3>
                <p className="text-xl text-gray-300 mb-6">⚡ Shock the media and beat the algorithm</p>
                <p className="text-gray-400 mb-6">Send us an email and don't forget to mention the discount!</p>
                <a
                  href="mailto:shockmediapr@gmail.com"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Send Email
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
                  <span className="text-secondary font-semibold">Services Overview</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Growth Impact</h2>
                <p className="text-xl text-gray-300">🎯 How We Drive Growth for Partners</p>
              </div>

              <div className="max-w-4xl mx-auto space-y-6 mb-12">
                <Link href="/photography" className="block p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                  <h3 className="text-2xl font-bold mb-3 text-secondary">Business Photography & Graphics</h3>
                  <p className="text-gray-400">Professional visual content that captures your brand's essence and drives engagement.</p>
                </Link>

                <Link href="/get-started" className="block p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all">
                  <h3 className="text-2xl font-bold mb-3 text-accent">Business Videography & AI-Enhanced Media</h3>
                  <p className="text-gray-400">High-quality video production accelerated with AI for faster turnaround and better results.</p>
                </Link>

                <Link href="/website-help" className="block p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                  <h3 className="text-2xl font-bold mb-3 text-secondary">Website Design & Optimization</h3>
                  <p className="text-gray-400">Modern, AI-powered websites that convert visitors into customers.</p>
                </Link>

                <Link href="/media-production" className="block p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all">
                  <h3 className="text-2xl font-bold mb-3 text-accent">Business Podcasting & Interviews</h3>
                  <p className="text-gray-400">Professional podcast production and interview services to amplify your brand's voice.</p>
                </Link>

                <Link href="/pricing" className="block p-8 rounded-xl bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30 hover:border-secondary/50 transition-all">
                  <h3 className="text-2xl font-bold mb-3">No contracts — flexible, pay-per-service model</h3>
                  <p className="text-gray-300 mb-4">⚡ Book Time for Partnership → shockmediapr@gmail.com</p>
                  <span className="inline-block text-accent hover:underline">
                    View Pricing →
                  </span>
                </Link>
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
                The shock kit comes in 3 prices with no long term contracts. ⚡
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
                <span className="text-accent font-semibold">Partner With Us</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Ready to Partner?
              </h2>

              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Join our whitelist and extend your agency's capabilities with our AI-powered creative team.
              </p>

              <div className="max-w-md mx-auto mb-8">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="w-full px-6 py-4 bg-dark-200/50 border border-secondary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50 mb-4"
                />
                <textarea
                  placeholder="Tell us about your agency..."
                  rows={4}
                  className="w-full px-6 py-4 bg-dark-200/50 border border-secondary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50 mb-4"
                />
                <a
                  href="mailto:shockmediapr@gmail.com"
                  className="block w-full px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Get In Touch
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
      </main>
    </div>
  )
}
