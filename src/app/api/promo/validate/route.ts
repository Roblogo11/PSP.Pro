import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { code, type } = await request.json()

    if (!code) {
      return NextResponse.json({ valid: false })
    }

    const supabase = createAdminClient()

    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single()

    if (!promo) {
      return NextResponse.json({ valid: false })
    }

    const now = new Date()

    // Check expiration
    if (promo.expires_at && new Date(promo.expires_at) < now) {
      return NextResponse.json({ valid: false })
    }

    // Check max uses
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ valid: false })
    }

    // Check applies_to
    if (promo.applies_to !== 'all' && type && promo.applies_to !== type) {
      return NextResponse.json({ valid: false })
    }

    const label = promo.discount_type === 'percentage'
      ? `${promo.discount_value}% off`
      : `$${(promo.discount_value / 100).toFixed(2)} off`

    return NextResponse.json({
      valid: true,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      label,
      min_amount_cents: promo.min_amount_cents,
    })
  } catch {
    return NextResponse.json({ valid: false })
  }
}
