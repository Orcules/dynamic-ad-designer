/**
 * Calculate dimensions to ensure an image covers its container while respecting position offsets
 */
export const calculateCoverDimensions = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
  offsetX = 0,
  offsetY = 0
): { width: number; height: number; x: number; y: number } => {
  if (imageWidth <= 0 || imageHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    console.warn('Invalid dimensions in calculateCoverDimensions');
    return { width: containerWidth, height: containerHeight, x: 0, y: 0 };
  }

  const imageAspect = imageWidth / imageHeight;
  const containerAspect = containerWidth / containerHeight;
  
  // Default starting position (centered)
  let width, height, x, y;
  
  if (imageAspect > containerAspect) {
    // Image is wider than container - match height and center horizontally
    height = containerHeight;
    width = height * imageAspect;
    y = 0;
    x = (containerWidth - width) / 2;
  } else {
    // Image is taller than container - match width and center vertically
    width = containerWidth;
    height = width / imageAspect;
    x = 0;
    y = (containerHeight - height) / 2;
  }
  
  // Only apply non-zero offsets
  if (offsetX !== 0) x += offsetX;
  if (offsetY !== 0) y += offsetY;
  
  // Ensure the image always covers the entire container even after applying offsets
  if (x > 0 || (x + width) < containerWidth || y > 0 || (y + height) < containerHeight) {
    // Calculate how much we need to scale up to ensure coverage
    const scaleX = x > 0 || (x + width) < containerWidth 
      ? containerWidth / (width - Math.abs(x) * 2) 
      : 1;
    
    const scaleY = y > 0 || (y + height) < containerHeight 
      ? containerHeight / (height - Math.abs(y) * 2) 
      : 1;
    
    // Use the larger scale factor for uniform scaling
    const scale = Math.max(scaleX, scaleY) * 1.2; // Added 20% extra scaling for better coverage
    
    // Scale the image dimensions
    const newWidth = width * scale;
    const newHeight = height * scale;
    
    // Adjust position to maintain the visual center point
    const newX = x - (newWidth - width) / 2;
    const newY = y - (newHeight - height) / 2;
    
    return { width: newWidth, height: newHeight, x: newX, y: newY };
  }
  
  return { width, height, x, y };
};

/**
 * Calculate dimensions for cropping an image to fit in a container
 */
export const calculateCropDimensions = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
): { sourceX: number; sourceY: number; sourceWidth: number; sourceHeight: number } => {
  return { 
    sourceX: 0, 
    sourceY: 0, 
    sourceWidth: imageWidth, 
    sourceHeight: imageHeight 
  };
};
