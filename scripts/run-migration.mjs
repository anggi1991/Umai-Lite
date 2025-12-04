// Run migration using ESM
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_PATH = join(__dirname, '../supabase/migrations');
const ENV_PATH = join(__dirname, '../.env');

// Load environment variables from .env file
dotenv.config({ path: ENV_PATH });

// Get Supabase credentials from .env
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing required environment variables in .env file');
  console.error('Required variables:');
  console.error('- EXPO_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('Found Supabase configuration from .env');
console.log(`URL: ${SUPABASE_URL}`);
console.log('Service Role Key: [HIDDEN]');

async function runMigration() {
  // Use direct Database URL format that Supabase provides
  const connectionString = `postgresql://postgres.gbcxzkgzhylpbmzbymwj:${SUPABASE_SERVICE_ROLE_KEY}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;
  
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sql = readFileSync(join(MIGRATIONS_PATH, '001_init.sql'), 'utf8');
    console.log('Running migration: 001_init.sql');

    await client.query(sql);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();