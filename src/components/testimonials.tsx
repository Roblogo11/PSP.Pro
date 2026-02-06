'use client'

import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight, TrendingUp, Award } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  sport: string
  image?: string
  rating: number
  quote: string
  stats?: {
    before: string
    after: string
    improvement: string
  }
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Marcus Johnson',
    role: 'High School Pitcher',
    sport: 'Baseball',
    rating: 5,
    quote: 'PSP.Pro transformed my game! Coach helped me add 6 MPH to my fastball in just 8 weeks. The data-driven approach and personalized training made all the difference.',
    stats: {
      before: '78 MPH',
      after: '84 MPH',
      improvement: '+6 MPH',
    },
  },
  {
    id: 2,
    name: 'Sarah Mitchell',
    role: 'College Softball Player',
    sport: 'Softball',
    rating: 5,
    quote: 'The mechanics analysis completely changed my swing. I went from struggling to make contact to being one of the top hitters on my team. Best investment I\'ve made in my career!',
    stats: {
      before: '.245 BA',
      after: '.387 BA',
      improvement: '+.142',
    },
  },
  {
    id: 3,
    name: 'David Chen',
    role: 'Parent of Youth Athlete',
    sport: 'Baseball',
    rating: 5,
    quote: 'My son loves training at PSP.Pro! The coaches are professional, knowledgeable, and really care about the athletes. We\'ve seen tremendous growth in both skill and confidence.',
  },
  {
    id: 4,
    name: 'Tyler Rodriguez',
    role: 'Middle School Pitcher',
    sport: 'Baseball',
    rating: 5,
    quote: 'I learned proper mechanics and my arm feels stronger than ever. The coaches teach you the right way to throw and help you understand the science behind it all.',
    stats: {
      before: '62 MPH',
      after: '68 MPH',
      improvement: '+6 MPH',
    },
  },
  {
    id: 5,
    name: 'Emma Williams',
    role: 'High School Softball Player',
    sport: 'Softball',
    rating: 5,
    quote: 'The recovery and mobility work has been a game-changer. I used to deal with constant shoulder pain, but now I feel great and my velocity is at an all-time high!',
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }

  const current = TESTIMONIALS[currentIndex]

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange/10 border border-orange/20 rounded-full mb-4">
            <Award className="w-4 h-4 text-orange" />
            <span className="text-sm font-semibold text-orange">Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            What Athletes Are <span className="text-gradient-orange">Saying</span>
          </h2>
          <p className="text-lg text-cyan-700 dark:text-white max-w-2xl mx-auto">
            Real results from real athletes training at PSP.Pro
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="command-panel p-8 md:p-12 relative">
            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange/20 border border-white/20 hover:border-orange/50 flex items-center justify-center transition-all pointer-events-auto"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange/20 border border-white/20 hover:border-orange/50 flex items-center justify-center transition-all pointer-events-auto"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Stars */}
            <div className="flex items-center justify-center gap-1 mb-6">
              {Array.from({ length: current.rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-orange text-orange" />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl text-white text-center mb-8 leading-relaxed">
              "{current.quote}"
            </blockquote>

            {/* Stats (if available) */}
            {current.stats && (
              <div className="mb-8 p-6 rounded-xl bg-cyan-50/50 border border-cyan-200/40">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-semibold text-green-400 uppercase tracking-wide">
                    Performance Improvement
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-cyan-700 dark:text-white mb-1">Before</p>
                    <p className="text-2xl font-bold text-white">{current.stats.before}</p>
                  </div>
                  <div>
                    <p className="text-sm text-orange mb-1">Improvement</p>
                    <p className="text-2xl font-bold text-orange">{current.stats.improvement}</p>
                  </div>
                  <div>
                    <p className="text-sm text-cyan-700 dark:text-white mb-1">After</p>
                    <p className="text-2xl font-bold text-cyan">{current.stats.after}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Author */}
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-1">{current.name}</p>
              <p className="text-sm text-cyan-700 dark:text-white">{current.role}</p>
              <p className="text-xs text-cyan-800 dark:text-white mt-1">{current.sport}</p>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-orange w-8' : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Grid of All Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.slice(0, 3).map((testimonial) => (
            <div
              key={testimonial.id}
              className="glass-card p-6 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setCurrentIndex(testimonial.id - 1)}
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange text-orange" />
                ))}
              </div>
              <p className="text-sm text-cyan-700 dark:text-white mb-4 line-clamp-3">"{testimonial.quote}"</p>
              <div className="pt-3 border-t border-cyan-200/40">
                <p className="text-sm font-bold text-white">{testimonial.name}</p>
                <p className="text-xs text-cyan-800 dark:text-white">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
