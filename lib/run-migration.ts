import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function runMigration() {
  try {
    const migrationPath = path.join(process.cwd(), 'migrations', '003_create_google_reviews_table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('Migration error:', error)
    } else {
      console.log('Migration completed successfully!')
    }
  } catch (error) {
    console.error('Error running migration:', error)
  }
}

runMigration()