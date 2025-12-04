# Fix Media Upload RLS Error

## Problem
Getting error: `new row violates row-level security policy` when uploading photos to the media gallery.

## Solution
The `child-media` storage bucket is missing proper Row Level Security (RLS) policies.

---

## Quick Fix - Apply SQL Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/sql/new

2. **Copy the migration SQL:**
   - Open file: `supabase/migrations/014_fix_child_media_storage.sql`
   - Copy ALL the contents

3. **Paste and Run:**
   - Paste the SQL into the editor
   - Click the "Run" button (or press Ctrl+Enter)

4. **Verify Success:**
   - You should see query results showing the bucket configuration
   - No error messages should appear

5. **Test the app:**
   - Restart your Expo app (press `r` in the terminal)
   - Try uploading a photo again from the Media Gallery

---

### Option 2: Verify Storage Policies Manually

If you prefer to check the settings manually:

1. **Check Storage Bucket:**
   - Go to: https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/storage/buckets
   - Find the `child-media` bucket
   - Click on it → Policies tab

2. **Ensure these policies exist:**

   **INSERT Policy:** "Authenticated users can upload child media"
   ```sql
   bucket_id = 'child-media' AND
   (storage.foldername(name))[1] = auth.uid()::text
   ```

   **SELECT Policy:** "Public can read child media"
   ```sql
   bucket_id = 'child-media'
   ```

   **UPDATE Policy:** "Users can update own child media"
   ```sql
   bucket_id = 'child-media' AND
   (storage.foldername(name))[1] = auth.uid()::text
   ```

   **DELETE Policy:** "Users can delete own child media"
   ```sql
   bucket_id = 'child-media' AND
   (storage.foldername(name))[1] = auth.uid()::text
   ```

3. **Bucket Settings:**
   - Public: ✅ Yes
   - File size limit: 10 MB
   - Allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`

---

## What This Fixes

- ✅ Allows authenticated users to upload photos to their own folders
- ✅ Folder structure: `{user_id}/{child_id}/{timestamp}.jpg`
- ✅ Public access to view uploaded photos (via public URLs)
- ✅ Users can only delete/update their own photos
- ✅ Fixes the `media` table RLS policies for proper database inserts

---

## After Applying the Fix

1. **Restart the Expo dev server:**
   ```bash
   # Press Ctrl+C in the terminal to stop
   npm start
   ```

2. **Clear app cache (optional):**
   - In Expo Go: shake device → "Clear React Native packager cache"
   - Or press `Shift+M` in terminal → "Clear Metro bundler cache"

3. **Try uploading a photo:**
   - Navigate to Media Gallery (camera icon)
   - Click the + button
   - Select a child
   - Choose a photo
   - Upload should now succeed! ✅

---

## Troubleshooting

If you still get errors after applying the migration:

1. **Check the Supabase logs:**
   - https://supabase.com/dashboard/project/gbcxzkgzhylpbmzbymwj/logs/edge-logs

2. **Verify authentication:**
   - Make sure you're logged in to the app
   - Check console logs for "User signed in" message

3. **Check storage usage:**
   - Go to Settings → Billing → Storage
   - Ensure you haven't exceeded free tier limits (1GB)

4. **Still stuck?**
   - Check the Network tab in browser/debugger
   - Look for the exact error response from Supabase
   - The error details will show which policy is blocking the request

---

## Prevention

This fix is permanent. Once applied, all users will be able to:
- Upload photos to their media gallery
- View their own uploaded photos
- Delete their own photos
- Photos are stored securely with RLS protection

The migration is idempotent (safe to run multiple times).
