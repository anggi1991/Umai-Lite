/**
 * Image Compression Utility
 * Compress images to WebP format before uploading to reduce storage and bandwidth
 */

import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compress image to WebP format
 * 
 * @param uri - Original image URI
 * @param options - Compression options
 * @returns Compressed image URI (WebP format)
 */
export async function compressToWebP(
  uri: string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
  } = options;

  try {
    console.log('🔄 Compressing image to WebP...');
    console.log('Original URI:', uri);
    console.log('Max dimensions:', maxWidth, 'x', maxHeight);
    console.log('Quality:', quality);

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.WEBP,
      }
    );

    console.log('✅ Compressed to WebP:', result.uri);
    console.log('New dimensions:', result.width, 'x', result.height);

    return result.uri;
  } catch (error) {
    console.error('❌ Compression failed:', error);
    // Fallback to original URI if compression fails
    return uri;
  }
}

/**
 * Compress profile photo (512x512, optimized for avatars)
 */
export async function compressProfilePhoto(uri: string): Promise<string> {
  return compressToWebP(uri, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.85,
  });
}

/**
 * Compress child photo (800x800, good balance for profile pics)
 */
export async function compressChildPhoto(uri: string): Promise<string> {
  return compressToWebP(uri, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.85,
  });
}

/**
 * Compress media gallery photo (1920x1920, high quality for memories)
 */
export async function compressGalleryPhoto(uri: string): Promise<string> {
  return compressToWebP(uri, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
  });
}

/**
 * Compress chat attachment (1280x1280, balance between quality and size)
 */
export async function compressChatPhoto(uri: string): Promise<string> {
  return compressToWebP(uri, {
    maxWidth: 1280,
    maxHeight: 1280,
    quality: 0.80,
  });
}

/**
 * Get estimated file size after compression
 * Note: This is approximate, actual size depends on image content
 */
export function estimateCompressedSize(
  originalSize: number,
  compressionRatio: number = 0.3 // WebP typically reduces to 30% of original
): number {
  return Math.round(originalSize * compressionRatio);
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
