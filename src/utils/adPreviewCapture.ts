import html2canvas from "html2canvas";

export async function capturePreview(
  previewRef: React.RefObject<HTMLDivElement>,
  platform?: string
): Promise<File | null> {
  if (!previewRef.current) {
    console.error("Preview element not found");
    return null;
  }

  try {
    const previewElement = previewRef.current.querySelector(".ad-preview") as HTMLElement;

    if (!previewElement) {
      console.error("Ad preview element not found");
      return null;
    }

    // Wait for all fonts to load
    await document.fonts.ready;

    // Wait for all images to load
    const images = previewElement.getElementsByTagName("img");
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve, reject) => {
            if (img.complete) {
              resolve(null);
            } else {
              img.onload = () => resolve(null);
              img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
            }
          })
      )
    );

    console.log('Capturing preview for platform:', platform);

    // Ensure high-quality rendering
    const canvas = await html2canvas(previewElement, {
      scale: 4, // Increased resolution for better quality
      useCORS: true, // Support cross-origin images
      backgroundColor: null, // Keep background transparency
      logging: true, // Enable logging for debugging
    });

    // Convert canvas to a file
    const dataURL = canvas.toDataURL("image/png");
    const file = dataURLToFile(dataURL, "ad-preview.png");
    return file;
  } catch (error) {
    console.error("Error capturing preview:", error);
    return null;
  }
}

// Helper function to convert dataURL to File
function dataURLToFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}