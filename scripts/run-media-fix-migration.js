// Run migration 014 to fix child-media storage RLS policies
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '014_fix_child_media_storage.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Running migration: 014_fix_child_media_storage.sql');
    console.log('🔗 Supabase URL:', SUPABASE_URL);
    console.log('');
    
    // Execute the SQL using Supabase REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      // Try alternative method - direct SQL execution
      console.log('⚠️  RPC method failed, trying direct execution...');
      
      const pgResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sql',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: sql
      });
      
      if (!pgResponse.ok) {
        const errorText = await pgResponse.text();
        throw new Error(`Migration failed: ${pgResponse.status} ${errorText}`);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📝 What was fixed:');
    console.log('  ✓ child-media storage bucket configured (public, 10MB limit)');
    console.log('  ✓ Storage RLS policies created for authenticated users');
    console.log('  ✓ Media table RLS policies updated');
    console.log('');
    console.log('🎉 You can now upload photos to the media gallery!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('');
    console.log('📌 Manual fix option:');
    console.log('1. Go to https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/sql/new');
    console.log('2. Copy and paste the contents of: supabase/migrations/014_fix_child_media_storage.sql');
    console.log('3. Click "Run" to execute the migration');
    process.exit(1);
  }
}

runMigration();
