-- =====================================================
-- HELPER: Force Reset Usage Limits
-- =====================================================
-- Purpose: Manually reset usage limits when RLS policies block DELETE
-- Run this in Supabase SQL Editor before running tests
-- =====================================================

CREATE OR REPLACE FUNCTION force_reset_usage_limits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete all usage_limits records for the user
  DELETE FROM usage_limits
  WHERE user_id = p_user_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count,
    'message', format('Deleted %s usage limit records', v_deleted_count)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to delete records'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION force_reset_usage_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION force_reset_usage_limits(UUID) TO anon;

-- Test the function
SELECT force_reset_usage_limits(auth.uid());

COMMENT ON FUNCTION force_reset_usage_limits IS 
  'Force delete all usage_limits records for a user, bypassing RLS policies. Use for testing only.';
