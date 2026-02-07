'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp, Loader2, CheckCircle } from 'lucide-react'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { BLOG_POSTS } from '@/lib/blog-posts'

export default function BlogPage() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  const [newsletterError, setNewsletterError] = useState('')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail || !newsletterEmail.includes('@')) return
    setNewsletterLoading(true)
    setNewsletterError('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, source: 'blog' }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to subscribe')
      }

      setNewsletterSuccess(true)
      setNewsletterEmail('')
    } catch (err: any) {
      setNewsletterError(err.message || 'Something went wrong')
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <InfoSidebar />
      <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan/10 border border-cyan/20 rounded-full mb-6">
          <BookOpen className="w-4 h-4 text-cyan" />
          <span className="text-sm font-semibold text-cyan">Training Tips & Insights</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          PSP.Pro <span className="text-gradient-orange">Training Blog</span>
        </h1>
        <p className="text-lg text-cyan-800 dark:text-white max-w-2xl mx-auto">
          Expert insights, training tips, and strategies to help you reach peak athletic performance
        </p>
      </div>

      {/* Featured Post */}
      <div className="max-w-7xl mx-auto mb-16">
        <Link href={`/blog/${BLOG_POSTS[0].slug}`} className="block group">
          <div className="command-panel p-0 overflow-hidden lg:flex">
            <div className="lg:w-1/2 relative aspect-video lg:aspect-auto">
              <img
                src={BLOG_POSTS[0].thumbnail}
                alt={BLOG_POSTS[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-orange rounded-full text-xs font-semibold text-white">
                Featured
              </div>
            </div>
            <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-sm font-semibold text-cyan mb-2">{BLOG_POSTS[0].category}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-orange transition-colors">
                {BLOG_POSTS[0].title}
              </h2>
              <p className="text-cyan-700 dark:text-white mb-6 text-lg">{BLOG_POSTS[0].excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-cyan-800 dark:text-white mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(BLOG_POSTS[0].date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{BLOG_POSTS[0].readTime}</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 text-orange font-semibold group-hover:gap-3 transition-all">
                <span>Read Full Article</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* All Posts Grid */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange" />
          Latest Training Tips
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_POSTS.slice(1).map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="glass-card-hover overflow-hidden group block"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent opacity-60" />
              </div>

              <div className="p-6">
                <span className="text-xs font-semibold text-cyan mb-2 block">{post.category}</span>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-cyan-800 dark:text-white mb-4 line-clamp-2">{post.excerpt}</p>

                <div className="flex items-center justify-between text-xs text-cyan-800 dark:text-white">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="max-w-4xl mx-auto mt-16">
        <div className="command-panel p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Get Training Tips Delivered Weekly
          </h3>
          <p className="text-cyan-800 dark:text-white mb-6 max-w-2xl mx-auto">
            Join our newsletter to receive expert training advice, performance tips, and exclusive offers straight to your inbox.
          </p>

          {newsletterSuccess ? (
            <div className="flex items-center justify-center gap-2 text-green-400 font-semibold">
              <CheckCircle className="w-5 h-5" />
              <span>You&apos;re subscribed! Check your inbox for updates.</span>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubmit()}
                  className="flex-1 px-4 py-3 bg-cyan-900/30 border border-cyan-700/50 rounded-xl text-white placeholder-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan/50"
                />
                <button
                  className="btn-primary whitespace-nowrap flex items-center justify-center gap-2"
                  onClick={handleNewsletterSubmit}
                  disabled={newsletterLoading}
                >
                  {newsletterLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
              {newsletterError && (
                <p className="text-red-400 text-sm mt-2">{newsletterError}</p>
              )}
            </>
          )}

          <p className="text-xs text-cyan-800 dark:text-white mt-4">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
      </main>
    </div>
  )
}
