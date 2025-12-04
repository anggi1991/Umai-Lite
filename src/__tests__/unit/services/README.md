# 🔬 Unit Tests - Services

**Purpose:** Unit tests for service layer functions  
**Coverage:** 11/21 services (52%)  
**Status:** ✅ 115 tests passing

---

## 📁 Service Tests

### ✅ Tested Services (11)

1. **activityService.test.ts** - Activity tracking (feeding, sleep, diaper)
2. **adService.test.ts** - AdMob integration
3. **analyticsService.test.ts** - Analytics tracking
4. **badgeService.test.ts** - Badge/achievement system
5. **chatService.test.ts** - AI chat functionality
6. **mediaService.test.ts** - Media upload/download
7. **notificationService.test.ts** - Push notifications
8. **referralService.test.ts** - Referral program
9. **revenueCatService.test.ts** - Subscription management
10. **subscriptionService.test.ts** - Subscription logic
11. **usageLimitService.test.ts** - Usage limit tracking

---

### ❌ Missing Tests (10 services need tests)

**HIGH Priority:**
- `authService.ts` - Authentication (Google OAuth, Email)
- `growthService.ts` - Growth tracking (height, weight)
- `preferenceService.ts` - User preferences

**MEDIUM Priority:**
- `reminderService.ts` - Custom reminders
- `statisticsService.ts` - Statistics calculations
- `childService.ts` - Child management
- `profileService.ts` - User profiles

**LOW Priority:**
- `emailService.ts` - Email sending
- `storageService.ts` - Supabase storage
- `translationService.ts` - i18n utilities

---

## 🎯 Test Guidelines

### Service Test Structure

```typescript
describe('ServiceName', () => {
  describe('functionName', () => {
    it('should handle success case', async () => {
      // Test happy path
    });

    it('should handle error case', async () => {
      // Test error handling
    });

    it('should validate input', async () => {
      // Test input validation
    });
  });
});
```

---

### Mocking Supabase

```typescript
import { supabase } from '@/services/supabaseClient';

jest.mock('@/services/supabaseClient');

const mockSupabase = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({ data: [], error: null }),
    insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
    update: jest.fn().mockResolvedValue({ data: {}, error: null }),
    delete: jest.fn().mockResolvedValue({ data: {}, error: null }),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  }),
};

(supabase.from as jest.Mock) = mockSupabase.from;
```

---

### Mocking External APIs

```typescript
// Mock Azure OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'AI response' } }],
        }),
      },
    },
  })),
}));

// Mock RevenueCat
jest.mock('react-native-purchases', () => ({
  configure: jest.fn(),
  getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: {} }),
}));
```

---

## 📊 Coverage by Service

| Service | Tests | Coverage | Status |
|---------|-------|----------|--------|
| activityService | 12 | 85% | ✅ Good |
| adService | 8 | 75% | ✅ Good |
| analyticsService | 10 | 80% | ✅ Good |
| badgeService | 9 | 70% | 🟡 Needs improvement |
| chatService | 11 | 82% | ✅ Good |
| mediaService | 10 | 78% | ✅ Good |
| notificationService | 8 | 72% | 🟡 Needs improvement |
| referralService | 9 | 74% | 🟡 Needs improvement |
| revenueCatService | 15 | 90% | ✅ Excellent |
| subscriptionService | 13 | 88% | ✅ Excellent |
| usageLimitService | 10 | 85% | ✅ Good |

**Average Coverage:** 78%  
**Target:** 80%

---

## 🚀 Running Service Tests

```bash
# All service tests
npm test -- unit/services

# Specific service
npm test -- activityService
npm test -- revenueCatService

# Watch mode
npm test -- unit/services --watch

# Coverage
npm test -- unit/services --coverage
```

---

## ✅ Adding New Service Tests

**Steps:**
1. Create `serviceName.test.ts` in this folder
2. Import service functions to test
3. Mock external dependencies (Supabase, APIs)
4. Write test cases (success, error, validation)
5. Run tests: `npm test -- serviceName`
6. Verify coverage: `npm test -- serviceName --coverage`

---

**Last Updated:** November 16, 2025  
**Test Files:** 11  
**Test Cases:** 115  
**Pass Rate:** 100%
