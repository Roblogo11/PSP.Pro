'use client'

import { useEffect, useRef } from 'react'

export function AthleticOSBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animation variables
    let scanLineY = 0
    const gridSize = 60
    let gridPulse = 0

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw Data Grid (pulsing)
      ctx.strokeStyle = `rgba(0, 180, 216, ${0.08 + Math.sin(gridPulse) * 0.03})`
      ctx.lineWidth = 1

      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw Velocity Scan Lines (moving)
      for (let i = 0; i < 3; i++) {
        const y = (scanLineY + i * 400) % (canvas.height + 200)

        // Gradient scan line
        const gradient = ctx.createLinearGradient(0, y - 40, 0, y + 40)
        gradient.addColorStop(0, 'rgba(0, 180, 216, 0)')
        gradient.addColorStop(0.5, 'rgba(0, 180, 216, 0.15)')
        gradient.addColorStop(1, 'rgba(0, 180, 216, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, y - 40, canvas.width, 80)

        // Center line (brighter)
        ctx.strokeStyle = 'rgba(0, 180, 216, 0.3)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()

        // Accent line (orange)
        ctx.strokeStyle = 'rgba(255, 75, 43, 0.1)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, y + 2)
        ctx.lineTo(canvas.width, y + 2)
        ctx.stroke()
      }

      // Update animation values
      scanLineY += 0.5 // Slow movement
      gridPulse += 0.02

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        opacity: 0.6,
        mixBlendMode: 'screen',
      }}
    />
  )
}
