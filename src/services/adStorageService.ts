import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "@/utils/adSubmissionUtils";

export interface StorageUploadResult {
  path: string;
  url: string;
}

export class AdStorageService {
  static async uploadOriginalImage(imageBlob: Blob, fileName: string, uploadId: string): Promise<StorageUploadResult> {
    const sanitizedFileName = sanitizeFileName(fileName);
    const timestamp = Date.now();
    const path = `original/${uploadId}_${timestamp}_${sanitizedFileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('ad-images')
      .upload(path, imageBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Original image upload error:', uploadError);
      throw new Error('Failed to upload original image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(path);

    return { path, url: publicUrl };
  }

  static async uploadPreviewImage(previewBlob: Blob, uploadId: string): Promise<StorageUploadResult> {
    const timestamp = Date.now();
    const path = `generated/${uploadId}_${timestamp}_preview.png`;
    
    const { error: uploadError } = await supabase.storage
      .from('ad-images')
      .upload(path, previewBlob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Preview upload error:', uploadError);
      throw new Error('Failed to upload preview');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(path);

    return { path, url: publicUrl };
  }

  static async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('ad-images')
      .remove([path]);
    
    if (error) {
      console.error(`Failed to delete file ${path}:`, error);
    }
  }
}