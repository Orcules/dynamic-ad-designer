
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
    
    // Get the original image dimensions
    const imageWidth = canvas.width;
    const imageHeight = canvas.height;
    
    // Apply actual crop
    const { width, height, x, y } = calculateCropDimensions(
      imageWidth,
      imageHeight,
      imageWidth,
      imageHeight
    );
    
    // Set the temp canvas to exactly the size of the container
    // This ensures the final image is exactly the right size
    tempCanvas.width = imageWidth;
    tempCanvas.height = imageHeight;
    
    // Draw only the portion of the image that will cover the container
    tempCtx.drawImage(
      canvas,
      // Source coordinates (area to crop from original)
      x, y, width, height,
      // Destination coordinates (fill the entire new canvas)
      0, 0, imageWidth, imageHeight
    );
    
    // Return the cropped image
    return tempCanvas.toDataURL('image/jpeg', 0.95);
  }
  
  // Simply return the canvas data URL without any effects for other effect types
  return canvas.toDataURL('image/jpeg', 0.95);
};

// Helper function to determine how to crop an image to properly cover a container
export const calculateCropDimensions = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
): { width: number; height: number; x: number; y: number } => {
  // Safety check for zero dimensions
  if (imageWidth <= 0 || imageHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return { width: containerWidth, height: containerHeight, x: 0, y: 0 };
  }
  
  const imageAspect = imageWidth / imageHeight;
  const containerAspect = containerWidth / containerHeight;
  
  let sourceWidth, sourceHeight, sourceX, sourceY;
  
  if (imageAspect > containerAspect) {
    // Image is wider than container - crop the sides
    sourceHeight = imageHeight;
    sourceWidth = imageHeight * containerAspect;
    sourceY = 0;
    sourceX = (imageWidth - sourceWidth) / 2;
  } else {
    // Image is taller than container - crop the top/bottom
    sourceWidth = imageWidth;
    sourceHeight = imageWidth / containerAspect;
    sourceX = 0;
    sourceY = (imageHeight - sourceHeight) / 2;
  }
  
  return {
    width: sourceWidth,
    height: sourceHeight,
    x: sourceX,
    y: sourceY
  };
};

// Updated helper function for calculating dimensions to ensure image covers container
export const calculateCoverDimensions = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
  offsetX: number = 0,
  offsetY: number = 0
): { width: number; height: number; x: number; y: number } => {
  // Safety check for zero dimensions
  if (imageWidth <= 0 || imageHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return { width: containerWidth, height: containerHeight, x: 0, y: 0 };
  }
  
  const imageAspect = imageWidth / imageHeight;
  const containerAspect = containerWidth / containerHeight;
  
  // Calculate initial dimensions to cover the container (always start larger)
  let width, height, x, y;
  
  // First, always calculate dimensions that are LARGER than the container
  // This ensures we start with a size that can be moved without showing gaps
  if (imageAspect > containerAspect) {
    // Image is wider than container relative to height
    height = containerHeight * 1.2; // Add 20% extra height for safety
    width = height * imageAspect;
    y = (containerHeight - height) / 2;
    x = (containerWidth - width) / 2;
  } else {
    // Image is taller than container relative to width
    width = containerWidth * 1.2; // Add 20% extra width for safety
    height = width / imageAspect;
    x = (containerWidth - width) / 2;
    y = (containerHeight - height) / 2;
  }
  
  // Apply the offset
  x += offsetX;
  y += offsetY;
  
  // Check if there are any gaps after applying the offset
  const hasGapLeft = x > 0;
  const hasGapRight = (x + width) < containerWidth;
  const hasGapTop = y > 0;
  const hasGapBottom = (y + height) < containerHeight;
  
  // If any gaps are present, we need to scale up the image more
  if (hasGapLeft || hasGapRight || hasGapTop || hasGapBottom) {
    // Calculate the minimum scale factor needed to cover the container
    let scaleFactorX = 1;
    let scaleFactorY = 1;
    
    if (hasGapLeft || hasGapRight) {
      // Calculate how much wider the image needs to be to cover after offset
      const totalWidthGap = (hasGapLeft ? x : 0) + (hasGapRight ? (containerWidth - (x + width)) : 0);
      scaleFactorX = (width + totalWidthGap) / width;
    }
    
    if (hasGapTop || hasGapBottom) {
      // Calculate how much taller the image needs to be to cover after offset
      const totalHeightGap = (hasGapTop ? y : 0) + (hasGapBottom ? (containerHeight - (y + height)) : 0);
      scaleFactorY = (height + totalHeightGap) / height;
    }
    
    // Use the largest scale factor to ensure coverage in both dimensions
    // Add a 50% margin to the scale factor for extra safety (was 30%)
    const scaleFactor = Math.max(scaleFactorX, scaleFactorY) * 1.5;
    
    // Apply the scale factor
    const newWidth = width * scaleFactor;
    const newHeight = height * scaleFactor;
    
    // Recenter the image
    const newX = x - ((newWidth - width) / 2);
    const newY = y - ((newHeight - height) / 2);
    
    return { width: newWidth, height: newHeight, x: newX, y: newY };
  }
  
  return { width, height, x, y };
};
