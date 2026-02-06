'use client'

import Link from 'next/link'
import { Target, Users, MapPin, Award, TrendingUp, Zap } from 'lucide-react'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { FunnelNav } from '@/components/navigation/funnel-nav'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen">
      <InfoSidebar />
      <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-20">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
          About <span className="text-gradient-orange">PSP.Pro</span>
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-lg">
          Proper Sports Performance - Progression Over Perfection
        </p>
      </div>

      {/* Hero Section */}
      <div className="command-panel mb-6 text-center">
        <div className="inline-block mb-4 px-4 py-2 bg-orange/10 border border-orange/20 rounded-full">
          <span className="text-orange font-semibold">Virginia Beach's Premier Training Facility</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Proper Sports Performance
        </h2>

        <p className="text-xl text-slate-600 dark:text-slate-300 mb-6 max-w-3xl mx-auto leading-relaxed">
          Virginia Beach's premier baseball and softball training facility focused on velocity development and mechanics improvement.
        </p>

        <p className="text-2xl font-bold text-orange mb-8">
          Progression Over Perfection
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/get-started" className="btn-primary">
            Get Started
          </Link>
          <Link href="/pricing" className="btn-ghost">
            View Programs
          </Link>
        </div>
      </div>

      {/* Mission Section */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
        </div>

        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          At PSP.Pro, we believe in <span className="text-orange font-bold">Progression Over Perfection</span>. Our mission is to develop elite baseball and softball athletes through science-based training methodologies that focus on continuous improvement.
        </p>

        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
          We specialize in velocity development, mechanics refinement, and overall athletic performance enhancement for athletes of all levels.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="p-6 rounded-xl bg-white/5 border border-orange/10 hover:border-orange/30 transition-all">
            <h3 className="text-xl font-bold mb-3 text-orange">Baseball Training</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Specialized pitching and hitting programs designed to maximize velocity, power, and consistency.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-cyan/10 hover:border-cyan/30 transition-all">
            <h3 className="text-xl font-bold mb-3 text-cyan">Softball Excellence</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Comprehensive softball training focusing on mechanics, speed development, and game performance.
            </p>
          </div>
        </div>
      </div>

      {/* Approach Section */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold text-white">Our Approach</h2>
        </div>

        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          We combine cutting-edge technology with proven training methodologies to deliver measurable results.
        </p>

        <h3 className="text-xl font-bold mb-4 text-white">Training Specialties</h3>
        <ul className="space-y-3 text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-white">Velocity Development</strong> – Increase throwing velocity through biomechanics and strength training</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-white">Mechanics Analysis</strong> – Video breakdown and corrective exercises for optimal movement patterns</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-white">Power Development</strong> – Build explosive strength for hitting and throwing</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-white">Speed & Agility</strong> – Improve athletic movement and on-field performance</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange flex-shrink-0 mt-1" />
            <span><strong className="text-white">Recovery & Mobility</strong> – Prevent injury and optimize recovery for peak performance</span>
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

        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Located in the heart of Virginia Beach, our state-of-the-art facility serves athletes throughout the Hampton Roads region.
        </p>

        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Serving Virginia Beach, Chesapeake, Norfolk, and surrounding areas
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-white/5 border border-orange/10 hover:border-orange/30 transition-all">
            <h3 className="text-lg font-bold mb-3 text-orange">World-Class Facility</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Modern training equipment, video analysis systems, and dedicated space for athlete development.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-cyan/10 hover:border-cyan/30 transition-all">
            <h3 className="text-lg font-bold mb-3 text-cyan">Expert Coaching</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
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

        <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
          Our core values guide everything we do at PSP.Pro
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-white/5 border border-orange/10 text-center">
            <Award className="w-12 h-12 text-orange mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Excellence</h3>
            <p className="text-slate-500 dark:text-slate-400">Striving for the highest standards in every training session</p>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-cyan/10 text-center">
            <TrendingUp className="w-12 h-12 text-cyan mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Progress</h3>
            <p className="text-slate-500 dark:text-slate-400">Celebrating continuous improvement over perfection</p>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-orange/10 text-center">
            <Users className="w-12 h-12 text-orange mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Community</h3>
            <p className="text-slate-500 dark:text-slate-400">Building a supportive environment for athlete growth</p>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-cyan/10 text-center">
            <Target className="w-12 h-12 text-cyan mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-white">Results</h3>
            <p className="text-slate-500 dark:text-slate-400">Delivering measurable outcomes through proven methods</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/pricing" className="btn-primary">
            View Training Programs
          </Link>
          <Link href="/get-started" className="btn-ghost">
            Start Training Today
          </Link>
        </div>
      </div>
      </main>

      <FunnelNav />
    </div>
  )
}
