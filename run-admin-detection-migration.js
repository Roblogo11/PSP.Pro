/**
 * Run Smart Admin Detection Migration
 * Prevents future admins from being set to 'athlete' role
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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Running Smart Admin Detection Migration...\n')

  // Read the migration file
  const migrationPath = path.join(__dirname, 'supabase/migrations/018_smart_admin_detection.sql')
  const sql = fs.readFileSync(migrationPath, 'utf-8')

  console.log('📄 Executing migration SQL...')

  // Execute the migration
  const { error } = await supabase.rpc('exec', { sql })

  if (error) {
    // If rpc doesn't exist, try direct query
    const { error: queryError } = await supabase.rpc('query', sql)

    if (queryError) {
      console.error('❌ Error running migration:', error.message || queryError.message)
      console.log('\n⚠️  Manual Steps Required:')
      console.log('   1. Go to your Supabase Dashboard')
      console.log('   2. Navigate to SQL Editor')
      console.log('   3. Copy and paste the contents of:')
      console.log('      supabase/migrations/018_smart_admin_detection.sql')
      console.log('   4. Run the SQL')
      process.exit(1)
    }
  }

  console.log('✅ Migration completed successfully!\n')

  // Verify the admin whitelist table was created
  console.log('🔍 Verifying admin_whitelist table...')
  const { data, error: verifyError } = await supabase
    .from('admin_whitelist')
    .select('*')

  if (verifyError) {
    console.error('❌ Could not verify table:', verifyError.message)
    console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor')
    process.exit(1)
  }

  console.log('✅ Admin whitelist table verified:')
  if (data && data.length > 0) {
    data.forEach(entry => {
      console.log(`   - ${entry.email} → ${entry.role}`)
    })
  } else {
    console.log('   (No entries yet - this is OK)')
  }

  console.log('\n🎯 What this fixes:')
  console.log('   ✓ New admin accounts will get correct role automatically')
  console.log('   ✓ No more manual SQL updates needed')
  console.log('   ✓ Add emails to admin_whitelist table to pre-authorize them')
  console.log('\n💡 To add more admins:')
  console.log("   INSERT INTO admin_whitelist (email, role, notes)")
  console.log("   VALUES ('newadmin@example.com', 'admin', 'Notes here');")
}

runMigration().catch(console.error)
