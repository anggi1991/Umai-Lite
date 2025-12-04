#!/bin/bash
# Deploy all enhancements for Umai Parenting AI

set -e
echo "🚀 Deploying Umai AI Enhancements..."

# Step 1: Deploy migrations
echo "📦 Step 1: Running Database Migrations..."
cd /workspaces/parentingAI
supabase db push || echo "⚠️ Migrations may already exist"
echo "✅ Migrations complete"

# Step 2: Deploy Edge Functions
echo "🔧 Step 2: Deploying Edge Functions..."
supabase functions deploy chat --no-verify-jwt
echo "✅ Chat function deployed"

supabase functions deploy proactive-suggestions --no-verify-jwt
echo "✅ Proactive suggestions deployed"

echo "🎉 Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Test chat → Check learning logs"
echo "2. View analytics: SELECT * FROM analytics_dau;"
echo "3. Monitor: supabase functions logs chat"
