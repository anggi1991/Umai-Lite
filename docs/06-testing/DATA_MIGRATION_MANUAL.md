# 🔄 Data Migration: Auto-Assign Child ID - Manual Execution Guide

**Date:** 2025-01-14  
**Status:** ⏳ PENDING EXECUTION  
**Priority:** 🔴 CRITICAL  
**Database:** Production (gbcxzkgzhylpbmzbymwj)

---

## 📋 Overview

This migration fixes NULL `child_id` values in the `activities` table by automatically assigning them to the user's first child. This resolves data inconsistency issues where activities were not syncing properly.

**Why Manual?**
- This is a **data migration** (not schema migration)
- Production database requires careful execution
- Need to review backup and results before committing

---

## ⚠️ Pre-Execution Checklist

Before running this migration, ensure:

- [ ] You have admin access to Supabase Dashboard
- [ ] You understand the rollback procedure (included in SQL)
- [ ] You have reviewed the SQL file: `scripts/migrate-assign-child-id.sql`
- [ ] You are ready to monitor the results for 48 hours

---

## 🚀 Execution Steps

### Step 1: Access Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/sql/new
2. Login if not already logged in

### Step 2: Copy SQL Content

Open file: `/workspaces/parentingAI/scripts/migrate-assign-child-id.sql`

Copy the **entire SQL content** (lines 1-160).

### Step 3: Paste into SQL Editor

1. Paste the SQL into the editor
2. Review the SQL one more time
3. **Important:** The SQL includes:
   - Full backup creation (`activities_backup_20250111`)
   - NULL child_id updates
   - Verification queries
   - Rollback procedure (commented out)

### Step 4: Execute Migration

1. Click **"Run"** button in SQL Editor
2. Wait for execution to complete
3. Review the output messages

---

## 📊 Expected Output

You should see NOTICE messages like:

```
NOTICE: Backup created: activities_backup_20250111 with X rows
NOTICE: Migration Complete:
NOTICE:   - Updated: X activities
NOTICE:   - Remaining NULL: Y activities (users without children)
```

And final verification table:

```
status           | total_activities | with_child_id | null_child_id | percentage_assigned
After Migration  | XXX              | XXX           | XX            | XX.XX
```

---

## ✅ Post-Execution Verification

### 1. Check Backup Table

Run this query in SQL Editor:

```sql
SELECT 
  COUNT(*) as backup_count,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM activities_backup_20250111;
```

### 2. Check Updated Activities

```sql
SELECT 
  COUNT(*) as total_activities,
  COUNT(CASE WHEN child_id IS NOT NULL THEN 1 END) as with_child_id,
  COUNT(CASE WHEN child_id IS NULL THEN 1 END) as null_child_id,
  ROUND(COUNT(CASE WHEN child_id IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 2) as percentage_assigned
FROM activities;
```

### 3. Verify No Edge Cases

```sql
-- This should return 0 rows (no users with children but activities still NULL)
SELECT 
  p.id as profile_id,
  p.email,
  COUNT(DISTINCT c.id) as children_count,
  COUNT(a.id) as activities_with_null
FROM profiles p
LEFT JOIN children c ON c.user_id = p.id
LEFT JOIN activities a ON a.user_id = p.id AND a.child_id IS NULL
GROUP BY p.id, p.email
HAVING COUNT(DISTINCT c.id) > 0 AND COUNT(a.id) > 0;
```

---

## 🔄 Rollback Procedure (If Needed)

⚠️ **ONLY USE IF MIGRATION FAILED OR PRODUCED UNEXPECTED RESULTS**

1. Go to SQL Editor
2. Copy this rollback SQL:

```sql
BEGIN;

-- Step 1: Find activities yang di-migrate
CREATE TEMP TABLE migrated_ids AS
SELECT id FROM activities WHERE metadata @> '{"migrated": true}';

-- Step 2: Delete migrated activities
DELETE FROM activities WHERE id IN (SELECT id FROM migrated_ids);

-- Step 3: Restore dari backup
INSERT INTO activities 
SELECT * FROM activities_backup_20250111
WHERE id IN (SELECT id FROM migrated_ids);

-- Step 4: Verify rollback
SELECT 
  COUNT(*) as restored_count,
  COUNT(CASE WHEN child_id IS NULL THEN 1 END) as restored_null_count
FROM activities a
WHERE EXISTS (SELECT 1 FROM migrated_ids m WHERE m.id = a.id);

-- If verification looks good:
COMMIT;

-- If something wrong:
-- ROLLBACK;

RAISE NOTICE '✅ Rollback completed successfully';
```

3. Execute and verify results
4. Commit if successful, or rollback if issues found

---

## 📝 Documentation Checklist

After successful execution, document results in `RESULTS_AUTO_ASSIGN.md`:

- [ ] Total activities before migration
- [ ] Number of NULL child_id fixed
- [ ] Remaining NULL (users without children)
- [ ] Percentage assigned
- [ ] Any errors or warnings
- [ ] Execution timestamp
- [ ] Next monitoring steps

---

## 📅 Monitoring Schedule

After successful migration:

1. **Day 1-2:** Monitor for any data inconsistencies
2. **Day 3:** Run verification queries again
3. **Day 7:** Generate weekly report
4. **Week 2:** Consider dropping backup table if all stable

---

## 🔗 Related Documentation

- Main deployment doc: `docs/data-sync/AUTO_ASSIGN_DEPLOYMENT.md`
- Testing checklist: `docs/data-sync/AUTO_ASSIGN_TESTING.md`
- SQL file: `scripts/migrate-assign-child-id.sql`
- Verification script: `scripts/verify-migration.sql`

---

## ✍️ Execution Log

| Date | Executor | Status | Notes |
|------|----------|--------|-------|
| 2025-01-14 | _TBD_ | ⏳ Pending | Migration prepared, awaiting execution |
| | | | |

---

**Ready to execute?** Follow the steps above carefully and document your results! 🚀
