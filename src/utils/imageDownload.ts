
import { Logger } from "@/utils/logger";
import { cleanImageUrl } from "@/utils/imageEffects";
import { toast } from "sonner";

export interface GeneratedAd {
  id: string;
  name: string;
  image_url: string;
  preview_url?: string;
  platform?: string;
  originalFilename?: string;
}

export const downloadImage = (ad: GeneratedAd): void => {
  if (!ad.preview_url && !ad.image_url) return;
  
  const imageUrl = cleanImageUrl(ad.preview_url || ad.image_url);
  Logger.info(`Attempting to download image: ${imageUrl.substring(0, 50)}...`);
  
  let filename = 'ad.png';
  if (ad.originalFilename) {
    filename = ad.originalFilename;
  } else if (ad.name) {
    const urlParts = imageUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    if (lastPart && lastPart.includes('.')) {
      filename = lastPart;
    } else {
      filename = `${ad.name.replace(/\s+/g, '-')}.png`;
    }
  }
  
  if (imageUrl.startsWith('blob:')) {
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      Logger.info(`Downloaded blob image as: ${filename}`);
      return;
    } catch (err) {
      Logger.error(`Error downloading blob image: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  try {
    const isExternalUrl = imageUrl.startsWith('http') && !imageUrl.includes(window.location.hostname);
    
    if (isExternalUrl) {
      fetch(imageUrl, { mode: 'cors', cache: 'no-store' })
        .then(response => {
          if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
          return response.blob();
        })
        .then(blob => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
          Logger.info(`Downloaded image from external URL as: ${filename}`);
        })
        .catch(error => {
          Logger.error(`Failed to download from external URL: ${error.message}`);
          const a = document.createElement('a');
          a.href = imageUrl;
          a.download = filename;
          a.target = '_self';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
    } else {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      Logger.info(`Downloaded image as: ${filename}`);
    }
  } catch (err) {
    Logger.error(`Error downloading image: ${err instanceof Error ? err.message : String(err)}`);
    toast.error("Failed to download image");
  }
};
