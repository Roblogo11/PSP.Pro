'use client'

import { useState } from 'react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Home,
  Sparkles,
  Zap,
  Video,
  Globe,
  Camera,
  Mic,
  Mail,
  Menu,
  X,
  Plane,
  Radio
} from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern, WaveAnimation } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import Image from 'next/image'
import { siteConfig } from '@/config/site'

type PanelId = 'home' | 'services' | 'motiongraphics' | 'shockkit' | 'videography' | 'websites' | 'photography' | 'podcast' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Quick Start', icon: Home },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'motiongraphics', label: 'Motion Graphics', icon: Sparkles },
  { id: 'shockkit', label: 'Shock Kit', icon: Zap },
  { id: 'videography', label: 'Videography', icon: Video },
  { id: 'websites', label: 'Websites', icon: Globe },
  { id: 'photography', label: 'Photography', icon: Camera },
  { id: 'podcast', label: 'Podcast', icon: Mic },
  { id: 'contact', label: 'Contact', icon: Mail },
]

export default function GetStartedPage() {
  const [activePanel, setActivePanel] = useState<PanelId>('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        {activePanel === 'home' && <HomePanel />}
        {activePanel === 'services' && <ServicesPanel />}
        {activePanel === 'motiongraphics' && <MotionGraphicsPanel />}
        {activePanel === 'shockkit' && <ShockKitPanel />}
        {activePanel === 'videography' && <VideographyPanel />}
        {activePanel === 'websites' && <WebsitesPanel />}
        {activePanel === 'photography' && <PhotographyPanel />}
        {activePanel === 'podcast' && <PodcastPanel />}
        {activePanel === 'contact' && <ContactPanel />}

        {/* Funnel Navigation (Final Step - Contact CTA) */}
        <FunnelNav />
      </div>
    </main>
  )
}

