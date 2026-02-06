'use client'

import { DollarSign, Mail, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { useScrollAnimation } from '@/lib/use-scroll-animation'
import { GenerativeMotion } from '@/components/generative-motion'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      {/* Particle Background */}
      <GenerativeMotion />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-400/80 via-primary/80 to-dark-300/80">
        <div className="absolute inset-0 bg-cyber-grid opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Logo at Top */}
      <div className="absolute top-8 left-8 z-20 animate-fade-in">
        <Link href="/">
          <Image
            src={siteConfig.meta.logo}
            alt="Logo"
            width={80}
            height={80}
            className="drop-shadow-2xl hover:scale-110 transition-transform cursor-pointer"
          />
        </Link>
      </div>

      <Container className="relative z-10">
        <div className="text-center space-y-12">
          {/* Badge */}
          <div className="animate-fade-in flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm text-secondary font-medium">AI-Native Marketing Studio</span>
            </div>
          </div>

          {/* Headline */}
          <div className="animate-fade-in space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="block text-white">{siteConfig.hero.headline}</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-secondary glow-text font-medium">
              {siteConfig.hero.subheadline}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Link href="/pricing">
              <Button size="lg" className="group">
                <DollarSign className="mr-2 w-5 h-5" />
                View Pricing
              </Button>
            </Link>
            <Link href="#contact">
              <Button variant="outline" size="lg" className="group">
                <Mail className="mr-2 w-5 h-5" />
                Get In Touch
              </Button>
            </Link>
          </div>

          {/* Location Badge */}
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '600ms' }}>
            Serving Norfolk, Virginia Beach & Chesapeake
          </p>
        </div>
      </Container>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-secondary/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-secondary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
