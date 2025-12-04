# <!-- Moved from root path: /DELETE_BLOCKED_FIX.md on 2025-11-11. Consolidated into docs/references/ops/. -->
# 🚨 DELETE BLOCKED: RLS Policy Issue

## ❌ Problem

Delete operation tidak berfungsi:
```
Deleted records: 0  ❌
Remaining records: 5  ❌
```

**Root Cause**: RLS (Row Level Security) policy di tabel `usage_limits` memblokir DELETE operation.

---

## ✅ Quick Fix (2 Steps)

### Step 1: Apply RPC Function di Supabase

1. **Copy SQL**:
   ```bash
   cat /workspaces/parentingAI/scripts/force-reset-usage-function.sql
   ```

2. **Paste ke Supabase SQL Editor**:
   - Buka: https://supabase.com/dashboard
   - Pilih project Anda
   - Klik **SQL Editor**
   - Paste SQL
   - Klik **RUN**

3. **Verify Function Created**:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'force_reset_usage_limits';
   ```
   Should return 1 row.

---

### Step 2: Run Tests Again

1. App akan auto-reload
2. Navigate ke `/test-usage-limits`
3. Press **"Run All Tests"**
4. Check logs - should see:
   ```
   🗑️ Force resetting usage limits via RPC...
   ✅ RPC reset result: { success: true, deleted_count: 5 }
   📊 Remaining records after reset: 0  ← ✅ FIXED!
   ```

---

## 📋 Expected Results After Fix

```
✅ Setup Test User - PASS
✅ Initial Usage Status - PASS (0/3 AI tips, 0/10 chat)
✅ Increment Usage Count - PASS (2/3 used)
✅ Limit Reached Scenario - PASS (error thrown)
✅ Chat Message Limits - PASS (10/10 used)
✅ Cleanup Test Data - PASS

Total: 6/6 tests passing ✅
```

---

## 🔍 Why This Happened

**RLS Policy** di tabel `usage_limits` hanya allow DELETE untuk:
- User's own records
- Via authenticated role

Tapi ada kemungkinan policy tidak configured correctly untuk test scenario.

**Solution**: Function `force_reset_usage_limits` menggunakan `SECURITY DEFINER` yang bypass RLS policies.

---

## 🛠️ Alternative: Manual Reset via SQL

Jika RPC function tidak work, manual reset via SQL Editor:

```sql
-- Get your user_id
SELECT auth.uid();

-- Delete all usage_limits for your user
DELETE FROM usage_limits
WHERE user_id = '<your-user-id-here>';

-- Verify
SELECT * FROM usage_limits
WHERE user_id = '<your-user-id-here>';
-- Should return 0 rows
```

---

## 📊 Verification

After applying fix, test logs should show:

```
✅ RPC reset result: {
  "success": true,
  "deleted_count": 5,
  "message": "Deleted 5 usage limit records"
}
📊 Remaining records after reset: 0
```

---

## 🔗 Files

- **SQL Fix**: `/scripts/force-reset-usage-function.sql`
- **Test File**: `/src/tests/usageLimitIntegrationTest.ts`
- **Updated**: Setup & Cleanup now use RPC

---

## ⚠️ Important

This function uses `SECURITY DEFINER` which bypasses RLS. 
**Only use for testing!** Do not expose to production users.
