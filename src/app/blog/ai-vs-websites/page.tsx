'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Asteroid { id: number; x: number; y: number; dx: number; dy: number }
interface Particle { id: number; x: number; y: number; dx: number; dy: number; opacity: number }
interface ClickEffect { id: number; x: number; y: number; rotation: number }
interface ScorePopup { id: number; offset: number; opacity: number }

const MAX_ASTEROIDS = 15

export default function AIvsWebsitesPage() {
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
    <div onClick={handleClick} className={`min-h-screen relative overflow-hidden ${gameEnabled ? 'cursor-crosshair' : ''}`} style={{ background: 'radial-gradient(ellipse at bottom, #070b22 0%, #02010f 100%)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Game Toggle Button */}
      <button
        onClick={(e) => { e.stopPropagation(); setGameEnabled(!gameEnabled); }}
        className="fixed top-5 right-5 z-[10001] px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
        style={{ background: gameEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(120, 200, 255, 0.1)', border: `1px solid ${gameEnabled ? 'rgba(34, 197, 94, 0.5)' : 'rgba(120, 200, 255, 0.3)'}`, color: gameEnabled ? '#22c55e' : '#7dd3fc' }}
      >
        {gameEnabled ? '🎮 Game ON' : '🎮 Play Game'}
      </button>
      <div className="fixed inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)', backgroundSize: '200px 200px, 300px 300px, 400px 400px', backgroundPosition: '0 0, 50px 100px, 130px 270px', animation: 'starMove 120s linear infinite' }} />
      {gameEnabled && (
        <div className="fixed inset-0 pointer-events-none z-50" style={{ fontFamily: '"JetBrains Mono", monospace', color: 'rgba(120, 200, 255, 0.75)' }}>
          <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(to bottom, rgba(120, 200, 255, 0.03) 0px, rgba(120, 200, 255, 0.03) 1px, transparent 3px, transparent 6px)', animation: 'scanMove 4s linear infinite' }} />
          <div className="absolute w-[120px] h-[120px] border border-[rgba(120,200,255,0.4)] rounded-full" style={{ left: mousePos.x, top: mousePos.y, transform: 'translate(-50%, -50%)' }}>
            <div className="absolute w-[1px] h-full left-1/2 top-0 bg-[rgba(120,200,255,0.6)]" /><div className="absolute h-[1px] w-full top-1/2 left-0 bg-[rgba(120,200,255,0.6)]" />
          </div>
          <div className="absolute top-5 left-5 w-[30px] h-[30px] border-l border-t border-[rgba(120,200,255,0.35)]" />
          <div className="absolute bottom-5 left-5 w-[30px] h-[30px] border-l border-b border-[rgba(120,200,255,0.35)]" />
          <div className="absolute bottom-5 right-5 w-[30px] h-[30px] border-r border-b border-[rgba(120,200,255,0.35)]" />
          <div className="absolute bottom-5 left-5 text-xs tracking-wider opacity-70 leading-relaxed">TARGET STATUS: ONLINE<br />X: {mousePos.x}<br />Y: {mousePos.y}<br />AI DEFEATED: {destroyedCount}</div>
        </div>
      )}
      {gameEnabled && asteroids.map(a => (<div key={a.id} className="fixed w-[50px] h-[50px] cursor-pointer transition-transform hover:scale-110 z-[100] flex items-center justify-center text-3xl" style={{ left: a.x, top: a.y }}>🤖</div>))}
      {gameEnabled && particles.map(p => (<div key={p.id} className="fixed w-[6px] h-[6px] rounded-full pointer-events-none z-[9999]" style={{ left: p.x, top: p.y, opacity: p.opacity, background: 'radial-gradient(circle, #7dd3fc 0%, #3b82f6 100%)' }} />))}
      {gameEnabled && clickEffects.map(e => (<div key={e.id} className="fixed w-[20px] h-[20px] rounded-full border-2 border-[#7dd3fc] pointer-events-none z-[9999]" style={{ left: e.x, top: e.y, transform: `translate(-50%, -50%) rotate(${e.rotation}deg)`, animation: 'ripple 0.8s forwards' }} />))}
      {gameEnabled && scorePopups.map(p => (<div key={p.id} className="fixed left-5 bottom-5 pointer-events-none z-[10000] text-sm text-[#7dd3fc]" style={{ fontFamily: '"JetBrains Mono", monospace', transform: `translateY(-${p.offset}px)`, opacity: p.opacity }}>+1</div>))}

      <main ref={mainRef} className="relative z-10 max-w-[900px] mx-auto px-6 py-10 min-h-screen transition-transform duration-150">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[#7dd3fc] hover:text-white mb-8 border-b border-dashed border-[rgba(125,211,252,0.4)] hover:border-white transition-colors"><ArrowLeft className="w-4 h-4" />Back to Blog</Link>
        <article className="flex flex-col gap-20">
          <h1 className="text-[2.6rem] leading-tight font-bold mb-10 text-[#c7d2fe]" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>The AI Singularity: Efficiency Meets Human Spark</h1>
          <p className="text-gray-400 italic -mt-16">By Robbie Creates — Powered by Shock Media Production</p>

          <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <div className="flex items-center gap-2 mb-2"><span className="text-[#7dd3fc] text-xs border border-[#7dd3fc] px-2 py-0.5 rounded" style={{ fontFamily: '"JetBrains Mono", monospace' }}>AI SCAN DATA</span></div>
            <p className="mb-0">AI is revolutionizing web development through speed and SEO-optimization, yet it often lacks brand-specific personality. ShockMP solves this by integrating AI-driven efficiency with cinematic human creativity to produce content that breaks algorithms while maintaining authentic connection.</p>
          </div>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>🚀 Rise of AI in Website Creation</h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">AI is now building websites—literally. From drag-and-drop builders to fully generated layouts, platforms are creating entire SEO-optimized environments with just a single prompt.</p>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">But here&apos;s the kicker: <strong>fast doesn&apos;t always mean impactful.</strong> AI gets you online, but it doesn&apos;t necessarily get you <em>on brand</em>.</p>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>⚖️ Diagnostic: The AI Matrix (Pros & Cons)</h2>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)] mb-6">
              <h3 className="text-xl font-bold text-[#c7d2fe] mb-4">✅ System Advantages</h3>
              <ul className="pl-6 text-[#e5e7eb] space-y-2">
                <li><strong>Efficiency:</strong> Crank out content at hyperspeed.</li>
                <li><strong>Cost-Effective:</strong> High-volume output for lower budget.</li>
                <li><strong>SEO-Friendly:</strong> AI structures data exactly how Google likes it.</li>
              </ul>
            </div>
            <div className="p-4 border-l-4 border-[#f43f5e] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <h3 className="text-xl font-bold text-[#c7d2fe] mb-4">❌ System Risks</h3>
              <ul className="pl-6 text-[#e5e7eb] space-y-2">
                <li><strong>Generic Vibes:</strong> Missing the &quot;soul&quot; only humans bring.</li>
                <li><strong>Plagiarism Risks:</strong> AI &quot;borrows&quot; from existing datasets.</li>
                <li><strong>Maintenance:</strong> Still requires human-level editing to stay relevant.</li>
              </ul>
            </div>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>🎯 The ShockMP Hybrid Approach</h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">At ShockMP, we don&apos;t fight the machine—we pilot it. We blend AI tools with raw, human creativity to build digital assets that actually resonate.</p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong>Growth Strategy:</strong> Error fixing and long-term scaling.</li>
              <li><strong>Visual Media:</strong> High-cinema photography and cinematic videography.</li>
              <li><strong>Audio/Visual:</strong> Podcast and YouTube support that connects with humans.</li>
              <li><strong>Algorithm Mastery:</strong> AI efficiency paired with elite storytelling.</li>
            </ul>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">We don&apos;t just build. We brand, boost, and break the algorithm with content that hits.</div>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>Internal Links (Read More)</h2>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><Link href="/blog/websites-shockmp" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">How Websites Work With ShockMP</Link></li>
              <li><Link href="/contact" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Get In Touch</Link></li>
            </ul>
          </section>

          <hr className="border-none h-[2px] my-20 bg-gradient-to-r from-transparent via-[#7dd3fc] to-transparent shadow-[0_0_15px_#7dd3fc]" />

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>Conclusion: Navigating the Future</h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">AI is evolving daily, but it&apos;s not about man vs. machine—it&apos;s about using both wisely. Let us help you adapt, elevate, and tell your story the way only you can—with ShockMP in your corner.</p>
          </section>

          <footer className="mt-24 pt-10 border-t border-[rgba(125,211,252,0.2)] text-center text-[#e5e7eb]"><p>© 2026 ShockAI — System Architecture by Robbie Creates</p></footer>
        </article>
      </main>
      <style jsx global>{`@keyframes starMove { from { transform: translateY(0); } to { transform: translateY(-2000px); } } @keyframes scanMove { from { background-position-y: 0; } to { background-position-y: 100px; } } @keyframes ripple { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }`}</style>
    </div>
  )
}
