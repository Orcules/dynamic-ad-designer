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
    const previewElement = previewRef.current.querySelector(".ad-content");
    if (!previewElement) {
      console.error("Ad content element not found");
      return null;
    }

    // Create a temporary container with the correct dimensions
    const { width, height } = getDimensions(platform);
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "fixed";
    tempContainer.style.left = "-9999px";
    tempContainer.style.width = `${width}px`;
    tempContainer.style.height = `${height}px`;

    // Clone the preview element
    const clone = previewElement.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.width = "100%";
    clone.style.height = "100%";

    // Copy computed styles from the original element to maintain exact appearance
    const originalStyles = window.getComputedStyle(previewElement as HTMLElement);
    Array.from(originalStyles).forEach(key => {
      clone.style[key as any] = originalStyles.getPropertyValue(key);
    });

    // Copy styles for child elements (text, button, etc.)
    const originalChildren = Array.from(previewElement.getElementsByTagName("*"));
    const cloneChildren = Array.from(clone.getElementsByTagName("*"));

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

    // Use html2canvas with improved settings
    const canvas = await html2canvas(clone, {
      width,
      height,
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: true,
      onclone: (clonedDoc) => {
        // Additional style fixes can be added here if needed
        const clonedElement = clonedDoc.querySelector(".ad-content");
        if (clonedElement instanceof HTMLElement) {
          // Ensure gradients and other effects are preserved
          const styles = window.getComputedStyle(previewElement as HTMLElement);
          clonedElement.style.background = styles.background;
          clonedElement.style.backgroundImage = styles.backgroundImage;
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
        const file = new File([blob], "ad-preview.png", { type: "image/png" });
        resolve(file);
      }, "image/png", 1.0);
    });

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}