import html2canvas from "html2canvas";
import { getDimensions } from "./adDimensions";

export const capturePreview = async (previewRef: React.RefObject<HTMLDivElement>, platform: string) => {
  if (!previewRef.current) return null;
  
  const previewElement = previewRef.current.querySelector('.ad-content');
  if (!previewElement) return null;
  
  try {
    await document.fonts.ready;
    
    const { width, height } = getDimensions(platform);
    
    const previewContainer = document.createElement('div');
    previewContainer.style.width = `${width}px`;
    previewContainer.style.height = `${height}px`;
    previewContainer.style.position = 'fixed';
    previewContainer.style.top = '0';
    previewContainer.style.left = '0';
    previewContainer.style.zIndex = '-1000';
    previewContainer.style.opacity = '0';
    
    const clone = previewElement.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.width = '100%';
    clone.style.height = '100%';
    
    previewContainer.appendChild(clone);
    document.body.appendChild(previewContainer);
    
    const canvas = await html2canvas(previewContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: width,
      height: height,
      logging: true,
    });
    
    document.body.removeChild(previewContainer);
    
    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'ad-preview.png', { type: 'image/png' });
          resolve(file);
        }
      }, 'image/png', 1.0);
    });
  } catch (error) {
    console.error('Error capturing preview:', error);
    return null;
  }
};