import html2canvas from "html2canvas";
import { getDimensions } from "./adDimensions";

export async function capturePreview(
  previewRef: React.RefObject<HTMLDivElement>,
  platform: string
): Promise<File | null> {
  if (!previewRef.current) {
    console.error("Preview element not found");
    return null;
  }

  try {
    // Get the actual preview element that contains the ad content
    const previewElement = previewRef.current.querySelector(".ad-content") as HTMLElement;
    if (!previewElement) {
      console.error("Ad content element not found");
      return null;
    }

    // Get dimensions based on platform
    const { width, height } = getDimensions(platform);
    console.log(`Capturing preview with dimensions: ${width}x${height}`);

    // Create canvas at the exact dimensions we want
    const canvas = await html2canvas(previewElement, {
      width,
      height,
      scale: 2, // Balance between quality and performance
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".ad-content") as HTMLElement;
        if (clonedElement) {
          // Remove any transforms or animations
          clonedElement.style.transform = 'none';
          clonedElement.style.transition = 'none';
          clonedElement.style.animation = 'none';
          
          // Ensure proper dimensions
          clonedElement.style.width = `${width}px`;
          clonedElement.style.height = `${height}px`;
          
          // Handle text elements
          const textElements = clonedElement.querySelectorAll("h2, button");
          textElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.transform = 'none';
              el.style.transition = 'none';
              el.style.animation = 'none';
              el.style.maxWidth = '100%';
              el.style.overflow = 'visible';
              el.style.whiteSpace = 'normal';
              el.style.wordBreak = 'break-word';
            }
          });

          // Handle the image specifically
          const image = clonedElement.querySelector('img');
          if (image) {
            image.style.transform = 'none';
            image.style.width = '100%';
            image.style.height = '100%';
            image.style.objectFit = 'cover';
          }
        }
      }
    });

    // Convert canvas to blob/file
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Failed to create blob from canvas");
          resolve(null);
          return;
        }
        const file = new File([blob], "ad-preview.png", { 
          type: "image/png",
          lastModified: Date.now()
        });
        resolve(file);
      }, "image/png", 1.0);
    });

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}