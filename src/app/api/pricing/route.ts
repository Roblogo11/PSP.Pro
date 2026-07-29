import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Public pricing snapshot — the single source of truth for anything that
 * QUOTES a price to a customer (chatbot, guide copy, marketing blurbs).
 *
 * ⚠ Why this exists: Dr. Prop's knowledge base used to hardcode prices. When
 * the Elite tier moved $60 -> $50 the chatbot kept telling customers "$30/mo"
 * (a price that was never real), and it quoted six services and three session
 * packages that existed in NO table. Hardcoded prices rot silently — there is
 * no error when they drift, just a bot lying about money on a live payment app.
 *
 * Anything price-shaped shown to a user should come from here, not from a
 * string literal. Public data only — no auth required, nothing sensitive.
 */

export const revalidate = 300 // 5 min — prices change rarely; don't hammer the DB

export async function GET() {
  try {
    const admin = createAdminClient()

    const [tiersRes, servicesRes] = await Promise.all([
      admin
        .from('membership_tiers')
        .select('slug, name, price_cents, billing_interval, is_active')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      admin
        .from('services')
        .select('name, price_cents, duration_minutes, category, is_active')
        .eq('is_active', true)
        .order('price_cents', { ascending: false }),
    ])

    const tiers = (tiersRes.data || []).map(t => ({
      slug: t.slug,
      name: t.name,
      priceCents: t.price_cents,
      price: formatUsd(t.price_cents),
      interval: t.billing_interval,
    }))

    const services = (servicesRes.data || []).map(s => ({
      name: s.name.trim(),
      priceCents: s.price_cents,
      price: formatUsd(s.price_cents),
      durationMinutes: s.duration_minutes,
      category: s.category,
    }))

    const paid = tiers.find(t => t.priceCents > 0) || null
    const free = tiers.find(t => t.priceCents === 0) || null

    return NextResponse.json({
      tiers,
      services,
      // Pre-computed so callers never have to do money math themselves.
      summary: {
        freeTierName: free?.name ?? 'Basic',
        paidTierName: paid?.name ?? 'Elite',
        paidTierPrice: paid?.price ?? null,
        paidTierInterval: paid?.interval ?? 'monthly',
        eliteDiscountPercent: ELITE_DISCOUNT_PERCENT,
        individual: services.filter(s => s.category === 'individual'),
        group: services.filter(s => s.category === 'group'),
        cheapest: services.length ? services[services.length - 1] : null,
        // "a $70 lesson costs an Elite member $63" — real numbers, always current.
        discountExamples: services.slice(0, 3).map(s => ({
          name: s.name,
          full: s.price,
          elite: formatUsd(Math.round(s.priceCents * (1 - ELITE_DISCOUNT_PERCENT / 100))),
        })),
      },
    })
  } catch (error: any) {
    console.error('Pricing fetch failed:', error?.message || error)
    // Callers must treat a failure as "say nothing about price" — never as
    // permission to fall back to a stale hardcoded figure.
    return NextResponse.json({ error: 'Pricing unavailable' }, { status: 500 })
  }
}

/** Elite's automatic discount. Mirrors the rate applied in stripe/checkout. */
const ELITE_DISCOUNT_PERCENT = 10

function formatUsd(cents: number): string {
  const dollars = cents / 100
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`
}
