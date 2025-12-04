# <!-- Moved from root path: /TESTING_GUIDE_AUTO_ASSIGN.md on 2025-11-11. Consolidated into docs/data-sync/. -->
# Testing Guide Auto Assign

# 🧪 Testing Guide: Auto-Assign child_id Solution

## 📋 Overview

Comprehensive testing guide untuk memastikan solusi auto-assign child_id berfungsi dengan benar di semua skenario.

---

## 🎯 Test Scenarios

### Test Case 1: User dengan 1 Child
**Objective:** Verify auto-assign ke single child

**Setup:**
```sql
-- Create test user
INSERT INTO profiles (id, email) 
VALUES ('test-user-1', 'test1@example.com');

-- Create 1 child
INSERT INTO children (id, user_id, name, created_at)
VALUES ('child-1', 'test-user-1', 'Baby A', NOW());
```

**Test Steps:**
1. Login sebagai test-user-1
2. Create activity tanpa pilih child:
   ```typescript
   const activity = await createActivity('test-user-1', {
     type: 'sleep',
     startTime: new Date().toISOString()
   });
   ```
3. **Expected Result:**
   - `activity.child_id === 'child-1'`
   - `activity.metadata.auto_assigned === true`
   - Log: `[AUTO-ASSIGN] Using first child child-1 for user test-user-1`

**Cleanup:**
```sql
DELETE FROM activities WHERE user_id = 'test-user-1';
DELETE FROM children WHERE user_id = 'test-user-1';
DELETE FROM profiles WHERE id = 'test-user-1';
```

---

### Test Case 2: User dengan Multiple Children
**Objective:** Verify auto-assign ke oldest child (by created_at)

**Setup:**
```sql
INSERT INTO profiles (id, email) 
VALUES ('test-user-2', 'test2@example.com');

INSERT INTO children (id, user_id, name, created_at) VALUES
('child-2a', 'test-user-2', 'First Born', '2023-01-01 00:00:00'),
('child-2b', 'test-user-2', 'Second Born', '2024-01-01 00:00:00');
```

**Test Steps:**
1. Create activity tanpa child_id
2. **Expected Result:**
   - `activity.child_id === 'child-2a'` (oldest)
   - Auto-assigned flag true

---

### Test Case 3: User dengan Default Child
**Objective:** Verify default_child_id preference

**Setup:**
```sql
INSERT INTO profiles (id, email, default_child_id) 
VALUES ('test-user-3', 'test3@example.com', 'child-3b');

INSERT INTO children (id, user_id, name, created_at) VALUES
('child-3a', 'test-user-3', 'First Born', '2023-01-01 00:00:00'),
('child-3b', 'test-user-3', 'Second Born', '2024-01-01 00:00:00');
```

**Test Steps:**
1. Create activity tanpa child_id
2. **Expected Result:**
   - `activity.child_id === 'child-3b'` (default child, NOT oldest)
   - Log mentions default child
   - Auto-assigned flag true

---

### Test Case 4: Explicit child_id
**Objective:** Verify explicit child_id always wins

**Setup:**
```sql
INSERT INTO profiles (id, email, default_child_id) 
VALUES ('test-user-4', 'test4@example.com', 'child-4a');

INSERT INTO children (id, user_id, name, created_at) VALUES
('child-4a', 'test-user-4', 'Default Child', NOW()),
('child-4b', 'test-user-4', 'Other Child', NOW());
```

**Test Steps:**
1. Create activity dengan explicit child_id:
   ```typescript
   const activity = await createActivity('test-user-4', {
     type: 'feeding',
     child_id: 'child-4b', // Explicit
     startTime: new Date().toISOString()
   });
   ```
2. **Expected Result:**
   - `activity.child_id === 'child-4b'` (NOT default_child_id)
   - `activity.metadata.auto_assigned === undefined` (NOT auto-assigned)
   - No auto-assign log

---

### Test Case 5: User tanpa Children
**Objective:** Verify NULL acceptable untuk user baru

**Setup:**
```sql
INSERT INTO profiles (id, email) 
VALUES ('test-user-5', 'test5@example.com');
-- NO CHILDREN
```

**Test Steps:**
1. Create activity tanpa child_id
2. **Expected Result:**
   - `activity.child_id === null`
   - `activity.metadata.auto_assigned === undefined`
   - Log: `[AUTO-ASSIGN] No children found for user test-user-5`

---

### Test Case 6: Database Trigger Bypass
**Objective:** Verify trigger catches direct SQL inserts

**Setup:**
```sql
INSERT INTO profiles (id, email) 
VALUES ('test-user-6', 'test6@example.com');

INSERT INTO children (id, user_id, name, created_at)
VALUES ('child-6', 'test-user-6', 'Baby', NOW());
```

**Test Steps:**
1. Insert activity langsung via SQL (bypass API):
   ```sql
   INSERT INTO activities (id, user_id, type, start_time, child_id)
   VALUES (gen_random_uuid(), 'test-user-6', 'sleep', NOW(), NULL);
   ```
