import { supabase } from './supabaseClient';

/**
 * Set default child untuk user
 * Child yang dipilih akan otomatis digunakan untuk aktivitas baru
 */
export const setDefaultChild = async (
  userId: string,
  childId: string | null
): Promise<void> => {
  // Jika childId diberikan, validasi dulu bahwa child milik user
  if (childId) {
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .eq('user_id', userId)
      .single();
    
    if (childError || !child) {
      throw new Error(`Child ${childId} does not belong to user ${userId}`);
    }
  }
  
  // Update default_child_id di profile
  const { error } = await supabase
    .from('profiles')
    .update({ default_child_id: childId })
    .eq('id', userId);
  
  if (error) {
    console.error('[SET-DEFAULT-CHILD] Error:', error);
    throw error;
  }
  
  console.log(`[SET-DEFAULT-CHILD] Default child set to ${childId || 'NULL'} for user ${userId}`);
};

/**
 * Get default child untuk user
 */
export const getDefaultChild = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('default_child_id')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('[GET-DEFAULT-CHILD] Error:', error);
    return null;
  }
  
  return data?.default_child_id || null;
};

/**
 * Clear default child (set to null)
 */
export const clearDefaultChild = async (userId: string): Promise<void> => {
  await setDefaultChild(userId, null);
  console.log(`[CLEAR-DEFAULT-CHILD] Default child cleared for user ${userId}`);
};
