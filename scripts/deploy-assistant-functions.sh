#!/bin/bash

# Deploy Azure Assistant Edge Functions
# This script deploys all 4 Assistant action functions to Supabase

echo "🚀 Deploying Azure Assistant Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first."
    exit 1
fi

# Change to project directory
cd "$(dirname "$0")/.." || exit

echo ""
echo "📦 Deploying get-child-data function..."
npx supabase functions deploy get-child-data \
  --project-ref gbcxzkgzhylpbmzbymwj \
  || echo "⚠️ Warning: get-child-data deployment failed"

echo ""
echo "📦 Deploying get-growth-history function..."
npx supabase functions deploy get-growth-history \
  --project-ref gbcxzkgzhylpbmzbymwj \
  || echo "⚠️ Warning: get-growth-history deployment failed"

echo ""
echo "📦 Deploying get-activity-logs function..."
npx supabase functions deploy get-activity-logs \
  --project-ref gbcxzkgzhylpbmzbymwj \
  || echo "⚠️ Warning: get-activity-logs deployment failed"

echo ""
echo "📦 Deploying save-chat-context function..."
npx supabase functions deploy save-chat-context \
  --project-ref gbcxzkgzhylpbmzbymwj \
  || echo "⚠️ Warning: save-chat-context deployment failed"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the function URLs from the output above"
echo "2. Update azure-assistant-form-data.json with the correct endpoints"
echo "3. Configure the actions in Azure OpenAI Studio"
echo "4. Test each action endpoint with curl or Postman"
echo ""
echo "🔗 Function URLs will be:"
echo "   - https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/get-child-data"
echo "   - https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/get-growth-history"
echo "   - https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/get-activity-logs"
echo "   - https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/save-chat-context"
