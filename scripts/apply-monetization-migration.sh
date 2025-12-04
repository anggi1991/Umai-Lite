#!/bin/bash

# Monetization Migration Quick Start Script
# This script helps you apply the monetization database migration to Supabase

set -e

echo "🚀 Monetization Migration Quick Start"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/010_monetization_infrastructure.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Error: Migration file not found at $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Migration file found${NC}"
echo ""

# Display migration info
echo "📋 Migration Info:"
echo "  File: $MIGRATION_FILE"
echo "  Tables: 8 (usage_limits, iap_receipts, ads_metrics, etc.)"
echo "  Functions: 4 (check_and_increment_usage, get_usage_status, etc.)"
echo "  Sample Data: 8 badges"
echo ""

# Check for Supabase CLI
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✓ Supabase CLI found${NC}"
    echo ""
    echo "🔧 You can apply this migration using:"
    echo "   supabase db push"
    echo ""
else
    echo -e "${YELLOW}⚠️  Supabase CLI not found${NC}"
    echo "   Install: npm install -g supabase"
    echo ""
fi

# Ask user for migration method
echo "Choose migration method:"
echo "1) Supabase CLI (recommended)"
echo "2) Supabase Dashboard (SQL Editor)"
echo "3) Show migration preview"
echo "4) Exit"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "🔧 Running Supabase CLI migration..."
        echo ""
        
        # Check if supabase is linked
        if [ -f ".git/config" ] && grep -q "supabase" ".git/config"; then
            echo "Running: supabase db push"
            supabase db push
            echo ""
            echo -e "${GREEN}✅ Migration applied successfully via CLI!${NC}"
        else
            echo -e "${YELLOW}⚠️  Project not linked to Supabase.${NC}"
            echo "Run: supabase link --project-ref YOUR_PROJECT_REF"
            echo "Then: supabase db push"
        fi
        ;;
    2)
        echo ""
        echo "📝 To apply via Dashboard:"
        echo ""
        echo "1. Go to: https://supabase.com/dashboard"
        echo "2. Select your project"
        echo "3. Navigate to: SQL Editor"
        echo "4. Click: New Query"
        echo "5. Copy contents from: $MIGRATION_FILE"
        echo "6. Click: Run"
        echo ""
        echo "Opening migration file..."
        cat "$MIGRATION_FILE"
        echo ""
        echo -e "${YELLOW}📋 Copy the SQL above and run in Supabase Dashboard${NC}"
        ;;
    3)
        echo ""
        echo "📄 Migration Preview:"
        echo "====================="
        echo ""
        head -n 50 "$MIGRATION_FILE"
        echo ""
        echo "... (showing first 50 lines)"
        echo ""
        echo "Full file: $MIGRATION_FILE"
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "🧪 Next Steps:"
echo "1. Verify migration with: SELECT * FROM badges;"
echo "2. Run integration tests in app (Settings > Developer Tools)"
echo "3. Test manually following: docs/MONETIZATION_TESTING_GUIDE.md"
echo ""
echo -e "${GREEN}✨ Done!${NC}"
