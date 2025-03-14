
import { Logger } from "@/utils/logger";
import { cleanImageUrl } from "@/utils/imageEffects";

export const createImagePreview = (imageUrl: string): void => {
  if (!imageUrl) return;
    
  const cleanUrl = cleanImageUrl(imageUrl);
  Logger.info(`Previewing image: ${cleanUrl.substring(0, 50)}...`);
  
  try {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.padding = '20px';
    
    const img = document.createElement('img');
    img.src = cleanUrl;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '80%';
    img.style.objectFit = 'contain';
    img.style.border = '1px solid #333';
    img.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    img.style.backgroundSize = 'contain';
    img.style.backgroundPosition = 'center center';
    img.style.backgroundColor = '#000';
    
    img.onload = () => {
      Logger.info(`Image loaded for preview: ${img.naturalWidth}x${img.naturalHeight}`);
    };
    
    img.onerror = () => {
      Logger.error(`Failed to load preview image: ${cleanUrl}`);
      img.src = "/placeholder.svg";
      img.style.maxWidth = '300px';
      img.style.maxHeight = '300px';
    };
    
    const closeButton = document.createElement('button');
    closeButton.innerText = 'סגור';
    closeButton.style.marginTop = '20px';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#333';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.onclick = () => {
      document.body.removeChild(overlay);
    };
    
    overlay.appendChild(img);
    overlay.appendChild(closeButton);
    
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    };
    
    document.body.appendChild(overlay);
  } catch (error) {
    Logger.error(`Error showing preview: ${error instanceof Error ? error.message : String(error)}`);
  }
};
