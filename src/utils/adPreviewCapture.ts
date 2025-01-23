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
    const previewElement = previewRef.current.querySelector('.ad-content');
    if (!previewElement) {
      console.error('Ad content element not found');
      return null;
    }

    console.log('Starting preview capture...');
    
    // Force a layout calculation
    previewElement.getBoundingClientRect();

    // Wait for fonts to load
    await document.fonts.ready;
    console.log('Fonts loaded');

    // Wait for all images to load
    const images = previewElement.getElementsByTagName('img');
    if (images.length > 0) {
      console.log(`Waiting for ${images.length} images to load...`);
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) {
            console.log(`Image ${img.src} already loaded`);
            return Promise.resolve();
          }
          return new Promise<void>((resolve, reject) => {
            img.onload = () => {
              console.log(`Image ${img.src} loaded successfully`);
              resolve();
            };
            img.onerror = () => {
              console.error(`Failed to load image: ${img.src}`);
              reject(new Error(`Failed to load image: ${img.src}`));
            };
          });
        })
      );
      console.log('All images loaded');
    }

    // Add a delay to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Capturing with html2canvas...');
    
    // Clone the element to avoid modifying the original
    const clone = previewElement.cloneNode(true) as HTMLElement;
    const container = document.createElement('div');
    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(clone, {
        useCORS: true,
        scale: 2,
        logging: true,
        backgroundColor: null,
        allowTaint: true,
        foreignObjectRendering: true,
        removeContainer: true,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.ad-content');
          if (clonedElement) {
            // Force all computed styles to be applied
            const styles = window.getComputedStyle(previewElement);
            Array.from(styles).forEach(key => {
              (clonedElement as HTMLElement).style[key as any] = styles.getPropertyValue(key);
            });
          }
        }
      });

      console.log('Canvas captured, converting to data URL...');
      
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      console.log('Data URL created');
      
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const file = new File([blob], "ad-preview.png", { 
        type: "image/png",
        lastModified: Date.now()
      });
      
      console.log('File created successfully');
      return file;

    } finally {
      // Clean up
      document.body.removeChild(container);
    }

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}