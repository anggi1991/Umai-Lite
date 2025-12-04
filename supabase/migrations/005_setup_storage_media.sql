-- Migration 005: Setup Supabase Storage bucket and policies for media
-- This migration creates a storage bucket for child photos and sets up RLS policies

-- Create storage bucket for child media (if not exists via SQL)
-- Note: Storage buckets are typically created via Supabase Dashboard or CLI
-- This is for reference - actual bucket creation done via supabase.storage API

-- Ensure media table has proper structure (already in 001_init.sql, but verify)
-- ALTER TABLE IF EXISTS media ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- Storage policies (applied via Supabase Dashboard or CLI):
-- Bucket name: child-media
-- Public: false (authenticated users only)

-- Policy 1: Users can upload to their own folder
-- bucket_id: child-media
-- name: Users can upload own media
-- allowed_operation: INSERT
-- definition: (bucket_id = 'child-media' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Policy 2: Users can read their own media
-- bucket_id: child-media
-- name: Users can view own media
-- allowed_operation: SELECT
-- definition: (bucket_id = 'child-media' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Policy 3: Users can delete their own media
-- bucket_id: child-media
-- name: Users can delete own media
-- allowed_operation: DELETE
-- definition: (bucket_id = 'child-media' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Policy 4: Users can update their own media
-- bucket_id: child-media
-- name: Users can update own media
-- allowed_operation: UPDATE
-- definition: (bucket_id = 'child-media' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Add RLS policy for media table (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'media' 
    AND policyname = 'users_can_manage_own_media'
  ) THEN
    CREATE POLICY users_can_manage_own_media
      ON media
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index for media queries
CREATE INDEX IF NOT EXISTS idx_media_user_child ON media(user_id, child_id);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON media(uploaded_at DESC);

-- Add comment
COMMENT ON TABLE media IS 'Stores metadata for uploaded child photos and media files';
