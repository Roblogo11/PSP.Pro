/**
 * Fix roblogo.com@gmail.com admin access
 * Updates user role from 'athlete' to 'admin' so they get redirected properly
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local manually
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixRoblogoAdmin() {
  console.log('🔧 Fixing roblogo.com@gmail.com admin access...\n')

  const userId = 'fc81d2bc-d35c-4b0e-a080-c584b8970356'

  // Step 1: Check current role
  console.log('1️⃣  Checking current role...')
  const { data: before, error: fetchError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .single()

  if (fetchError) {
    console.error('❌ Error fetching profile:', fetchError.message)
    process.exit(1)
  }

  console.log('   Current role:', before.role)
  console.log('   Current name:', before.full_name || '(none)')

  // Step 2: Update to admin
  console.log('\n2️⃣  Updating to admin role...')
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      role: 'admin',
      full_name: 'Rob Logo (Admin)',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (updateError) {
    console.error('❌ Error updating profile:', updateError.message)
    process.exit(1)
  }

  // Step 3: Verify the update
  console.log('3️⃣  Verifying update...')
  const { data: after, error: verifyError } = await supabase
    .from('profiles')
    .select('id, full_name, role, updated_at')
    .eq('id', userId)
    .single()

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError.message)
    process.exit(1)
  }

  console.log('\n✅ SUCCESS! Profile updated:')
  console.log('   Role:', after.role)
  console.log('   Name:', after.full_name)
  console.log('   Updated:', new Date(after.updated_at).toLocaleString())

  console.log('\n🎯 Next steps:')
  console.log('   1. Log out if currently logged in')
  console.log('   2. Log back in with roblogo.com@gmail.com')
  console.log('   3. You should be redirected to /admin automatically')
}

fixRoblogoAdmin().catch(console.error)
