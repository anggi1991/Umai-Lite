// Run migration command
const {spawn} = require('child_process');
const path = require('path');

// Path to migrations
const MIGRATIONS_PATH = path.join(__dirname, 'supabase/migrations');

async function runMigration() {
  try {
    // Create a new database connection
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Read migration file
    const fs = require('fs');
    const migration = fs.readFileSync(
      path.join(MIGRATIONS_PATH, '006_add_notification_id.sql'),
      'utf8'
    );
    
    // Run migration
    const { error } = await supabase.rpc('exec_sql', {
      sql_string: migration
    });
    
    if (error) throw error;
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();