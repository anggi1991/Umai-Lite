# Generate Tip Edge Function

## Overview
Supabase Edge Function untuk menghasilkan tips parenting harian yang dipersonalisasi menggunakan Azure OpenAI.

## Features
- ✅ Personalisasi berdasarkan usia anak dan aktivitas terbaru
- ✅ Safety filter untuk konten medis berbahaya
- ✅ Simulation mode untuk testing tanpa API call
- ✅ Exported handler untuk unit testing
- ✅ Fallback graceful jika data tidak tersedia

## Environment Variables (Production)
```bash
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Local Testing

### Prerequisites
```bash
brew install deno
```

### Run Simulation Tests (No Azure OpenAI calls)
```bash
cd supabase/functions/generate-tip
SIMULATE_OPENAI=1 deno run --allow-env --allow-net test_local.ts
```

### Test Results (Last Run: November 6, 2025)
✅ **All tests passed successfully**

**Test 1: Tip without child_id (generic prompt)**
- Status: 200 OK
- Output: Safe parenting tips (generic)
- Personalization: {} (empty, as expected)
- Prompt: Generic parenting advice template

**Test 2: Tip with child_id (child not found in DB)**
- Status: 200 OK
- Output: Safe parenting tips (fallback)
- Personalization: {} (empty, graceful fallback)
- Behavior: No errors when child doesn't exist

**Test 3: Normal parenting question**
- Status: 200 OK
- Output: Relevant parenting tips
- Safety Filter: ✅ No false positives

**Verified Features:**
- ✅ Simulation mode works without external API calls
- ✅ Safety filter properly configured (no false positives)
- ✅ Personalization structure ready for real data
- ✅ Exported handler can be imported and tested
- ✅ Graceful fallback when child/activities missing
- ✅ Type safety with Deno declarations

### Run with Live Edge Functions (requires Supabase CLI)
```bash
cd /path/to/parenting-ai
supabase functions serve generate-tip --env-file .env.local
```

Then POST to the endpoint:
```bash
curl -X POST http://localhost:54321/functions/v1/generate-tip \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"child_id": "uuid-here", "context": "Anak tidur lebih larut."}'
```

## Request Schema
```typescript
{
  child_id?: string;  // Optional: triggers personalization
  context?: string;   // Optional: additional context for tip generation
}
```

## Response Schema
```typescript
{
  id: string;
  user_id: string;
  child_id: string | null;
  tip_text: string;
  model: string;
  prompt: {
    base: string;
    context: string;
    personalization: {
      age_months?: number;
      age_days?: number;
      child_name?: string;
      recent_activities?: Array<{...}>;
    }
  };
  personalization_text: string;
  created_at: string;
}
```

## Personalization Logic
When `child_id` is provided:
1. Fetch child profile (name, date of birth)
2. Calculate age in months and days
3. Fetch last 5 activities (feeding, sleep, play, etc.)
4. Compose enriched prompt with all context
5. Store personalization metadata in `daily_tips` table

## Safety Filter
Keywords that trigger medical disclaimer:
- diagnosa, diagnosis
- obat resep, resep dokter
- darurat medis
- kejang, sesak parah, patah tulang

If detected in AI output, replaces with:
> "Mohon konsultasikan topik ini dengan tenaga kesehatan profesional..."

## Deployment
```bash
cd /path/to/parenting-ai
supabase functions deploy generate-tip
```

Set secrets via Supabase Dashboard > Edge Functions > Secrets.

## Testing Strategy
- **Unit Tests**: Direct handler invocation via `test_local.ts`
- **Simulation Mode**: `SIMULATE_OPENAI=1` bypasses external API calls
- **Integration Tests**: Use Supabase CLI local functions
- **Production Testing**: Deploy to staging environment first

## Known Issues & Solutions
### Issue: TypeScript errors on Deno imports in VS Code
**Solution**: `deno.json` config file provided. Editor errors are cosmetic - runtime works fine.

### Issue: Safety filter too aggressive
**Solution**: Simulation output doesn't echo prompt to avoid false positives from system instructions.

## Architecture Notes
- Uses Deno runtime (not Node.js)
- `import.meta.main` check prevents server start on import (for testing)
- Handler exported for unit testing
- RLS enforced via service role key (backend only)
- Personalization fetches up to 5 most recent activities
- Age calculated in both months (approximate) and days (exact)
