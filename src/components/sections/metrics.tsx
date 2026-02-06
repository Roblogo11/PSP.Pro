'use client'

import { siteConfig } from '@/config/site'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { useScrollAnimation } from '@/lib/use-scroll-animation'

export function Metrics() {
  const titleRef = useScrollAnimation()

  return (
    <Section className="bg-primary">
      <Container>
        {/* Section Header */}
        <div ref={titleRef} className="animate-on-scroll text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {siteConfig.metrics.sectionTitle}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {siteConfig.metrics.sectionSubtitle}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {siteConfig.metrics.stats.map((stat, index) => (
            <MetricCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>
      </Container>
    </Section>
  )
}

function MetricCard({
  stat,
  index,
}: {
  stat: typeof siteConfig.metrics.stats[0]
  index: number
}) {
  const ref = useScrollAnimation()

  return (
    <div
      ref={ref}
      className="animate-on-scroll text-center group"
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="p-8 rounded-2xl bg-dark-100 border border-secondary/10 hover:border-secondary/30 transition-all duration-300 hover:shadow-glow-md">
        {/* Value */}
        <div className="mb-3">
          <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent glow-text">
            {stat.value}
          </span>
        </div>

        {/* Label */}
        <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 group-hover:text-secondary transition-colors">
          {stat.label}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {stat.description}
        </p>

        {/* Decorative Line */}
        <div className="mt-6 h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-secondary to-accent" />
      </div>
    </div>
  )
}
