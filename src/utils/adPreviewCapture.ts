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
    console.log(`Capturing preview with dimensions: ${width}x${height}`);

    // Create a temporary container with exact dimensions
    const tempContainer = document.createElement("div");
    tempContainer.style.width = `${width}px`;
    tempContainer.style.height = `${height}px`;
    tempContainer.style.position = "fixed";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.style.overflow = "hidden";
    tempContainer.style.transform = "none";
    tempContainer.style.transformOrigin = "0 0";
    tempContainer.style.backgroundColor = "transparent";

    // Clone the preview element
    const clone = previewElement.cloneNode(true) as HTMLElement;
    
    // Reset any transforms or animations that might affect the layout
    clone.classList.add('capturing');
    clone.style.transform = "none !important";
    clone.style.transition = "none !important";
    clone.style.animation = "none !important";
    clone.style.position = "absolute !important";
    clone.style.top = "0 !important";
    clone.style.left = "0 !important";
    clone.style.width = "100% !important";
    clone.style.height = "100% !important";
    
    // Copy computed styles from original to clone
    const computedStyle = window.getComputedStyle(previewElement);
    for (const prop of computedStyle) {
      if (!prop.includes("transform") && !prop.includes("animation") && !prop.includes("transition")) {
        clone.style[prop as any] = computedStyle.getPropertyValue(prop);
      }
    }

    // Copy styles for child elements, excluding animations and transforms
    const originalChildren = previewElement.getElementsByTagName("*");
    const cloneChildren = clone.getElementsByTagName("*");
    
    for (let i = 0; i < originalChildren.length; i++) {
      const originalChild = originalChildren[i] as HTMLElement;
      const cloneChild = cloneChildren[i] as HTMLElement;
      
      cloneChild.classList.add('capturing');
      const childComputedStyle = window.getComputedStyle(originalChild);
      
      // Copy all styles except transforms and animations
      for (const prop of childComputedStyle) {
        if (!prop.includes("transform") && !prop.includes("animation") && !prop.includes("transition")) {
          cloneChild.style[prop as any] = childComputedStyle.getPropertyValue(prop);
        }
      }
      
      // Reset any transforms or animations on child elements
      cloneChild.style.transform = "none !important";
      cloneChild.style.transition = "none !important";
      cloneChild.style.animation = "none !important";
      
      // Handle images specifically
      if (cloneChild.tagName.toLowerCase() === 'img') {
        cloneChild.style.position = "absolute";
        cloneChild.style.width = "100%";
        cloneChild.style.height = "100%";
        cloneChild.style.objectFit = "cover";
        cloneChild.style.top = "0";
        cloneChild.style.left = "0";
      }
    }

    // Add clone to temporary container and append to body
    tempContainer.appendChild(clone);
    document.body.appendChild(tempContainer);

    // Capture the preview with html2canvas
    const canvas = await html2canvas(tempContainer, {
      width,
      height,
      scale: 4, // Increased scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".ad-content") as HTMLElement;
        if (clonedElement) {
          // Preserve background styles
          clonedElement.style.background = computedStyle.background;
          clonedElement.style.backgroundImage = computedStyle.backgroundImage;
          
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
                el.style.transform = "none !important";
                el.style.transition = "none !important";
                el.style.animation = "none !important";
                el.style.position = "static";
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
      }, "image/png", 1.0);
    });

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}