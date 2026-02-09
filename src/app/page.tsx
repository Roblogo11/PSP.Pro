'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Zap,
  Target,
  TrendingUp,
  Award,
  Play,
  CheckCircle,
  ArrowRight,
  MapPin,
  Clock,
  Users,
  Flame,
  Activity,
  LayoutDashboard,
} from 'lucide-react'
import { GoogleReviews } from '@/components/google-reviews'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { PLACEHOLDER_IMAGES } from '@/lib/placeholder-images'
import { useUserRole } from '@/lib/hooks/use-user-role'
import { useTheme } from '@/lib/contexts/theme-context'
import { createClient } from '@/lib/supabase/client'

interface FeaturedService {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price_cents: number
  category: string
  max_participants: number
  homepage_image_url: string | null
  homepage_order: number
}

export default function HomePage() {
  const router = useRouter()
  const { profile, isCoach, isAdmin, isAthlete, loading } = useUserRole()
  const { theme } = useTheme()
  const footerHeadingColor = theme === 'dark' ? '#ffffff' : '#0f172a'

  // Featured services from database
  const [featuredIndividual, setFeaturedIndividual] = useState<FeaturedService[]>([])
  const [featuredGroup, setFeaturedGroup] = useState<FeaturedService[]>([])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('services')
          .select('id, name, description, duration_minutes, price_cents, category, max_participants, homepage_image_url, homepage_order')
          .eq('featured_on_homepage', true)
          .eq('is_active', true)
          .order('homepage_order', { ascending: true })

        if (error) {
          console.error('Error fetching featured services:', error)
          return
        }

        if (data) {
          setFeaturedIndividual(data.filter(s => s.category === 'individual'))
          setFeaturedGroup(data.filter(s => s.category === 'group'))
        }
      } catch (err) {
        console.error('Error fetching featured services:', err)
      }
    }

    fetchFeatured()
  }, [])

  // Route helper: coach/admin → /admin, logged-in athlete → /booking, guest → /login
  const bookingHref = (isCoach || isAdmin) ? '/admin' : profile ? '/booking' : '/login'

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-700 dark:text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen home-page">
      {/* Web3 Wallet Icon - Hidden until NFT feature is ready
      <Link href="/vault" className="fixed top-6 right-6 z-50 group">
        <div className="relative">
          <div className="absolute inset-0 bg-orange/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-14 h-14 bg-gradient-to-br from-orange to-cyan rounded-full flex items-center justify-center shadow-lg shadow-orange/30 hover:shadow-orange/50 transition-all duration-300 hover:scale-110 border-2 border-cyan-200/40">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>
      </Link>
      */}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={PLACEHOLDER_IMAGES.hero.main}
            alt={PLACEHOLDER_IMAGES.hero.alt}
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950/95" />
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 z-[1]" />

        {/* Cyan Glow Effect - PSP Blue */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full blur-[150px] z-[2]" style={{ background: 'radial-gradient(circle, rgba(0, 180, 216, 0.15) 0%, rgba(0, 180, 216, 0.05) 50%, transparent 100%)' }} />
        {/* Orange accent glow */}
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[150px] z-[2]" style={{ background: 'radial-gradient(circle, rgba(184, 48, 26, 0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/images/PSP-black-300x99-1.png"
              alt="PSP.Pro Logo"
              className="h-20 mx-auto"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(0, 180, 216, 0.4)) brightness(0) invert(1)',
              }}
            />
            <p className="text-sm mt-2 text-cyan-700 dark:text-white">PSP.Pro</p>
          </div>

          {/* Tagline */}
          <div className="mb-6">
            <span className="inline-block px-5 py-2 bg-orange/10 border border-orange/20 rounded-full text-sm font-semibold italic tracking-wide text-white">
              &ldquo;Progression Over Perfection&rdquo;
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-6 leading-tight text-white">
            Train Like a Pro.
            <br />
            <span className="text-gradient-orange">Perform Like a Champion.</span>
          </h2>

          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto" style={{ color: '#ffffff' }}>
            Elite softball, basketball, and soccer training in Virginia Beach. Master mechanics, build speed,
            and dominate your sport with data-driven performance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {profile ? (
              <>
                <Link href={(isCoach || isAdmin) ? '/admin' : '/locker'}>
                  <button className="btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto" style={{ color: '#ffffff' }}>
                    <LayoutDashboard className="w-5 h-5" style={{ color: '#ffffff' }} />
                    <span className="text-white">Go to Dashboard</span>
                  </button>
                </Link>
                <Link href="/booking">
                  <button className="btn-ghost text-lg px-8 py-4 flex items-center gap-2 mx-auto border-cyan/30 hover:border-cyan/50" style={{ color: '#ffffff' }}>
                    <span className="text-white">Book a Session</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/get-started">
                  <button className="btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto" style={{ color: '#ffffff' }}>
                    <span className="text-white">Join the Team</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="btn-ghost text-lg px-8 py-4 flex items-center gap-2 mx-auto border-cyan/30 hover:border-cyan/50" style={{ color: '#ffffff' }}>
                    <LayoutDashboard className="w-5 h-5" style={{ color: '#ffffff' }} />
                    <span className="text-white">Access PSP.Pro</span>
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Key Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
            {/* Book Session - Role-aware link */}
            <Link href={bookingHref}>
              <div className="command-panel p-6 hover:scale-105 transition-all duration-300 cursor-pointer border-orange/20 hover:border-orange/50 group">
                <div className="w-12 h-12 bg-gradient-to-br from-orange to-orange-600 rounded-xl flex items-center justify-center shadow-glow-orange mb-4 group-hover:shadow-glow-orange-intense">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {(isCoach || isAdmin) ? 'Manage Bookings' : 'Book a Session'}
                </h3>
                <p className="text-cyan-700 dark:text-white text-sm">
                  {(isCoach || isAdmin)
                    ? 'View and manage all training sessions and athlete bookings'
                    : 'Schedule 1-on-1 training, group sessions, or video analysis with our coaches'
                  }
                </p>
              </div>
            </Link>

            {/* View Pricing */}
            <Link href="/pricing">
              <div className="command-panel p-6 hover:scale-105 transition-all duration-300 cursor-pointer border-cyan/20 hover:border-cyan/50 group">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan to-blue-500 rounded-xl flex items-center justify-center shadow-glow-cyan mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">View Pricing</h3>
                <p className="text-cyan-700 dark:text-white text-sm">
                  Explore training packages, session rates, and save up to $200 on bundles
                </p>
              </div>
            </Link>

            {/* Meet Coaches */}
            <Link href="/about">
              <div className="command-panel p-6 hover:scale-105 transition-all duration-300 cursor-pointer border-purple-500/20 hover:border-purple-500/50 group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-glow-purple mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Meet Our Coaches</h3>
                <p className="text-cyan-700 dark:text-white text-sm">
                  College & pro experience with proven results in velocity and mechanics
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, value: '500+', label: 'Athletes Trained', color: '#B8301A' },
              { icon: TrendingUp, value: '+5 MPH', label: 'Avg Velocity Gain', color: '#00B4D8' },
              { icon: Award, value: '100+', label: 'Training Drills', color: '#10B981' },
              { icon: Flame, value: '95%', label: 'Goal Achievement', color: '#F59E0B' },
            ].map((stat, index) => (
              <div key={index} className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: stat.color }} />
                <div className="text-3xl font-bold mb-1 text-white">{stat.value}</div>
                <div className="text-sm text-cyan-700 dark:text-white">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <GoogleReviews />

      {/* Section 1: 1-on-1 Training + Monthly Membership */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Image */}
        <Image
          src="/images/Costal At Bat.jpg"
          alt="Softball athlete at bat"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/80 to-slate-950/90" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
              Training Programs
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-white">
              Per-session training or monthly membership — pick what fits your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Dynamic 1-on-1 cards (up to 2) or fallback */}
            {featuredIndividual.length > 0 ? (
              featuredIndividual.slice(0, 2).map((service, idx) => (
                <div key={service.id} className={`glass-card p-0 overflow-hidden ${idx === 0 ? 'border-2 shadow-glow-orange' : ''}`} style={idx === 0 ? { borderColor: '#B8301A' } : undefined}>
                  {service.homepage_image_url && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={service.homepage_image_url}
                        alt={service.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                      {idx === 0 && (
                        <div className="absolute top-4 right-4 px-3 py-1 text-white text-sm font-semibold rounded-full" style={{ backgroundColor: '#B8301A' }}>
                          Most Popular
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-display font-bold mb-2 text-white">{service.name}</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gradient-orange">${(service.price_cents / 100).toFixed(0)}</span>
                      <span className="text-cyan-700 dark:text-white"> / {service.duration_minutes} min</span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-cyan-700 dark:text-white mb-6">{service.description}</p>
                    )}
                    <Link href={bookingHref}>
                      <button className={idx === 0 ? 'btn-primary w-full' : 'btn-ghost w-full'}>
                        {(isCoach || isAdmin) ? 'Manage Sessions' : 'Book Session'}
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Fallback 1-on-1 Card 1 */}
                <div className="glass-card p-0 overflow-hidden border-2 shadow-glow-orange" style={{ borderColor: '#B8301A' }}>
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={PLACEHOLDER_IMAGES.programs.oneOnOne}
                      alt={PLACEHOLDER_IMAGES.programs.alt.oneOnOne}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                    <div className="absolute top-4 right-4 px-3 py-1 text-white text-sm font-semibold rounded-full" style={{ backgroundColor: '#B8301A' }}>
                      Most Popular
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-display font-bold mb-2 text-white">1-on-1 Skills Training</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gradient-orange">$75</span>
                      <span className="text-cyan-700 dark:text-white"> / 60 min</span>
                    </div>
                    <p className="text-sm text-cyan-700 dark:text-white mb-6">Individual technical skills and mechanics training for your sport</p>
                    <Link href={bookingHref}>
                      <button className="btn-primary w-full">{(isCoach || isAdmin) ? 'Manage Sessions' : 'Book Session'}</button>
                    </Link>
                  </div>
                </div>

                {/* Fallback 1-on-1 Card 2 */}
                <div className="glass-card p-0 overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={PLACEHOLDER_IMAGES.features.personalizedTraining}
                      alt="1-on-1 performance session"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-display font-bold mb-2 text-white">1-on-1 Performance</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gradient-orange">$75</span>
                      <span className="text-cyan-700 dark:text-white"> / 60 min</span>
                    </div>
                    <p className="text-sm text-cyan-700 dark:text-white mb-6">Personalized athletic performance and sport-specific development</p>
                    <Link href={bookingHref}>
                      <button className="btn-ghost w-full">{(isCoach || isAdmin) ? 'Manage Sessions' : 'Book Session'}</button>
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* Monthly Membership — always shown */}
            <div className="glass-card p-0 overflow-hidden border border-purple-500/30">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={PLACEHOLDER_IMAGES.programs.monthly}
                  alt={PLACEHOLDER_IMAGES.programs.alt.monthly}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                <div className="absolute top-4 right-4 px-3 py-1 text-white text-sm font-semibold rounded-full bg-purple-600">
                  Best Value
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-display font-bold mb-2 text-white">Monthly Membership</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gradient-orange">$60</span>
                  <span className="text-cyan-700 dark:text-white"> / mo</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    'Unlimited group session access',
                    'Discounted 1-on-1 sessions',
                    'Priority scheduling',
                    'PSP.Pro dashboard access',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#8B5CF6' }} />
                      <span className="text-white text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/pricing">
                  <button className="w-full px-6 py-3 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors">View Plans</button>
                </Link>
              </div>
            </div>
          </div>

          {/* Package Savings */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="p-6 rounded-xl bg-cyan-900/30 border border-orange/20 text-center">
              <p className="text-white font-semibold mb-3">Save with Session Packages</p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-cyan-700 dark:text-white">
                <p>5 Sessions — <span className="text-orange font-bold">$350</span> <span className="text-cyan text-xs">(save $25)</span></p>
                <p>10 Sessions — <span className="text-orange font-bold">$675</span> <span className="text-cyan text-xs">(save $75)</span></p>
                <p>20 Sessions — <span className="text-orange font-bold">$1,300</span> <span className="text-cyan text-xs">(save $200)</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Group Training */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Image */}
        <Image
          src="/images/over the shoulder psp pitching.jpg"
          alt="PSP indoor pitching session"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/80 to-slate-950/90" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
              Group Training
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-white">
              Train with teammates in high-energy group sessions led by our coaches.
            </p>
          </div>

          <div className={`grid gap-8 ${featuredGroup.length === 1 ? 'max-w-lg mx-auto' : featuredGroup.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'}`}>
            {featuredGroup.length > 0 ? (
              featuredGroup.slice(0, 3).map((service) => (
                <div key={service.id} className="glass-card p-0 overflow-hidden group">
                  {service.homepage_image_url && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={service.homepage_image_url}
                        alt={service.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-display font-bold mb-2 text-white">{service.name}</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gradient-orange">${(service.price_cents / 100).toFixed(0)}</span>
                      <span className="text-cyan-700 dark:text-white"> / {service.duration_minutes} min</span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-cyan-700 dark:text-white mb-4">{service.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-cyan-700 dark:text-white mb-6">
                      <Users className="w-4 h-4 text-cyan" />
                      <span>Max {service.max_participants} athletes</span>
                    </div>
                    <Link href={bookingHref}>
                      <button className="btn-ghost w-full">{(isCoach || isAdmin) ? 'Manage Sessions' : 'Join Session'}</button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              /* Fallback group cards */
              <>
                <div className="glass-card p-0 overflow-hidden group">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={PLACEHOLDER_IMAGES.programs.group}
                      alt={PLACEHOLDER_IMAGES.programs.alt.group}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-display font-bold mb-2 text-white">Speed & Agility</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gradient-orange">$50</span>
                      <span className="text-cyan-700 dark:text-white"> / 90 min</span>
                    </div>
                    <p className="text-sm text-cyan-700 dark:text-white mb-4">Small group speed training and athletic development</p>
                    <div className="flex items-center gap-2 text-sm text-cyan-700 dark:text-white mb-6">
                      <Users className="w-4 h-4 text-cyan" />
                      <span>Max 6 athletes</span>
                    </div>
                    <Link href={bookingHref}>
                      <button className="btn-ghost w-full">{(isCoach || isAdmin) ? 'Manage Sessions' : 'Join Session'}</button>
                    </Link>
                  </div>
                </div>

                <div className="glass-card p-0 overflow-hidden group">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={PLACEHOLDER_IMAGES.features.drillBank}
                      alt="Small group training"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-display font-bold mb-2 text-white">Small Group Training</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gradient-orange">$40</span>
                      <span className="text-cyan-700 dark:text-white"> / 75 min</span>
                    </div>
                    <p className="text-sm text-cyan-700 dark:text-white mb-4">Semi-private training session (2-4 athletes)</p>
                    <div className="flex items-center gap-2 text-sm text-cyan-700 dark:text-white mb-6">
                      <Users className="w-4 h-4 text-cyan" />
                      <span>Max 4 athletes</span>
                    </div>
                    <Link href={bookingHref}>
                      <button className="btn-ghost w-full">{(isCoach || isAdmin) ? 'Manage Sessions' : 'Join Session'}</button>
                    </Link>
                  </div>
                </div>

                <div className="glass-card p-0 overflow-hidden group">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={PLACEHOLDER_IMAGES.features.velocityTracking}
                      alt="Strength and conditioning"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-display font-bold mb-2 text-white">Strength & Conditioning</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-gradient-orange">$65</span>
                      <span className="text-cyan-700 dark:text-white"> / 60 min</span>
                    </div>
                    <p className="text-sm text-cyan-700 dark:text-white mb-4">Sport-specific strength training and conditioning</p>
                    <div className="flex items-center gap-2 text-sm text-cyan-700 dark:text-white mb-6">
                      <Users className="w-4 h-4 text-cyan" />
                      <span>Max 4 athletes</span>
                    </div>
                    <Link href={bookingHref}>
                      <button className="btn-ghost w-full">{(isCoach || isAdmin) ? 'Manage Sessions' : 'Join Session'}</button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-12 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-6" style={{ color: '#B8301A' }} />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-white">
              Located in Virginia Beach
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-cyan-700 dark:text-white">
              Proudly serving athletes in Virginia Beach, Norfolk, Chesapeake, and Hampton Roads.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-cyan-700 dark:text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#B8301A' }} />
                <span className="text-white">Mon-Fri: 3PM - 9PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#B8301A' }} />
                <span className="text-white">Sat: 9AM - 5PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">
            Ready to Level Up?
          </h2>
          <p className="text-xl mb-8 text-cyan-700 dark:text-white">
            Join hundreds of athletes who are improving their game with data-driven training.
          </p>
          <Link href={profile ? ((isCoach || isAdmin) ? '/admin' : '/locker') : '/get-started'}>
            <button className="btn-primary text-lg px-10 py-5 flex items-center gap-3 mx-auto">
              <span className="text-white">{profile ? 'Go to Dashboard' : 'Join the Team'}</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-200/40 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6" style={{ color: '#B8301A' }} />
                <span className="font-display font-bold text-lg" style={{ color: footerHeadingColor }}>PSP.Pro</span>
              </div>
              <p className="text-sm text-cyan-700 dark:text-white">
                Progression Over Perfection
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: footerHeadingColor }}>Platform</h4>
              <ul className="space-y-2 text-sm text-cyan-700 dark:text-white">
                <li><Link href="/locker" className="hover:text-orange transition-colors">Dashboard</Link></li>
                <li><Link href="/drills" className="hover:text-orange transition-colors">Membership Training</Link></li>
                <li><Link href="/login" className="hover:text-orange transition-colors">Login</Link></li>
                <li><Link href="/signup" className="hover:text-orange transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: footerHeadingColor }}>Company</h4>
              <ul className="space-y-2 text-sm text-cyan-700 dark:text-white">
                <li><Link href="/about" className="hover:text-orange transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-orange transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: footerHeadingColor }}>Contact</h4>
              <ul className="space-y-2 text-sm text-cyan-700 dark:text-white">
                <li>Virginia Beach, VA</li>
                <li>info@propersports.pro</li>
                <li>(757) 555-0100</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-200/40 pt-8 text-center text-sm text-cyan-700 dark:text-white">
            <p>&copy; {new Date().getFullYear()} Proper Sports Performance. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Funnel Navigation */}
      <FunnelNav />
    </main>
  )
}
