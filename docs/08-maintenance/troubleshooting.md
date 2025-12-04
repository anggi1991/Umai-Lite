# 🔧 Troubleshooting Guide

Complete troubleshooting guide for common issues in Parenting AI.

**Last Updated:** November 16, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Usage Limit Problems](#usage-limit-problems)
3. [Email Delivery Issues](#email-delivery-issues)
4. [Data Sync Problems](#data-sync-problems)
5. [App Performance](#app-performance)
6. [General Issues](#general-issues)

---

## 🔐 Authentication Issues

### Issue 1: Google OAuth Stuck After Account Selection

**Symptoms:**
- User clicks "Sign in with Google"
- Browser opens, user selects Google account
- Browser closes but app doesn't redirect to dashboard
- Logs show OAuth URL opened but no callback

**Root Cause:**
- `WebBrowser.openAuthSessionAsync` doesn't always capture URL correctly in Expo Go
- Deep link URL not being intercepted properly

**Solution:**

1. **Setup URL listener before opening browser:**

```typescript
// In AuthContext.tsx
const signInWithGoogle = async () => {
  // Setup listener BEFORE opening browser
  const urlListener = Linking.addEventListener('url', async (event) => {
    const url = event.url;
    
    // Extract tokens from URL
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const hash = url.substring(hashIndex + 1);
      const params = new URLSearchParams(hash);
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    }
  });
  
  // Get OAuth URL from Supabase
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'parentingai://auth-callback',
    },
  });
  
  if (error) throw error;
  
  // Open browser
  await WebBrowser.openAuthSessionAsync(
    data.url,
    'parentingai://auth-callback'
  );
  
  // Cleanup
  urlListener.remove();
};
```

2. **Improve auth-callback screen:**

```typescript
// app/auth-callback.tsx
useEffect(() => {
  const handleCallback = async () => {
    try {
      // Get URL with tokens
      const url = await Linking.getInitialURL();
      
      if (url) {
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const hash = url.substring(hashIndex + 1);
          const params = new URLSearchParams(hash);
          
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            router.replace('/dashboard');
            return;
          }
        }
      }
      
      // Fallback: Check existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      } else {
        router.replace('/(auth)/signin');
      }
    } catch (error) {
      console.error('[Auth Callback] Error:', error);
      router.replace('/(auth)/signin');
    }
  };
  
  handleCallback();
}, []);
```

**Verification:**
1. Clear app data
2. Try Google sign-in
3. Check console for token extraction logs
4. Verify redirect to dashboard

---

### Issue 2: OAuth Error 400 - Invalid Redirect URI

**Symptoms:**
- Google OAuth returns Error 400
- Message: "redirect_uri_mismatch"

**Root Cause:**
- Redirect URI in Google Console doesn't match app's redirect URI
- Supabase auth URLs not configured correctly

**Solution:**

1. **Update Google Cloud Console:**

Go to: https://console.cloud.google.com/apis/credentials

Add these redirect URIs:
```
https://[project-ref].supabase.co/auth/v1/callback
parentingai://auth-callback
exp://localhost:8081
```

2. **Update Supabase Dashboard:**

Go to: Authentication → URL Configuration

Add redirect URLs:
```
parentingai://auth-callback
exp://localhost:8081
http://localhost:8081
```

3. **Verify OAuth configuration:**

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'parentingai://auth-callback',
    skipBrowserRedirect: false,
  },
});
```

---

## 📊 Usage Limit Problems

### Issue 1: RPC Error - Parameter Order Wrong

**Symptoms:**
- Usage limit check fails with RPC error
- Error: `{data: null, error: Object}`
- Console shows: `user_id = "ai_tips"` instead of UUID

**Root Cause:**
- Function called with wrong parameter order
- `checkAndIncrementUsage(userId, featureType)` should be `(featureType, userId)`

**Solution:**

```typescript
// ❌ WRONG
await UsageLimitService.checkAndIncrementUsage(userId, 'ai_tips');

// ✅ CORRECT
await UsageLimitService.checkAndIncrementUsage('ai_tips', userId);
```

**Files to check:**
- `src/services/usageLimitService.ts`
- Any component calling usage limit checks
- Test files in `src/__tests__/`

**Verification:**
1. Navigate to `/test-usage-limits`
2. Run all tests
3. Check console for correct UUID usage
4. Verify no RPC errors

---

### Issue 2: Usage Limits Not Resetting

**Symptoms:**
- User still sees "limit reached" after 24 hours
- Daily limits don't reset at midnight

**Root Cause:**
- `reset_at` timestamp comparison not working correctly
- Timezone issues

**Solution:**

```typescript
// Check if reset is needed
export const checkAndIncrementUsage = async (
  featureType: FeatureType,
  userId: string
): Promise<UsageCheckResult> => {
  // Get current usage
  const { data: usage } = await supabase
    .from('usage_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('feature_type', featureType)
    .single();
  
  // Check if reset needed
  const now = new Date();
  const resetAt = usage?.reset_at ? new Date(usage.reset_at) : null;
  
  if (resetAt && now > resetAt) {
    // Reset usage
    await supabase
      .from('usage_limits')
      .update({
        usage_count: 0,
        reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      })
      .eq('user_id', userId)
      .eq('feature_type', featureType);
  }
  
  // Continue with usage check...
};
```

**Manual reset (if needed):**
```sql
UPDATE usage_limits
SET usage_count = 0,
    reset_at = NOW() + INTERVAL '24 hours'
WHERE user_id = 'user-id'
AND feature_type = 'ai_tips';
```

---

## 📧 Email Delivery Issues

### Issue 1: Emails Going to Spam

**Symptoms:**
- Welcome emails land in spam folder
- From address: `onboarding@resend.dev`

**Root Cause:**
- Using shared test domain instead of verified custom domain
- Missing SPF, DKIM, DMARC records

**Solution:**

**Option 1: Setup Custom Domain (RECOMMENDED)**

1. **Add domain to Resend:**
   - Go to: https://resend.com/domains
   - Click "Add Domain"
   - Enter your domain (e.g., `parentingai.com`)

2. **Add DNS records:**

```dns
# SPF Record (TXT)
Name: @
Value: v=spf1 include:_spf.resend.com ~all

# DKIM Record (TXT)
Name: resend._domainkey
Value: [Copy from Resend dashboard]

# DMARC Record (TXT)
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

3. **Wait for verification (1-60 minutes)**

4. **Update email sender:**

```typescript
// Before
from: 'onboarding@resend.dev'

// After
from: 'no-reply@parentingai.com'
```

**Option 2: Quick Fix (Temporary)**

Use Gmail SMTP as fallback:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password
```

**Verification:**
1. Send test email
2. Check inbox (not spam)
3. Verify sender name and domain
4. Test on multiple providers (Gmail, Outlook, Yahoo)

---

### Issue 2: Email Not Sending

**Symptoms:**
- No error thrown but email never arrives
- Resend API returns 200 OK but no email

**Diagnosis:**

```typescript
// Add logging
const result = await resend.emails.send({
  from: 'no-reply@parentingai.com',
  to: userEmail,
  subject: 'Welcome to Parenting AI',
  html: emailHtml,
});

console.log('[Email] Send result:', result);
```

**Common causes:**
1. **Invalid recipient email**
   - Solution: Validate email format
   
2. **Rate limiting**
   - Solution: Check Resend dashboard for limits
   
3. **Domain not verified**
   - Solution: Complete domain verification

4. **SMTP credentials wrong**
   - Solution: Regenerate API key

---

## 🔄 Data Sync Problems

### Issue 1: Activities Not Showing in Statistics

**Symptoms:**
- Activity appears in Dashboard/History
- Statistics tab shows "No data"
- Activity has `child_id = NULL`

**Root Cause:**
- Activity saved without child_id
- Statistics query filters by child_id

**Solution:**

Auto-assign child_id on activity creation (already implemented):

```typescript
// In activityService.ts
if (!activityData.child_id) {
  // Get default or first child
  const child = await getDefaultChild(userId) || 
                await getFirstChild(userId);
  
  if (child) {
    activityData.child_id = child.id;
    activityData.metadata = {
      ...activityData.metadata,
      auto_assigned: true,
    };
  }
}
```

**Manual fix for existing data:**

```sql
-- Fix NULL child_ids
UPDATE activities a
SET child_id = (
  SELECT c.id FROM children c
  WHERE c.user_id = a.user_id
  ORDER BY c.created_at ASC
  LIMIT 1
),
metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{migrated}',
  'true'::jsonb
)
WHERE a.child_id IS NULL
AND EXISTS (
  SELECT 1 FROM children c
  WHERE c.user_id = a.user_id
);
```

**Verification:**
```sql
-- Check for NULL child_ids
SELECT COUNT(*) FROM activities a
JOIN children c ON c.user_id = a.user_id
WHERE a.child_id IS NULL;
-- Should return 0
```

---

## ⚡ App Performance

### Issue 1: Slow Loading Times

**Symptoms:**
- App takes >3 seconds to load data
- Dashboard feels sluggish

**Diagnosis:**

```typescript
// Add performance logging
const start = performance.now();
const activities = await getActivities(userId);
const end = performance.now();
console.log(`[Performance] getActivities took ${end - start}ms`);
```

**Solutions:**

1. **Add database indexes:**

```sql
-- Activity queries
CREATE INDEX IF NOT EXISTS idx_activities_user_child 
ON activities(user_id, child_id);

CREATE INDEX IF NOT EXISTS idx_activities_timestamp 
ON activities(timestamp DESC);

-- Children queries
CREATE INDEX IF NOT EXISTS idx_children_user 
ON children(user_id);
```

2. **Implement pagination:**

```typescript
const getActivities = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
) => {
  const { data } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);
    
  return data;
};
```

3. **Use React Query for caching:**

```typescript
import { useQuery } from '@tanstack/react-query';

