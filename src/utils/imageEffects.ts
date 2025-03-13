
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
    
    // Draw the original image to the temp canvas with object-fit: cover behavior
    const imageAspect = canvas.width / canvas.height;
    const canvasAspect = width / height;
    
    let sx = 0;
    let sy = 0;
    let sWidth = canvas.width;
    let sHeight = canvas.height;
    let dx = 0;
    let dy = 0;
    let dWidth = width;
    let dHeight = height;
    
    if (imageAspect > canvasAspect) {
      // Image is wider than target aspect ratio
      sWidth = canvas.height * canvasAspect;
      sx = (canvas.width - sWidth) / 2; // Center the crop horizontally
    } else {
      // Image is taller than target aspect ratio
      sHeight = canvas.width / canvasAspect;
      sy = (canvas.height - sHeight) / 2; // Center the crop vertically
    }
    
    tempCtx.drawImage(canvas, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    
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
    height = Math.max(containerHeight, containerWidth / imageAspect);
    width = height * imageAspect;
    // Ensure image covers the entire height
    y = (containerHeight - height) / 2;
    // Center horizontally and apply position offset
    x = (containerWidth - width) / 2;
  } else {
    // Image is taller than container (relative to width)
    width = Math.max(containerWidth, containerHeight * imageAspect);
    height = width / imageAspect;
    // Ensure image covers the entire width
    x = (containerWidth - width) / 2;
    // Center vertically and apply position offset
    y = (containerHeight - height) / 2;
  }
  
  // Apply offsets
  x += offsetX;
  y += offsetY;
  
  // Ensure dimensions are at least as large as the container (with some extra margin)
  width = Math.max(width, containerWidth * 1.1);
  height = Math.max(height, containerHeight * 1.1);
  
  return { width, height, x, y };
};
