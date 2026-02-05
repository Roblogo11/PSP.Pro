'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Video, Zap, Globe, Rocket } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNavigation } from './nav-context'

interface FunnelBridgeProps {
  variant: 'home-to-video' | 'video-to-shockkit' | 'shockkit-to-website' | 'website-to-getstarted'
}

const bridgeContent = {
  'home-to-video': {
    icon: Video,
    eyebrow: "Don't just take our word for it",
    headline: 'See the Work That Shocks',
    subtext:
      "We've produced hundreds of videos for Norfolk & Virginia Beach businesses. Cinematic quality, AI-enhanced editing, delivered fast.",
    cta: 'View Our Video Portfolio',
    href: '/video',
    gradient: 'from-secondary via-cyan to-secondary',
    glowColor: 'secondary',
  },
  'video-to-shockkit': {
    icon: Zap,
    eyebrow: "This isn't magic — it's a system",
    headline: 'The Shock Kit: Your Content Engine',
    subtext:
      "Great videos need a great distribution system. The Shock Kit gives you ready-to-post content every month. No contracts. No hassle. Just post.",
    cta: 'See The System',
    href: '/shock-kit',
    gradient: 'from-accent via-pink-500 to-accent',
    glowColor: 'accent',
  },
  'shockkit-to-website': {
    icon: Globe,
    eyebrow: 'Killer content deserves a killer home',
    headline: "Let's Build Your Digital OS",
    subtext:
      "You've got the content. Now you need the website that converts. AI-powered design, SEO baked in, built for speed.",
    cta: 'Build Your Website',
    href: '/website-help',
    gradient: 'from-cyan via-indigo to-cyan',
    glowColor: 'cyan',
  },
  'website-to-getstarted': {
    icon: Rocket,
    eyebrow: "You're 90% there",
    headline: 'Ready for Your AI Audit?',
    subtext:
      "We'll analyze your current setup and show you exactly where to improve. Free consultation. No pressure. Just insights.",
    cta: 'See What\'s Possible',
    href: '/get-started',
    gradient: 'from-secondary via-accent to-pink-500',
    glowColor: 'secondary',
  },
}

export function FunnelBridge({ variant }: FunnelBridgeProps) {
  const router = useRouter()
  const { setNavigationDirection } = useNavigation()
  const content = bridgeContent[variant]
  const Icon = content.icon

  const handleClick = () => {
    setNavigationDirection(1)
    router.push(content.href)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative py-20 overflow-hidden"
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r ${content.gradient} opacity-10 blur-3xl rounded-full`}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        {/* The Bridge Card */}
        <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-dark-100 via-dark-200 to-dark-100 border border-secondary/20 overflow-hidden group hover:border-secondary/40 transition-all duration-500">
          {/* Animated border glow */}
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${content.gradient} blur-xl`}
            style={{ margin: '-2px' }}
          />

          <div className="relative z-10">
            {/* Eyebrow with icon */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-lg bg-${content.glowColor}/10 border border-${content.glowColor}/20`}
              >
                <Icon className={`w-5 h-5 text-${content.glowColor}`} />
              </div>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                {content.eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">{content.headline}</h3>

            {/* Subtext */}
            <p className="text-lg text-gray-300 mb-8 max-w-2xl leading-relaxed">{content.subtext}</p>

            {/* CTA Button */}
            <button
              onClick={handleClick}
              className={`group/btn inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r ${content.gradient} text-white font-semibold shadow-lg shadow-${content.glowColor}/30 hover:shadow-${content.glowColor}/50 hover:scale-[1.02] transition-all duration-300`}
            >
              <Sparkles className="w-5 h-5" />
              <span>{content.cta}</span>
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 opacity-10">
              <Icon className="w-32 h-32 text-white" />
            </div>
          </div>
        </div>

        {/* Progress hint */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {variant === 'home-to-video' && 'Step 1 → Step 2'}
          {variant === 'video-to-shockkit' && 'Step 2 → Step 3'}
          {variant === 'shockkit-to-website' && 'Step 3 → Step 4'}
          {variant === 'website-to-getstarted' && 'Step 4 → Final Step'}
        </p>
      </div>
    </motion.section>
  )
}
