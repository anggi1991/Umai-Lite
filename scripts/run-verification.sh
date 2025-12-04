#!/bin/bash

# 🔍 Monetization Migration Verification Script
# Run this to verify that migration was successfully applied

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║   🔍 VERIFICATION: Database Migration Status                        ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with SUPABASE_URL and SUPABASE_ANON_KEY"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: SUPABASE_URL or SUPABASE_ANON_KEY not found in .env"
    exit 1
fi

echo "✅ Environment loaded"
echo "📡 Connecting to: $SUPABASE_URL"
echo ""

# Function to run SQL query
run_query() {
    local query="$1"
    local description="$2"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔎 $description"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    result=$(curl -s -X POST \
        "${SUPABASE_URL}/rest/v1/rpc/query" \
        -H "apikey: ${SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}")
    
    echo "$result" | jq '.' 2>/dev/null || echo "$result"
    echo ""
}

echo "🚀 Starting verification..."
echo ""

# Check 1: Tables
echo "1️⃣ Checking tables..."
run_query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('usage_limits', 'iap_receipts', 'ads_metrics', 'referrals', 'badges', 'user_badges', 'affiliate_links', 'affiliate_clicks') ORDER BY table_name;" "Tables Created (Expected: 8)"

# Check 2: Functions
echo "2️⃣ Checking functions..."
run_query "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('check_and_increment_usage', 'get_usage_status', 'generate_referral_code', 'check_and_award_badges') ORDER BY routine_name;" "Functions Created (Expected: 4)"

# Check 3: Badges
echo "3️⃣ Checking badges..."
run_query "SELECT name, tier, points_required FROM badges ORDER BY points_required;" "Sample Badges (Expected: 8)"

# Check 4: Test referral code generation
echo "4️⃣ Testing referral code generation..."
run_query "SELECT generate_referral_code();" "Generate Referral Code (Expected: 6-char code)"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║   ✅ VERIFICATION COMPLETE!                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo "   1. Review the results above"
echo "   2. Verify counts: 8 tables, 4 functions, 8 badges"
echo "   3. If all looks good, proceed to automated testing"
echo ""
echo "📚 Documentation:"
echo "   - Full verification guide: docs/testing/MIGRATION_VERIFICATION.md"
echo "   - Next steps: docs/NEXT_STEPS.md"
echo ""
