# Analytics & Billing Implementation Guide

## Overview

This guide covers the implementation of analytics logging and subscription management for the Parenting AI application.

## Features Implemented

### 1. Analytics Service (`src/services/analyticsService.ts`)

Provides comprehensive event tracking and user activity analytics using Supabase's `audit_logs` table.

#### Key Functions

**Event Tracking:**
- `trackAppLaunch()` - Logs app launch events
- `trackScreenView(screenName)` - Tracks screen navigation
- `trackFeatureUsage(featureName, metadata)` - Logs feature interactions
- `trackActivityCreated(activityType, activityId)` - Tracks activity creation
- `trackChatInteraction(sessionId)` - Logs chat sessions
- `trackTipViewed(tipId)` - Tracks AI tip views

**Analytics Queries:**
- `getDAUCount(date)` - Calculate Daily Active Users
- `getMAUCount(date)` - Calculate Monthly Active Users
- `getUserActivitySummary(userId, startDate, endDate)` - Get detailed user activity breakdown

#### Usage Example

```typescript
import { trackScreenView, trackFeatureUsage } from './services/analyticsService';

// Track screen view
useEffect(() => {
  trackScreenView('Dashboard');
}, []);

// Track feature usage
const handleGenerateTip = async () => {
  const tip = await generateDailyTip({});
  await trackFeatureUsage('generate_tip', { tip_id: tip.id });
};
```

### 2. Subscription Service (`src/services/subscriptionService.ts`)

Manages user subscriptions and feature access control.

#### Subscription Tiers

1. **Free Tier:**
   - Max 3 children
   - 3 AI tips per day
   - 20 chat messages per day
   - 1 GB media storage
   - No analytics access
   - No priority support

2. **Premium Tier:**
   - Max 3 children
   - 10 AI tips per day
   - 100 chat messages per day
   - 5 GB media storage
   - Analytics access
   - Priority support

3. **Family Tier:**
   - Max 5 children
   - 20 AI tips per day
   - 200 chat messages per day
   - 10 GB media storage
   - Analytics access
   - Priority support

#### Key Functions

**Subscription Management:**
- `getCurrentSubscription()` - Get user's current subscription
- `hasActiveSubscription()` - Check if subscription is active
- `isPremiumUser()` - Check if user has premium access
- `initializeFreeSubscription()` - Create free subscription for new users
- `cancelSubscription()` - Cancel active subscription
- `getDaysRemaining()` - Get days until subscription expires

**Feature Access Control:**
- `canAccessFeature(feature)` - Check if user can access specific feature
- `getSubscriptionFeatures(tier)` - Get feature limits for a tier

#### Usage Example

```typescript
import { isPremiumUser, canAccessFeature } from './services/subscriptionService';

// Check premium status
const handlePremiumFeature = async () => {
  const isPremium = await isPremiumUser();
  if (!isPremium) {
    Alert.alert('Premium Feature', 'Upgrade to Premium to access this feature');
    return;
  }
  // Continue with premium feature...
};

// Check specific feature access
const handleAnalytics = async () => {
  const canAccess = await canAccessFeature('analytics');
  if (!canAccess) {
    Alert.alert('Upgrade Required', 'Analytics is available on Premium plans');
    return;
  }
  // Show analytics...
};
```

## Integration Points

### 1. Auth Context Integration

Analytics tracking and subscription initialization happen automatically on:
- App launch
- Sign in
- Sign up

```typescript
// src/contexts/AuthContext.tsx
useEffect(() => {
  const initAuth = async () => {
    // ... auth logic
    await trackAppLaunch();
    await initializeFreeSubscription();
  };
  initAuth();
}, []);
```

### 2. Dashboard Integration

Dashboard tracks:
- Screen views on mount
- Activity creation
- Feature usage (tip generation)

```typescript
// src/screens/Dashboard/Dashboard.tsx
useEffect(() => {
  trackScreenView('Dashboard');
}, []);

const handleAddActivity = async (activityData) => {
  const newActivity = await createActivity(user.id, activityData);
  await trackActivityCreated(activityData.type, newActivity.id);
};
```

