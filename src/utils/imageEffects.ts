
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
  // Validate inputs to prevent division by zero or negative dimensions
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
  // Check if any part of the container would be uncovered
  if (x > 0 || (x + width) < containerWidth || y > 0 || (y + height) < containerHeight) {
    // Calculate scale factors needed to ensure coverage on each axis
    const scaleX = x > 0 || (x + width) < containerWidth 
      ? containerWidth / (width - Math.abs(x) * 2) 
      : 1;
    
    const scaleY = y > 0 || (y + height) < containerHeight 
      ? containerHeight / (height - Math.abs(y) * 2) 
      : 1;
    
    // Use the larger scale factor for uniform scaling with an additional safety margin
    const scale = Math.max(scaleX, scaleY) * 1.2; // 20% extra scaling for better coverage
    
    // Scale the image dimensions
    const newWidth = width * scale;
    const newHeight = height * scale;
    
    // Adjust position to maintain the visual center point
    // This ensures the offset still has the same visual effect
    const newX = x - (newWidth - width) / 2;
    const newY = y - (newHeight - height) / 2;
    
    return { width: newWidth, height: newHeight, x: newX, y: newY };
  }
  
  return { width, height, x, y };
};

/**
 * Calculate dimensions for cropping an image to fit in a container
 * with improved handling of aspect ratios
 */
export const calculateCropDimensions = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
): { sourceX: number; sourceY: number; sourceWidth: number; sourceHeight: number } => {
  // Validate inputs
  if (imageWidth <= 0 || imageHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    console.warn('Invalid dimensions in calculateCropDimensions');
    return { sourceX: 0, sourceY: 0, sourceWidth: imageWidth, sourceHeight: imageHeight };
  }

  const imageAspect = imageWidth / imageHeight;
  const containerAspect = containerWidth / containerHeight;
  
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;
  
  // If aspects don't match, calculate crop dimensions
  if (Math.abs(imageAspect - containerAspect) > 0.01) {
    if (imageAspect > containerAspect) {
      // Image is wider than container - crop width
      sourceWidth = Math.round(imageHeight * containerAspect);
      sourceX = Math.round((imageWidth - sourceWidth) / 2);
    } else {
      // Image is taller than container - crop height
      sourceHeight = Math.round(imageWidth / containerAspect);
      sourceY = Math.round((imageHeight - sourceHeight) / 2);
    }
  }
  
  return { sourceX, sourceY, sourceWidth, sourceHeight };
};
