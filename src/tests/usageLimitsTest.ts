/**
 * Usage Limits & Monetization Test Script
 * 
 * Tests usage limits, referral codes, and badge system
 * Run this through Test Analytics screen or programmatically
 */

import {
  checkAndIncrementUsage,
  getUsageStatus,
  FeatureType,
  UsageLimitService,
} from '../services/usageLimitService';

import {
  ReferralService,
} from '../services/referralService';

import {
  BadgeService,
} from '../services/badgeService';

import { supabase } from '../services/supabaseClient';

/**
 * Test Result Interface
 */
interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  duration: number;
}

/**
 * Helper to run a test with timing
 */
const runTest = async (
  testName: string,
  testFn: () => Promise<void>
): Promise<TestResult> => {
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    return {
      testName,
      passed: true,
      message: 'Test passed',
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      testName,
      passed: false,
      message: error instanceof Error ? error.message : String(error),
      duration,
    };
  }
};

/**
 * Test 1: Initial Usage Status (Free Tier)
 */
const testInitialUsageStatus = async () => {
  console.log('📝 Test 1: Initial usage status...');
  
  const status = await getUsageStatus('ai_tips');
  
  if (!status) {
    throw new Error('Usage status is null');
  }
  
  if (status.limit !== 3) {
    throw new Error(`Expected limit 3, got ${status.limit}`);
  }
  
  if (typeof status.current_count !== 'number') {
    throw new Error('current_count should be a number');
  }
  
  if (typeof status.remaining !== 'number') {
    throw new Error('remaining should be a number');
  }
  
  console.log('✅ Initial status:', status);
};

/**
 * Test 2: Increment Usage
 */
const testIncrementUsage = async () => {
  console.log('📝 Test 2: Increment usage...');
  
  // Reset first to ensure clean state
  await UsageLimitService.resetUsage('ai_tips');
  
  // Get initial status
  const initialStatus = await getUsageStatus('ai_tips');
  if (!initialStatus) throw new Error('Initial status is null');
  
  const initialCount = initialStatus.current_count;
  
  // Increment usage
  const result = await checkAndIncrementUsage('ai_tips');
  
  if (result.status.current_count !== initialCount + 1) {
    throw new Error(
      `Expected count ${initialCount + 1}, got ${result.status.current_count}`
    );
  }
  
  console.log('✅ Usage incremented:', result.status);
};

/**
 * Test 3: Limit Reached
 */
const testLimitReached = async () => {
  console.log('📝 Test 3: Limit reached...');
  
  // Reset first
  await UsageLimitService.resetUsage('ai_tips');
  
  // Use up all attempts (free tier = 3)
  await checkAndIncrementUsage('ai_tips');
  await checkAndIncrementUsage('ai_tips');
  await checkAndIncrementUsage('ai_tips');
  
  // Next attempt should be blocked
  const result = await checkAndIncrementUsage('ai_tips');
  
  if (result.allowed === true) {
    throw new Error('Expected limit to be reached, but usage was still allowed');
  }
  
  console.log('✅ Limit reached as expected:', result.status);
};

/**
 * Test 4: Get Usage Status After Limit
 */
const testUsageStatusAfterLimit = async () => {
  console.log('📝 Test 4: Usage status after limit...');
  
  const status = await getUsageStatus('ai_tips');
  
  if (!status) {
    throw new Error('Usage status is null');
  }
  
  if (status.remaining !== 0) {
    throw new Error(`Expected remaining 0, got ${status.remaining}`);
  }
  
  if (status.current_count !== status.limit) {
    throw new Error(
      `Expected count ${status.limit}, got ${status.current_count}`
    );
  }
  
  console.log('✅ Status after limit:', status);
};

/**
 * Test 5: Referral Code Generation
 */
