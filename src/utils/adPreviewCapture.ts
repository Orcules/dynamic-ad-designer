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

    // Get dimensions based on platform
    const { width, height } = getDimensions(platform);

    // Create a temporary container with exact dimensions
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "fixed";
    tempContainer.style.left = "-9999px";
    tempContainer.style.width = `${width}px`;
    tempContainer.style.height = `${height}px`;
    tempContainer.style.overflow = "hidden";

    // Clone the preview element with all its children
    const clone = previewElement.cloneNode(true) as HTMLElement;
    
    // Copy all computed styles from original to clone
    const computedStyle = window.getComputedStyle(previewElement);
    for (const prop of computedStyle) {
      clone.style[prop as any] = computedStyle.getPropertyValue(prop);
    }

    // Ensure proper positioning and dimensions
    clone.style.position = "absolute";
    clone.style.width = "100%";
    clone.style.height = "100%";
    clone.style.transform = "none";

    // Copy styles for all child elements
    const originalChildren = previewElement.getElementsByTagName("*");
    const cloneChildren = clone.getElementsByTagName("*");
    
    for (let i = 0; i < originalChildren.length; i++) {
      const originalChild = originalChildren[i] as HTMLElement;
      const cloneChild = cloneChildren[i] as HTMLElement;
      
      const childComputedStyle = window.getComputedStyle(originalChild);
      for (const prop of childComputedStyle) {
        cloneChild.style[prop as any] = childComputedStyle.getPropertyValue(prop);
      }
    }

    // Add clone to temporary container and append to body
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    // Capture the preview with html2canvas
    const canvas = await html2canvas(clone, {
      width,
      height,
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".ad-content") as HTMLElement;
        if (clonedElement) {
          // Preserve background styles
          const styles = window.getComputedStyle(previewElement);
          clonedElement.style.background = styles.background;
          clonedElement.style.backgroundImage = styles.backgroundImage;
          
          // Ensure text styles are preserved
          const textElements = clonedElement.querySelectorAll("h2, p, button");
          textElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              const originalEl = previewElement.querySelector(`${el.tagName.toLowerCase()}`) as HTMLElement;
              if (originalEl) {
                const originalStyles = window.getComputedStyle(originalEl);
                el.style.fontFamily = originalStyles.fontFamily;
                el.style.fontSize = originalStyles.fontSize;
                el.style.fontWeight = originalStyles.fontWeight;
                el.style.color = originalStyles.color;
                el.style.textShadow = originalStyles.textShadow;
              }
            }
          });
        }
      }
    });

    // Clean up
    document.body.removeChild(tempContainer);

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
      }, "image/png", 1.0); // Maximum quality
    });

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}