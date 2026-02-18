'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, Users, MapPin, Loader2, ArrowRight, CheckCircle, Star, Zap } from 'lucide-react'

interface OrgData {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string | null
  tagline: string | null
  hero_headline: string | null
  hero_subheadline: string | null
  about_text: string | null
  sport_focus: string[] | null
  allow_self_signup: boolean
  coaches: {
    id: string
    role: string
    user: {
      id: string
      full_name: string
      avatar_url: string | null
      role: string
    }
  }[]
}

export default function OrgLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [org, setOrg] = useState<OrgData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/org/by-slug/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.org) setOrg(data.org)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (notFound || !org) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <Building2 className="w-12 h-12 text-slate-600" />
        <h1 className="text-2xl font-bold">Organization Not Found</h1>
        <p className="text-white/60">The organization <span className="font-mono text-cyan-400">/{slug}</span> doesn't exist or is inactive.</p>
        <Link href="/" className="mt-2 text-cyan-400 hover:text-cyan-300 underline underline-offset-4">
          Back to PSP.Pro
        </Link>
      </div>
    )
  }

  const primary = org.primary_color || '#f97316'
  const secondary = org.secondary_color || '#06b6d4'

  const heroHeadline = org.hero_headline || `Train with ${org.name}`
  const heroSub = org.hero_subheadline || org.tagline || 'Elite sports performance coaching tailored to your goals.'

  const sports = org.sport_focus?.length
    ? org.sport_focus.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' · ')
    : 'Multi-Sport Training'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {org.logo_url ? (
              <Image src={org.logo_url} alt={org.name} width={36} height={36} className="rounded-lg object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                style={{ backgroundColor: primary }}>
                {org.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-lg">{org.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/booking?org=${org.id}`}
              className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              Book Now
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Gradient background using org colors */}
        <div className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, ${primary}40, transparent 60%),
                        radial-gradient(ellipse at 70% 50%, ${secondary}30, transparent 60%)`
          }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {org.tagline && (
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: secondary }}>
              {org.tagline}
            </p>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
            {heroHeadline}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            {heroSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={`/booking?org=${org.id}`}
              className="px-8 py-4 rounded-2xl font-bold text-white text-lg flex items-center gap-2 justify-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              Book a Session <ArrowRight className="w-5 h-5" />
            </Link>
            {org.allow_self_signup && (
              <Link
                href={`/get-started?org=${org.id}`}
                className="px-8 py-4 rounded-2xl font-semibold text-white/80 border border-white/20 hover:border-white/40 transition-colors"
              >
                Join the Team
              </Link>
            )}
          </div>
          {/* Sport focus badge */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Zap className="w-4 h-4" style={{ color: secondary }} />
            <span className="text-sm text-white/50">{sports}</span>
          </div>
        </div>
      </section>

      {/* ── Why train here ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: <Star className="w-5 h-5" />, title: 'Expert Coaching', body: 'Certified coaches focused on your sport-specific development and performance gains.' },
              { icon: <CheckCircle className="w-5 h-5" />, title: 'Proven Results', body: 'Data-driven training with measurable metrics tracked every session.' },
              { icon: <Users className="w-5 h-5" />, title: 'Community', body: 'Train alongside other dedicated athletes in a supportive, competitive environment.' },
            ].map(card => (
              <div key={card.title} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: `${primary}30`, color: primary }}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-lg">{card.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About / custom text ── */}
      {org.about_text && (
        <section className="py-16 px-4 bg-white/3">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold">About {org.name}</h2>
            <p className="text-white/70 leading-relaxed text-lg">{org.about_text}</p>
          </div>
        </section>
      )}

      {/* ── Coaches ── */}
      {org.coaches?.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Meet the Coaches</h2>
              <p className="text-white/50 mt-2">Expert trainers dedicated to your success</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {org.coaches.map(m => (
                <div key={m.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                  {m.user.avatar_url ? (
                    <Image src={m.user.avatar_url} alt={m.user.full_name} width={52} height={52}
                      className="rounded-full object-cover w-13 h-13 flex-shrink-0" />
                  ) : (
                    <div className="w-13 h-13 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                      style={{ backgroundColor: `${primary}30`, color: primary, width: 52, height: 52 }}>
                      {m.user.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{m.user.full_name}</p>
                    <p className="text-sm capitalize" style={{ color: secondary }}>{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white mx-auto"
            style={{ backgroundColor: primary }}>
            {org.name.charAt(0)}
          </div>
          <h2 className="text-3xl font-bold">Ready to Level Up?</h2>
          <p className="text-white/60">Book your first session with {org.name} today. No commitment required.</p>
          <Link
            href={`/booking?org=${org.id}`}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-white text-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            Book Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/30">
          <p>© {new Date().getFullYear()} {org.name}. Powered by <Link href="/" className="hover:text-white/60 transition-colors underline underline-offset-2">PSP.Pro</Link></p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href={`/booking?org=${org.id}`} className="hover:text-white/60 transition-colors">Book a Session</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
