#!/bin/bash

# Quick SQL Copy Helper
# Copies the migration SQL to clipboard for easy pasting in Supabase Dashboard

set -e

MIGRATION_FILE="supabase/migrations/010_monetization_infrastructure.sql"

echo "📋 Migration SQL Copy Helper"
echo "=============================="
echo ""

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found"
    exit 1
fi

echo "✅ Migration file found: $MIGRATION_FILE"
echo ""
echo "📊 File stats:"
wc -l "$MIGRATION_FILE"
echo ""

echo "🔧 To apply this migration to Supabase:"
echo ""
echo "Option 1 - Copy to Clipboard (Linux):"
echo "  cat $MIGRATION_FILE | xclip -selection clipboard"
echo ""
echo "Option 2 - View and manually copy:"
echo "  cat $MIGRATION_FILE"
echo ""
echo "Option 3 - Supabase Dashboard:"
echo "  1. Go to: https://supabase.com/dashboard"
echo "  2. Select your project"
echo "  3. Navigate to: SQL Editor"
echo "  4. Click: + New Query"
echo "  5. Paste SQL from this file"
echo "  6. Click: Run"
echo ""

read -p "Do you want to display the SQL now? (y/n): " choice

if [ "$choice" = "y" ] || [ "$choice" = "Y" ]; then
    echo ""
    echo "========================================="
    echo "📄 MIGRATION SQL (Copy from here)"
    echo "========================================="
    echo ""
    cat "$MIGRATION_FILE"
    echo ""
    echo "========================================="
    echo "📄 END OF SQL"
    echo "========================================="
    echo ""
    echo "✅ Copy the SQL above and run in Supabase Dashboard"
else
    echo ""
    echo "Run this command to view the SQL:"
    echo "  cat $MIGRATION_FILE"
fi

echo ""
echo "📝 After running migration, verify with:"
echo "  SELECT * FROM badges;"
echo "  SELECT routine_name FROM information_schema.routines WHERE routine_name = 'check_and_increment_usage';"
echo ""
