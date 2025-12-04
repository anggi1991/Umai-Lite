# Media Gallery - Quick Start Testing Guide

## ✅ Status: Ready for Testing

### Prerequisites Completed
- ✅ Migration 005 executed successfully
- ✅ Service layer implemented (mediaService.ts)
- ✅ UI screen created (MediaGallery.tsx)
- ✅ Route configured
- ✅ Dashboard integration
- ✅ Dependencies installed
- ✅ No TypeScript errors

### 🚀 Next Step: Run Migration 006

**Execute this SQL in Supabase SQL Editor:**

```bash
# File location:
supabase/migrations/006_create_storage_bucket.sql
```

This will:
1. Create storage bucket `child-media`
2. Apply RLS policies for storage.objects
3. Verify bucket and policies created

### 📱 Manual Testing Steps

#### 1. Run Migration 006
```sql
-- Copy entire content from 006_create_storage_bucket.sql
-- Paste in Supabase SQL Editor
-- Click "Run"
-- Should see: "Success. 1 row returned" (bucket created)
```

#### 2. Launch App
```bash
# App should already be running at:
http://localhost:8081

# If not, run:
cd "/Users/anggiandriyana/Downloads/parenting ai/parenting-ai"
npm start

# Then scan QR code or press:
# i - iOS simulator
# a - Android emulator
# w - Web browser
```

#### 3. Test Upload Flow
1. **Navigate to Media Gallery**
   - Dashboard → Tap "Foto" button in header
   - Should see empty state: "No photos yet"

2. **Upload First Photo**
   - Tap FAB (+) button
   - System will request media permissions → Grant
   - Select a photo from your gallery
   - Wait for upload (should see loading indicator)
   - Photo should appear in grid

3. **Verify in Supabase**
   ```
   Dashboard → Storage → child-media bucket
   Should see folder: {user_id}/{child_id}/{timestamp}.jpg
   
   Dashboard → Table Editor → media
   Should see new row with photo metadata
   ```

#### 4. Test Caption Feature
1. Long-press on uploaded photo
2. Dialog should appear with text input
3. Type caption: "My first upload test"
4. Tap "Save"
5. Caption should appear as overlay on photo

#### 5. Test Delete Feature
1. Tap trash icon on photo
2. Confirm deletion in alert
3. Photo should disappear from grid
4. Verify in Supabase:
   - Storage: file should be deleted
   - Table: record should be deleted

#### 6. Test Pull-to-Refresh
1. Pull down on gallery
2. Should show refresh indicator
3. Photos should reload

### ✅ Success Criteria

| Test | Expected Result | Status |
|------|----------------|--------|
| Navigate to gallery | Empty state shows | [ ] |
| Grant permissions | Permission dialog appears | [ ] |
| Upload photo | Photo appears in grid | [ ] |
| Storage verification | File exists in bucket | [ ] |
| Database verification | Record exists in media table | [ ] |
| Add caption | Caption saves and displays | [ ] |
| Edit caption | Updated caption shows | [ ] |
| Delete photo | Photo removed from grid & storage | [ ] |
| Pull-to-refresh | Photos reload successfully | [ ] |
| Multi-upload | Multiple photos display correctly | [ ] |

### 🐛 Troubleshooting

#### Issue: Permission denied on upload
**Check:**
- RLS policies applied on storage.objects
- User is authenticated
- Bucket name is exactly `child-media`

**Solution:**
```sql
-- Verify policies exist:
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Should show 4 policies (INSERT, SELECT, DELETE, UPDATE)
```

#### Issue: "Upload failed"
**Check:**
- Network connection
- Supabase URL/anon key in .env
- Console for detailed error message

**Solution:**
- Check browser/Expo console
- Verify file format (JPEG/PNG)
- Check file size (not too large)

#### Issue: Photos don't appear
**Check:**
- media table has records
- URL is accessible
- Network request succeeds

**Solution:**
```sql
-- Check media table:
SELECT * FROM media 
WHERE user_id = auth.uid()
ORDER BY uploaded_at DESC;
```

#### Issue: Delete doesn't work
**Check:**
- DELETE policy on storage.objects
- User owns the media record

**Solution:**
- Verify user_id matches in media table
- Check RLS policies allow DELETE

### 📊 Expected Console Output

**Successful Upload:**
```
Uploading to: {user_id}/{child_id}/1699276800000.jpg
Upload successful
Media record created: {media_id}
```

**Successful Delete:**
```
Deleting media: {media_id}
Storage file removed
Database record deleted
```

### 🎯 Test Scenarios

1. **Happy Path**
   - Upload → Display → Caption → Delete ✅

2. **Permission Denied**
   - First launch → Deny permissions → Error shown ✅

3. **Network Error**
   - Turn off WiFi → Try upload → Error handling ✅

4. **Multiple Photos**
   - Upload 5+ photos → All display in grid ✅

5. **Different Children**
   - Upload for Child A
   - Switch to Child B
   - Upload for Child B
   - Each child sees only their photos ✅

### 📝 Testing Notes

**Date:** _____________
**Tester:** ___________
**Device:** ___________

**Results:**
- Upload: [ ] Pass [ ] Fail - Notes: _______________
- Display: [ ] Pass [ ] Fail - Notes: _______________
- Caption: [ ] Pass [ ] Fail - Notes: _______________
- Delete: [ ] Pass [ ] Fail - Notes: _______________
- Performance: [ ] Fast [ ] Slow - Notes: _______________

**Issues Found:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Overall Status:** [ ] PASS [ ] FAIL
