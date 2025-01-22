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

    // Wait for all fonts to load
    await document.fonts.ready;
    
    // Wait for all images to load
    const images = previewElement.getElementsByTagName('img');
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(null);
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null); // Continue even if image fails
          })
      )
    );

    console.log("All images loaded");
    console.log("Fonts loaded");

    // Create canvas with the exact dimensions
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
          // Preserve exact dimensions
          clonedElement.style.width = `${width}px`;
          clonedElement.style.height = `${height}px`;
          
          // Ensure all child elements maintain their styles
          const allElements = clonedElement.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            const computedStyle = window.getComputedStyle(el);
            
            // Preserve essential styles
            el.style.fontFamily = computedStyle.fontFamily;
            el.style.fontSize = computedStyle.fontSize;
            el.style.fontWeight = computedStyle.fontWeight;
            el.style.lineHeight = computedStyle.lineHeight;
            el.style.letterSpacing = computedStyle.letterSpacing;
            el.style.textAlign = computedStyle.textAlign;
            el.style.color = computedStyle.color;
            el.style.backgroundColor = computedStyle.backgroundColor;
            el.style.backgroundImage = computedStyle.backgroundImage;
            el.style.boxShadow = computedStyle.boxShadow;
            el.style.textShadow = computedStyle.textShadow;
            el.style.borderRadius = computedStyle.borderRadius;
            el.style.padding = computedStyle.padding;
            el.style.margin = computedStyle.margin;
            
            // Remove any transforms or transitions
            el.style.transform = 'none';
            el.style.transition = 'none';
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