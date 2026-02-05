'use client'

import { useState } from 'react'
import { Home, Wrench, Zap, DollarSign, Mail, Menu, X } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'

type PanelId = 'hero' | 'step1' | 'shockkit' | 'step2' | 'step3' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Quick Start', icon: Home },
  { id: 'step1', label: 'Step 1: Web Logins', icon: Wrench },
  { id: 'shockkit', label: 'Shock Kit', icon: Zap },
  { id: 'step2', label: 'Step 2: Process', icon: Wrench },
  { id: 'step3', label: 'Step 3: Cost', icon: DollarSign },
  { id: 'contact', label: 'Contact', icon: Mail },
]

export default function WebsiteFixPage() {
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
            Fix Your Website
          </h2>
          <p className="text-sm text-gray-400">3-Step Repair Process</p>
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
                <span className="text-secondary font-semibold">3-Step Website Repair</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
                Fix Your Website
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Our 3-step process makes website repairs simple and transparent. We handle everything from technical fixes to design updates.
              </p>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                  <div className="text-3xl font-bold text-secondary mb-2">Step 1</div>
                  <h3 className="text-xl font-semibold mb-2">Web Logins</h3>
                  <p className="text-gray-400">Secure access to your site</p>
                </div>

                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                  <div className="text-3xl font-bold text-secondary mb-2">Step 2</div>
                  <h3 className="text-xl font-semibold mb-2">Process</h3>
                  <p className="text-gray-400">Backup and execution</p>
                </div>

                <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                  <div className="text-3xl font-bold text-secondary mb-2">Step 3</div>
                  <h3 className="text-xl font-semibold mb-2">Cost</h3>
                  <p className="text-gray-400">Starting at $300+</p>
                </div>
              </div>

              <div className="mt-12">
                <button
                  onClick={() => setActivePanel('step1')}
                  className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Get Started
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Step 1: Web Logins Panel */}
        {activePanel === 'step1' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Step 1</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Web Logins</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  We need access to your website to diagnose and fix issues. Pricing starts at $300+
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <Wrench className="w-12 h-12 text-secondary mb-4" />
                  <h3 className="text-2xl font-bold mb-4">What We Need</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span>Website admin login credentials</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span>Hosting account access (if applicable)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span>Description of issues you're experiencing</span>
                    </li>
                  </ul>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <h3 className="text-2xl font-bold mb-4">Platform Compatibility</h3>
                  <div className="space-y-3">
                    <a href="https://wordpress.org" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-dark-100/50 hover:bg-dark-100 transition-all border border-secondary/5 hover:border-secondary/20">
                      <span className="font-semibold">WordPress</span>
                    </a>
                    <a href="https://www.wix.com" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-dark-100/50 hover:bg-dark-100 transition-all border border-secondary/5 hover:border-secondary/20">
                      <span className="font-semibold">Wix</span>
                    </a>
                    <a href="https://www.squarespace.com" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-dark-100/50 hover:bg-dark-100 transition-all border border-secondary/5 hover:border-secondary/20">
                      <span className="font-semibold">Squarespace</span>
                    </a>
                    <a href="https://www.shopify.com" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-dark-100/50 hover:bg-dark-100 transition-all border border-secondary/5 hover:border-secondary/20">
                      <span className="font-semibold">Shopify</span>
                    </a>
                    <a href="https://webflow.com" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg bg-dark-100/50 hover:bg-dark-100 transition-all border border-secondary/5 hover:border-secondary/20">
                      <span className="font-semibold">Webflow</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="aspect-video rounded-xl overflow-hidden border border-secondary/20 shadow-glow-lg mb-8">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/XMIY_T0L2y8"
                  title="Website Fix Process"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              <div className="text-center">
                <a href="https://builtwith.com" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30 rounded-lg hover:scale-105 transition-transform">
                  Check Your Website Technology
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ShockKit Panel */}
        {activePanel === 'shockkit' && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <GridPattern />
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

        {/* Step 2: Process Panel */}
        {activePanel === 'step2' && (
          <section className="relative min-h-screen overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Step 2</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Process</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  We backup your site and execute repairs with precision
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <h3 className="text-2xl font-bold mb-6">Backup & Safety</h3>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1 text-xl">✓</span>
                      <span>Full website backup before any changes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1 text-xl">✓</span>
                      <span>Database backup and security checks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1 text-xl">✓</span>
                      <span>Safe rollback options if needed</span>
                    </li>
                  </ul>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <h3 className="text-2xl font-bold mb-6">Repair Execution</h3>
                  <ul className="space-y-4 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1 text-xl">✓</span>
                      <span>Fix broken links and missing images</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1 text-xl">✓</span>
                      <span>Update plugins and security patches</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1 text-xl">✓</span>
                      <span>Optimize performance and speed</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1 text-xl">✓</span>
                      <span>Mobile responsiveness fixes</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="aspect-video rounded-xl overflow-hidden border border-secondary/20 shadow-glow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/xmiy_T0l2y8"
                  title="Website Repair Process"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Cost Panel */}
        {activePanel === 'step3' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Step 3</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Cost & Payment</h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Transparent pricing starting at $300+
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-secondary/20 mb-12">
                  <div className="text-center mb-8">
                    <div className="text-6xl font-bold text-secondary mb-2">$300+</div>
                    <p className="text-xl text-gray-300">Starting Price for Website Fixes</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-dark-300/50 border border-secondary/10">
                      <h3 className="text-xl font-bold mb-3">What's Included</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-secondary">→</span>
                          <span>Complete website audit</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-secondary">→</span>
                          <span>Issue diagnosis & repair</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-secondary">→</span>
                          <span>Performance optimization</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-secondary">→</span>
                          <span>Security updates</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-6 rounded-xl bg-dark-300/50 border border-secondary/10">
                      <h3 className="text-xl font-bold mb-3">Payment Methods</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-center gap-2">
                          <span className="text-secondary">✓</span>
                          <span>Zelle</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-secondary">✓</span>
                          <span>CashApp</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-secondary">✓</span>
                          <span>Check</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-secondary">✓</span>
                          <span>Cash (USD)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-gray-500">○</span>
                          <span className="text-gray-500">Bitcoin (Coming Soon)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setActivePanel('contact')}
                    className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Get Your Website Fixed
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contact Panel */}
        {activePanel === 'contact' && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <GridPattern />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <span className="text-accent font-semibold">Get In Touch</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Ready to Fix Your Website?
              </h2>

              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Contact us today to get started with our 3-step website repair process. Pricing starts at just $300+
              </p>

              <div className="max-w-md mx-auto mb-8">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="w-full px-6 py-4 bg-dark-200/50 border border-secondary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50 mb-4"
                />
                <button className="w-full px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform">
                  Request Website Fix
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-400">
                <a href="mailto:shockmediapr@gmail.com" className="hover:text-secondary transition-colors">
                  shockmediapr@gmail.com
                </a>
                <span className="hidden sm:inline">•</span>
                <a href="tel:+1234567890" className="hover:text-secondary transition-colors">
                  (123) 456-7890
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
