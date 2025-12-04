# Storage Setup Guide - Step by Step

## ⚠️ Important: Storage Policies Cannot Be Created via SQL

Storage policies must be created through the Supabase Dashboard UI due to permission restrictions.

## 📋 Setup Steps (5 minutes)

### Step 1: Run Migration 006
```sql
-- Copy content from: supabase/migrations/006_create_storage_bucket.sql
-- Paste in: Supabase Dashboard → SQL Editor
-- Click: Run
-- Expected: "Success. 1 row returned" showing the bucket details
```

### Step 2: Create Storage Policies via Dashboard

#### 2.1 Navigate to Storage
1. Go to Supabase Dashboard
2. Click **Storage** in left sidebar
3. Find bucket: **child-media**
4. Click **Policies** tab

#### 2.2 Create Policy 1: SELECT (View/Download)
1. Click **New Policy**
2. Select template: **Custom**
3. Fill in:
   ```
   Name: Users can view own media
   Allowed operation: SELECT
   Target roles: authenticated
   
   USING expression:
   bucket_id = 'child-media' AND (storage.foldername(name))[1] = auth.uid()::text
   ```
4. Click **Review** → **Save policy**

#### 2.3 Create Policy 2: INSERT (Upload)
1. Click **New Policy**
2. Select template: **Custom**
3. Fill in:
   ```
   Name: Users can upload own media
   Allowed operation: INSERT
   Target roles: authenticated
   
   WITH CHECK expression:
   bucket_id = 'child-media' AND (storage.foldername(name))[1] = auth.uid()::text
   ```
4. Click **Review** → **Save policy**

#### 2.4 Create Policy 3: UPDATE (Rename/Move)
1. Click **New Policy**
2. Select template: **Custom**
3. Fill in:
   ```
   Name: Users can update own media
   Allowed operation: UPDATE
   Target roles: authenticated
   
   USING expression:
   bucket_id = 'child-media' AND (storage.foldername(name))[1] = auth.uid()::text
   ```
4. Click **Review** → **Save policy**

#### 2.5 Create Policy 4: DELETE (Remove)
1. Click **New Policy**
2. Select template: **Custom**
3. Fill in:
   ```
   Name: Users can delete own media
   Allowed operation: DELETE
   Target roles: authenticated
   
   USING expression:
   bucket_id = 'child-media' AND (storage.foldername(name))[1] = auth.uid()::text
   ```
4. Click **Review** → **Save policy**

### Step 3: Verify Policies Created
You should see 4 policies listed:
- ✅ Users can view own media (SELECT)
- ✅ Users can upload own media (INSERT)
- ✅ Users can update own media (UPDATE)
- ✅ Users can delete own media (DELETE)

## 🎯 Understanding the Policy Expression

```sql
bucket_id = 'child-media' 
AND (storage.foldername(name))[1] = auth.uid()::text
```

**What this does:**
- Only applies to `child-media` bucket
- Extracts first folder from file path: `{user_id}/{child_id}/file.jpg`
- Compares folder name to current user's ID
- User can only access files in their own folder

**Example:**
- User ID: `abc-123`
- Allowed path: `abc-123/child-1/photo.jpg` ✅
- Blocked path: `xyz-789/child-1/photo.jpg` ❌

## ✅ Verification

After creating all policies, test in SQL Editor:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'child-media';
-- Should return 1 row

-- Check policies exist (won't work due to permissions, but try)
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
-- May show error, but policies are there if you see them in Dashboard UI
```

## 🚀 Next Steps

After completing setup:
1. Open app: http://localhost:8081
2. Sign in
3. Navigate to Dashboard → "Foto" button
4. Test upload flow (see MEDIA_GALLERY_TEST.md)

## 🐛 Troubleshooting

### Issue: "Policy already exists"
**Solution:** Skip creating that policy, it's already there

### Issue: Can't find policy expression field
**Solution:** Make sure you selected "Custom" template, not a pre-built one

### Issue: Expression validation error
**Solution:** Copy-paste exact expression from this guide, including spaces

### Issue: Upload still fails with permission error
**Solution:** 
- Verify all 4 policies are created
- Check "Target roles" is set to "authenticated"
- Try signing out and back in

## 📸 Screenshot Reference

Your Policies tab should look like:
```
Policies for child-media bucket:

[✓] Users can view own media     | SELECT | authenticated
[✓] Users can upload own media   | INSERT | authenticated  
[✓] Users can update own media   | UPDATE | authenticated
[✓] Users can delete own media   | DELETE | authenticated
```

## ⏱️ Time Required
- Migration 006: 1 minute
- Create 4 policies: 3-4 minutes
- Verification: 1 minute
- **Total: ~5 minutes**
