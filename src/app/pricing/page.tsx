'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Zap, DollarSign, Package, Briefcase, Star, Menu, X } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'

type PanelId = 'hero' | 'shockkit' | 'monthly' | 'small' | 'large' | 'singles' | 'services'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Pricing', icon: Home },
  { id: 'shockkit', label: 'Shock Kit - $750', icon: Zap },
  { id: 'monthly', label: 'Monthly - $700', icon: Package },
  { id: 'small', label: 'Small Business - $3500', icon: Briefcase },
  { id: 'large', label: 'Large Business - $8000', icon: Star },
  { id: 'singles', label: 'Single Purchases', icon: DollarSign },
  { id: 'services', label: 'All Services', icon: Package },
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
            Select For Pricing
          </h2>
          <p className="text-sm text-gray-400">No long term contracts</p>
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
                <span className="text-secondary font-semibold">Select For Pricing</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
                Get Quick Answers
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                [ Time, Price & Tools. Email for answers today! ]
              </p>

              <a
                href="mailto:shockmediapr@gmail.com"
                className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform text-lg mb-12"
              >
                Email Now
              </a>

              {/* Special Pricing Banner */}
              <Link
                href="/pricing/specials"
                className="block max-w-3xl mx-auto mb-12 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-accent/20 to-secondary/20 border-2 border-accent/40 hover:border-accent/60 transition-all hover:scale-[1.02] sm:hover:scale-105"
              >
                <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-center sm:text-left">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">⚡ Special Event Pricing ⚡</h3>
                    <p className="text-gray-300 text-sm sm:text-base">Must present QR code or flyer to verify special pricing!</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-block px-5 sm:px-6 py-2 sm:py-3 bg-accent rounded-lg font-bold text-dark-300 text-sm sm:text-base">View Specials →</span>
                  </div>
                </div>
              </Link>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                <button
                  onClick={() => setActivePanel('shockkit')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all text-left"
                >
                  <Zap className="w-10 h-10 text-accent mb-3" />
                  <h3 className="text-xl font-bold mb-2">The Shock Kit!</h3>
                  <p className="text-gray-400 text-sm mb-3">Get Views</p>
                  <span className="text-secondary font-bold">Go Now →</span>
                </button>

                <button
                  onClick={() => setActivePanel('monthly')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all text-left"
                >
                  <Package className="w-10 h-10 text-secondary mb-3" />
                  <h3 className="text-xl font-bold mb-2">Social Media Boost</h3>
                  <p className="text-gray-400 text-sm mb-3">Get Noticed</p>
                  <span className="text-secondary font-bold">View →</span>
                </button>

                <button
                  onClick={() => setActivePanel('small')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all text-left"
                >
                  <Briefcase className="w-10 h-10 text-secondary mb-3" />
                  <h3 className="text-xl font-bold mb-2">Small Business</h3>
                  <p className="text-gray-400 text-sm mb-3">Boost Post</p>
                  <span className="text-secondary font-bold">View →</span>
                </button>

                <button
                  onClick={() => setActivePanel('singles')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all text-left"
                >
                  <DollarSign className="w-10 h-10 text-accent mb-3" />
                  <h3 className="text-xl font-bold mb-2">Single Purchases</h3>
                  <p className="text-gray-400 text-sm mb-3">No Contract</p>
                  <span className="text-secondary font-bold">View →</span>
                </button>
              </div>

              <div className="mt-16 p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">AI-Powered Services</h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div>
                    <Zap className="w-8 h-8 text-secondary mb-3" />
                    <h4 className="font-bold mb-2">AI-Accelerated Media Production</h4>
                    <p className="text-gray-400 text-sm">From 4K drone captures to rapid post-production. AI supercharges our speed and precision.</p>
                  </div>
                  <div>
                    <Zap className="w-8 h-8 text-secondary mb-3" />
                    <h4 className="font-bold mb-2">Generative Visual Systems</h4>
                    <p className="text-gray-400 text-sm">3D, motion graphics, and AI-rendered imagery designed to surprise and inspire.</p>
                  </div>
                  <div>
                    <Zap className="w-8 h-8 text-secondary mb-3" />
                    <h4 className="font-bold mb-2">Web + Digital Builds</h4>
                    <p className="text-gray-400 text-sm">Websites and interactive media created with AI-driven design systems.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Shock Kit Panel */}
        {activePanel === 'shockkit' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">⚡ The Shock Kit ⚡</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Get a quick boost to your Socials with (3) post
                </h2>
              </div>

              <div className="max-w-3xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-accent/20 mb-12">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-accent mb-2">$750</div>
                  <p className="text-xl text-gray-300">Choose any 3:</p>
                </div>

                <ul className="space-y-3 text-gray-300 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">✓</span>
                    <span>10s Viral Reels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">✓</span>
                    <span>30s Commercial</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">✓</span>
                    <span>Post / Motion Graphics</span>
                  </li>
                </ul>

                <div className="p-6 rounded-xl bg-dark-300/50 border border-accent/10 mb-6">
                  <h3 className="font-bold mb-3">How does it work? Don't worry it's simple…</h3>
                  <p className="text-gray-400 leading-relaxed">
                    First, mix and match the perfect content, then we meet at your business, we analyze & plan scenes, and finish with shooting & post edits.
                  </p>
                  <p className="text-accent font-bold mt-4">⚡ Just like that … We are done. ⚡</p>
                  <p className="text-gray-400 text-sm mt-2">(ShockAI does emergency projects also.)</p>
                </div>

                <div className="text-center">
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Get Started
                  </a>
                  <p className="text-gray-400 text-sm mt-4">We have 3 levels available. See all kits below.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Monthly Panel */}
        {activePanel === 'monthly' && (
          <section className="relative min-h-screen overflow-hidden">
            <GridPattern />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Monthly Service</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Social Media By Post
                </h2>
                <p className="text-xl text-gray-300">Grow your IG, FB, YT, by letting us handle it.</p>
              </div>

              <div className="max-w-3xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-secondary/20 mb-12">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-secondary mb-2">$700</div>
                  <p className="text-xl text-gray-300">Social Media:</p>
                </div>

                <ul className="space-y-3 text-gray-300 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Fresh Videos Monthly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>SEO'd Social Post</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Post / Motion Graphics</span>
                  </li>
                </ul>

                <div className="p-6 rounded-xl bg-dark-300/50 border border-secondary/10 mb-6">
                  <h3 className="font-bold mb-3">How does it work? Don't worry it's simple…</h3>
                  <p className="text-gray-400 leading-relaxed">
                    We analyze & plan scenes, boost plus drive interactions, edit shooting & post graphics and more.
                  </p>
                  <p className="text-secondary font-bold mt-4">⚡ We do this monthly … Fresh content and Social Media Management. ⚡</p>
                  <p className="text-gray-400 mt-2">Start getting organic growth now!</p>
                </div>

                <div className="text-center">
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Email Now
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Small Business Panel */}
        {activePanel === 'small' && (
          <section className="relative min-h-screen overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Small Business Package</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Small Business Boost
                </h2>
                <p className="text-xl text-gray-300">Grow your team by letting us handle it.</p>
              </div>

              <div className="max-w-3xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-secondary/20 mb-12">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-secondary mb-2">$3500</div>
                  <p className="text-xl text-gray-300">Social & Web Boosting: 3m</p>
                </div>

                <ul className="space-y-3 text-gray-300 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Grow 3 socials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Generate SEO leads</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-secondary text-xl">✓</span>
                    <span>Dominate the local map</span>
                  </li>
                </ul>

                <div className="p-6 rounded-xl bg-dark-300/50 border border-secondary/10 mb-6">
                  <h3 className="font-bold mb-3">How does it work? Don't worry it's simple…</h3>
                  <p className="text-gray-400 leading-relaxed">
                    First, we meet at your business, we analyze & plan scenes, and finish with shooting & post edits. We then organize your website while adding SEO and new creative content.
                  </p>
                  <p className="text-secondary font-bold mt-4">⚡ And just like that … We are done. ⚡</p>
                  <p className="text-gray-400 mt-2">( Start getting organic growth now! )</p>
                </div>

                <div className="text-center">
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Email Now
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Large Business Panel */}
        {activePanel === 'large' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">Large Business Package</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Large Business
                </h2>
                <p className="text-xl text-gray-300">Go hands off and let us build your social</p>
              </div>

              <div className="max-w-3xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-accent/20 mb-12">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-accent mb-2">$8000</div>
                  <p className="text-xl text-gray-300">Grow All Platforms: 3m</p>
                </div>

                <ul className="space-y-3 text-gray-300 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">✓</span>
                    <span>Low CPC (SEO)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">✓</span>
                    <span>Ads targeting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl">✓</span>
                    <span>Commercial videos</span>
                  </li>
                </ul>

                <div className="p-6 rounded-xl bg-dark-300/50 border border-accent/10 mb-6">
                  <h3 className="font-bold mb-3">How does it work? Don't worry it's simple…</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Everything in the small business package with the addition to more ranked pages and Google ads campaigns
                  </p>
                  <p className="text-accent font-bold mt-4">⚡ Growing takes effort… and the right keywords. ⚡</p>
                  <p className="text-gray-400 mt-2">( Start getting organic growth now! )</p>
                </div>

                <div className="text-center">
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Email Now
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Single Purchases Panel */}
        {activePanel === 'singles' && (
          <section className="relative min-h-screen overflow-hidden">
            <GridPattern />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">⚡ Shock'em Onetime ⚡</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Single Purchases</h2>
                <p className="text-xl text-gray-300 mb-2">No contract single service products for business growth</p>
                <p className="text-sm text-gray-400">⚡ Responds Within 24hrs ⚡ (emergency service available)</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <h3 className="text-2xl font-bold mb-2">Google Boost</h3>
                  <div className="text-3xl font-bold text-secondary mb-4">$1250</div>
                  <p className="text-gray-300 mb-4">Google Map Boost</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Google is the most profitable search engine that exist right now. Take advantage with our experts and optimize or create a successful Google profile.
                  </p>
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Request Pricing
                  </a>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <h3 className="text-2xl font-bold mb-2">Site Audit</h3>
                  <div className="text-3xl font-bold text-secondary mb-4">$220</div>
                  <p className="text-gray-300 mb-4">Deep Keyword Research</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Keywords can tell us everything about your site. This includes your competitors. After a SEO audit from ShockMP, you will have everything you need for growth.
                  </p>
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Request Pricing
                  </a>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <h3 className="text-2xl font-bold mb-2">High Def Photo</h3>
                  <div className="text-3xl font-bold text-secondary mb-4">$120</div>
                  <p className="text-gray-300 mb-4">One Pose Needed</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    We take as many shots as possible, so when we finally choose one, it'll be perfect. Get pro level content now.
                  </p>
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Request Pricing
                  </a>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <h3 className="text-2xl font-bold mb-2">Social Media Post</h3>
                  <div className="text-3xl font-bold text-secondary mb-4">$75</div>
                  <p className="text-gray-300 mb-4">SEO One Post</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Sometimes keyword research can be the difference in views. Today's social platforms require more than strategy and trendy targeting.
                  </p>
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Request Pricing
                  </a>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 md:col-span-2">
                  <h3 className="text-2xl font-bold mb-2">Expert Consultation</h3>
                  <div className="text-3xl font-bold text-accent mb-4">$70/hr</div>
                  <p className="text-gray-300 mb-4">Ask & We Answer</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Sometimes talking to a few experts is worth it. From simple questions, to complex guidance, knowing what to do is half the battle. First hr($70… $50/hr) after.
                  </p>
                  <a
                    href="mailto:shockmediapr@gmail.com"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
                  >
                    Request Pricing
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* All Services Panel */}
        {activePanel === 'services' && (
          <section className="relative min-h-screen overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">⚡ All Services ⚡</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Complete Service List</h2>
                <p className="text-xl text-gray-300">Services & standard explanations</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <h3 className="text-2xl font-bold mb-6 text-secondary">Website & Branding</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>SEO</strong> – Optimizes website for good rankings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>Adwords</strong> – Paid way to gain new clients</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>Logos</strong> – Designed with 3D options</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>Logo reveals</strong> – Animated logo introduction</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>Full Branding</strong> – Complete identity package</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>Tracking</strong> – Google tracking for web & social</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>Local Maps (GMBP)</strong> – Listings across all webs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>Listings</strong> – Backlink additions to directories</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>Content Revision</strong> – Website edits & updates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>Website Remake</strong> – Remodel an old website</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>Page Update</strong> – Keep pages refreshed</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-secondary mt-1">→</span>
                      <span><strong>Maintenance</strong> – Unlimited edits via monthly</span>
                    </li>
                  </ul>
                </div>

                <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10">
                  <h3 className="text-2xl font-bold mb-6 text-accent">Production & Photography</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span><strong>1(hr) Photos</strong> – Full shooting</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span><strong>30s Videos</strong> – Ad ready</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span><strong>Social Post</strong> – SEO keywords added</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span><strong>Social Maintenance</strong> – Boost content</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span><strong>Instagram</strong> – 3 post weekly max</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span><strong>Facebook</strong> – Biz only post & groups</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span><strong>Youtube</strong> – All videos hosted</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span><strong>TikTok</strong> – Personal story post</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span><strong>Commercial Photo</strong> – Website Ready Photo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span><strong>Promotional Video</strong> – Ad ready videos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent mt-1">→</span>
                      <span><strong>Content Reposting</strong> – Viral repost and edits</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 text-center">
                <a
                  href="mailto:shockmediapr@gmail.com"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Request Custom Quote
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
