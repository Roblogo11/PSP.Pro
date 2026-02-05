'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Home,
  Mic,
  Zap,
  Sparkles,
  Mail,
  Menu,
  X,
  Radio
} from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import Image from 'next/image'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import type { GalleryItem } from '@/lib/gallery'

type PanelId = 'hero' | 'about' | 'shockkit' | 'episodes' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Quick Start', icon: Home },
  { id: 'about', label: 'About Podcast', icon: Mic },
  { id: 'shockkit', label: 'Shock Kit', icon: Zap },
  { id: 'episodes', label: 'Episodes', icon: Sparkles },
  { id: 'contact', label: 'Contact', icon: Mail },
]

export default function PodcastPage() {
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

  // Check for hash on mount and auto-navigate to gallery
  useEffect(() => {
    if (window.location.hash === '#view-gallery') {
      setActivePanel('episodes')
    }
  }, [])

  return (
    <main className="min-h-screen bg-dark-300 flex">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-dark-200/90 backdrop-blur-sm border border-secondary/20 text-white hover:scale-105 transition-transform"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-dark-200/50 backdrop-blur-sm border-r border-secondary/10 transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-2">
          <a href="/" className="block mb-2 hover:opacity-80 transition-opacity">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Shock⚡Podcast
            </h2>
          </a>
          <p className="text-sm text-gray-400">AI & Business Insights</p>
        </div>
        <nav className="flex-1 px-4 pb-6">
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? 'bg-secondary/20 text-secondary border border-secondary/30'
                    : 'text-gray-400 hover:text-white hover:bg-dark-100/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
          <a
            href="mailto:shockmediapr@gmail.com"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-secondary to-accent text-white font-bold hover:scale-105 transition-transform mt-4"
          >
            <span>🔔</span>
            <span>Subscribe</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {activePanel === 'hero' && <HeroPanel setActivePanel={setActivePanel} />}
        {activePanel === 'about' && <AboutPanel />}
        {activePanel === 'shockkit' && <ShockKitPanel />}
        {activePanel === 'episodes' && <EpisodesPanel />}
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
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 overflow-hidden backdrop-blur-sm border border-secondary/20">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <Radio className="w-8 h-8 text-secondary" />
                    <span className="font-bold text-white">The Shock Podcast</span>
                  </div>

                  <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                    AI, Business & Innovation
                  </h1>

                  <p className="text-xl text-gray-200">
                    Join us as we explore the cutting edge of AI technology, business transformation,
                    and digital innovation. Real conversations with real impact for Norfolk, Virginia Beach,
                    and Chesapeake entrepreneurs and creators.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:shockmediapr@gmail.com">
                      <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-secondary to-accent hover:scale-105 transition-transform">
                        Be a Guest
                      </Button>
                    </a>
                    <div id="view-gallery">
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-8 py-6 border-secondary/30 text-secondary hover:bg-secondary/10"
                        onClick={() => setActivePanel('episodes')}
                      >
                        <Sparkles className="mr-2 w-5 h-5" />
                        View Episodes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard number="Weekly" label="New Episodes Every Week" />
                <StatCard number="100k+" label="Total Views & Downloads" />
                <StatCard number="AI-Powered" label="Content & Production" />
              </div>

              <p className="text-center text-gray-400 text-sm">
                Streaming on YouTube • Spotify • Apple Podcasts
              </p>
            </div>

            {/* Media */}
            <div className="relative h-96 lg:h-[600px] rounded-xl overflow-hidden border-2 border-secondary/30 bg-dark-100">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/02/smp-icon-anim-1.gif"
                alt="Shock Podcast"
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

function AboutPanel() {
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
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 overflow-hidden backdrop-blur-sm border border-secondary/20">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mic className="w-8 h-8 text-accent" />
                    <span className="font-bold text-white">About The Podcast</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    Real Talk About AI & Business
                  </h1>

                  <p className="text-lg text-gray-200">
                    The Shock Podcast cuts through the noise to deliver actionable insights about AI,
                    digital transformation, and modern business strategy. We interview local leaders,
                    tech innovators, and industry experts to bring you the knowledge you need to stay ahead.
                  </p>

                  <a href="mailto:shockmediapr@gmail.com">
                    <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-secondary to-accent">
                      Pitch Your Story
                    </Button>
                  </a>
                </div>
              </div>

              {/* Topic Cards */}
              <div className="grid grid-cols-1 gap-4">
                <TopicBox
                  title="AI & Technology"
                  description="Deep dives into artificial intelligence, machine learning, and emerging technologies transforming business and creativity."
                />
                <TopicBox
                  title="Business Strategy"
                  description="Marketing, operations, and growth tactics for entrepreneurs and business owners in the digital age."
                />
                <TopicBox
                  title="Creator Economy"
                  description="Content creation, social media strategy, and building an audience in today's creator landscape."
                />
              </div>

              <p className="text-center text-gray-400 text-sm">
                New episodes every week featuring local Virginia Beach experts
              </p>
            </div>

            {/* Media */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-accent/30 bg-dark-100">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/02/20240228_125258-1.gif"
                alt="Podcast Recording"
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {/* Content */}
            <div className="space-y-6">
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 overflow-hidden backdrop-blur-sm border border-secondary/20">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-accent" />
                    <span className="font-bold text-white">The Shock Kit</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                    Podcast Production Made Easy
                  </h1>

                  <p className="text-lg text-gray-200">
                    Launch your own AI-powered podcast with our turnkey production system. Templates,
                    editing workflows, and distribution tools that scale your voice.
                  </p>

                  <a href="/shock-kit/">
                    <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-secondary to-accent">
                      Get the Kit
                    </Button>
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <StatCard number="Ready" label="Templates" />
                <StatCard number="24/7" label="Support" />
                <StatCard number="AI" label="Editing Tools" />
              </div>

              <p className="text-center text-gray-400 text-sm">
                Everything you need to start podcasting
              </p>
            </div>

            {/* Media */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-accent/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/02/smp-icon-anim.gif"
                alt="Shock Kit"
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

function EpisodesPanel() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch(`/api/gallery?type=podcast${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`)
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
          <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 overflow-hidden backdrop-blur-sm border border-secondary/20">
            <div className="absolute inset-0 bg-dark-400/40" />
            <div className="relative z-10 space-y-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <Radio className="w-8 h-8 text-secondary" />
                <span className="font-bold text-white">Podcast Episodes</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Browse Our Episodes
              </h1>

              <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                Watch and listen to our full archive of conversations, interviews, and insights. Click any episode to watch.
              </p>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategory === 'all'
                        ? 'bg-secondary/20 text-secondary border border-secondary/30'
                        : 'bg-dark-100/50 text-gray-400 hover:text-white hover:bg-dark-100'
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
                          ? 'bg-secondary/20 text-secondary border border-secondary/30'
                          : 'bg-dark-100/50 text-gray-400 hover:text-white hover:bg-dark-100'
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
              <p className="text-gray-400">Loading episodes...</p>
            </div>
          ) : (
            <GalleryGrid items={galleryItems} columns={3} />
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard number={`${galleryItems.length}`} label="Episodes Available" />
            <StatCard number={`${categories.length}`} label="Categories" />
            <StatCard number="AI-Enhanced" label="Production Quality" />
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
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 overflow-hidden backdrop-blur-sm border border-secondary/20">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-8 h-8 text-accent" />
                    <span className="font-bold text-white">Contact</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    Join The Conversation
                  </h1>

                  <p className="text-lg text-gray-200">
                    Have a story to share? Want to be a guest? Looking to sponsor an episode?
                    Let's connect and create something amazing together.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:shockmediapr@gmail.com">
                      <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-secondary to-accent">
                        Email Us
                      </Button>
                    </a>
                    <a href="/get-started">
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-8 py-6 border-secondary/30 text-secondary hover:bg-secondary/10"
                      >
                        More Services
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <StatCard number="Local" label="Norfolk • VA Beach" />
                <StatCard number="Fast" label="24hr Response" />
                <StatCard number="Custom" label="Tailored Content" />
              </div>

              <p className="text-center text-gray-400 text-sm">
                Ready to amplify your voice
              </p>
            </div>

            {/* Media */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-accent/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/02/All-sports-need-videography.gif"
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
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-4 md:p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-glow-md">
      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-1 md:mb-2 break-words">{number}</div>
      <div className="text-gray-400 text-xs sm:text-sm leading-tight">{label}</div>
    </div>
  )
}

function TopicBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-secondary/20 hover:border-accent/40 transition-all space-y-3">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}
