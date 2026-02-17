'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, Share2, BookOpen, Loader2 } from 'lucide-react'
import { InfoSidebar } from '@/components/layout/info-sidebar'
import { createClient } from '@/lib/supabase/client'
import { getBlogPostBySlug, BLOG_POSTS } from '@/lib/blog-posts'

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  category: string
  thumbnail_url: string | null
  published: boolean
  featured: boolean
  read_time: string
  created_at: string
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string

  const [post, setPost] = useState<BlogPostData | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      try {
        const supabase = createClient()

        // Fetch the post by slug
        const { data: postData, error: postError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single()

        if (postError || !postData) {
          // Fallback to static data
          const staticPost = getBlogPostBySlug(slug)
          if (staticPost) {
            setPost({
              id: staticPost.id,
              title: staticPost.title,
              slug: staticPost.slug,
              excerpt: staticPost.excerpt,
              content: staticPost.content,
              category: staticPost.category,
              thumbnail_url: staticPost.thumbnail,
              published: true,
              featured: false,
              read_time: staticPost.readTime,
              created_at: staticPost.date,
            })
            // Static related posts
            const staticRelated = BLOG_POSTS
              .filter(p => p.category === staticPost.category && p.id !== staticPost.id)
              .slice(0, 2)
            if (staticRelated.length < 2) {
              const others = BLOG_POSTS
                .filter(p => p.id !== staticPost.id && !staticRelated.find(r => r.id === p.id))
                .slice(0, 2 - staticRelated.length)
              staticRelated.push(...others)
            }
            setRelatedPosts(staticRelated.map(p => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt,
              content: '',
              category: p.category,
              thumbnail_url: p.thumbnail,
              published: true,
              featured: false,
              read_time: p.readTime,
              created_at: p.date,
            })))
          } else {
            setNotFound(true)
          }
          setLoading(false)
          return
        }

        setPost(postData)

        // Fetch related posts (same category, excluding current)
        const { data: related } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, content, category, thumbnail_url, published, featured, read_time, created_at')
          .eq('published', true)
          .neq('id', postData.id)
          .order('created_at', { ascending: false })
          .limit(4)

        if (related && related.length > 0) {
          // Prefer same category
          const sameCategory = related.filter(r => r.category === postData.category).slice(0, 2)
          const others = related.filter(r => r.category !== postData.category)
          const finalRelated = [...sameCategory]
          if (finalRelated.length < 2) {
            finalRelated.push(...others.slice(0, 2 - finalRelated.length))
          }
          setRelatedPosts(finalRelated)
        }
      } catch (err) {
        console.error('Failed to fetch blog post:', err)
        // Fallback to static
        const staticPost = getBlogPostBySlug(slug)
        if (staticPost) {
          setPost({
            id: staticPost.id,
            title: staticPost.title,
            slug: staticPost.slug,
            excerpt: staticPost.excerpt,
            content: staticPost.content,
            category: staticPost.category,
            thumbnail_url: staticPost.thumbnail,
            published: true,
            featured: false,
            read_time: staticPost.readTime,
            created_at: staticPost.date,
          })
        } else {
          setNotFound(true)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

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

  if (notFound || !post) {
    return (
      <div className="flex min-h-screen">
        <InfoSidebar />
        <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
          <div className="max-w-3xl mx-auto text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
            <p className="text-cyan-800 dark:text-white mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/blog" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  // Render markdown-style content to JSX
  const renderContent = (content: string) => {
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let inTable = false
    let tableRows: string[][] = []
    let tableHeaders: string[] = []

    const flushTable = () => {
      if (tableHeaders.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-700/30">
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="text-left p-3 text-white font-semibold">{h.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-cyan-700/20">
                    {row.map((cell, ci) => (
                      <td key={ci} className="p-3 text-cyan-800 dark:text-gray-300">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      tableHeaders = []
      tableRows = []
      inTable = false
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Table detection
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true
          tableHeaders = line.split('|').filter(s => s.trim())
          continue
        }
        // Skip separator row
        if (line.includes('---')) continue
        tableRows.push(line.split('|').filter(s => s.trim()))
        continue
      } else if (inTable) {
        flushTable()
      }

      // Headings
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-4">{line.replace('## ', '')}</h2>
        )
        continue
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3">{line.replace('### ', '')}</h3>
        )
        continue
      }

      // List items
      if (line.startsWith('- ')) {
        const content = line.replace('- ', '')
        elements.push(
          <li key={i} className="text-cyan-800 dark:text-gray-300 ml-6 mb-2 list-disc">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
          </li>
        )
        continue
      }

      // Numbered list items
      const numberedMatch = line.match(/^(\d+)\.\s(.+)/)
      if (numberedMatch) {
        elements.push(
          <li key={i} className="text-cyan-800 dark:text-gray-300 ml-6 mb-2 list-decimal">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(numberedMatch[2]) }} />
          </li>
        )
        continue
      }

      // Empty line
      if (line.trim() === '') {
        continue
      }

      // Regular paragraph
      elements.push(
        <p key={i} className="text-cyan-800 dark:text-gray-300 mb-4 leading-relaxed text-lg">
          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
        </p>
      )
    }

    if (inTable) flushTable()

    return elements
  }

  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

  const formatInlineMarkdown = (text: string) => {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-cyan-900/50 px-1.5 py-0.5 rounded text-cyan text-sm">$1</code>')
  }

  return (
    <div className="flex min-h-screen">
      <InfoSidebar />
      <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
        {/* Back link */}
        <div className="max-w-3xl mx-auto mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-cyan hover:text-orange transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article className="max-w-3xl mx-auto">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-cyan/10 border border-cyan/20 rounded-full text-xs font-semibold text-cyan mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-cyan-800 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.read_time}</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          {post.thumbnail_url && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
              <img
                src={post.thumbnail_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
            </div>
          )}

          {/* Article Content */}
          <div className="prose-custom">
            {renderContent(post.content)}
          </div>

          {/* CTA */}
          <div className="mt-12 command-panel p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Ready to Train?</h3>
            <p className="text-cyan-800 dark:text-gray-300 mb-6">
              Put these tips into practice with personalized coaching from PSP.Pro.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/booking" className="btn-primary inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Book a Session
              </Link>
              <Link href="/get-started" className="btn-ghost inline-flex items-center gap-2">
                Join the Team
              </Link>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map(related => (
                  <Link key={related.id} href={`/blog/${related.slug}`}>
                    <div className="glass-card-hover overflow-hidden group">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={related.thumbnail_url || '/images/psp pitcher.jpg'}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <span className="text-xs font-semibold text-cyan mb-1 block">{related.category}</span>
                        <h4 className="text-lg font-bold text-white group-hover:text-orange transition-colors">
                          {related.title}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  )
}
