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

    // Wait for all fonts to load with a timeout
    await Promise.race([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 3000))
    ]);
    
    // Wait for all images to load
    const images = previewElement.getElementsByTagName('img');
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(null);
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
            // Add timeout for each image
            setTimeout(() => resolve(null), 3000);
          })
      )
    );

    console.log("All resources loaded");

    // Create canvas with high quality settings
    const canvas = await html2canvas(previewElement, {
      width,
      height,
      scale: 4, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".ad-content") as HTMLElement;
        if (clonedElement) {
          clonedElement.style.width = `${width}px`;
          clonedElement.style.height = `${height}px`;
          
          // Preserve all styles for each element
          const allElements = clonedElement.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            const computedStyle = window.getComputedStyle(el);
            
            // Copy essential styles
            Object.assign(el.style, {
              fontFamily: computedStyle.fontFamily,
              fontSize: computedStyle.fontSize,
              fontWeight: computedStyle.fontWeight,
              lineHeight: computedStyle.lineHeight,
              letterSpacing: computedStyle.letterSpacing,
              textAlign: computedStyle.textAlign,
              color: computedStyle.color,
              backgroundColor: computedStyle.backgroundColor,
              backgroundImage: computedStyle.backgroundImage,
              boxShadow: computedStyle.boxShadow,
              textShadow: computedStyle.textShadow,
              borderRadius: computedStyle.borderRadius,
              padding: computedStyle.padding,
              margin: computedStyle.margin,
              transform: 'none',
              transition: 'none'
            });
          }
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
          console.log("File created successfully");
          const file = new File([blob], "ad-preview.png", {
            type: "image/png",
            lastModified: Date.now(),
          });
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