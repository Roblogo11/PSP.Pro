import Link from 'next/link'
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

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />

        {/* Cyan Glow Effect - PSP Blue */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full blur-[150px]" style={{ background: 'radial-gradient(circle, rgba(0, 180, 216, 0.15) 0%, rgba(0, 180, 216, 0.05) 50%, transparent 100%)' }} />
        {/* Orange accent glow */}
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full blur-[150px]" style={{ background: 'radial-gradient(circle, rgba(255, 75, 43, 0.08) 0%, transparent 70%)' }} />

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
            <p className="text-sm mt-2" style={{ color: '#4A5568' }}>Athletic OS</p>
          </div>

          {/* Tagline */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-orange/10 border border-orange/20 rounded-full text-sm font-semibold" style={{ color: '#FF4B2B' }}>
              Progression Over Perfection
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight" style={{ color: '#F7FAFC' }}>
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

          {/* Dashboard CTA Card */}
          <div className="command-panel max-w-2xl mx-auto p-8 mb-20 border-cyan/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-velocity rounded-xl flex items-center justify-center shadow-glow-orange">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">Athletic OS Dashboard</h3>
                <p className="text-slate-400 text-sm">Track progress • Analyze drills • Book sessions</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6 text-left">
              Access your personalized training dashboard to view velocity gains, drill history, upcoming sessions, and performance analytics.
            </p>
            <div className="flex gap-3">
              <Link href="/login" className="flex-1">
                <button className="btn-primary w-full">Login to Dashboard</button>
              </Link>
              <Link href="/signup" className="flex-1">
                <button className="btn-ghost w-full border-orange/30">Create Account</button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, value: '500+', label: 'Athletes Trained', color: '#FF4B2B' },
              { icon: TrendingUp, value: '+5 MPH', label: 'Avg Velocity Gain', color: '#00B4D8' },
              { icon: Award, value: '100+', label: 'Training Drills', color: '#10B981' },
              { icon: Flame, value: '95%', label: 'Goal Achievement', color: '#F59E0B' },
            ].map((stat, index) => (
              <div key={index} className="glass-card p-6 hover:scale-105 transition-transform duration-300">
                <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: stat.color }} />
                <div className="text-3xl font-bold mb-1" style={{ color: '#F7FAFC' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: '#4A5568' }}>{stat.label}</div>
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
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#4A5568' }}>
              Everything you need to track progress, improve mechanics, and increase velocity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Velocity Tracking',
                description: 'Monitor your progress with detailed velocity charts and performance analytics. See your improvement over time.',
                color: '#10B981'
              },
              {
                icon: Play,
                title: 'Premium Drill Bank',
                description: 'Access 100+ professional training drills with video tutorials, categorized by mechanics, speed, and power.',
                color: '#FF4B2B'
              },
              {
                icon: Target,
                title: 'Personalized Training',
                description: 'Get custom drill assignments from coaches and track your completion rate. Built for baseball and softball athletes.',
                color: '#8B5CF6'
              },
            ].map((feature, index) => (
              <div key={index} className="glass-card-hover p-8 group">
                <div className="p-4 bg-orange/10 rounded-xl w-fit mb-6 group-hover:shadow-glow-orange transition-all">
                  <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4" style={{ color: '#F7FAFC' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#4A5568' }} className="leading-relaxed">
                  {feature.description}
                </p>
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
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#4A5568' }}>
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
                style={program.featured ? { borderColor: '#FF4B2B' } : {}}
              >
                {program.featured && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 text-white text-sm font-semibold rounded-full" style={{ backgroundColor: '#FF4B2B' }}>
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-display font-bold mb-2" style={{ color: '#F7FAFC' }}>
                  {program.name}
                </h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gradient-orange">{program.price}</span>
                  <span style={{ color: '#4A5568' }}>{program.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3" style={{ color: '#CBD5E1' }}>
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#FF4B2B' }} />
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
            <MapPin className="w-12 h-12 mx-auto mb-6" style={{ color: '#FF4B2B' }} />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4" style={{ color: '#F7FAFC' }}>
              Located in Virginia Beach
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#CBD5E1' }}>
              Proudly serving athletes in Virginia Beach, Norfolk, Chesapeake, and Hampton Roads.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center" style={{ color: '#4A5568' }}>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#FF4B2B' }} />
                <span>Mon-Fri: 3PM - 9PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#FF4B2B' }} />
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
                <Zap className="w-6 h-6" style={{ color: '#FF4B2B' }} />
                <span className="font-display font-bold text-lg" style={{ color: '#F7FAFC' }}>PSP.Pro</span>
              </div>
              <p className="text-sm" style={{ color: '#4A5568' }}>
                Progression Over Perfection
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#F7FAFC' }}>Platform</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#4A5568' }}>
                <li><Link href="/locker" className="hover:text-orange transition-colors">Dashboard</Link></li>
                <li><Link href="/drills" className="hover:text-orange transition-colors">Drill Bank</Link></li>
                <li><Link href="/login" className="hover:text-orange transition-colors">Login</Link></li>
                <li><Link href="/signup" className="hover:text-orange transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#F7FAFC' }}>Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#4A5568' }}>
                <li><Link href="/about" className="hover:text-orange transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-orange transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: '#F7FAFC' }}>Contact</h4>
              <ul className="space-y-2 text-sm" style={{ color: '#4A5568' }}>
                <li>Virginia Beach, VA</li>
                <li>info@propersports.pro</li>
                <li>(757) 555-0100</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm" style={{ color: '#4A5568' }}>
            <p>&copy; {new Date().getFullYear()} Proper Sports Performance. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Funnel Navigation */}
      <FunnelNav />
    </main>
  )
}
