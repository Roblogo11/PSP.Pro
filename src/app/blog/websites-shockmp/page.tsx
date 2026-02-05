'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Asteroid { id: number; x: number; y: number; dx: number; dy: number }
interface Particle { id: number; x: number; y: number; dx: number; dy: number; opacity: number }
interface ClickEffect { id: number; x: number; y: number; rotation: number }
interface ScorePopup { id: number; offset: number; opacity: number }

const MAX_ASTEROIDS = 15

export default function WebsitesShockMPPage() {
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
        spawned++
        return [...prev, { id: asteroidIdRef.current++, x, y, dx: (Math.random() - 0.5) * 2, dy: (Math.random() - 0.5) * 2 }]
      })
    }
    const interval = setInterval(spawnAsteroid, 1000)
    return () => clearInterval(interval)
  }, [gameEnabled])

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

  useEffect(() => {
    if (particles.length === 0) return
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.dx, y: p.y + p.dy, opacity: p.opacity - 0.02 })).filter(p => p.opacity > 0))
    }, 16)
    return () => clearInterval(interval)
  }, [particles.length])

  useEffect(() => {
    if (scorePopups.length === 0) return
    const interval = setInterval(() => {
      setScorePopups(prev => prev.map(p => ({ ...p, offset: p.offset + 1.5, opacity: p.opacity - 0.03 })).filter(p => p.opacity > 0))
    }, 16)
    return () => clearInterval(interval)
  }, [scorePopups.length])

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
    <div onClick={handleClick} className={`min-h-screen relative overflow-hidden ${gameEnabled ? 'cursor-crosshair' : 'cursor-default'}`} style={{ background: 'radial-gradient(ellipse at bottom, #070b22 0%, #02010f 100%)', fontFamily: 'Inter, system-ui, sans-serif' }}>
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
      <div className="fixed inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)', backgroundSize: '200px 200px, 300px 300px, 400px 400px', backgroundPosition: '0 0, 50px 100px, 130px 270px', animation: 'starMove 120s linear infinite' }} />
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
          <div className="absolute bottom-5 left-5 text-xs tracking-wider opacity-70 leading-relaxed">TARGET STATUS: ONLINE<br />X: {mousePos.x}<br />Y: {mousePos.y}<br />PROJECTS LAUNCHED: {destroyedCount}</div>
        </div>
      )}
      {gameEnabled && asteroids.map(a => (<div key={a.id} className="fixed w-[50px] h-[50px] cursor-pointer transition-transform hover:scale-110 z-[100] flex items-center justify-center text-3xl" style={{ left: a.x, top: a.y }}>💼</div>))}
      {gameEnabled && particles.map(p => (<div key={p.id} className="fixed w-[6px] h-[6px] rounded-full pointer-events-none z-[9999]" style={{ left: p.x, top: p.y, opacity: p.opacity, background: 'radial-gradient(circle, #fbbf24 0%, #d97706 100%)' }} />))}
      {gameEnabled && clickEffects.map(e => (<div key={e.id} className="fixed w-[20px] h-[20px] rounded-full border-2 border-[#7dd3fc] pointer-events-none z-[9999]" style={{ left: e.x, top: e.y, transform: `translate(-50%, -50%) rotate(${e.rotation}deg)`, animation: 'ripple 0.8s forwards' }} />))}
      {gameEnabled && scorePopups.map(p => (<div key={p.id} className="fixed left-5 bottom-5 pointer-events-none z-[10000] text-sm text-[#7dd3fc]" style={{ fontFamily: '"JetBrains Mono", monospace', transform: `translateY(-${p.offset}px)`, opacity: p.opacity }}>+1</div>))}

      <main ref={mainRef} className="relative z-10 max-w-[900px] mx-auto px-6 py-10 min-h-screen transition-transform duration-150">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[#7dd3fc] hover:text-white mb-8 border-b border-dashed border-[rgba(125,211,252,0.4)] hover:border-white transition-colors"><ArrowLeft className="w-4 h-4" />Back to Blog</Link>
        <article className="flex flex-col gap-20">
          <h1 className="text-[2.6rem] leading-tight font-bold mb-10 text-[#c7d2fe]" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>How ShockMP Helps Local Businesses Grow Online</h1>
          <p className="text-gray-400 italic -mt-16">By Robbie Creates — Published January 29, 2026</p>

          <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]"><strong>TL;DR:</strong> Shock Media Productions (ShockMP) transforms underperforming websites into high-converting digital assets. Through strategic SEO, performance optimization, and custom WordPress development, we help local businesses break free from digital stagnation and scale their online presence.</div>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>🚨 The Problem: Invisible Online Presence</h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">Most local businesses face the same challenge: they have a website, but it&apos;s not working for them. Slow load times, poor mobile experience, zero SEO strategy, and outdated design all contribute to a site that&apos;s essentially invisible to potential customers.</p>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">If your website isn&apos;t on page one of Google, you&apos;re losing customers to competitors who are. <strong>The digital storefront is now the first impression.</strong></p>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>🔧 The ShockMP Solution</h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">We don&apos;t just build websites—we engineer digital growth systems. Our approach combines:</p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong>Performance Optimization:</strong> Sub-3-second load times, Core Web Vitals compliance, and mobile-first design.</li>
              <li><strong>Strategic SEO:</strong> Keyword research, local SEO targeting, schema markup, and content optimization.</li>
              <li><strong>Custom WordPress Development:</strong> Secure, scalable, and maintainable sites built on the world&apos;s most popular CMS.</li>
              <li><strong>Conversion-Focused Design:</strong> Clear CTAs, trust signals, and user journeys that turn visitors into customers.</li>
            </ul>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>📈 The Results That Matter</h2>
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="p-6 bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md border border-[rgba(99,102,241,0.2)]">
                <div className="text-3xl font-bold text-[#7dd3fc] mb-2">300%</div>
                <p className="text-[#e5e7eb] text-sm">Average traffic increase within 6 months</p>
              </div>
              <div className="p-6 bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md border border-[rgba(99,102,241,0.2)]">
                <div className="text-3xl font-bold text-[#7dd3fc] mb-2">2.5s</div>
                <p className="text-[#e5e7eb] text-sm">Average page load time (down from 8s+)</p>
              </div>
              <div className="p-6 bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md border border-[rgba(99,102,241,0.2)]">
                <div className="text-3xl font-bold text-[#7dd3fc] mb-2">Top 10</div>
                <p className="text-[#e5e7eb] text-sm">Google rankings for target keywords</p>
              </div>
            </div>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>🎯 Who We Work With</h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">ShockMP specializes in helping:</p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong>Local Service Businesses:</strong> Contractors, plumbers, electricians, landscapers</li>
              <li><strong>Professional Services:</strong> Law firms, accounting practices, consultants</li>
              <li><strong>Retail & E-commerce:</strong> Local shops expanding online</li>
              <li><strong>Creative Professionals:</strong> Photographers, videographers, designers</li>
            </ul>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">If you have a business that serves customers, we can help you reach more of them online.</div>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>🔗 Our Process</h2>
            <ol className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed list-decimal">
              <li><strong>Audit:</strong> Deep dive into your current site&apos;s performance, SEO, and conversion metrics.</li>
              <li><strong>Strategy:</strong> Custom roadmap based on your business goals and competitive landscape.</li>
              <li><strong>Build:</strong> Implementation of optimized design, content, and technical infrastructure.</li>
              <li><strong>Launch:</strong> Careful deployment with monitoring and adjustment.</li>
              <li><strong>Grow:</strong> Ongoing optimization, content updates, and performance tracking.</li>
            </ol>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>Links (Read More)</h2>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><Link href="/" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Home – ShockAI</Link></li>
              <li><Link href="/contact" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Contact ShockAI</Link></li>
              <li><Link href="/blog/using-wordpress" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Why WordPress?</Link></li>
            </ul>
          </section>

          <hr className="border-none h-[2px] my-20 bg-gradient-to-r from-transparent via-[#7dd3fc] to-transparent shadow-[0_0_15px_#7dd3fc]" />

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>Ready to Grow?</h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">Your website should be your hardest-working employee—generating leads, building trust, and converting visitors into customers 24/7. If it&apos;s not doing that, let&apos;s talk.</p>
            <Link href="/contact" className="inline-block px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#7dd3fc] rounded-lg font-semibold text-white hover:scale-105 transition-transform">Get Your Free Site Audit →</Link>
          </section>

          <footer className="mt-24 pt-10 border-t border-[rgba(125,211,252,0.2)] text-center text-[#e5e7eb]"><p>© 2026 ShockAI — Written by Robbie Creates</p></footer>
        </article>
      </main>
      <style jsx global>{`@keyframes starMove { from { transform: translateY(0); } to { transform: translateY(-2000px); } } @keyframes scanMove { from { background-position-y: 0; } to { background-position-y: 100px; } } @keyframes ripple { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }`}</style>
    </div>
  )
}
