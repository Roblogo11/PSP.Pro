'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Package, ArrowRight, HelpCircle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { FunnelNav } from '@/components/navigation/funnel-nav'

export default function MembershipRequiredPage() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'local' })
    router.push('/')
  }

  return (
    <div className="flex min-h-screen">
      <InfoSidebar />
      <main className="flex-1 px-3 py-4 md:p-8 pb-24 lg:pb-8">
        <div className="max-w-2xl mx-auto mt-12">
          {/* Main Card */}
          <div className="command-panel p-8 md:p-12 text-center border-orange/30">
            <div className="w-20 h-20 bg-orange/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-orange" />
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Membership <span className="text-gradient-orange">Required</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-white/80 mb-8 max-w-lg mx-auto">
              Your account is set up, but you need an active membership or lesson package to access the training dashboard.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/pricing" className="btn-primary px-8 py-4 flex items-center gap-2 justify-center">
                <Package className="w-5 h-5" />
                <span>View Memberships & Pricing</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
              <Link href="/faq" className="inline-flex items-center gap-2 text-cyan hover:text-cyan-400 font-semibold transition-colors">
                <HelpCircle className="w-4 h-4" />
                <span>Browse FAQ</span>
              </Link>
              <span className="hidden sm:inline text-slate-400">|</span>
              <Link href="/contact" className="inline-flex items-center gap-2 text-cyan hover:text-cyan-400 font-semibold transition-colors">
                <span>Contact Us</span>
              </Link>
              <span className="hidden sm:inline text-slate-400">|</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* What You Get */}
          <div className="command-panel p-6 md:p-8 mt-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              What You Get With a Membership
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Personalized Training', desc: 'Custom plans built around your goals and position' },
                { title: 'Video Analysis', desc: 'Review your mechanics with pro-level breakdowns' },
                { title: 'Progress Tracking', desc: 'Track velocity, strength, and skill improvements' },
                { title: 'Coach Feedback', desc: 'Direct access to coaching staff between sessions' },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan/5 border border-cyan-200/40 dark:border-cyan/20">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-white/70">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <FunnelNav desktopOnly />
    </div>
  )
}
