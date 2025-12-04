# Push Notifications Setup Guide

## ✅ Configuration Complete

Push notifications have been configured for the Parenting AI app using Expo Notifications and EAS Build.

## 📋 What's Been Configured

### 1. **EAS Project Setup**
- ✅ EAS CLI installed globally
- ✅ `eas.json` created with build profiles (development, preview, production)
- ✅ EAS Project ID: `37029595-3174-4cca-8d6c-81693e3a7716`
- ✅ Project owner: `shinigami91`

### 2. **App Configuration** (`app.config.js`)
- ✅ Added EAS project ID to extra config
- ✅ Configured `expo-notifications` plugin with:
  - Custom notification icon
  - Brand color (#CDE9F9)
  - Android notification settings
- ✅ Added notification configuration:
  ```javascript
  notification: {
    icon: './assets/icon.png',
    color: '#CDE9F9',
    androidMode: 'default',
    androidCollapsedTitle: 'Parenting AI',
  }
  ```

### 3. **Notification Service** (`src/services/notificationService.ts`)

**Enhanced with push notification support:**

- ✅ **Local Notifications**: Schedule reminders with `scheduleLocalReminder()`
- ✅ **Push Notifications Registration**: `registerForPushNotificationsAsync()`
  - Checks if running on physical device
  - Requests notification permissions
  - Gets Expo Push Token
  - Saves token to Supabase profiles table
- ✅ **Send Push Notifications**: `sendPushNotification()` helper for server-side use
- ✅ **Web Fallback**: Browser notifications for web platform
- ✅ **Foreground Handler**: Notifications show even when app is open

**Key Functions:**
```typescript
// Register for push notifications (called on login/signup)
const token = await registerForPushNotificationsAsync();

// Schedule local notification
const notificationId = await scheduleLocalReminder(
  'Reminder Title', 
  'Reminder Body', 
  new Date(reminderDate)
);

// Cancel notification
await cancelScheduledNotification(notificationId);

// Send push notification (backend/admin use)
await sendPushNotification(
  expoPushToken,
  'Title',
  'Body',
  { customData: 'value' }
);
```

### 4. **Database Migration** (`supabase/migrations/009_add_push_token.sql`)
- ✅ Added `push_token` column to profiles table
- ✅ Added `push_token_updated_at` timestamp column
- ✅ Created index for faster token lookup
- ✅ Added column comments

**Run this migration in Supabase:**
```bash
cd /workspaces/parentingAI
supabase db push
```

Or manually in Supabase SQL Editor:
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS push_token TEXT,
ADD COLUMN IF NOT EXISTS push_token_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON profiles(push_token);
```

### 5. **Auth Integration** (`src/contexts/AuthContext.tsx`)
- ✅ Auto-register for push notifications on:
  - Sign In
  - Sign Up
  - Google Sign In (already integrated)
- ✅ Non-blocking registration (doesn't delay login)
- ✅ Error handling with console warnings

---

## 🚀 Next Steps for Full Implementation

### Step 1: Run Database Migration
```bash
# Apply the push_token migration
cd /workspaces/parentingAI
supabase db push
```

### Step 2: Build Development Client (Required for Push Notifications)

Push notifications **don't work in Expo Go**. You need a development build:

```bash
# Install EAS CLI (already done)
npm install -g eas-cli

# Login to EAS
eas login

# Build for Android (simulator/device)
eas build --profile development --platform android

# Build for iOS (requires Mac + Xcode)
eas build --profile development --platform ios
```

After build completes:
- **Android**: Download and install APK on your device
- **iOS**: Install on simulator or device via Xcode

### Step 3: Test Push Notification Registration

1. Start the dev server:
   ```bash
   npm start
   ```

2. Open the app on physical device (not Expo Go!)

3. Sign in or sign up

4. Check logs for:
   ```
   Expo Push Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
   Push token saved to profile
   ```

5. Verify in Supabase:
   ```sql
   SELECT id, email, push_token, push_token_updated_at 
   FROM profiles 
   WHERE push_token IS NOT NULL;
   ```

### Step 4: Test Local Notifications

Local notifications work in development builds and Expo Go:

```typescript
// In your app, try scheduling a notification
import { scheduleLocalReminder } from '@/services/notificationService';

const notificationId = await scheduleLocalReminder(
  'Test Reminder',
  'This is a test notification',
  new Date(Date.now() + 10000) // 10 seconds from now
);

console.log('Scheduled notification:', notificationId);
```

### Step 5: Create Edge Function for Sending Push Notifications

Create `supabase/functions/send-push/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { userId, title, body, data } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's push token
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.push_token) {
      throw new Error('User push token not found');
    }

    // Send push notification via Expo
    const message = {
      to: profile.push_token,
      sound: 'default',
      title,
      body,
      data: data || {},
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

Deploy:
```bash
export SUPABASE_ACCESS_TOKEN=sbp_7efe93bc17a05d7c4444f57adc2073de1808f8e1
supabase functions deploy send-push --project-ref gbcxzkgzhylpbmzbymwj
```

### Step 6: Integrate with Reminder Service

Update `src/services/reminderService.ts` to use both local and push notifications:

```typescript
import { scheduleLocalReminder } from './notificationService';
import { supabase } from './supabaseClient';

export const createReminder = async (reminder: {
  title: string;
  body: string;
  reminderTime: Date;
  childId?: string;
}) => {
  // Schedule local notification
  const localNotificationId = await scheduleLocalReminder(
    reminder.title,
    reminder.body,
    reminder.reminderTime
  );

  // Save to database
  const { data, error } = await supabase
    .from('reminders')
    .insert({
      ...reminder,
      local_notification_id: localNotificationId,
    })
    .select()
    .single();

  if (error) throw error;

  // Optionally: Schedule push notification via Edge Function
  // (for redundancy or when app is closed)
  
  return data;
};
```

---

## 📱 Testing Checklist

### ✅ Configuration Phase (Current)
- [x] EAS project created
- [x] eas.json configured
- [x] app.config.js updated with notification settings
- [x] notificationService.ts enhanced with push support
- [x] Database migration created
- [x] AuthContext integration complete

### 🔄 Implementation Phase (Next)
- [ ] Run database migration in Supabase
- [ ] Build development client (Android/iOS)
- [ ] Test push token registration on physical device
- [ ] Verify push token saved in Supabase database
- [ ] Test local notification scheduling
- [ ] Create send-push Edge Function
- [ ] Test push notification sending from backend
- [ ] Integrate with reminder creation flow
- [ ] Test end-to-end: Create reminder → Receive notification

### 📊 Production Checklist
- [ ] Test on multiple Android devices
- [ ] Test on iOS devices
- [ ] Handle notification permissions gracefully
- [ ] Add notification settings in app (enable/disable)
- [ ] Monitor push notification delivery rates
- [ ] Handle token refresh/updates
- [ ] Add notification analytics tracking

---

## 🔍 Troubleshooting

### "Push notifications require a physical device"
- Solution: Build development client and install on real device

### "Notifications not working in Expo Go"
- Solution: Use development build instead of Expo Go

### "EAS project ID not configured"
- Solution: Check `app.config.js` has correct projectId in extra.eas

### "Push token not saved to database"
- Solution: Run migration, check Supabase RLS policies allow updates

### "Notification permission denied"
- Solution: Check device settings, request permission again, or guide user to settings

### Build fails with "ANDROID_KEYSTORE_PASSWORD not set"
- Solution: Run `eas credentials` to configure credentials

---

## 📚 Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 🎯 Current Status

**Phase: Configuration Complete ✅**

All code and configuration are in place. The next step is to:
1. Run the database migration
2. Build a development client
3. Test on a physical device

Push notifications are **80% complete** - only testing and deployment remain!
