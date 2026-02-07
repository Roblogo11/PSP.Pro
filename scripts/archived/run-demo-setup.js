// Quick script to populate demo data for admin account
// Usage: node run-demo-setup.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function runDemoSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🚀 Starting demo data setup...\n')

  // 1. Add drills
  console.log('📝 Adding 2 sample drills...')

  const drills = [
    {
      title: 'Arm Care Routine - J-Bands Warm-Up',
      youtube_url: 'https://www.youtube.com/watch?v=EuKpFhMiw5s',
      thumbnail_url: 'https://i.ytimg.com/vi/EuKpFhMiw5s/maxresdefault.jpg',
      category: 'Mechanics',
      difficulty: 'Beginner',
      description: 'Essential arm care routine using J-Bands to warm up the shoulder and prepare for throwing. Perfect for pre-practice or pre-game preparation.',
      instructions: '1. Start with light resistance bands\n2. Perform 10-15 reps of each exercise\n3. Move through full range of motion\n4. Focus on controlled movements\n5. Progress to heavier bands as you improve',
      duration: '10-15 minutes',
      tags: ['arm-care', 'warm-up', 'j-bands', 'shoulder-health', 'injury-prevention'],
      equipment: ['J-Bands', 'Resistance Bands'],
      focus_areas: ['Shoulder Health', 'Arm Strength', 'Injury Prevention'],
      is_published: true,
      is_featured: true,
      created_by: 'fc81d2bc-d35c-4b0e-a080-c584b8970356'
    },
    {
      title: 'Exit Velocity Progression - Tee Work',
      youtube_url: 'https://www.youtube.com/watch?v=gVDX8u2b0uU',
      thumbnail_url: 'https://i.ytimg.com/vi/gVDX8u2b0uU/maxresdefault.jpg',
      category: 'Hitting',
      difficulty: 'Intermediate',
      description: 'Systematic approach to increasing exit velocity through proper tee work mechanics. Focus on hip rotation, weight transfer, and bat path.',
      instructions: '1. Set up tee at proper height (mid-thigh)\n2. Start with 50% power swings for timing\n3. Progress to 75% power focusing on contact point\n4. Finish with full power swings tracking exit velo\n5. Complete 3 rounds of 10 swings each',
      duration: '20-30 minutes',
      tags: ['hitting', 'exit-velocity', 'tee-work', 'bat-speed', 'power-hitting'],
      equipment: ['Tee', 'Baseball/Softball', 'Bat', 'Radar Gun (optional)'],
      focus_areas: ['Exit Velocity', 'Hip Rotation', 'Bat Path', 'Power Generation'],
      is_published: true,
      is_featured: false,
      created_by: 'fc81d2bc-d35c-4b0e-a080-c584b8970356'
    }
  ]

  const { data: drillData, error: drillError } = await supabase
    .from('drills')
    .insert(drills)
    .select()

  if (drillError) {
    console.error('❌ Error adding drills:', drillError.message)
  } else {
    console.log(`✅ Added ${drillData.length} drills successfully!\n`)
  }

  // 2. Add availability slots
  console.log('📅 Setting up availability (next week + 3 weekends)...')

  const coachId = 'fc81d2bc-d35c-4b0e-a080-c584b8970356'
  const slots = []
  const today = new Date()

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0]

  // Helper to get day of week (0=Sunday, 6=Saturday)
  const getDayOfWeek = (date) => date.getDay()

  // Add slots for next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dayOfWeek = getDayOfWeek(date)
    const dateStr = formatDate(date)

    // Monday-Friday (1-5): 3PM-9PM in 2-hour blocks
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      slots.push(
        { coach_id: coachId, slot_date: dateStr, start_time: '15:00', end_time: '17:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 2, current_bookings: 0, is_available: true },
        { coach_id: coachId, slot_date: dateStr, start_time: '17:00', end_time: '19:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 2, current_bookings: 0, is_available: true },
        { coach_id: coachId, slot_date: dateStr, start_time: '19:00', end_time: '21:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 2, current_bookings: 0, is_available: true }
      )
    }
    // Saturday (6): 9AM-5PM in 2-hour blocks
    else if (dayOfWeek === 6) {
      slots.push(
        { coach_id: coachId, slot_date: dateStr, start_time: '09:00', end_time: '11:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 3, current_bookings: 0, is_available: true },
        { coach_id: coachId, slot_date: dateStr, start_time: '11:00', end_time: '13:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 3, current_bookings: 0, is_available: true },
        { coach_id: coachId, slot_date: dateStr, start_time: '13:00', end_time: '15:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 3, current_bookings: 0, is_available: true },
        { coach_id: coachId, slot_date: dateStr, start_time: '15:00', end_time: '17:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 2, current_bookings: 0, is_available: true }
      )
    }
    // Sunday (0): 9AM-3PM in 2-hour blocks
    else if (dayOfWeek === 0) {
      slots.push(
        { coach_id: coachId, slot_date: dateStr, start_time: '09:00', end_time: '11:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 3, current_bookings: 0, is_available: true },
        { coach_id: coachId, slot_date: dateStr, start_time: '11:00', end_time: '13:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 3, current_bookings: 0, is_available: true },
        { coach_id: coachId, slot_date: dateStr, start_time: '13:00', end_time: '15:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 2, current_bookings: 0, is_available: true }
      )
    }
  }

  // Add next 3 weekends (starting from day 7)
  for (let weekend = 0; weekend < 3; weekend++) {
    // Calculate Saturday
    const saturday = new Date(today)
    saturday.setDate(today.getDate() + 7 + (weekend * 7) + (6 - getDayOfWeek(today)))
    if (getDayOfWeek(saturday) !== 6) {
      // Adjust if calculation is off
      const daysUntilSaturday = (6 - getDayOfWeek(saturday) + 7) % 7
      saturday.setDate(saturday.getDate() + daysUntilSaturday)
    }
    const saturdayStr = formatDate(saturday)

    // Calculate Sunday (day after Saturday)
    const sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)
    const sundayStr = formatDate(sunday)

    // Saturday slots
    slots.push(
      { coach_id: coachId, slot_date: saturdayStr, start_time: '09:00', end_time: '11:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 3, current_bookings: 0, is_available: true },
      { coach_id: coachId, slot_date: saturdayStr, start_time: '11:00', end_time: '13:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 3, current_bookings: 0, is_available: true },
      { coach_id: coachId, slot_date: saturdayStr, start_time: '13:00', end_time: '15:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 3, current_bookings: 0, is_available: true },
      { coach_id: coachId, slot_date: saturdayStr, start_time: '15:00', end_time: '17:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 2, current_bookings: 0, is_available: true }
    )

    // Sunday slots
    slots.push(
      { coach_id: coachId, slot_date: sundayStr, start_time: '09:00', end_time: '11:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 3, current_bookings: 0, is_available: true },
      { coach_id: coachId, slot_date: sundayStr, start_time: '11:00', end_time: '13:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 3, current_bookings: 0, is_available: true },
      { coach_id: coachId, slot_date: sundayStr, start_time: '13:00', end_time: '15:00', location: 'PSP Training Facility - Virginia Beach', max_bookings: 2, current_bookings: 0, is_available: true }
    )
  }

  const { data: slotData, error: slotError } = await supabase
    .from('available_slots')
    .insert(slots)
    .select()

  if (slotError) {
    console.error('❌ Error adding availability slots:', slotError.message)
  } else {
    console.log(`✅ Added ${slotData.length} availability slots successfully!\n`)
  }

  console.log('🎉 Demo data setup complete!')
  console.log('\n📊 Summary:')
  console.log('  • 2 training drills (Arm Care + Exit Velocity)')
  console.log('  • ~30-40 availability slots (1 week + 3 weekends)')
  console.log('  • All data attached to roblogo.com@gmail.com')
  console.log('\n✨ Ready to demo to coaches!\n')
}

runDemoSetup().catch(console.error)
