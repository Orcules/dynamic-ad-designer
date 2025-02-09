
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

    // Force a layout reflow
    adElement.getBoundingClientRect();

    // Wait for fonts to load
    await document.fonts.ready;
    console.log('Fonts loaded successfully');

    // Wait for images to load
    const images = Array.from(adElement.getElementsByTagName('img'));
    if (images.length > 0) {
      console.log(`Waiting for ${images.length} images to load...`);
      await Promise.all(
        images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
          });
        })
      );
    }

    // Create canvas with specific settings for better quality
    const canvas = await html2canvas(adElement as HTMLElement, {
      useCORS: true,
      scale: 2,
      backgroundColor: '#ffffff',
      logging: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.ad-content');
        if (clonedElement) {
          clonedElement.classList.add('capturing');
          clonedElement.getBoundingClientRect();
        }
      },
      allowTaint: true,
      foreignObjectRendering: true
    });

    // Convert to file with high quality
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          resolve(null);
          return;
        }
        
        const file = new File([blob], "ad-preview.png", { 
          type: "image/png",
          lastModified: Date.now()
        });
        console.log('Image file created successfully');
        resolve(file);
      }, 'image/png', 1.0);
    });

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}
