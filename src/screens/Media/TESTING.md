# Media Gallery - Testing Guide

## Setup Required Before Testing

### 1. Create Storage Bucket in Supabase Dashboard
1. Go to Supabase Dashboard → Storage
2. Create new bucket: `child-media`
3. Set as **Private** (not public)
4. Apply RLS policies:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'child-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own media
CREATE POLICY "Users can view own media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'child-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own media
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'child-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own media
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'child-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 2. Apply Migration 005
Run the SQL from `supabase/migrations/005_setup_storage_media.sql` in Supabase SQL Editor.

## Testing Checklist

### Local Testing (Expo Go)

**Prerequisites:**
- ✅ Expo app running (`npm start`)
- ✅ User signed in
- ✅ At least one child profile created
- ✅ Supabase Storage bucket `child-media` created with RLS policies

**Test Cases:**

1. **Navigate to Media Gallery**
   - [ ] Open Dashboard
   - [ ] Tap "Foto" button in header
   - [ ] Should show empty state "No photos yet"

2. **Upload Photo**
   - [ ] Tap FAB (+) button
   - [ ] Grant media library permissions when prompted
   - [ ] Select a photo from gallery
   - [ ] Should see uploading indicator
   - [ ] Photo should appear in grid after upload
   - [ ] Check Supabase Storage → child-media bucket for uploaded file

3. **View Photos Grid**
   - [ ] Photos display in 3-column grid
   - [ ] Images load correctly
   - [ ] Delete button (trash icon) visible on each photo

4. **Add Caption**
   - [ ] Long press on a photo
   - [ ] Dialog should open with text input
   - [ ] Type a caption
   - [ ] Tap "Save"
   - [ ] Caption should appear as overlay on photo

5. **Edit Caption**
   - [ ] Long press photo with caption
   - [ ] Edit caption text
   - [ ] Save
   - [ ] Updated caption should display

6. **Delete Photo**
   - [ ] Tap delete (trash) icon on photo
   - [ ] Confirm deletion in alert
   - [ ] Photo should disappear from grid
   - [ ] Check Supabase Storage - file should be removed

7. **Pull to Refresh**
   - [ ] Pull down on photo grid
   - [ ] Should reload photos

8. **Multi-child Support**
   - [ ] Add photo for Child A
   - [ ] Switch to Child B
   - [ ] Add photo for Child B
   - [ ] Each child should see only their own photos

9. **Error Handling**
   - [ ] Try uploading without child selected → should show error
   - [ ] Cancel photo picker → should handle gracefully
   - [ ] Network error simulation → should show error alert

## Expected Results

### Successful Upload Flow:
1. User taps FAB
2. Permission dialog (first time only)
3. Photo picker opens
4. User selects photo
5. Upload progress indicator
6. Photo appears in grid
7. Success alert

### Storage Structure:
```
child-media/
  ├── {user_id}/
      ├── {child_id}/
          ├── 1699276800000.jpg
          ├── 1699276900000.png
          └── ...
```

### Database Records:
Check `media` table:
```sql
SELECT * FROM media WHERE user_id = 'your-user-id';
```

Should show:
- `id`: UUID
- `user_id`: Current user
- `child_id`: Selected child
- `url`: Full public URL to storage
- `type`: image/jpg, image/png, etc.
- `caption`: User-added caption (nullable)
- `uploaded_at`: Timestamp

## Known Issues & Limitations

1. **Expo Go Limitations:**
   - File system access works differently than standalone builds
   - Some image formats may not be supported

2. **Performance:**
   - Large images are uploaded full size (no compression yet)
   - Grid loads all images at once (no pagination yet)

3. **Storage Costs:**
   - Monitor Supabase Storage usage
   - Consider adding file size limits

## Troubleshooting

### Issue: "Permission denied" on upload
**Solution:** Check RLS policies on storage.objects and media table

### Issue: "Upload failed"
**Solution:** 
- Verify bucket name is exactly `child-media`
- Check network connection
- Verify user is authenticated

### Issue: Photos don't appear after upload
**Solution:**
- Check browser console for errors
- Verify `media` table insert succeeded
- Check if URL is publicly accessible (should be with policy)

### Issue: Delete doesn't work
**Solution:**
- Verify RLS policies allow DELETE
- Check if user_id matches in media record

## Next Steps for Production

1. **Image Optimization:**
   - Add image compression before upload
   - Generate thumbnails for grid view
   - Implement lazy loading

2. **Enhanced Features:**
   - Add video support
   - Implement photo gallery viewer (full screen, swipe)
   - Add filters/effects
   - Share photos

3. **Storage Management:**
   - Add file size limits (e.g., 5MB max)
   - Implement storage quota per user
   - Add batch upload
   - Add batch delete

4. **UI Improvements:**
   - Add loading skeletons
   - Implement infinite scroll
   - Add date grouping
   - Add search/filter

## Test Results Log

Date: _____________
Tester: ___________

- [ ] All test cases passed
- [ ] Issues found: _________________________
- [ ] Performance notes: ____________________
