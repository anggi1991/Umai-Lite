/**
 * Analytics & Subscription Service Test Script
 * 
 * Run this in your app to test analytics and subscription functionality
 */

import { 
  trackAppLaunch, 
  trackScreenView, 
  trackFeatureUsage,
  trackActivityCreated,
  getDAUCount,
  getUserActivitySummary 
} from '../services/analyticsService';

import { 
  getCurrentSubscription,
  hasActiveSubscription,
  isPremiumUser,
  getSubscriptionFeatures,
  initializeFreeSubscription,
  canAccessFeature
} from '../services/subscriptionService';

/**
 * Test analytics service
 */
export const testAnalyticsService = async () => {
  console.log('🧪 Testing Analytics Service...');
  
  try {
    // Test 1: Track app launch
    console.log('Test 1: Track app launch');
    await trackAppLaunch();
    console.log('✅ App launch tracked');
    
    // Test 2: Track screen view
    console.log('Test 2: Track screen view');
    await trackScreenView('TestScreen');
    console.log('✅ Screen view tracked');
    
    // Test 3: Track feature usage
    console.log('Test 3: Track feature usage');
    await trackFeatureUsage('test_feature', { test: true });
    console.log('✅ Feature usage tracked');
    
    // Test 4: Track activity created
    console.log('Test 4: Track activity created');
    // Use a valid UUID format for testing
    await trackActivityCreated('feeding', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Activity creation tracked');
    
    // Test 5: Get DAU count
    console.log('Test 5: Get DAU count');
    const dauCount = await getDAUCount();
    console.log(`✅ DAU Count: ${dauCount}`);
    
    // Test 6: Get user activity summary
    console.log('Test 6: Get user activity summary');
    const { data: { user } } = await require('../services/supabaseClient').supabase.auth.getUser();
    if (user) {
      const summary = await getUserActivitySummary(user.id);
      console.log('✅ User Activity Summary:', summary);
    }
    
    console.log('✅ All analytics tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Analytics test failed:', error);
    return false;
  }
};

/**
 * Test subscription service
 */
export const testSubscriptionService = async () => {
  console.log('🧪 Testing Subscription Service...');
  
  try {
    // Test 1: Initialize free subscription
    console.log('Test 1: Initialize free subscription');
    await initializeFreeSubscription();
    console.log('✅ Free subscription initialized');
    
    // Test 2: Get current subscription
    console.log('Test 2: Get current subscription');
    const subscription = await getCurrentSubscription();
    console.log('✅ Current subscription:', subscription);
    
    // Test 3: Check if has active subscription
    console.log('Test 3: Check if has active subscription');
    const isActive = await hasActiveSubscription();
    console.log(`✅ Has active subscription: ${isActive}`);
    
    // Test 4: Check if premium user
    console.log('Test 4: Check if premium user');
    const premium = await isPremiumUser();
    console.log(`✅ Is premium user: ${premium}`);
    
    // Test 5: Get subscription features
    console.log('Test 5: Get subscription features');
    const features = getSubscriptionFeatures('free');
    console.log('✅ Free tier features:', features);
    
    const premiumFeatures = getSubscriptionFeatures('premium');
    console.log('✅ Premium tier features:', premiumFeatures);
    
    // Test 6: Check feature access
    console.log('Test 6: Check feature access');
    const canChat = await canAccessFeature('chat');
    const canAnalytics = await canAccessFeature('analytics');
    console.log(`✅ Can access chat: ${canChat}`);
    console.log(`✅ Can access analytics: ${canAnalytics}`);
    
    console.log('✅ All subscription tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Subscription test failed:', error);
    return false;
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🚀 Running all Analytics & Subscription tests...\n');
  
  const analyticsResult = await testAnalyticsService();
  console.log('\n');
  const subscriptionResult = await testSubscriptionService();
  
  console.log('\n📊 Test Results:');
  console.log(`Analytics: ${analyticsResult ? '✅' : '❌'}`);
  console.log(`Subscription: ${subscriptionResult ? '✅' : '❌'}`);
  
  if (analyticsResult && subscriptionResult) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Check logs above.');
  }
};

// Export individual test functions
export default {
  testAnalyticsService,
  testSubscriptionService,
  runAllTests,
};
