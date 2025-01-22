import html2canvas from "html2canvas";
import { getDimensions } from "./adDimensions";

export const capturePreview = async (previewRef: React.RefObject<HTMLDivElement>, platform: string): Promise<File | null> => {
  if (!previewRef.current) return null;
  
  const previewElement = previewRef.current.querySelector('.ad-content');
  if (!previewElement) return null;
  
  try {
    // Wait for all fonts to load
    await document.fonts.ready;
    
    const { width, height } = getDimensions(platform);
    
    // Create a temporary container with exact dimensions
    const tempContainer = document.createElement('div');
    tempContainer.style.width = `${width}px`;
    tempContainer.style.height = `${height}px`;
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '0';
    tempContainer.style.left = '0';
    tempContainer.style.zIndex = '-1000';
    tempContainer.style.opacity = '0';
    
    // Clone the preview element with all its styles
    const clone = previewElement.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.width = '100%';
    clone.style.height = '100%';
    
    // Copy computed styles from the original element to maintain exact appearance
    const originalStyles = window.getComputedStyle(previewElement as HTMLElement);
    Array.from(originalStyles).forEach(key => {
      clone.style[key as any] = originalStyles.getPropertyValue(key);
    });
    
    // Copy styles for child elements (text, button, etc.)
    const originalChildren = Array.from(previewElement.getElementsByTagName('*'));
    const cloneChildren = Array.from(clone.getElementsByTagName('*'));
    
    originalChildren.forEach((originalChild, index) => {
      const cloneChild = cloneChildren[index];
      if (originalChild instanceof HTMLElement && cloneChild instanceof HTMLElement) {
        const childStyles = window.getComputedStyle(originalChild);
        Array.from(childStyles).forEach(key => {
          cloneChild.style[key as any] = childStyles.getPropertyValue(key);
        });
      }
    });
    
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);
    
    // Use html2canvas with settings to maintain quality and styles
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: width,
      height: height,
      logging: true,
      onclone: (clonedDoc) => {
        // Additional style fixes can be added here if needed
        const clonedElement = clonedDoc.querySelector('.ad-content');
        if (clonedElement instanceof HTMLElement) {
          // Ensure gradients and other effects are preserved
          const styles = window.getComputedStyle(previewElement as HTMLElement);
          clonedElement.style.background = styles.background;
          clonedElement.style.backgroundImage = styles.backgroundImage;
        }
      }
    });
    
    document.body.removeChild(tempContainer);
    
    // Convert to high-quality PNG file
    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'ad-preview.png', { 
            type: 'image/png',
          });
          resolve(file);
        }
      }, 'image/png', 1.0); // Maximum quality
    });
  } catch (error) {
    console.error('Error capturing preview:', error);
    return null;
  }
};