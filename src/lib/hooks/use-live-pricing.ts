'use client'

import { useEffect, useState } from 'react'

export interface LiveService {
  name: string
  priceCents: number
  price: string
  durationMinutes: number
  category: string
}

export interface LivePricing {
  tiers: { slug: string; name: string; priceCents: number; price: string; interval: string }[]
  services: LiveService[]
  summary: {
    freeTierName: string
    paidTierName: string
    paidTierPrice: string | null
    paidTierInterval: string
    eliteDiscountPercent: number
    individual: LiveService[]
    group: LiveService[]
    cheapest: LiveService | null
    discountExamples: { name: string; full: string; elite: string }[]
  }
}

/**
 * Live prices for anything that quotes money to a customer.
 *
 * ⚠ Returns `null` until loaded and on failure — that is deliberate. A caller
 * must render nothing rather than fall back to a hardcoded figure. Stale
 * hardcoded prices are exactly the bug this exists to kill: the chatbot spent
 * months telling customers "$30/mo" for a membership that was never $30.
 */
export function useLivePricing() {
  const [pricing, setPricing] = useState<LivePricing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/pricing')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled && d && !d.error) setPricing(d) })
      .catch(() => { /* stay null — never invent a price */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { pricing, loading }
}

/**
 * Replaces {{price tokens}} in knowledge-base copy with live values.
 *
 * Supported tokens:
 *   {{ELITE_PRICE}}       -> "$50"
 *   {{ELITE_NAME}}        -> "Elite"
 *   {{BASIC_NAME}}        -> "Basic"
 *   {{DISCOUNT_PCT}}      -> "10"
 *   {{SERVICE_LIST}}      -> bulleted list of every active service + price
 *   {{INDIVIDUAL_LIST}}   -> 1-on-1 services only
 *   {{GROUP_LIST}}        -> group services only
 *   {{DISCOUNT_EXAMPLES}} -> "• Lesson $70 → Elite pays $63"
 *
 * If pricing hasn't loaded, tokens resolve to neutral phrasing that points at
 * the Pricing page rather than stating a number we can't verify.
 */
export function resolvePricingTokens(text: string, pricing: LivePricing | null): string {
  if (!text.includes('{{')) return text

  const fallback = 'see the Pricing page'
  if (!pricing) {
    return text
      .replace(/\{\{ELITE_PRICE\}\}/g, fallback)
      .replace(/\{\{ELITE_NAME\}\}/g, 'Elite')
      .replace(/\{\{BASIC_NAME\}\}/g, 'Basic')
      .replace(/\{\{DISCOUNT_PCT\}\}/g, '10')
      .replace(/\{\{SERVICE_LIST\}\}|\{\{INDIVIDUAL_LIST\}\}|\{\{GROUP_LIST\}\}|\{\{DISCOUNT_EXAMPLES\}\}/g,
        'Check the Pricing page for current rates.')
  }

  const { summary, services } = pricing
  const line = (s: LiveService) => `• ${s.name}: ${s.price} / ${s.durationMinutes} min`

  return text
    .replace(/\{\{ELITE_PRICE\}\}/g, summary.paidTierPrice ?? fallback)
    .replace(/\{\{ELITE_NAME\}\}/g, summary.paidTierName)
    .replace(/\{\{BASIC_NAME\}\}/g, summary.freeTierName)
    .replace(/\{\{DISCOUNT_PCT\}\}/g, String(summary.eliteDiscountPercent))
    .replace(/\{\{SERVICE_LIST\}\}/g, services.map(line).join('\n') || fallback)
    .replace(/\{\{INDIVIDUAL_LIST\}\}/g, summary.individual.map(line).join('\n') || fallback)
    .replace(/\{\{GROUP_LIST\}\}/g, summary.group.map(line).join('\n') || fallback)
    .replace(/\{\{DISCOUNT_EXAMPLES\}\}/g,
      summary.discountExamples.map(e => `• ${e.name} ${e.full} → ${summary.paidTierName} pays ${e.elite}`).join('\n') || fallback)
}
