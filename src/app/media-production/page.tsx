'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Home,
  Video,
  Zap,
  Sparkles,
  Mail,
  Menu,
  X,
  Mic,
  Camera,
  Film,
} from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import Image from 'next/image'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import type { GalleryItem } from '@/lib/gallery'

type PanelId = 'hero' | 'services' | 'shockkit' | 'examples' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Quick Start', icon: Home },
  { id: 'services', label: 'Media Services', icon: Video },
  { id: 'shockkit', label: 'Shock⚡Kit', icon: Zap },
  { id: 'examples', label: 'Our Work', icon: Sparkles },
  { id: 'contact', label: 'Contact', icon: Mail },
]

export default function MediaProductionPage() {
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
    } else {
      const hash = window.location.hash.replace('#', '') as PanelId
      if (hash && ['hero', 'services', 'shockkit', 'examples', 'contact'].includes(hash)) {
        setActivePanel(hash)
      }
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
          <a
            href="mailto:shockmediapr@gmail.com"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-dark-400 font-bold hover:scale-105 transition-transform mt-4"
          >
            <span>🔔</span>
            <span>Join Alerts</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {activePanel === 'hero' && <HeroPanel setActivePanel={setActivePanel} />}
        {activePanel === 'services' && <ServicesPanel />}
        {activePanel === 'shockkit' && <ShockKitPanel />}
        {activePanel === 'examples' && <ExamplesPanel />}
        {activePanel === 'contact' && <ContactPanel />}
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
                    <Film className="w-8 h-8 text-cyan" />
                    <span className="font-bold text-white">Media Production</span>
                  </div>

                  <h1 className="text-5xl lg:text-6xl font-bold text-white">
                    AI-Powered Media Production
                  </h1>

                  <p className="text-xl text-gray-200">
                    Podcasting, Interviews & Video Content — From 4K drone captures to rapid post-production. AI supercharges our speed and precision. 🎬
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:shockmediapr@gmail.com">
                      <Button size="lg" className="text-lg px-8 py-6">
                        Start Production
                      </Button>
                    </a>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6"
                      onClick={() => setActivePanel('examples')}
                    >
                      <Sparkles className="mr-2 w-5 h-5" />
                      View Our Work
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard number="4K Quality" label="Drone & Cinema Cameras" />
                <StatCard number="AI Enhanced" label="Rapid Post-Production" />
                <StatCard number="Multi-Platform" label="Optimized Delivery" />
              </div>

              <p className="text-center text-gray-400 text-sm">
                Serving Norfolk • Chesapeake • Virginia Beach — podcast studios & on-location production.
              </p>
            </div>

            {/* Media */}
            <div className="relative rounded-xl overflow-hidden border-2 border-accent/30 bg-dark-100 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/GbX4nsRnTwU"
                title="Media Production Showcase"
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

function ServicesPanel() {
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
                    <Video className="w-8 h-8 text-accent" />
                    <span className="font-bold text-white">Media Services</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    Professional Media That Converts
                  </h1>

                  <p className="text-lg text-gray-200">
                    We produce podcasts, interviews, promotional videos, and social content that amplifies your brand's voice.
                    Our AI-accelerated workflows deliver broadcast-quality results with rapid turnaround times.
                  </p>
                </div>
              </div>

              {/* Service Cards */}
              <div className="grid grid-cols-1 gap-4">
                <ServiceBox
                  icon={Mic}
                  title="Business Podcasting"
                  description="Full podcast production — recording, editing, mixing, and distribution. Studio sessions or on-location interviews with professional audio quality."
                  link="mailto:shockmediapr@gmail.com"
                  buttonText="Book Studio"
                />
                <ServiceBox
                  icon={Camera}
                  title="Interview & Documentary"
                  description="⚡ Professional interviews and documentary-style content with multi-camera setups, lighting, and cinematic post-production."
                  link="mailto:shockmediapr@gmail.com"
                  buttonText="Get Quote"
                />
                <ServiceBox
                  icon={Film}
                  title="Promotional Video & Drones"
                  description="⚡ 4K drone cinematography, brand videos, testimonials, and social media content optimized for every platform."
                  link="mailto:shockmediapr@gmail.com"
                  buttonText="View Options"
                />
              </div>

              <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">What's Included:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">✓</span>
                    <span>Pre-production planning & scripting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">✓</span>
                    <span>Professional recording & cinematography</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">✓</span>
                    <span>AI-enhanced editing & color grading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">✓</span>
                    <span>Multi-platform optimization & delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">✓</span>
                    <span>Social media cut-downs & graphics</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Media */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-accent/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/02/D-law-1.gif"
                alt="Media Production Services"
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

function ShockKitPanel() {
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
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-shockkit overflow-hidden backdrop-blur-sm border border-white/10">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-accent" />
                    <span className="font-bold text-white">The Shock Kit</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    Repurpose Media For Growth
                  </h1>

                  <p className="text-lg text-gray-200">
                    Turn your podcast episodes and video content into dozens of optimized social posts.
                    We extract clips, add captions, create audiograms, and deliver ready-to-post assets that maximize your content's reach.
                  </p>

                  <a href="/shock-kit/">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Get The Kit
                    </Button>
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <StatCard number="10x+" label="Content Multiplier" />
                <StatCard number="Auto" label="Captions & Graphics" />
                <StatCard number="Daily" label="Scheduling Ready" />
              </div>

              <p className="text-center text-gray-400 text-sm">
                One interview becomes weeks of social content.
              </p>
            </div>

            {/* Media */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-accent/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/02/smp-icon-anim.gif"
                alt="Shock Kit Content System"
                fill
                className="object-contain"
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
        const response = await fetch(`/api/gallery?type=media-production${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`)
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
                <span className="font-bold text-white">Media Production Gallery</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Our Work
              </h1>

              <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                Browse our portfolio of media productions. Podcasts, interviews, promotional videos and more.
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
            <StatCard number={`${galleryItems.length}`} label="Items in Gallery" />
            <StatCard number={`${categories.length}`} label="Categories" />
            <StatCard number="AI-Enhanced" label="Professional Quality" />
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
                    Let's Create Together
                  </h1>

                  <p className="text-lg text-gray-200">
                    Ready to launch a podcast series, produce interviews, or create promotional content?
                    Send us your vision — we'll bring the production expertise and AI-powered efficiency.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:shockmediapr@gmail.com">
                      <Button size="lg" className="text-lg px-8 py-6">
                        Email Us
                      </Button>
                    </a>
                    <a href="/pricing">
                      <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                        View Pricing
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-2">Studio Sessions</h3>
                  <p className="text-gray-400 text-sm">Professional podcast studio in Norfolk, VA with multi-camera setup</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-2">On-Location</h3>
                  <p className="text-gray-400 text-sm">Mobile production throughout Hampton Roads & beyond</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <StatCard number="Local" label="Norfolk • Chesapeake • VA Beach" />
                <StatCard number="Fast" label="48hr Response" />
                <StatCard number="Custom" label="Packages Available" />
              </div>

              <p className="text-center text-gray-400 text-sm">
                Book your session today.
              </p>
            </div>

            {/* Media */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-accent/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/02/Shocking-teaser.gif"
                alt="Contact Us"
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
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-4 md:p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 hover:border-secondary/40 transition-all hover:shadow-glow-md">
      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-cyan mb-1 md:mb-2 break-words">{number}</div>
      <div className="text-gray-400 text-xs sm:text-sm leading-tight">{label}</div>
    </div>
  )
}

function ServiceBox({
  icon: Icon,
  title,
  description,
  link,
  buttonText
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  link: string
  buttonText: string
}) {
  return (
    <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 hover:border-accent/40 transition-all space-y-3">
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-accent" />
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-gray-400 leading-relaxed">{description}</p>
      <a href={link}>
        <Button size="sm" className="bg-gradient-to-r from-accent via-secondary to-accent">
          {buttonText}
        </Button>
      </a>
    </div>
  )
}
