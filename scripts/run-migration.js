import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(migrationFile) {
  console.log(`\n📝 Running migration: ${migrationFile}`)

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', migrationFile)
  const sql = readFileSync(migrationPath, 'utf-8')

  const { error } = await supabase.rpc('exec_sql', { sql })

  if (error) {
    console.error(`❌ Migration failed:`, error.message)
    return false
  }

  console.log(`✅ Migration completed successfully`)
  return true
}

// Get migration file from command line argument
const migrationFile = process.argv[2]

if (!migrationFile) {
  console.log('Usage: node scripts/run-migration.js <migration-file>')
  console.log('Example: node scripts/run-migration.js 20260125000002_fix_trigger.sql')
  process.exit(1)
}

runMigration(migrationFile)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