function HomePanel() {
  const services = [
    { href: '/photography', icon: Camera, title: 'Photography', description: 'Professional product, event & portrait photography' },
    { href: '/video', icon: Video, title: 'Videography', description: 'Cinematic video production for every occasion' },
    { href: '/drone', icon: Plane, title: 'Drone Services', description: 'Aerial photography and videography' },
    { href: '/podcast', icon: Mic, title: 'Podcast Studio', description: 'AI & business insights for modern creators' },
    { href: '/motion-graphics', icon: Zap, title: 'Motion Graphics', description: 'Eye-catching animations and effects' },
    { href: '/shock-kit', icon: Radio, title: 'Shock Kit', description: 'Premium creative toolkit and resources' },
    { href: '/website-help', icon: Globe, title: 'Website Help', description: 'Modern, responsive website solutions' },
    { href: '/contact', icon: Mail, title: 'Get Started', description: 'Connect with our team today' },
  ]

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="relative mb-12 p-6 md:p-12 rounded-2xl bg-gradient-to-br from-secondary to-accent overflow-hidden">
            <div className="absolute inset-0 bg-dark-400/40" />
            <div className="relative z-10 text-center">
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">
                Welcome to Shock Media
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Your AI-native marketing studio in Norfolk, Virginia Beach & Chesapeake. Start exploring our services below to find the perfect solution for your creative needs.
              </p>
            </div>
          </div>

          {/* Journey Content */}
          <div className="space-y-8 mb-12">
            <div className="bg-dark-100/80 border border-secondary/20 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-secondary" />
                Your Creative Journey Starts Here
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Whether you're launching a new product, capturing life's precious moments, or building your brand's digital presence, Shock Media delivers AI-powered creativity that sets you apart. Our integrated approach combines cutting-edge technology with artistic vision to bring your ideas to life.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-secondary">For Businesses</h3>
                  <p className="text-gray-400">
                    Elevate your brand with professional <Link href="/photography" className="text-secondary hover:text-accent transition-colors underline">photography</Link>, cinematic <Link href="/video" className="text-secondary hover:text-accent transition-colors underline">videography</Link>, and custom <Link href="/website-help" className="text-secondary hover:text-accent transition-colors underline">web solutions</Link> that drive results.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-secondary">For Creators</h3>
                  <p className="text-gray-400">
                    Access premium tools through our <Link href="/shock-kit" className="text-secondary hover:text-accent transition-colors underline">Shock Kit</Link>, learn from industry experts on our <Link href="/podcast" className="text-secondary hover:text-accent transition-colors underline">podcast</Link>, and bring your vision to life with <Link href="/motion-graphics" className="text-secondary hover:text-accent transition-colors underline">motion graphics</Link>.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Navigation Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {services.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  className="group p-6 rounded-xl bg-dark-100/50 border border-secondary/10 hover:border-secondary/40 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-left"
                >
                  <service.icon className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold text-white mb-1">{service.title}</h3>
                  <p className="text-xs text-gray-400 leading-snug">{service.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Ready to Transform Your Vision?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Explore our <Link href="/pricing" className="text-secondary hover:text-accent transition-colors underline font-semibold">core services</Link> or <Link href="/contact" className="text-secondary hover:text-accent transition-colors underline font-semibold">get in touch</Link> to discuss your project today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/pricing">
                <Button size="lg" className="group">
                  <Sparkles className="mr-2 w-5 h-5" />
                  View All Services
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="group">
                  <Mail className="mr-2 w-5 h-5" />
                  Contact Us
                </Button>
              </Link>
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
        <div className="max-w-6xl mx-auto">
        <div className="relative mb-12 p-6 md:p-12 rounded-2xl bg-gradient-services overflow-hidden">
          <div className="absolute inset-0 bg-dark-400/30" />
          <div className="relative z-10">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">
              Our Services
            </h1>
            <p className="text-xl text-gray-200">
              Comprehensive creative solutions powered by AI
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/motion-graphics">
            <ServiceCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Motion Graphics"
              description="3D animations, generative visuals, and AI-rendered imagery"
              features={['3D Visualization', 'Motion Design', 'AI-Generated Art', 'Platform Optimization']}
            />
          </Link>
          <Link href="/video">
            <ServiceCard
              icon={<Video className="w-8 h-8" />}
              title="Video Production"
              description="4K drone cinematography to rapid post-production"
              features={['Drone Cinematography', 'AI Editing', 'Color Grading', 'Multi-Platform']}
            />
          </Link>
          <Link href="/website-help">
            <ServiceCard
              icon={<Globe className="w-8 h-8" />}
              title="Web Development"
              description="AI-driven design systems and interactive experiences"
              features={['Custom Websites', 'Design Systems', 'E-commerce', 'Web Apps']}
            />
          </Link>
          <Link href="/shock-kit">
            <ServiceCard
              icon={<Zap className="w-8 h-8" />}
              title="Shock Kit"
              description="Social media content packages - we create, you post"
              features={['Content Creation', 'Brand Consistency', 'No Contracts', 'Fast Delivery']}
            />
          </Link>
        </div>
      </div>
    </div>
    </div>
  )
}

function MotionGraphicsPanel() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background with all effects */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Header with enhanced gradient */}
          <div className="relative mb-12 p-6 md:p-12 rounded-2xl bg-gradient-home overflow-hidden backdrop-blur-sm border border-secondary/20">
            <div className="absolute inset-0 bg-dark-400/40" />
            <WaveAnimation />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <Sparkles className="w-12 h-12 text-secondary animate-pulse" />
                <h1 className="text-5xl lg:text-7xl font-bold text-white">
                  Generative Motion Graphics
                </h1>
              </div>
              <p className="text-xl text-gray-200">
                3D, AI-Rendered Visuals & Dynamic Animations
              </p>
            </div>
          </div>

          {/* Interactive Demo Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Live Canvas Demo */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-secondary/30 bg-dark-100">
              <GenerativeMotion />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-2 bg-dark-400/80 backdrop-blur-sm p-6 rounded-lg border border-secondary/20">
                  <Sparkles className="w-12 h-12 text-secondary mx-auto animate-pulse" />
                  <p className="text-white font-bold text-xl">Live Particle System</p>
                  <p className="text-gray-400 text-sm">Real-time generative animation</p>
                </div>
              </div>
            </div>

            {/* Logo Showcase */}
            <div className="relative h-96 rounded-xl overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-secondary/20 via-accent/20 to-cyan/20">
              <FloatingShapes />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <Image
                    src={siteConfig.meta.logo}
                    alt="Logo"
                    width={200}
                    height={200}
                    className="drop-shadow-2xl animate-float"
                  />
                  <div className="absolute inset-0 blur-3xl bg-secondary/30 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatCard number="3D" label="Modeling & Animation" />
            <StatCard number="AI" label="Image Generation" />
            <StatCard number="Real-time" label="Rendering" />
            <StatCard number="4K+" label="Output Quality" />
          </div>

          {/* Features */}
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">What We Create</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="relative p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-secondary/20 overflow-hidden group hover:border-secondary/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-secondary" />
                    AI-Generated Visuals
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Stunning imagery created with cutting-edge AI models. From photorealistic renders to abstract art.
                  </p>
                </div>
              </div>

              <div className="relative p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-accent/20 overflow-hidden group hover:border-accent/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-accent" />
                    3D Animations
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Dynamic 3D motion graphics that bring your brand to life with depth and movement.
                  </p>
                </div>
              </div>

              <div className="relative p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-cyan/20 overflow-hidden group hover:border-cyan/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Video className="w-6 h-6 text-cyan" />
                    Motion Design
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Kinetic typography, logo animations, and dynamic transitions for any platform.
                  </p>
                </div>
              </div>

              <div className="relative p-6 rounded-xl bg-dark-100/80 backdrop-blur-sm border border-indigo/20 overflow-hidden group hover:border-indigo/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-indigo" />
                    Platform Optimization
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Content optimized for Instagram, TikTok, YouTube, and all major social platforms.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <div className="inline-block relative">
                <div className="absolute inset-0 blur-xl bg-secondary/30 animate-pulse" />
                <Link href="/motion-graphics">
                  <Button size="lg" className="relative text-lg px-8 py-6">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Your Motion Graphics Project
                  </Button>
                </Link>
              </div>
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
        <div className="max-w-6xl mx-auto">
        <div className="relative mb-12 p-6 md:p-12 rounded-2xl bg-gradient-shockkit overflow-hidden">
          <div className="absolute inset-0 bg-dark-400/30" />
          <div className="relative z-10">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">
              The Shock Kit⚡
            </h1>
            <p className="text-xl text-gray-200">
              Social Media Made Easy - We Create. You Post.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard number="3" label="Pricing Tiers" />
          <StatCard number="0" label="Long-Term Contracts" />
          <StatCard number="24-48h" label="Delivery Time" />
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-3xl font-bold text-white mb-6">What's Included?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Social interactive media created with AI-driven design systems tailored for your brand.
          </p>

          <div className="grid grid-cols-1 gap-6">
            <FeatureBox
              title="Custom Content"
              description="Brand-specific designs that match your identity and voice perfectly."
            />
            <FeatureBox
              title="Flexible Plans"
              description="Choose the package that fits your needs with no long-term commitments."
            />
            <FeatureBox
              title="Fast Turnaround"
              description="Get your content quickly so you can stay consistent on social media."
            />
          </div>

          <div className="mt-12 text-center">
            <Link href="/shock-kit">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Your Shock Kit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

function VideographyPanel() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-6xl mx-auto">
        <div className="relative mb-12 p-6 md:p-12 rounded-2xl bg-gradient-videography overflow-hidden">
          <div className="absolute inset-0 bg-dark-400/30" />
          <div className="relative z-10">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">
              Videography
            </h1>
            <p className="text-xl text-gray-200">
              4K Drone to Post-Production
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard number="4K" label="Resolution" />
          <StatCard number="60fps" label="Frame Rate" />
          <StatCard number="AI" label="Enhanced Editing" />
          <StatCard number="Fast" label="Turnaround" />
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-3xl font-bold text-white mb-6">Our Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureBox
              title="Drone Cinematography"
              description="Professional 4K aerial footage captured with precision and creativity."
            />
            <FeatureBox
              title="AI-Assisted Editing"
              description="Cutting-edge tools accelerate post-production while maintaining quality."
            />
            <FeatureBox
              title="Color Grading"
              description="Professional color correction and grading for cinematic results."
            />
            <FeatureBox
              title="Multi-Platform Optimization"
              description="Content optimized for every platform from YouTube to TikTok."
            />
          </div>

          <div className="mt-12 flex justify-end">
            <Link href="/video">
              <Button size="lg" className="text-lg px-8 py-6">
                <Video className="w-5 h-5 mr-2" />
                Explore Videography
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

function WebsitesPanel() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-6xl mx-auto">
        <div className="relative mb-12 p-6 md:p-12 rounded-2xl bg-gradient-websites overflow-hidden">
          <div className="absolute inset-0 bg-dark-400/30" />
          <div className="relative z-10">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">
              Web Development
            </h1>
            <p className="text-xl text-gray-200">
              AI-Driven Design Systems
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-3xl font-bold text-white mb-6">What We Build</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureBox
              title="Custom Websites"
              description="Unique, responsive websites built with modern frameworks."
            />
            <FeatureBox
              title="Design Systems"
              description="Scalable component libraries for consistent brand experiences."
            />
            <FeatureBox
              title="E-commerce"
              description="Powerful online stores with seamless checkout experiences."
            />
            <FeatureBox
              title="Web Applications"
              description="Interactive applications with AI-powered features."
            />
          </div>

          <div className="mt-12 flex justify-end">
            <Link href="/website-help">
              <Button size="lg" className="text-lg px-8 py-6">
                <Globe className="w-5 h-5 mr-2" />
                Explore Web Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

function PhotographyPanel() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-6xl mx-auto">
        <div className="relative mb-12 p-6 md:p-12 rounded-2xl bg-gradient-photography overflow-hidden">
          <div className="absolute inset-0 bg-dark-400/30" />
          <div className="relative z-10">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">
              Photography
            </h1>
            <p className="text-xl text-gray-200">
              AI-Enhanced Photography Services
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-3xl font-bold text-white mb-6">Photography Services</h2>
          <p className="text-gray-300 text-lg mb-8">
            Professional photography enhanced with AI-powered editing and post-processing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureBox
              title="Product Photography"
              description="Stunning product shots for e-commerce and marketing."
            />
            <FeatureBox
              title="Brand Photography"
              description="Professional images that capture your brand essence."
            />
            <FeatureBox
              title="AI Enhancement"
              description="Advanced retouching and enhancement using AI tools."
            />
            <FeatureBox
              title="Fast Delivery"
              description="Quick turnaround without sacrificing quality."
            />
          </div>

          <div className="mt-12 flex justify-end">
            <Link href="/photography">
              <Button size="lg" className="text-lg px-8 py-6">
                <Camera className="w-5 h-5 mr-2" />
                Explore Photography
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

function PodcastPanel() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <GenerativeMotion />
        <GridPattern />
        <FloatingShapes />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-16">
        <div className="max-w-6xl mx-auto">
        <div className="relative mb-12 p-6 md:p-12 rounded-2xl bg-gradient-podcast overflow-hidden">
          <div className="absolute inset-0 bg-dark-400/30" />
          <div className="relative z-10">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">
              Podcast Production
            </h1>
            <p className="text-xl text-gray-200">
              Full-Service Podcast Solutions
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-3xl font-bold text-white mb-6">Podcast Services</h2>
          <p className="text-gray-300 text-lg mb-8">
            From recording to distribution, we handle every aspect of podcast production.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureBox
              title="Recording & Production"
              description="Professional audio recording with studio-quality equipment."
            />
            <FeatureBox
              title="AI-Powered Editing"
              description="Fast, precise editing using advanced AI audio tools."
            />
            <FeatureBox
              title="Show Notes & SEO"
              description="Optimized content for maximum discoverability."
            />
            <FeatureBox
              title="Distribution"
              description="Seamless publishing to all major podcast platforms."
            />
          </div>

          <div className="mt-12 flex justify-end">
            <Link href="/podcast">
              <Button size="lg" className="text-lg px-8 py-6">
                <Mic className="w-5 h-5 mr-2" />
                Explore Podcast Services
              </Button>
            </Link>
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
        <div className="max-w-6xl mx-auto">
        <div className="relative mb-12 p-6 md:p-12 rounded-2xl bg-gradient-contact overflow-hidden">
          <div className="absolute inset-0 bg-dark-400/30" />
          <div className="relative z-10">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-200">
              Let's create something amazing together
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Whether you need a single service or a comprehensive creative solution, we're here to help.
          </p>

          <div className="bg-dark-100 rounded-xl p-8 border border-secondary/20">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Email</h3>
                <p className="text-gray-300">shockmediapr@gmail.com</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Social</h3>
                <div className="flex gap-4 text-gray-300">
                  <a href="https://www.instagram.com/shockmp/" target="_blank" rel="noopener" className="hover:text-secondary">Instagram</a>
                  <a href="https://www.youtube.com/@ShockMediaProductions" target="_blank" rel="noopener" className="hover:text-secondary">YouTube</a>
                  <a href="https://www.tiktok.com/@shockmp" target="_blank" rel="noopener" className="hover:text-secondary">TikTok</a>
                  <a href="https://www.linkedin.com/in/shock-media-productions-6762a02b6/" target="_blank" rel="noopener" className="hover:text-secondary">LinkedIn</a>
                </div>
              </div>
              <div className="pt-4">
                <Link href="/contact">
                  <Button size="lg" className="w-full">
                    Send Us a Message
                  </Button>
                </Link>
              </div>
            </div>
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
    <div className="p-4 md:p-6 rounded-xl bg-dark-100 border border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-glow-md">
      <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-secondary mb-1 md:mb-2 break-words">{number}</div>
      <div className="text-gray-400 text-xs sm:text-sm leading-tight">{label}</div>
    </div>
  )
}

function FeatureBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-dark-100 border border-secondary/20 hover:border-secondary/40 transition-all">
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function ServiceCard({
  icon,
  title,
  description,
  features
}: {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
}) {
  return (
    <div className="p-8 rounded-xl bg-dark-100 border border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-glow-md">
      <div className="text-secondary mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="text-gray-300 flex items-center gap-2">
            <span className="text-secondary">•</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}
