-- Fix Storage RLS Policies for Media Bucket
-- Allow authenticated users to upload their own media files

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
DROP POLICY IF EXISTS "Public can read media" ON storage.objects;

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Policy 1: Allow authenticated users to upload files to their own folders
-- Pattern: {user_id}/{child_id}/{filename}
CREATE POLICY "Users can upload own media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to read their own media
CREATE POLICY "Users can read own media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow public to read media (since bucket is public)
CREATE POLICY "Public can read media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy 4: Allow users to update their own media
CREATE POLICY "Users can update own media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Allow users to delete their own media
CREATE POLICY "Users can delete own media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
