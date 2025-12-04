# <!-- Moved from root path: /DEPLOYMENT_CHECKLIST.md on 2025-11-11. Consolidated into docs/references/ops/. -->
# Deployment Checklist

# 🚀 Deployment Checklist: Auto-Assign child_id Solution

## 📋 Pre-Deployment

### 1. Code Review
- [x] All TypeScript files compile without errors
- [x] ESLint passes with no warnings
- [x] Code follows project conventions
- [x] All functions documented
- [ ] Peer review completed
- [ ] Security review passed

### 2. Testing Completed
- [ ] All unit tests pass (see `TESTING_GUIDE_AUTO_ASSIGN.md`)
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Performance tests acceptable
- [ ] User acceptance testing done

### 3. Database Preparation
- [ ] Backup strategy confirmed
- [ ] Rollback procedure tested
- [ ] Migration scripts validated
- [ ] Indexes created and tested
- [ ] Triggers tested
- [ ] RPC functions tested

### 4. Documentation Complete
- [x] `/PRODUCTION_GRADE_SOLUTION.md` created
- [x] `/AUTO_ASSIGN_CHILD_ID_SOLUTION.md` created
- [x] `/TESTING_GUIDE_AUTO_ASSIGN.md` created
- [x] Code comments added
- [ ] API documentation updated
- [ ] User guide updated (if needed)

---

## 🗄️ Database Deployment

### Step 1: Full Database Backup
```bash
# Via Supabase CLI
supabase db dump --data-only > backup_pre_auto_assign_$(date +%Y%m%d).sql

# Or via Supabase Dashboard
# Settings → Database → Backups → Create Backup
```

**Verify Backup:**
- [ ] Backup file created
- [ ] File size reasonable (not empty)
- [ ] Backup timestamp recorded: `_______________`

---

### Step 2: Run Migrations (in order)

#### Migration 1: Auto-Assign Trigger
```bash
supabase db execute --file supabase/migrations/006_add_auto_assign_trigger.sql
```

**Verify:**
```sql
-- Check function exists
SELECT proname FROM pg_proc WHERE proname = 'auto_assign_child_id';

-- Check trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'trigger_auto_assign_child_id';
```

- [ ] Function created
- [ ] Trigger created
- [ ] Test insert works

---

#### Migration 2: Child Delete Handling
```bash
supabase db execute --file supabase/migrations/007_handle_child_delete.sql
```

**Verify:**
```sql
SELECT proname FROM pg_proc WHERE proname = 'reassign_activities_on_child_delete';
SELECT tgname FROM pg_trigger WHERE tgname = 'trigger_reassign_on_child_delete';
```

- [ ] Function created
- [ ] Trigger created
- [ ] Test delete works

---

#### Migration 3: Default Child Preference
```bash
supabase db execute --file supabase/migrations/008_add_default_child.sql
```

**Verify:**
```sql
-- Check column added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'default_child_id';

-- Check RPC function
SELECT proname FROM pg_proc WHERE proname = 'get_default_child';
```

- [ ] Column added to profiles
- [ ] Foreign key constraint exists
- [ ] RPC function created
- [ ] Trigger updated

---

#### Migration 4: Data Migration (Existing NULL values)
```bash
supabase db execute --file scripts/migrate-assign-child-id.sql
```

**CRITICAL:** Review output for:
- Backup table created
- Number of activities updated
- Any warnings or errors

**Verify:**
```sql
-- Check backup
SELECT COUNT(*) FROM activities_backup_20250111;

-- Check migration results
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN child_id IS NOT NULL THEN 1 END) as assigned,
  COUNT(CASE WHEN child_id IS NULL THEN 1 END) as still_null
FROM activities;

-- Check migrated activities
SELECT COUNT(*) 
FROM activities 
WHERE metadata @> '{"migrated": true}';
```

- [ ] Backup table exists
- [ ] Activities updated
- [ ] Verification queries pass
- [ ] No unexpected NULLs

**Backup Table Name:** `activities_backup_20250111`

---

### Step 3: Create Indexes (if not in migrations)
```sql
CREATE INDEX IF NOT EXISTS idx_profiles_default_child_id 
ON profiles(default_child_id);

CREATE INDEX IF NOT EXISTS idx_children_user_created 
ON children(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_activities_child_id 
ON activities(child_id);

CREATE INDEX IF NOT EXISTS idx_activities_user_child 
ON activities(user_id, child_id);
```

**Verify:**
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('profiles', 'children', 'activities')
ORDER BY tablename, indexname;
```

- [ ] All indexes created
- [ ] No duplicate indexes

---

## 📱 Application Deployment

### Step 1: Environment Variables
**Verify all required env vars:**
```bash
# Check .env or Supabase settings
SUPABASE_URL=_______________
SUPABASE_ANON_KEY=_______________
AZURE_OPENAI_ENDPOINT=_______________
AZURE_OPENAI_KEY=_______________
```

- [ ] All env vars present
- [ ] Values correct
- [ ] No hardcoded secrets

---

### Step 2: Build & Deploy
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Deploy (adjust for your platform)
# For EAS:
eas build --platform all
eas submit --platform all
```

- [ ] Dependencies installed
- [ ] Tests pass
- [ ] Build successful
- [ ] No build warnings
- [ ] Deployment successful

---

### Step 3: Verify Deployment

#### Backend Verification
```bash
# Test Supabase connection
npx supabase status

# Test database queries
npx supabase db execute "SELECT COUNT(*) FROM activities;"
```

#### Frontend Verification
- [ ] App launches successfully
- [ ] Can create child
- [ ] Can create activity without selecting child
- [ ] Activity auto-assigned to correct child
- [ ] Statistics screen shows data
- [ ] Activity history shows data

