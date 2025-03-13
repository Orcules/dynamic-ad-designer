
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
  // Safety check for zero dimensions
  if (imageWidth <= 0 || imageHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return { width: containerWidth, height: containerHeight, x: 0, y: 0 };
  }
  
  const imageAspect = imageWidth / imageHeight;
  const containerAspect = containerWidth / containerHeight;
  
  // Calculate initial dimensions to cover the container
  let width, height, x, y;
  
  if (imageAspect > containerAspect) {
    // Image is wider than container relative to height
    // Scale so height matches container height
    height = containerHeight;
    width = height * imageAspect;
    y = 0;
    x = (containerWidth - width) / 2;
  } else {
    // Image is taller than container relative to width
    // Scale so width matches container width
    width = containerWidth;
    height = width / imageAspect;
    x = 0;
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
  
  // If any gaps are present, we need to scale up the image
  if (hasGapLeft || hasGapRight || hasGapTop || hasGapBottom) {
    // Calculate the minimum scale factor needed to cover the container
    let scaleFactorX = 1;
    let scaleFactorY = 1;
    
    if (hasGapLeft || hasGapRight) {
      // Calculate how much wider the image needs to be
      const totalWidthGap = (hasGapLeft ? x : 0) + (hasGapRight ? (containerWidth - (x + width)) : 0);
      scaleFactorX = (width + totalWidthGap) / width;
    }
    
    if (hasGapTop || hasGapBottom) {
      // Calculate how much taller the image needs to be
      const totalHeightGap = (hasGapTop ? y : 0) + (hasGapBottom ? (containerHeight - (y + height)) : 0);
      scaleFactorY = (height + totalHeightGap) / height;
    }
    
    // Use the largest scale factor to ensure coverage in both dimensions
    // Add a 20% margin to the scale factor for safety
    const scaleFactor = Math.max(scaleFactorX, scaleFactorY) * 1.2;
    
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
