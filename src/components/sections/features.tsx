'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Zap, Layout, Brain, Video, Search, Wrench, Users, ArrowRight, LucideIcon } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { useScrollAnimation } from '@/lib/use-scroll-animation'

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Zap,
  Layout,
  Brain,
  Video,
  Search,
  Wrench,
  Users,
}

export function Features() {
  const titleRef = useScrollAnimation()
  const [showAll, setShowAll] = useState(false)
  const [showEvenMore, setShowEvenMore] = useState(false)

  // Split items: first 4, next 4 (items 5-8), additional nested items (items 9+)
  const initialItems = siteConfig.features.items.slice(0, 4)
  const moreItems = siteConfig.features.items.slice(4, 8)
  const evenMoreItems = siteConfig.features.items.slice(8)

  const visibleItems = showAll
    ? [...initialItems, ...moreItems]
    : initialItems

  return (
    <Section className="bg-dark-200/50">
      <Container>
        {/* Section Header */}
        <div ref={titleRef} className="animate-on-scroll text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {siteConfig.features.sectionTitle}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {siteConfig.features.sectionSubtitle}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
          {visibleItems.map((feature, index) => {
            const Icon = iconMap[feature.icon]
            const isLarge = feature.size === 'large'

            return (
              <FeatureCard
                key={feature.id}
                feature={feature}
                Icon={Icon}
                isLarge={isLarge}
                index={index}
              />
            )
          })}
        </div>

        {/* View More Button */}
        {!showAll && moreItems.length > 0 && (
          <div className="mt-12 text-center">
            <Button
              onClick={() => setShowAll(true)}
              size="lg"
              className="bg-gradient-to-r from-secondary to-accent hover:scale-105 transition-transform"
            >
              View More Services
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Even More Services Section (Nested) */}
        {showAll && evenMoreItems.length > 0 && (
          <>
            {showEvenMore && (
              <div className="mt-16">
                <div className="text-center mb-12">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Even More Services
                  </h3>
                  <p className="text-lg text-gray-400">
                    Specialized web services to help your business grow
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                  {evenMoreItems.map((feature, index) => {
                    const Icon = iconMap[feature.icon]
                    const isLarge = feature.size === 'large'

                    return (
                      <FeatureCard
                        key={feature.id}
                        feature={feature}
                        Icon={Icon}
                        isLarge={isLarge}
                        index={index}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {!showEvenMore && (
              <div className="mt-12 text-center">
                <Button
                  onClick={() => setShowEvenMore(true)}
                  size="lg"
                  variant="outline"
                  className="border-secondary/30 hover:border-secondary hover:bg-secondary/10 transition-all"
                >
                  View Even More Services
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </Section>
  )
}

function FeatureCard({
  feature,
  Icon,
  isLarge,
  index,
}: {
  feature: typeof siteConfig.features.items[0]
  Icon: LucideIcon
  isLarge: boolean
  index: number
}) {
  const ref = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`animate-on-scroll group relative ${
        isLarge ? 'lg:col-span-2 lg:row-span-2' : 'lg:col-span-1'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-dark-100 to-dark-300 border border-secondary/10 hover:border-secondary/30 transition-all duration-300 hover:shadow-glow-md flex flex-col">
        {/* Icon */}
        <div className="mb-6">
          <div className="inline-flex p-3 rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary/20 transition-colors">
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <h3 className="text-2xl font-bold text-white group-hover:text-secondary transition-colors">
            {feature.title}
          </h3>
          <p className="text-gray-400 leading-relaxed">
            {feature.description}
          </p>
        </div>

        {/* Image (for large cards) */}
        {isLarge && (
          <div className="mt-6 relative h-48 lg:h-64 rounded-lg overflow-hidden">
            <Image
              src={feature.image}
              alt={feature.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-300/80 to-transparent" />
          </div>
        )}

        {/* CTA Button */}
        {feature.cta && feature.href && (
          <div className="mt-6">
            <Link href={feature.href}>
              <Button variant="outline" size="sm" className="group/btn">
                {feature.cta}
                <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </div>
  )
}
