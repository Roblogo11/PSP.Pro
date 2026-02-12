import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

interface ScheduleEntry {
  date: string       // "2026-02-11"
  time: string       // "5:00 pm"
  customer: string   // "Maggie Shelton"
}

// Convert "5:00 pm" → "17:00:00"
function parseTime(timeStr: string): string {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i)
  if (!match) throw new Error(`Invalid time format: ${timeStr}`)

  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  const period = match[3].toLowerCase()

  if (period === 'pm' && hours !== 12) hours += 12
  if (period === 'am' && hours === 12) hours = 0

  return `${hours.toString().padStart(2, '0')}:${minutes}:00`
}

// Add duration to time string
function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMins = h * 60 + m + mins
  const newH = Math.floor(totalMins / 60)
  const newM = totalMins % 60
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}:00`
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin/coach
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client for role check (bypasses RLS timing)
    const adminClient = getAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'coach' && profile.role !== 'master_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      schedule,          // ScheduleEntry[]
      coach_name,        // "Coach Rachel B." — used to find coach profile
      service_name,      // Optional — which service to book (default: first active individual)
      default_duration,  // Optional — session duration in minutes (default: 60)
    } = body as {
      schedule: ScheduleEntry[]
      coach_name?: string
      service_name?: string
      default_duration?: number
    }

    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      return NextResponse.json({ error: 'Schedule array is required' }, { status: 400 })
    }

    const duration = default_duration || 60

    // 1. Find the coach
    let coachId: string

    if (coach_name) {
      const { data: coach } = await adminClient
        .from('profiles')
        .select('id')
        .ilike('full_name', `%${coach_name}%`)
        .in('role', ['coach', 'admin', 'master_admin'])
        .single()

      if (coach) {
        coachId = coach.id
      } else {
        // Use the requesting user as coach
        coachId = user.id
      }
    } else {
      coachId = user.id
    }

    // 2. Find the default service
    let serviceId: string | null = null
    let servicePriceCents = 7500 // fallback $75

    if (service_name) {
      const { data: svc } = await adminClient
        .from('services')
        .select('id, price_cents')
        .ilike('name', `%${service_name}%`)
        .eq('is_active', true)
        .single()

      if (svc) {
        serviceId = svc.id
        servicePriceCents = svc.price_cents
      }
    }

    if (!serviceId) {
      // Grab first active service (any category)
      const { data: svc } = await adminClient
        .from('services')
        .select('id, price_cents')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (svc) {
        serviceId = svc.id
        servicePriceCents = svc.price_cents
      }
    }

    // 3. Get unique customer names and create/find athlete profiles
    const uniqueCustomers = [...new Set(schedule.map((s) => s.customer))]
    const athleteMap: Record<string, string> = {} // name → profile id

    for (const customerName of uniqueCustomers) {
      // Check if athlete already exists by name
      const { data: existing } = await adminClient
        .from('profiles')
        .select('id')
        .ilike('full_name', customerName)
        .eq('role', 'athlete')
        .limit(1)

      if (existing && existing.length > 0) {
        athleteMap[customerName] = existing[0].id
        continue
      }

      // Create placeholder email from name
      const emailSlug = customerName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
      const placeholderEmail = `${emailSlug}@psp.athlete`

      // Generate random password (placeholder accounts use forgot-password flow)
      const crypto = await import('crypto')
      const tempPassword = crypto.randomBytes(16).toString('base64url') + '!Aa1'

      // Create auth user with placeholder email
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: placeholderEmail,
        email_confirm: true,
        password: tempPassword,
        user_metadata: { full_name: customerName },
      })

      if (authError) {
        // If email already taken, try to find by email
        if (authError.message?.includes('already been registered')) {
          const { data: byEmail } = await adminClient
            .from('profiles')
            .select('id')
            .eq('email', placeholderEmail)
            .single()

          if (byEmail) {
            athleteMap[customerName] = byEmail.id
            continue
          }
        }
        console.error(`Failed to create athlete ${customerName}:`, authError)
        continue
      }

      if (authData.user) {
        // Upsert profile
        await adminClient.from('profiles').upsert({
          id: authData.user.id,
          full_name: customerName,
          role: 'athlete',
          sports: ['softball'],
          athlete_type: 'softball',
        })
        athleteMap[customerName] = authData.user.id
      }
    }

    // 4. Create availability slots and bookings
    const results: Array<{ entry: ScheduleEntry; status: string; error?: string }> = []

    for (const entry of schedule) {
      try {
        const athleteId = athleteMap[entry.customer]
        if (!athleteId) {
          results.push({ entry, status: 'skipped', error: `Athlete not found: ${entry.customer}` })
          continue
        }

        const startTime = parseTime(entry.time)
        const endTime = addMinutes(startTime, duration)

        // Create or find availability slot
        const { data: existingSlot } = await adminClient
          .from('available_slots')
          .select('id')
          .eq('coach_id', coachId)
          .eq('slot_date', entry.date)
          .eq('start_time', startTime)
          .single()

        let slotId: string

        if (existingSlot) {
          slotId = existingSlot.id
        } else {
          const { data: newSlot, error: slotError } = await adminClient
            .from('available_slots')
            .insert({
              coach_id: coachId,
              slot_date: entry.date,
              start_time: startTime,
              end_time: endTime,
              service_id: serviceId,
              max_bookings: 1,
              current_bookings: 0,
              is_available: true,
            })
            .select('id')
            .single()

          if (slotError || !newSlot) {
            results.push({ entry, status: 'error', error: `Slot creation failed: ${slotError?.message}` })
            continue
          }
          slotId = newSlot.id
        }

        // Create booking
        const { error: bookingError } = await adminClient
          .from('bookings')
          .insert({
            athlete_id: athleteId,
            coach_id: coachId,
            service_id: serviceId,
            slot_id: slotId,
            booking_date: entry.date,
            start_time: startTime,
            end_time: endTime,
            duration_minutes: duration,
            status: 'confirmed',
            amount_cents: servicePriceCents,
            payment_status: 'pending',
            notes: 'Imported from previous schedule',
          })

        if (bookingError) {
          results.push({ entry, status: 'error', error: `Booking failed: ${bookingError.message}` })
        } else {
          results.push({ entry, status: 'created' })
        }
      } catch (err: any) {
        results.push({ entry, status: 'error', error: err.message })
      }
    }

    const created = results.filter((r) => r.status === 'created').length
    const errors = results.filter((r) => r.status === 'error').length
    const skipped = results.filter((r) => r.status === 'skipped').length

    return NextResponse.json({
      success: true,
      summary: {
        total: schedule.length,
        athletes_created: Object.keys(athleteMap).length,
        bookings_created: created,
        errors,
        skipped,
      },
      athletes: Object.entries(athleteMap).map(([name, id]) => ({
        name,
        id,
        email: `${name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}@psp.athlete`,
      })),
      results,
    })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
