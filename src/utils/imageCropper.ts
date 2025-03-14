
interface ImageDimensions {
  width: number;
  height: number;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculates the optimal crop area to maintain aspect ratio without stretching
 */
export const calculateOptimalCrop = (
  imageWidth: number,
  imageHeight: number,
  targetWidth: number,
  targetHeight: number
): CropArea => {
  const imageAspect = imageWidth / imageHeight;
  const targetAspect = targetWidth / targetHeight;
  
  let cropWidth: number;
  let cropHeight: number;
  let x: number;
  let y: number;

  if (imageAspect > targetAspect) {
    // Image is wider than target - crop width
    cropHeight = imageHeight;
    cropWidth = imageHeight * targetAspect;
    x = (imageWidth - cropWidth) / 2;
    y = 0;
  } else {
    // Image is taller than target - crop height
    cropWidth = imageWidth;
    cropHeight = imageWidth / targetAspect;
    x = 0;
    y = (imageHeight - cropHeight) / 2;
  }

  return { x, y, width: cropWidth, height: cropHeight };
};

/**
 * Creates a new image with the applied crop
 */
export const cropImage = async (
  image: HTMLImageElement,
  crop: CropArea,
  targetWidth: number,
  targetHeight: number
): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Draw the cropped image to canvas
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas.toDataURL('image/png');
};

export const getScaledDimensions = (originalWidth: number, originalHeight: number, maxWidth: number, maxHeight: number): ImageDimensions => {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = maxWidth;
  let height = maxWidth / aspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }
  
  return { width, height };
};
