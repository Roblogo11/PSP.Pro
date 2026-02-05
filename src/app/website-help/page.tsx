'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Home,
  Globe,
  Zap,
  Sparkles,
  Mail,
  Menu,
  X,
} from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import { FunnelBridge } from '@/components/navigation/funnel-bridge'
import Image from 'next/image'

type PanelId = 'hero' | 'services' | 'shockkit' | 'examples' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Quick Start', icon: Home },
  { id: 'services', label: 'Website Services', icon: Globe },
  { id: 'shockkit', label: 'Shock⚡Kit', icon: Zap },
  { id: 'examples', label: 'Web Results', icon: Sparkles },
  { id: 'contact', label: 'Contact', icon: Mail },
]

export default function WebsiteHelpPage() {
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

        {/* Narrative Bridge: Website Help to Get Started */}
        <div className="border-t border-secondary/10">
          <FunnelBridge variant="website-to-getstarted" />
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
                    <Globe className="w-8 h-8 text-cyan" />
                    <span className="font-bold text-white">Website Help</span>
                  </div>

                  <h1 className="text-5xl lg:text-6xl font-bold text-white">
                    Website Help & Growth
                  </h1>

                  <p className="text-xl text-gray-200">
                    Web Growth Unlocked – Seamless UI/UX, combined with your unique story—is a website that wins. 🚀
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a href="/website-redesign">
                      <Button size="lg" className="text-lg px-8 py-6">
                        Get New Website
                      </Button>
                    </a>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-6"
                      onClick={() => setActivePanel('examples')}
                    >
                      <Sparkles className="mr-2 w-5 h-5" />
                      View Results
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard number="Website Design" label="Creative Designs & with AI powered apps" />
                <StatCard number="4x Speed" label="Edit Websites" />
                <StatCard number="95% + Views" label="AI + SEO" />
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
                src="https://www.youtube.com/embed/GbX4nsRnTwU"
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
                    <Globe className="w-8 h-8 text-indigo" />
                    <span className="font-bold text-white">Website Services</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    Let's build a website that works?
                  </h1>

                  <p className="text-lg text-gray-200">
                    Discover how we can help. Website Essentials & Considerations (Priced per project):
                    Emergency Website Editing, Custom Design & Branding, User Experience (UX) & Navigation,
                    Mobile Optimization, SEO & Performance, E-Commerce & Payment Integration,
                    Content Strategy & Copywriting, Social Media Integration, Security & Maintenance
                  </p>
                </div>
              </div>

              {/* Service Cards */}
              <div className="grid grid-cols-1 gap-4">
                <ServiceBox
                  title="Fix your website now"
                  description="3 Step Fix – If your site is broken… We can fix it. Get started by watching the video or by clicking Step 1."
                  link="/website-fix"
                  buttonText="Get Help"
                />
                <ServiceBox
                  title="Get A New Website"
                  description="⚡ Update Old & New Websites"
                  link="/website-redesign"
                  buttonText="New Site"
                />
                <ServiceBox
                  title="Web Growth & Updates"
                  description="⚡ Get Ahead Of Your Competitors"
                  link="/seo"
                  buttonText="Learn More"
                />
              </div>

              <a href="/seo/" className="block text-center text-gray-400 text-sm hover:text-secondary transition-colors">
                Click here for SEO services
              </a>
            </div>

            {/* Media */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-indigo/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/01/Web-gif-shockmp.gif"
                alt="Website Services"
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
              <div className="relative p-6 md:p-12 rounded-2xl bg-gradient-shockkit overflow-hidden backdrop-blur-sm border border-white/10">
                <div className="absolute inset-0 bg-dark-400/40" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-accent" />
                    <span className="font-bold text-white">The Shock Kit</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    Web Post Systems — For Growth
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
                <StatCard number="Ready" label="SEO & AEO Graphics" />
                <StatCard number="24/7" label="Content Scheduling" />
                <StatCard number="Integrated" label="Multi-platform" />
              </div>

              <p className="text-center text-gray-400 text-sm">
                Ready made social content. Just click the post button.
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
                    <Sparkles className="w-8 h-8 text-secondary" />
                    <span className="font-bold text-white">Examples</span>
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    Check Our Gallery
                  </h1>

                  <p className="text-lg text-gray-200">
                    View case studies, highlights, and captures from our work with clients. Or try our interactive blog: "What are web cookies?"
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <a href="/digital-builds">
                      <Button size="lg" className="text-lg px-8 py-6">
                        View Websites
                      </Button>
                    </a>
                    <a href="/blog/web-cookies">
                      <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                        Read Blog
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard number="$1.2M+" label="Views - All clients & experiences" />
                <StatCard number="150k+" label="Per Client Reach" />
                <StatCard number="30%+" label="Avg. Engagement Lift" />
              </div>

              <p className="text-center text-gray-400 text-sm">
                AI data-driven creative results.
              </p>
            </div>

            {/* Media */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-secondary/30">
              <Image
                src="https://roblogo.com/wp-content/uploads/2025/03/fix-my-website.gif"
                alt="Examples"
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
                        All Services
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
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-4 md:p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 hover:border-secondary/40 transition-all hover:shadow-glow-md">
      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-cyan mb-1 md:mb-2 break-words">{number}</div>
      <div className="text-gray-400 text-xs sm:text-sm leading-tight">{label}</div>
    </div>
  )
}

function ServiceBox({ title, description, link, buttonText }: { title: string; description: string; link: string; buttonText: string }) {
  return (
    <div className="p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-white/10 hover:border-indigo/40 transition-all space-y-3">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
      <a href={link}>
        <Button size="sm" className="bg-gradient-to-r from-indigo-500 via-pink-500 to-teal-500">
          {buttonText}
        </Button>
      </a>
    </div>
  )
}
