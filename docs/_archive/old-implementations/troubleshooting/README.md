# 🔧 Troubleshooting Guides

**Purpose:** Solutions for common issues, error fixes, and debugging guides.

---

## 📑 Common Issues

### **Usage Limits & RPC Functions**
- **[USAGE_LIMIT_RPC_FIX.md](./USAGE_LIMIT_RPC_FIX.md)** - Fix RPC function issues
  - Null handling in `get_usage_status`
  - Error re-throwing in `checkAndIncrementUsage`
  - RLS policy blocking DELETE operations
  - `force_reset_usage_limits` SECURITY DEFINER solution

**Symptoms:**
- Usage count returns `null` instead of `0`
- `USAGE_LIMIT_REACHED` error not thrown
- Test cleanup fails (0 records deleted)

**Solution:**
```typescript
// Add null coalescing
return {
  ...data,
  current_count: data.current_count ?? 0,
};

// Re-throw specific errors
if (error.message === 'USAGE_LIMIT_REACHED') {
  throw error;
}
```

---

### **RevenueCat Issues**
**Location:** `../setup/REVENUECAT_ERROR_FIX.md`

**Common Errors:**
1. **API Key Invalid**
   - Verify `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
   - Check platform-specific keys (iOS vs Android)

2. **Product ID Not Found**
   - Ensure product IDs match between:
     - App Store Connect / Google Play Console
     - RevenueCat Dashboard
     - App code

3. **Purchase Not Validated**
   - Check webhook configuration
   - Verify receipt validation endpoint
   - Review RevenueCat logs

---

### **Google OAuth Issues**
**Location:** `../setup/GOOGLE_SIGNIN_FIXES.md`

**Common Errors:**
1. **"redirect_uri_mismatch"**
   ```
   Error: redirect_uri_mismatch
   Solution: Add all redirect URIs to Google Cloud Console:
   - https://auth.expo.io/@your-username/your-app-slug
   - exp://localhost:8081
   - http://localhost:19006
   ```

2. **"Invalid client"**
   - Verify `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - Check OAuth consent screen setup
   - Ensure app is published (at least in testing)

3. **Stuck on loading**
   - Clear Expo cache: `npx expo start -c`
   - Reinstall app
   - Check network logs

---

### **Edge Functions**
**Location:** `../setup/EDGE_FUNCTIONS_FALLBACK.md`

**Deployment Issues:**
1. **Function not found**
   ```bash
   # Redeploy
   supabase functions deploy generate-tip
   supabase functions deploy chat
   ```

2. **Environment variables missing**
   ```bash
   # Set secrets
   supabase secrets set AZURE_OPENAI_ENDPOINT=https://...
   supabase secrets set AZURE_OPENAI_KEY=your-key
   supabase secrets set AZURE_OPENAI_DEPLOYMENT=gpt-4
   ```

3. **CORS errors**
   ```typescript
   // Add CORS headers in function
   return new Response(JSON.stringify(data), {
     headers: {
       'Content-Type': 'application/json',
       'Access-Control-Allow-Origin': '*',
     },
   });
   ```

---

### **Database & Migrations**

**Migration Fails:**
```bash
# Check current migrations
supabase db remote list

# Reset local database (dev only!)
supabase db reset

# Apply specific migration
supabase db execute -f supabase/migrations/010_monetization_infrastructure.sql
```

**RLS Policy Issues:**
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'usage_limits';

-- Test policy
SELECT * FROM usage_limits WHERE user_id = auth.uid();

-- Bypass RLS (testing only)
CREATE OR REPLACE FUNCTION force_reset_usage_limits(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with elevated privileges
AS $$
BEGIN
  DELETE FROM usage_limits WHERE user_id = p_user_id;
  -- ...
END;
$$;
```

---

### **Push Notifications**

**Notifications Not Received:**
1. **Permissions not granted**
   ```typescript
   const { status } = await Notifications.getPermissionsAsync();
   if (status !== 'granted') {
     await Notifications.requestPermissionsAsync();
   }
   ```

2. **Token not saved**
   ```typescript
   const token = await Notifications.getExpoPushTokenAsync();
   await supabase
     .from('profiles')
     .update({ push_token: token.data })
     .eq('id', userId);
   ```

3. **Background notifications (iOS)**
   - Enable background modes in Xcode
   - Add notification service extension

---

### **Build & Deployment**

**EAS Build Fails:**
```bash
# Clear cache
eas build:clear

# Check credentials
eas credentials

# Rebuild
eas build --profile production --platform ios --clear-cache
```

**TypeScript Errors:**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall
npm ci

# Type check
npx tsc --noEmit
```

---

## 🔍 Debugging Tips

### **Enable Detailed Logging**
```typescript
// Add to app entry point
if (__DEV__) {
  console.log = (message, ...args) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]`, message, ...args);
  };
}
```

### **Network Debugging**
```typescript
// Log all Supabase requests
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Supabase Auth]', event, session);
});

// Intercept fetch
const originalFetch = global.fetch;
global.fetch = (url, options) => {
  console.log('[Fetch]', url, options);
  return originalFetch(url, options);
};
```

### **React Native Debugger**
```bash
# Install
brew install --cask react-native-debugger

# Open debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"

# Enable in app
# Shake device → "Debug with Chrome"
```

---

## 🔗 Related Documentation

- **[../setup/](../setup/)** - Setup guides
- **[../testing/](../testing/)** - Testing guides
- **[../ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture

---

## 📞 Getting Help

1. **Check documentation** - Search this docs folder
2. **Check logs** - `supabase functions logs function-name`
3. **Check Supabase status** - [status.supabase.com](https://status.supabase.com)
4. **Check GitHub issues** - Search existing issues
5. **Ask the team** - Contact development team

---

*Last updated: November 11, 2025*
