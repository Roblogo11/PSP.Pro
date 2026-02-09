'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { User, Target, Calendar, CheckCircle, ArrowRight, Mail, Phone, MapPin, Package, Info, Rocket } from 'lucide-react'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { FunnelNav } from '@/components/navigation/funnel-nav'

export default function GetStartedPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    position: '',
    experience: '',
    goals: [] as string[],
    availability: '',
    additionalInfo: '',
  })

  return (
    <div className="flex min-h-screen">
      <InfoSidebar />
      <main className="flex-1 pb-24">
      {/* Hero Image Banner */}
      <div className="relative px-6 py-20 md:py-28 overflow-hidden">
        <Image
          src="/images/Coastal Softball Home Run.jpg"
          alt="PSP softball home run action"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/80 to-slate-950/90" />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Get <span className="text-gradient-orange">Started</span>
          </h1>
          <p className="text-xl text-white mb-4">
            Ready to take your baseball or softball game to the next level? Let&apos;s get you set up for success.
          </p>
          <p className="text-white/80">
            Complete this form to schedule your first training session at our Virginia Beach facility.
          </p>
        </div>
      </div>

      <div className="p-4 md:p-8">
      {/* Personal Information */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-white">Personal Information</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
              placeholder="John"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
              placeholder="Athlete"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
              placeholder="athlete@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
              placeholder="(757) 555-0100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2">
              Age *
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
              placeholder="16"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2">
              Primary Position *
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
            >
              <option value="">Select Position</option>
              <option value="pitcher">Pitcher</option>
              <option value="catcher">Catcher</option>
              <option value="infield">Infield</option>
              <option value="outfield">Outfield</option>
            </select>
          </div>
        </div>
      </div>

      {/* Athlete Image */}
      <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
        <Image
          src="/images/PSP Softball Athlete.jpg"
          alt="PSP softball athlete training"
          fill
          quality={80}
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
      </div>

      {/* Training Goals */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8 text-cyan" />
          <h2 className="text-2xl font-bold text-white">Training Goals</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2">
            Experience Level *
          </label>
          <select
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
          >
            <option value="">Select Experience</option>
            <option value="beginner">Beginner (0-2 years)</option>
            <option value="intermediate">Intermediate (3-5 years)</option>
            <option value="advanced">Advanced (6+ years)</option>
            <option value="elite">Elite/Competitive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-4">
            What are your training goals? (Select all that apply)
          </label>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Increase velocity',
              'Improve mechanics',
              'Build strength & power',
              'Enhance mobility',
              'Prevent injuries',
              'Mental performance',
            ].map((goal) => (
              <label
                key={goal}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  formData.goals.includes(goal)
                    ? 'bg-orange/20 border-orange/50'
                    : 'bg-cyan-900/20 border-cyan-700/50 hover:border-orange/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.goals.includes(goal)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, goals: [...formData.goals, goal] })
                    } else {
                      setFormData({ ...formData, goals: formData.goals.filter(g => g !== goal) })
                    }
                  }}
                  className="w-5 h-5 rounded border-cyan-600/50 bg-cyan-900 text-orange focus:ring-cyan"
                />
                <span className={formData.goals.includes(goal) ? 'text-white' : ''}>{goal}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="command-panel mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8 text-orange" />
          <h2 className="text-2xl font-bold text-white">Availability</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2">
            Preferred Training Days *
          </label>
          <select
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white focus:border-orange focus:outline-none transition-colors"
          >
            <option value="">Select Availability</option>
            <option value="weekday-afternoon">Weekday Afternoons (3-6 PM)</option>
            <option value="weekday-evening">Weekday Evenings (6-9 PM)</option>
            <option value="weekend-morning">Weekend Mornings (9 AM-12 PM)</option>
            <option value="weekend-afternoon">Weekend Afternoons (12-5 PM)</option>
            <option value="flexible">Flexible Schedule</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-cyan-700 dark:text-white mb-2">
            Additional Information
          </label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white focus:border-orange focus:outline-none transition-colors resize-none"
            placeholder="Tell us about any injuries, specific goals, or questions you have..."
          />
        </div>
      </div>

      {/* Submit Section */}
      <div className="command-panel mb-6 text-center">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Ready to Start?</h2>
        </div>

        <p className="text-cyan-700 dark:text-white mb-8 max-w-2xl mx-auto">
          Our team will review your information and reach out within 24 hours to schedule your first session. We&apos;ll discuss your goals and create a personalized training plan.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/pricing">
            <button className="btn-ghost px-8 py-4">
              View Pricing
            </button>
          </Link>
          <button
            onClick={() => {
              const subject = encodeURIComponent(`PSP.Pro New Athlete Inquiry: ${formData.firstName} ${formData.lastName}`)
              const body = encodeURIComponent(
                `Name: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nAge: ${formData.age}\nPosition: ${formData.position}\nExperience: ${formData.experience}\nGoals: ${formData.goals.join(', ')}\nAvailability: ${formData.availability}\n\nAdditional Info:\n${formData.additionalInfo}`
              )
              window.open(`mailto:info@propersports.pro?subject=${subject}&body=${body}`, '_self')
              setTimeout(() => router.push('/signup'), 500)
            }}
            className="btn-primary px-8 py-4 flex items-center gap-2 justify-center"
          >
            <span>Submit & Book Session</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-cyan-800 dark:text-white text-sm mt-6">
          <MapPin className="w-4 h-4 inline mr-1" />
          Training Location: Virginia Beach, VA
        </p>
      </div>

      {/* Continue Exploring */}
      <div className="command-panel">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Continue Exploring</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/pricing" className="glass-card-hover p-6 text-center group">
            <Package className="w-8 h-8 text-orange mb-3 mx-auto" />
            <h3 className="font-bold text-white group-hover:text-orange transition-colors">View Pricing</h3>
            <p className="text-sm text-cyan-800 dark:text-white mt-2">Training programs & packages</p>
            <div className="inline-flex items-center gap-1 text-orange text-sm font-semibold mt-3">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link href="/about" className="glass-card-hover p-6 text-center group">
            <Info className="w-8 h-8 text-cyan mb-3 mx-auto" />
            <h3 className="font-bold text-white group-hover:text-cyan transition-colors">About PSP</h3>
            <p className="text-sm text-cyan-800 dark:text-white mt-2">Learn about our mission</p>
            <div className="inline-flex items-center gap-1 text-cyan text-sm font-semibold mt-3">
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link href="/contact" className="glass-card-hover p-6 text-center group">
            <Mail className="w-8 h-8 text-orange mb-3 mx-auto" />
            <h3 className="font-bold text-white group-hover:text-orange transition-colors">Contact Us</h3>
            <p className="text-sm text-cyan-800 dark:text-white mt-2">Questions? We&apos;re here to help</p>
            <div className="inline-flex items-center gap-1 text-orange text-sm font-semibold mt-3">
              <span>Reach Out</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
      </div>
      </main>

      <FunnelNav />
    </div>
  )
}
