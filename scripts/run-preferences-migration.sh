#!/bin/bash
# Script to run user preferences migration
# Usage: ./run-preferences-migration.sh

echo "🔄 Running user preferences migration..."

# Read the migration file
MIGRATION_FILE="supabase/migrations/20251111_add_user_preferences.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📝 Migration SQL:"
echo "----------------------------------------"
cat "$MIGRATION_FILE"
echo "----------------------------------------"
echo ""

echo "📋 To run this migration on Supabase:"
echo ""
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the SQL above"
echo "4. Click 'Run' to execute"
echo ""
echo "Or use Supabase CLI:"
echo "  supabase db push"
echo ""
echo "✅ Migration file ready at: $MIGRATION_FILE"
