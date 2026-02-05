'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Zap, Shield, Gauge, Code, Server, Globe, TrendingUp, AlertTriangle, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Asteroid { id: number; x: number; y: number; dx: number; dy: number; emoji: string }
interface Particle { id: number; x: number; y: number; dx: number; dy: number; opacity: number }
interface ClickEffect { id: number; x: number; y: number; rotation: number }
interface ScorePopup { id: number; offset: number; opacity: number }

const EMOJIS = ['🔧', '⚡', '🚀', '💻', '🔒', '🌐', '📊', '⚙️']
const MAX_ASTEROIDS = 15

// Comparison table row
function CompareRow({
  feature,
  wordpress,
  nextjs,
  wpBad = true
}: {
  feature: string;
  wordpress: string;
  nextjs: string;
  wpBad?: boolean;
}) {
  return (
    <tr className="border-b border-gray-700/50">
      <td className="py-4 px-4 font-medium text-white">{feature}</td>
      <td className={`py-4 px-4 ${wpBad ? 'text-red-400' : 'text-gray-400'}`}>
        <div className="flex items-center gap-2">
          {wpBad ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
          {wordpress}
        </div>
      </td>
      <td className="py-4 px-4 text-green-400">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {nextjs}
        </div>
      </td>
    </tr>
  )
}

// Feature card
function FeatureCard({
  icon: Icon,
  title,
  description,
  stat
}: {
  icon: any;
  title: string;
  description: string;
  stat?: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-[rgba(30,41,59,0.6)] border border-[#6366f1]/20 hover:border-[#6366f1]/40 transition-all backdrop-blur-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-[#6366f1]/20">
          <Icon className="w-6 h-6 text-[#7dd3fc]" />
        </div>
        {stat && (
          <span className="text-2xl font-bold text-[#8b5cf6]">{stat}</span>
        )}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
}

export default function UsingWordPressPage() {
  const [gameEnabled, setGameEnabled] = useState(false)
  const [asteroids, setAsteroids] = useState<Asteroid[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([])
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([])
  const [destroyedCount, setDestroyedCount] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const mainRef = useRef<HTMLDivElement>(null)
  const asteroidIdRef = useRef(0)
  const particleIdRef = useRef(0)

  // Mouse tracking and parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      if (mainRef.current) {
        const x = (e.clientX / window.innerWidth - 0.5) * 20
        const y = (e.clientY / window.innerHeight - 0.5) * 20
        mainRef.current.style.transform = `translate(${x}px, ${y}px)`
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Spawn asteroids
  useEffect(() => {
    if (!gameEnabled) {
      setAsteroids([])
      return
    }
    let spawned = 0
    const spawnAsteroid = () => {
      if (spawned >= MAX_ASTEROIDS) return
      setAsteroids(prev => {
        if (prev.length >= MAX_ASTEROIDS) return prev
        const x = Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 60 : 800)
        const y = Math.random() * (typeof window !== 'undefined' ? window.innerHeight - 60 : 600)
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
        spawned++
        return [...prev, { id: asteroidIdRef.current++, x, y, dx: (Math.random() - 0.5) * 2, dy: (Math.random() - 0.5) * 2, emoji }]
      })
    }
    const interval = setInterval(spawnAsteroid, 800)
    return () => clearInterval(interval)
  }, [gameEnabled])

  // Animate asteroids
  useEffect(() => {
    if (!gameEnabled) return
    let animationFrame: number
    const animate = () => {
      setAsteroids(prev => prev.map(a => {
        let newX = a.x + a.dx, newY = a.y + a.dy, newDx = a.dx, newDy = a.dy
        const maxX = typeof window !== 'undefined' ? window.innerWidth - 60 : 800
        const maxY = typeof window !== 'undefined' ? window.innerHeight - 60 : 600
        if (newX < 0 || newX > maxX) newDx *= -1
        if (newY < 0 || newY > maxY) newDy *= -1
        return { ...a, x: newX, y: newY, dx: newDx, dy: newDy }
      }))
      animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [gameEnabled])

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.dx, y: p.y + p.dy, opacity: p.opacity - 0.02 })).filter(p => p.opacity > 0))
    }, 16)
    return () => clearInterval(interval)
  }, [particles.length])

  // Animate score popups
  useEffect(() => {
    if (scorePopups.length === 0) return
    const interval = setInterval(() => {
      setScorePopups(prev => prev.map(p => ({ ...p, offset: p.offset + 1.5, opacity: p.opacity - 0.03 })).filter(p => p.opacity > 0))
    }, 16)
    return () => clearInterval(interval)
  }, [scorePopups.length])

  // Clear click effects
  useEffect(() => {
    if (clickEffects.length === 0) return
    const timeout = setTimeout(() => setClickEffects([]), 800)
    return () => clearTimeout(timeout)
  }, [clickEffects])

  const explodeAsteroid = (asteroid: Asteroid) => {
    const count = 8 + Math.floor(Math.random() * 6)
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2, speed = Math.random() * 4 + 2
      newParticles.push({ id: particleIdRef.current++, x: asteroid.x + 25, y: asteroid.y + 25, dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed, opacity: 1 })
    }
    setParticles(prev => [...prev, ...newParticles])
    setDestroyedCount(prev => prev + 1)
    setScorePopups(prev => [...prev, { id: Date.now(), offset: 0, opacity: 1 }])
    setAsteroids(prev => prev.filter(a => a.id !== asteroid.id))
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!gameEnabled) return
    setClickEffects(prev => [...prev, { id: Date.now(), x: e.clientX, y: e.clientY, rotation: Math.random() * 360 }])
    asteroids.forEach(a => { if (e.clientX >= a.x && e.clientX <= a.x + 50 && e.clientY >= a.y && e.clientY <= a.y + 50) explodeAsteroid(a) })
  }

  return (
    <div
      onClick={handleClick}
      className={`min-h-screen relative overflow-hidden ${gameEnabled ? 'cursor-crosshair' : 'cursor-default'}`}
      style={{ background: 'radial-gradient(ellipse at bottom, #070b22 0%, #02010f 100%)', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Game Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setGameEnabled(!gameEnabled) }}
        className="fixed top-4 right-4 z-[9999] px-3 py-1.5 text-xs rounded-full border transition-all"
        style={{
          background: gameEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 100, 100, 0.2)',
          borderColor: gameEnabled ? 'rgba(34, 197, 94, 0.5)' : 'rgba(100, 100, 100, 0.5)',
          color: gameEnabled ? '#22c55e' : '#888',
          fontFamily: '"JetBrains Mono", monospace'
        }}
      >
        {gameEnabled ? '🎮 Game ON' : '🎮 Game OFF'}
      </button>

      {/* Moving Stars Background */}
      <div className="fixed inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)', backgroundSize: '200px 200px, 300px 300px, 400px 400px', backgroundPosition: '0 0, 50px 100px, 130px 270px', animation: 'starMove 120s linear infinite' }} />

      {/* HUD Overlay */}
      {gameEnabled && (
        <div className="fixed inset-0 pointer-events-none z-50" style={{ fontFamily: '"JetBrains Mono", monospace', color: 'rgba(120, 200, 255, 0.75)' }}>
          <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(to bottom, rgba(120, 200, 255, 0.03) 0px, rgba(120, 200, 255, 0.03) 1px, transparent 3px, transparent 6px)', animation: 'scanMove 4s linear infinite' }} />
          <div className="absolute w-[120px] h-[120px] border border-[rgba(120,200,255,0.4)] rounded-full" style={{ left: mousePos.x, top: mousePos.y, transform: 'translate(-50%, -50%)' }}>
            <div className="absolute w-[1px] h-full left-1/2 top-0 bg-[rgba(120,200,255,0.6)]" /><div className="absolute h-[1px] w-full top-1/2 left-0 bg-[rgba(120,200,255,0.6)]" />
          </div>
          <div className="absolute top-5 left-5 w-[30px] h-[30px] border-l border-t border-[rgba(120,200,255,0.35)]" />
          <div className="absolute top-5 right-5 w-[30px] h-[30px] border-r border-t border-[rgba(120,200,255,0.35)]" />
          <div className="absolute bottom-5 left-5 w-[30px] h-[30px] border-l border-b border-[rgba(120,200,255,0.35)]" />
          <div className="absolute bottom-5 right-5 w-[30px] h-[30px] border-r border-b border-[rgba(120,200,255,0.35)]" />
          <div className="absolute bottom-5 left-5 text-xs tracking-wider opacity-70 leading-relaxed">TARGET STATUS: ONLINE<br />X: {mousePos.x}<br />Y: {mousePos.y}<br />TECH POINTS: {destroyedCount}</div>
        </div>
      )}

      {/* Floating Emoji Targets */}
      {gameEnabled && asteroids.map(a => (
        <div key={a.id} className="fixed w-[50px] h-[50px] cursor-pointer transition-transform hover:scale-110 z-[100] flex items-center justify-center text-3xl" style={{ left: a.x, top: a.y }}>
          {a.emoji}
        </div>
      ))}

      {/* Explosion Particles */}
      {gameEnabled && particles.map(p => (<div key={p.id} className="fixed w-[6px] h-[6px] rounded-full pointer-events-none z-[9999]" style={{ left: p.x, top: p.y, opacity: p.opacity, background: 'radial-gradient(circle, #7dd3fc 0%, #3b82f6 100%)' }} />))}

      {/* Click Effects */}
      {gameEnabled && clickEffects.map(e => (<div key={e.id} className="fixed w-[20px] h-[20px] rounded-full border-2 border-[#7dd3fc] pointer-events-none z-[9999]" style={{ left: e.x, top: e.y, transform: `translate(-50%, -50%) rotate(${e.rotation}deg)`, animation: 'ripple 0.8s forwards' }} />))}

      {/* Score Popups */}
      {gameEnabled && scorePopups.map(p => (<div key={p.id} className="fixed left-5 bottom-5 pointer-events-none z-[10000] text-sm text-[#7dd3fc]" style={{ fontFamily: '"JetBrains Mono", monospace', transform: `translateY(-${p.offset}px)`, opacity: p.opacity }}>+1</div>))}

      <main ref={mainRef} className="relative z-10 max-w-[900px] mx-auto px-6 py-10 min-h-screen transition-transform duration-150">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[#7dd3fc] hover:text-white mb-8 border-b border-dashed border-[rgba(125,211,252,0.4)] hover:border-white transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Blog
        </Link>

        <article className="flex flex-col gap-20">
          {/* Header */}
          <header>
            <span className="inline-block px-3 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] text-sm rounded-full mb-4">
              Web Development
            </span>
            <h1 className="text-[2.6rem] leading-tight font-bold mb-6 text-[#c7d2fe]" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              Why We Moved Beyond WordPress: The Case for Modern JavaScript Web Apps
            </h1>
            <p className="text-gray-400 italic">Published January 2026 — By the ShockAI Team</p>
          </header>

          {/* Intro Block */}
          <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <div className="flex items-center gap-2 mb-2"><span className="text-[#7dd3fc] text-xs border border-[#7dd3fc] px-2 py-0.5 rounded" style={{ fontFamily: '"JetBrains Mono", monospace' }}>TECH ANALYSIS</span></div>
            <p className="text-lg text-white mb-0">
              <strong>The web has evolved.</strong> WordPress powered the 2010s, but in 2026, businesses need more than a blogging platform with plugins bolted on. Here&apos;s why we built ShockAI on Next.js—and why you should consider modern JavaScript for your next project.
            </p>
          </div>

          <p className="text-[#e5e7eb] text-lg max-w-[720px] leading-relaxed">
            WordPress still powers over 40% of websites. But that statistic hides a crucial truth: most of those are legacy sites, simple blogs, or businesses that haven&apos;t upgraded in years. The companies leading their industries have moved to modern JavaScript frameworks—and the difference is night and day.
          </p>

          {/* The Problem with WordPress */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8 flex items-center gap-3" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              ⚠️ The WordPress Problem in 2026
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-4 border-l-4 border-[#f43f5e] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <h3 className="text-xl font-bold text-red-400 mb-4">🔓 Security Nightmares</h3>
                <ul className="space-y-2 text-[#e5e7eb] text-sm">
                  <li>• 90% of hacked CMS sites are WordPress</li>
                  <li>• Plugin vulnerabilities discovered weekly</li>
                  <li>• Constant updates required or you&apos;re exposed</li>
                  <li>• Database injection attacks common</li>
                </ul>
              </div>

              <div className="p-4 border-l-4 border-[#f43f5e] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <h3 className="text-xl font-bold text-red-400 mb-4">🐌 Performance Bottlenecks</h3>
                <ul className="space-y-2 text-[#e5e7eb] text-sm">
                  <li>• PHP generates pages on every request</li>
                  <li>• Plugin bloat slows everything down</li>
                  <li>• Database queries on every page load</li>
                  <li>• Average WordPress site: 3-5 second load time</li>
                </ul>
              </div>

              <div className="p-4 border-l-4 border-[#f43f5e] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <h3 className="text-xl font-bold text-red-400 mb-4">💸 Hidden Costs</h3>
                <ul className="space-y-2 text-[#e5e7eb] text-sm">
                  <li>• Premium plugins: $50-500/year each</li>
                  <li>• Managed WordPress hosting: $30-300/month</li>
                  <li>• Security monitoring: $10-50/month</li>
                  <li>• Regular maintenance or things break</li>
                </ul>
              </div>

              <div className="p-4 border-l-4 border-[#f43f5e] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                <h3 className="text-xl font-bold text-red-400 mb-4">🔧 Developer Limitations</h3>
                <ul className="space-y-2 text-[#e5e7eb] text-sm">
                  <li>• PHP is dated compared to modern JS</li>
                  <li>• Plugin conflicts are constant</li>
                  <li>• Custom features require &quot;hacks&quot;</li>
                  <li>• Theme updates can break everything</li>
                </ul>
              </div>
            </div>
          </section>

          {/* The Next.js Advantage */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8 flex items-center gap-3" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              <Zap className="w-8 h-8 text-[#7dd3fc]" />
              ⚡ The Next.js & React Advantage
            </h2>

            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-8 leading-relaxed">
              This very website—ShockAI—is built on Next.js 14. Everything you see, from the animated backgrounds to the instant page transitions, is powered by modern JavaScript. Here&apos;s what that means for you:
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <FeatureCard
                icon={Gauge}
                title="Lightning Performance"
                description="Pages pre-rendered at build time. No database queries. Sub-second load times."
                stat="<1s"
              />
              <FeatureCard
                icon={Shield}
                title="Security by Default"
                description="No database to hack. No plugins with vulnerabilities. Static files = minimal attack surface."
                stat="99.9%"
              />
              <FeatureCard
                icon={Server}
                title="Serverless & Scalable"
                description="Vercel's edge network serves your site globally. Handle any traffic spike automatically."
                stat="∞"
              />
              <FeatureCard
                icon={Code}
                title="Modern Development"
                description="TypeScript, React, Tailwind CSS. The same stack used by Netflix, TikTok, and Twitch."
              />
              <FeatureCard
                icon={Globe}
                title="SEO Optimized"
                description="Server-side rendering, meta tags, structured data, Core Web Vitals—all built-in."
              />
              <FeatureCard
                icon={TrendingUp}
                title="Future-Proof"
                description="JavaScript ecosystem evolves constantly. Your site grows with the technology."
              />
            </div>
          </section>

          {/* Comparison Table */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>📊 Head-to-Head Comparison</h2>

            <div className="overflow-x-auto rounded-xl border border-gray-700 backdrop-blur-md">
              <table className="w-full">
                <thead className="bg-[rgba(30,41,59,0.8)]">
                  <tr>
                    <th className="py-4 px-4 text-left font-bold text-white">Feature</th>
                    <th className="py-4 px-4 text-left font-bold text-red-400">WordPress</th>
                    <th className="py-4 px-4 text-left font-bold text-green-400">Next.js / React</th>
                  </tr>
                </thead>
                <tbody className="bg-[rgba(30,41,59,0.4)]">
                  <CompareRow
                    feature="Page Load Speed"
                    wordpress="3-5 seconds average"
                    nextjs="Under 1 second"
                  />
                  <CompareRow
                    feature="Security"
                    wordpress="Constant vulnerabilities"
                    nextjs="Minimal attack surface"
                  />
                  <CompareRow
                    feature="Hosting Cost"
                    wordpress="$30-300/month managed"
                    nextjs="Free tier available (Vercel)"
                  />
                  <CompareRow
                    feature="Maintenance"
                    wordpress="Weekly updates required"
                    nextjs="Deploy and forget"
                  />
                  <CompareRow
                    feature="Custom Features"
                    wordpress="Plugin hunting & conflicts"
                    nextjs="Build exactly what you need"
                  />
                  <CompareRow
                    feature="Mobile Experience"
                    wordpress="Varies by theme"
                    nextjs="PWA-ready, app-like feel"
                  />
                  <CompareRow
                    feature="API Integration"
                    wordpress="Plugin required"
                    nextjs="Native API routes"
                  />
                  <CompareRow
                    feature="Developer Experience"
                    wordpress="PHP, hooks, filters"
                    nextjs="Modern TypeScript, hot reload"
                  />
                </tbody>
              </table>
            </div>
          </section>

          {/* Real World Examples */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>🎯 Real-World Proof: ShockAI Features</h2>

            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">
              Every feature on this site would require multiple plugins on WordPress—each adding load time, potential conflicts, and security risks. In Next.js, they&apos;re built-in:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#7dd3fc]" />
                  <span className="font-bold text-white">✨ Animated Backgrounds</span>
                </div>
                <p className="text-gray-400 text-sm">Generative motion graphics running at 60fps—native JavaScript canvas, no plugins.</p>
              </div>

              <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#7dd3fc]" />
                  <span className="font-bold text-white">🖼️ Gallery API System</span>
                </div>
                <p className="text-gray-400 text-sm">Dynamic galleries with category filtering, lightbox, and admin uploads—all custom built.</p>
              </div>

              <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#7dd3fc]" />
                  <span className="font-bold text-white">📱 Panel Navigation</span>
                </div>
                <p className="text-gray-400 text-sm">Smooth sidebar navigation with hash routing—feels like an app, not a website.</p>
              </div>

              <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[#7dd3fc]" />
                  <span className="font-bold text-white">🔐 Admin Dashboard</span>
                </div>
                <p className="text-gray-400 text-sm">Password-protected media management with real-time updates—no WP admin bloat.</p>
              </div>
            </div>
          </section>

          {/* When WordPress Still Makes Sense */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-6" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>🤔 When WordPress Still Makes Sense</h2>

            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-4 leading-relaxed">
              To be fair, WordPress isn&apos;t always the wrong choice. It can work for:
            </p>

            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)] mb-6">
              <ul className="space-y-2 text-[#e5e7eb]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Simple blogs with no custom functionality</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Non-technical teams who need to edit content frequently</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Tight budgets with no development resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Existing WordPress sites that just need maintenance</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border-l-4 border-yellow-500 bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <p className="text-yellow-200 mb-0">
                <strong>📝 Note:</strong> We still offer WordPress services for clients with existing sites. But for new projects? We recommend modern JavaScript every time.
              </p>
            </div>
          </section>

          {/* Hyperspace Divider */}
          <hr className="border-none h-[2px] my-20 bg-gradient-to-r from-transparent via-[#7dd3fc] to-transparent shadow-[0_0_15px_#7dd3fc]" />

          {/* The Bottom Line */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>💡 The Bottom Line</h2>

            <div className="p-6 rounded-xl bg-gradient-to-r from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/30 mb-8">
              <p className="text-xl text-white mb-4 font-medium">
                WordPress was revolutionary in 2005. It&apos;s legacy technology in 2026.
              </p>
              <p className="text-[#e5e7eb]">
                Modern JavaScript frameworks like Next.js deliver faster sites, better security, lower costs, and unlimited customization. The companies winning online have already made the switch.
              </p>
            </div>

            <p className="text-[#e5e7eb] text-lg max-w-[720px] leading-relaxed">
              Your website is your digital headquarters. It should be fast, secure, and built to grow with your business. That&apos;s what modern web development delivers—and that&apos;s what we build at ShockAI.
            </p>
          </section>

          {/* CTA */}
          <div className="p-8 rounded-xl bg-gradient-to-r from-[#6366f1]/30 to-[#8b5cf6]/30 border border-[#6366f1]/40">
            <h3 className="text-2xl font-bold text-white mb-4">🚀 Ready to Upgrade Your Digital Presence?</h3>
            <p className="text-[#e5e7eb] mb-6">
              Whether you need a new website, want to migrate from WordPress, or just want to explore what&apos;s possible—let&apos;s talk.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/digital-builds" className="inline-block px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg font-semibold hover:scale-105 transition-transform text-white">
                Explore Web Development
              </Link>
              <Link href="/contact" className="inline-block px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-all text-white">
                Get a Free Consultation
              </Link>
            </div>
          </div>

          <footer className="mt-24 pt-10 border-t border-[rgba(125,211,252,0.2)] text-center text-[#e5e7eb]">
            <p>© 2026 ShockAI — System Architecture by Robbie Creates</p>
          </footer>
        </article>
      </main>

      <style jsx global>{`
        @keyframes starMove { from { transform: translateY(0); } to { transform: translateY(-2000px); } }
        @keyframes scanMove { from { background-position-y: 0; } to { background-position-y: 100px; } }
        @keyframes ripple { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }
      `}</style>
    </div>
  )
}