## Database Schema

### audit_logs Table

Already defined in `001_init.sql`:

```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
```

### subscriptions Table

Already defined in `001_init.sql`:

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier text CHECK (tier IN ('free', 'premium', 'family')),
  status text CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  started_at timestamptz,
  expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

## Testing

### Test Screen

A dedicated test screen (`src/screens/Test/TestAnalytics.tsx`) is available in development mode to test all analytics and subscription features.

**Access Test Screen:**
1. Run the app in development mode
2. Navigate to Dashboard
3. Click "Test" button (only visible in __DEV__ mode)
4. Run individual or all tests

**Available Tests:**
- Analytics Service Tests:
  - Track app launch
  - Track screen view
  - Track feature usage
  - Track activity creation
  - Get DAU count
  - Get user activity summary

- Subscription Service Tests:
  - Initialize free subscription
  - Get current subscription
  - Check active subscription status
  - Check premium status
  - Get subscription features
  - Check feature access

### Manual Testing

1. **Test Analytics Tracking:**
   ```bash
   # In Supabase SQL Editor, check audit_logs
   SELECT * FROM audit_logs 
   WHERE user_id = 'your-user-id' 
   ORDER BY created_at DESC;
   ```

2. **Test Subscription Creation:**
   ```bash
   # Check subscriptions table
   SELECT * FROM subscriptions 
   WHERE user_id = 'your-user-id';
   ```

3. **Test DAU/MAU:**
   ```bash
   # Get unique users for today
   SELECT COUNT(DISTINCT user_id) as dau
   FROM audit_logs
   WHERE DATE(created_at) = CURRENT_DATE;
   ```

## Best Practices

### 1. Rate Limiting

Consider implementing rate limiting for analytics to avoid excessive database writes:

```typescript
// Debounce screen view tracking
const debouncedTrackScreenView = debounce(trackScreenView, 1000);
```

### 2. Error Handling

All analytics and subscription functions include try-catch blocks and won't throw errors that break the app. Failed analytics events are logged but don't interrupt user flow.

### 3. Privacy

- Analytics data is user-scoped (RLS policies ensure users only see their own data)
- No PII is logged in analytics events beyond user_id
- Details field uses jsonb for flexible, non-sensitive metadata

### 4. Performance

- Analytics functions are async and non-blocking
- Use background processing for DAU/MAU calculations (consider server-side cron jobs)
- Index audit_logs table on user_id and created_at for fast queries

## Future Enhancements

1. **Server-Side Analytics:**
   - Create Supabase Edge Functions for DAU/MAU aggregation
   - Schedule daily/monthly analytics reports
   - Export analytics data for business intelligence

2. **Payment Integration:**
   - Integrate Stripe or similar payment processor
   - Add webhook handlers for subscription updates
   - Implement trial periods and grace periods

3. **Usage Limits:**
   - Track and enforce daily/monthly usage limits
   - Add quota management for AI tips and chat
   - Implement soft and hard limits with notifications

4. **Analytics Dashboard:**
   - Create admin dashboard for viewing analytics
   - Add charts and graphs for visualizing trends
   - Export analytics reports

## Troubleshooting

### Issue: Analytics events not appearing

1. Check RLS policies on audit_logs table
2. Verify user is authenticated
3. Check Supabase logs for errors
4. Ensure table exists (migration 001 applied)

### Issue: Subscription not initializing

1. Check if profile exists for user
2. Verify subscriptions table has correct RLS policies
3. Check if subscription already exists (function won't create duplicate)
4. Review AuthContext initialization flow

### Issue: Feature access always returns false

1. Verify subscription status is 'active' or 'trial'
2. Check expires_at date hasn't passed
3. Ensure subscription tier matches expected features
4. Review canAccessFeature logic

## Support

For issues or questions:
1. Check Supabase logs in Dashboard
2. Review test screen output
3. Check browser/React Native debugger console
4. Verify database migrations are applied

