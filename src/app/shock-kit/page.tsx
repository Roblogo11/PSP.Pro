'use client'

import { useState } from 'react'
import { Home, Zap, Package, Star, Mail, Menu, X } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import { FunnelBridge } from '@/components/navigation/funnel-bridge'
import { ShockBoxGated } from '@/components/web3'

type PanelId = 'hero' | 'quick' | 'standard' | 'pro' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Quick Start', icon: Home },
  { id: 'quick', label: 'Quick - $950', icon: Zap },
  { id: 'standard', label: 'Standard - $1,250', icon: Package },
  { id: 'pro', label: 'Pro - $2,500', icon: Star },
  { id: 'contact', label: 'Get In Touch', icon: Mail },
]

export default function ShockKitPage() {
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
            Shock Kit Bundles
          </h2>
          <p className="text-sm text-gray-400">Your Brand. Your Story.</p>
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
                <span className="text-accent font-semibold">⚡ Shock Kit Bundles ⚡</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-secondary bg-clip-text text-transparent">
                Your Brand. Your Story.
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                4K cameras, drones, motion graphics, 3d-visuals, web-art, YouTube, and more…
              </p>

              <div className="inline-block mb-12 px-6 py-3 bg-dark-200/50 backdrop-blur-sm border border-secondary/20 rounded-full">
                <span className="text-gray-300">🚫 Long Term Contracts</span>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
                <button
                  onClick={() => setActivePanel('quick')}
                  className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group"
                >
                  <Zap className="w-12 h-12 text-secondary mb-4 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold mb-2">Shock Kit Quick</h3>
                  <div className="text-4xl font-bold text-secondary mb-3">$950</div>
                  <p className="text-gray-400 mb-4">3 Post Creations</p>
                  <span className="text-secondary font-semibold">View Details →</span>
                </button>

                <button
                  onClick={() => setActivePanel('standard')}
                  className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all group"
                >
                  <Package className="w-12 h-12 text-accent mb-4 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold mb-2">Shock Kit Standard</h3>
                  <div className="text-4xl font-bold text-accent mb-3">$1,250</div>
                  <p className="text-gray-400 mb-4">6 Post Creations</p>
                  <span className="text-accent font-semibold">View Details →</span>
                </button>

                <button
                  onClick={() => setActivePanel('pro')}
                  className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group"
                >
                  <Star className="w-12 h-12 text-secondary mb-4 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold mb-2">Shock Kit Pro</h3>
                  <div className="text-4xl font-bold text-secondary mb-3">$2,500</div>
                  <p className="text-gray-400 mb-4">9-12 Post Creations</p>
                  <span className="text-secondary font-semibold">View Details →</span>
                </button>
              </div>

              <a
                href="mailto:shockmediapr@gmail.com"
                className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform text-lg mb-12"
              >
                Send Email
              </a>

              {/* VIP Vault Access */}
              <div className="mt-8 pt-8 border-t border-secondary/20">
                <ShockBoxGated />
              </div>
            </div>
          </section>
        )}

        {/* Quick Panel */}
        {activePanel === 'quick' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Quick Package</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Shock Kit Quick</h2>
                <p className="text-xl text-gray-300">3 Post Creations</p>
              </div>

              <div className="max-w-3xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-secondary/20 mb-12">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-secondary mb-4">$950</div>
                </div>

                <h3 className="text-xl font-bold mb-4 text-center">Choose Your Content:</h3>
                <ul className="space-y-3 text-gray-300 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>10s Trend Reel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>30s Commercial</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Brand Story Reel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Mixed Motion Graphics</span>
                  </li>
                </ul>

                <div className="p-6 rounded-xl bg-dark-300/50 border border-secondary/10 mb-6">
                  <h3 className="font-bold mb-3">How does it work? Don't worry. it's simple.</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Mix and match your content, we meet at your business, plan and shoot your scenes, and handle all the post edits.
                  </p>
                  <p className="text-secondary font-bold mt-4">⚡ Just like that … We are done. ⚡</p>
                  <p className="text-gray-400 text-sm mt-2">(ShockAI offers 24 hour turnaround for this service)</p>
                </div>

                <div className="text-center">
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Email Here
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Standard Panel */}
        {activePanel === 'standard' && (
          <section className="relative min-h-screen overflow-hidden">
            <GridPattern />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">Standard Package</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Shock Kit Standard</h2>
                <p className="text-xl text-gray-300">6 Post Creations</p>
              </div>

              <div className="max-w-3xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-accent/20 mb-12">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-accent mb-4">$1,250</div>
                </div>

                <h3 className="text-xl font-bold mb-4 text-center">Includes:</h3>
                <ul className="space-y-3 text-gray-300 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">✓</span>
                    <span>10s Trend Reel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">✓</span>
                    <span>30s Commercial</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">✓</span>
                    <span>Brand Story Reel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">✓</span>
                    <span>Mixed Motion Graphics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">✓</span>
                    <span>Drone Footage Add-on</span>
                  </li>
                </ul>

                <div className="p-6 rounded-xl bg-dark-300/50 border border-accent/10 mb-6">
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Ready to elevate your look? Level 2 gives you the power of cinematic storytelling.
                  </p>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Includes creative direction, location setup, and up to 6 optimized post.
                  </p>
                  <p className="text-accent font-bold">⚡ We'll do the work. Just press post ⚡</p>
                </div>

                <div className="text-center">
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Pro Panel */}
        {activePanel === 'pro' && (
          <section className="relative min-h-screen overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Pro Package</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Shock Kit Pro</h2>
                <p className="text-xl text-gray-300">9-12 Post Creations</p>
              </div>

              <div className="max-w-3xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-secondary/20 mb-12">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-secondary mb-4">$2,500</div>
                </div>

                <h3 className="text-xl font-bold mb-4 text-center">Premium Features:</h3>
                <ul className="space-y-3 text-gray-300 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>10s Trend Reel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>30s Commercial</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Brand Story Reel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Mixed Motion Graphics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Drone Footage Add-on</span>
                  </li>
                </ul>

                <div className="p-6 rounded-xl bg-dark-300/50 border border-secondary/10 mb-6">
                  <p className="text-gray-300 leading-relaxed mb-4">
                    The ultimate creative package. Cinematic, branded, and unforgettable.
                  </p>
                  <p className="text-secondary font-bold mb-4">⚡ Includes full post-production + social optimization. ⚡</p>
                  <p className="text-gray-400 leading-relaxed">
                    Designed for maximum impact across all channels.
                  </p>
                </div>

                <div className="text-center">
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Consultation
                  </a>
                </div>
              </div>
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
                Ready to Get The Shock Kit?
              </h2>

              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Choose your package and let's start creating content that shocks the algorithm and grows your brand.
              </p>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <Zap className="w-10 h-10 text-secondary mb-3 mx-auto" />
                  <h3 className="text-lg font-semibold mb-2">Quick</h3>
                  <p className="text-gray-400 text-sm mb-2">3 Posts</p>
                  <div className="text-2xl font-bold text-secondary">$950</div>
                </div>

                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10">
                  <Package className="w-10 h-10 text-accent mb-3 mx-auto" />
                  <h3 className="text-lg font-semibold mb-2">Standard</h3>
                  <p className="text-gray-400 text-sm mb-2">6 Posts</p>
                  <div className="text-2xl font-bold text-accent">$1,250</div>
                </div>

                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <Star className="w-10 h-10 text-secondary mb-3 mx-auto" />
                  <h3 className="text-lg font-semibold mb-2">Pro</h3>
                  <p className="text-gray-400 text-sm mb-2">9-12 Posts</p>
                  <div className="text-2xl font-bold text-secondary">$2,500</div>
                </div>
              </div>

              <div className="max-w-md mx-auto mb-8">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="w-full px-6 py-4 bg-dark-200/50 border border-secondary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50 mb-4"
                />
                <textarea
                  placeholder="Which package are you interested in?"
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
                <span>24 Hour Turnaround Available</span>
              </div>

              {/* VIP Vault Access */}
              <div className="mt-12 pt-8 border-t border-secondary/20">
                <ShockBoxGated />
              </div>
            </div>
          </section>
        )}

        {/* Narrative Bridge: Shock Kit to Website Help */}
        <div className="border-t border-secondary/10">
          <FunnelBridge variant="shockkit-to-website" />
        </div>

        {/* Funnel Navigation */}
        <FunnelNav />
      </main>
    </div>
  )
}
