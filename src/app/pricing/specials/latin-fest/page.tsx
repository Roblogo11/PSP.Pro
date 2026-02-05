'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Globe, Camera, MapPin, Zap, TrendingUp, Mail } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'

export default function LatinFestPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-dark-300 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <GenerativeMotion />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-300/80 via-dark-200/80 to-dark-100/80" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
            <span className="text-accent font-semibold text-lg">🎉 Latin Fest 🎉</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-secondary bg-clip-text text-transparent">
            Website Discount
          </h1>

          <div className="mb-12">
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform text-lg"
            >
              Not at the latin festival? Click Here⚡
            </Link>
          </div>

          <div className="max-w-md mx-auto mb-16">
            <p className="text-xl text-gray-300 mb-4">To stay updated put email here...</p>
            <div className="mb-4 px-4 py-3 rounded-lg bg-accent/20 border border-accent/40">
              <p className="text-sm text-white font-semibold text-center">
                ⚡ Please mention "Latin Fest" when submitting your email ⚡
              </p>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address Here..."
              className="w-full px-6 py-4 bg-dark-200/50 border border-secondary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50 mb-4"
            />
            <button className="w-full px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform mb-2">
              Join Our Market Alerts
            </button>
            <p className="text-gray-400 text-sm">
              Partnering with small businesses & creators to build a greater network!
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Small Websites */}
            <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-full bg-secondary/10">
                  <Globe className="w-12 h-12 text-secondary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-secondary">No Wasted Time</h3>
              <h4 className="text-xl font-bold mb-4">Small Websites</h4>
              <div className="text-4xl font-bold text-secondary mb-4">$800+</div>
              <p className="text-gray-300 mb-2">Prices starting at $800</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Fully completed modern website like this page you're currently on!<br />
                5 day turnaround!
              </p>
              <a
                href="mailto:shockmediapr@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                <Mail className="w-5 h-5" />
                Send Us A Message
              </a>
            </div>

            {/* Pictures Videos Drones */}
            <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-full bg-accent/10">
                  <Camera className="w-12 h-12 text-accent" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-accent">Boost Your Brand</h3>
              <h4 className="text-xl font-bold mb-4">Pictures Videos Drones</h4>
              <ul className="text-gray-300 text-sm leading-relaxed space-y-2 mb-6">
                <li>• Business headshots now $40 per person</li>
                <li>• Business photos $100/hr</li>
                <li>• Green screen photos for Digital Creators $120/hr</li>
                <li>• For video and drones please contact us</li>
              </ul>
              <a
                href="mailto:shockmediapr@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                <Mail className="w-5 h-5" />
                Send Us A Message
              </a>
            </div>

            {/* Google My Business */}
            <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-full bg-secondary/10">
                  <MapPin className="w-12 h-12 text-secondary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-secondary">Make More Money</h3>
              <h4 className="text-xl font-bold mb-4">Google My Business</h4>
              <div className="text-4xl font-bold text-secondary mb-4">$500+</div>
              <p className="text-gray-300 mb-2">Prices starting at $500</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Fix and restore your Google or Apple maps profile<br />
                New business | pictures | videos | drones<br />
                Boost your maps profile to show higher in rank
              </p>
              <a
                href="mailto:shockmediapr@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                <Mail className="w-5 h-5" />
                Send Us A Message
              </a>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-accent/20">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">
                <span className="text-accent">Boost My Business</span>
              </h2>
              <div className="inline-block px-6 py-3 rounded-lg bg-accent/20 border border-accent/40 mb-6">
                <p className="text-2xl font-bold text-white">
                  🎉 Get A Shot Of Growth⚡
                </p>
              </div>
              <p className="text-xl text-gray-300 mb-6">
                Your keywords control your audience and growth. We'll generate an audit for a full diagnosis.
              </p>
              <p className="text-gray-400 mb-8 italic">
                *If you need more info click a service.
              </p>
              <a
                href="mailto:shockmediapr@gmail.com"
                className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-accent to-secondary rounded-lg font-bold text-lg hover:scale-105 transition-transform"
              >
                <Mail className="w-6 h-6" />
                Email to Book Time
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services List Section */}
      <section className="relative overflow-hidden">
        <FloatingShapes />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How We Grow Businesses:</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6 mb-12">
            <Link
              href="/photography"
              className="block p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all"
            >
              <h3 className="text-2xl font-bold mb-3 text-secondary">Business Photography & Graphics</h3>
              <p className="text-gray-400">Professional visual content that captures your brand's essence and drives engagement.</p>
            </Link>

            <Link
              href="/video"
              className="block p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all"
            >
              <h3 className="text-2xl font-bold mb-3 text-accent">Business Videography & Drones</h3>
              <p className="text-gray-400">High-quality video production and aerial cinematography accelerated with AI for faster turnaround.</p>
            </Link>

            <Link
              href="/website-help"
              className="block p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all"
            >
              <h3 className="text-2xl font-bold mb-3 text-secondary">Website Design & Growth</h3>
              <p className="text-gray-400">Modern, AI-powered websites that convert visitors into customers and drive business growth.</p>
            </Link>

            <Link
              href="/media-production"
              className="block p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all"
            >
              <h3 className="text-2xl font-bold mb-3 text-accent">Business Podcasting & Interviews</h3>
              <p className="text-gray-400">Professional podcast production and interview services to amplify your brand's voice.</p>
            </Link>

            <div className="p-8 rounded-xl bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30">
              <h3 className="text-2xl font-bold mb-3">No contract | Single services</h3>
              <p className="text-gray-300 mb-4">Flexible, pay-per-service model designed for your business needs</p>
              <a
                href="mailto:shockmediapr@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                <Mail className="w-5 h-5" />
                Send Us A Message
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
