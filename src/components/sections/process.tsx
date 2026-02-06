'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search, Palette, Cog, BookOpen, Users, Zap, ArrowRight, LucideIcon, ArrowDown } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { useScrollAnimation } from '@/lib/use-scroll-animation'

const iconMap: Record<string, LucideIcon> = {
  Search,
  Palette,
  Cog,
  BookOpen,
  Users,
  Zap,
}

export function Process() {
  const titleRef = useScrollAnimation()

  return (
    <Section className="bg-dark-200/50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="animate-on-scroll text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {siteConfig.process.sectionTitle}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {siteConfig.process.sectionSubtitle}
          </p>
        </div>

        {/* Tree Flow */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central Tree Trunk Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary via-accent to-secondary/20 -translate-x-1/2 hidden lg:block" />

          {/* Process Steps */}
          <div className="space-y-8">
            {siteConfig.process.steps.map((step, index) => {
              const Icon = iconMap[step.icon]
              const isEven = index % 2 === 0
              const isLast = index === siteConfig.process.steps.length - 1

              return (
                <div key={step.id}>
                  <ProcessStep
                    step={step}
                    Icon={Icon}
                    isEven={isEven}
                    index={index}
                  />

                  {/* Branch Connector - flowing arrow down */}
                  {!isLast && (
                    <div className="relative py-8">
                      <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-px h-8 bg-gradient-to-b from-secondary/50 to-accent/50" />
                          <ArrowDown className="w-6 h-6 text-secondary/70 animate-bounce" style={{ animationDuration: '2s' }} />
                          <div className="w-px h-8 bg-gradient-to-b from-accent/50 to-secondary/50" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 pt-8 border-t border-secondary/20">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Ready to start your creative journey?</p>
          <Link href="#contact">
            <Button size="lg" className="group">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </Container>
    </Section>
  )
}

function ProcessStep({
  step,
  Icon,
  isEven,
  index,
}: {
  step: typeof siteConfig.process.steps[0]
  Icon: LucideIcon
  isEven: boolean
  index: number
}) {
  const ref = useScrollAnimation()

  return (
    <div
      ref={ref}
      className="animate-on-scroll relative"
    >
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${isEven ? '' : 'lg:grid-flow-dense'}`}>
        {/* Branch Line (Desktop) */}
        <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 ${isEven ? 'left-1/2 right-0' : 'left-0 right-1/2'} h-px`}>
          <div className={`h-full bg-gradient-to-r ${isEven ? 'from-secondary/50 to-transparent' : 'from-transparent to-secondary/50'}`} />
        </div>

        {/* Content Card */}
        <div className={`relative ${isEven ? 'lg:col-start-2' : 'lg:col-start-1'}`}>
          <div className="group relative p-8 rounded-2xl bg-dark-100/80 border border-secondary/20 backdrop-blur-sm hover:border-secondary/40 hover:shadow-glow-lg transition-all duration-300">
            {/* Step Number Badge */}
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center font-bold text-xl text-white shadow-glow">
              {step.number}
            </div>

            {/* Icon & Title */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 text-secondary group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            {step.cta && step.href && (
              <div className="mt-6">
                <Link href={step.href}>
                  <Button variant="outline" size="sm" className="group/btn">
                    {step.cta}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Decorative Corner Accent */}
            <div className="absolute bottom-4 right-4 flex gap-1">
              <div className="w-2 h-2 rounded-full bg-secondary/30" />
              <div className="w-2 h-2 rounded-full bg-accent/30" />
              <div className="w-2 h-2 rounded-full bg-secondary/30" />
            </div>
          </div>
        </div>

        {/* Image with Branch Effect */}
        <div className={`relative ${isEven ? 'lg:col-start-1 lg:row-start-1' : 'lg:col-start-2'}`}>
          <div className="relative aspect-square rounded-2xl overflow-hidden group">
            <Image
              src={step.image}
              alt={step.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-transparent to-accent/30 mix-blend-overlay" />
            {/* Border Glow */}
            <div className="absolute inset-0 rounded-2xl ring-2 ring-secondary/20 group-hover:ring-secondary/60 transition-all" />

            {/* Floating Icon */}
            <div className="absolute top-4 right-4 w-14 h-14 rounded-full bg-dark-100/90 backdrop-blur-sm border border-secondary/30 flex items-center justify-center">
              <Icon className="w-7 h-7 text-secondary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
