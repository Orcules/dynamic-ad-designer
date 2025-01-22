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
    const previewElement = previewRef.current.querySelector('.ad-content') as HTMLElement;
    if (!previewElement) {
      throw new Error('Ad content element not found');
    }

    // Wait for fonts to load
    await document.fonts.ready;

    // Wait for all images to load
    const images = previewElement.getElementsByTagName("img");
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

    // Add capturing class to ensure proper rendering
    previewElement.classList.add('capturing');

    // Capture the preview using html2canvas
    const canvas = await html2canvas(previewElement, {
      useCORS: true, // Allow external images
      scale: 2, // For higher quality
      logging: true, // For debugging
      backgroundColor: null, // For transparent background
      allowTaint: true, // Allow cross-origin images
      foreignObjectRendering: true // Better handling of external content
    });

    // Remove capturing class
    previewElement.classList.remove('capturing');

    // Convert canvas to file
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
      }, "image/png", 1.0); // Maximum quality
    });

  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}