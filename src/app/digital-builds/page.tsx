'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Home,
  Globe,
  Sparkles,
  Mail,
  Menu,
  X,
} from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import Image from 'next/image'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import type { GalleryItem } from '@/lib/gallery'

type PanelId = 'hero' | 'examples' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Digital Builds', icon: Home },
  { id: 'examples', label: 'Our Work', icon: Sparkles },
  { id: 'contact', label: 'Contact', icon: Mail },
]

export default function DigitalBuildsPage() {
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
                    <span className="font-bold text-white">Digital Builds</span>
                  </div>

                  <h1 className="text-5xl lg:text-6xl font-bold text-white">
                    AI-Driven Design Systems
                  </h1>

                  <p className="text-xl text-gray-200">
                    Websites and interactive media created with AI-driven design systems. We build digital experiences that combine beautiful design with cutting-edge AI capabilities.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:shockmediapr@gmail.com">
                      <Button size="lg" className="text-lg px-8 py-6">
                        Start Your Project
                      </Button>
                    </a>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6"
                      onClick={() => setActivePanel('examples')}
                    >
                      <Sparkles className="mr-2 w-5 h-5" />
                      View Gallery
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard number="AI-Powered" label="Website Builds" />
                <StatCard number="Custom" label="Design Systems" />
                <StatCard number="Full Stack" label="Web Applications" />
              </div>

              <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg font-bold text-white mb-3">What We Build:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">✓</span>
                    <span>AI-powered websites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">✓</span>
                    <span>Interactive web applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">✓</span>
                    <span>Custom design systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">✓</span>
                    <span>E-commerce platforms</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Media */}
            <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden border-2 border-cyan/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/03/web-redesign-sm.gif"
                alt="Digital Builds Showcase"
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
        const response = await fetch(`/api/gallery?type=digital-builds${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`)
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
                <span className="font-bold text-white">Digital Builds Gallery</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Our Work
              </h1>

              <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                Browse our portfolio of websites, web apps, and digital builds.
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
            <StatCard number={`${galleryItems.length}`} label="Projects in Gallery" />
            <StatCard number={`${categories.length}`} label="Categories" />
            <StatCard number="AI-Built" label="Professional Quality" />
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
                    Let's Build Together
                  </h1>

                  <p className="text-lg text-gray-200">
                    Ready to build your next digital project? Whether it's a website, web app, or e-commerce platform, we've got you covered.
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
                <StatCard number="Local" label="Norfolk • Chesapeake • VA Beach" />
                <StatCard number="Fast" label="48hr Response" />
                <StatCard number="Custom" label="Packages Available" />
              </div>
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
