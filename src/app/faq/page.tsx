'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { InfoSidebar } from '@/components/layout/info-sidebar'

interface FAQItem {
  id: number
  category: string
  question: string
  answer: string
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 1,
    category: 'Getting Started',
    question: 'What age groups do you train?',
    answer: 'We train athletes of all ages from youth (8+) through adult. Our programs are customized for each age group: Youth (8-12), Middle School (13-14), High School (15-18), College, and Adult/Recreational. Each program is tailored to the athlete\'s developmental stage and skill level.',
  },
  {
    id: 2,
    category: 'Getting Started',
    question: 'Do I need any experience to start training?',
    answer: 'No! We work with athletes at all skill levels, from complete beginners to advanced players. Our coaches will assess your current abilities and create a personalized training plan that meets you where you are and helps you progress.',
  },
  {
    id: 3,
    category: 'Sessions & Scheduling',
    question: 'How do I book a training session?',
    answer: 'Booking is easy! Simply visit our booking page, select your desired service (pitching, hitting, etc.), choose a date and time that works for you, and complete the payment. You\'ll receive instant confirmation via email.',
  },
  {
    id: 4,
    category: 'Sessions & Scheduling',
    question: 'What are your training hours?',
    answer: 'We\'re open Monday-Friday from 3PM-9PM and Saturday from 9AM-5PM. We\'re closed on Sundays. Evening and weekend slots fill up quickly, so we recommend booking in advance!',
  },
  {
    id: 5,
    category: 'Sessions & Scheduling',
    question: 'Can I cancel or reschedule a session?',
    answer: 'Yes! We require 24 hours notice for cancellations or rescheduling. If you cancel with at least 24 hours notice, you\'ll receive a full credit toward a future session. Cancellations with less than 24 hours notice are non-refundable.',
  },
  {
    id: 6,
    category: 'Pricing & Packages',
    question: 'How much does training cost?',
    answer: '1-on-1 sessions are $75 for pitching or hitting (60 minutes). Group training is $50 per athlete. We also offer packages: 5-Session Pack ($350), 10-Session Pack ($675), and 20-Session Pack ($1,300) with increasing savings.',
  },
  {
    id: 7,
    category: 'Pricing & Packages',
    question: 'Do training packages expire?',
    answer: 'Training packages are valid for 90 days from the date of purchase. This gives you plenty of flexibility to schedule your sessions while maintaining consistent training momentum.',
  },
  {
    id: 8,
    category: 'Pricing & Packages',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment system. Payment is required at the time of booking.',
  },
  {
    id: 9,
    category: 'Training Programs',
    question: 'What sports do you specialize in?',
    answer: 'We specialize in baseball and softball training, covering all positions. Our programs focus on pitching mechanics, hitting development, velocity training, speed & agility, and overall athletic performance.',
  },
  {
    id: 10,
    category: 'Training Programs',
    question: 'What should I expect in my first session?',
    answer: 'Your first session includes an initial assessment where we evaluate your current mechanics, strength, and performance metrics. We\'ll discuss your goals, identify areas for improvement, and create a personalized training plan. Bring comfortable athletic wear and be ready to work!',
  },
  {
    id: 11,
    category: 'Training Programs',
    question: 'How long does it take to see results?',
    answer: 'Most athletes see measurable improvements within 4-8 weeks of consistent training. Velocity gains typically range from 3-7 MPH over a 12-week period. Results depend on training frequency, effort level, and following our recommendations between sessions.',
  },
  {
    id: 12,
    category: 'Facility & Equipment',
    question: 'What should I bring to training?',
    answer: 'Bring comfortable athletic clothing, athletic shoes (cleats not required), your glove, and a water bottle. We provide all training equipment including balls, bats, and technology for data tracking. If you have your own bat or glove you prefer, feel free to bring them!',
  },
  {
    id: 13,
    category: 'Facility & Equipment',
    question: 'Where is your facility located?',
    answer: 'We\'re located in Virginia Beach, VA, serving the entire Hampton Roads and 757 area. Our exact address will be provided upon booking confirmation.',
  },
  {
    id: 14,
    category: 'Facility & Equipment',
    question: 'Do you have indoor facilities?',
    answer: 'Yes! We have a fully equipped indoor training facility so we can train year-round regardless of weather. Our facility includes batting cages, pitching mounds, and state-of-the-art velocity tracking technology.',
  },
  {
    id: 15,
    category: 'Parents & Guardians',
    question: 'Can parents watch training sessions?',
    answer: 'Absolutely! Parents are welcome to observe sessions. We have a designated viewing area where you can watch your athlete train. We encourage parent involvement and will regularly communicate progress and recommendations.',
  },
  {
    id: 16,
    category: 'Parents & Guardians',
    question: 'Do you offer group rates for teams?',
    answer: 'Yes! We offer special team training packages and group rates. Contact us directly to discuss your team\'s needs and we\'ll create a customized program and pricing structure.',
  },
]

const CATEGORIES = Array.from(new Set(FAQ_DATA.map(item => item.category)))

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [openId, setOpenId] = useState<number | null>(null)

  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex min-h-screen">
      <InfoSidebar />
      <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan/10 border border-cyan/20 rounded-full mb-6">
          <HelpCircle className="w-4 h-4 text-cyan" />
          <span className="text-sm font-semibold text-cyan">Frequently Asked Questions</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          How Can We <span className="text-gradient-orange">Help You?</span>
        </h1>
        <p className="text-lg text-cyan-700 dark:text-white max-w-2xl mx-auto">
          Find answers to common questions about training at PSP.Pro
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-700 dark:text-white" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for answers..."
            className="w-full pl-12 pr-4 py-4 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan/50 transition-all"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedCategory === null
                ? 'bg-orange text-white shadow-lg shadow-orange/30'
                : 'glass-card-hover'
            }`}
          >
            All Questions
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-orange text-white shadow-lg shadow-orange/30'
                  : 'glass-card-hover'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="command-panel p-12 text-center">
            <HelpCircle className="w-16 h-16 text-cyan-700 dark:text-white mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
            <p className="text-cyan-700 dark:text-white">Try a different search term or category</p>
          </div>
        ) : (
          filteredFAQs.map(faq => (
            <div key={faq.id} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-cyan-900/20 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs text-cyan font-semibold mb-2 block">{faq.category}</span>
                  <h3 className="text-lg font-bold text-white">{faq.question}</h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-cyan-700 dark:text-white transition-transform flex-shrink-0 ${
                    openId === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 text-cyan-700 dark:text-white leading-relaxed border-t border-cyan-700/30">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Still Have Questions CTA */}
      <div className="max-w-4xl mx-auto mt-12">
        <div className="command-panel p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h3>
          <p className="text-cyan-700 dark:text-white mb-6">
            Can't find what you're looking for? Our team is here to help!
          </p>
          <a
            href="/contact"
            className="btn-primary inline-flex items-center gap-2"
          >
            <span>Contact Us</span>
            <span>→</span>
          </a>
        </div>
      </div>
      </main>
    </div>
  )
}
