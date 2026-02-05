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
  Play
} from 'lucide-react'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import { FunnelBridge } from '@/components/navigation/funnel-bridge'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import Image from 'next/image'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import type { GalleryItem } from '@/lib/gallery'
import { ProjectShowcase } from '@/components/project-showcase'
import { getProjectsByService } from '@/data/projects'

type PanelId = 'hero' | 'services' | 'shockkit' | 'examples' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Quick Start', icon: Home },
  { id: 'services', label: 'Video Services', icon: Video },
  { id: 'shockkit', label: 'Shock Kit', icon: Zap },
  { id: 'examples', label: 'Examples', icon: Sparkles },
  { id: 'contact', label: 'Contact', icon: Mail },
]

export default function VideoPage() {
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
        {activePanel === 'services' && <ServicesPanel />}
        {activePanel === 'shockkit' && <ShockKitPanel />}
        {activePanel === 'examples' && <ExamplesPanel />}
        {activePanel === 'contact' && <ContactPanel />}

        {/* 757 Project Showcase */}
        <div className="border-t border-secondary/10 bg-dark-300">
          <ProjectShowcase
            projects={getProjectsByService('video')}
            title="757 Motion Portfolio"
          />
        </div>

        {/* Narrative Bridge: Video to Shock Kit */}
        <div className="border-t border-secondary/10">
          <FunnelBridge variant="video-to-shockkit" />
        </div>

        {/* Funnel Navigation */}
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
                    <Video className="w-8 h-8 text-cyan" />
                    <span className="font-bold text-white">Video Services</span>
                  </div>

                  <h1 className="text-5xl lg:text-6xl font-bold text-white">
                    Professional Video Production for Local Brands
                  </h1>

                  <p className="text-xl text-gray-200">
                    ShockAI creates high-impact videos for businesses in Norfolk, Virginia Beach,
                    and Chesapeake. From events to commercials to brand stories, we produce
                    scroll-stopping content that builds trust and drives traffic.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:shockmediapr@gmail.com">
                      <Button size="lg" className="text-lg px-8 py-6">
                        Book a Video Project
                      </Button>
                    </a>
                    <div id="view-gallery">
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
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard number="300+" label="Videos Delivered for Coastal VA Businesses" />
                <StatCard number="10M+" label="Views Across Social & Web" />
                <StatCard number="Full Service" label="Filming, Editing, Strategy & Delivery" />
              </div>

              <p className="text-center text-gray-400 text-sm">
                Filming on-location in Norfolk, Chesapeake & Virginia Beach.
              </p>
            </div>

            {/* Media */}
            <div className="relative h-96 lg:h-[600px] rounded-xl overflow-hidden border-2 border-cyan/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/02/20240228_125258-1.gif"
                alt="Video Production Showcase"
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
                    <Video className="w-8 h-8 text-indigo" />
                    <span className="font-bold text-white">Video Services</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    AI-Enhanced Video Production
                  </h1>

                  <p className="text-lg text-gray-200">
                    Boost your Norfolk, Chesapeake, and Virginia Beach business with professional video production powered by AI. From corporate videos and marketing campaigns to events and brand storytelling, we deliver content that engages audiences, elevates your brand, and maximizes ROI.
                  </p>

                  <a href="mailto:shockmediapr@gmail.com">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Book a Video Project
                    </Button>
                  </a>
                </div>
              </div>

              {/* Service Cards */}
              <div className="grid grid-cols-1 gap-4">
                <ServiceBox
                  title="Corporate & Marketing Videos"
                  description="Create polished, AI-enhanced videos for your business. Perfect for websites, social media, and advertising campaigns that convert local audiences."
                  link="mailto:shockmediapr@gmail.com?subject=ShockAI%20Inquiry:%20Brands%20%26%20Products"
                />
                <ServiceBox
                  title="Event Coverage"
                  description="Capture conferences, launches, and community events with AI-assisted editing for a dynamic, professional finish that resonates with your audience."
                  link="mailto:shockmediapr@gmail.com?subject=ShockAI%20Inquiry:%20Special%20Events"
                />
                <ServiceBox
                  title="Brand Storytelling"
                  description="Transform your brand message into compelling video narratives. Our AI-enhanced workflows optimize visuals, pacing, and sound for maximum engagement."
                  link="mailto:shockmediapr@gmail.com?subject=ShockAI%20Inquiry:%20Social%20Media%20Content"
                />
              </div>

              <p className="text-center text-gray-400 text-sm">
                Serving Norfolk • Chesapeake • Virginia Beach — AI-powered production that scales your business.
              </p>
            </div>

            {/* Video Embed */}
            <div className="relative rounded-xl overflow-hidden border-2 border-indigo/30 bg-dark-100 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/rM2iyf9Ivz8?si=RTCG-_VTFuDjiZEI"
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
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-shockkit overflow-hidden backdrop-blur-sm border border-white/10">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-accent" />
                    <span className="font-bold text-white">The Shock Kit</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    Social Systems — Made Fast
                  </h1>

                  <p className="text-lg text-gray-200">
                    Templates, interactive posts, and snackable assets that are production efficient and brand consistent. We hand you the system — you scale the posts.
                  </p>

                  <a href="/shock-kit/">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Try the Kit
                    </Button>
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <StatCard number="Ready" label="Template Packs" />
                <StatCard number="24/7" label="Content Scheduling" />
                <StatCard number="Integrated" label="Platform APIs" />
              </div>

              <p className="text-center text-gray-400 text-sm">
                Template packs and API integrations.
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

function ExamplesPanel() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch(`/api/gallery?type=video${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`)
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
                <Play className="w-8 h-8 text-secondary" />
                <span className="font-bold text-white">Video Gallery</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white">
                Our Video Work
              </h1>

              <p className="text-lg text-gray-200 max-w-3xl mx-auto">
                Browse our portfolio of professional video production. Click any video to play.
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
            <StatCard number={`${galleryItems.length}`} label="Videos in Gallery" />
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
                    Let's Build Something
                  </h1>

                  <p className="text-lg text-gray-200">
                    Interested in a pilot, consultation, or a demo of our Shock Kit? Send over the brief — we'll show what's possible.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:shockmediapr@gmail.com">
                      <Button size="lg" className="text-lg px-8 py-6">
                        Email Us
                      </Button>
                    </a>
                    <a href="/get-started">
                      <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                        More Services
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <StatCard number="Local" label="Norfolk • Chesapeake • VA Beach" />
                <StatCard number="Fast" label="Response within 48 hours" />
                <StatCard number="Custom" label="Builds & Integrations" />
              </div>

              <p className="text-center text-gray-400 text-sm">
                Ready for your brief.
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
    <div className="p-4 md:p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 hover:border-secondary/40 transition-all hover:shadow-glow-md">
      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-cyan mb-1 md:mb-2 break-words">{number}</div>
      <div className="text-gray-400 text-xs sm:text-sm leading-tight">{label}</div>
    </div>
  )
}

function ServiceBox({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 hover:border-indigo/40 transition-all space-y-3">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
      <a href={link}>
        <Button size="sm" variant="outline">
          Book Time
        </Button>
      </a>
    </div>
  )
}
