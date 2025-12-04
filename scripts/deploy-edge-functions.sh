#!/bin/bash
# Deploy Edge Functions to Supabase and set environment variables

set -e

echo "🚀 Deploying Supabase Edge Functions with Azure OpenAI Configuration"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with required variables"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$AZURE_OPENAI_ENDPOINT" ] || [ -z "$AZURE_OPENAI_KEY" ] || [ -z "$AZURE_OPENAI_DEPLOYMENT" ]; then
    echo "❌ Missing Azure OpenAI configuration in .env"
    echo "Required: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Install Supabase CLI if not exists
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Login to Supabase
echo "🔐 Logging in to Supabase..."
if [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
    supabase login --token "$SUPABASE_ACCESS_TOKEN"
else
    supabase login
fi

echo ""
echo "🔗 Linking to Supabase project..."
supabase link --project-ref gbcxzkgzhylpbmzbymwj

echo ""
echo "🔑 Setting Edge Function secrets..."

# Set secrets one by one
supabase secrets set AZURE_OPENAI_ENDPOINT="$AZURE_OPENAI_ENDPOINT"
supabase secrets set AZURE_OPENAI_KEY="$AZURE_OPENAI_KEY"
supabase secrets set AZURE_OPENAI_DEPLOYMENT="$AZURE_OPENAI_DEPLOYMENT"
supabase secrets set SIMULATE_OPENAI="0"

# Set Supabase config if exists
if [ -n "$EXPO_PUBLIC_SUPABASE_URL" ]; then
    supabase secrets set SUPABASE_URL="$EXPO_PUBLIC_SUPABASE_URL"
fi

if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
fi

echo ""
echo "📦 Deploying chat function..."
supabase functions deploy chat --no-verify-jwt

echo ""
echo "📦 Deploying generate-tip function..."
supabase functions deploy generate-tip --no-verify-jwt

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing deployed chat function..."
echo ""

# Test the deployed function
curl -i --location --request POST "https://gbcxzkgzhylpbmzbymwj.supabase.co/functions/v1/chat" \
  --header "Authorization: Bearer $EXPO_PUBLIC_SUPABASE_ANON_KEY" \
  --header "Content-Type: application/json" \
  --data '{"message":"Bagaimana cara menenangkan bayi yang menangis?"}'

echo ""
echo ""
echo "🎉 All done! Your AI functions should now be connected to Azure OpenAI."
echo ""
echo "Next steps:"
echo "1. Test the chat in your mobile app"
echo "2. Monitor logs: supabase functions logs chat"
echo "3. Check secrets: supabase secrets list"
