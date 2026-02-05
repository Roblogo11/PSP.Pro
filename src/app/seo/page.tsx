'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Globe,
  Search,
  Zap,
  DollarSign,
  Mail,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import Image from 'next/image'

type PanelId = 'hero' | 'step1' | 'step2' | 'step3' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'How SEO Works', icon: Globe },
  { id: 'step1', label: 'Step 1 Audit', icon: Search },
  { id: 'step2', label: 'Step 2 Process', icon: Zap },
  { id: 'step3', label: 'Step 3 Cost', icon: DollarSign },
  { id: 'contact', label: 'Contact', icon: Mail },
]

export default function SEOPage() {
  const [activePanel, setActivePanel] = useState<PanelId>('hero')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Listen for panel navigation events
  useEffect(() => {
    const handleNavigate = (e: CustomEvent<PanelId>) => {
      setActivePanel(e.detail)
    }
    window.addEventListener('navigate-panel' as any, handleNavigate)
    return () => window.removeEventListener('navigate-panel' as any, handleNavigate)
  }, [])

  return (
    <main className="min-h-screen bg-primary flex">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-gradient-to-br from-secondary to-accent border border-white/10 text-white hover:scale-105 transition-transform"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-gradient-to-b from-secondary via-accent to-secondary border-r border-white/10 transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-2">
          <a href="/" className="block mb-6 hover:opacity-80 transition-opacity">
            <h2 className="text-2xl font-bold text-white">
              Shock⚡ <span className="text-sm block text-gray-200">AI</span>
            </h2>
          </a>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePanel === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePanel(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-secondary border border-white/30 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {activePanel === 'hero' && <HeroPanel setActivePanel={setActivePanel} />}
        {activePanel === 'step1' && <Step1Panel />}
        {activePanel === 'step2' && <Step2Panel />}
        {activePanel === 'step3' && <Step3Panel />}
        {activePanel === 'contact' && <ContactPanel />}

        <FunnelNav />
      </div>
    </main>
  )
}

function HeroPanel({ setActivePanel }: { setActivePanel: (panel: PanelId) => void }) {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {/* Content */}
            <div className="space-y-6">
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-home overflow-hidden backdrop-blur-sm border border-white/10">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <Search className="w-8 h-8 text-cyan" />
                    <span className="font-bold text-white">SEO Services</span>
                  </div>

                  <h1 className="text-5xl lg:text-6xl font-bold text-white">
                    How SEO Works
                  </h1>

                  <p className="text-xl text-gray-200">
                    Get SEO & AEO – Search engine optimization is responsible for your website's online presence. Measured in authority and keywords, the right strategy brings the right traffic. See the video or click Step 1 🚀
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a href="#step1">
                      <Button size="lg" className="text-lg px-8 py-6">
                        Book Time
                      </Button>
                    </a>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6"
                      onClick={() => setActivePanel('step1')}
                    >
                      <Sparkles className="mr-2 w-5 h-5" />
                      View Process
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 hover:border-secondary/40 transition-all">
                  <h3 className="text-xl font-bold text-cyan mb-3">SEO Best Practices</h3>
                  <ul className="text-gray-400 text-sm space-y-2">
                    <li>• Conduct Comprehensive Keyword Research</li>
                    <li>• Publish High-Quality, Relevant Content</li>
                    <li>• Optimize On-Page Elements</li>
                    <li>• Enhance User Experience (UX)</li>
                    <li>• Build Quality Backlinks</li>
                  </ul>
                </div>
                <StatCard
                  title="Brand New Website?"
                  description="⚡ Add Brain Power + A New Design"
                  link="/website-redesign"
                  linkText="Click here"
                />
                <StatCard
                  title="Web Fix & Updates"
                  description="⚡ Get A Smooth Running Website"
                  link="/website-fix"
                  linkText="Learn More"
                />
              </div>

              <p className="text-center text-gray-400 text-sm">
                Serving Norfolk • Chesapeake • Virginia Beach — local-first, globally capable.
              </p>
            </div>

            {/* Media */}
            <div className="relative rounded-xl overflow-hidden border-2 border-cyan/30 bg-dark-100 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/Vc3B7I46LFU"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step1Panel() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {/* Content */}
            <div className="space-y-6">
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-services overflow-hidden backdrop-blur-sm border border-white/10">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Search className="w-8 h-8 text-indigo" />
                    <span className="font-bold text-white">Step 1</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    SEO Audit
                  </h1>

                  <p className="text-lg text-gray-200">
                    🎉 1 Full Web Audit ⚡ Getting leads on Google and other top search engines takes heavy keyword research. Services starting at $2500. All SEO services come with a full audit and competitor spy report.
                  </p>
                </div>
              </div>

              {/* Service Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 hover:border-indigo/40 transition-all">
                  <h3 className="text-xl font-bold text-white mb-3">💻 What's my website built with?</h3>
                  <ul className="text-gray-400 text-sm space-y-2 mb-4">
                    <li>• Website Updates</li>
                    <li>• Run Audits</li>
                    <li>• Scale Changes</li>
                  </ul>
                  <a href="https://builtwith.com/" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-gradient-to-r from-indigo-500 via-pink-500 to-teal-500">
                      builtwith.com
                    </Button>
                  </a>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10">
                  <h3 className="text-xl font-bold text-cyan mb-2">AI-driven SEO</h3>
                  <p className="text-gray-400 text-sm">ShockMP SEO is powered by AI data from Semrush.</p>
                </div>
              </div>

              <p className="text-center text-gray-400 text-sm">
                Need emergency SEO or competitor spy? Call now!
              </p>
            </div>

            {/* Video Embed */}
            <div className="relative rounded-xl overflow-hidden border-2 border-indigo/30 bg-dark-100 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/jYhyeR2_u18"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step2Panel() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {/* Content */}
            <div className="space-y-6">
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-home overflow-hidden backdrop-blur-sm border border-white/10">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-accent" />
                    <span className="font-bold text-white">Step 2</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    The Process
                  </h1>

                  <p className="text-lg text-gray-200">
                    🎉 2 Steps And Your Online⚡ It's a simple process but your website needs a backup first. All previous clients get free backup assistance. If platform restrictions prevent backup, hosting access is required.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <h3 className="text-2xl font-bold text-cyan mb-2">Files</h3>
                  <p className="text-gray-400 text-sm">Back-up Website • Log Changes</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <h3 className="text-2xl font-bold text-cyan mb-2">Time</h3>
                  <p className="text-gray-400 text-sm">Discuss Timeframe • Down Payment • Execution</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <h3 className="text-2xl font-bold text-cyan mb-2">Finalize</h3>
                  <p className="text-gray-400 text-sm">Verify Changes • Back-up New Site</p>
                </div>
              </div>

              <p className="text-center text-gray-400 text-sm">
                All changes tracked for your peace of mind.
              </p>
            </div>

            {/* Video Embed */}
            <div className="relative rounded-xl overflow-hidden border-2 border-secondary/30 bg-dark-100 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/whmzRhApr4w"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step3Panel() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {/* Content */}
            <div className="space-y-6">
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-services overflow-hidden backdrop-blur-sm border border-white/10">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-indigo" />
                    <span className="font-bold text-white">Step 3</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    The Cost
                  </h1>

                  <p className="text-lg text-gray-200">
                    🎉 More than 3 ways to pay ⚡ Initial down payment secures SEO services. Remaining balance collected after completion. Payment can be split into 3.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10">
                  <h3 className="text-2xl font-bold text-cyan mb-2">Payment Gateways</h3>
                  <p className="text-gray-400 text-sm">Paypal • Zelle • Cashapp • USD Cash • Bitcoin</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10">
                  <h3 className="text-2xl font-bold text-cyan mb-2">Other</h3>
                  <p className="text-gray-400 text-sm">We do not accept checks.</p>
                </div>
              </div>

              <p className="text-center text-gray-400 text-sm">
                Flexible, secure payment options.
              </p>
            </div>

            {/* Media */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-indigo/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/03/get-seo-sm.gif"
                alt="Cost"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactPanel() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {/* Content */}
            <div className="space-y-6">
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-contact overflow-hidden backdrop-blur-sm border border-white/10">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-8 h-8 text-accent" />
                    <span className="font-bold text-white">Contact</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    Get Started
                  </h1>

                  <p className="text-lg text-gray-200">
                    Interested in SEO or AEO? Book a consultation or emergency service. Let's get your website ranking.
                  </p>

                  <a href="mailto:shockmediapr@gmail.com">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Email Us
                    </Button>
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <div className="text-2xl font-bold text-cyan mb-2">Local</div>
                  <div className="text-gray-400 text-sm">Norfolk • Chesapeake • Virginia Beach</div>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <div className="text-2xl font-bold text-cyan mb-2">Fast</div>
                  <div className="text-gray-400 text-sm">Response within 48 hours</div>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <div className="text-2xl font-bold text-cyan mb-2">Custom</div>
                  <div className="text-gray-400 text-sm">SEO & AEO Services</div>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-accent/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/02/Shocking-teaser.gif"
                alt="Contact"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility Components
function StatCard({ title, description, link, linkText }: { title: string; description: string; link: string; linkText: string }) {
  return (
    <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 hover:border-secondary/40 transition-all">
      <h3 className="text-xl font-bold text-cyan mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <a href={link}>
        <Button size="sm" className="bg-gradient-to-r from-indigo-500 via-pink-500 to-teal-500">
          {linkText}
        </Button>
      </a>
    </div>
  )
}