const { data: activities } = useQuery({
  queryKey: ['activities', userId],
  queryFn: () => getActivities(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

## 🔄 General Issues

### Issue 1: App Needs Manual Reload After Changes

**Symptoms:**
- Changes don't appear until app reloaded
- State not updating

**Solution:**

**Force reload:**
```typescript
import { Updates } from 'expo-updates';

const forceReload = async () => {
  try {
    await Updates.reloadAsync();
  } catch (error) {
    console.error('Reload failed:', error);
  }
};
```

**Add to Settings:**
```typescript
<Button onPress={forceReload}>
  Reload App
</Button>
```

---

### Issue 2: TypeScript Errors After Updates

**Symptoms:**
- Red squiggly lines everywhere
- Build fails with type errors

**Solution:**

```bash
# 1. Clean TypeScript cache
rm -rf node_modules/.cache

# 2. Reinstall dependencies
npm install

# 3. Restart TypeScript server
# VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

# 4. Clean Expo cache
npx expo start -c
```

---

## 🆘 Emergency Procedures

### Database Rollback

```bash
# Backup first
supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql

# Rollback last migration
supabase migration down

# Restore from backup
supabase db restore backup_20251116_100000.sql
```

### Reset User Data

```sql
-- Delete all data for a user
DELETE FROM activities WHERE user_id = 'user-id';
DELETE FROM children WHERE user_id = 'user-id';
DELETE FROM usage_limits WHERE user_id = 'user-id';
UPDATE profiles SET default_child_id = NULL WHERE user_id = 'user-id';
```

### Clear App Cache

```bash
# React Native
npm start -- --reset-cache

# Expo
npx expo start -c

# Full clean
rm -rf node_modules
rm -rf .expo
npm install
```

---

## 📞 Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Search GitHub issues
3. ✅ Review recent changes
4. ✅ Check console logs
5. ✅ Try in fresh environment

### Information to Provide

```markdown
**Environment:**
- OS: [iOS/Android/Web]
- Expo SDK: [version]
- Node: [version]

**Issue:**
- What were you trying to do?
- What happened instead?
- Error messages?

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Logs:**
```
[paste relevant logs]
```

**Screenshots:**
[if applicable]
```

---

## 📚 Related Documentation

- [Architecture Overview](../03-architecture/system-overview.md)
- [Database Schema](../03-architecture/database-schema.md)
- [API Reference](../07-reference/api-reference.md)
- [Testing Guide](../06-testing/manual-testing.md)

---

**Last Updated:** November 16, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0.0
