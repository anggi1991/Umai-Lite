# 🧪 Test Suite

**Purpose:** Comprehensive test suite for Parenting AI Assistant  
**Framework:** Jest + React Native Testing Library  
**Last Updated:** November 16, 2025

---

## 📁 Test Structure

```
src/__tests__/
├── unit/                   ← Unit tests (isolated component/function tests)
│   ├── services/          ← Service layer tests (11 files)
│   ├── hooks/             ← Custom React hooks tests
│   ├── utils/             ← Utility function tests
│   └── components/        ← UI component tests
├── integration/           ← Integration tests (cross-module tests)
│   └── monetization.integration.test.ts
└── e2e/                   ← End-to-end tests (future)
```

---

## 🎯 Test Categories

### Unit Tests (`/unit/`)

**Purpose:** Test individual functions/components in isolation

**Guidelines:**
- Mock all external dependencies
- One file per service/component/hook
- Fast execution (<100ms per test)
- High coverage target (>80%)

**Current Coverage:**
- ✅ Services: 11/21 services (52%)
- ❌ Hooks: 0 tests (needs implementation)
- ❌ Utils: 0 tests (needs implementation)
- ❌ Components: 0 tests (needs implementation)

---

### Integration Tests (`/integration/`)

**Purpose:** Test interactions between multiple modules

**Guidelines:**
- Test real interactions (minimal mocking)
- Focus on critical user flows
- Acceptable execution time (<5s per test)
- Cover main feature workflows

**Current Coverage:**
- ✅ Monetization: Complete (RevenueCat + Usage Limits)
- ❌ Chat AI: Needs tests
- ❌ Growth Tracker: Needs tests
- ❌ Activities: Needs tests

---

### E2E Tests (`/e2e/` - Future)

**Purpose:** Test complete user journeys

**Planned Tools:**
- Detox for React Native
- Maestro for mobile testing

---

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# Unit tests only
npm test -- unit/

# Integration tests only
npm test -- integration/

# Specific service tests
npm test -- activityService
npm test -- revenueCatService
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm test -- --coverage
```

---

## 📊 Test Statistics

**Total Test Files:** 12  
**Total Test Cases:** 127  
**Pass Rate:** 100% (127/127 passing)  
**Coverage:** 65% (Target: 80%)

**Breakdown by Category:**
- Unit Tests (Services): 11 files, 115 test cases
- Integration Tests: 1 file, 12 test cases
- E2E Tests: 0 files (planned)

---

## ✅ Writing New Tests

### Unit Test Template (Service)

```typescript
import { serviceFunction } from '@/services/serviceName';
import { supabase } from '@/services/supabaseClient';

// Mock dependencies
jest.mock('@/services/supabaseClient');

describe('serviceName', () => {
  describe('serviceFunction', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle success case', async () => {
      // Arrange
      const mockData = { id: '1', name: 'Test' };
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      // Act
      const result = await serviceFunction();

      // Assert
      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('table_name');
    });

    it('should handle error case', async () => {
      // Arrange
      const mockError = new Error('Database error');
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      // Act & Assert
      await expect(serviceFunction()).rejects.toThrow('Database error');
    });
  });
});
```

---

### Integration Test Template

```typescript
import { featureWorkflow } from '@/services/featureService';
import { relatedFunction } from '@/services/relatedService';

describe('Feature Integration', () => {
  it('should complete full workflow', async () => {
    // Arrange
    const userId = 'test-user';
    
    // Act
    const step1Result = await featureWorkflow(userId);
    const step2Result = await relatedFunction(step1Result.id);

    // Assert
    expect(step1Result).toBeDefined();
    expect(step2Result.status).toBe('completed');
  });
});
```

---

## 📋 Test Checklist

**Before committing tests:**
- [ ] All tests pass (`npm test`)
- [ ] No console errors or warnings
- [ ] Coverage maintained or improved
- [ ] Test names describe what they test
- [ ] Arrange-Act-Assert pattern followed
- [ ] Edge cases covered
- [ ] Error cases tested
- [ ] Mocks cleaned up (beforeEach)

---

## 🎯 Coverage Goals

**Current:** 65%  
**Target:** 80%

**Priority Areas (Need Tests):**
1. **HIGH**: Chat AI Service
2. **HIGH**: Growth Tracker Service
3. **MEDIUM**: Custom Hooks (useRevenueCat, useAuth)
4. **MEDIUM**: Utility Functions
5. **LOW**: UI Components

---

## 🐛 Debugging Tests

### Common Issues

**Issue: Test timeout**
```bash
# Increase timeout
npm test -- --testTimeout=10000
```

**Issue: Async tests fail**
```typescript
// Always await async operations
it('should work', async () => {
  await expect(asyncFunction()).resolves.toBe(expected);
});
```

**Issue: Mock not working**
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

---

## 📚 Resources

**Internal:**
- Jest Config: `/jest.config.cjs`
- Jest Setup: `/jest.setup.cjs`
- Test Examples: All files in `src/__tests__/`

**External:**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** November 16, 2025  
**Maintained By:** Development Team  
**Next Review:** December 2025
