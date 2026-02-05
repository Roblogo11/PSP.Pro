'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Asteroid { id: number; x: number; y: number; dx: number; dy: number }
interface Particle { id: number; x: number; y: number; dx: number; dy: number; opacity: number }
interface ClickEffect { id: number; x: number; y: number; rotation: number }
interface ScorePopup { id: number; offset: number; opacity: number }

const MAX_ASTEROIDS = 15

export default function WebCookiesPage() {
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
    if (!gameEnabled) { setAsteroids([]); return }
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
      <button onClick={(e) => { e.stopPropagation(); setGameEnabled(!gameEnabled); }} className="fixed top-5 right-5 z-[10001] px-3 py-1.5 rounded-lg text-xs font-mono transition-all" style={{ background: gameEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(120, 200, 255, 0.1)', border: `1px solid ${gameEnabled ? 'rgba(34, 197, 94, 0.5)' : 'rgba(120, 200, 255, 0.3)'}`, color: gameEnabled ? '#22c55e' : '#7dd3fc' }}>{gameEnabled ? '🎮 Game ON' : '🎮 Play Game'}</button>
      <div className="fixed inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)', backgroundSize: '200px 200px, 300px 300px, 400px 400px', backgroundPosition: '0 0, 50px 100px, 130px 270px', animation: 'starMove 120s linear infinite' }} />
      {gameEnabled && (<div className="fixed inset-0 pointer-events-none z-50" style={{ fontFamily: '"JetBrains Mono", monospace', color: 'rgba(120, 200, 255, 0.75)' }}>
        <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(to bottom, rgba(120, 200, 255, 0.03) 0px, rgba(120, 200, 255, 0.03) 1px, transparent 3px, transparent 6px)', animation: 'scanMove 4s linear infinite' }} />
        <div className="absolute w-[120px] h-[120px] border border-[rgba(120,200,255,0.4)] rounded-full" style={{ left: mousePos.x, top: mousePos.y, transform: 'translate(-50%, -50%)' }}>
          <div className="absolute w-[1px] h-full left-1/2 top-0 bg-[rgba(120,200,255,0.6)]" /><div className="absolute h-[1px] w-full top-1/2 left-0 bg-[rgba(120,200,255,0.6)]" />
        </div>
        <div className="absolute top-5 left-5 w-[30px] h-[30px] border-l border-t border-[rgba(120,200,255,0.35)]" />
        <div className="absolute bottom-5 left-5 w-[30px] h-[30px] border-l border-b border-[rgba(120,200,255,0.35)]" />
        <div className="absolute bottom-5 right-5 w-[30px] h-[30px] border-r border-b border-[rgba(120,200,255,0.35)]" />
        <div className="absolute bottom-5 left-5 text-xs tracking-wider opacity-70 leading-relaxed">TARGET STATUS: ONLINE<br />X: {mousePos.x}<br />Y: {mousePos.y}<br />COOKIES DESTROYED: {destroyedCount}</div>
      </div>)}
      {gameEnabled && asteroids.map(a => (<div key={a.id} className="fixed w-[50px] h-[50px] cursor-pointer transition-transform hover:scale-110 z-[100] flex items-center justify-center text-3xl" style={{ left: a.x, top: a.y }}>🍪</div>))}
      {gameEnabled && particles.map(p => (<div key={p.id} className="fixed w-[6px] h-[6px] rounded-full pointer-events-none z-[9999]" style={{ left: p.x, top: p.y, opacity: p.opacity, background: 'radial-gradient(circle, #d4a574 0%, #8b5a2b 100%)' }} />))}
      {gameEnabled && clickEffects.map(e => (<div key={e.id} className="fixed w-[20px] h-[20px] rounded-full border-2 border-[#7dd3fc] pointer-events-none z-[9999]" style={{ left: e.x, top: e.y, transform: `translate(-50%, -50%) rotate(${e.rotation}deg)`, animation: 'ripple 0.8s forwards' }} />))}
      {gameEnabled && scorePopups.map(p => (<div key={p.id} className="fixed left-5 bottom-5 pointer-events-none z-[10000] text-sm text-[#7dd3fc]" style={{ fontFamily: '"JetBrains Mono", monospace', transform: `translateY(-${p.offset}px)`, opacity: p.opacity }}>+1</div>))}

      <main ref={mainRef} className="relative z-10 max-w-[900px] mx-auto px-6 py-10 min-h-screen transition-transform duration-150">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[#7dd3fc] hover:text-white mb-8 border-b border-dashed border-[rgba(125,211,252,0.4)] hover:border-white transition-colors"><ArrowLeft className="w-4 h-4" />Back to Blog</Link>
        <article className="flex flex-col gap-20">
          <h1 className="text-[2.6rem] leading-tight font-bold mb-10 text-[#c7d2fe]" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>Data Fragments: Decrypting the Web Cookie – What They Are and Why They Track You</h1>
          <p className="text-gray-400 italic -mt-16">By Robbie Creates — Published January 29, 2026</p>
          <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]"><strong>TL;DR:</strong> An HTTP cookie is a small data file a server sends to a user&apos;s web browser, which the browser then sends back with every subsequent request. They are essential for keeping you logged in and shopping carts working, but they are also used for cross-site tracking and targeted ads.</div>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>Protocol Gap: Why We Needed a &quot;Cookie&quot; in the First Place</h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">The foundation of the World Wide Web, the <strong>Hypertext Transfer Protocol (HTTP)</strong>, is inherently <strong>stateless</strong>. Every request from your browser to a server is treated as a completely new, independent interaction.</p>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">This stateless nature is efficient, but it breaks basic functionality. How could a server know who you are after you log in? The solution? The <strong>HTTP Cookie</strong>, formalized in 1994 by Netscape programmer <strong>Lou Montulli</strong>.</p>
            <ol className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed list-decimal">
              <li><strong>Server sends:</strong> When you visit a site, the server tells your browser to store a small text file—a cookie—with a unique ID.</li>
              <li><strong>Browser stores:</strong> Your browser holds onto this digital ID card.</li>
              <li><strong>Browser sends:</strong> On every subsequent request, your browser automatically includes the cookie in the header.</li>
            </ol>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">This simple feedback loop gives the server a &quot;short-term memory.&quot; <strong>It&apos;s not code; it&apos;s a data fragment.</strong></div>
          </section>

          <Link href="/website-help" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white hover:border-white transition-colors">Back to website services</Link>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>Classification: Session, Persistent, and Third-Party</h2>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong>Session Cookies (Ephemeral):</strong> Temporary. Vanish when you close the browser. Crucial for login sessions.</li>
              <li><strong>Persistent Cookies (Permanent):</strong> Given an expiration date. Stored on your device across sessions.</li>
              <li><strong>Third-Party Cookies (Surveillance):</strong> Set by a domain <em>other</em> than the one you&apos;re visiting. Primary mechanism for cross-site tracking.</li>
            </ul>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]"><strong>First-Party Cookies</strong> are generally benign. <strong>Third-Party Cookies</strong> are the primary mechanism for cross-site tracking and targeted advertising.</div>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>The Advertising Matrix: How Tracking Works</h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">Third-party cookies are the backbone of digital advertising. Their job is to track you across the web, building a comprehensive profile of your interests.</p>
            <ol className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed list-decimal">
              <li>You visit a shoe website (A). Ad Network (Z) sets its tracking cookie.</li>
              <li>You go to a news site (B) that also uses Ad Network (Z).</li>
              <li>Network Z recognizes your unique ID and connects your visits.</li>
            </ol>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed"><strong>The web transforms from independent domains into one large, interconnected tracking matrix.</strong></p>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>The Digital Cold War: Privacy Regulation</h2>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong>GDPR (Europe):</strong> Mandatory explicit consent for non-essential cookies. This birthed the &quot;Cookie Banner.&quot;</li>
              <li><strong>CCPA/CPRA (California):</strong> Users can opt out of data sale.</li>
              <li><strong>Browser Blockade:</strong> Firefox and Safari block third-party cookies by default. Chrome is phasing them out for the <strong>Privacy Sandbox</strong>.</li>
            </ul>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">The war on cookies is about <strong>control</strong>. Who owns the data fragments generated by your activity?</div>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>Security Payload: Cookie Risks</h2>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong>Cross-Site Scripting (XSS):</strong> Malicious code can steal unencrypted cookies and hijack sessions.</li>
              <li><strong>Cross-Site Request Forgery (CSRF):</strong> Attackers trick browsers into sending requests with cookies.</li>
            </ul>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">Developers mitigate this with <code className="bg-dark-200 px-2 py-1 rounded">Secure</code> and <code className="bg-dark-200 px-2 py-1 rounded">HttpOnly</code> flags.</p>
          </section>

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>Links (Read More)</h2>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><Link href="/" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Home – ShockAI</Link></li>
              <li><Link href="/contact" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Contact ShockAI</Link></li>
              <li><Link href="/blog/ai-vs-websites" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">AI vs Websites: Who wins?</Link></li>
            </ul>
          </section>

          <hr className="border-none h-[2px] my-20 bg-gradient-to-r from-transparent via-[#7dd3fc] to-transparent shadow-[0_0_15px_#7dd3fc]" />

          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>Conclusion: Data Fragments and the Stateless Future</h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">HTTP cookies are a hack that became a foundational pillar. They fixed the stateless problem of HTTP, enabling commerce, personalization, and—inevitably—mass surveillance. The future moves toward <strong>browser fingerprinting</strong> and contextual advertising.</p>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">Understanding the cookie is the key to decoding the data fragment that tells a network: <strong>&quot;The user is here, and this is what they want.&quot;</strong></p>
          </section>

          <footer className="mt-24 pt-10 border-t border-[rgba(125,211,252,0.2)] text-center text-[#e5e7eb]"><p>© 2026 ShockAI — Written by Robbie Creates</p></footer>
        </article>
      </main>
      <style jsx global>{`@keyframes starMove { from { transform: translateY(0); } to { transform: translateY(-2000px); } } @keyframes scanMove { from { background-position-y: 0; } to { background-position-y: 100px; } } @keyframes ripple { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }`}</style>
    </div>
  )
}
