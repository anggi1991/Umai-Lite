/**
 * Apply Growth Tracking migration to Supabase
 */
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

async function applyMigration() {
  try {
    console.log('🔄 Applying Growth Tracking migration...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/017_growth_tracking.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded:', migrationPath);
    console.log('📏 SQL length:', migrationSQL.length, 'characters');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const preview = statement.substring(0, 80).replace(/\n/g, ' ') + '...';
      
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({ query: statement }),
        });
        
        if (response.ok) {
          console.log(`✅ [${i + 1}/${statements.length}] ${preview}`);
          successCount++;
        } else {
          const error = await response.text();
          console.error(`❌ [${i + 1}/${statements.length}] ${preview}`);
          console.error(`   Error: ${error}`);
          errorCount++;
        }
      } catch (err) {
        console.error(`❌ [${i + 1}/${statements.length}] ${preview}`);
        console.error(`   Error: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Migration completed!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some statements failed. The migration may be partially applied.');
      console.log('💡 You can run this script again or apply the remaining statements manually via Supabase Dashboard > SQL Editor');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
