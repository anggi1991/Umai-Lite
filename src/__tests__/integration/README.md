# 🔗 Integration Tests

**Purpose:** Test interactions between multiple modules  
**Coverage:** 1 feature (Monetization)  
**Status:** ✅ 12 tests passing

---

## 📁 Integration Test Files

### ✅ Implemented (1)

**monetization.integration.test.ts**
- RevenueCat + Supabase integration
- Usage limit enforcement
- Subscription state management
- Purchase flow validation

---

### ❌ Missing Integration Tests

**HIGH Priority:**
1. **Chat AI Integration** (Azure OpenAI + Supabase + Analytics)
   - User sends message → AI responds → Save to history
   - Session management → Token usage → Usage limits
   - Context awareness → Child profile integration

2. **Growth Tracker Integration** (Growth Service + Statistics + Charts)
   - Add growth entry → Calculate percentile → Update charts
   - Multi-child handling → Auto-assignment → Data sync

**MEDIUM Priority:**
3. **Activity Tracking Integration** (Activity + Child + Statistics)
   - Log activity → Auto-assign child → Update statistics
   - Reminder creation → Notification scheduling

4. **Authentication Flow** (Auth + Profile + Supabase)
   - Google OAuth → Create profile → Setup child
   - Email/Password → Verify email → Complete onboarding

**LOW Priority:**
5. **Media Upload Integration** (Storage + Database + Activity)
   - Upload photo → Store in Supabase → Link to activity/growth

---

## 🎯 Integration Test Guidelines

### Test Structure

```typescript
describe('Feature Integration', () => {
  // Setup before all tests
  beforeAll(async () => {
    // Initialize test environment
  });

  // Cleanup after each test
  afterEach(async () => {
    // Clean up test data
  });

  it('should complete full user workflow', async () => {
    // Arrange: Setup initial state
    const userId = 'test-user-id';
    
    // Act: Execute workflow steps
    const step1 = await service1.action(userId);
    const step2 = await service2.action(step1.id);
    const step3 = await service3.action(step2.result);

    // Assert: Verify final state
    expect(step3.status).toBe('completed');
    expect(step3.data).toBeDefined();
  });
});
```

---

### Real vs Mocked Dependencies

**Use Real:**
- ✅ Business logic (services)
- ✅ Data transformations
- ✅ Internal state management

**Use Mocks:**
- ✅ External APIs (Azure, RevenueCat)
- ✅ Database (Supabase) - use in-memory or test DB
- ✅ File system / storage
- ✅ Time-dependent functions

---

## 📊 Current Coverage

**monetization.integration.test.ts** (12 test cases):

```typescript
✓ User reaches free usage limit
✓ Premium user has unlimited access
✓ Usage resets properly
✓ Subscription state syncs with RevenueCat
✓ Failed purchase rolls back correctly
✓ Subscription expiry handled
✓ Family plan multi-user access
✓ Annual subscription discount applied
✓ Referral credit integration
✓ Badge unlock on subscription
✓ Analytics tracking on purchase
✓ Error handling across services
```

**Coverage:** Complete monetization flow

---

## 🚀 Running Integration Tests

```bash
# All integration tests
npm test -- integration/

# Specific integration test
npm test -- monetization.integration

# Watch mode
npm test -- integration/ --watch

# With coverage
npm test -- integration/ --coverage
```

---

## ✅ Writing New Integration Tests

### Example: Chat AI Integration

```typescript
// chat-ai.integration.test.ts
import { sendChatMessage } from '@/services/chatService';
import { saveToHistory } from '@/services/chatHistoryService';
import { trackUsage } from '@/services/usageLimitService';
import { logEvent } from '@/services/analyticsService';

describe('Chat AI Integration', () => {
  const userId = 'test-user';
  const childId = 'test-child';

  it('should handle complete chat workflow', async () => {
    // 1. Send message to AI
    const response = await sendChatMessage({
      userId,
      childId,
      message: 'How much milk should my 6-month-old drink?',
    });

    expect(response.message).toBeDefined();
    expect(response.sessionId).toBeDefined();

    // 2. Verify message saved to history
    const history = await getChatHistory(userId, response.sessionId);
    expect(history).toHaveLength(2); // User + AI messages

    // 3. Verify usage tracked
    const usage = await getUserUsage(userId);
    expect(usage.chat_messages_used).toBe(1);

    // 4. Verify analytics logged
    const events = await getAnalyticsEvents(userId);
    expect(events).toContainEqual(
      expect.objectContaining({ event: 'chat_message_sent' })
    );
  });

  it('should handle usage limit enforcement', async () => {
    // Arrange: User at limit
    await setUserUsage(userId, { chat_messages_used: 10 });

    // Act & Assert: Should throw usage limit error
    await expect(
      sendChatMessage({ userId, childId, message: 'Test' })
    ).rejects.toThrow('Usage limit reached');
  });
});
```

---

## 🐛 Debugging Integration Tests

### Common Issues

**Issue: Tests interfere with each other**
```typescript
// Solution: Clean up after each test
afterEach(async () => {
  await cleanupTestData(userId);
});
```

**Issue: Async timing issues**
```typescript
// Solution: Wait for all async operations
await waitFor(() => expect(condition).toBe(true));
```

**Issue: External service calls**
```typescript
// Solution: Mock external APIs
jest.mock('@/services/externalAPI');
```

---

## 📋 Integration Test Checklist

**Before committing:**
- [ ] Tests cover complete user workflow
- [ ] All async operations awaited
- [ ] Test data cleaned up
- [ ] External APIs mocked
- [ ] Error scenarios tested
- [ ] Performance acceptable (<5s per test)
- [ ] No side effects between tests

---

## 🎯 Next Steps

**Immediate Priority:**
1. Add Chat AI integration tests (HIGH)
2. Add Growth Tracker integration tests (HIGH)
3. Add Activity tracking integration tests (MEDIUM)

**Target:** 5 integration test files by Q1 2026

---

**Last Updated:** November 16, 2025  
**Test Files:** 1  
**Test Cases:** 12  
**Pass Rate:** 100%
