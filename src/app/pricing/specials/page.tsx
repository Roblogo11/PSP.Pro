'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Globe, Video, Zap, Camera, Menu, X } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'

type PanelId = 'hero' | 'websites' | 'media' | 'shockkit'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Special Pricing', icon: Home },
  { id: 'websites', label: 'Small Websites', icon: Globe },
  { id: 'media', label: 'Photos/Videos/Drones', icon: Camera },
  { id: 'shockkit', label: 'The Shock Kit', icon: Zap },
]

export default function SpecialPricingPage() {
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
            Special Event Pricing
          </h2>
          <p className="text-sm text-gray-400">Limited time offers</p>
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
                <span className="text-accent font-semibold">Special Event Pricing</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-secondary bg-clip-text text-transparent">
                "Shock The Media & Beat The Algorithm"
              </h1>

              <div className="max-w-3xl mx-auto mb-12">
                <p className="text-xl md:text-2xl text-gray-300 mb-4">
                  Limited time special pricing on our most popular services
                </p>
                <div className="px-6 py-3 rounded-lg bg-accent/20 border border-accent/40 inline-block">
                  <p className="text-lg text-white font-semibold">
                    ⚡ Must present QR code or flyer to verify special pricing! ⚡
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                <button
                  onClick={() => setActivePanel('websites')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all text-left"
                >
                  <Globe className="w-10 h-10 text-secondary mb-3" />
                  <h3 className="text-xl font-bold mb-2">Small Websites</h3>
                  <p className="text-gray-400 text-sm mb-3">Web Help</p>
                  <span className="text-secondary font-bold">Learn More →</span>
                </button>

                <button
                  onClick={() => setActivePanel('media')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all text-left"
                >
                  <Camera className="w-10 h-10 text-accent mb-3" />
                  <h3 className="text-xl font-bold mb-2">Pictures Videos Drones</h3>
                  <p className="text-gray-400 text-sm mb-3">Get Video</p>
                  <span className="text-accent font-bold">Learn More →</span>
                </button>

                <button
                  onClick={() => setActivePanel('shockkit')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all text-left"
                >
                  <Zap className="w-10 h-10 text-secondary mb-3" />
                  <h3 className="text-xl font-bold mb-2">The Shock Kit!</h3>
                  <p className="text-gray-400 text-sm mb-3">Go Now</p>
                  <span className="text-secondary font-bold">View →</span>
                </button>
              </div>

              <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Learn the game of AI.</h3>
                <a
                  href="https://www.youtube.com/watch?v=rM2iyf9Ivz8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  <Video className="w-5 h-5" />
                  Visit our YouTube
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Small Websites Panel */}
        {activePanel === 'websites' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">⚡ Small Websites ⚡</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Professional Websites
                </h2>
                <p className="text-xl text-gray-300">Web Help at Special Pricing</p>
              </div>

              <div className="max-w-3xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-secondary/20 mb-12">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-secondary mb-2">$1400+</div>
                  <p className="text-xl text-gray-300">Starting Price</p>
                </div>

                <ul className="space-y-3 text-gray-300 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Fully completed modern website like the page you're currently on</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>5 day turnaround</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>AI-powered design systems</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Mobile responsive</span>
                  </li>
                </ul>

                <div className="p-6 rounded-xl bg-dark-300/50 border border-secondary/10 mb-6">
                  <h3 className="font-bold mb-3">What's included?</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Get a fully modern, AI-powered website built with the latest technologies. Fast turnaround time with professional design and development.
                  </p>
                  <p className="text-secondary font-bold mt-4">⚡ Professional web presence in just 5 days. ⚡</p>
                </div>

                <div className="text-center">
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Photos/Videos/Drones Panel */}
        {activePanel === 'media' && (
          <section className="relative min-h-screen overflow-hidden">
            <GridPattern />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">⚡ Media Services ⚡</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Pictures Videos Drones
                </h2>
                <p className="text-xl text-gray-300">Professional Visual Content</p>
              </div>

              <div className="max-w-3xl mx-auto space-y-6 mb-12">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-accent/20">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Business Headshots</h3>
                    <div className="text-4xl font-bold text-accent mb-4">$40/person</div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Professional business headshots for your team. High-quality, studio-grade results.
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-secondary/20">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Business Photos</h3>
                    <div className="text-4xl font-bold text-secondary mb-4">$100/hr</div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Professional photography for your business. Capture your products, team, and workspace.
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-accent/20">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Green Screen Photos</h3>
                    <div className="text-4xl font-bold text-accent mb-4">$120/hr</div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Perfect for digital creators. Professional green screen setup for versatile content creation.
                  </p>
                </div>

                <div className="p-8 rounded-xl bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30">
                  <h3 className="text-2xl font-bold mb-3">Video & Drone Services</h3>
                  <p className="text-gray-300 mb-4">
                    For video production and drone services, please contact us directly for custom pricing.
                  </p>
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Shock Kit Panel */}
        {activePanel === 'shockkit' && (
          <section className="relative min-h-screen overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">⚡ The Shock Kit ⚡</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Boost Your Business
                </h2>
                <p className="text-xl text-gray-300">Complete business enhancement package</p>
              </div>

              <div className="max-w-3xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-secondary/20 mb-12">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-secondary mb-2">$500+</div>
                  <p className="text-xl text-gray-300">Starting Price</p>
                </div>

                <ul className="space-y-3 text-gray-300 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Fix and restore your Google or Apple maps profile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>New business setup (pictures, videos, drones)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Boost your maps profile to show higher in rank</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Complete local SEO optimization</span>
                  </li>
                </ul>

                <div className="p-6 rounded-xl bg-dark-300/50 border border-secondary/10 mb-6">
                  <h3 className="font-bold mb-3">What is The Shock Kit?</h3>
                  <p className="text-gray-400 leading-relaxed">
                    A comprehensive package to boost your local business presence. We optimize your maps profiles, create professional content, and help you rank higher in local search results.
                  </p>
                  <p className="text-secondary font-bold mt-4">⚡ Dominate your local market. ⚡</p>
                </div>

                <div className="text-center">
                  <Link
                    href="/shock-kit"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Learn More About Shock Kit
                  </Link>
                </div>
              </div>

              <div className="text-center p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 max-w-3xl mx-auto">
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
      </main>
    </div>
  )
}
