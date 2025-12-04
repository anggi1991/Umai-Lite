#!/bin/bash

# =====================================================
# VERIFY AND FIX USAGE LIMIT RPC FUNCTION
# =====================================================
# Purpose: Check if check_and_increment_usage function works
# If not, provide instructions to fix it
# =====================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=================================================="
echo "🔍 USAGE LIMIT RPC FUNCTION DIAGNOSTIC"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Check if .env exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Create .env with SUPABASE_URL and SUPABASE_ANON_KEY"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# Load environment variables
export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)

# Check migration status
echo "📋 Checking migration status..."
echo ""

if [ -f "$PROJECT_ROOT/supabase/migrations/010_monetization_infrastructure.sql" ]; then
    echo -e "${GREEN}✅ Migration file exists:${NC} 010_monetization_infrastructure.sql"
else
    echo -e "${RED}❌ Migration file NOT found${NC}"
    echo "Expected: $PROJECT_ROOT/supabase/migrations/010_monetization_infrastructure.sql"
    exit 1
fi

echo ""
echo "=================================================="
echo "📊 DIAGNOSTIC RESULTS"
echo "=================================================="
echo ""

echo "Migration file: ✅ Found"
echo "Function name: check_and_increment_usage"
echo "Expected return: JSONB with {allowed, current_count, limit, remaining}"
echo ""

echo "=================================================="
echo "🔧 NEXT STEPS TO FIX"
echo "=================================================="
echo ""

echo -e "${YELLOW}Option 1: Apply via Supabase Dashboard${NC}"
echo "1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql"
echo "2. Copy and paste this file contents:"
echo "   $SCRIPT_DIR/fix-usage-limit-function.sql"
echo "3. Click 'RUN' button"
echo ""

echo -e "${YELLOW}Option 2: Apply via Supabase CLI${NC}"
echo "1. Login to Supabase:"
echo "   npx supabase login"
echo "2. Link project:"
echo "   npx supabase link --project-ref YOUR_PROJECT_ID"
echo "3. Push migrations:"
echo "   npx supabase db push"
echo ""

echo -e "${YELLOW}Option 3: Manual SQL Query${NC}"
echo "1. Open Supabase SQL Editor"
echo "2. Run this query to verify function exists:"
echo ""
cat <<'EOF'
SELECT routine_name, data_type 
FROM information_schema.routines 
WHERE routine_name = 'check_and_increment_usage';
EOF
echo ""
echo "3. If empty, run: $SCRIPT_DIR/fix-usage-limit-function.sql"
echo ""

echo "=================================================="
echo "✅ VERIFICATION TEST"
echo "=================================================="
echo ""

echo "After applying the fix, test in your app:"
echo "1. Navigate to: /test-usage-limits"
echo "2. Check console logs for:"
echo "   [UsageLimitService] RPC result: {data: {allowed: true, ...}, error: null}"
echo "3. Expected test results: 6/6 passing"
echo ""

echo "=================================================="
echo "📖 DETAILED DOCUMENTATION"
echo "=================================================="
echo ""
echo "See full troubleshooting guide:"
echo "$PROJECT_ROOT/docs/troubleshooting/USAGE_LIMIT_RPC_FIX.md"
echo ""

# Ask if user wants to see the SQL fix
read -p "Would you like to see the SQL fix content? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "=================================================="
    echo "SQL FIX CONTENT"
    echo "=================================================="
    echo ""
    cat "$SCRIPT_DIR/fix-usage-limit-function.sql"
fi

echo ""
echo -e "${GREEN}Diagnostic complete!${NC}"
