import html2canvas from 'html2canvas';

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

    // Capture the preview using html2canvas
    const canvas = await html2canvas(previewElement, {
      scale: 2, // For higher quality
      useCORS: true, // To handle cross-origin images
      logging: false,
      backgroundColor: null // For transparent background
    });

    // Convert the canvas to a blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });

    // Create a File object from the blob
    const file = new File([blob], 'ad-preview.png', {
      type: 'image/png',
      lastModified: Date.now()
    });

    console.log('Preview captured successfully');
    return file;

  } catch (error) {
    console.error('Error capturing preview:', error);
    return null;
  }
}