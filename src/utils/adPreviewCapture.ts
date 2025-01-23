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
    
    // Force a layout calculation and wait for all CSS to be applied
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
    
    // Create an exact clone of the preview element
    const clone = previewElement.cloneNode(true) as HTMLElement;
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      // Copy all computed styles from the original element to the clone
      const originalStyles = window.getComputedStyle(previewElement);
      Array.from(originalStyles).forEach(key => {
        clone.style[key as any] = originalStyles.getPropertyValue(key);
      });

      // Set explicit dimensions on the clone
      const rect = previewElement.getBoundingClientRect();
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;

      // Capture the clone with html2canvas
      const canvas = await html2canvas(clone, {
        useCORS: true,
        scale: 2,
        logging: true,
        backgroundColor: null,
        allowTaint: true,
        foreignObjectRendering: true,
        removeContainer: true,
        imageTimeout: 15000,
        width: rect.width,
        height: rect.height,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.ad-content');
          if (clonedElement) {
            // Copy all styles again in the cloned document
            const styles = window.getComputedStyle(previewElement);
            Array.from(styles).forEach(key => {
              (clonedElement as HTMLElement).style[key as any] = styles.getPropertyValue(key);
            });
          }
        }
      });

      console.log('Canvas captured, converting to JPEG...');
      
      // Convert to JPEG with high quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      console.log('JPEG Data URL created');
      
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const file = new File([blob], "ad-preview.jpg", { 
        type: "image/jpeg",
        lastModified: Date.now()
      });
      
      console.log('JPEG File created successfully');
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