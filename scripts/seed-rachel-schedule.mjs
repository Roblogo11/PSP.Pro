import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tcqgyswlzzmkaqknosym.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Coach Rachel's info
const COACH_EMAIL = 'rbagley422@gmail.com'
const COACH_PASSWORD = 'rachelZxcv619#'
const COACH_NAME = 'Rachel Bagley'

// Her schedule from old site
const SCHEDULE = [
  { date: '2026-02-11', time: '17:00:00', customer: 'Maggie Shelton' },
  { date: '2026-02-12', time: '16:00:00', customer: 'Laci Volet' },
  { date: '2026-02-14', time: '12:00:00', customer: 'Lily Brunson' },
  { date: '2026-02-16', time: '15:00:00', customer: 'Caroline Lawson' },
  { date: '2026-02-16', time: '17:00:00', customer: 'Riley Pruitt' },
  { date: '2026-02-18', time: '15:00:00', customer: 'Riley Pruitt' },
  { date: '2026-02-18', time: '16:00:00', customer: 'Maggie Shelton' },
  { date: '2026-02-18', time: '17:00:00', customer: 'Maggie Shelton' },
  { date: '2026-02-19', time: '16:00:00', customer: 'Laci Volet' },
  { date: '2026-02-21', time: '12:00:00', customer: 'Lily Brunson' },
  { date: '2026-02-23', time: '17:00:00', customer: 'Riley Pruitt' },
  { date: '2026-02-24', time: '17:00:00', customer: 'Jocelyn Murphy' },
  { date: '2026-02-25', time: '16:00:00', customer: 'Maggie Shelton' },
  { date: '2026-02-25', time: '17:00:00', customer: 'Maggie Shelton' },
  { date: '2026-02-26', time: '16:00:00', customer: 'Laci Volet' },
  { date: '2026-02-28', time: '12:00:00', customer: 'Lily Brunson' },
  { date: '2026-03-05', time: '16:00:00', customer: 'Laci Volet' },
  { date: '2026-03-07', time: '13:00:00', customer: 'Riley Pruitt' },
  { date: '2026-03-09', time: '17:00:00', customer: 'Riley Pruitt' },
  { date: '2026-03-12', time: '16:00:00', customer: 'Laci Volet' },
  { date: '2026-03-16', time: '17:00:00', customer: 'Riley Pruitt' },
  { date: '2026-03-19', time: '16:00:00', customer: 'Laci Volet' },
  { date: '2026-03-26', time: '16:00:00', customer: 'Laci Volet' },
  { date: '2026-03-30', time: '15:00:00', customer: 'Riley Pruitt' },
  { date: '2026-04-02', time: '16:00:00', customer: 'Laci Volet' },
  { date: '2026-04-09', time: '16:00:00', customer: 'Laci Volet' },
]

