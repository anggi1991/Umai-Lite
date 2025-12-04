# Analytics & Subscription Testing Checklist

## Prerequisites
✅ Development server running (npm start)
✅ Supabase migration 001_init.sql applied
✅ User logged in to the app

## Testing Steps

### 1. Access Test Screen

1. ✅ Open the app in development mode
2. ✅ Navigate to Dashboard
3. ✅ Look for "Test" button in the header (only visible in DEV mode)
4. ✅ Tap "Test" button to open Test Analytics screen

### 2. Run Analytics Tests

**Test 1: Track App Launch**
- ✅ Tap "Test Analytics Only" button
- ✅ Verify "App launch tracked" message appears
- ✅ Check Supabase audit_logs table:
  ```sql
  SELECT * FROM audit_logs 
  WHERE action = 'app_launch' 
  ORDER BY created_at DESC LIMIT 5;
  ```

**Test 2: Track Screen View**
- ✅ Verify "Screen view tracked" message appears
- ✅ Check audit_logs for screen_view action
- ✅ Verify details contain screen name

**Test 3: Track Feature Usage**
- ✅ Verify "Feature usage tracked" message appears
- ✅ Check audit_logs for feature_usage action
- ✅ Verify details contain feature metadata

**Test 4: Track Activity Created**
- ✅ Verify "Activity creation tracked" message appears
- ✅ Check audit_logs for activity_created action
- ✅ Verify table_name = 'activities' and record_id exists

**Test 5: Get DAU Count**
- ✅ Verify DAU count displays (should be >= 1)
- ✅ Check console output for count value

**Test 6: Get User Activity Summary**
- ✅ Verify summary displays with events by action
- ✅ Check totalEvents count
- ✅ Verify lastActive timestamp

### 3. Run Subscription Tests

**Test 1: Initialize Free Subscription**
- ✅ Tap "Test Subscription Only" button
- ✅ Verify "Free subscription initialized" message
- ✅ Check Supabase subscriptions table:
  ```sql
  SELECT * FROM subscriptions 
  WHERE user_id = auth.uid() 
  ORDER BY created_at DESC;
  ```

**Test 2: Get Current Subscription**
- ✅ Verify subscription object displays in console
- ✅ Check tier = 'free'
- ✅ Check status = 'active'
- ✅ Verify started_at timestamp exists

**Test 3: Check Active Subscription**
- ✅ Verify "Has active subscription: true" message
- ✅ Confirm user has valid subscription

**Test 4: Check Premium Status**
- ✅ Verify "Is premium user: false" (for free tier)
- ✅ Confirm free tier users don't have premium access

**Test 5: Get Subscription Features**
- ✅ Verify free tier features display:
  - maxChildren: 3
  - aiTipsDaily: 3
  - chatMessagesPerDay: 20
  - mediaStorageGB: 1
  - analytics: false
  - prioritySupport: false
- ✅ Verify premium tier features display correctly

**Test 6: Check Feature Access**
- ✅ Verify "Can access chat: true"
- ✅ Verify "Can access analytics: false" (free tier)

### 4. Test Real-World Integration

**Analytics in Dashboard:**
1. ✅ Go back to Dashboard
2. ✅ Verify screen view was tracked (check Supabase)
3. ✅ Add a new activity (feeding, sleep, etc.)
4. ✅ Verify activity_created event logged
5. ✅ Generate a new tip
6. ✅ Verify feature_usage event logged with tip_id

**Subscription on App Launch:**
1. ✅ Sign out from the app
2. ✅ Sign in again
3. ✅ Verify app_launch event logged
4. ✅ Verify subscription still exists in database
5. ✅ Check that free subscription wasn't duplicated

**New User Flow:**
1. ✅ Create a new user account
2. ✅ Check subscriptions table for new entry
3. ✅ Verify tier = 'free', status = 'active'
4. ✅ Verify app_launch event for new user

### 5. Database Verification

**Check audit_logs Table:**
```sql
-- View all events for current user
SELECT 
  action,
  table_name,
  details,
  created_at
FROM audit_logs 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 20;

-- Count events by action type
SELECT 
  action,
  COUNT(*) as count
FROM audit_logs
WHERE user_id = auth.uid()
GROUP BY action;

-- Get today's activity
SELECT COUNT(DISTINCT user_id) as dau
FROM audit_logs
WHERE DATE(created_at) = CURRENT_DATE;
```

**Check subscriptions Table:**
```sql
-- View current subscription
SELECT 
  tier,
  status,
  started_at,
  expires_at,
  metadata
FROM subscriptions
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;

-- Count subscriptions by tier
SELECT 
  tier,
  COUNT(*) as count
FROM subscriptions
GROUP BY tier;
```

### 6. Edge Cases to Test

**Analytics:**
- ✅ Test with no internet connection (events should fail gracefully)
- ✅ Test rapid event firing (should not crash)
- ✅ Test with different event types
- ✅ Verify user_id is always set correctly

**Subscription:**
- ✅ Test initializing subscription twice (should not duplicate)
- ✅ Test expired subscription (set expires_at to past date)
- ✅ Test cancelled subscription (status = 'cancelled')
- ✅ Test feature access with different tiers

### 7. Performance Testing

- ✅ Track multiple events in sequence
- ✅ Verify no UI lag or blocking
- ✅ Check database query performance
- ✅ Monitor network requests

### 8. Cleanup (Optional)

If you want to reset test data:

```sql
-- Delete test analytics events
DELETE FROM audit_logs 
WHERE user_id = auth.uid() 
AND details->>'test' = 'true';

-- Reset subscription (be careful!)
-- DELETE FROM subscriptions WHERE user_id = auth.uid();
```

## Expected Results

### ✅ All Tests Passing
- All test functions complete without errors
- Console output shows success messages (✅)
- Database entries created correctly
- No TypeScript or runtime errors

### ❌ If Tests Fail

**Common Issues:**

1. **RLS Policy Errors:**
   - Verify migration 001 applied correctly
   - Check RLS policies on audit_logs and subscriptions
   - Ensure user is authenticated

2. **Subscription Not Creating:**
   - Check if profile exists for user
   - Verify foreign key constraints
   - Check AuthContext initialization

3. **Analytics Not Logging:**
   - Verify user session is valid
   - Check Supabase connection
   - Review console for errors

## Test Summary Template

```
Date: ___________
Tester: ___________
Environment: Development / Staging / Production

Analytics Tests:
- Track App Launch: ✅ / ❌
- Track Screen View: ✅ / ❌
- Track Feature Usage: ✅ / ❌
- Track Activity Created: ✅ / ❌
- Get DAU Count: ✅ / ❌
- Get User Activity Summary: ✅ / ❌

Subscription Tests:
- Initialize Free Subscription: ✅ / ❌
- Get Current Subscription: ✅ / ❌
- Check Active Subscription: ✅ / ❌
- Check Premium Status: ✅ / ❌
- Get Subscription Features: ✅ / ❌
- Check Feature Access: ✅ / ❌

Integration Tests:
- Dashboard Analytics: ✅ / ❌
- App Launch Tracking: ✅ / ❌
- New User Flow: ✅ / ❌

Overall Status: PASS / FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

## Next Steps After Testing

1. ✅ All tests pass → Mark task as complete
2. ✅ Document any issues found
3. ✅ Update PROGRESS.md
4. ✅ Move to next task: Testing & QA (unit/E2E tests)

