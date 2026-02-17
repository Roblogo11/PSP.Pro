'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp, Loader2, CheckCircle } from 'lucide-react'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { createClient } from '@/lib/supabase/client'
import { BLOG_POSTS } from '@/lib/blog-posts'

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string
  thumbnail_url: string | null
  published: boolean
  featured: boolean
  read_time: string
  created_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostData[]>([])
  const [loading, setLoading] = useState(true)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  const [newsletterError, setNewsletterError] = useState('')

  useEffect(() => {
    async function fetchPosts() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, category, thumbnail_url, published, featured, read_time, created_at')
          .eq('published', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data && data.length > 0) {
          setPosts(data)
        } else {
          // Fallback to static data
          setPosts(BLOG_POSTS.map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            category: p.category,
            thumbnail_url: p.thumbnail,
            published: true,
            featured: false,
            read_time: p.readTime,
            created_at: p.date,
          })))
        }
      } catch (err) {
        console.error('Failed to fetch blog posts:', err)
        // Fallback to static data
        setPosts(BLOG_POSTS.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          category: p.category,
          thumbnail_url: p.thumbnail,
          published: true,
          featured: false,
          read_time: p.readTime,
          created_at: p.date,
        })))
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

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

  // Find featured post (first featured, or first post)
  const featuredPost = posts.find(p => p.featured) || posts[0]
  const otherPosts = posts.filter(p => p.id !== featuredPost?.id)

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <InfoSidebar />
        <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-orange animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  if (!featuredPost) {
    return (
      <div className="flex min-h-screen">
        <InfoSidebar />
        <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Blog Coming Soon</h1>
            <p className="text-cyan-800 dark:text-white">Check back for training tips and insights.</p>
          </div>
        </main>
      </div>
    )
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
        <Link href={`/blog/${featuredPost.slug}`} className="block group">
          <div className="command-panel p-0 overflow-hidden lg:flex">
            <div className="lg:w-1/2 relative aspect-video lg:aspect-auto">
              <img
                src={featuredPost.thumbnail_url || '/images/psp pitcher.jpg'}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-orange rounded-full text-xs font-semibold text-white">
                Featured
              </div>
            </div>
            <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-sm font-semibold text-cyan mb-2">{featuredPost.category}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-orange transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-cyan-700 dark:text-white mb-6 text-lg">{featuredPost.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-cyan-800 dark:text-white mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(featuredPost.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{featuredPost.read_time}</span>
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
      {otherPosts.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange" />
            Latest Training Tips
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherPosts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="glass-card-hover overflow-hidden group block"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={post.thumbnail_url || '/images/psp pitcher.jpg'}
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
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.read_time}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
