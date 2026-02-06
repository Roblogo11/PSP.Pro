import Link from 'next/link'
import Image from 'next/image'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-slate-900 to-navy" />

      {/* Orange glow effect */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(255, 87, 34, 0.4) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 text-center space-y-8 p-8 max-w-2xl mx-auto">
        {/* PSP.Pro Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="block">
            <Image
              src="/images/PSP-black-300x99-1.png"
              alt="PSP.Pro"
              width={200}
              height={66}
              className="brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
              priority
            />
          </Link>
        </div>

        {/* 404 Message */}
        <div className="space-y-4">
          <h1 className="text-9xl md:text-[12rem] font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-orange via-orange-400 to-orange">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Off Course, Athlete
          </h2>
          <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            This page isn&apos;t in your training program. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link
            href="/"
            className="btn-primary group"
          >
            <Home className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <Link
            href="/locker"
            className="btn-secondary group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Your Locker
          </Link>
          <Link
            href="/drills"
            className="btn-ghost group"
          >
            <Search className="w-5 h-5 mr-2" />
            Browse Drills
          </Link>
        </div>

        {/* Tagline */}
        <p className="text-sm text-slate-500 pt-8 tracking-wider uppercase">
          Progression Over Perfection
        </p>
      </div>
    </div>
  )
}