2. **Expected Result:**
   - child_id otomatis terisi 'child-6' by trigger
   - metadata contains trigger info
   - NOTICE message di database logs

**Verify:**
```sql
SELECT child_id, metadata 
FROM activities 
WHERE user_id = 'test-user-6'
ORDER BY created_at DESC 
LIMIT 1;
```

---

### Test Case 7: Child Delete Reassignment
**Objective:** Verify activities reassigned saat child di-delete

**Setup:**
```sql
INSERT INTO profiles (id, email) 
VALUES ('test-user-7', 'test7@example.com');

INSERT INTO children (id, user_id, name, created_at) VALUES
('child-7a', 'test-user-7', 'To Be Deleted', '2023-01-01'),
('child-7b', 'test-user-7', 'Will Remain', '2024-01-01');

INSERT INTO activities (id, user_id, child_id, type, start_time) VALUES
(gen_random_uuid(), 'test-user-7', 'child-7a', 'sleep', NOW()),
(gen_random_uuid(), 'test-user-7', 'child-7a', 'feeding', NOW());
```

**Test Steps:**
1. Delete child-7a:
   ```sql
   DELETE FROM children WHERE id = 'child-7a';
   ```
2. **Expected Result:**
   - Activities dari child-7a → Reassigned ke child-7b
   - `metadata.reassigned_from === 'child-7a'`
   - `metadata.reassigned_at` terisi
   - NOTICE message di logs

**Verify:**
```sql
SELECT child_id, metadata->>'reassigned_from' as from_child
FROM activities
WHERE user_id = 'test-user-7';
```

---

### Test Case 8: Last Child Delete
**Objective:** Verify unlink flag saat last child deleted

**Setup:**
```sql
INSERT INTO profiles (id, email) 
VALUES ('test-user-8', 'test8@example.com');

INSERT INTO children (id, user_id, name)
VALUES ('child-8', 'test-user-8', 'Only Child');

INSERT INTO activities (id, user_id, child_id, type, start_time)
VALUES (gen_random_uuid(), 'test-user-8', 'child-8', 'sleep', NOW());
```

**Test Steps:**
1. Delete last child:
   ```sql
   DELETE FROM children WHERE id = 'child-8';
   ```
2. **Expected Result:**
   - Activity child_id set to NULL
   - `metadata.unlinked === true`
   - `metadata.unlinked_from === 'child-8'`
   - `metadata.unlinked_at` terisi

**Verify:**
```sql
SELECT child_id, metadata->>'unlinked' as unlinked
FROM activities
WHERE user_id = 'test-user-8';
```

---

### Test Case 9: Migration Script
**Objective:** Verify migration fixes existing NULL data

**Setup:**
```sql
-- Create test data dengan NULL child_id
INSERT INTO profiles (id, email) 
VALUES ('test-user-9', 'test9@example.com');

INSERT INTO children (id, user_id, name, created_at)
VALUES ('child-9', 'test-user-9', 'Baby', NOW());

INSERT INTO activities (id, user_id, child_id, type, start_time) VALUES
(gen_random_uuid(), 'test-user-9', NULL, 'sleep', NOW()),
(gen_random_uuid(), 'test-user-9', NULL, 'feeding', NOW());
```

**Test Steps:**
1. Run migration script:
   ```bash
   supabase db execute --file scripts/migrate-assign-child-id.sql
   ```
2. **Expected Result:**
   - Backup table created: `activities_backup_20250111`
   - Both activities updated: `child_id = 'child-9'`
   - `metadata.migrated === true`
   - `metadata.migrated_at` terisi
   - NOTICE messages confirm update

**Verify:**
```sql
-- Check backup
SELECT COUNT(*) FROM activities_backup_20250111;

-- Check migrated activities
SELECT child_id, metadata->>'migrated'
FROM activities
WHERE user_id = 'test-user-9';
```

---

### Test Case 10: Preference API
**Objective:** Verify userPreferencesService functions

**Test Steps:**

#### 10a: Set Default Child
```typescript
await setDefaultChild('test-user-10', 'child-10a');
```
**Expected:**
- profiles.default_child_id updated
- Next activity uses this child

#### 10b: Get Default Child
```typescript
const defaultChild = await getDefaultChild('test-user-10');
```
**Expected:**
- Returns 'child-10a'

#### 10c: Clear Default Child
```typescript
await clearDefaultChild('test-user-10');
```
**Expected:**
- profiles.default_child_id = NULL
- Next activity falls back to first child

---

## 📊 Performance Tests

### Test P1: Query Performance dengan Index
**Objective:** Verify indexes optimize queries

**Test:**
```sql
EXPLAIN ANALYZE
SELECT * FROM activities
WHERE child_id = 'some-child-id'
ORDER BY start_time DESC
LIMIT 20;
```

**Expected:**
- Uses index scan (NOT seq scan)
- Execution time < 10ms
- Rows fetched matches actual rows

