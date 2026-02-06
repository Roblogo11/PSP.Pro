'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Zap,
  Target,
  TrendingUp,
  Award,
  Play,
  CheckCircle,
  ArrowRight,
  MapPin,
  Clock,
  Users,
  Flame,
  Activity,
  LayoutDashboard
} from 'lucide-react'
import { GoogleReviews } from '@/components/google-reviews'
import { FunnelNav } from '@/components/navigation/funnel-nav'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { PLACEHOLDER_IMAGES } from '@/lib/placeholder-images'
import { useUserRole } from '@/lib/hooks/use-user-role'

export default function HomePage() {
  const router = useRouter()
  const { profile, isCoach, isAdmin, isAthlete, loading } = useUserRole()

  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (!loading && profile) {
      if (isCoach || isAdmin) {
        router.push('/admin')
      } else if (isAthlete) {
        router.push('/locker')
      }
    }
  }, [loading, profile, isCoach, isAdmin, isAthlete, router])

  // Show landing page for non-logged-in users
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is logged in, they'll be redirected by the useEffect
  if (profile) {
    return null
  }

  return (
    <main className="min-h-screen home-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={PLACEHOLDER_IMAGES.hero.main}
            alt={PLACEHOLDER_IMAGES.hero.alt}
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950/95" />
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 z-[1]" />

        {/* Cyan Glow Effect - PSP Blue */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full blur-[150px] z-[2]" style={{ background: 'radial-gradient(circle, rgba(0, 180, 216, 0.15) 0%, rgba(0, 180, 216, 0.05) 50%, transparent 100%)' }} />
        {/* Orange accent glow */}
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[150px] z-[2]" style={{ background: 'radial-gradient(circle, rgba(184, 48, 26, 0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/images/PSP-black-300x99-1.png"
              alt="PSP.Pro Logo"
              className="h-20 mx-auto"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(0, 180, 216, 0.4)) brightness(0) invert(1)',
              }}
            />
            <p className="text-sm mt-2" style={{ color: '#CBD5E1' }}>Athletic OS</p>
          </div>

          {/* Tagline */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-orange/10 border border-orange/20 rounded-full text-sm font-semibold" style={{ color: '#B8301A' }}>
              Progression Over Perfection
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-6 leading-tight" style={{ color: '#F7FAFC' }}>
            Train Like a Pro.
            <br />
            <span className="text-gradient-orange">Perform Like a Champion.</span>
          </h2>

          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto" style={{ color: '#CBD5E1' }}>
            Elite baseball and softball training in Virginia Beach. Track velocity, master mechanics,
            and dominate the diamond with data-driven performance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <button className="btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto">
                <span>Start Training</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/locker">
              <button className="btn-ghost text-lg px-8 py-4 flex items-center gap-2 mx-auto border-cyan/30 hover:border-cyan/50">
                <LayoutDashboard className="w-5 h-5" />
                <span>Access Athletic OS</span>
              </button>
            </Link>
          </div>

          {/* Key Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
            {/* Book Session - Role-aware link */}
            <Link href={(isCoach || isAdmin) ? '/admin' : '/booking'}>
              <div className="command-panel p-6 hover:scale-105 transition-all duration-300 cursor-pointer border-orange/20 hover:border-orange/50 group">
                <div className="w-12 h-12 bg-gradient-to-br from-orange to-orange-600 rounded-xl flex items-center justify-center shadow-glow-orange mb-4 group-hover:shadow-glow-orange-intense">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {(isCoach || isAdmin) ? 'Manage Bookings' : 'Book a Session'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {(isCoach || isAdmin)
                    ? 'View and manage all training sessions and athlete bookings'
                    : 'Schedule 1-on-1 training, group sessions, or video analysis with our coaches'
                  }
                </p>
              </div>
            </Link>

            {/* View Pricing */}
            <Link href="/pricing">
              <div className="command-panel p-6 hover:scale-105 transition-all duration-300 cursor-pointer border-cyan/20 hover:border-cyan/50 group">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan to-blue-500 rounded-xl flex items-center justify-center shadow-glow-cyan mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">View Pricing</h3>
                <p className="text-slate-400 text-sm">
                  Explore training packages, session rates, and save up to $200 on bundles
                </p>
              </div>
            </Link>

            {/* Meet Coaches */}
            <Link href="/about">
              <div className="command-panel p-6 hover:scale-105 transition-all duration-300 cursor-pointer border-purple-500/20 hover:border-purple-500/50 group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-glow-purple mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Meet Our Coaches</h3>
                <p className="text-slate-400 text-sm">
                  College & pro experience with proven results in velocity and mechanics
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, value: '500+', label: 'Athletes Trained', color: '#B8301A' },
              { icon: TrendingUp, value: '+5 MPH', label: 'Avg Velocity Gain', color: '#00B4D8' },
              { icon: Award, value: '100+', label: 'Training Drills', color: '#10B981' },
              { icon: Flame, value: '95%', label: 'Goal Achievement', color: '#F59E0B' },
            ].map((stat, index) => (
              <div key={index} className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: stat.color }} />
                <div className="text-3xl font-bold mb-1" style={{ color: '#F7FAFC' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: '#E2E8F0' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <GoogleReviews />

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4" style={{ color: '#F7FAFC' }}>
              Your Athletic Command Center
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#E2E8F0' }}>
              Everything you need to track progress, improve mechanics, and increase velocity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Velocity Tracking',
                description: 'Monitor your progress with detailed velocity charts and performance analytics. See your improvement over time.',
                color: '#10B981',
                image: PLACEHOLDER_IMAGES.features.velocityTracking,
                imageAlt: PLACEHOLDER_IMAGES.features.alt.velocityTracking
              },
              {
                icon: Play,
                title: 'Premium Drill Bank',
                description: 'Access 100+ professional training drills with video tutorials, categorized by mechanics, speed, and power.',
                color: '#B8301A',
                image: PLACEHOLDER_IMAGES.features.drillBank,
                imageAlt: PLACEHOLDER_IMAGES.features.alt.drillBank
              },
              {
                icon: Target,
                title: 'Personalized Training',
                description: 'Get custom drill assignments from coaches and track your completion rate. Built for baseball and softball athletes.',
                color: '#8B5CF6',
                image: PLACEHOLDER_IMAGES.features.personalizedTraining,
                imageAlt: PLACEHOLDER_IMAGES.features.alt.personalizedTraining
              },
            ].map((feature, index) => (
              <div key={index} className="glass-card-hover p-0 group overflow-hidden">
                {/* Feature Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                  {/* Icon Overlay */}
                  <div className="absolute bottom-4 left-4 p-3 bg-orange/10 backdrop-blur-sm rounded-xl border border-white/10 group-hover:shadow-glow-orange transition-all">
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-display font-bold mb-4" style={{ color: '#F7FAFC' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#E2E8F0' }} className="leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4" style={{ color: '#F7FAFC' }}>
              Training Programs
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#E2E8F0' }}>
              Choose the program that fits your goals and schedule.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$99',
                period: '/month',
                features: [
                  'Access to Drill Bank',
                  'Velocity Tracking',
                  'Progress Dashboard',
                  'Mobile App Access',
                ],
              },
              {
                name: 'Athlete',
                price: '$199',
                period: '/month',
                features: [
                  'Everything in Starter',
                  '2 Training Sessions/Week',
                  'Personalized Drill Plans',
                  'Coach Feedback',
                  'Performance Reports',
                ],
                featured: true,
              },
              {
                name: 'Elite',
                price: '$349',
                period: '/month',
                features: [
                  'Everything in Athlete',
                  '4 Training Sessions/Week',
                  '1-on-1 Coaching',
                  'Video Analysis',
                  'Nutrition Guidance',
                  'Priority Scheduling',
                ],
              },
            ].map((program, index) => (
              <div
                key={index}
                className={`glass-card p-8 ${program.featured ? 'border-2 shadow-glow-orange' : ''}`}
                style={program.featured ? { borderColor: '#B8301A' } : {}}
              >
                {program.featured && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 text-white text-sm font-semibold rounded-full" style={{ backgroundColor: '#B8301A' }}>
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-display font-bold mb-2" style={{ color: '#F7FAFC' }}>
                  {program.name}
                </h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gradient-orange">{program.price}</span>
                  <span style={{ color: '#CBD5E1' }}>{program.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3" style={{ color: '#CBD5E1' }}>
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#B8301A' }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <button className={program.featured ? 'btn-primary w-full' : 'btn-ghost w-full'}>
                    Get Started
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-12 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-6" style={{ color: '#B8301A' }} />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" style={{ color: '#F7FAFC' }}>
              Located in Virginia Beach
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#CBD5E1' }}>
              Proudly serving athletes in Virginia Beach, Norfolk, Chesapeake, and Hampton Roads.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center" style={{ color: '#E2E8F0' }}>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#B8301A' }} />
                <span>Mon-Fri: 3PM - 9PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#B8301A' }} />
                <span>Sat: 9AM - 5PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6" style={{ color: '#F7FAFC' }}>
            Ready to Level Up?
          </h2>
          <p className="text-xl mb-8" style={{ color: '#CBD5E1' }}>
            Join hundreds of athletes who are improving their game with data-driven training.
          </p>
          <Link href="/signup">
            <button className="btn-primary text-lg px-10 py-5 flex items-center gap-3 mx-auto">
              <span>Start Your Journey</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6" style={{ color: '#B8301A' }} />
                <span className="font-display font-bold text-lg" style={{ color: '#F7FAFC' }}>PSP.Pro</span>
              </div>
              <p className="text-sm" style={{ color: '#CBD5E1' }}>
                Progression Over Perfection
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#F7FAFC' }}>Platform</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#CBD5E1' }}>
                <li><Link href="/locker" className="hover:text-orange transition-colors">Dashboard</Link></li>
                <li><Link href="/drills" className="hover:text-orange transition-colors">Drill Bank</Link></li>
                <li><Link href="/login" className="hover:text-orange transition-colors">Login</Link></li>
                <li><Link href="/signup" className="hover:text-orange transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#F7FAFC' }}>Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#CBD5E1' }}>
                <li><Link href="/about" className="hover:text-orange transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-orange transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#F7FAFC' }}>Contact</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#CBD5E1' }}>
                <li>Virginia Beach, VA</li>
                <li>info@propersports.pro</li>
                <li>(757) 555-0100</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm" style={{ color: '#CBD5E1' }}>
            <p>&copy; {new Date().getFullYear()} Proper Sports Performance. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Funnel Navigation */}
      <FunnelNav />
    </main>
  )
}
