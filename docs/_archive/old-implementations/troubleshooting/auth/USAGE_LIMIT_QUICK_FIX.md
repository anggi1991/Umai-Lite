# <!-- Moved from root path: /USAGE_LIMIT_QUICK_FIX.md on 2025-11-11. Consolidated into docs/troubleshooting/auth/. -->
# Usage Limit Quick Fix

# 🚀 Quick Fix: Usage Limit Tests Failing

## ⚡ Problem
Test usage limits gagal karena RPC function `check_and_increment_usage` return null.

## ✅ Solution (3 Langkah Cepat)

### 1️⃣ Copy SQL Fix
```bash
cat /workspaces/parentingAI/scripts/fix-usage-limit-function.sql
```

### 2️⃣ Paste ke Supabase SQL Editor
- Buka: https://supabase.com/dashboard
- Pilih project Anda
- Klik "SQL Editor" di sidebar kiri
- Paste SQL dari step 1
- Klik **RUN** button

### 3️⃣ Test di App
- Navigate ke `/test-usage-limits`
- Tekan tombol "Run Tests"
- ✅ Harusnya 6/6 tests passing

---

## 📋 Expected Results After Fix

```
✅ Setup Test User - PASS
✅ Initial Usage Status - PASS (0/3 AI tips)
✅ Increment Usage Count - PASS (2/3 used)
✅ Limit Reached Scenario - PASS (error at 4th tip)
✅ Chat Message Limits - PASS (10/10 messages)
✅ Cleanup Test Data - PASS

Total: 6/6 ✅
```

---

## 🔍 Verify Fix Applied

Run this query in Supabase SQL Editor:

```sql
SELECT routine_name, data_type 
FROM information_schema.routines 
WHERE routine_name = 'check_and_increment_usage';
```

Should return 1 row with `data_type = 'jsonb'`

---

## 📚 More Info

- **Full Guide**: `/docs/troubleshooting/USAGE_LIMIT_RPC_FIX.md`
- **Migration**: `/supabase/migrations/010_monetization_infrastructure.sql`
- **Diagnostic Tool**: `./scripts/diagnose-usage-limit.sh`

---

## 💡 Why This Happened

RPC function tidak ter-deploy karena:
1. Migration belum di-apply ke Supabase production
2. Local development vs production database mismatch
3. Function permissions belum di-grant

**Prevention**: Selalu run `npx supabase db push` setelah membuat migration baru.
