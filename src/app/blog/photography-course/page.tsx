'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Asteroid {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  gold: boolean
}

interface Particle {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  opacity: number
}

interface ClickEffect {
  id: number
  x: number
  y: number
  rotation: number
}

interface ScorePopup {
  id: number
  points: number
  color: string
  offset: number
  opacity: number
}

const STAGES = [
  { count: 0, emoji: '📷' },
  { count: 5, emoji: '📸' },
  { count: 10, emoji: '🎥' },
  { count: 20, emoji: '✨📸' }
]

const MAX_ASTEROIDS = 15

export default function PhotographyCoursePage() {
  const [gameEnabled, setGameEnabled] = useState(false)
  const [asteroids, setAsteroids] = useState<Asteroid[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([])
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([])
  const [destroyedCount, setDestroyedCount] = useState(0)
  const [stage, setStage] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isGoldenHeader, setIsGoldenHeader] = useState(false)
  const [goldSpawnedStages, setGoldSpawnedStages] = useState<Set<number>>(new Set())
  const mainRef = useRef<HTMLDivElement>(null)
  const asteroidIdRef = useRef(0)
  const particleIdRef = useRef(0)

  // Get current stage emoji
  const currentEmoji = STAGES[stage]?.emoji || '📷'

  // Mouse tracking for HUD crosshair + parallax
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

  // Spawn gold camera when stage changes
  const spawnGoldCamera = useCallback(() => {
    if (goldSpawnedStages.has(stage)) return
    setGoldSpawnedStages(prev => new Set([...prev, stage]))

    const x = Math.random() * (typeof window !== 'undefined' ? window.innerWidth - 60 : 800)
    const y = Math.random() * (typeof window !== 'undefined' ? window.innerHeight - 60 : 600)

    setAsteroids(prev => [...prev, {
      id: asteroidIdRef.current++,
      x,
      y,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      gold: true
    }])
  }, [stage, goldSpawnedStages])

  // Stage progression
  useEffect(() => {
    const newStage = STAGES.reduce((acc, s, i) => destroyedCount >= s.count ? i : acc, 0)
    if (newStage !== stage) {
      setStage(newStage)
      if (newStage === STAGES.length - 1) {
        setIsGoldenHeader(true)
      }
    }
  }, [destroyedCount, stage])

  // Spawn gold camera on stage change
  useEffect(() => {
    if (stage > 0) {
      spawnGoldCamera()
    }
  }, [stage, spawnGoldCamera])

  // Asteroid spawning
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
        return [...prev, {
          id: asteroidIdRef.current++,
          x,
          y,
          dx: (Math.random() - 0.5) * 2,
          dy: (Math.random() - 0.5) * 2,
          gold: false
        }]
      })
    }

    const interval = setInterval(spawnAsteroid, 1000)
    return () => clearInterval(interval)
  }, [gameEnabled])

  // Asteroid movement animation
  useEffect(() => {
    if (!gameEnabled) return
    let animationFrame: number

    const animate = () => {
      setAsteroids(prev => prev.map(a => {
        let newX = a.x + a.dx
        let newY = a.y + a.dy
        let newDx = a.dx
        let newDy = a.dy

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

  // Particle animation
  useEffect(() => {
    if (particles.length === 0) return

    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.dx,
          y: p.y + p.dy,
          opacity: p.opacity - 0.03
        }))
        .filter(p => p.opacity > 0)
      )
    }, 16)

    return () => clearInterval(interval)
  }, [particles.length])

  // Score popup animation
  useEffect(() => {
    if (scorePopups.length === 0) return

    const interval = setInterval(() => {
      setScorePopups(prev => prev
        .map(p => ({
          ...p,
          offset: p.offset + 1.5,
          opacity: p.opacity - 0.03
        }))
        .filter(p => p.opacity > 0)
      )
    }, 16)

    return () => clearInterval(interval)
  }, [scorePopups.length])

  // Clean up click effects
  useEffect(() => {
    if (clickEffects.length === 0) return
    const timeout = setTimeout(() => {
      setClickEffects([])
    }, 800)
    return () => clearTimeout(timeout)
  }, [clickEffects])

  const explodeAsteroid = (asteroid: Asteroid) => {
    // Create particles
    const count = 8 + Math.floor(Math.random() * 6)
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 4 + 2
      newParticles.push({
        id: particleIdRef.current++,
        x: asteroid.x + 25,
        y: asteroid.y + 25,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        opacity: 1
      })
    }

    setParticles(prev => [...prev, ...newParticles])

    // Update score
    const points = asteroid.gold ? 10 : 1
    setDestroyedCount(prev => prev + 1)

    // Add score popup
    setScorePopups(prev => [...prev, {
      id: Date.now(),
      points,
      color: asteroid.gold ? '#facc15' : '#7dd3fc',
      offset: 0,
      opacity: 1
    }])

    // Remove asteroid
    setAsteroids(prev => prev.filter(a => a.id !== asteroid.id))
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!gameEnabled) return
    // Add click effect
    setClickEffects(prev => [...prev, {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      rotation: Math.random() * 360
    }])

    // Check if clicked on asteroid
    asteroids.forEach(a => {
      const rect = {
        left: a.x,
        right: a.x + 50,
        top: a.y,
        bottom: a.y + 50
      }
      if (e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        explodeAsteroid(a)
      }
    })
  }

  return (
    <div
      onClick={handleClick}
      className={`min-h-screen relative overflow-hidden ${gameEnabled ? 'cursor-crosshair' : 'cursor-default'}`}
      style={{
        background: 'radial-gradient(ellipse at bottom, #070b22 0%, #02010f 100%)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
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

      {/* Starfield */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          background: `
            radial-gradient(white 1px, transparent 1px),
            radial-gradient(white 1px, transparent 1px),
            radial-gradient(white 1px, transparent 1px)
          `,
          backgroundSize: '200px 200px, 300px 300px, 400px 400px',
          backgroundPosition: '0 0, 50px 100px, 130px 270px',
          animation: 'starMove 120s linear infinite'
        }}
      />

      {/* HUD Overlay */}
      {gameEnabled && (
        <div className="fixed inset-0 pointer-events-none z-50" style={{ fontFamily: '"JetBrains Mono", monospace', color: 'rgba(120, 200, 255, 0.75)' }}>
          {/* Scanlines */}
          <div
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(to bottom, rgba(120, 200, 255, 0.03) 0px, rgba(120, 200, 255, 0.03) 1px, transparent 3px, transparent 6px)',
              animation: 'scanMove 4s linear infinite'
            }}
          />

          {/* Crosshair */}
          <div
            className="absolute w-[120px] h-[120px] border border-[rgba(120,200,255,0.4)] rounded-full"
            style={{
              left: mousePos.x,
              top: mousePos.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="absolute w-[1px] h-full left-1/2 top-0 bg-[rgba(120,200,255,0.6)]" />
            <div className="absolute h-[1px] w-full top-1/2 left-0 bg-[rgba(120,200,255,0.6)]" />
          </div>

          {/* Corner brackets */}
          <div className="absolute top-5 left-5 w-[30px] h-[30px] border-l border-t border-[rgba(120,200,255,0.35)]" />
          <div className="absolute top-5 right-5 w-[30px] h-[30px] border-r border-t border-[rgba(120,200,255,0.35)]" />
          <div className="absolute bottom-5 left-5 w-[30px] h-[30px] border-l border-b border-[rgba(120,200,255,0.35)]" />
          <div className="absolute bottom-5 right-5 w-[30px] h-[30px] border-r border-b border-[rgba(120,200,255,0.35)]" />

          {/* HUD Readouts */}
          <div className="absolute bottom-5 left-5 text-xs tracking-wider opacity-70 leading-relaxed">
            TARGET STATUS: ONLINE<br />
            X: {mousePos.x}<br />
            Y: {mousePos.y}<br />
            SIGNAL: {Math.floor(Math.random() * 100)}%<br />
            CAMERAS CAPTURED: {destroyedCount}
          </div>
        </div>
      )}

      {/* Asteroids */}
      {gameEnabled && asteroids.map(a => (
        <div
          key={a.id}
          className="fixed w-[50px] h-[50px] cursor-pointer transition-transform hover:scale-110 hover:-rotate-[5deg] flex items-center justify-center text-[32px] z-[100]"
          style={{
            left: a.x,
            top: a.y
          }}
        >
          {a.gold ? '✨📷' : currentEmoji}
        </div>
      ))}

      {/* Particles */}
      {gameEnabled && particles.map(p => (
        <div
          key={p.id}
          className="fixed w-[6px] h-[6px] rounded-full pointer-events-none z-[9999]"
          style={{
            left: p.x,
            top: p.y,
            opacity: p.opacity,
            background: 'radial-gradient(circle, #888 0%, #222 100%)'
          }}
        />
      ))}

      {/* Click Effects */}
      {gameEnabled && clickEffects.map(e => (
        <div
          key={e.id}
          className="fixed w-[36px] h-[36px] pointer-events-none z-[9999]"
          style={{
            left: e.x,
            top: e.y,
            background: 'linear-gradient(145deg, #c6d4ff, #5b7dff, #1e2b66)',
            clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
            boxShadow: '0 0 10px rgba(140, 170, 255, 0.9), inset 0 0 10px rgba(255, 255, 255, 0.5)',
            animation: 'hudPulse 1s ease-out forwards',
            ['--rot' as string]: `${e.rotation}deg`
          }}
        />
      ))}

      {/* Score Popups */}
      {gameEnabled && scorePopups.map(p => (
        <div
          key={p.id}
          className="fixed left-5 bottom-5 pointer-events-none z-[10000] text-sm"
          style={{
            color: p.color,
            fontFamily: '"JetBrains Mono", monospace',
            transform: `translateY(-${p.offset}px)`,
            opacity: p.opacity
          }}
        >
          +{p.points}
        </div>
      ))}

      {/* Main Content */}
      <main
        ref={mainRef}
        className="relative z-10 max-w-[900px] mx-auto px-6 py-10 min-h-screen transition-transform duration-150"
      >
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[#7dd3fc] hover:text-white mb-8 border-b border-dashed border-[rgba(125,211,252,0.4)] hover:border-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <article className="flex flex-col gap-20">
          <h1
            className={`text-[2.6rem] leading-tight font-bold mb-10 ${isGoldenHeader ? 'text-yellow-400' : 'text-[#c7d2fe]'}`}
            style={{
              textShadow: isGoldenHeader
                ? '0 0 10px gold, 0 0 20px #ffd700'
                : '0 0 10px rgba(99, 102, 241, 0.6)',
              animation: isGoldenHeader ? 'textGlow 2s infinite alternate' : 'none'
            }}
          >
            Free Photography Course: Things to Know Before Picking Up the Camera
          </h1>

          <p className="text-gray-400 italic -mt-16">By Robbie Creates — Published January 29, 2026</p>

          {/* TL;DR Block */}
          <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <strong>TL;DR:</strong> Before diving into photography, understand your camera, lighting, composition, and gear essentials. This free course helps beginners gain foundational skills, avoid common mistakes, and build confidence behind the lens.
          </div>

          <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            This free photography course equips aspiring creators with core knowledge of camera operation, composition principles, lighting strategies, and essential gear, enabling them to start shooting with confidence and purpose.
          </div>

          {/* Section: Understanding Your Camera */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              Understanding Your Camera
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">
              Whether you're using a DSLR, mirrorless camera, or smartphone, knowing your device's capabilities is crucial:
            </p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong>Exposure basics:</strong> ISO, aperture, shutter speed — how they work together to control light.</li>
              <li><strong>Modes and settings:</strong> Auto vs manual, and when to switch.</li>
              <li><strong>Lens knowledge:</strong> Prime vs zoom, focal length, and depth-of-field effects.</li>
            </ul>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              Grasping these fundamentals helps you predict outcomes and unleash creativity instead of just relying on automatic settings.
            </div>
          </section>

          <Link
            href="/photography"
            className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white hover:border-white transition-colors"
          >
            Back to photography services
          </Link>

          {/* Section: Composition */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              Composition & Framing Tips
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">
              Photography is storytelling through visuals. Composition determines whether your images resonate:
            </p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong>Rule of thirds:</strong> Position subjects off-center for balanced framing.</li>
              <li><strong>Leading lines:</strong> Guide the viewer's eye through your shot.</li>
              <li><strong>Negative space:</strong> Simplify your frame to highlight the subject.</li>
              <li><strong>Angles & perspectives:</strong> Experiment to create dynamic imagery.</li>
            </ul>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              Even with a basic camera, strong composition makes your photos appear professional and engaging.
            </div>
          </section>

          {/* Section: Lighting */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              Lighting: The Secret Weapon
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">
              Light shapes mood, depth, and clarity:
            </p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><strong>Natural light:</strong> Use mornings or golden hours for soft, cinematic effects.</li>
              <li><strong>Artificial light:</strong> Learn basic setups with affordable LEDs or ring lights.</li>
              <li><strong>Shadows & contrast:</strong> Experiment to add drama or focus attention.</li>
            </ul>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              Good lighting transforms average shots into captivating images. Your camera is only as good as the light you harness.
            </div>
          </section>

          {/* Section: Gear */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              Essential Gear for Beginners
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">
              Start simple, but know what matters:
            </p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li>Tripod for stability</li>
              <li>Extra batteries and memory cards</li>
              <li>Basic editing software (free or trial versions)</li>
              <li>Optional: Reflectors or diffusers for controlling light</li>
            </ul>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              Avoid splurging on advanced gear early. Focus on mastering fundamentals and creativity first.
            </div>
          </section>

          {/* Section: Resources */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              Free Resources & Next Steps
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">
              Several free online courses and communities can accelerate your growth:
            </p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><a href="https://www.coursera.org" target="_blank" rel="noopener noreferrer" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Coursera Photography Basics</a></li>
              <li><a href="https://www.udemy.com" target="_blank" rel="noopener noreferrer" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Udemy Free Photography Lessons</a></li>
              <li><a href="https://www.reddit.com/r/photography/" target="_blank" rel="noopener noreferrer" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Reddit Photography Community</a></li>
              <li><a href="https://www.flickr.com/groups/creativephotography/" target="_blank" rel="noopener noreferrer" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Flickr Creative Groups</a></li>
            </ul>
            <div className="p-4 border-l-4 border-[#6366f1] bg-[rgba(30,41,59,0.6)] rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              Combine theory with practice: shoot daily, analyze your results, and gradually refine your style.
            </div>
          </section>

          {/* Section: Links */}
          <section className="py-10">
            <h2 className="text-[1.9rem] font-bold text-[#c7d2fe] mb-8" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.6)' }}>
              Links (Read More)
            </h2>
            <p className="text-[#e5e7eb] text-lg max-w-[720px] mb-6 leading-relaxed">
              Explore more creator tools and AI resources:
            </p>
            <ul className="max-w-[680px] pl-6 my-6 text-[#e5e7eb] space-y-3.5 leading-relaxed">
              <li><Link href="/" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Home – ShockAI</Link></li>
              <li><Link href="/about" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">About Robbie Creates</Link></li>
              <li><Link href="/contact" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">Contact</Link></li>
              <li><Link href="/blog/cite-website-guide" className="text-[#7dd3fc] border-b border-dashed border-[rgba(125,211,252,0.4)] hover:text-white">How to cite a website?</Link></li>
            </ul>
          </section>

          {/* Hyperspace Divider */}
          <hr className="border-none h-[2px] my-20 bg-gradient-to-r from-transparent via-[#7dd3fc] to-transparent shadow-[0_0_15px_#7dd3fc]" />

          {/* Footer */}
          <footer className="mt-24 pt-10 border-t border-[rgba(125,211,252,0.2)] text-center text-[#e5e7eb]">
            <p>© 2026 ShockAI — Written by Robbie Creates</p>
          </footer>
        </article>
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes starMove {
          from { transform: translateY(0); }
          to { transform: translateY(-2000px); }
        }

        @keyframes scanMove {
          from { background-position-y: 0; }
          to { background-position-y: 100px; }
        }

        @keyframes hudPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.2) rotate(var(--rot, 0deg));
            opacity: 1;
            filter: brightness(2) saturate(2);
          }
          60% { filter: brightness(3) saturate(3); }
          100% {
            transform: translate(-50%, -50%) scale(7) rotate(calc(var(--rot, 0deg) + 360deg));
            opacity: 0;
          }
        }

        @keyframes textGlow {
          0% { text-shadow: 0 0 10px gold, 0 0 20px #ffd700; color: gold; }
          25% { text-shadow: 0 0 15px #ffd700, 0 0 25px #fffacd; color: #ffd700; }
          50% { text-shadow: 0 0 20px #fffacd, 0 0 30px #ffffe0; color: #fffacd; }
          75% { text-shadow: 0 0 15px #ffd700, 0 0 25px #fffacd; color: #ffd700; }
          100% { text-shadow: 0 0 10px gold, 0 0 20px #ffd700; color: gold; }
        }
      `}</style>
    </div>
  )
}
