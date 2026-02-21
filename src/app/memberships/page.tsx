'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Zap, Check, X, ArrowRight, Star, Shield, TrendingUp,
  BarChart3, Dumbbell, BookOpen, Percent, Users, MessageCircle,
  ChevronDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { FunnelNav } from '@/components/navigation/funnel-nav'

const COMPARISON_FEATURES = [
  { label: 'PSP Pro Dashboard', basic: 'Limited', elite: 'Full Access', icon: BarChart3 },
  { label: 'Drill Library', basic: 'Foundational', elite: 'Complete Library', icon: Dumbbell },
  { label: 'Proper Pitching Course', basic: 'Purchase', elite: 'Included', icon: BookOpen },
  { label: 'Service Discount', basic: null, elite: '10% Off', icon: Percent },
  { label: 'Priority Academy Registration', basic: null, elite: 'Yes', icon: Star },
  { label: 'Monthly Member Q&A', basic: null, elite: 'Yes', icon: MessageCircle },
]

export default function MembershipsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [currentTier, setCurrentTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFaq, setShowFaq] = useState<number | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, full_name, membership_tier')
          .eq('id', user.id)
          .single()
        setProfile(prof)
        setCurrentTier(prof?.membership_tier || 'basic')
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const handleJoinFree = () => {
    if (profile) {
      router.push('/locker')
    } else {
      router.push('/signup')
    }
  }

  const handleUpgradeElite = () => {
    if (profile) {
      // TODO: Integrate Stripe Checkout for Elite subscription
      router.push('/settings?upgrade=elite')
    } else {
      router.push('/signup?plan=elite')
    }
  }

  const faqs = [
    {
      q: 'Can I cancel my Elite membership anytime?',
      a: 'Yes. You can cancel anytime from your account settings. Your access continues until the end of the current billing period. No data is ever deleted — your metrics and progress are always saved.',
    },
    {
      q: 'What happens if I downgrade from Elite to Basic?',
      a: 'Your advanced dashboard features will be locked, but all your historical data stays intact. You can upgrade again at any time to regain full access.',
    },
    {
      q: 'Does the 10% discount apply to everything?',
      a: 'The discount applies to Lessons, Academies, and Camps booked through PSP.Pro. It does not apply to merchandise or one-time digital downloads.',
    },
    {
      q: 'Is the Proper Pitching Course really free with Elite?',
      a: 'Yes! The full Proper Pitching Development Course is included at no additional cost with your Elite membership.',
    },
  ]

  return (
    <>
      <InfoSidebar />
      <FunnelNav desktopOnly />
      <div className="min-h-screen">
        {/* ─── Hero Section ──────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full blur-[200px] opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(0, 180, 216, 0.4) 0%, rgba(255, 107, 0, 0.2) 50%, transparent 70%)' }}
          />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/20 border border-orange/30 text-orange text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              Proper Sports Performance
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              The Proper Pitching{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-orange">
                Development System
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              A structured development pathway designed to accelerate your athlete's progress with data-driven training and professional coaching.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleJoinFree}
                className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
              >
                Join Free
              </button>
              <button
                onClick={handleUpgradeElite}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange to-orange/80 text-white font-bold shadow-glow-orange hover:shadow-glow-orange/50 transition-all flex items-center justify-center gap-2"
              >
                Upgrade to Elite
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ─── Pricing Cards ────────────────────────────────────────── */}
        <section className="relative py-20 px-4 bg-white dark:bg-slate-950">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
                Choose Your Path
              </h2>
              <p className="text-lg text-slate-600 dark:text-white/60">
                Start free. Upgrade when you're ready to accelerate.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Basic Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">BASIC</h3>
                  <p className="text-sm text-slate-500 dark:text-white/50">Free forever</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">$0</span>
                  <span className="text-slate-500 dark:text-white/50">/month</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Access to PSP Pro Dashboard (Limited Version)',
                    'Track Key Performance Metrics',
                    'Foundational Drill Library',
                    'Ability to Enroll in Courses',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleJoinFree}
                  disabled={currentTier === 'basic'}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    currentTier === 'basic'
                      ? 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/40 cursor-default'
                      : 'bg-slate-900 dark:bg-white/10 text-white hover:bg-slate-800 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20'
                  }`}
                >
                  {currentTier === 'basic' ? 'Current Plan' : profile ? 'Switch to Basic' : 'Get Started Free'}
                </button>
              </div>

              {/* Elite Card */}
              <div className="relative rounded-2xl border-2 border-orange bg-white dark:bg-white/5 p-8 flex flex-col shadow-glow-orange/20">
                {/* Popular badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange to-orange/80 text-white text-sm font-bold rounded-full shadow-lg">
                  Most Popular
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">ELITE</h3>
                  <p className="text-sm text-slate-500 dark:text-white/50">Monthly subscription</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">$60</span>
                  <span className="text-slate-500 dark:text-white/50">/month</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Full PSP Pro Dashboard Access',
                    '10% Off Lessons, Camps, and Academies',
                    'FREE Proper Pitching Development Course',
                    'Advanced Drill Library',
                    'Priority Enrollment Access',
                    'Monthly Member Q&A Sessions',
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleUpgradeElite}
                  disabled={currentTier === 'elite'}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    currentTier === 'elite'
                      ? 'bg-orange/20 text-orange cursor-default'
                      : 'bg-gradient-to-r from-orange to-orange/80 text-white hover:shadow-glow-orange/50 shadow-lg'
                  }`}
                >
                  {currentTier === 'elite' ? 'Current Plan' : 'Upgrade to Elite'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Comparison Table ─────────────────────────────────────── */}
        <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white text-center mb-12">
              Compare Plans
            </h2>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <div className="text-sm font-bold text-slate-900 dark:text-white">Feature</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white text-center">Basic</div>
                <div className="text-sm font-bold text-orange text-center">Elite</div>
              </div>

              {/* Rows */}
              {COMPARISON_FEATURES.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.label}
                    className={`grid grid-cols-3 gap-4 p-4 items-center ${
                      idx < COMPARISON_FEATURES.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400 dark:text-white/40 flex-shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-white/70">{feature.label}</span>
                    </div>
                    <div className="text-center">
                      {feature.basic ? (
                        <span className="text-sm text-slate-500 dark:text-white/50">{feature.basic}</span>
                      ) : (
                        <X className="w-4 h-4 text-slate-300 dark:text-white/20 mx-auto" />
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-orange">{feature.elite}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── Value Positioning ────────────────────────────────────── */}
        <section className="py-20 px-4 bg-white dark:bg-slate-950">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-orange-50 dark:from-cyan-950/30 dark:to-orange-950/30 border border-cyan-200/40 dark:border-white/10 p-8 md:p-12 text-center">
              <TrendingUp className="w-12 h-12 text-orange mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                The Elite Membership Pays for Itself
              </h2>
              <p className="text-lg text-slate-600 dark:text-white/70 leading-relaxed mb-8">
                If your athlete attends just one academy per year, the Elite membership pays for itself through service discounts alone — while providing year-round development tracking and structured progression.
              </p>
              <button
                onClick={handleUpgradeElite}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange to-orange/80 text-white font-bold shadow-lg hover:shadow-glow-orange/50 transition-all inline-flex items-center gap-2"
              >
                Start Your Elite Journey
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────── */}
        <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => setShowFaq(showFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-900 dark:text-white pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${showFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {showFaq === idx && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
