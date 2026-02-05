'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Mail, CheckCircle, Sparkles, Calendar, Users, ArrowRight } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'

export default function ThankYouPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-dark-300 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <GenerativeMotion />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-300/80 via-dark-200/80 to-dark-100/80" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full" />
              <CheckCircle className="relative w-24 h-24 text-secondary animate-pulse" />
            </div>
          </div>

          {/* Thank You Badge */}
          <div className="inline-block mb-6 px-6 py-3 bg-secondary/10 border border-secondary/20 rounded-full">
            <span className="text-secondary font-semibold text-lg">✓ Message Received</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
            Thank You!
          </h1>

          <p className="text-2xl md:text-3xl text-gray-300 mb-4 max-w-3xl mx-auto">
            We've received your message and we're excited to work with you!
          </p>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Our team will review your request and get back to you within 24-48 hours.
            In the meantime, check out what we can do for your business.
          </p>

          {/* Back to Home Button */}
          <div className="mb-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform text-lg"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          {/* What Happens Next */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-8 text-white">What Happens Next?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <Mail className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-secondary">1. We Review</h3>
                <p className="text-gray-400">
                  Our team carefully reviews your request and prepares a personalized response.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Calendar className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-accent">2. We Reach Out</h3>
                <p className="text-gray-400">
                  Expect a reply within 24-48 hours with next steps and scheduling options.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <Sparkles className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-secondary">3. We Create</h3>
                <p className="text-gray-400">
                  Once approved, we bring your vision to life with AI-powered efficiency.
                </p>
              </div>
            </div>
          </div>

          {/* Email Signup */}
          <div className="max-w-md mx-auto mb-16">
            <p className="text-xl text-gray-300 mb-4">Stay in the loop</p>
            <p className="text-gray-400 text-sm mb-4">
              Get AI tips, marketing insights, and special offers delivered to your inbox.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email Address"
              className="w-full px-6 py-4 bg-dark-200/50 border border-secondary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50 mb-4"
            />
            <button className="w-full px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform mb-2">
              Join Our Market Alerts
            </button>
            <p className="text-gray-400 text-sm">
              Marketing insights & AI tools to grow your business.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Website Services */}
            <Link
              href="/website-help"
              className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-all">
                  <Sparkles className="w-12 h-12 text-secondary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-secondary">Website Services</h3>
              <p className="text-gray-400 mb-4">
                Modern websites that convert visitors into customers. From design to SEO optimization.
              </p>
              <div className="inline-flex items-center gap-2 text-secondary font-semibold group-hover:gap-3 transition-all">
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Media Production */}
            <Link
              href="/media-production"
              className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all group"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-all">
                  <Users className="w-12 h-12 text-accent" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-accent">Media Production</h3>
              <p className="text-gray-400 mb-4">
                Podcasts, interviews, and video content that amplifies your brand's voice.
              </p>
              <div className="inline-flex items-center gap-2 text-accent font-semibold group-hover:gap-3 transition-all">
                <span>View Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* The Shock Kit */}
            <Link
              href="/shock-kit"
              className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-all">
                  <Sparkles className="w-12 h-12 text-secondary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-secondary">The Shock Kit</h3>
              <p className="text-gray-400 mb-4">
                AI-powered social content system that keeps your brand active and growing.
              </p>
              <div className="inline-flex items-center gap-2 text-secondary font-semibold group-hover:gap-3 transition-all">
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="max-w-4xl mx-auto p-10 rounded-2xl bg-gradient-to-br from-dark-200/80 to-dark-100/80 backdrop-blur-sm border border-secondary/20 mb-16">
            <h2 className="text-3xl font-bold mb-6 text-white">Join 100+ Local Businesses</h2>
            <p className="text-xl text-gray-300 mb-8">
              We help businesses in Norfolk, Chesapeake, and Virginia Beach shock the media and beat the algorithm.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">2M+</div>
                <div className="text-gray-400">Total Views Generated</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">95%</div>
                <div className="text-gray-400">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">48hr</div>
                <div className="text-gray-400">Average Response Time</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-400 mb-4">
              Have an urgent request? Reach out directly:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:shockmediapr@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-dark-200/50 rounded-lg border border-secondary/20 hover:border-secondary/40 transition-all"
              >
                <Mail className="w-5 h-5 text-secondary" />
                <span>shockmediapr@gmail.com</span>
              </a>
            </div>
            <p className="text-gray-500 text-sm mt-8">
              Serving Norfolk • Chesapeake • Virginia Beach & Beyond
            </p>
          </div>
        </div>
      </section>

      {/* Services List Section */}
      <section className="relative overflow-hidden">
        <FloatingShapes />
        <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Explore Our Services</h2>
            <p className="text-xl text-gray-300">Everything you need to grow your business online</p>
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
              <h3 className="text-2xl font-bold mb-3">View All Pricing</h3>
              <p className="text-gray-300 mb-4">Flexible, pay-per-service model designed for your business needs</p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-secondary rounded-lg font-semibold hover:scale-105 transition-transform"
              >
                <span>See Pricing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
