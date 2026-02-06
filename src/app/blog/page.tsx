'use client'

import Link from 'next/link'
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp } from 'lucide-react'
import { InfoSidebar } from '@/components/layout/info-sidebar'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  thumbnail: string
  slug: string
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '5 Keys to Increasing Pitching Velocity',
    excerpt: 'Learn the proven techniques that have helped our athletes gain 3-7 MPH on their fastball in just 12 weeks. Mechanics, strength training, and recovery all play a role.',
    category: 'Pitching',
    date: '2026-02-01',
    readTime: '5 min read',
    thumbnail: 'https://images.unsplash.com/photo-1556055078-0d563c7f7fb8?w=800&auto=format&fit=crop',
    slug: 'increasing-pitching-velocity',
  },
  {
    id: '2',
    title: 'The Science of Hitting: Launch Angle & Exit Velocity',
    excerpt: 'Understanding the physics behind power hitting. How launch angle and exit velocity combine to create extra-base hits and home runs.',
    category: 'Hitting',
    date: '2026-01-28',
    readTime: '6 min read',
    thumbnail: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop',
    slug: 'science-of-hitting',
  },
  {
    id: '3',
    title: 'Arm Care Routine Every Pitcher Should Follow',
    excerpt: 'Prevent injury and maintain peak performance with this comprehensive arm care routine. Includes exercises, stretches, and recovery protocols.',
    category: 'Recovery',
    date: '2026-01-25',
    readTime: '8 min read',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop',
    slug: 'arm-care-routine',
  },
  {
    id: '4',
    title: 'Speed Training: First Step Quickness Drills',
    excerpt: 'Steal more bases and beat out ground balls with improved first-step explosiveness. These drills will transform your speed on the basepaths.',
    category: 'Speed & Agility',
    date: '2026-01-22',
    readTime: '5 min read',
    thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop',
    slug: 'speed-training-drills',
  },
  {
    id: '5',
    title: 'Nutrition for Peak Athletic Performance',
    excerpt: 'What you eat directly impacts your training results. Learn the nutrition strategies our athletes use to fuel performance and recovery.',
    category: 'Nutrition',
    date: '2026-01-19',
    readTime: '7 min read',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop',
    slug: 'nutrition-for-athletes',
  },
  {
    id: '6',
    title: 'Mental Game: Building Confidence at the Plate',
    excerpt: 'The mental side of hitting is just as important as mechanics. Develop the mindset that separates good hitters from great ones.',
    category: 'Mental Game',
    date: '2026-01-15',
    readTime: '6 min read',
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop',
    slug: 'mental-game-hitting',
  },
]

const CATEGORIES = ['All', ...Array.from(new Set(BLOG_POSTS.map(post => post.category)))]

export default function BlogPage() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
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
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
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
              <p className="text-slate-300 mb-6 text-lg">{BLOG_POSTS[0].excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
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
              className="glass-card-hover overflow-hidden group"
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
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{post.excerpt}</p>

                <div className="flex items-center justify-between text-xs text-slate-500">
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
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Join our newsletter to receive expert training advice, performance tips, and exclusive offers straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan/50"
            />
            <button className="btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
      </main>
    </div>
  )
}
