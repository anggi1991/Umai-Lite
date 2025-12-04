-- Fix Storage RLS Policies for child-media Bucket
-- This migration fixes the RLS policies to allow authenticated users to upload media

-- =========================================================================
-- PART 1: Ensure the child-media bucket exists with correct settings
-- =========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'child-media', 
  'child-media', 
  true,  -- Make public so we can get public URLs
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- =========================================================================
-- PART 2: Drop existing conflicting policies on child-media bucket
-- =========================================================================
DROP POLICY IF EXISTS "Users can upload own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
DROP POLICY IF EXISTS "Public can read child media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload child media" ON storage.objects;

-- =========================================================================
-- PART 3: Create new storage policies for child-media bucket
-- =========================================================================

-- Policy 1: Allow authenticated users to INSERT (upload) files to their own folders
-- File path pattern: {user_id}/{child_id}/{timestamp}.{ext}
CREATE POLICY "Authenticated users can upload child media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'child-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow everyone to SELECT (read/download) from child-media
-- Since bucket is public, we allow public read access
CREATE POLICY "Public can read child media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'child-media');

-- Policy 3: Allow authenticated users to UPDATE their own media
CREATE POLICY "Users can update own child media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'child-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'child-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow authenticated users to DELETE their own media
CREATE POLICY "Users can delete own child media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'child-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =========================================================================
-- PART 4: Ensure media table has proper RLS policies
-- =========================================================================

-- Drop old conflicting policies on media table
DROP POLICY IF EXISTS "users_can_manage_own_media" ON media;
DROP POLICY IF EXISTS "media_select" ON media;
DROP POLICY IF EXISTS "media_insert" ON media;
DROP POLICY IF EXISTS "media_update" ON media;
DROP POLICY IF EXISTS "media_delete" ON media;

-- Create specific policies for each operation on media table
CREATE POLICY "media_select" 
ON media 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "media_insert" 
ON media 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "media_update" 
ON media 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "media_delete" 
ON media 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- =========================================================================
-- PART 5: Verify the setup
-- =========================================================================

-- Show bucket configuration
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types 
FROM storage.buckets 
WHERE id = 'child-media';

-- Show storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%child media%'
ORDER BY policyname;

-- Show media table policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'media'
ORDER BY policyname;

-- Add helpful comment
COMMENT ON TABLE media IS 'Stores metadata for uploaded child photos. Storage bucket: child-media. RLS enabled.';
