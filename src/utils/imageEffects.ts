
export const applyImageEffect = async (
  canvas: HTMLCanvasElement,
  effect: 'sepia' | 'none' | 'crop-to-cover'
): Promise<string> => {
  if (effect === 'crop-to-cover') {
    // Create a temporary canvas for cropping
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      return canvas.toDataURL('image/jpeg', 0.95);
    }
    
    const width = canvas.width;
    const height = canvas.height;
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Get the original image dimensions
    const imageWidth = canvas.width;
    const imageHeight = canvas.height;
    
    // Calculate dimensions that ensure the image covers the entire canvas
    const { width: dWidth, height: dHeight, x: dx, y: dy } = calculateCoverDimensions(
      imageWidth,
      imageHeight,
      width,
      height
    );
    
    // Draw the image centered and covering the entire canvas
    tempCtx.drawImage(
      canvas,
      0, 0, imageWidth, imageHeight, // Source rectangle (entire original image)
      dx, dy, dWidth, dHeight        // Destination rectangle (calculated for coverage)
    );
    
    return tempCanvas.toDataURL('image/jpeg', 0.95);
  }
  
  // Simply return the canvas data URL without any effects for other effect types
  return canvas.toDataURL('image/jpeg', 0.95);
};

// Helper function to ensure image covers container while maintaining aspect ratio
export const calculateCoverDimensions = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
  offsetX: number = 0,
  offsetY: number = 0
): { width: number; height: number; x: number; y: number } => {
  const imageAspect = imageWidth / imageHeight;
  const containerAspect = containerWidth / containerHeight;
  
  let width, height, x, y;
  
  if (imageAspect > containerAspect) {
    // Image is wider than container (relative to height)
    // Scale to match height and center horizontally
    height = containerHeight;
    width = containerHeight * imageAspect;
    y = 0;
    x = (containerWidth - width) / 2;
  } else {
    // Image is taller than container (relative to width)
    // Scale to match width and center vertically
    width = containerWidth;
    height = containerWidth / imageAspect;
    x = 0;
    y = (containerHeight - height) / 2;
  }
  
  // Apply offsets
  x += offsetX;
  y += offsetY;
  
  // Ensure dimensions are at least as large as the container (with extra margin)
  // This guarantees the image will cover the entire container
  width = Math.max(width, containerWidth * 1.1);
  height = Math.max(height, containerHeight * 1.1);
  
  return { width, height, x, y };
};
