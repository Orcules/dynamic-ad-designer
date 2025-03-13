
import { Logger } from '@/utils/logger';

/**
 * Convert a data URL to a File object
 */
export const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File | null> => {
  try {
    // Extract the base64 part of the data URL
    const arr = dataUrl.split(',');
    if (arr.length < 2) {
      throw new Error('Invalid data URL format');
    }
    
    // Determine mime type from the data URL
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    
    // Convert base64 to binary
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  } catch (error) {
    Logger.error(`Error converting data URL to file: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

/**
 * Create a filename with metadata embedded
 */
export const createMetadataFilename = (
  adName: string | undefined,
  language: string | undefined,
  fontName: string | undefined,
  aspectRatio: string | undefined,
  templateStyle: string | undefined,
  version: number = 1,
  extension: string = 'jpg'
): string => {
  const dateStr = new Date().toISOString().split('T')[0];
  const sanitizedName = adName ? adName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '').substring(0, 50) : `ad_${Date.now()}`;
  const lang = language ? language.toLowerCase() : 'unknown';
  const font = fontName ? fontName.toLowerCase() : 'default';
  const ratio = aspectRatio || '1-1';
  const style = templateStyle || 'standard';
  const ver = version || 1;
  
  return `${sanitizedName}-${dateStr}-${lang}-${font}-${ratio}-${style}-Ver${ver}.${extension}`;
};
