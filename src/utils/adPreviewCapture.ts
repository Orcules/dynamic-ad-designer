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

    // Create a clone of the preview element to manipulate
    const clone = previewElement.cloneNode(true) as HTMLElement;
    const container = document.createElement('div');
    container.appendChild(clone);
    
    // Set up the clone with exact dimensions and styling
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.position = 'absolute';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.padding = '0';
    clone.style.borderRadius = '0';
    
    // Ensure all child elements maintain their styles
    const allElements = clone.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i] as HTMLElement;
      const computedStyle = window.getComputedStyle(el);
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
      el.style.transform = 'none';
      el.style.transition = 'none';
    }

    // Ensure all images are loaded before capture
    const images = clone.getElementsByTagName('img');
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve, reject) => {
            if (img.complete) resolve(null);
            img.onload = () => resolve(null);
            img.onerror = reject;
          })
      )
    );

    // Capture the preview with high quality settings
    const canvas = await html2canvas(clone, {
      width,
      height,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector(".ad-content") as HTMLElement;
        if (clonedElement) {
          clonedElement.style.width = `${width}px`;
          clonedElement.style.height = `${height}px`;
        }
      }
    });

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
          resolve(file);
        },
        "image/png",
        1.0
      );
    });

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}