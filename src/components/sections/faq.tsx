'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { useScrollAnimation } from '@/lib/use-scroll-animation'

export function FAQ() {
  const titleRef = useScrollAnimation()

  return (
    <Section className="bg-primary">
      <Container size="lg">
        {/* Section Header */}
        <div ref={titleRef} className="animate-on-scroll text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {siteConfig.faq.sectionTitle}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {siteConfig.faq.sectionSubtitle}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {siteConfig.faq.questions.map((faq, index) => (
            <FAQItem key={faq.id} faq={faq} index={index} />
          ))}
        </div>
      </Container>
    </Section>
  )
}

function FAQItem({
  faq,
  index,
}: {
  faq: typeof siteConfig.faq.questions[0]
  index: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useScrollAnimation()

  return (
    <div
      ref={ref}
      className="animate-on-scroll"
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 rounded-xl bg-dark-100 border border-secondary/10 hover:border-secondary/30 transition-all duration-300 group"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-secondary transition-colors flex-1">
            {faq.question}
          </h3>
          <ChevronDown
            className={`w-6 h-6 text-secondary transition-transform flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Answer */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-96 mt-4' : 'max-h-0'
          }`}
        >
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </button>
    </div>
  )
}
