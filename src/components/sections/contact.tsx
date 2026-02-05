'use client'

import { useState, useRef } from 'react'
import { ArrowRight, Sparkles, CheckCircle, Loader2 } from 'lucide-react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { useScrollAnimation } from '@/lib/use-scroll-animation'

// Web3Forms access key - get yours at https://web3forms.com
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || 'YOUR_ACCESS_KEY_HERE'
// hCaptcha site key - get yours at https://dashboard.hcaptcha.com
const HCAPTCHA_SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || '10000000-ffff-ffff-ffff-000000000001'

export function Contact() {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const captchaRef = useRef<HCaptcha>(null)
  const titleRef = useScrollAnimation()
  const formRef = useScrollAnimation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captchaToken) {
      alert('Please complete the captcha')
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          email,
          company,
          message,
          subject: `New Contact from ${company || email} - ShockAI`,
          from_name: 'ShockAI Contact Form',
          'h-captcha-response': captchaToken,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setStatus('success')
        setEmail('')
        setCompany('')
        setMessage('')
        setCaptchaToken(null)
        captchaRef.current?.resetCaptcha()
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 5000)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <Section id="contact" className="bg-dark-200/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div ref={titleRef} className="animate-on-scroll space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm text-secondary font-medium">Limited Spots Available</span>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                {siteConfig.contact.sectionTitle}
              </h2>
              <p className="text-xl md:text-2xl text-secondary glow-text">
                {siteConfig.contact.sectionSubtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-400 leading-relaxed">
              {siteConfig.contact.description}
            </p>

            {/* Stats/Social Proof */}
            <div className="flex flex-wrap gap-8">
              <div>
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-500">Campaigns Launched</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">50M+</div>
                <div className="text-sm text-gray-500">Impressions Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">95%</div>
                <div className="text-sm text-gray-500">Client Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div ref={formRef} className="animate-on-scroll">
            <div className="p-8 md:p-12 rounded-2xl bg-dark-100 border border-secondary/20 shadow-glow-md">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={siteConfig.contact.emailPlaceholder}
                    required
                    className="w-full px-6 py-4 bg-dark-200 border border-secondary/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-400 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your Company"
                    className="w-full px-6 py-4 bg-dark-200 border border-secondary/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">
                    Tell us about your project
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What are your marketing goals?"
                    className="w-full px-6 py-4 bg-dark-200 border border-secondary/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="flex justify-center">
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={HCAPTCHA_SITEKEY}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    theme="dark"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full group" disabled={status === 'loading' || !captchaToken}>
                  {status === 'loading' ? (
                    <><Loader2 className="mr-2 w-5 h-5 animate-spin" />Sending...</>
                  ) : status === 'success' ? (
                    <><CheckCircle className="mr-2 w-5 h-5" />Message Sent!</>
                  ) : (
                    <>{siteConfig.contact.cta}<ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  {status === 'success' ? "We'll get back to you within 24 hours" : status === 'error' ? 'Something went wrong. Try again.' : "We'll get back to you within 24 hours"}
                </p>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
