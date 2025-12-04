// Media Service - Handle photo uploads, listing, and deletion
import { supabase } from './supabaseClient';
import * as ImagePicker from 'expo-image-picker';
// Import the new filesystem API (SDK 54+)
import { File } from 'expo-file-system';
import { compressGalleryPhoto } from '../utils/imageCompression';

const BUCKET_NAME = 'child-media';

export interface Media {
  id: string;
  user_id: string;
  child_id: string | null;
  url: string;
  type: string;
  caption: string | null;
  uploaded_at: string;
}

export interface UploadMediaParams {
  childId: string;
  caption?: string;
}

/**
 * Request media library permissions
 */
export async function requestMediaPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return false;
  }
  return true;
}



/**
 * Pick image from library
 */
export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const hasPermission = await requestMediaPermissions();
  if (!hasPermission) {
    throw new Error('Media library permission denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images' as any, // SDK 54 uses string instead of enum
    allowsEditing: false, // ✅ No cropping required
    quality: 1, // ✅ Full quality before compression
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0];
}

/**
 * Upload media to Supabase Storage and create media record
 */
export async function uploadMedia(
  params: UploadMediaParams,
  imageAsset: ImagePicker.ImagePickerAsset
): Promise<Media> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // ✅ Compress image to WebP before upload (gallery photos)
  const compressedUri = await compressGalleryPhoto(imageAsset.uri);

  // Generate unique filename with .webp extension
  const fileName = `${user.id}/${params.childId}/${Date.now()}.webp`;

  console.log('=== UPLOAD DEBUG ===');
  console.log('Bucket:', BUCKET_NAME);
  console.log('File path:', fileName);
  console.log('User ID:', user.id);
  console.log('Child ID:', params.childId);
  console.log('Original URI:', imageAsset.uri);
  console.log('Compressed URI:', compressedUri);

  // Use the new File API from expo-file-system (SDK 54+)
  // Create a File instance from the compressed URI
  const file = new File(compressedUri);
  
  // Read file as ArrayBuffer using the new API
  const arrayBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(arrayBuffer);
  
  console.log('File size (bytes):', fileData.byteLength);
  console.log('File size (KB):', (fileData.byteLength / 1024).toFixed(2));
  console.log('Content type: image/webp');

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileData, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (uploadError) {
    console.error('=== SUPABASE UPLOAD ERROR ===');
    console.error('Error:', uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  console.log('=== UPLOAD SUCCESS ===');

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

  // Create media record in database
  const { data: mediaData, error: dbError } = await supabase
    .from('media')
    .insert({
      user_id: user.id,
      child_id: params.childId,
      url: publicUrl,
      type: 'image/webp', // ✅ Always WebP format
      caption: params.caption || null,
    })
    .select()
    .single();

  if (dbError) {
    // Cleanup uploaded file if DB insert fails
    await supabase.storage.from(BUCKET_NAME).remove([fileName]);
    throw new Error(`Database insert failed: ${dbError.message}`);
  }

  return mediaData;
}

/**
 * Get all media for a child
 */
export async function getMediaByChild(childId: string): Promise<Media[]> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('child_id', childId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Get media error:', error);
    throw new Error(`Failed to fetch media: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all media for current user
 */
export async function getAllUserMedia(): Promise<Media[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Get media error:', error);
    throw new Error(`Failed to fetch media: ${error.message}`);
  }

  return data || [];
}

/**
 * Delete media (removes from storage and database)
 */
export async function deleteMedia(mediaId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get media record first to get storage path
  const { data: media, error: fetchError } = await supabase
    .from('media')
    .select('*')
    .eq('id', mediaId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !media) {
    throw new Error('Media not found or access denied');
  }

  // Extract file path from URL
  const urlParts = media.url.split(`${BUCKET_NAME}/`);
  if (urlParts.length < 2) {
    throw new Error('Invalid media URL format');
  }
  const filePath = urlParts[1].split('?')[0]; // Remove query params if any

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (storageError) {
    console.warn('Storage delete warning:', storageError);
    // Continue to delete DB record even if storage delete fails
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('media')
    .delete()
    .eq('id', mediaId)
    .eq('user_id', user.id);

  if (dbError) {
    throw new Error(`Failed to delete media record: ${dbError.message}`);
  }
}

/**
 * Update media caption
 */
export async function updateMediaCaption(
  mediaId: string,
  caption: string
): Promise<Media> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('media')
    .update({ caption })
    .eq('id', mediaId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update caption: ${error.message}`);
  }

  return data;
}