---

## 🔍 Post-Deployment Monitoring

### First Hour
```sql
-- Monitor new activities
SELECT 
  COUNT(*) as new_activities,
  COUNT(CASE WHEN child_id IS NULL THEN 1 END) as null_count,
  COUNT(CASE WHEN metadata @> '{"auto_assigned": true}' THEN 1 END) as auto_assigned_count
FROM activities
WHERE created_at > NOW() - INTERVAL '1 hour';
```

**Check:**
- [ ] New activities being created
- [ ] Auto-assign working
- [ ] No unexpected NULLs
- [ ] No error spikes

---

### First 24 Hours

#### Application Logs
```bash
# Check for errors
grep "ERROR" logs/app.log | tail -100

# Check auto-assign logs
grep "AUTO-ASSIGN" logs/app.log | tail -50
```

**Monitor:**
- [ ] Error rate normal
- [ ] Auto-assign success rate > 99%
- [ ] No trigger failures
- [ ] Response times acceptable

#### Database Logs
```sql
-- Check for warnings
SELECT * FROM pg_stat_statements
WHERE query LIKE '%auto_assign%'
ORDER BY calls DESC;
```

**Monitor:**
- [ ] Trigger execution count
- [ ] Average execution time < 10ms
- [ ] No deadlocks
- [ ] No constraint violations

---

### Week 1

#### Data Consistency Check
```sql
-- Users dengan children tapi activities NULL
SELECT 
  p.id as user_id,
  p.email,
  COUNT(DISTINCT c.id) as children_count,
  COUNT(a.id) FILTER (WHERE a.child_id IS NULL) as null_activities
FROM profiles p
LEFT JOIN children c ON c.user_id = p.id
LEFT JOIN activities a ON a.user_id = p.id
GROUP BY p.id, p.email
HAVING COUNT(DISTINCT c.id) > 0 
  AND COUNT(a.id) FILTER (WHERE a.child_id IS NULL) > 0;
```

**Expected:** No results (all activities should have child_id)

**Check:**
- [ ] No data inconsistencies
- [ ] User feedback positive
- [ ] No support tickets related to issue
- [ ] Performance metrics stable

---

## 🚨 Rollback Procedure

### When to Rollback
- Critical bug discovered
- Data loss detected
- Performance degradation
- User-facing errors

### Rollback Steps

#### 1. Application Rollback
```bash
# Revert to previous version
git revert HEAD~3  # Or specific commit
npm install
npm run build
# Deploy previous version
```

#### 2. Database Rollback
```sql
-- Run rollback from migration script
-- (see scripts/migrate-assign-child-id.sql comments)

BEGIN;

-- Restore activities dari backup
CREATE TEMP TABLE migrated_ids AS
SELECT id FROM activities WHERE metadata @> '{"migrated": true}';

DELETE FROM activities WHERE id IN (SELECT id FROM migrated_ids);

INSERT INTO activities 
SELECT * FROM activities_backup_20250111
WHERE id IN (SELECT id FROM migrated_ids);

-- Verify
SELECT COUNT(*) FROM activities WHERE id IN (SELECT id FROM migrated_ids);

COMMIT;
```

#### 3. Drop Triggers (if needed)
```sql
DROP TRIGGER IF EXISTS trigger_auto_assign_child_id ON activities;
DROP TRIGGER IF EXISTS trigger_reassign_on_child_delete ON children;
DROP FUNCTION IF EXISTS auto_assign_child_id();
DROP FUNCTION IF EXISTS reassign_activities_on_child_delete();
```

#### 4. Remove Column (if needed)
```sql
ALTER TABLE profiles DROP COLUMN IF EXISTS default_child_id;
```

**Verify Rollback:**
- [ ] Application running previous version
- [ ] Database restored
- [ ] Data integrity confirmed
- [ ] Users notified

---

## ✅ Deployment Sign-Off

### Pre-Deployment Approval
- [ ] **Developer:** Code tested and ready
- [ ] **QA:** All tests passed
- [ ] **Tech Lead:** Architecture approved
- [ ] **Product:** Feature approved

**Signatures:**
- Developer: _______________ Date: _______________
- QA Engineer: _______________ Date: _______________
- Tech Lead: _______________ Date: _______________

---

### Post-Deployment Confirmation
- [ ] **24 Hours:** No critical issues
- [ ] **1 Week:** System stable
- [ ] **2 Weeks:** User feedback positive

**Confirmed By:**
- Developer: _______________ Date: _______________
- Product Manager: _______________ Date: _______________

---

## 📊 Success Metrics

**Track for 2 weeks:**
- Auto-assign success rate: ______%  (Target: >99%)
- NULL child_id rate: ______%  (Target: <1%)
- Average response time: ______ms  (Target: <100ms)
- Error rate: ______%  (Target: <0.1%)
- User satisfaction: ______/5  (Target: >4.5)

---

## 📝 Notes

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Database Backup:** `backup_pre_auto_assign_20250111.sql`  
**Backup Table:** `activities_backup_20250111`

**Issues Encountered:**
```
(Record any issues during deployment)
```

**Resolution:**
```
(How issues were resolved)
```

---

## 📞 Emergency Contacts

**On-Call Developer:** _______________  
**Database Admin:** _______________  
**Tech Lead:** _______________  
**Product Manager:** _______________

---

**Status:** [ ] NOT STARTED | [ ] IN PROGRESS | [ ] COMPLETED | [ ] ROLLED BACK

**Last Updated:** 11 Januari 2025  
**Version:** 1.0  
**Document Owner:** Development Team
