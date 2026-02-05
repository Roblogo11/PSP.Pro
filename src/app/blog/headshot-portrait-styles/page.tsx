'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, Sparkles, Users, Star, Zap, Film, Sun, Heart } from 'lucide-react'
import Link from 'next/link'

interface Asteroid { id: number; x: number; y: number; dx: number; dy: number; emoji: string }
interface Particle { id: number; x: number; y: number; dx: number; dy: number; opacity: number }
interface ClickEffect { id: number; x: number; y: number; rotation: number }
interface ScorePopup { id: number; offset: number; opacity: number }

const EMOJIS = ['📸', '🎬', '💡', '✨', '🌟', '💎', '🎯', '⚡']
const MAX_ASTEROIDS = 15

export default function HeadshotPortraitStylesPage() {
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
          <div className="absolute bottom-5 left-5 text-xs tracking-wider opacity-70 leading-relaxed">TARGET STATUS: ONLINE<br />X: {mousePos.x}<br />Y: {mousePos.y}<br />STYLE POINTS: {destroyedCount}</div>
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

      <main ref={mainRef} className="relative z-10 max-w-4xl mx-auto px-6 py-10 min-h-screen transition-transform duration-150">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[#7dd3fc] hover:text-white mb-8 border-b border-dashed border-[rgba(125,211,252,0.4)] hover:border-white transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Blog
        </Link>

        <article className="flex flex-col gap-20">
          {/* Hero */}
          <header>
            <h1 className="text-[2.6rem] leading-tight font-bold mb-6 text-[#c7d2fe]" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              30 Signature Portrait & Headshot Styles for Professionals
            </h1>
            <p className="text-gray-400 italic">By Robbie Creates — Updated January 2026</p>
          </header>

          {/* TL;DR Block */}
          <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <div className="flex items-center gap-2 mb-2"><span className="text-[#7dd3fc] text-xs border border-[#7dd3fc] px-2 py-0.5 rounded" style={{ fontFamily: '"JetBrains Mono", monospace' }}>STYLE GUIDE</span></div>
            <p className="mb-0"><strong className="text-white">TL;DR:</strong> From corporate boardrooms to neon-soaked urban nights, your image is your signal. This guide breaks down 30 professional headshot and portrait styles—and explains which styles work best for specific careers, industries, and personal brands across Hampton Roads.</p>
          </div>

          {/* Intro */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/30">
            <p className="text-[#e5e7eb]">
              <strong className="text-white">ShockAI</strong> provides high-end portrait and headshot photography throughout Norfolk, Virginia Beach, and the greater Hampton Roads area.
              Specializing in professional corporate headshots, personal branding photography, and cinematic creative portraits, each session is tailored to your profession, audience, and goals.
            </p>
          </div>

          {/* Professional & Corporate */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8 flex items-center gap-3" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              <Camera className="w-8 h-8 text-[#7dd3fc]" />
              📷 Professional & Corporate: The Executive Signal
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">In a digital-first economy, your headshot is often your first handshake. Corporate and professional headshots should project confidence, trust, and competence—especially for executives, entrepreneurs, and professionals throughout Norfolk and Virginia Beach.</p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong className="text-white">Traditional Studio:</strong> Clean, neutral, and timeless—ideal for executives and leadership teams.</li>
              <li><strong className="text-white">Modern Corporate:</strong> Dynamic lighting for founders, tech professionals, and consultants.</li>
              <li><strong className="text-white">Environmental:</strong> Captured in real workspaces to add authenticity and context.</li>
              <li><strong className="text-white">Casual Business:</strong> Approachable and relaxed while maintaining professional credibility.</li>
              <li><strong className="text-white">Dramatic Low-Key:</strong> High-contrast lighting for bold, cinematic executive portraits.</li>
            </ul>
          </section>

          <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <p className="mb-0">💼 A professional headshot isn't just a photo—it's a high-performing digital asset for LinkedIn, websites, press features, and speaking engagements.</p>
          </div>

          <Link href="/photography" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white transition-colors w-fit">→ Back to photography services</Link>

          {/* Creative & Cinematic */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8 flex items-center gap-3" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              <Sparkles className="w-8 h-8 text-[#7dd3fc]" />
              ✨ Creative & Cinematic: The Artistic Edge
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">Creative professionals across Hampton Roads need imagery that stands out while still feeling intentional. These styles use light, color, and composition to tell visual stories that differentiate your brand.</p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong className="text-white">Fine Art:</strong> Painterly lighting and moody tones inspired by classic artwork.</li>
              <li><strong className="text-white">High Fashion:</strong> Editorial, Vogue-style posing with elevated styling.</li>
              <li><strong className="text-white">Conceptual:</strong> Prop-driven imagery that communicates a clear idea or narrative.</li>
              <li><strong className="text-white">Fantasy & Cosplay:</strong> Enhanced with digital effects and stylized costuming.</li>
              <li><strong className="text-white">Black & White:</strong> Pure focus on contrast, texture, and expression.</li>
            </ul>
          </section>

          {/* Dramatic Styles */}
          <section className="py-10">
            <h3 className="text-[1.6rem] font-bold text-[#c7d2fe] mb-6 flex items-center gap-3" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              <Film className="w-6 h-6 text-[#7dd3fc]" />
              🎬 Dramatic & Cinematic Styles
            </h3>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong className="text-white">Hollywood Glamour:</strong> Vintage lighting with classic elegance.</li>
              <li><strong className="text-white">Cinematic Movie Stills:</strong> Moody frames that feel pulled from a film.</li>
              <li><strong className="text-white">Neon & Gel Lighting:</strong> Futuristic, colorful looks for bold branding.</li>
              <li><strong className="text-white">Silhouette:</strong> Backlit compositions with strong visual impact.</li>
            </ul>
          </section>

          {/* Lifestyle & Personal Branding */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8 flex items-center gap-3" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              <Sun className="w-8 h-8 text-[#7dd3fc]" />
              ☀️ Lifestyle & Personal Branding
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">Lifestyle portraits are ideal for influencers, entrepreneurs, athletes, and creatives who need imagery that feels authentic, energetic, and platform-ready.</p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong className="text-white">Social Media / Influencer:</strong> Optimized for Instagram, TikTok, and digital marketing.</li>
              <li><strong className="text-white">Outdoor Lifestyle:</strong> Natural light sessions using Virginia Beach and Norfolk locations.</li>
              <li><strong className="text-white">Fitness & Athlete:</strong> Capturing motion, power, and physical presence.</li>
              <li><strong className="text-white">Luxury Branding:</strong> Styled to reflect premium services and high-end products.</li>
            </ul>
          </section>

          <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <p className="mb-0">🔥 Authenticity is the new currency. Lifestyle portraits capture you in your element—doing what you do best.</p>
          </div>

          {/* Which Style Fits */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8 flex items-center gap-3" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              <Users className="w-8 h-8 text-[#7dd3fc]" />
              👥 Which Headshot Styles Fit Your Profession?
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">Not all professional headshots serve the same purpose. The most effective headshot style depends on your industry, audience, and how the image will be used.</p>

            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)] mb-6">
              <h3 className="text-xl font-bold text-[#c7d2fe] mb-4">✅ Style Recommendations by Industry</h3>
              <ul className="pl-6 text-[#e5e7eb] space-y-2">
                <li><strong>Executives & Corporate Leaders:</strong> Traditional Studio, Modern Corporate, Environmental</li>
                <li><strong>Entrepreneurs & Small Business Owners:</strong> Environmental, Casual Business, Lifestyle Branding</li>
                <li><strong>Creative Professionals:</strong> Cinematic, Fine Art, Conceptual, Black & White</li>
                <li><strong>Actors & Models:</strong> Natural Light, Studio Neutral, Minimal Retouching</li>
                <li><strong>Real Estate & Sales Professionals:</strong> Modern Corporate, Outdoor Environmental</li>
                <li><strong>Healthcare & Wellness Professionals:</strong> Clean Studio, Soft Natural Light</li>
                <li><strong>Military & Government Professionals:</strong> Traditional Studio, Conservative Lighting</li>
              </ul>
            </div>

            <p className="text-[#e5e7eb] max-w-3xl">
              Professional platforms like{' '}
              <a href="https://www.linkedin.com/business/marketing/blog/content-marketing/how-to-take-a-professional-linkedin-photo" target="_blank" rel="noopener noreferrer" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">LinkedIn</a>{' '}
              emphasize clarity, authenticity, and professional presentation, while casting authorities such as{' '}
              <a href="https://www.backstage.com/magazine/article/actor-headshots-what-you-need-to-know-7507/" target="_blank" rel="noopener noreferrer" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Backstage</a>{' '}
              stress natural representation for performers.
            </p>
          </section>

          {/* Specialized */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8 flex items-center gap-3" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              <Heart className="w-8 h-8 text-[#7dd3fc]" />
              💖 Specialized & Niche Portfolios
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">We also provide specialized portrait photography for specific industries and personal milestones across Norfolk, Virginia Beach, and Hampton Roads.</p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong className="text-white">Actor & Model Headshots:</strong> Industry-standard crops for casting submissions.</li>
              <li><strong className="text-white">Dancer & Movement:</strong> Freezing motion, form, and expression.</li>
              <li><strong className="text-white">Family & Couples:</strong> Emotional, candid moments captured naturally.</li>
              <li><strong className="text-white">Maternity & Senior Portraits:</strong> Celebrating life&apos;s biggest transitions.</li>
              <li><strong className="text-white">Boudoir & Alternative:</strong> Tasteful, expressive sessions highlighting individuality.</li>
            </ul>
          </section>

          {/* Hyperspace Divider */}
          <hr className="border-none h-[2px] my-20 bg-gradient-to-r from-transparent via-[#7dd3fc] to-transparent shadow-[0_0_15px_#7dd3fc]" />

          {/* Conclusion */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8 flex items-center gap-3" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              <Zap className="w-8 h-8 text-[#7dd3fc]" />
              ⚡ Conclusion: Your Image, Optimized.
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">
              Whether you're an executive building authority, a creative shaping identity, or a professional leveling up your brand, the right headshot style makes the difference.
              We don't just take photos—we calibrate your visual signal to match your goals.
            </p>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <p className="text-xl font-bold text-white mb-0">🎯 Ready to upgrade your visual signal?</p>
            </div>
          </section>

          {/* CTA */}
          <div className="p-8 rounded-xl bg-gradient-to-r from-[#6366f1]/30 to-[#8b5cf6]/30 border border-[#6366f1]/40">
            <h3 className="text-2xl font-bold text-white mb-4">📸 Book Your Session</h3>
            <p className="text-[#e5e7eb] mb-6">Let&apos;s create professional portraits that represent you and your brand perfectly.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/photography" className="inline-block px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg font-semibold hover:scale-105 transition-transform text-white">
                View Style Pricing
              </Link>
              <Link href="/contact" className="inline-block px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold hover:bg-white/20 transition-all text-white">
                Contact Us
              </Link>
            </div>
          </div>

          <footer className="mt-24 pt-10 border-t border-[rgba(125,211,252,0.2)] text-center text-[#e5e7eb]">
            <p>© 2026 ShockAI — Photography by Robbie Creates</p>
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
