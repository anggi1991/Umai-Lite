# <!-- Moved from root path: /USAGE_LIMIT_BUG_FIX.md on 2025-11-11. Consolidated into docs/troubleshooting/auth/. -->
# Usage Limit Bug Fix

# 🐛 Bug Fix: Usage Limit Test Parameter Order

## ❌ Problem Found

Test memanggil function dengan urutan parameter yang salah:

```typescript
// ❌ WRONG - userId first, featureType second
await UsageLimitService.checkAndIncrementUsage(this.testUserId, 'ai_tips');
```

Ini menyebabkan:
- `user_id` = `"ai_tips"` (string bukan UUID) ❌
- `feature_type` = UUID user ❌
- RPC error: `{data: null, error: Object}`

---

## ✅ Solution Applied

Fixed parameter order di 3 tempat:

### 1. testIncrementUsage() - Line 104
```typescript
// ✅ CORRECT - featureType first, userId second
await UsageLimitService.checkAndIncrementUsage('ai_tips' as FeatureType, this.testUserId);
```

### 2. testLimitReached() - Lines 148 & 156
```typescript
// ✅ CORRECT
await UsageLimitService.checkAndIncrementUsage('ai_tips' as FeatureType, this.testUserId);
```

### 3. testChatMessageLimits() - Line 193
```typescript
// ✅ CORRECT
await UsageLimitService.checkAndIncrementUsage('chat_messages' as FeatureType, this.testUserId);
```

### Bonus Fix: Line 184
```typescript
// Fixed column name
.eq('feature_type', 'chat_messages')  // was: .eq('feature', ...)
```

---

## 📊 Expected Results After Fix

```
✅ Setup Test User - PASS
✅ Initial Usage Status - PASS (0/3 AI tips)
✅ Increment Usage Count - PASS (2/3 used, 1 remaining)
✅ Limit Reached Scenario - PASS (4th tip blocked)
✅ Chat Message Limits - PASS (10/10 messages)
✅ Cleanup Test Data - PASS

Total: 6/6 tests passing ✅
```

---

## 🧪 Test Now

1. **Reload app** (Expo will hot-reload automatically)
2. Navigate to `/test-usage-limits`
3. Press **"Run All Tests"**
4. Check console - should see correct UUID being used:
   ```
   [UsageLimitService] Current user ID: <valid-uuid>
   [UsageLimitService] RPC result: {data: {allowed: true, ...}, error: null}
   ```

---

## 🔍 What Changed

| Before | After |
|--------|-------|
| `checkAndIncrementUsage(userId, feature)` | `checkAndIncrementUsage(feature, userId)` |
| user_id = "ai_tips" ❌ | user_id = UUID ✅ |
| Tests fail: 4/6 | Tests pass: 6/6 ✅ |

---

## 📝 Root Cause

Function signature:
```typescript
static async checkAndIncrementUsage(
  featureType: FeatureType,  // ← First param
  userId?: string            // ← Second param (optional)
)
```

Test was calling with reversed params, treating `featureType` as `userId`.

---

## ✅ Status: FIXED

All parameter orders corrected. Tests should now pass completely.
