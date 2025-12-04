import { supabase } from './supabaseClient';
import { Child } from '../types/database';

interface ChildInput {
  name: string;
  dob: string;
  gender?: string;
  photo_url?: string;
  initial_weight_kg?: number;
  initial_height_cm?: number;
}

/**
 * Membuat profil anak baru
 * Otomatis membuat growth_records jika initial_weight_kg atau initial_height_cm tersedia
 */
export const createChild = async (
  userId: string,
  childData: ChildInput
): Promise<Child> => {
  const { data, error } = await supabase
    .from('children')
    .insert([
      {
        user_id: userId,
        ...childData,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  const child = data as Child;

  // Auto-create growth records untuk initial weight dan height
  const growthRecords: any[] = [];
  const measuredAt = new Date(childData.dob).toISOString(); // Gunakan tanggal lahir sebagai measured_at

  if (childData.initial_weight_kg && childData.initial_weight_kg > 0) {
    growthRecords.push({
      user_id: userId,
      child_id: child.id,
      record_type: 'weight',
      weight_kg: childData.initial_weight_kg,
      measured_at: measuredAt,
      note: 'Berat badan awal saat lahir',
    });
  }

  if (childData.initial_height_cm && childData.initial_height_cm > 0) {
    growthRecords.push({
      user_id: userId,
      child_id: child.id,
      record_type: 'height',
      height_cm: childData.initial_height_cm,
      measured_at: measuredAt,
      note: 'Tinggi badan awal saat lahir',
    });
  }

  // Insert growth records jika ada
  if (growthRecords.length > 0) {
    const { error: growthError } = await supabase
      .from('growth_records')
      .insert(growthRecords);

    if (growthError) {
      console.error('Error creating initial growth records:', growthError);
      // Tidak throw error agar proses create child tetap berhasil
    }
  }

  return child;
};

/**
 * Mendapatkan semua anak untuk user tertentu
 */
export const getChildren = async (userId: string): Promise<Child[]> => {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Child[];
};

/**
 * Mendapatkan anak pertama/default untuk AI context
 * Returns first child by creation date (oldest child)
 * Used for AI personalization when no specific child is selected
 */
export const getDefaultChild = async (userId: string): Promise<Child | null> => {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No children found
    throw error;
  }
  
  return data as Child;
};

/**
 * Mendapatkan detail anak berdasarkan ID
 */
export const getChildById = async (childId: string): Promise<Child> => {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single();

  if (error) throw error;
  return data as Child;
};

/**
 * Update profil anak
 * Otomatis sync growth_records jika initial_weight_kg atau initial_height_cm berubah
 */
export const updateChild = async (
  childId: string,
  updates: Partial<ChildInput>
): Promise<Child> => {
  // Get current child data untuk comparison
  const { data: currentChild, error: fetchError } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single();

  if (fetchError) throw fetchError;

  // Update child data
  const { data, error } = await supabase
    .from('children')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', childId)
    .select()
    .single();

  if (error) throw error;

  const updatedChild = data as Child;

  // Sync growth records jika ada perubahan initial weight/height
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return updatedChild;

  const growthUpdates: any[] = [];
  const measuredAt = new Date(updates.dob || currentChild.dob).toISOString();

  // Check weight changes
  if (
    updates.initial_weight_kg !== undefined &&
    updates.initial_weight_kg !== currentChild.initial_weight_kg &&
    updates.initial_weight_kg > 0
  ) {
    // Cari existing record dengan note "Berat badan awal saat lahir"
    const { data: existingWeight } = await supabase
      .from('growth_records')
      .select('*')
      .eq('child_id', childId)
      .eq('record_type', 'weight')
      .ilike('note', '%awal%')
      .order('measured_at', { ascending: true })
      .limit(1)
      .single();

    if (existingWeight) {
      // Update existing record
      growthUpdates.push(
        supabase
          .from('growth_records')
          .update({
            weight_kg: updates.initial_weight_kg,
            measured_at: measuredAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingWeight.id)
      );
    } else {
      // Create new record
      growthUpdates.push(
        supabase.from('growth_records').insert({
          user_id: user.id,
          child_id: childId,
          record_type: 'weight',
          weight_kg: updates.initial_weight_kg,
          measured_at: measuredAt,
          note: 'Berat badan awal saat lahir',
        })
      );
    }
  }

  // Check height changes
  if (
    updates.initial_height_cm !== undefined &&
    updates.initial_height_cm !== currentChild.initial_height_cm &&
    updates.initial_height_cm > 0
  ) {
    // Cari existing record dengan note "Tinggi badan awal saat lahir"
    const { data: existingHeight } = await supabase
      .from('growth_records')
      .select('*')
      .eq('child_id', childId)
      .eq('record_type', 'height')
      .ilike('note', '%awal%')
      .order('measured_at', { ascending: true })
      .limit(1)
      .single();

    if (existingHeight) {
      // Update existing record
      growthUpdates.push(
        supabase
          .from('growth_records')
          .update({
            height_cm: updates.initial_height_cm,
            measured_at: measuredAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingHeight.id)
      );
    } else {
      // Create new record
      growthUpdates.push(
        supabase.from('growth_records').insert({
          user_id: user.id,
          child_id: childId,
          record_type: 'height',
          height_cm: updates.initial_height_cm,
          measured_at: measuredAt,
          note: 'Tinggi badan awal saat lahir',
        })
      );
    }
  }

  // Execute growth updates
  if (growthUpdates.length > 0) {
    await Promise.all(growthUpdates.map(update => update));
  }

  return updatedChild;
};

/**
 * Hapus profil anak
 */
export const deleteChild = async (childId: string): Promise<void> => {
  console.log('[Delete Child Service] Deleting child:', childId);
  
  // Check auth session first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Sesi tidak aktif. Silakan login kembali.');
  }
  
  console.log('[Delete Child Service] Session valid, user:', session.user.id);
  
  // Verify ownership before delete
  const { data: child, error: fetchError } = await supabase
    .from('children')
    .select('id, user_id, name')
    .eq('id', childId)
    .single();
  
  if (fetchError) {
    console.error('[Delete Child Service] Fetch error:', fetchError);
    throw new Error(`Tidak dapat menemukan anak: ${fetchError.message}`);
  }
  
  if (!child) {
    throw new Error('Data anak tidak ditemukan');
  }
  
  if (child.user_id !== session.user.id) {
    throw new Error('Anda tidak memiliki akses untuk menghapus anak ini');
  }
  
  console.log('[Delete Child Service] Ownership verified, deleting:', child.name);
  
  // Delete child - CASCADE will handle related records
  const { error } = await supabase
    .from('children')
    .delete()
    .eq('id', childId);

  if (error) {
    console.error('[Delete Child Service] Delete failed:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    
    // Provide user-friendly error messages
    if (error.code === 'PGRST301') {
      throw new Error('Gagal menghapus: Tidak memiliki izin');
    } else if (error.code === '23503') {
      throw new Error('Gagal menghapus: Ada data terkait yang harus dihapus terlebih dahulu');
    } else {
      throw new Error(`Gagal menghapus anak: ${error.message}`);
    }
  }
  
  console.log('[Delete Child Service] ✅ Child deleted successfully');
};

/**
 * Hitung usia anak dalam bulan
 */
export const calculateAgeInMonths = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  
  const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());
  
  return Math.max(0, months);
};

/**
 * Format usia untuk tampilan
 */
export const formatAge = (dob: string): string => {
  const birthDate = new Date(dob);
  const today = new Date();
  
  const years = today.getFullYear() - birthDate.getFullYear();
  const months = today.getMonth() - birthDate.getMonth();
  const days = today.getDate() - birthDate.getDate();
  
  let totalMonths = years * 12 + months;
  if (days < 0) totalMonths--;
  
  if (totalMonths < 1) {
    const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${totalDays} hari`;
  } else if (totalMonths < 12) {
    return `${totalMonths} bulan`;
  } else {
    const ageYears = Math.floor(totalMonths / 12);
    const ageMonths = totalMonths % 12;
    if (ageMonths === 0) {
      return `${ageYears} tahun`;
    }
    return `${ageYears} tahun ${ageMonths} bulan`;
  }
};
