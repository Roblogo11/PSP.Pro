'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare } from 'lucide-react'
import { GoogleReviews } from '@/components/google-reviews'
import { InfoSidebar } from '@/components/layout/info-sidebar'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interest: 'training',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    setLoading(false)
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center command-panel p-8">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Message Sent!</h1>
          <p className="text-slate-400 mb-6">
            Thanks for reaching out! We'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-ghost"
          >
            Send Another Message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <InfoSidebar />
      <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Get in <span className="text-gradient-orange">Touch</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl">
          Ready to elevate your game? Have questions about our training programs? We're here to help you reach your athletic potential.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="space-y-6">
          {/* Location */}
          <div className="command-panel p-6">
            <div className="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-cyan" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Training Facility</h3>
            <p className="text-slate-400">
              Virginia Beach, VA<br />
              Hampton Roads / 757 Area
            </p>
          </div>

          {/* Email */}
          <div className="command-panel p-6">
            <div className="w-12 h-12 bg-orange/10 rounded-xl flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-orange" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Email Us</h3>
            <a
              href="mailto:info@propersports.pro"
              className="text-slate-400 hover:text-orange transition-colors"
            >
              info@propersports.pro
            </a>
          </div>

          {/* Phone */}
          <div className="command-panel p-6">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Call or Text</h3>
            <a
              href="tel:+17571234567"
              className="text-slate-400 hover:text-orange transition-colors"
            >
              (757) 123-4567
            </a>
          </div>

          {/* Hours */}
          <div className="command-panel p-6">
            <h3 className="text-lg font-bold text-white mb-4">Training Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Monday - Friday</span>
                <span className="text-white font-semibold">3PM - 9PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Saturday</span>
                <span className="text-white font-semibold">9AM - 5PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sunday</span>
                <span className="text-white font-semibold">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="command-panel p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange/50 transition-all"
                  placeholder="John Smith"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange/50 transition-all"
                    placeholder="athlete@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange/50 transition-all"
                    placeholder="(757) 123-4567"
                  />
                </div>
              </div>

              {/* Interest */}
              <div>
                <label htmlFor="interest" className="block text-sm font-medium text-slate-300 mb-2">
                  I'm Interested In *
                </label>
                <select
                  id="interest"
                  name="interest"
                  required
                  value={formData.interest}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange/50 transition-all"
                >
                  <option value="training">1-on-1 Training Sessions</option>
                  <option value="group">Group Training</option>
                  <option value="assessment">Performance Assessment</option>
                  <option value="packages">Training Packages</option>
                  <option value="other">Other / General Inquiry</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange/50 focus:border-orange/50 transition-all resize-none"
                  placeholder="Tell us about your goals, experience level, and what you're looking to achieve..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                We typically respond within 24 hours during business days
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Google Reviews */}
      <div className="max-w-6xl mx-auto mt-12">
        <GoogleReviews />
      </div>

      {/* Google Maps */}
      <div className="max-w-6xl mx-auto mt-12">
        <div className="command-panel p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Find Our Facility</h2>
          <div className="rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d817928.3911902515!2d-77.02362511877753!3d36.793764492389535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa7b9ac5c0e36dc21%3A0x91c996d6f9dfaa64!2sProPer%20Sports%20Performance%20LLC!5e0!3m2!1sen!2sus!4v1770330366049!5m2!1sen!2sus"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}
