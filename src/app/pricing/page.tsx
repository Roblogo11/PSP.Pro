'use client'

import Link from 'next/link'
import { Zap, Users, Video, Activity, Package, CheckCircle, Award } from 'lucide-react'
import { InfoSidebar } from '@/components/layout/info-sidebar'

export default function PricingPage() {
  return (
    <div className="flex min-h-screen">
      <InfoSidebar />
      <main className="flex-1 p-4 md:p-8 pb-20 lg:pb-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
          Training <span className="text-gradient-orange">Programs</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Elite baseball & softball training in Virginia Beach
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Zap, label: '1-on-1 Training', value: '$75', color: '#B8301A' },
          { icon: Users, label: 'Group Sessions', value: '$50', color: '#00B4D8' },
          { icon: Package, label: 'Save up to', value: '$200', color: '#10B981' },
          { icon: Award, label: 'Pro Training', value: '100%', color: '#F59E0B' },
        ].map((stat, index) => (
          <div key={index} className="command-panel hover:border-orange/30 transition-all">
            <stat.icon className="w-8 h-8 mb-3 mx-auto" style={{ color: stat.color }} />
            <div className="text-2xl font-bold text-white text-center">{stat.value}</div>
            <div className="text-sm text-slate-400 text-center">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Individual Training */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-white">1-on-1 Training</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-800/30 rounded-xl border border-orange/20 hover:border-orange/40 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">Pitching Session</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-orange">$75</span>
              <span className="text-slate-400">/ 60 minutes</span>
            </div>
            <ul className="space-y-2 mb-6">
              {['Velocity development', 'Mechanics analysis', 'Command training', 'Video review included'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-orange flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/get-started">
              <button className="btn-primary w-full">Book Pitching Session</button>
            </Link>
          </div>

          <div className="p-6 bg-slate-800/30 rounded-xl border border-cyan/20 hover:border-cyan/40 transition-all">
            <h3 className="text-xl font-bold text-white mb-2">Hitting Session</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-cyan">$75</span>
              <span className="text-slate-400">/ 60 minutes</span>
            </div>
            <ul className="space-y-2 mb-6">
              {['Exit velocity training', 'Swing mechanics', 'Approach development', 'Video analysis included'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-cyan flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/get-started">
              <button className="btn-ghost w-full border-cyan/30 hover:border-cyan/50">Book Hitting Session</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Group Training */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold text-white">Group Training</h2>
        </div>

        <div className="p-6 bg-slate-800/30 rounded-xl border border-cyan/20">
          <h3 className="text-2xl font-bold text-white mb-2">Speed & Agility</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-bold text-cyan">$50</span>
            <span className="text-slate-400">/ athlete • 90 minutes</span>
          </div>
          <p className="text-slate-400 mb-6">Max 6 athletes per session</p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <ul className="space-y-2">
              {['Sprint mechanics', 'Explosive power', 'Agility drills'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-cyan flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <ul className="space-y-2">
              {['Sport-specific movements', 'Competitive environment', 'Professional coaching'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle className="w-4 h-4 text-cyan flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/get-started">
            <button className="btn-ghost w-full border-cyan/30 hover:border-cyan/50">Join Group Training</button>
          </Link>
        </div>
      </div>

      {/* Training Packages */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-white">Training Packages</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: '5-Session Pack',
              price: '$350',
              regular: '$375',
              save: '$25',
              perSession: '$70',
            },
            {
              name: '10-Session Pack',
              price: '$675',
              regular: '$750',
              save: '$75',
              perSession: '$67.50',
              featured: true,
            },
            {
              name: '20-Session Pack',
              price: '$1,300',
              regular: '$1,500',
              save: '$200',
              perSession: '$65',
            },
          ].map((pack, index) => (
            <div
              key={index}
              className={`p-6 bg-slate-800/30 rounded-xl border transition-all ${
                pack.featured
                  ? 'border-orange shadow-glow-orange'
                  : 'border-slate-700 hover:border-orange/30'
              }`}
            >
              {pack.featured && (
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 bg-orange text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2 text-center">{pack.name}</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-orange mb-1">{pack.price}</div>
                <div className="text-sm text-slate-400 line-through">{pack.regular} value</div>
                <div className="text-cyan font-semibold">Save {pack.save}</div>
              </div>
              <div className="text-center mb-6">
                <p className="text-slate-400 text-sm">{pack.perSession} per session</p>
              </div>
              <Link href="/get-started">
                <button className={pack.featured ? 'btn-primary w-full' : 'btn-ghost w-full'}>
                  Purchase Pack
                </button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-orange/10">
          <p className="text-slate-300 text-center">
            <span className="font-bold text-orange">Package Benefits:</span> Mix pitching & hitting • Transfer to family • Pause for injuries • Satisfaction guaranteed
          </p>
        </div>
      </div>

      {/* Specialty Services */}
      <div className="command-panel">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold text-white">Specialty Services</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-800/30 rounded-xl border border-orange/20">
            <Video className="w-10 h-10 text-orange mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Video Analysis</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-orange">$50</span>
              <span className="text-slate-400">/ 30 minutes</span>
            </div>
            <p className="text-slate-400 mb-6">
              In-depth video breakdown of mechanics with actionable feedback and drill recommendations.
            </p>
            <Link href="/get-started">
              <button className="btn-ghost w-full border-orange/30">Book Analysis</button>
            </Link>
          </div>

          <div className="p-6 bg-slate-800/30 rounded-xl border border-cyan/20">
            <Activity className="w-10 h-10 text-cyan mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Recovery & Mobility</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-cyan">$45</span>
              <span className="text-slate-400">/ 45 minutes</span>
            </div>
            <p className="text-slate-400 mb-6">
              Guided recovery focused on mobility, flexibility, and injury prevention for optimal performance.
            </p>
            <Link href="/get-started">
              <button className="btn-ghost w-full border-cyan/30">Book Recovery</button>
            </Link>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}
