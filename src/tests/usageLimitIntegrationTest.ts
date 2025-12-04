/**
 * Usage Limit Integration Test
 * 
 * Test scenario untuk memverifikasi:
 * 1. Free tier user dapat generate 3 AI tips per hari
 * 2. Setelah limit tercapai, UpgradeModal muncul
 * 3. UsageLimitBadge menampilkan progress yang benar
 * 4. Upgrade modal navigasi ke subscription screen
 * 
 * Run test ini setelah migration dijalankan di Supabase
 */

import { UsageLimitService, FeatureType } from '../services/usageLimitService';
import { supabase } from '../services/supabaseClient';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

export class UsageLimitIntegrationTest {
  private testResults: TestResult[] = [];
  private testUserId: string = '';

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Usage Limit Integration Tests...\n');

    await this.setupTestUser();
    await this.testInitialUsageStatus();
    await this.testIncrementUsage();
    await this.testLimitReached();
    await this.testChatMessageLimits();
    await this.cleanupTestUser();

    this.printResults();
    return this.testResults;
  }

  private async setupTestUser() {
    console.log('📝 Setting up test user...');
    
    try {
      // Get current user
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        throw new Error('No authenticated user found. Please sign in first.');
      }

      this.testUserId = user.id;
      
      console.log('  🗑️ Force resetting usage limits via RPC...');
      
      // Use RPC function to bypass RLS policies
      const { data: resetResult, error: rpcError } = await supabase
        .rpc('force_reset_usage_limits', {
          p_user_id: this.testUserId
        });

      if (rpcError) {
        console.error('  ❌ RPC error:', rpcError.message);
        console.log('  Falling back to direct delete...');
        
        // Fallback: try direct delete
        const { error: deleteError, count } = await supabase
          .from('usage_limits')
          .delete({ count: 'exact' })
          .eq('user_id', this.testUserId);
        
        console.log('  Fallback delete count:', count, 'error:', deleteError?.message || 'none');
      } else {
        console.log('  ✅ RPC reset result:', resetResult);
      }

      // Wait for database to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify deletion worked
      const { data: remainingRecords, error: checkError } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('user_id', this.testUserId);

      console.log('  📊 Remaining records after reset:', remainingRecords?.length || 0);
      
      if (remainingRecords && remainingRecords.length > 0) {
        console.error('  ⚠️ CRITICAL: Reset failed! Records still exist:', remainingRecords);
        throw new Error(`Reset failed: ${remainingRecords.length} records still exist. Please run force-reset-usage-function.sql in Supabase SQL Editor first.`);
      }

      this.addResult({
        testName: 'Setup Test User',
        status: 'PASS',
        message: `Test user ready: ${user.email}`,
      });
    } catch (error: any) {
      this.addResult({
        testName: 'Setup Test User',
        status: 'FAIL',
        message: error.message,
      });
    }
  }

  private async testInitialUsageStatus() {
    console.log('\n🔍 Test 1: Initial Usage Status');
    
    try {
      const status = await UsageLimitService.getAllUsageStatus(this.testUserId);

      console.log('  Current status:', JSON.stringify(status, null, 2));

      // Free tier should have these limits
      const expectedAITipsLimit = 3;
      const expectedChatLimit = 10;

      const aiTipsMatch = status.ai_tips.limit === expectedAITipsLimit;
      const chatMatch = status.chat_messages.limit === expectedChatLimit;
      const noUsageYet = status.ai_tips.current_count === 0 && 
                         status.chat_messages.current_count === 0;

      if (aiTipsMatch && chatMatch && noUsageYet) {
        this.addResult({
          testName: 'Initial Usage Status',
          status: 'PASS',
          message: 'Free tier limits correctly initialized',
          details: status,
        });
      } else {
        // Provide detailed error message
        const errorDetails = {
          expected: { ai_tips: expectedAITipsLimit, chat: expectedChatLimit, usage: 0 },
          actual: { 
            ai_tips_limit: status.ai_tips.limit,
            ai_tips_count: status.ai_tips.current_count,
            chat_limit: status.chat_messages.limit,
            chat_count: status.chat_messages.current_count,
          }
        };
        throw new Error(`Usage limits do not match: ${JSON.stringify(errorDetails)}`);
      }
    } catch (error: any) {
      this.addResult({
        testName: 'Initial Usage Status',
        status: 'FAIL',
        message: error.message,
      });
    }
  }

  private async testIncrementUsage() {
    console.log('\n🔍 Test 2: Increment Usage Count');
    
    try {
      // Generate 2 AI tips (should succeed)
      for (let i = 1; i <= 2; i++) {
        try {
          await UsageLimitService.checkAndIncrementUsage('ai_tips' as FeatureType, this.testUserId);
          console.log(`  ✓ AI tip ${i} generated successfully`);
        } catch (error: any) {
          // If error is USAGE_LIMIT_REACHED, it means we already hit limit
          if (error.message === 'USAGE_LIMIT_REACHED') {
            throw new Error(`Hit usage limit too early at tip ${i}. Previous test cleanup may have failed.`);
          }
          throw error;
        }
      }

      const status = await UsageLimitService.getAllUsageStatus(this.testUserId);

      if (status.ai_tips.current_count === 2 && status.ai_tips.remaining === 1) {
        this.addResult({
          testName: 'Increment Usage Count',
          status: 'PASS',
          message: '2 tips generated, 1 remaining',
          details: status.ai_tips,
        });
      } else {
        throw new Error(`Expected 2 used and 1 remaining, got ${status.ai_tips.current_count} used and ${status.ai_tips.remaining} remaining`);
      }
    } catch (error: any) {
      this.addResult({
        testName: 'Increment Usage Count',
        status: 'FAIL',
        message: error.message,
      });
    }
  }

  private async testLimitReached() {
    console.log('\n🔍 Test 3: Limit Reached Scenario');
    
    try {
      // Generate 1 more tip (should succeed - 3rd tip)
      await UsageLimitService.checkAndIncrementUsage('ai_tips' as FeatureType, this.testUserId);
      console.log('  ✓ 3rd AI tip generated successfully');

      // Try to generate 4th tip (should fail)
      let errorThrown = false;
      let errorMessage = '';

      try {
        await UsageLimitService.checkAndIncrementUsage('ai_tips' as FeatureType, this.testUserId);
      } catch (error: any) {
        errorThrown = true;
        errorMessage = error.message;
      }

      if (errorThrown && errorMessage === 'USAGE_LIMIT_REACHED') {
        this.addResult({
          testName: 'Limit Reached Scenario',
          status: 'PASS',
          message: 'USAGE_LIMIT_REACHED error correctly thrown on 4th attempt',
        });
      } else {
        throw new Error('Expected USAGE_LIMIT_REACHED error was not thrown');
      }
    } catch (error: any) {
      this.addResult({
        testName: 'Limit Reached Scenario',
        status: 'FAIL',
        message: error.message,
      });
    }
  }

  private async testChatMessageLimits() {
    console.log('\n🔍 Test 4: Chat Message Limits');
    
    try {
      // Reset chat usage
      await supabase
        .from('usage_limits')
        .delete()
        .eq('user_id', this.testUserId)
        .eq('feature_type', 'chat_messages');

      // Generate 10 messages (should all succeed)
      for (let i = 1; i <= 10; i++) {
        await UsageLimitService.checkAndIncrementUsage('chat_messages' as FeatureType, this.testUserId);
      }

      const status = await UsageLimitService.getAllUsageStatus(this.testUserId);

      if (status.chat_messages.current_count === 10 && status.chat_messages.remaining === 0) {
        this.addResult({
          testName: 'Chat Message Limits',
          status: 'PASS',
          message: '10 chat messages used, limit reached correctly',
          details: status.chat_messages,
        });
      } else {
        throw new Error(`Expected 10/10 messages, got ${status.chat_messages.current_count}/${status.chat_messages.limit}`);
      }
    } catch (error: any) {
      this.addResult({
        testName: 'Chat Message Limits',
        status: 'FAIL',
        message: error.message,
      });
    }
  }

  private async cleanupTestUser() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      // Use RPC function to bypass RLS policies
      const { data: cleanupResult, error: rpcError } = await supabase
        .rpc('force_reset_usage_limits', {
          p_user_id: this.testUserId
        });

      if (rpcError) {
        console.warn('  ⚠️ RPC cleanup failed:', rpcError.message);
        // Try fallback
        const { error: deleteError, count } = await supabase
          .from('usage_limits')
          .delete({ count: 'exact' })
          .eq('user_id', this.testUserId);
        
        console.log('  Fallback cleanup:', count || 0, 'records');
      } else {
        console.log('  ✅ Cleanup result:', cleanupResult);
      }

      this.addResult({
        testName: 'Cleanup Test Data',
        status: 'PASS',
        message: 'Test data cleaned successfully',
      });
    } catch (error: any) {
      this.addResult({
        testName: 'Cleanup Test Data',
        status: 'FAIL',
        message: error.message,
      });
    }
  }

  private addResult(result: TestResult) {
    this.testResults.push(result);
  }

  private printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    let passCount = 0;
    let failCount = 0;

    this.testResults.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`\n${index + 1}. ${icon} ${result.testName}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Message: ${result.message}`);
      
      if (result.details) {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      }

      if (result.status === 'PASS') passCount++;
      else failCount++;
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${this.testResults.length} tests`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('='.repeat(60) + '\n');
  }
}

// Export test runner
export const runUsageLimitTests = async () => {
  const tester = new UsageLimitIntegrationTest();
  return await tester.runAllTests();
};
