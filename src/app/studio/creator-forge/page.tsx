'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Node {
  id: string
  type: 'flagship' | 'hub' | 'sub'
  name: string
  platform: string
  persona: string
  x: number
  y: number
}

interface Link {
  id: string
  fromId: string
  toId: string
  type: string
}

const LINK_COLORS: Record<string, string> = {
  'co-post': '#a78bfa',
  'cross-tag': '#06b6d4',
  'content-remix': '#f472b6',
  'share-ugc': '#fbbf24',
}

export default function CreatorForgePage() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [step, setStep] = useState(1)
  const [zoom, setZoom] = useState(1)

  // Form states
  const [flagshipName, setFlagshipName] = useState('@RobbieCreatesHEX')
  const [flagshipTag, setFlagshipTag] = useState('Poetry · Crypto · Interviews')
  const [hubName, setHubName] = useState('')
  const [hubType, setHubType] = useState('faceless')
  const [subName, setSubName] = useState('')
  const [subPlatform, setSubPlatform] = useState('')
  const [subPersona, setSubPersona] = useState('faceless')
  const [linkFrom, setLinkFrom] = useState('')
  const [linkTo, setLinkTo] = useState('')
  const [linkType, setLinkType] = useState('co-post')

  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ nodeId: string; startX: number; startY: number; origX: number; origY: number } | null>(null)

  const totalSteps = 5

  // Initialize with example data
  useEffect(() => {
    const flagshipId = 'n-flagship-init'
    const hubId = 'n-hub-ex'
    const initialNodes: Node[] = [
      { id: flagshipId, type: 'flagship', name: '@RobbieCreatesHEX — Poetry · Crypto · Interviews', platform: 'Primary', persona: 'Personal', x: 600, y: 140 },
      { id: hubId, type: 'hub', name: 'Nerd Athletes', platform: 'IG/FB/Discord', persona: 'faceless', x: 600, y: 320 },
      { id: 'n-example-1', type: 'sub', name: 'HEX.vs.Crypto', platform: 'YouTube/IG', persona: 'Analytical', x: 420, y: 360 },
      { id: 'n-example-2', type: 'sub', name: 'Brain vs AI', platform: 'IG/TikTok', persona: 'Cinematic', x: 780, y: 360 },
      { id: 'n-example-3', type: 'sub', name: 'Drop of Energy', platform: 'IG/TikTok', persona: 'Energetic', x: 600, y: 520 },
    ]
    const initialLinks: Link[] = [
      { id: 'l-ex-1', fromId: flagshipId, toId: hubId, type: 'co-post' },
      { id: 'l-ex-2', fromId: hubId, toId: 'n-example-1', type: 'cross-tag' },
      { id: 'l-ex-3', fromId: hubId, toId: 'n-example-2', type: 'content-remix' },
      { id: 'l-ex-4', fromId: 'n-example-3', toId: hubId, type: 'share-ugc' },
    ]
    setNodes(initialNodes)
    setLinks(initialLinks)
  }, [])

  const saveFlagship = useCallback(() => {
    if (!flagshipName.trim()) {
      alert('Flagship name required.')
      return false
    }
    const name = flagshipName.trim() + (flagshipTag.trim() ? ' — ' + flagshipTag.trim() : '')
    setNodes(prev => {
      const filtered = prev.filter(n => n.type !== 'flagship')
      return [...filtered, { id: 'n-' + Date.now(), type: 'flagship', name, platform: 'Primary', persona: 'Personal', x: 600, y: 140 }]
    })
    return true
  }, [flagshipName, flagshipTag])

  const saveHubAndNext = () => {
    if (!hubName.trim()) {
      if (!confirm('No hub name provided. Skip hub?')) return
    } else {
      setNodes(prev => {
        const filtered = prev.filter(n => n.type !== 'hub')
        return [...filtered, { id: 'n-' + Date.now(), type: 'hub', name: hubName.trim(), platform: 'IG/FB/Discord', persona: hubType, x: 600, y: 360 }]
      })
    }
    setStep(3)
  }

  const addSub = () => {
    if (!subName.trim()) {
      alert('Enter a sub-brand name.')
      return
    }
    const id = 'n-' + Date.now() + '-' + Math.floor(Math.random() * 999)
    const x = 400 + Math.random() * 400
    const y = 220 + Math.random() * 280
    setNodes(prev => [...prev, { id, type: 'sub', name: subName.trim(), platform: subPlatform || 'IG', persona: subPersona, x, y }])
    setSubName('')
    setSubPlatform('')
    setSubPersona('faceless')
  }

  const removeNode = (id: string) => {
    if (!confirm('Remove this node?')) return
    setNodes(prev => prev.filter(n => n.id !== id))
    setLinks(prev => prev.filter(l => l.fromId !== id && l.toId !== id))
  }

  const addLink = () => {
    if (!linkFrom || !linkTo) {
      alert('Choose both From and To.')
      return
    }
    if (linkFrom === linkTo) {
      alert('From & To cannot be the same.')
      return
    }
    const id = 'l-' + Date.now() + '-' + Math.floor(Math.random() * 999)
    setLinks(prev => [...prev, { id, fromId: linkFrom, toId: linkTo, type: linkType }])
  }

  const removeLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  const clearLinks = () => {
    if (!confirm('Clear all links?')) return
    setLinks([])
  }

  const autoLayout = () => {
    setNodes(prev => {
      const newNodes = [...prev]
      const root = newNodes.find(n => n.type === 'hub') || newNodes.find(n => n.type === 'flagship')
      const center = root ? { x: root.x, y: root.y } : { x: 600, y: 300 }
      const subs = newNodes.filter(n => n.type === 'sub')
      const r = 200
      subs.forEach((s, i) => {
        const angle = (i / subs.length) * Math.PI * 2
        s.x = center.x + Math.cos(angle) * (r + 20 * (i % 3))
        s.y = center.y + Math.sin(angle) * (r + 20 * (i % 3))
      })
      const flagship = newNodes.find(n => n.type === 'flagship')
      if (flagship) { flagship.x = center.x; flagship.y = center.y - 220 }
      const hubN = newNodes.find(n => n.type === 'hub')
      if (hubN) { hubN.x = center.x; hubN.y = center.y }
      return newNodes
    })
  }

  const downloadJSON = () => {
    const data = { meta: { generatedBy: 'CreatorForge', date: new Date().toISOString() }, nodes, links }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'creator-blueprint.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadSVG = () => {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svgRef.current)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'creator-map.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPNG = () => {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgRef.current)
    const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 700
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#040512'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = 'creator-map.png'
      a.click()
    }
    img.onerror = () => alert('Image conversion failed. Try downloading SVG instead.')
    img.src = encoded
  }

  const resetAll = () => {
    if (!confirm('Reset all nodes and links? This cannot be undone.')) return
    setNodes([])
    setLinks([])
    setFlagshipName('')
    setFlagshipTag('')
    setHubName('')
    setSubName('')
    setSubPlatform('')
    setStep(1)
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!saveFlagship()) return
    }
    if (step < totalSteps) setStep(step + 1)
  }

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  // Drag handling
  const handlePointerDown = (e: React.PointerEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    dragRef.current = { nodeId, startX: e.clientX, startY: e.clientY, origX: node.x, origY: node.y }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const { nodeId, startX, startY, origX, origY } = dragRef.current
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    setNodes(prev => prev.map(n =>
      n.id === nodeId
        ? { ...n, x: Math.max(60, Math.min(1140, origX + dx)), y: Math.max(60, Math.min(640, origY + dy)) }
        : n
    ))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      ;(e.target as Element).releasePointerCapture(e.pointerId)
      dragRef.current = null
    }
  }

  const handleNodeDoubleClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    const newName = prompt('Edit node name:', node.name)
    if (newName !== null) {
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, name: newName.trim() || n.name } : n))
    }
  }

  const getNodeFill = (type: string) => {
    if (type === 'flagship') return '#7c3aed'
    if (type === 'hub') return '#06b6d4'
    return '#243447'
  }

  const getNodeRadius = (type: string) => {
    if (type === 'flagship') return 36
    if (type === 'hub') return 30
    return 26
  }

  const subs = nodes.filter(n => n.type === 'sub')

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #040512 0%, #07102a 100%)', color: '#E6EEF8' }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Back to Studio */}
        <Link
          href="/studio"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Studio
        </Link>

        {/* Header */}
        <header className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-cyan-400 text-white text-2xl font-extrabold">
            RC
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-200 via-yellow-100 to-sky-100 bg-clip-text text-transparent animate-pulse">
              Creator Forge — Build your Creator Economy Blueprint
            </h1>
            <div className="text-sm text-slate-300">Walk creators through Robbie&apos;s system and export a production-ready network map.</div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Wizard */}
          <section className="lg:col-span-1 bg-[#071428] p-4 rounded-xl border border-slate-800">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm font-semibold px-3 py-1 rounded-full bg-[#0b1220]">Step {step} / {totalSteps}</div>
                <div className="text-xs text-slate-400">Create your flagship, hub, sub-channels and links</div>
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-sky-200 via-yellow-100 to-sky-100 bg-clip-text text-transparent">Step 1 — Flagship Identity</h3>
                  <p className="text-sm text-slate-300">Your main face/anchor (e.g., @RobbieCreatesHEX)</p>
                  <input
                    value={flagshipName}
                    onChange={e => setFlagshipName(e.target.value)}
                    className="w-full bg-transparent border border-slate-700 rounded-md p-2 text-white"
                    placeholder="Flagship name (required)"
                  />
                  <input
                    value={flagshipTag}
                    onChange={e => setFlagshipTag(e.target.value)}
                    className="w-full bg-transparent border border-slate-700 rounded-md p-2 text-white"
                    placeholder="Tagline / short description"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleNextStep} className="ml-auto px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-cyan-400 text-black font-semibold">Save & Next</button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-sky-200 via-yellow-100 to-sky-100 bg-clip-text text-transparent">Step 2 — Collective Hub</h3>
                  <p className="text-sm text-slate-300">Create your central hub (like Nerd Athletes)</p>
                  <input
                    value={hubName}
                    onChange={e => setHubName(e.target.value)}
                    className="w-full bg-transparent border border-slate-700 rounded-md p-2 text-white"
                    placeholder="Hub name (optional)"
                  />
                  <select value={hubType} onChange={e => setHubType(e.target.value)} className="w-full bg-transparent border border-slate-700 rounded-md p-2 text-white">
                    <option value="faceless">Faceless Collective</option>
                    <option value="branded">Branded Studio</option>
                    <option value="community">Community Group</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handlePrevStep} className="px-3 py-2 rounded-md border border-slate-700">Back</button>
                    <button onClick={saveHubAndNext} className="ml-auto px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-cyan-400 text-black font-semibold">Save & Next</button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-sky-200 via-yellow-100 to-sky-100 bg-clip-text text-transparent">Step 3 — Add Sub-Brands</h3>
                  <p className="text-sm text-slate-300">Add faceless channels (Brain vs AI, Drop of Energy, etc.)</p>
                  <input
                    value={subName}
                    onChange={e => setSubName(e.target.value)}
                    className="w-full bg-transparent border border-slate-700 rounded-md p-2 text-white"
                    placeholder="Channel name (e.g., Brain vs AI)"
                  />
                  <input
                    value={subPlatform}
                    onChange={e => setSubPlatform(e.target.value)}
                    className="w-full bg-transparent border border-slate-700 rounded-md p-2 text-white"
                    placeholder="Platform(s) - e.g., IG, TikTok, YouTube"
                  />
                  <select value={subPersona} onChange={e => setSubPersona(e.target.value)} className="w-full bg-transparent border border-slate-700 rounded-md p-2 text-white">
                    <option value="faceless">Faceless</option>
                    <option value="narrative">Narrative / Cinematic</option>
                    <option value="educational">Educational / Analytical</option>
                    <option value="energetic">Energetic / Viral</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={addSub} className="px-3 py-2 rounded-md bg-slate-700">Add Sub-Brand</button>
                    <button onClick={() => { setSubName(''); setSubPlatform(''); setSubPersona('faceless') }} className="px-3 py-2 rounded-md border border-slate-700">Clear</button>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold">Current Sub-Brands</h4>
                    <ul className="mt-2 space-y-2 text-sm">
                      {subs.map(n => (
                        <li key={n.id} className="flex items-center justify-between bg-[#0a1624] p-2 rounded">
                          <div>
                            <div className="text-sm font-medium">{n.name}</div>
                            <div className="text-xs text-slate-400">{n.platform} · {n.persona}</div>
                          </div>
                          <button onClick={() => removeNode(n.id)} className="px-2 py-1 rounded border border-slate-700 text-xs">Remove</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handlePrevStep} className="px-3 py-2 rounded-md border border-slate-700">Back</button>
                    <button onClick={handleNextStep} className="ml-auto px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-cyan-400 text-black font-semibold">Next: Links</button>
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-sky-200 via-yellow-100 to-sky-100 bg-clip-text text-transparent">Step 4 — Synergy Links</h3>
                  <p className="text-sm text-slate-300">Define relationships between nodes</p>
                  <label className="text-xs text-slate-400">From</label>
                  <select value={linkFrom} onChange={e => setLinkFrom(e.target.value)} className="w-full bg-transparent border border-slate-700 rounded-md p-2 text-white">
                    <option value="">-- select --</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                  <label className="text-xs text-slate-400">To</label>
                  <select value={linkTo} onChange={e => setLinkTo(e.target.value)} className="w-full bg-transparent border border-slate-700 rounded-md p-2 text-white">
                    <option value="">-- select --</option>
                    {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                  <label className="text-xs text-slate-400">Strategy</label>
                  <select value={linkType} onChange={e => setLinkType(e.target.value)} className="w-full bg-transparent border border-slate-700 rounded-md p-2 text-white">
                    <option value="co-post">Co-post / co-create</option>
                    <option value="cross-tag">Cross-tag / shoutout</option>
                    <option value="content-remix">Content remix / clip reuse</option>
                    <option value="share-ugc">Share UGC / community repost</option>
                  </select>
                  <div className="flex gap-2">
                    <button onClick={addLink} className="px-3 py-2 rounded-md bg-slate-700">Create Link</button>
                    <button onClick={clearLinks} className="px-3 py-2 rounded-md border border-slate-700">Clear All Links</button>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold">Current Links</h4>
                    <ul className="mt-2 text-sm space-y-2">
                      {links.map(l => {
                        const from = nodes.find(n => n.id === l.fromId)?.name || '—'
                        const to = nodes.find(n => n.id === l.toId)?.name || '—'
                        return (
                          <li key={l.id} className="flex items-center justify-between bg-[#061425] p-2 rounded">
                            <div className="text-sm">{from} → {to}</div>
                            <div className="flex gap-2 items-center">
                              <div className="text-xs text-slate-400">{l.type}</div>
                              <button onClick={() => removeLink(l.id)} className="px-2 py-1 rounded border border-slate-700 text-xs">X</button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handlePrevStep} className="px-3 py-2 rounded-md border border-slate-700">Back</button>
                    <button onClick={handleNextStep} className="ml-auto px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-cyan-400 text-black font-semibold">Next: Export</button>
                  </div>
                </div>
              )}

              {/* Step 5 */}
              {step === 5 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-sky-200 via-yellow-100 to-sky-100 bg-clip-text text-transparent">Step 5 — Export & Share</h3>
                  <p className="text-sm text-slate-300">Download the blueprint or copy JSON to import later.</p>
                  <div className="grid gap-2">
                    <button onClick={downloadJSON} className="px-3 py-2 rounded-md bg-slate-800 border border-slate-600">Download JSON Blueprint</button>
                    <button onClick={downloadSVG} className="px-3 py-2 rounded-md bg-slate-800 border border-slate-600">Download SVG Map</button>
                    <button onClick={downloadPNG} className="px-3 py-2 rounded-md bg-slate-800 border border-slate-600">Download PNG Map</button>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-sm font-semibold">Quick Copy</h4>
                    <textarea
                      readOnly
                      value={JSON.stringify({ nodes, links }, null, 2)}
                      className="w-full mt-2 p-2 rounded-md bg-[#061025] text-sm h-28 text-white"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={handlePrevStep} className="px-3 py-2 rounded-md border border-slate-700">Back</button>
                    <button onClick={resetAll} className="ml-auto px-3 py-2 rounded-md bg-red-600 text-white">Reset All</button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right: Canvas / Graph */}
          <section className="lg:col-span-2 bg-[#071428] p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-slate-400">Live map — drag nodes to arrange your network</div>
                <div className="text-xs text-slate-500">Tip: double-click any node to edit its label.</div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="text-xs text-slate-400 mr-2">Zoom</div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  value={zoom}
                  step="0.05"
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="w-36"
                />
              </div>
            </div>

            <div className="relative border border-slate-800 rounded-md overflow-hidden" style={{ height: 520 }}>
              <div className="w-full h-full" style={{ touchAction: 'none' }}>
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  viewBox="0 0 1200 700"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                >
                  <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Links */}
                  <g>
                    {links.map(l => {
                      const n1 = nodes.find(n => n.id === l.fromId)
                      const n2 = nodes.find(n => n.id === l.toId)
                      if (!n1 || !n2) return null
                      return (
                        <line
                          key={l.id}
                          x1={n1.x}
                          y1={n1.y}
                          x2={n2.x}
                          y2={n2.y}
                          stroke={LINK_COLORS[l.type] || '#9aa7b2'}
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          opacity={0.9}
                        />
                      )
                    })}
                  </g>

                  {/* Nodes */}
                  <g>
                    {nodes.map(n => (
                      <g
                        key={n.id}
                        transform={`translate(${n.x},${n.y})`}
                        style={{ cursor: 'grab' }}
                        onPointerDown={e => handlePointerDown(e, n.id)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onDoubleClick={() => handleNodeDoubleClick(n.id)}
                      >
                        <circle
                          r={getNodeRadius(n.type)}
                          fill={getNodeFill(n.type)}
                          stroke="rgba(255,255,255,0.06)"
                          filter="url(#glow)"
                        />
                        <text
                          y={n.type === 'flagship' ? 52 : n.type === 'hub' ? 44 : 42}
                          textAnchor="middle"
                          fill="#e6eef8"
                          fontSize={13}
                          fontWeight={600}
                          style={{ pointerEvents: 'none' }}
                        >
                          {n.name}
                        </text>
                        <text
                          y={n.type === 'flagship' ? 66 : n.type === 'hub' ? 58 : 56}
                          textAnchor="middle"
                          fill="#9fb7c1"
                          fontSize={11}
                          style={{ pointerEvents: 'none' }}
                        >
                          {n.platform}
                        </text>
                      </g>
                    ))}
                  </g>
                </svg>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Auto-layout:
                <button onClick={autoLayout} className="ml-2 px-2 py-1 rounded bg-slate-700">Run</button>
              </div>
              <div className="text-sm text-slate-400 flex items-center gap-4">
                <span>Legend:</span>
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Flagship</span>
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-cyan-400"></span> Hub</span>
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-500"></span> Sub</span>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-6 text-sm text-slate-400">Built for RobbieCreates — Creator economy blueprint builder by ShockAI</footer>
      </div>
    </div>
  )
}