function addMinutes(time, mins) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`
}

async function main() {
  console.log('=== PSP.Pro Schedule Import ===\n')

  // 1. Create or find Coach Rachel
  console.log('1. Setting up Coach Rachel...')
  let coachId

  // Check if she already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingCoach = existingUsers?.users?.find(u => u.email === COACH_EMAIL)

  if (existingCoach) {
    coachId = existingCoach.id
    console.log(`   Found existing account: ${coachId}`)

    // Make sure profile is set to coach role
    await supabase.from('profiles').upsert({
      id: coachId,
      full_name: COACH_NAME,
      role: 'coach',
    })
    console.log('   Profile updated to coach role')
  } else {
    const { data: newCoach, error: coachErr } = await supabase.auth.admin.createUser({
      email: COACH_EMAIL,
      password: COACH_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: COACH_NAME },
    })

    if (coachErr) {
      console.error('   Failed to create coach:', coachErr.message)
      process.exit(1)
    }

    coachId = newCoach.user.id
    console.log(`   Created coach account: ${coachId}`)

    await supabase.from('profiles').upsert({
      id: coachId,
      full_name: COACH_NAME,
      role: 'coach',
      sports: ['softball'],
      athlete_type: 'softball',
    })
    console.log('   Coach profile created')
  }

  // 2. Find default service
  console.log('\n2. Finding default service...')
  let serviceId = null
  let servicePriceCents = 7500

  const { data: services } = await supabase
    .from('services')
    .select('id, name, price_cents')
    .eq('category', 'individual')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)

  if (services && services.length > 0) {
    serviceId = services[0].id
    servicePriceCents = services[0].price_cents
    console.log(`   Using service: ${services[0].name} ($${services[0].price_cents / 100})`)
  } else {
    console.log('   No active individual service found, bookings will have null service_id')
  }

  // 3. Create athlete profiles
  console.log('\n3. Creating athlete profiles...')
  const uniqueNames = [...new Set(SCHEDULE.map(s => s.customer))]
  const athleteMap = {}

  for (const name of uniqueNames) {
    // Check if already exists by name
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .ilike('full_name', name)
      .eq('role', 'athlete')
      .limit(1)

    if (existing && existing.length > 0) {
      athleteMap[name] = existing[0].id
      console.log(`   ${name}: found existing (${existing[0].id.slice(0, 8)}...)`)
      continue
    }

    const emailSlug = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
    const email = `${emailSlug}@psp.athlete`

    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: 'Welcome123!',
      email_confirm: true,
      user_metadata: { full_name: name },
    })

    if (authErr) {
      if (authErr.message?.includes('already been registered')) {
        // Find by email
        const { data: byEmail } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single()
        if (byEmail) {
          athleteMap[name] = byEmail.id
          console.log(`   ${name}: found by email (${byEmail.id.slice(0, 8)}...)`)
          continue
        }
      }
      console.error(`   ${name}: FAILED - ${authErr.message}`)
      continue
    }

    athleteMap[name] = authData.user.id

    await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name: name,
      role: 'athlete',
      sports: ['softball'],
      athlete_type: 'softball',
    })

    console.log(`   ${name}: created (${email})`)
  }

  // 4. Reset any stale slots from previous run attempts
  console.log('\n4. Resetting stale slots from previous runs...')
  const { data: staleSlots, error: resetErr } = await supabase
    .from('available_slots')
    .update({ is_available: true, current_bookings: 0 })
    .eq('coach_id', coachId)
    .eq('is_available', false)
    .eq('current_bookings', 1)
    .select('id')

  if (staleSlots) {
    console.log(`   Reset ${staleSlots.length} stale slots`)
  }

  // 5. Create slots and bookings
  console.log('\n5. Creating schedule...')
  let created = 0
  let errors = 0

  for (const entry of SCHEDULE) {
    const athleteId = athleteMap[entry.customer]
    if (!athleteId) {
      console.log(`   SKIP ${entry.date} ${entry.time} - ${entry.customer} (no profile)`)
      errors++
      continue
    }

    const endTime = addMinutes(entry.time, 60)

    // Create availability slot (available=true, current_bookings=0)
    // The booking trigger will handle incrementing and marking unavailable
    const { data: existingSlot } = await supabase
      .from('available_slots')
      .select('id')
      .eq('coach_id', coachId)
      .eq('slot_date', entry.date)
      .eq('start_time', entry.time)
      .maybeSingle()

    let slotId
    if (existingSlot) {
      slotId = existingSlot.id
    } else {
      const { data: newSlot, error: slotCreateErr } = await supabase
        .from('available_slots')
        .insert({
          coach_id: coachId,
          slot_date: entry.date,
          start_time: entry.time,
          end_time: endTime,
          service_id: serviceId,
          max_bookings: 1,
          current_bookings: 0,
          is_available: true,
        })
        .select('id')
        .single()

      if (slotCreateErr || !newSlot) {
        console.log(`   ERROR slot ${entry.date} ${entry.time}: ${slotCreateErr?.message}`)
        errors++
        continue
      }
      slotId = newSlot.id
    }

    // Create booking
    const { error: bookErr } = await supabase
      .from('bookings')
      .insert({
        athlete_id: athleteId,
        coach_id: coachId,
        service_id: serviceId,
        slot_id: slotId,
        booking_date: entry.date,
        start_time: entry.time,
        end_time: endTime,
        duration_minutes: 60,
        status: 'confirmed',
        amount_cents: servicePriceCents,
        payment_status: 'pending',
        notes: 'Imported from previous schedule',
      })

    if (bookErr) {
      console.log(`   ERROR booking ${entry.date} ${entry.time} ${entry.customer}: ${bookErr.message}`)
      errors++
    } else {
      console.log(`   OK  ${entry.date} ${entry.time.slice(0, 5)} - ${entry.customer}`)
      created++
    }
  }

  // Summary
  console.log('\n=== DONE ===')
  console.log(`Coach: ${COACH_NAME} (${COACH_EMAIL})`)
  console.log(`Athletes created: ${Object.keys(athleteMap).length}`)
  console.log(`Bookings created: ${created}/${SCHEDULE.length}`)
  if (errors > 0) console.log(`Errors: ${errors}`)

  console.log('\nAthlete login credentials:')
  for (const name of uniqueNames) {
    const emailSlug = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')
    console.log(`  ${name}: ${emailSlug}@psp.athlete / Welcome123!`)
  }

  console.log(`\nCoach Rachel: ${COACH_EMAIL} / rachelZxcv619#`)
}

main().catch(console.error)
