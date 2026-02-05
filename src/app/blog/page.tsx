'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, BookOpen, Search, Calendar, Menu, X } from 'lucide-react'
import { GenerativeMotion, FloatingShapes, GridPattern } from '@/components/generative-motion'
import { FunnelNav } from '@/components/navigation/funnel-nav'

type PanelId = 'hero' | 'featured' | 'all' | 'contact'

interface NavItem {
  id: PanelId
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Quick Start', icon: Home },
  { id: 'featured', label: 'Featured Posts', icon: BookOpen },
  { id: 'all', label: 'All Blogs', icon: Search },
  { id: 'contact', label: 'Subscribe', icon: Calendar },
]

const blogPosts = [
  {
    id: 1,
    title: '📸 Free Photography Course: Things to Know Before Picking Up the Camera',
    excerpt: 'Before diving into photography, understand your camera, lighting, composition, and gear essentials. Interactive space-themed experience included!',
    category: 'Photography',
    featured: true,
    slug: 'photography-course',
  },
  {
    id: 2,
    title: '🤖 AI vs Websites: Who\'s Really Running the Show?',
    excerpt: 'AI builds fast, but humans build brands. Discover the hybrid approach that blends AI efficiency with cinematic human creativity.',
    category: 'AI & Technology',
    featured: true,
    slug: 'ai-vs-websites',
  },
  {
    id: 3,
    title: '⚡ Why We Moved Beyond WordPress: The Case for Modern JavaScript',
    excerpt: 'WordPress was revolutionary in 2005. In 2026, modern JavaScript frameworks deliver faster sites, better security, and unlimited customization.',
    category: 'Web Development',
    featured: true,
    slug: 'using-wordpress',
  },
  {
    id: 4,
    title: '📝 How to Cite a Website — Quick Guide (APA, MLA, Chicago)',
    excerpt: 'Practical examples for APA, MLA, and Chicago styles with edge-case rules for no author, no date, and archived pages.',
    category: 'Resources',
    featured: false,
    slug: 'cite-website-guide',
  },
  {
    id: 5,
    title: '🌐 How Websites Work With ShockMP',
    excerpt: 'Transform underperforming websites into high-converting digital assets. SEO, performance optimization, and custom development.',
    category: 'Web Development',
    featured: false,
    slug: 'websites-shockmp',
  },
  {
    id: 6,
    title: '🍪 Deconstructing the Web Cookie',
    excerpt: 'HTTP cookies explained: session vs persistent, first vs third-party, privacy regulations, and security best practices.',
    category: 'Technology',
    featured: false,
    slug: 'web-cookies',
  },
  {
    id: 7,
    title: '🎯 30 Signature Headshot & Portrait Styles for Professionals',
    excerpt: 'From corporate boardrooms to neon-soaked urban nights — explore 30 professional headshot styles for Norfolk, Virginia Beach & Hampton Roads.',
    category: 'Photography',
    featured: true,
    slug: 'headshot-portrait-styles',
  },
]

