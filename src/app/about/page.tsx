'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Target, Users, MapPin, Award, TrendingUp, Zap, Package, Rocket, Mail, ArrowRight } from 'lucide-react'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { FunnelNav } from '@/components/navigation/funnel-nav'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen">
      <InfoSidebar />
      <main className="flex-1 pb-24 lg:pb-20">
      {/* Hero Image Banner */}
      <div className="relative px-6 py-20 md:py-28 overflow-hidden">
        <Image
          src="/images/coach rachel psp.jpg"
          alt="Coach Rachel at PSP"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/80 to-slate-950/90" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-orange/10 border border-orange/20 rounded-full">
            <span className="text-orange font-semibold">Virginia Beach&apos;s Premier Training Facility</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            About <span className="text-gradient-orange">PSP.Pro</span>
          </h1>
          <p className="text-xl text-white mb-6 max-w-2xl mx-auto leading-relaxed">
            Virginia Beach&apos;s premier baseball and softball training facility focused on velocity development and mechanics improvement.
          </p>
          <p className="text-2xl font-bold text-white">
            Progression Over Perfection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/get-started" className="btn-primary">
              Join the Team
            </Link>
            <Link href="/pricing" className="btn-ghost border-white/30 text-white hover:border-white/50">
              View Programs
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
      {/* Mission Section */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
        </div>

        <p className="text-lg text-slate-600 dark:text-white leading-relaxed mb-6">
          At PSP.Pro, we believe in <span className="text-orange font-bold">Progression Over Perfection</span>. Our mission is to develop elite baseball and softball athletes through science-based training methodologies that focus on continuous improvement.
        </p>

        <p className="text-slate-500 dark:text-white/80 leading-relaxed">
          We specialize in velocity development, mechanics refinement, and overall athletic performance enhancement for athletes of all levels.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="p-6 rounded-xl bg-cyan-900/20 border border-orange/20 hover:border-orange/40 transition-all">
            <h3 className="text-xl font-bold mb-3 text-orange">Baseball Training</h3>
            <p className="text-slate-600 dark:text-white leading-relaxed">
              Specialized pitching and hitting programs designed to maximize velocity, power, and consistency.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-cyan-900/20 border border-cyan/20 hover:border-cyan/40 transition-all">
            <h3 className="text-xl font-bold mb-3 text-cyan">Softball Excellence</h3>
            <p className="text-slate-600 dark:text-white leading-relaxed">
              Comprehensive softball training focusing on mechanics, speed development, and game performance.
            </p>
          </div>
        </div>

        {/* Inline image */}
        <div className="mt-6 relative h-64 md:h-80 rounded-xl overflow-hidden">
          <Image
            src="/images/over the shoulder psp pitching.jpg"
            alt="PSP coaching session"
            fill
            quality={80}
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
        </div>
      </div>

      {/* Approach Section */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold text-white">Our Approach</h2>
        </div>

        <p className="text-lg text-slate-600 dark:text-white leading-relaxed mb-6">
          We combine cutting-edge technology with proven training methodologies to deliver measurable results.
        </p>

        <h3 className="text-xl font-bold mb-4 text-white">Training Specialties</h3>
        <ul className="space-y-3 text-slate-600 dark:text-white">
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-orange">Velocity Development</strong> – Increase throwing velocity through biomechanics and strength training</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-orange">Mechanics Analysis</strong> – Video breakdown and corrective exercises for optimal movement patterns</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-orange">Power Development</strong> – Build explosive strength for hitting and throwing</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-orange">Speed & Agility</strong> – Improve athletic movement and on-field performance</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-orange">Recovery & Mobility</strong> – Prevent injury and optimize recovery for peak performance</span>
          </li>
        </ul>
      </div>

      {/* Location Section */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-white">Location</h2>
        </div>

        <h3 className="text-xl font-bold mb-3 text-white">Serving Virginia Beach & Hampton Roads</h3>

        <p className="text-lg text-slate-600 dark:text-white leading-relaxed mb-4">
          Located in the heart of Virginia Beach, our state-of-the-art facility serves athletes throughout the Hampton Roads region.
        </p>

        <p className="text-slate-500 dark:text-white/80 mb-6">
          Serving Virginia Beach, Chesapeake, Norfolk, and surrounding areas
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-cyan-900/20 border border-orange/20 hover:border-orange/40 transition-all">
            <h3 className="text-lg font-bold mb-3 text-orange">World-Class Facility</h3>
            <p className="text-slate-600 dark:text-white leading-relaxed">
              Modern training equipment, video analysis systems, and dedicated space for athlete development.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-cyan-900/20 border border-cyan/20 hover:border-cyan/40 transition-all">
            <h3 className="text-lg font-bold mb-3 text-cyan">Expert Coaching</h3>
            <p className="text-slate-600 dark:text-white leading-relaxed">
              Experienced coaches dedicated to helping athletes reach their full potential.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold text-white">Our Values</h2>
        </div>

        <p className="text-lg text-slate-600 dark:text-white mb-6">
          Our core values guide everything we do at PSP.Pro
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-cyan-900/20 border border-orange/20 text-center">
            <Award className="w-12 h-12 text-orange mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Excellence</h3>
            <p className="text-slate-500 dark:text-white/80">Striving for the highest standards in every training session</p>
          </div>

          <div className="p-6 rounded-xl bg-cyan-900/20 border border-cyan/20 text-center">
            <TrendingUp className="w-12 h-12 text-cyan mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Progress</h3>
            <p className="text-slate-500 dark:text-white/80">Celebrating continuous improvement over perfection</p>
          </div>

          <div className="p-6 rounded-xl bg-cyan-900/20 border border-orange/20 text-center">
            <Users className="w-12 h-12 text-orange mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Community</h3>
            <p className="text-slate-500 dark:text-white/80">Building a supportive environment for athlete growth</p>
          </div>

          <div className="p-6 rounded-xl bg-cyan-900/20 border border-cyan/20 text-center">
            <Target className="w-12 h-12 text-cyan mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Results</h3>
            <p className="text-slate-500 dark:text-white/80">Delivering measurable outcomes through proven methods</p>
          </div>
        </div>
      </div>

      {/* Continue Exploring */}
      <div className="command-panel">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Continue Exploring</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/pricing" className="glass-card-hover p-6 text-center group">
            <Package className="w-8 h-8 text-orange mb-3 mx-auto" />
            <h3 className="font-bold text-white group-hover:text-orange transition-colors">View Pricing</h3>
            <p className="text-sm text-slate-500 dark:text-white/80 mt-2">Training programs & packages</p>
            <div className="inline-flex items-center gap-1 text-orange text-sm font-semibold mt-3">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link href="/get-started" className="glass-card-hover p-6 text-center group">
            <Rocket className="w-8 h-8 text-cyan mb-3 mx-auto" />
            <h3 className="font-bold text-white group-hover:text-cyan transition-colors">Join the Team</h3>
            <p className="text-sm text-slate-500 dark:text-white/80 mt-2">Join our training family</p>
            <div className="inline-flex items-center gap-1 text-cyan text-sm font-semibold mt-3">
              <span>Join Now</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link href="/contact" className="glass-card-hover p-6 text-center group">
            <Mail className="w-8 h-8 text-orange mb-3 mx-auto" />
            <h3 className="font-bold text-white group-hover:text-orange transition-colors">Contact Us</h3>
            <p className="text-sm text-slate-500 dark:text-white/80 mt-2">Questions? We&apos;re here to help</p>
            <div className="inline-flex items-center gap-1 text-orange text-sm font-semibold mt-3">
              <span>Reach Out</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
      </div>
      </main>

      <FunnelNav />
    </div>
  )
}
