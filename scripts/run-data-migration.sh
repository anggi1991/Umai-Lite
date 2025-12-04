#!/bin/bash

# Script to run data migration for auto-assign child_id
# This script uses Supabase connection pool to execute SQL

set -e

PROJECT_REF="gbcxzkgzhylpbmzbymwj"
SQL_FILE="scripts/migrate-assign-child-id.sql"

echo "=========================================="
echo "🔄 Running Data Migration: Auto-Assign Child ID"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT: This will modify data in production database!"
echo "Project: $PROJECT_REF"
echo "SQL File: $SQL_FILE"
echo ""

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: SQL file not found: $SQL_FILE"
    exit 1
fi

echo "📋 SQL file found. Ready to execute."
echo ""
echo "📊 This migration will:"
echo "  1. Create backup table: activities_backup_20250111"
echo "  2. Update NULL child_id values to first child of user"
echo "  3. Generate verification report"
echo ""

read -p "Do you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Migration cancelled by user."
    exit 0
fi

echo ""
echo "🚀 Starting migration..."
echo ""

# Use Supabase CLI to get DB connection and execute SQL
# We'll use psql via connection string from supabase db dump command trick
DB_URL=$(supabase db dump --db-url --linked 2>/dev/null | head -n 1 || echo "")

if [ -z "$DB_URL" ]; then
    echo "❌ Error: Could not get database URL from Supabase CLI"
    echo ""
    echo "Alternative: Run this SQL manually via Supabase Dashboard:"
    echo "  1. Go to https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
    echo "  2. Copy contents of $SQL_FILE"
    echo "  3. Paste and execute in SQL Editor"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql not found. Installing postgresql-client..."
    sudo apt-get update && sudo apt-get install -y postgresql-client
fi

# Execute the migration
echo "📡 Connecting to database..."
psql "$DB_URL" -f "$SQL_FILE"

RESULT=$?

if [ $RESULT -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 Next steps:"
    echo "  1. Check the output above for statistics"
    echo "  2. Run verification: supabase db execute < scripts/verify-migration.sql"
    echo "  3. Document results in docs/testing/RESULTS_AUTO_ASSIGN.md"
    echo "  4. Begin 48-hour monitoring period"
else
    echo ""
    echo "❌ Migration failed with exit code: $RESULT"
    echo ""
    echo "🔄 Rollback instructions (if needed):"
    echo "  See ROLLBACK PROCEDURE section in $SQL_FILE"
    exit $RESULT
fi
