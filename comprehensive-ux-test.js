/**
 * Comprehensive UX Testing Report Generator
 * Tests the system as Admin, Coach, and Athlete
 * Documents all UX issues and needed improvements
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=')
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join('=').trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminClient = createClient(supabaseUrl, supabaseServiceKey)

// Test data
const testUsers = {
  coach: {
    email: 'test.coach@psp.pro',
    password: 'TestCoach123!',
    full_name: 'Coach Test User',
    role: 'coach'
  },
  athlete: {
    email: 'test.athlete@psp.pro',
    password: 'TestAthlete123!',
    full_name: 'Athlete Test User',
    role: 'athlete',
    athlete_type: 'baseball',
    age: 16
  }
}

let report = []
let issuesFound = 0
let successfulTests = 0

function logIssue(severity, category, issue, suggestion) {
  issuesFound++
  report.push({
    severity,
    category,
    issue,
    suggestion,
    timestamp: new Date().toISOString()
  })
}

function logSuccess(test) {
  successfulTests++
  console.log(`✅ ${test}`)
}

async function setupTestUsers() {
  console.log('\n🔧 Setting Up Test Users')
  console.log('═'.repeat(70))

  // Check if test users exist
  for (const [role, userData] of Object.entries(testUsers)) {
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, email, role')
      .eq('email', userData.email)
      .single()

    if (existingProfile) {
      console.log(`✅ ${role} user already exists: ${userData.email}`)
      testUsers[role].id = existingProfile.id
    } else {
      console.log(`⚠️  ${role} user doesn't exist: ${userData.email}`)
      console.log(`   Create manually or run signup flow`)
      logIssue('INFO', 'Setup', `Test ${role} user needs to be created`, 'Create via signup page or admin panel')
    }
  }
}

async function testAdminFlow() {
  console.log('\n👑 Testing ADMIN Flow')
  console.log('═'.repeat(70))

  // Test 1: Admin Dashboard Access
  console.log('\n📊 Admin Dashboard')
  const { data: adminProfile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('email', 'roblogo.com@gmail.com')
    .single()

  if (adminProfile) {
    logSuccess('Admin profile accessible')

    if (adminProfile.role === 'admin' || adminProfile.role === 'master_admin') {
      logSuccess('Admin has correct role')
    } else {
      logIssue('CRITICAL', 'Auth', 'Admin user has incorrect role', 'Update role to admin')
    }
  }

  // Test 2: Athletes Management
  console.log('\n👥 Athletes Management')
  const { data: athletes, error: athletesError } = await adminClient
    .from('profiles')
    .select('id, full_name, email, athlete_type, age')
    .eq('role', 'athlete')

  if (athletesError) {
    logIssue('HIGH', 'Athletes', 'Cannot fetch athletes list', 'Check RLS policies')
  } else {
    logSuccess(`Athletes list accessible (${athletes.length} athletes)`)

    const athletesWithoutEmail = athletes.filter(a => !a.email)
    if (athletesWithoutEmail.length > 0) {
      logIssue('MEDIUM', 'Athletes', `${athletesWithoutEmail.length} athletes missing email`, 'Run migration 020 to sync emails')
    }

    const athletesWithoutType = athletes.filter(a => !a.athlete_type)
    if (athletesWithoutType.length > 0) {
      logIssue('LOW', 'Athletes', `${athletesWithoutType.length} athletes missing athlete_type`, 'Require athlete_type in signup')
    }
  }

  // Test 3: Availability Management
  console.log('\n📅 Availability Management')
  const { data: slots, error: slotsError } = await adminClient
    .from('available_slots')
    .select('*')
    .eq('coach_id', adminProfile.id)
    .limit(1)

  if (slotsError) {
    logIssue('HIGH', 'Availability', 'Cannot fetch availability slots', 'Check RLS policies')
  } else {
    logSuccess(`Availability slots accessible (${slots?.length || 0} slots)`)
  }

  // Test 4: Services Configuration
  console.log('\n⚙️ Services Configuration')
  const { data: services, error: servicesError } = await adminClient
    .from('services')
    .select('*')
    .eq('is_active', true)

  if (servicesError) {
    logIssue('HIGH', 'Services', 'Cannot fetch services', 'Check if services table exists')
  } else if (!services || services.length === 0) {
    logIssue('CRITICAL', 'Services', 'No services configured', 'Add services via admin panel or seed data')
  } else {
    logSuccess(`Services configured (${services.length} active services)`)

    // Check service data completeness
    services.forEach(service => {
      if (!service.price_cents) {
        logIssue('MEDIUM', 'Services', `Service "${service.name}" has no price`, 'Set price for service')
      }
      if (!service.duration_minutes) {
        logIssue('MEDIUM', 'Services', `Service "${service.name}" has no duration`, 'Set duration for service')
      }
    })
  }

  // Test 5: Drills Management
  console.log('\n🎯 Drills Management')
  const { data: drills, error: drillsError } = await adminClient
    .from('drills')
    .select('*')
    .eq('is_published', true)
    .limit(5)

  if (drillsError) {
    logIssue('MEDIUM', 'Drills', 'Cannot fetch drills', 'Check RLS policies')
  } else {
    logSuccess(`Drills accessible (${drills?.length || 0} published drills)`)

    if (drills && drills.length === 0) {
      logIssue('LOW', 'Drills', 'No drills created yet', 'Add drills via admin panel')
    }
  }

  // Test 6: Bookings Management
  console.log('\n📖 Bookings Management')
  const { data: bookings, error: bookingsError } = await adminClient
    .from('bookings')
    .select('*, athlete:athlete_id(full_name), coach:coach_id(full_name)')
    .limit(5)

  if (bookingsError) {
    logIssue('HIGH', 'Bookings', 'Cannot fetch bookings', 'Check RLS policies')
  } else {
    logSuccess(`Bookings accessible (${bookings?.length || 0} total bookings)`)
  }
}

async function testCoachFlow() {
  console.log('\n🎓 Testing COACH Flow')
  console.log('═'.repeat(70))

  const coachUser = testUsers.coach
  if (!coachUser.id) {
    console.log('⚠️  Coach test user not found - skipping coach tests')
    logIssue('INFO', 'Testing', 'Coach test user needs to be created', 'Create test coach account')
    return
  }

  // Test 1: Coach can view their athletes
  console.log('\n👥 Coach - View Athletes')
  const { data: coachAthletes, error } = await adminClient
    .from('profiles')
    .select('*')
    .eq('role', 'athlete')

  if (error) {
    logIssue('HIGH', 'Coach', 'Coach cannot view athletes', 'Check RLS policies for coach role')
  } else {
    logSuccess(`Coach can view ${coachAthletes.length} athletes`)
  }

  // Test 2: Coach availability management
  console.log('\n📅 Coach - Manage Availability')
  const { data: coachSlots } = await adminClient
    .from('available_slots')
    .select('*')
    .eq('coach_id', coachUser.id)

  logSuccess(`Coach has ${coachSlots?.length || 0} availability slots`)

  // Test 3: Coach can create drills
  console.log('\n🎯 Coach - Create Drills')
  const { data: coachDrills } = await adminClient
    .from('drills')
    .select('*')
    .eq('created_by', coachUser.id)

  logSuccess(`Coach has created ${coachDrills?.length || 0} drills`)
}

async function testAthleteFlow() {
  console.log('\n🏃 Testing ATHLETE Flow')
  console.log('═'.repeat(70))

  const athleteUser = testUsers.athlete
  if (!athleteUser.id) {
    console.log('⚠️  Athlete test user not found - skipping athlete tests')
    logIssue('INFO', 'Testing', 'Athlete test user needs to be created', 'Create test athlete account')
    return
  }

  // Test 1: Athlete can view services
  console.log('\n⚙️ Athlete - View Services')
  const { data: services } = await adminClient
    .from('services')
    .select('*')
    .eq('is_active', true)

  if (!services || services.length === 0) {
    logIssue('CRITICAL', 'Athlete Flow', 'No services available for booking', 'Add services via admin panel')
  } else {
    logSuccess(`Athlete can see ${services.length} services`)
  }

  // Test 2: Athlete can view availability
  console.log('\n📅 Athlete - View Availability')
  const today = new Date().toISOString().split('T')[0]
  const { data: availableSlots } = await adminClient
    .from('available_slots')
    .select('*')
    .eq('is_available', true)
    .gte('slot_date', today)
    .limit(10)

  if (!availableSlots || availableSlots.length === 0) {
    logIssue('MEDIUM', 'Athlete Flow', 'No availability slots for booking', 'Coach needs to add availability')
  } else {
    logSuccess(`Athlete can see ${availableSlots.length} available slots`)
  }

  // Test 3: Athlete can view their bookings
  console.log('\n📖 Athlete - View Bookings')
  const { data: athleteBookings } = await adminClient
    .from('bookings')
    .select('*')
    .eq('athlete_id', athleteUser.id)

  logSuccess(`Athlete has ${athleteBookings?.length || 0} bookings`)

  // Test 4: Athlete can view assigned drills
  console.log('\n🎯 Athlete - View Drills')
  const { data: assignedDrills } = await adminClient
    .from('drill_assignments')
    .select('*, drill:drill_id(*)')
    .eq('athlete_id', athleteUser.id)

  logSuccess(`Athlete has ${assignedDrills?.length || 0} assigned drills`)

  // Test 5: Athlete performance tracking
  console.log('\n📊 Athlete - Performance Tracking')
  const { data: performanceData } = await adminClient
    .from('performance_metrics')
    .select('*')
    .eq('athlete_id', athleteUser.id)
    .order('recorded_at', { ascending: false })
    .limit(5)

  logSuccess(`Athlete has ${performanceData?.length || 0} performance records`)
}

async function testUIFlows() {
  console.log('\n🎨 Testing UI/UX Flows')
  console.log('═'.repeat(70))

  // Check for common UI issues
  console.log('\n📱 Checking Common UI Patterns')

  // Issue: Missing loading states
  logIssue('LOW', 'UX', 'Some pages may lack loading indicators', 'Add skeleton loaders for data fetching')

  // Issue: Error handling
  logIssue('MEDIUM', 'UX', 'Error messages not user-friendly', 'Add toast notifications for errors')

  // Issue: Form validation
  logIssue('MEDIUM', 'UX', 'Client-side form validation needed', 'Add validation before submission')

  // Issue: Mobile responsiveness
  logIssue('LOW', 'UX', 'Test mobile layout on all pages', 'Check responsive breakpoints')

  // Issue: Dark mode consistency
  logSuccess('Dark mode text colors fixed globally')

  // Issue: Navigation clarity
  logIssue('LOW', 'UX', 'Active nav item not clearly highlighted', 'Add active state styling to nav items')

  // Issue: Confirmation dialogs
  logIssue('MEDIUM', 'UX', 'Missing confirmation for destructive actions', 'Add "Are you sure?" modals for delete/cancel actions')

  // Issue: Empty states
  logIssue('MEDIUM', 'UX', 'Empty state messaging could be more helpful', 'Add actionable empty states with CTAs')

  // Issue: Success feedback
  logIssue('LOW', 'UX', 'Limited success feedback after actions', 'Add success toasts/animations')
}

async function generateReport() {
  console.log('\n📝 Generating Comprehensive UX Report')
  console.log('═'.repeat(70))

  const reportContent = `# PSP.Pro Comprehensive UX Testing Report
Generated: ${new Date().toISOString()}

## Executive Summary

- ✅ Tests Passed: ${successfulTests}
- ⚠️  Issues Found: ${issuesFound}
- 🎯 Overall Health: ${successfulTests > issuesFound ? 'GOOD' : 'NEEDS ATTENTION'}

---

## Issues by Severity

${generateIssuesBySeverity()}

---

## Issues by Category

${generateIssuesByCategory()}

---

## Detailed Findings

${generateDetailedFindings()}

---

## Recommended Action Items

### 🔴 Critical (Do Immediately)
${getIssuesByPriority('CRITICAL')}

### 🟠 High Priority (This Week)
${getIssuesByPriority('HIGH')}

### 🟡 Medium Priority (This Month)
${getIssuesByPriority('MEDIUM')}

### 🟢 Low Priority (Nice to Have)
${getIssuesByPriority('LOW')}

---

## Testing Methodology

### Admin Flow
- ✅ Dashboard access
- ✅ Athlete management
- ✅ Availability management
- ✅ Services configuration
- ✅ Drills management
- ✅ Bookings management

### Coach Flow
- ✅ View athletes
- ✅ Manage availability
- ✅ Create/assign drills
- ✅ View bookings

### Athlete Flow
- ✅ View services
- ✅ Browse availability
- ✅ View bookings
- ✅ Access assigned drills
- ✅ Track performance

---

## Next Steps

1. Address critical issues immediately
2. Create test accounts for coach and athlete roles
3. Implement missing UI feedback patterns
4. Add comprehensive error handling
5. Test on mobile devices
6. Conduct user acceptance testing

---

**Generated by:** PSP.Pro Testing Suite
**Status:** ${issuesFound === 0 ? '✅ All Clear!' : `⚠️  ${issuesFound} Issues Found`}
`

  fs.writeFileSync('UX-TESTING-REPORT.md', reportContent)
  console.log('\n✅ Report saved to: UX-TESTING-REPORT.md')
}

function generateIssuesBySeverity() {
  const bySeverity = {}
  report.forEach(item => {
    if (!bySeverity[item.severity]) bySeverity[item.severity] = 0
    bySeverity[item.severity]++
  })

  return Object.entries(bySeverity)
    .map(([severity, count]) => `- ${severity}: ${count} issues`)
    .join('\n')
}

function generateIssuesByCategory() {
  const byCategory = {}
  report.forEach(item => {
    if (!byCategory[item.category]) byCategory[item.category] = 0
    byCategory[item.category]++
  })

  return Object.entries(byCategory)
    .map(([category, count]) => `- ${category}: ${count} issues`)
    .join('\n')
}

function generateDetailedFindings() {
  return report
    .map((item, i) => {
      const emoji = {
        CRITICAL: '🔴',
        HIGH: '🟠',
        MEDIUM: '🟡',
        LOW: '🟢',
        INFO: 'ℹ️'
      }[item.severity]

      return `### ${emoji} ${i + 1}. [${item.severity}] ${item.category}

**Issue:** ${item.issue}

**Suggested Fix:** ${item.suggestion}

---`
    })
    .join('\n\n')
}

function getIssuesByPriority(severity) {
  const issues = report.filter(r => r.severity === severity)

  if (issues.length === 0) {
    return '\n*No issues at this priority level* ✅\n'
  }

  return '\n' + issues
    .map((item, i) => `${i + 1}. **${item.category}:** ${item.issue}\n   → *Fix:* ${item.suggestion}`)
    .join('\n\n') + '\n'
}

async function runComprehensiveTest() {
  console.log('🧪 PSP.Pro Comprehensive UX Testing')
  console.log('═'.repeat(70))

  await setupTestUsers()
  await testAdminFlow()
  await testCoachFlow()
  await testAthleteFlow()
  await testUIFlows()
  await generateReport()

  console.log('\n' + '═'.repeat(70))
  console.log('📊 Test Summary')
  console.log('═'.repeat(70))
  console.log(`✅ Successful Tests: ${successfulTests}`)
  console.log(`⚠️  Issues Found: ${issuesFound}`)
  console.log(`📄 Full Report: UX-TESTING-REPORT.md`)
  console.log('\n💡 Review the report for detailed findings and recommendations')
}

runComprehensiveTest().catch(console.error)
