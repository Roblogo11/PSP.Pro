'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Zap, Users, Video, Activity, Package, CheckCircle, Award, Info, Rocket, Mail, ArrowRight, LayoutDashboard, Shield, RefreshCw } from 'lucide-react'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/lib/hooks/use-user-role'
import {
  DEFAULT_SERVICES,
  DEFAULT_PACKAGES,
  type PricingService,
  type PricingPackage,
} from '@/lib/pricing-defaults'

// Format price from cents — drop .00, keep other decimals
function formatPrice(cents: number): string {
  const dollars = cents / 100
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`
}

// Split description into bullet points
function splitDescription(desc: string | null): string[] {
  if (!desc) return []
  return desc.split('\n').filter((line) => line.trim() !== '')
}

export default function PricingPage() {
  const { profile, isCoach, isAdmin } = useUserRole()
  const [services, setServices] = useState<PricingService[]>(DEFAULT_SERVICES)
  const [packages, setPackages] = useState<PricingPackage[]>(DEFAULT_PACKAGES)
  const [loading, setLoading] = useState(true)

  // Member package state
  const [memberPackage, setMemberPackage] = useState<{
    package_id: string | null
    sessions_total: number
    sessions_used: number
    expires_at: string
    package_name?: string
  } | null>(null)

  // Dynamic CTA based on auth state
  const ctaHref = (isCoach || isAdmin) ? '/admin/services' : profile ? '/booking' : '/get-started'
  const ctaLabel = (isCoach || isAdmin) ? 'Manage Services' : profile ? 'Book Now' : 'Join the Team'

  useEffect(() => {
    async function fetchPricing() {
      try {
        const supabase = createClient()

        const [servicesRes, packagesRes] = await Promise.all([
          supabase
            .from('services')
            .select('id, name, description, duration_minutes, price_cents, category, max_participants, is_active')
            .eq('is_active', true)
            .order('price_cents', { ascending: true }),
          supabase
            .from('training_packages')
            .select('id, name, description, sessions_included, price_cents, validity_days, is_active')
            .eq('is_active', true)
            .order('sessions_included', { ascending: true }),
        ])

        if (servicesRes.data && servicesRes.data.length > 0) {
          setServices(servicesRes.data)
        }
        if (packagesRes.data && packagesRes.data.length > 0) {
          setPackages(packagesRes.data)
        }
      } catch (err) {
        console.error('Error fetching pricing:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPricing()
  }, [])

  // Fetch member's active package
  useEffect(() => {
    if (!profile?.id || isCoach || isAdmin) return

    async function fetchMemberPackage() {
      const supabase = createClient()
      const { data } = await supabase
        .from('athlete_packages')
        .select('package_id, sessions_total, sessions_used, expires_at')
        .eq('athlete_id', profile!.id)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        // Try to get the package name
        let packageName: string | undefined
        if (data.package_id) {
          const { data: pkgData } = await supabase
            .from('training_packages')
            .select('name')
            .eq('id', data.package_id)
            .single()
          packageName = pkgData?.name
        }
        setMemberPackage({ ...data, package_name: packageName })
      }
    }

    fetchMemberPackage()
  }, [profile?.id, isCoach, isAdmin])

  // Group services by category
  const individualServices = services.filter((s) => s.category === 'individual')
  const groupServices = services.filter((s) => s.category === 'group')
  const specialtyServices = services.filter((s) => s.category === 'specialty')

  // Compute quick stats
  const cheapestIndividual = individualServices.length > 0
    ? Math.min(...individualServices.map((s) => s.price_cents))
    : 7500
  const cheapestGroup = groupServices.length > 0
    ? Math.min(...groupServices.map((s) => s.price_cents))
    : 5000
  const maxSavings = packages.length > 0
    ? Math.max(
        ...packages.map((p) => p.sessions_included * cheapestIndividual - p.price_cents)
      )
    : 20000

  // Tailwind needs full class names at build time — no dynamic interpolation.
  // These maps provide the classes for alternating orange/cyan styling.
  const colorStyles = {
    orange: {
      border: 'border-orange/20 hover:border-orange/40',
      borderStatic: 'border-orange/20',
      text: 'text-orange',
      check: 'text-orange',
      btnGhost: 'btn-ghost w-full border-orange/30 hover:border-orange/50',
    },
    cyan: {
      border: 'border-cyan/20 hover:border-cyan/40',
      borderStatic: 'border-cyan/20',
      text: 'text-cyan',
      check: 'text-cyan',
      btnGhost: 'btn-ghost w-full border-cyan/30 hover:border-cyan/50',
    },
  } as const
  type ColorKey = keyof typeof colorStyles

  return (
    <div className="flex min-h-screen">
      <InfoSidebar />
      <main className="flex-1 pb-24">
      {/* Hero Image Banner */}
      <div className="relative px-6 py-20 md:py-28 overflow-hidden">
        <Image
          src="/images/psp pitcher.jpg"
          alt="PSP pitcher training"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/80 to-slate-950/90" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Training <span className="text-gradient-orange">Programs</span>
          </h1>
          <p className="text-xl text-white">
            Elite softball, basketball & soccer training in Virginia Beach
          </p>
        </div>
      </div>

      <div className="px-3 py-4 md:p-8">
      {/* Member Package Status Banner */}
      {profile && !isCoach && !isAdmin && memberPackage && (
        <div className="command-panel mb-6 border-green-500/30 bg-gradient-to-r from-green-500/5 to-cyan/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {memberPackage.package_name || 'Your Plan'}
                  </h3>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                    Active
                  </span>
                </div>
                <p className="text-sm text-cyan-700 dark:text-white/70">
                  {memberPackage.sessions_total - memberPackage.sessions_used} of {memberPackage.sessions_total} sessions remaining
                  {' '}&bull;{' '}
                  Expires {new Date(memberPackage.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href="/booking" className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5 flex-1 sm:flex-none justify-center">
                Book Session
              </Link>
              <Link href="/booking" className="btn-ghost text-sm px-4 py-2 flex items-center gap-1.5 flex-1 sm:flex-none justify-center">
                <RefreshCw className="w-3.5 h-3.5" />
                Renew
              </Link>
            </div>
          </div>
          {/* Sessions progress bar */}
          <div className="mt-4">
            <div className="w-full h-2 bg-cyan-900/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-cyan rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, ((memberPackage.sessions_total - memberPackage.sessions_used) / memberPackage.sessions_total) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Zap, label: 'Online Course', value: formatPrice(cheapestIndividual), color: '#B8301A' },
          { icon: Users, label: 'Group Sessions', value: formatPrice(cheapestGroup), color: '#00B4D8' },
          { icon: Package, label: 'Save up to', value: formatPrice(maxSavings), color: '#10B981' },
          { icon: Award, label: 'Pro Training', value: '100%', color: '#F59E0B' },
        ].map((stat, index) => (
          <div key={index} className="command-panel hover:border-orange/30 transition-all">
            <stat.icon className="w-8 h-8 mb-3 mx-auto" style={{ color: stat.color }} />
            <div className="text-2xl font-bold text-center text-gradient-orange">{stat.value}</div>
            <div className="text-sm text-center">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Online Course */}
      {individualServices.length > 0 && (
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Online Course</h2>
        </div>

        <div className={`grid gap-6 ${individualServices.length >= 2 ? 'md:grid-cols-2' : ''}`}>
          {individualServices.map((service, idx) => {
            const colorKey: ColorKey = idx % 2 === 0 ? 'orange' : 'cyan'
            const cs = colorStyles[colorKey]
            const bullets = splitDescription(service.description)
            return (
              <div
                key={service.id}
                className={`p-6 bg-cyan-900/20 rounded-xl border ${cs.border} transition-all`}
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{service.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={`text-4xl font-bold ${cs.text}`}>
                    {formatPrice(service.price_cents)}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">/ {service.duration_minutes} minutes</span>
                </div>
                {bullets.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {bullets.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${cs.check} flex-shrink-0`} />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link href={ctaHref}>
                  <button className={idx === 0 ? 'btn-primary w-full' : cs.btnGhost}>
                    {(isCoach || isAdmin) ? 'Manage Services' : `Book ${service.name}`}
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
      )}

      {/* Group Training */}
      {groupServices.length > 0 && (
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Group Training</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {groupServices.map((service) => {
            const bullets = splitDescription(service.description)
            return (
              <div key={service.id} className="p-6 bg-cyan-900/20 rounded-xl border border-cyan/20">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{service.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-cyan">
                    {formatPrice(service.price_cents)}
                  </span>
                  <span>/ athlete &bull; {service.duration_minutes} minutes</span>
                </div>
                {service.max_participants > 1 && (
                  <p className="mb-6">Max {service.max_participants} athletes per session</p>
                )}

                {bullets.length > 0 && (
                  <div className={`grid gap-4 mb-6 ${bullets.length > 3 ? 'grid-cols-2' : ''}`}>
                    <ul className="space-y-2">
                      {bullets.slice(0, Math.ceil(bullets.length / 2)).map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    {bullets.length > 3 && (
                      <ul className="space-y-2">
                        {bullets.slice(Math.ceil(bullets.length / 2)).map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-cyan flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <Link href={ctaHref}>
                  <button className="btn-ghost w-full border-cyan/30 hover:border-cyan/50">
                    {(isCoach || isAdmin) ? 'Manage Services' : profile ? 'Book Group Training' : 'Join Group Training'}
                  </button>
                </Link>
              </div>
            )
          })}

          {/* Group Training Image */}
          <div className="relative rounded-xl overflow-hidden min-h-[300px]">
            <Image
              src="/images/Praticing Soccer Drills.jpg"
              alt="PSP group training session"
              fill
              quality={80}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </div>
        </div>
      </div>
      )}

      {/* Training Packages */}
      {packages.length > 0 && (
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Training Packages</h2>
        </div>

        <div className={`grid gap-6 ${packages.length >= 3 ? 'md:grid-cols-3' : packages.length === 2 ? 'md:grid-cols-2' : ''}`}>
          {packages.map((pack, index) => {
            const regularCents = pack.sessions_included * cheapestIndividual
            const saveCents = regularCents - pack.price_cents
            const perSessionCents = pack.price_cents / pack.sessions_included
            // Middle package is featured (or the one with biggest savings if only 2)
            const isFeatured = packages.length >= 3
              ? index === Math.floor(packages.length / 2)
              : saveCents === Math.max(...packages.map((p) => p.sessions_included * cheapestIndividual - p.price_cents))
            const isCurrentPlan = memberPackage?.package_id === pack.id

            return (
              <div
                key={pack.id}
                className={`p-6 bg-cyan-900/20 rounded-xl border transition-all relative ${
                  isCurrentPlan
                    ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                    : isFeatured
                    ? 'border-orange shadow-glow-orange'
                    : 'border-cyan-700/50 hover:border-orange/30'
                }`}
              >
                {isCurrentPlan && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      Your Plan
                    </span>
                  </div>
                )}
                {!isCurrentPlan && isFeatured && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 bg-orange text-white text-xs font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">{pack.name}</h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-orange mb-1">{formatPrice(pack.price_cents)}</div>
                  <div className="text-sm line-through">{formatPrice(regularCents)} value</div>
                  {saveCents > 0 && (
                    <div className="text-cyan font-semibold">Save {formatPrice(saveCents)}</div>
                  )}
                </div>
                <div className="text-center mb-6">
                  <p className="text-sm">{formatPrice(perSessionCents)} per session</p>
                </div>
                <Link href={ctaHref}>
                  <button className={isCurrentPlan || isFeatured ? 'btn-primary w-full' : 'btn-ghost w-full'}>
                    {(isCoach || isAdmin) ? 'Manage Packages' : isCurrentPlan ? 'Renew Package' : 'Purchase Pack'}
                  </button>
                </Link>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-cyan-900/20 rounded-xl border border-orange/10">
          <p className="text-center">
            <span className="font-bold text-orange">Package Benefits:</span> Mix pitching & hitting &bull; Transfer to family &bull; Pause for injuries &bull; Satisfaction guaranteed
          </p>
        </div>
      </div>
      )}

      {/* Specialty Services */}
      {specialtyServices.length > 0 && (
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Specialty Services</h2>
        </div>

        <div className={`grid gap-6 ${specialtyServices.length >= 2 ? 'md:grid-cols-2' : ''}`}>
          {specialtyServices.map((service, idx) => {
            const colorKey: ColorKey = idx % 2 === 0 ? 'orange' : 'cyan'
            const cs = colorStyles[colorKey]
            const IconComponent = idx % 2 === 0 ? Video : Activity
            return (
              <div key={service.id} className={`p-6 bg-cyan-900/20 rounded-xl border ${cs.borderStatic}`}>
                <IconComponent className={`w-10 h-10 ${cs.text} mb-4`} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{service.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={`text-3xl font-bold ${cs.text}`}>
                    {formatPrice(service.price_cents)}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">/ {service.duration_minutes} minutes</span>
                </div>
                {service.description && (
                  <p className="mb-6">{service.description}</p>
                )}
                <Link href={ctaHref}>
                  <button className={cs.btnGhost}>
                    {(isCoach || isAdmin) ? 'Manage Services' : `Book ${service.name}`}
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
      )}

      {/* Continue Exploring */}
      <div className="command-panel">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Continue Exploring</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href={profile ? (isCoach || isAdmin ? '/admin' : '/locker') : '/get-started'} className="glass-card-hover p-6 text-center group">
            {profile ? <LayoutDashboard className="w-8 h-8 text-cyan mb-3 mx-auto" /> : <Rocket className="w-8 h-8 text-cyan mb-3 mx-auto" />}
            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-cyan transition-colors">
              {profile ? 'Your Dashboard' : 'Join the Team'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-white/80 mt-2">
              {profile ? 'Back to your training hub' : 'Join our training family'}
            </p>
            <div className="inline-flex items-center gap-1 text-cyan text-sm font-semibold mt-3">
              <span>{profile ? 'Go to Dashboard' : 'Join Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link href="/about" className="glass-card-hover p-6 text-center group">
            <Info className="w-8 h-8 text-orange mb-3 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-orange transition-colors">About PSP</h3>
            <p className="text-sm text-slate-500 dark:text-white/80 mt-2">Learn about our mission</p>
            <div className="inline-flex items-center gap-1 text-orange text-sm font-semibold mt-3">
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link href="/contact" className="glass-card-hover p-6 text-center group">
            <Mail className="w-8 h-8 text-cyan mb-3 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-cyan transition-colors">Contact Us</h3>
            <p className="text-sm text-slate-500 dark:text-white/80 mt-2">Questions? We&apos;re here to help</p>
            <div className="inline-flex items-center gap-1 text-cyan text-sm font-semibold mt-3">
              <span>Reach Out</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
      </div>
      </main>

      <FunnelNav desktopOnly />
    </div>
  )
}