export default function BlogPage() {
  const [activePanel, setActivePanel] = useState<PanelId>('hero')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleNavClick = (panelId: PanelId) => {
    setActivePanel(panelId)
    setIsMobileMenuOpen(false)
  }

  const filterPosts = (posts: typeof blogPosts) => {
    if (!searchQuery.trim()) return posts

    const query = searchQuery.toLowerCase()
    return posts.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query)
    )
  }

  const featuredPosts = filterPosts(blogPosts.filter(post => post.featured))
  const allPosts = filterPosts(blogPosts)

  return (
    <div className="min-h-screen bg-dark-300 text-white flex">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-dark-200/50 backdrop-blur-sm border-r border-secondary/10 fixed h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
            ShockAI Blog
          </h2>
          <p className="text-sm text-gray-400">Insights & Tutorials</p>
        </div>
        <nav className="flex-1 px-4 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  activePanel === item.id
                    ? 'bg-secondary/20 text-secondary border border-secondary/30'
                    : 'text-gray-400 hover:text-white hover:bg-dark-100/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-dark-200/90 backdrop-blur-sm rounded-lg border border-secondary/20"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-dark-300/95 backdrop-blur-md">
          <nav className="flex flex-col gap-2 p-6 mt-20">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all ${
                    activePanel === item.id
                      ? 'bg-secondary/20 text-secondary border border-secondary/30'
                      : 'text-gray-400 hover:text-white hover:bg-dark-100/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Hero Panel */}
        {activePanel === 'hero' && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/80 via-dark-200/80 to-dark-100/80" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                <span className="text-secondary font-semibold">ShockAI Blog</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-secondary to-accent bg-clip-text text-transparent">
                Insights & Tutorials
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Learn about AI, photography, web development, and creative production from the ShockAI team.
              </p>

              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <button
                  onClick={() => setActivePanel('featured')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group"
                >
                  <BookOpen className="w-10 h-10 text-secondary mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Featured Posts</h3>
                  <p className="text-gray-400 text-sm">Top articles</p>
                </button>

                <button
                  onClick={() => setActivePanel('all')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all group"
                >
                  <Search className="w-10 h-10 text-accent mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">All Blogs</h3>
                  <p className="text-gray-400 text-sm">Browse everything</p>
                </button>

                <button
                  onClick={() => setActivePanel('contact')}
                  className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group"
                >
                  <Calendar className="w-10 h-10 text-secondary mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold mb-2">Subscribe</h3>
                  <p className="text-gray-400 text-sm">Get updates</p>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Featured Panel */}
        {activePanel === 'featured' && (
          <section className="relative min-h-screen overflow-hidden">
            <FloatingShapes />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
                  <span className="text-secondary font-semibold">Featured</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Featured Posts</h2>
                <p className="text-xl text-gray-300 mb-6">Our most popular articles and tutorials</p>

                <div className="max-w-md mx-auto mb-8">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by title, keyword, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-3 bg-dark-200/50 border border-secondary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50"
                    />
                  </div>
                </div>
              </div>

              {featuredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No featured posts found matching your search.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {featuredPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <article className="p-8 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group cursor-pointer">
                        <div className="mb-4">
                          <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary text-sm rounded-full">
                            {post.category}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 group-hover:text-secondary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed mb-4">{post.excerpt}</p>
                        <span className="text-secondary font-semibold hover:underline">
                          Read More →
                        </span>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* All Blogs Panel */}
        {activePanel === 'all' && (
          <section className="relative min-h-screen overflow-hidden">
            <GridPattern />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                  <span className="text-accent font-semibold">All Posts</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">All Blogs</h2>
                <p className="text-xl text-gray-300 mb-6">Browse our complete collection of articles</p>

                <div className="max-w-md mx-auto mb-8">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by title, keyword, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-3 bg-dark-200/50 border border-accent/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent/50"
                    />
                  </div>
                </div>
              </div>

              {allPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No posts found matching your search.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <article className="p-6 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all group cursor-pointer">
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
                            {post.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-3 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <span className="text-secondary text-sm font-semibold hover:underline">
                          Read More →
                        </span>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Subscribe Panel */}
        {activePanel === 'contact' && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <GenerativeMotion />
            <div className="absolute inset-0 bg-gradient-to-br from-dark-300/90 via-dark-200/90 to-dark-100/90" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
              <div className="inline-block mb-6 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
                <span className="text-accent font-semibold">Stay Updated</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Subscribe to Our Blog
              </h2>

              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Get the latest insights on AI, photography, web development, and creative production delivered to your inbox.
              </p>

              <div className="max-w-md mx-auto mb-8">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="w-full px-6 py-4 bg-dark-200/50 border border-secondary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50 mb-4"
                />
                <button className="w-full px-8 py-4 bg-gradient-to-r from-secondary to-accent rounded-lg font-semibold hover:scale-105 transition-transform">
                  Subscribe Now
                </button>
                <p className="text-gray-400 text-sm mt-4">
                  Sign-up for AI blogs & tips. No spam, unsubscribe anytime.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="p-4 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <div className="text-3xl font-bold text-secondary mb-2">50+</div>
                  <p className="text-gray-400 text-sm">Articles Published</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-accent/10">
                  <div className="text-3xl font-bold text-accent mb-2">Weekly</div>
                  <p className="text-gray-400 text-sm">New Content</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-200/50 backdrop-blur-sm border border-secondary/10">
                  <div className="text-3xl font-bold text-secondary mb-2">Free</div>
                  <p className="text-gray-400 text-sm">Always Free</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <FunnelNav />
      </main>
    </div>
  )
}