const testReferralCodeGeneration = async () => {
  console.log('📝 Test 5: Referral code generation...');
  
  const code = await ReferralService.generateReferralCode();
  
  if (!code) {
    throw new Error('Referral code is null');
  }
  
  if (code.length !== 8) {
    throw new Error(`Expected 8-char code, got ${code.length} chars`);
  }
  
  if (!/^[A-Z0-9]{8}$/.test(code)) {
    throw new Error(`Invalid code format: ${code}`);
  }
  
  console.log('✅ Referral code generated:', code);
};

/**
 * Test 6: Get Referral Stats
 */
const testReferralStats = async () => {
  console.log('📝 Test 6: Referral stats...');
  
  const stats = await ReferralService.getReferralStats();
  
  if (!stats) {
    throw new Error('Referral stats is null');
  }
  
  if (typeof stats.total_referrals !== 'number') {
    throw new Error('total_referrals should be a number');
  }
  
  if (typeof stats.completed_referrals !== 'number') {
    throw new Error('completed_referrals should be a number');
  }
  
  if (typeof stats.pending_referrals !== 'number') {
    throw new Error('pending_referrals should be a number');
  }
  
  console.log('✅ Referral stats:', stats);
};

/**
 * Test 7: Badge System
 */
const testBadgeSystem = async () => {
  console.log('📝 Test 7: Badge system...');
  
  // Check and award badges
  await BadgeService.checkAndAwardBadges();
  
  // Get user badges
  const badges = await BadgeService.getUserBadges();
  
  if (!Array.isArray(badges)) {
    throw new Error('Badges should be an array');
  }
  
  console.log(`✅ User has ${badges.length} badge(s)`);
};

/**
 * Test 8: Cleanup Test Data
 */
const testCleanup = async () => {
  console.log('📝 Test 8: Cleanup test data...');
  
  // Reset usage limits
  await UsageLimitService.resetUsage('ai_tips');
  await UsageLimitService.resetUsage('chat_messages');
  
  console.log('✅ Test data cleaned up');
};

/**
 * Run all usage limits tests
 */
export const runUsageLimitsTests = async (): Promise<{
  results: TestResult[];
  passed: number;
  failed: number;
  totalDuration: number;
}> => {
  console.log('🚀 Running Usage Limits & Monetization Tests...\n');
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to run tests');
  }
  
  console.log(`👤 Testing as user: ${user.email}\n`);
  
  const tests = [
    { name: 'Test 1: Initial Usage Status', fn: testInitialUsageStatus },
    { name: 'Test 2: Increment Usage', fn: testIncrementUsage },
    { name: 'Test 3: Limit Reached', fn: testLimitReached },
    { name: 'Test 4: Usage Status After Limit', fn: testUsageStatusAfterLimit },
    { name: 'Test 5: Referral Code Generation', fn: testReferralCodeGeneration },
    { name: 'Test 6: Referral Stats', fn: testReferralStats },
    { name: 'Test 7: Badge System', fn: testBadgeSystem },
    { name: 'Test 8: Cleanup Test Data', fn: testCleanup },
  ];
  
  const results: TestResult[] = [];
  
  for (const test of tests) {
    const result = await runTest(test.name, test.fn);
    results.push(result);
    
    if (result.passed) {
      console.log(`✅ ${test.name} - PASSED (${result.duration}ms)\n`);
    } else {
      console.log(`❌ ${test.name} - FAILED (${result.duration}ms)`);
      console.log(`   Error: ${result.message}\n`);
    }
  }
  
  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Monetization infrastructure is working correctly.\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review errors above.\n');
  }
  
  return {
    results,
    passed,
    failed,
    totalDuration,
  };
};

/**
 * Export individual test functions
 */
export default {
  testInitialUsageStatus,
  testIncrementUsage,
  testLimitReached,
  testUsageStatusAfterLimit,
  testReferralCodeGeneration,
  testReferralStats,
  testBadgeSystem,
  testCleanup,
  runUsageLimitsTests,
};
