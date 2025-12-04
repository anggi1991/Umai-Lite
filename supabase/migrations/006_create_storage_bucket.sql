-- Migration 006: Create storage bucket for child media
-- NOTE: Storage policies MUST be created via Supabase Dashboard UI, not SQL
-- This migration only creates the bucket itself

-- Insert storage bucket (child-media) if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'child-media', 
  'child-media', 
  false,  -- private bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Verify bucket created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'child-media';

-- =============================================================================
-- IMPORTANT: After running this migration, you MUST manually create policies
-- in the Supabase Dashboard → Storage → child-media bucket → Policies
-- 
-- Use the following policy definitions:
-- =============================================================================

/*
POLICY 1: SELECT (View/Download)
Name: Users can view own media
Target roles: authenticated
Policy definition:
  bucket_id = 'child-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text

POLICY 2: INSERT (Upload)
Name: Users can upload own media  
Target roles: authenticated
WITH CHECK definition:
  bucket_id = 'child-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text

POLICY 3: UPDATE (Rename/Move)
Name: Users can update own media
Target roles: authenticated
USING definition:
  bucket_id = 'child-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text

POLICY 4: DELETE (Remove)
Name: Users can delete own media
Target roles: authenticated
USING definition:
  bucket_id = 'child-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
*/
