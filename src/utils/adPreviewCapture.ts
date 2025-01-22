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
    const previewElement = previewRef.current.querySelector(".ad-content") as HTMLElement;
    if (!previewElement) {
      console.error("Ad content element not found");
      return null;
    }

    const { width, height } = getDimensions(platform);
    console.log(`Capturing preview with dimensions: ${width}x${height}`);

    // Force all fonts to load first
    await document.fonts.ready;
    console.log("Fonts loaded");

    // Set exact dimensions on the preview element
    previewElement.style.width = `${width}px`;
    previewElement.style.height = `${height}px`;

    // Wait for all images to load completely
    const images = Array.from(previewElement.getElementsByTagName('img'));
    console.log(`Waiting for ${images.length} images to load`);
    
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve(null);
          img.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            resolve(null);
          };
        });
      })
    );
    
    console.log("All images loaded");

    // Create high-quality canvas
    const canvas = await html2canvas(previewElement, {
      width,
      height,
      scale: 4, // Increased for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".ad-content") as HTMLElement;
        if (clonedElement) {
          // Set exact dimensions
          clonedElement.style.width = `${width}px`;
          clonedElement.style.height = `${height}px`;
          clonedElement.style.position = 'relative';
          clonedElement.style.overflow = 'hidden';
          
          // Process all elements to maintain styles
          const allElements = clonedElement.getElementsByTagName('*');
          Array.from(allElements).forEach((el) => {
            if (el instanceof HTMLElement) {
              const computedStyle = window.getComputedStyle(el);
              
              // Copy all essential styles
              const stylesToCopy = [
                'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
                'letterSpacing', 'textAlign', 'color', 'backgroundColor',
                'backgroundImage', 'boxShadow', 'textShadow', 'borderRadius',
                'padding', 'margin', 'border', 'opacity', 'filter'
              ];
              
              stylesToCopy.forEach(style => {
                el.style[style as any] = computedStyle[style as any];
              });

              // Remove transformations and transitions
              el.style.transform = 'none';
              el.style.transition = 'none';
              
              // Ensure text remains crisp
              el.style.textRendering = 'optimizeLegibility';
              el.style.webkitFontSmoothing = 'antialiased';
              el.style.mozOsxFontSmoothing = 'grayscale';
            }
          });
        }
      }
    });

    console.log("Canvas created, converting to blob");

    // Convert to high-quality PNG
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Failed to create blob from canvas");
            resolve(null);
            return;
          }
          const file = new File([blob], "ad-preview.png", {
            type: "image/png",
            lastModified: Date.now(),
          });
          console.log("File created successfully");
          resolve(file);
        },
        "image/png",
        1.0 // Maximum quality
      );
    });

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}