---

### Test P2: Trigger Performance
**Objective:** Ensure trigger doesn't slow inserts significantly

**Test:**
```sql
-- Benchmark 100 inserts dengan trigger
\timing on

DO $$
BEGIN
  FOR i IN 1..100 LOOP
    INSERT INTO activities (id, user_id, type, start_time)
    VALUES (gen_random_uuid(), 'test-user', 'sleep', NOW());
  END LOOP;
END $$;
```

**Expected:**
- Total time < 1 second
- Average < 10ms per insert

---

## 🔍 Edge Case Tests

### Edge Case 1: Concurrent Inserts
**Scenario:** Multiple activities created simultaneously

**Test:** Run createActivity() 5x in parallel
```typescript
await Promise.all([
  createActivity(userId, { type: 'sleep', startTime: new Date() }),
  createActivity(userId, { type: 'feeding', startTime: new Date() }),
  createActivity(userId, { type: 'diaper', startTime: new Date() }),
  createActivity(userId, { type: 'play', startTime: new Date() }),
  createActivity(userId, { type: 'bath', startTime: new Date() })
]);
```

**Expected:**
- All activities get same child_id (consistent)
- No race conditions
- All complete successfully

---

### Edge Case 2: Invalid default_child_id
**Scenario:** Profile has default_child_id yang tidak exist

**Setup:**
```sql
UPDATE profiles 
SET default_child_id = 'non-existent-child-id'
WHERE id = 'test-user';
```

**Expected:**
- Falls back to first child
- Warning log generated
- No error thrown

---

### Edge Case 3: Child Deleted Mid-Flight
**Scenario:** Child deleted while activity being created

**Test:**
1. Start createActivity()
2. DELETE child during execution
3. **Expected:**
   - Activity creation still succeeds
   - Either uses deleted child_id (if already assigned) OR
   - Falls back to another child OR
   - NULL if no alternatives

---

## ✅ Acceptance Criteria

All tests must pass before deployment:

### Functional Requirements
- [ ] Test 1-5: Auto-assign logic works correctly
- [ ] Test 6: Database trigger catches all inserts
- [ ] Test 7-8: Child delete cascade works
- [ ] Test 9: Migration script updates old data
- [ ] Test 10: Preference API functions work

### Performance Requirements
- [ ] P1: Queries use indexes (< 10ms)
- [ ] P2: Trigger overhead acceptable (< 10ms per insert)

### Edge Cases
- [ ] EC1: Concurrent inserts handled
- [ ] EC2: Invalid default_child_id handled gracefully
- [ ] EC3: Race conditions prevented

### Data Integrity
- [ ] No orphaned activities (all have valid child_id or justified NULL)
- [ ] Backup table created successfully
- [ ] Rollback works if needed
- [ ] Metadata tracking accurate

---

## 🚀 Testing Workflow

### Pre-Deployment Testing
1. **Local Testing** (Development Database)
   - Run all test cases 1-10
   - Verify edge cases
   - Test rollback procedure

2. **Staging Testing** (Staging Database)
   - Run migration on staging data
   - Verify production-like volume
   - Monitor performance

3. **User Acceptance Testing**
   - Create child from UI
   - Add activities without selecting child
   - Verify auto-assignment works
   - Test default child preference

### Post-Deployment Monitoring
1. **First 24 Hours**
   - Monitor error logs
   - Check auto-assign success rate
   - Verify no NULL child_ids where children exist

2. **Week 1**
   - Analyze performance metrics
   - Check user feedback
   - Verify data consistency

---

## 📝 Test Checklist

### Manual Testing
- [ ] Create activity tanpa child → auto-assigned
- [ ] Create activity dengan child → uses explicit
- [ ] Set default child → next activity uses default
- [ ] Delete child → activities reassigned
- [ ] Run migration → NULL data updated

### Automated Testing
- [ ] Unit tests: activityService.createActivity()
- [ ] Unit tests: userPreferencesService functions
- [ ] Integration tests: database triggers
- [ ] E2E tests: full user flow

### Database Testing
- [ ] Trigger executes on INSERT
- [ ] Cascade executes on DELETE
- [ ] Indexes used in queries
- [ ] Migration script runs cleanly

---

## 🎯 Success Metrics

**Target KPIs:**
- ✅ 0% NULL child_id where children exist
- ✅ 100% auto-assign success rate
- ✅ < 10ms query performance
- ✅ 0 data loss during migration
- ✅ 100% rollback success (if needed)

---

## 📞 Support

**Issues Found?**
1. Check logs: Application + Database
2. Run verification queries
3. If needed, execute rollback
4. Report to development team

**Testing Questions?**
- Review `/PRODUCTION_GRADE_SOLUTION.md`
- Check `/AUTO_ASSIGN_CHILD_ID_SOLUTION.md`
- Consult development team

---

**Last Updated:** 11 Januari 2025  
**Version:** 1.0  
**Status:** Ready for Testing 🧪
