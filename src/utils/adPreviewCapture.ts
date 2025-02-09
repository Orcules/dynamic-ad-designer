
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

    adElement.classList.add('capturing');

    await document.fonts.ready;
    console.log('Fonts loaded successfully');

    const images = Array.from(adElement.getElementsByTagName('img'));
    if (images.length > 0) {
      console.log(`Waiting for ${images.length} images to load...`);
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalHeight !== 0) {
            return Promise.resolve();
          }
          return new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error(`Image load timeout: ${img.src}`));
            }, 10000);

            img.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error(`Failed to load image: ${img.src}`));
            };
          });
        })
      );
      console.log('All images loaded successfully');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const rect = adElement.getBoundingClientRect();
    console.log('Element dimensions:', { width: rect.width, height: rect.height });

    const canvas = await html2canvas(adElement as HTMLElement, {
      useCORS: true,
      scale: 2,
      width: rect.width,
      height: rect.height,
      backgroundColor: null,
      logging: true,
      allowTaint: true,
      foreignObjectRendering: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('.ad-content');
        if (clonedElement) {
          clonedElement.classList.add('capturing');
        }
      }
    });

    console.log('Canvas created, converting to image...');
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          resolve(null);
          return;
        }
        
        const file = new File([blob], "ad-preview.jpg", { 
          type: "image/jpeg",
          lastModified: Date.now()
        });
        console.log('Image file created successfully');
        resolve(file);
      }, 'image/jpeg', 1.0);
    });

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  } finally {
    if (adElement) {
      adElement.classList.remove('capturing');
    }
  }
}
