import html2canvas from "html2canvas";

export async function capturePreview(
  previewRef: React.RefObject<HTMLDivElement>,
  platform: string
): Promise<File | null> {
  if (!previewRef.current) {
    console.error("Preview element not found");
    return null;
  }

  try {
    const adElement = previewRef.current.querySelector('.ad-content');
    if (!adElement) {
      console.error('Ad content element not found');
      return null;
    }

    console.log('Starting preview capture process...');

    // Add capturing class
    adElement.classList.add('capturing');

    // Wait for fonts to load
    await document.fonts.ready;
    console.log('Fonts loaded successfully');

    // Wait for images to load
    const images = adElement.getElementsByTagName('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
        });
      })
    );
    console.log('All images loaded successfully');

    // Get exact dimensions
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
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.ad-content');
        if (clonedElement) {
          clonedElement.classList.add('capturing');
          const styles = window.getComputedStyle(adElement);
          Array.from(styles).forEach(key => {
            (clonedElement as HTMLElement).style[key as any] = styles.getPropertyValue(key);
          });
        }
      }
    });

    console.log('Canvas captured successfully');

    // Remove capturing class
    adElement.classList.remove('capturing');

    // Convert to high quality JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
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
  }
}