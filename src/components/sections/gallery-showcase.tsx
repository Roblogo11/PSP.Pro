'use client'

import { Camera, Video, Plane, Radio, Sparkles, ArrowRight, ChevronLeft, ChevronRight, Film, Wand2, Globe, RefreshCw } from 'lucide-react'
import { useRef } from 'react'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

const allCards = [
  {
    icon: Camera,
    title: 'Photography',
    description: 'Professional photography for products, events, portraits & more',
    href: '/photography#view-gallery',
    gradient: 'from-secondary to-accent',
    stats: 'Product • Event • Portrait • Commercial',
    cta: 'View Gallery'
  },
  {
    icon: Video,
    title: 'Videography',
    description: 'Cinematic video production for corporate, events & weddings',
    href: '/video#view-gallery',
    gradient: 'from-accent to-secondary',
    stats: 'Corporate • Events • Promotional • Weddings',
    cta: 'View Gallery'
  },
  {
    icon: Plane,
    title: 'Drone Services',
    description: 'Aerial photography & videography for real estate & events',
    href: '/drone#view-gallery',
    gradient: 'from-secondary to-purple-500',
    stats: 'Aerial • Real Estate • Events',
    cta: 'View Gallery'
  },
  {
    icon: Radio,
    title: 'Podcast',
    description: 'AI & business insights for entrepreneurs and creators',
    href: '/podcast#view-gallery',
    gradient: 'from-purple-500 to-accent',
    stats: 'Latest Episodes • Industry Insights',
    cta: 'View Gallery'
  },
  {
    icon: Film,
    title: 'Media Production',
    description: 'Podcasts, interviews & promotional video content',
    href: '/media-production#view-gallery',
    gradient: 'from-cyan-500 to-secondary',
    stats: 'Podcasts • Interviews • Promotional',
    cta: 'View Gallery'
  },
  {
    icon: Wand2,
    title: 'Motion Graphics',
    description: '3D renders, animations & AI-generated visuals',
    href: '/motion-graphics#view-gallery',
    gradient: 'from-pink-500 to-purple-500',
    stats: '3D • Animations • Generative Art',
    cta: 'View Gallery'
  },
  {
    icon: Globe,
    title: 'Digital Builds',
    description: 'Websites, web apps & e-commerce platforms',
    href: '/digital-builds#view-gallery',
    gradient: 'from-emerald-500 to-cyan-500',
    stats: 'Websites • Web Apps • E-Commerce',
    cta: 'View Gallery'
  },
  {
    icon: RefreshCw,
    title: 'Website Redesign',
    description: 'Before & after transformations & case studies',
    href: '/website-redesign#view-gallery',
    gradient: 'from-orange-500 to-pink-500',
    stats: 'Before/After • Redesigns • Case Studies',
    cta: 'View Gallery'
  },
]

export function GalleryShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <Section className="relative overflow-hidden bg-dark-200/50">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 backdrop-blur-sm mb-4">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm text-secondary font-medium">Explore Our Work</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
            Gallery Showcase
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Dive into our portfolio of creative excellence. Browse through our galleries to see real projects and discover what we can create for you.
          </p>
        </div>

        {/* Scroll Navigation Arrows */}
        <div className="flex justify-end gap-2 mb-4 pr-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-dark-100/80 border border-secondary/20 text-gray-400 hover:text-white hover:border-secondary/50 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-dark-100/80 border border-secondary/20 text-gray-400 hover:text-white hover:border-secondary/50 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Cards Row */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto py-8 px-4 -mx-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative flex-shrink-0 w-72 p-8 rounded-2xl bg-dark-100/50 border border-secondary/20 backdrop-blur-sm hover:border-secondary/40 hover:shadow-glow-lg transition-all duration-300 hover:scale-105 snap-start"
            >
              <div className="space-y-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} p-3 group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-full h-full text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white group-hover:text-secondary transition-colors">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed">
                  {card.description}
                </p>

                {/* Stats */}
                <p className="text-xs text-secondary/70 font-medium">
                  {card.stats}
                </p>

                {/* CTA Link */}
                <div className="flex items-center text-secondary group-hover:translate-x-2 transition-transform pt-2">
                  <span className="text-sm font-semibold">{card.cta}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>

              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/0 to-accent/0 group-hover:from-secondary/5 group-hover:to-accent/5 transition-all pointer-events-none" />
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Want to learn more about our process and pricing?{' '}
            <Link href="/pricing" className="text-secondary hover:text-accent transition-colors font-semibold underline">
              View our pricing packages
            </Link>
            {' '}or{' '}
            <Link href="#contact" className="text-secondary hover:text-accent transition-colors font-semibold underline">
              get in touch with our team
            </Link>
          </p>
        </div>
      </Container>
    </Section>
  )
}
