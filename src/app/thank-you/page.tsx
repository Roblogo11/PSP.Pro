'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Home, CheckCircle, Calendar, Target, ArrowRight, Package, Info } from 'lucide-react'
import { InfoSidebar } from '@/components/layout/info-sidebar'

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen">
      <InfoSidebar />
      <main className="flex-1 relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Top View Soccer Traing.jpg"
          alt="PSP training session"
          fill
          quality={80}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/92 via-slate-950/88 to-slate-950/95" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan/20 blur-3xl rounded-full" />
            <CheckCircle className="relative w-24 h-24 text-cyan animate-pulse" />
          </div>
        </div>

        {/* Thank You Message */}
        <div className="command-panel p-8 md:p-12 mb-6">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Thank You!
          </h1>

          <p className="text-xl text-white mb-6">
            We&apos;ve received your message and we&apos;re excited to help you reach your athletic goals!
          </p>

          <p className="text-white/80 mb-8">
            Our team will review your request and get back to you within 24 hours.
          </p>

          {/* Back to Home Button */}
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 mb-8"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          {/* What Happens Next */}
          <div className="mt-10 pt-8 border-t border-cyan-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">What Happens Next?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-4 rounded-xl bg-cyan-900/20 border border-cyan-700/30">
                <div className="w-10 h-10 bg-cyan/10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-cyan font-bold">1</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">We Review</h3>
                <p className="text-sm text-white/80">
                  Our team reviews your request and prepares a personalized response.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cyan-900/20 border border-cyan-700/30">
                <div className="w-10 h-10 bg-orange/10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-orange font-bold">2</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">We Reach Out</h3>
                <p className="text-sm text-white/80">
                  Expect a reply within 24 hours with next steps and scheduling options.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cyan-900/20 border border-cyan-700/30">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-green-400 font-bold">3</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">We Train</h3>
                <p className="text-sm text-white/80">
                  Start your journey to peak athletic performance with personalized training.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Explore More */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/booking"
            className="glass-card-hover p-6 text-left group"
          >
            <Calendar className="w-8 h-8 text-cyan mb-3" />
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan transition-colors">
              Book a Session
            </h3>
            <p className="text-sm text-white/70 mb-3">
              Schedule your first training session
            </p>
            <div className="inline-flex items-center gap-2 text-cyan text-sm font-semibold">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/pricing"
            className="glass-card-hover p-6 text-left group"
          >
            <Package className="w-8 h-8 text-orange mb-3" />
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange transition-colors">
              View Pricing
            </h3>
            <p className="text-sm text-white/70 mb-3">
              Training programs & packages
            </p>
            <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/about"
            className="glass-card-hover p-6 text-left group"
          >
            <Info className="w-8 h-8 text-cyan mb-3" />
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan transition-colors">
              About PSP
            </h3>
            <p className="text-sm text-white/70 mb-3">
              Learn about our mission
            </p>
            <div className="inline-flex items-center gap-2 text-cyan text-sm font-semibold">
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/locker"
            className="glass-card-hover p-6 text-left group"
          >
            <Target className="w-8 h-8 text-orange mb-3" />
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange transition-colors">
              Your Dashboard
            </h3>
            <p className="text-sm text-white/70 mb-3">
              Track your progress and performance
            </p>
            <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold">
              <span>View Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        <p className="text-sm text-white/60 mt-8">
          ProPer Sports Performance &bull; Virginia Beach, VA
        </p>
      </div>
      </div>
      </main>
    </div>
  )
}
