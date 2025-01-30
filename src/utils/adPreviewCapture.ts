import html2canvas from "html2canvas";

export async function capturePreview(
  previewRef: React.RefObject<HTMLDivElement>,
  platform: string
): Promise<File | null> {
  if (!previewRef.current) {
    console.error("Preview element not found");
    return null;
  }

  let adElement: Element | null = null;
  
  try {
    adElement = previewRef.current.querySelector('.ad-content');
    if (!adElement) {
      console.error('Ad content element not found');
      return null;
    }

    console.log('Starting preview capture process...');

    // Add capturing class before any operations
    adElement.classList.add('capturing');

    // Wait for fonts to load
    await document.fonts.ready;
    console.log('Fonts loaded successfully');

    // Wait for images to load with a more robust approach
    const images = Array.from(adElement.getElementsByTagName('img'));
    if (images.length > 0) {
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalHeight !== 0) {
            return Promise.resolve();
          }
          return new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`Image load timeout: ${img.src}`));
            }, 10000); // 10 second timeout

            img.onload = () => {
              clearTimeout(timeout);
              // Force a small delay after image loads to ensure rendering
              setTimeout(resolve, 100);
            };
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error(`Failed to load image: ${img.src}`));
            };
          });
        })
      );
    }
    console.log('All images loaded successfully');

    // Force layout recalculation and wait a moment
    adElement.getBoundingClientRect();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get exact dimensions after layout is stable
    const rect = adElement.getBoundingClientRect();
    
    // Create canvas with exact dimensions
    const canvas = await html2canvas(adElement as HTMLElement, {
      useCORS: true,
      scale: 2,
      width: rect.width,
      height: rect.height,
      backgroundColor: null,
      logging: true,
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: false,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.ad-content');
        if (clonedElement) {
          clonedElement.classList.add('capturing');
          // Copy all computed styles
          const styles = window.getComputedStyle(adElement as HTMLElement);
          Array.from(styles).forEach(key => {
            (clonedElement as HTMLElement).style[key as any] = styles.getPropertyValue(key);
          });
        }
      }
    });

    console.log('Canvas captured successfully');

    // Convert to high quality JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    const file = new File([blob], "ad-preview.jpg", { 
      type: "image/jpeg",
      lastModified: Date.now()
    });

    console.log('JPEG file created successfully');
    return file;

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  } finally {
    // Remove capturing class in finally block to ensure it's always removed
    if (adElement) {
      adElement.classList.remove('capturing');
    }
  }
}