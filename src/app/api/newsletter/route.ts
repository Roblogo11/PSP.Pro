import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Upsert — if they previously unsubscribed, reactivate
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          is_active: true,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
          source: source || 'blog',
        },
        { onConflict: 'email' }
      )

    if (error) {
      console.error('Newsletter signup error:', error)
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
