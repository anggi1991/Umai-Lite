-- Verify child-media storage bucket policies
-- Run this in Supabase SQL Editor to check if storage policies were created

-- Check 1: Verify bucket exists and is configured correctly
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'child-media';

-- Check 2: List ALL storage policies for child-media bucket
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_status,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as check_status
FROM pg_policies 
WHERE tablename = 'objects' 
  AND (
    policyname LIKE '%child media%' 
    OR policyname LIKE '%child-media%'
    OR policyname LIKE '%upload%'
  )
ORDER BY policyname;

-- Check 3: Count total storage policies
SELECT 
  COUNT(*) as total_storage_policies,
  string_agg(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%child media%';
