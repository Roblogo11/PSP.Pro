'use client'

import Link from 'next/link'
import { ArrowLeft, Youtube, Briefcase, Mail, Home } from 'lucide-react'
import { GenerativeMotion, FloatingShapes } from '@/components/generative-motion'

export default function RobbieCreatesBioPage() {
  return (
    <div className="min-h-screen bg-dark-300 text-white">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/about"
          className="flex items-center gap-2 px-4 py-2 bg-dark-200/90 backdrop-blur-sm rounded-lg border border-secondary/20 hover:border-secondary/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to About</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <GenerativeMotion />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-300/80 via-dark-200/80 to-dark-100/80" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
              <span className="text-secondary font-semibold">Co-CEO</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
              Robert Copeland
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Robert is not just an owner, he's still in the game competing with the best Web Devs.
            </p>

            <a
              href="https://www.youtube.com/watch?v=rM2iyf9Ivz8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform"
            >
              Check Out Our YouTube
            </a>
          </div>

          {/* Bio Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* YouTuber Card */}
            <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <Youtube className="w-8 h-8 text-secondary" />
                <h2 className="text-2xl font-bold">
                  YouTuber <span className="text-secondary">@RobbieCreatesHEX</span>
                </h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p className="leading-relaxed">
                  Robbie is a multi-passionate creator who fell off the deep-end of AI.
                </p>
                <p className="leading-relaxed">
                  Loving every moment of the AI evolution, he now delivers us the research. Exploring every worthy avenue of AI business enhancements. R&D beast!
                </p>
              </div>
            </div>

            {/* Skills Card */}
            <div className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-8 h-8 text-accent" />
                <h2 className="text-2xl font-bold">Skills & Experience</h2>
              </div>
              <div className="space-y-4 text-gray-300">
                <p className="leading-relaxed">
                  Addicted to movie cinematics, this creator found a way to bridge AI and cinema.
                </p>
                <p className="leading-relaxed">
                  This untapped avenue is the largest growing media force on the planet.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-started"
                className="px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform inline-flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Get Started
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-dark-200/50 backdrop-blur-sm border border-secondary/20 rounded-lg font-semibold hover:border-secondary/50 transition-all inline-flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
