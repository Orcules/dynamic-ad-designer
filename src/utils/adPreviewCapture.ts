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
    // Specifically target the ad-content element
    const previewElement = previewRef.current.querySelector('.ad-content');
    if (!previewElement) {
      console.error('Ad content element not found');
      return null;
    }

    console.log('Starting preview capture...');

    // Wait for fonts to load
    await document.fonts.ready;
    console.log('Fonts loaded');

    // Wait for all images to load
    const images = previewElement.getElementsByTagName('img');
    if (images.length > 0) {
      console.log(`Waiting for ${images.length} images to load...`);
      await Promise.all(
        Array.from(images).map((img) => {
          return new Promise<void>((resolve, reject) => {
            if (img.complete && img.naturalHeight !== 0) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
            }
          });
        })
      );
      console.log('All images loaded');
    }

    // Add a small delay to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('Capturing with html2canvas...');

    // Capture the preview using html2canvas with optimized settings
    const canvas = await html2canvas(previewElement as HTMLElement, {
      useCORS: true,
      scale: 2,
      logging: true,
      backgroundColor: null,
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.ad-content');
        if (clonedElement) {
          clonedElement.classList.add('capturing');
        }
      }
    });

    console.log('Canvas captured, converting to data URL...');

    // Convert canvas to data URL with maximum quality PNG
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    
    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Create File from Blob
    const file = new File([blob], "ad-preview.png", { 
      type: "image/png",
      lastModified: Date.now()
    });
    
    console.log('File created successfully');
    return file;

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}