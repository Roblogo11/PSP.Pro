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
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import type { GalleryItem } from '@/lib/gallery'

type PanelId = 'hero' | 'step1' | 'step2' | 'step3' | 'examples' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Get A New Website', icon: Globe },
  { id: 'step1', label: 'Step 1 Research', icon: Search },
  { id: 'step2', label: 'Step 2 Process', icon: Zap },
  { id: 'step3', label: 'Step 3 Cost', icon: DollarSign },
  { id: 'examples', label: 'Our Work', icon: Sparkles },
  { id: 'contact', label: 'Contact', icon: Mail },
]

export default function WebsiteRedesignPage() {
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

  // Check for hash on mount and navigate to gallery
  useEffect(() => {
    if (window.location.hash === '#view-gallery') {
      setActivePanel('examples')
    }
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
        {activePanel === 'examples' && <ExamplesPanel />}
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
                    <Globe className="w-8 h-8 text-cyan" />
                    <span className="font-bold text-white">Website Redesign</span>
                  </div>

                  <h1 className="text-5xl lg:text-6xl font-bold text-white">
                    Get A New Website
                  </h1>

                  <p className="text-xl text-gray-200">
                    A modern site in 3 steps — Websites can look and feel as good as we can create them. With a boost from AI, we can get you a website tailored to your industry. You can also take advantage of our creativity with a custom design. Watch our video or click Step 1 to get going: 🚀
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
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10">
                  <h3 className="text-xl font-bold text-cyan mb-3">Website Management</h3>
                  <div className="text-gray-400 text-sm space-y-1">
                    <div>• PHP (8.2 – 8.6)</div>
                    <div>• SSL – HTTPS</div>
                    <div>• Hosting & DNS</div>
                    <div>• Database</div>
                    <div>• Plug-ins</div>
                  </div>
                </div>
                <StatCard
                  title="Need Website SEO?"
                  link="/seo"
                  linkText="Click here"
                />
                <StatCard
                  title="Website Help"
                  description="⚡ Fast fixes & updates"
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
                src="https://www.youtube.com/embed/9urxP3Gc95A"
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
                    The Research
                  </h1>

                  <p className="text-lg text-gray-200">
                    🎉 The 1st Website ⚡ We search Google for the best possible comparison to the look and feel you're after. Custom or quick, the research can help set your website apart. (Services starting at $2000…) All Web services come with a full audit and competitor report. If you need emergency website help, please call now!
                  </p>

                  <a href="#step2">
                    <Button size="lg" className="bg-gradient-to-r from-indigo-500 via-pink-500 to-teal-500 text-lg px-8 py-6">
                      Book Time
                    </Button>
                  </a>
                </div>
              </div>

              {/* Service Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <h3 className="text-xl font-bold text-cyan mb-2">Built With Strategy</h3>
                  <p className="text-gray-400 text-sm">ShockMP uses AI-driven data to guide your website's direction.</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <h3 className="text-xl font-bold text-cyan mb-2">SEO Included</h3>
                  <p className="text-gray-400 text-sm">We simplify SEO by adding it naturally to your new website. Every site should have rank potential.</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <h3 className="text-xl font-bold text-cyan mb-2">💻 What's the best platform?</h3>
                  <p className="text-gray-400 text-sm">We'll guide you toward the right choice based on goals, speed, and long-term scalability.</p>
                </div>
              </div>
            </div>

            {/* Video Embed */}
            <div className="relative rounded-xl overflow-hidden border-2 border-indigo/30 bg-dark-100 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/rXE5j-PgcQU"
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
                    🎉 2nd Step Is Building ⚡ We keep it simple with the web building and handover. This requires you to own your domain (DNS).
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <h3 className="text-2xl font-bold text-cyan mb-2">Prep</h3>
                  <p className="text-gray-400 text-sm">Back-Up Existing Website • Plan & Scope</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <h3 className="text-2xl font-bold text-cyan mb-2">Build</h3>
                  <p className="text-gray-400 text-sm">Set Up WordPress & Divi • Customize Design • Content Integration</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <h3 className="text-2xl font-bold text-cyan mb-2">Finish</h3>
                  <p className="text-gray-400 text-sm">Optimize Performance • Review & Revisions • Final Backup & Launch</p>
                </div>
              </div>

              <p className="text-center text-gray-400 text-sm">
                All previous clients get free backup assistance. If platform restrictions prevent backup, hosting access is required (one extra document to sign).
              </p>
            </div>

            {/* Video Embed */}
            <div className="relative rounded-xl overflow-hidden border-2 border-secondary/30 bg-dark-100 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/Pjd7V02A66k"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
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
                    🎉 More Than 3 Ways To Pay ⚡ All done! Once you've verified your new website, we collect the remainder of your payment (minus the deposit).
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
                  <p className="text-gray-400 text-sm">(We do not accept check)</p>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-indigo/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/03/web-redesign-sm.gif"
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

function ExamplesPanel() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch(`/api/gallery?type=website-redesign${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`)
        const data = await response.json()
        setGalleryItems(data.items || [])
        if (selectedCategory === 'all') {
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Failed to load gallery:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [selectedCategory])

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-home overflow-hidden backdrop-blur-sm border border-white/10">
            <div className="absolute inset-0 bg-dark-400/40" />
            <div className="relative z-10 space-y-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-secondary" />
                <span className="font-bold text-white">Website Redesign Gallery</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Our Work
              </h1>

              <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                Browse our portfolio of website redesigns. Before & after transformations, case studies, and more.
              </p>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === 'all'
                        ? 'bg-white text-dark-400'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
                        selectedCategory === cat
                          ? 'bg-white text-dark-400'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {cat.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading gallery...</p>
            </div>
          ) : (
            <GalleryGrid items={galleryItems} columns={3} />
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title={`${galleryItems.length} Projects`} link="#" linkText="" />
            <StatCard title={`${categories.length} Categories`} link="#" linkText="" />
            <StatCard title="AI-Enhanced" description="Professional Quality" link="#" linkText="" />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
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
                    Need a website, redesign, or emergency support? Book a consultation—we're here to help you build the right way.
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
                  <div className="text-gray-400 text-sm">Responses within 48 hours</div>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 text-center">
                  <div className="text-2xl font-bold text-cyan mb-2">Custom</div>
                  <div className="text-gray-400 text-sm">Full Website & SEO Solutions</div>
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
function StatCard({ title, description, link, linkText }: { title: string; description?: string; link: string; linkText: string }) {
  return (
    <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 hover:border-secondary/40 transition-all">
      <h3 className="text-xl font-bold text-cyan mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-4">{description}</p>}
      <a href={link}>
        <Button size="sm" className="bg-gradient-to-r from-indigo-500 via-pink-500 to-teal-500">
          {linkText}
        </Button>
      </a>
    </div>
  )
}
