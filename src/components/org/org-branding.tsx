'use client'

import { useEffect } from 'react'
import type { OrgBranding } from '@/lib/org/use-org'

interface OrgBrandingProviderProps {
  org: OrgBranding | null
  children: React.ReactNode
}

// Converts a hex color to HSL components for CSS variable injection
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// OrgBrandingProvider injects per-org CSS variables into :root
// so Tailwind classes like bg-orange, text-cyan pick up org colors
export function OrgBrandingProvider({ org, children }: OrgBrandingProviderProps) {
  useEffect(() => {
    if (!org) return

    const root = document.documentElement

    // Inject org brand colors as CSS custom properties
    if (org.primary_color?.startsWith('#')) {
      root.style.setProperty('--color-brand-primary', hexToHsl(org.primary_color))
      root.style.setProperty('--org-primary', org.primary_color)
    }
    if (org.secondary_color?.startsWith('#')) {
      root.style.setProperty('--color-brand-secondary', hexToHsl(org.secondary_color))
      root.style.setProperty('--org-secondary', org.secondary_color)
    }

    // Store org metadata on root for CSS selectors
    root.setAttribute('data-org', org.slug)

    return () => {
      // Restore PSP defaults on unmount / org change
      root.style.removeProperty('--color-brand-primary')
      root.style.removeProperty('--color-brand-secondary')
      root.style.removeProperty('--org-primary')
      root.style.removeProperty('--org-secondary')
      root.removeAttribute('data-org')
    }
  }, [org?.id, org?.primary_color, org?.secondary_color])

  return <>{children}</>
}

// OrgBrandingBadge — shows which org is active (for coaches managing multiple orgs)
export function OrgBrandingBadge({ org }: { org: OrgBranding }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: org.primary_color }}>
      <span className="w-2 h-2 rounded-full bg-white/50" />
      {org.name}
    </div>
  )
}
