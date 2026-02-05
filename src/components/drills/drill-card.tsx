'use client'

import { motion } from 'framer-motion'
import { Play, Clock, TrendingUp, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface DrillCardProps {
  id: string
  title: string
  description?: string
  thumbnailUrl?: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  tags?: string[]
  featured?: boolean
}

export function DrillCard({
  id,
  title,
  description,
  thumbnailUrl,
  category,
  difficulty,
  duration,
  tags = [],
  featured = false,
}: DrillCardProps) {
  const difficultyColors = {
    beginner: 'text-green-400 bg-green-400/10 border-green-400/20',
    intermediate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    advanced: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link href={`/drills/${id}`}>
        <div className="glass-card-hover overflow-hidden h-full flex flex-col">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-slate-800 overflow-hidden">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-100 to-navy-300">
                <Play className="w-16 h-16 text-orange/50" />
              </div>
            )}

            {/* Play Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="p-4 bg-orange rounded-full shadow-glow-orange-lg">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>

            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-3 right-3 px-3 py-1 bg-orange text-white text-xs font-semibold rounded-full shadow-glow-orange">
                Featured
              </div>
            )}

            {/* Duration Badge */}
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(duration)}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Category & Difficulty */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-orange/10 text-orange text-xs font-medium rounded-lg border border-orange/20">
                {category}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-lg border capitalize ${difficultyColors[difficulty]}`}
              >
                {difficulty}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-display font-bold text-white mb-2 group-hover:text-gradient-orange transition-all">
              {title}
            </h3>

            {/* Description */}
            {description && (
              <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">
                {description}
              </p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 text-slate-400 text-xs rounded-md"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 bg-white/5 text-slate-400 text-xs rounded-md">
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Hover Glow Border Effect */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-orange/30 pointer-events-none transition-all duration-300" />
        </div>
      </Link>
    </motion.div>
  )
}
