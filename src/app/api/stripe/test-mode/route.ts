import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Check current test mode status
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if master admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'master_admin' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check if test keys are configured
    const testKeyConfigured = !!(
      process.env.STRIPE_SECRET_KEY_TEST &&
      !process.env.STRIPE_SECRET_KEY_TEST.includes('PASTE_YOUR') &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST &&
      !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST.includes('PASTE_YOUR')
    )

    // Read cookie from request headers
    const cookieHeader = (await import('next/headers')).cookies
    const cookieStore = await cookieHeader()
    const testMode = cookieStore.get('stripe_test_mode')?.value === 'true'

    return NextResponse.json({
      testMode,
      testKeyConfigured,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Toggle test mode on/off
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if master admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'master_admin' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { enabled } = body

    // Verify test keys exist before enabling
    if (enabled) {
      const testKeyConfigured = !!(
        process.env.STRIPE_SECRET_KEY_TEST &&
        !process.env.STRIPE_SECRET_KEY_TEST.includes('PASTE_YOUR') &&
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST &&
        !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST.includes('PASTE_YOUR')
      )

      if (!testKeyConfigured) {
        return NextResponse.json({
          error: 'Test keys not configured. Add STRIPE_SECRET_KEY_TEST and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST to your .env.local file.',
        }, { status: 400 })
      }
    }

    // Set the cookie
    const response = NextResponse.json({
      testMode: !!enabled,
      message: enabled
        ? 'Test mode enabled. All payments will use Stripe test keys (no real charges).'
        : 'Test mode disabled. Payments are now LIVE.',
    })

    // Server-side cookie (httpOnly for security - used by API routes)
    response.cookies.set('stripe_test_mode', enabled ? 'true' : 'false', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: enabled ? 60 * 60 * 4 : 0, // 4 hours max, or delete
    })

    // Client-side cookie (readable by JS - used for UI banner display only)
    response.cookies.set('stripe_test_mode_ui', enabled ? 'true' : 'false', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: enabled ? 60 * 60 * 4 : 0,
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
